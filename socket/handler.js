const Game = require('../models/Game');
const Team = require('../models/Team');
const Participant = require('../models/Participant');
const { pool } = require('../config/database');

module.exports = (io) => {
  const activeGames = new Map();

  io.on('connection', (socket) => {

    // --- ADMIN ---
    socket.on('admin:connect', async (gameId) => {
      socket.join(`game:${gameId}:admin`);
      socket.gameId = gameId;
      console.log(`[ADMIN] Conectado ao jogo ${gameId}`);
    });

    socket.on('admin:startGame', async (gameId) => {
      try {
        await pool.execute('UPDATE teams SET total_score = 0 WHERE game_id = ?', [gameId]);
        const [teams] = await pool.execute('SELECT id FROM teams WHERE game_id = ?', [gameId]);

        if (teams.length > 0) {
          const teamIds = teams.map(t => t.id).join(',');
          await pool.execute(`UPDATE participants SET total_score = 0 WHERE team_id IN (${teamIds})`);
          await pool.execute(`DELETE FROM participant_answers WHERE participant_id IN (SELECT id FROM participants WHERE team_id IN (${teamIds}))`);
        }

        await Game.updateStatus(gameId, 'active');
        await Game.updateCurrentQuestion(gameId, 0);

        io.to(`game:${gameId}`).emit('game:started');
        console.log(`[GAME] Jogo ${gameId} iniciado`);
        startQuestion(gameId, 0);
      } catch (error) {
        console.log(`[ERROR] startGame: ${error.message}`);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('admin:nextQuestion', async (gameId) => {
      try {
        const game = await Game.findById(gameId);
        const nextIndex = game.current_question_index + 1;
        if (nextIndex < game.questions.length) {
          await Game.updateCurrentQuestion(gameId, nextIndex);
          startQuestion(gameId, nextIndex);
        } else {
          finishGame(gameId);
        }
      } catch (error) {
        console.log(`[ERROR] nextQuestion: ${error.message}`);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('admin:reshowQuestion', async (gameId) => {
      const gameState = activeGames.get(gameId);
      const game = await Game.findById(gameId);
      if (!game || !gameState) return;

      const timeElapsed = (Date.now() - gameState.startTime) / 1000;

      if (timeElapsed >= gameState.timeLimit) {
        sendStats(gameId);
        return;
      }

      const question = game.questions[game.current_question_index];
      const remainingTime = Math.max(0, Math.round(gameState.timeLimit - timeElapsed));

      const questionData = {
        id: question.id,
        text: question.question_text,
        timeLimit: remainingTime,
        answers: question.answers.map(a => ({ id: a.id, text: a.answer_text })),
        questionNumber: game.current_question_index + 1,
        totalQuestions: game.questions.length
      };
      io.to(`game:${gameId}:display`).emit('question:new', questionData);
    });

    socket.on('admin:showStats', (gameId) => sendStats(gameId));

    socket.on('admin:showRanking', async (gameId) => {
      const game = await Game.findById(gameId);
      const isFinal = game && game.status === 'finished';
      sendRanking(gameId, isFinal);
    });

    socket.on('admin:endGame', async (gameId) => finishGame(gameId));

    // --- PARTICIPANTE ---
    socket.on('participant:join', async ({ teamId, nickname }) => {
      try {
        const team = await Team.findByTeamId(teamId);
        if (!team) {
          return socket.emit('error', { message: 'Time não encontrado!' });
        }

        // MUDANÇA 1: Sempre criar novo participante (sem verificar existência)
        // Isso permite nomes duplicados (IDs diferentes) e resolve o problema de reconexão
        const participantId = await Participant.create(teamId, nickname, socket.id);
        const currentScore = 0; // Novo participante sempre começa com 0

        console.log(`[CONN] Novo: ${nickname} (ID:${participantId} Time:${team.name})`);

        // Notifica admin sobre novo participante
        io.to(`game:${team.game_id}:admin`).emit('participant:new', {
          participantId,
          teamId,
          nickname
        });

        const gameId = team.game_id;
        socket.join(`game:${gameId}`);
        socket.participantId = participantId;
        socket.teamId = teamId;
        socket.gameId = gameId;

        socket.emit('participant:joined', {
          participantId,
          teamId,
          nickname,
          score: currentScore
        });

        updateLiveCount(gameId);
      } catch (error) {
        console.log(`[ERROR] participant:join: ${error.message}`);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('participant:answer', async ({ participantId, questionId, answerId }) => {
      try {
        const gameState = activeGames.get(socket.gameId);
        if (!gameState) return;

        const timeTaken = (Date.now() - gameState.startTime) / 1000;
        if (timeTaken > (gameState.timeLimit + 3)) {
          return socket.emit('answer:result', {
            success: false,
            message: 'Tempo esgotado'
          });
        }

        const result = await Participant.submitAnswer(participantId, questionId, answerId, timeTaken);

        if (result) {
          socket.emit('participant:answer_registered');

          io.to(`game:${socket.gameId}:admin`).emit('participant:answered', {
            participantId,
            isCorrect: result.isCorrect
          });

          console.log(`[ANSWER] P:${participantId} Q:${questionId} OK:${result.isCorrect}`);

          // Verifica se todos responderam (Anti-Travamento)
          checkAllAnswered(socket.gameId, questionId);
        }
      } catch (error) {
        console.log(`[ERROR] participant:answer: ${error.message}`);
      }
    });

    // --- TELÃO ---
    socket.on('display:connect', async (gameId) => {
      socket.join(`game:${gameId}:display`);
      socket.gameId = gameId;
      console.log(`[DISPLAY] Telão conectado ao jogo ${gameId}`);
      updateLiveCount(gameId);
    });

    socket.on('display:timeUp', async (gameId) => sendStats(gameId));

    // --- DISCONNECT ---
    socket.on('disconnect', async () => {
      if (socket.gameId) {
        const gameId = socket.gameId;
        const participantId = socket.participantId;

        if (participantId) {
          console.log(`[DISCONN] P:${participantId} saiu do jogo ${gameId}`);
        }

        updateLiveCount(gameId);

        // MUDANÇA 2: Verificar se deve encerrar pergunta após desconexão
        const gameState = activeGames.get(gameId);
        if (gameState && participantId) {
          // Pequeno delay para garantir que o socket foi removido da sala antes de contar
          setTimeout(() => {
            checkAllAnswered(gameId, gameState.currentQuestionId);
          }, 500);
        }
      }
    });

    // --- FUNÇÕES AUXILIARES ---
    async function startQuestion(gameId, index) {
      const game = await Game.findById(gameId);
      if (!game || !game.questions || !game.questions[index]) return;

      const question = game.questions[index];
      const questionData = {
        id: question.id,
        text: question.question_text,
        timeLimit: question.time_limit,
        answers: question.answers.map(a => ({ id: a.id, text: a.answer_text })),
        questionNumber: index + 1,
        totalQuestions: game.questions.length
      };

      io.to(`game:${gameId}`).emit('question:new', questionData);
      io.to(`game:${gameId}:display`).emit('question:new', questionData);
      io.to(`game:${gameId}:admin`).emit('question:new', {
        ...questionData,
        correctAnswerId: question.answers.find(a => a.is_correct)?.id
      });

      activeGames.set(gameId, {
        currentQuestionId: question.id,
        startTime: Date.now(),
        timeLimit: question.time_limit
      });
      console.log(`[QUESTION] Jogo ${gameId} - Q${index + 1}/${game.questions.length}`);
    }

    // MUDANÇA 2: Nova lógica anti-travamento
    async function checkAllAnswered(gameId, questionId) {
      const gameState = activeGames.get(gameId);
      // Se não há estado ativo ou a pergunta mudou, ignora
      if (!gameState || gameState.currentQuestionId !== questionId) {
        return;
      }

      // Conta sockets de participantes ONLINE agora
      const sockets = await io.in(`game:${gameId}`).fetchSockets();
      const onlineParticipants = sockets.filter(s => s.participantId).length;

      // Conta respostas no banco para esta pergunta
      const [res] = await pool.execute(
        'SELECT COUNT(*) as total FROM participant_answers WHERE question_id = ?',
        [questionId]
      );
      const answersCount = res[0].total;

      console.log(`[CHECK] Respostas:${answersCount} | Online:${onlineParticipants}`);

      // Se todos que estão online já responderam, encerra
      if (onlineParticipants > 0 && answersCount >= onlineParticipants) {
        console.log(`[CHECK] -> Encerrando pergunta!`);
        // Pequeno delay para UX
        setTimeout(() => {
          // Verifica novamente se ainda é a mesma pergunta
          const currentState = activeGames.get(gameId);
          if (currentState && currentState.currentQuestionId === questionId) {
            sendStats(gameId);
          }
        }, 1000);
      }
    }

    async function sendStats(gameId) {
      const gameState = activeGames.get(gameId);
      if (!gameState) return;
      const qId = gameState.currentQuestionId;

      // 1. Buscar estatísticas para o telão
      const [stats] = await pool.execute(
        `SELECT a.id, a.answer_text as text, a.is_correct, COUNT(pa.id) as count 
         FROM answers a 
         LEFT JOIN participant_answers pa ON pa.answer_id = a.id 
         WHERE a.question_id = ? 
         GROUP BY a.id ORDER BY a.id ASC`,
        [qId]
      );

      const totalVotes = stats.reduce((sum, i) => sum + i.count, 0);

      io.to(`game:${gameId}:display`).emit('question:stats', {
        totalVotes,
        distribution: stats.map(s => ({
          text: s.text,
          count: s.count,
          isCorrect: s.is_correct,
          percent: totalVotes === 0 ? 0 : Math.round((s.count / totalVotes) * 100)
        }))
      });
      console.log(`[STATS] Q:${qId} Votos:${totalVotes}`);

      // 2. Mandar resultado individual para cada participante
      const sockets = await io.in(`game:${gameId}`).fetchSockets();
      const [answers] = await pool.execute(
        'SELECT participant_id, points_earned, time_taken, answer_id FROM participant_answers WHERE question_id = ?',
        [qId]
      );

      const answersMap = {};
      answers.forEach(a => answersMap[a.participant_id] = a);

      for (const sock of sockets) {
        if (sock.participantId) {
          const myAnswer = answersMap[sock.participantId];
          if (myAnswer) {
            const isCorrect = myAnswer.points_earned > 0;
            sock.emit('answer:result', {
              isCorrect: isCorrect,
              pointsEarned: myAnswer.points_earned,
              timeTaken: myAnswer.time_taken
            });
          } else {
            sock.emit('answer:result', {
              isCorrect: false,
              pointsEarned: 0,
              message: "Tempo esgotado!"
            });
          }
        }
      }
    }

    async function sendRanking(gameId, isFinal = false) {
      const teams = await Team.findByGameId(gameId);
      const ranking = await Promise.all(teams.map(async t => {
        const score = await Team.calculateTotalScore(t.id);
        const stats = await Team.getStats(t.id);
        return { id: t.id, name: t.name, score, accuracy: stats.percentage };
      }));
      ranking.sort((a, b) => b.score - a.score);

      const rankingData = {
        teams: ranking,
        timestamp: Date.now(),
        isFinal: isFinal
      };

      io.to(`game:${gameId}`).emit('ranking:show', rankingData);
      io.to(`game:${gameId}:display`).emit('ranking:show', rankingData);

      console.log(`[RANKING] Jogo ${gameId} Final:${isFinal}`);
    }

    async function finishGame(gameId) {
      await Game.updateStatus(gameId, 'finished');
      io.to(`game:${gameId}`).emit('game:ended');
      io.to(`game:${gameId}:display`).emit('game:ended');
      io.to(`game:${gameId}:admin`).emit('game:ended');
      activeGames.delete(gameId);
      console.log(`[GAME] Jogo ${gameId} finalizado`);
    }

    async function updateLiveCount(gameId) {
      const sockets = await io.in(`game:${gameId}`).fetchSockets();
      const count = sockets.filter(s => s.participantId).length;
      io.to(`game:${gameId}:display`).emit('participant:update_count', count);
      console.log(`[LIVE] Jogo ${gameId} Online:${count}`);
    }
  });
};