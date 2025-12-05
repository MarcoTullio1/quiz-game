const socket = io();
let currentGameId = null;
let currentGame = null;
let timerInterval = null;
let gameFinished = false;

// Elementos DOM
const waitingStartScreen = document.getElementById('waitingStartScreen');
const questionDisplayScreen = document.getElementById('questionDisplayScreen');
const rankingDisplayScreen = document.getElementById('rankingDisplayScreen');
const endDisplayScreen = document.getElementById('endDisplayScreen');
const rankingList = document.getElementById('displayRankingList');

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    setupSocketListeners();
});

function setupSocketListeners() {
    socket.on('game:started', () => {
        console.log('[DISPLAY] Jogo iniciado!');
        gameFinished = false;
    });

    socket.on('question:new', (questionData) => {
        console.log('[DISPLAY] Pergunta recebida:', questionData.questionNumber);
        showQuestion(questionData);
    });

    socket.on('ranking:show', (rankingData) => {
        console.log('[DISPLAY] Ranking recebido. isFinal:', rankingData.isFinal);
        stopTimer();
        showRanking(rankingData);
    });

    socket.on('game:ended', () => {
        console.log('[DISPLAY] Jogo finalizado');
        gameFinished = true;

        if (typeof currentGame !== 'undefined' && currentGame) {
            currentGame.status = 'finished';
        }

        setTimeout(() => {
            socket.emit('admin:showRanking', currentGameId);
        }, 500);
    });

    socket.on('question:stats', (data) => {
        console.log('[DISPLAY] Estatísticas recebidas');
        stopTimer();
        renderStatsChart(data);
    });

    socket.on('participant:update_count', (count) => {
        const countEl = document.getElementById('participantsCount');
        if (countEl) countEl.textContent = count;
    });

    socket.on('disconnect', () => {
        console.log('[DISPLAY] Desconectado - recarregando em 3s...');
        setTimeout(() => window.location.reload(), 3000);
    });
}

async function loadGames() {
    try {
        const response = await fetch('/api/admin/games');
        const data = await response.json();
        if (data.success) renderGamesList(data.games);
    } catch (error) {
        console.error('[DISPLAY] Erro ao carregar jogos:', error);
    }
}

function renderGamesList(games) {
    const container = document.getElementById('gamesListDisplay');
    if (games.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">Nenhum jogo disponível</p>';
        return;
    }
    container.innerHTML = games.map(game => `
        <div class="game-item-display" onclick="selectGame(${game.id}, '${game.name}')">
            <h3>${game.name}</h3>
            <p>Status: ${getStatusText(game.status)}</p>
        </div>
    `).join('');
}

async function selectGame(gameId, gameName) {
    currentGameId = gameId;
    gameFinished = false;

    try {
        const response = await fetch(`/api/admin/games/${gameId}`);
        const data = await response.json();
        if (data.success) {
            currentGame = data.game;

            if (currentGame.status === 'finished') {
                gameFinished = true;
            }

            socket.emit('display:connect', gameId);

            document.getElementById('displayGameName').textContent = gameName;
            showScreen(waitingStartScreen);
        }
    } catch (error) {
        console.error('[DISPLAY] Erro ao selecionar jogo:', error);
    }
}

function showQuestion(questionData) {
    const qNum = document.getElementById('displayQuestionNum');
    const qTotal = document.getElementById('displayTotalQuestions');
    const qText = document.getElementById('displayQuestionText');

    if (qNum) qNum.textContent = questionData.questionNumber;
    if (qTotal) qTotal.textContent = questionData.totalQuestions;
    if (qText) qText.textContent = questionData.text;

    const answersContainer = document.getElementById('displayAnswersContainer');
    answersContainer.removeAttribute('style');
    answersContainer.innerHTML = '';

    answersContainer.innerHTML = questionData.answers.map((answer, index) => `
        <div class="answer-display-item" data-letter="${String.fromCharCode(65 + index)}">
            ${answer.text}
        </div>
    `).join('');

    startTimer(questionData.timeLimit);
    showScreen(questionDisplayScreen);
}

function startTimer(timeLimit) {
    const timerText = document.getElementById('displayTimer');
    const timerProgress = document.querySelector('.timer-progress-large');

    const circumference = 2 * Math.PI * 50;
    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = 0;
    timerProgress.style.stroke = '#667eea';
    timerText.style.color = '#2d3748';

    let timeRemaining = timeLimit;
    timerText.textContent = timeRemaining;

    stopTimer();

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerText.textContent = Math.max(0, timeRemaining);

        const progress = timeRemaining / timeLimit;
        const offset = circumference * (1 - progress);
        timerProgress.style.strokeDashoffset = offset;

        if (timeRemaining <= 5) {
            timerProgress.style.stroke = '#e53e3e';
            timerText.style.color = '#e53e3e';
        }

        if (timeRemaining <= 0) {
            stopTimer();
            socket.emit('display:timeUp', currentGameId);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function renderStatsChart(data) {
    const container = document.getElementById('displayAnswersContainer');

    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.alignItems = 'flex-end';
    container.style.justifyContent = 'space-around';
    container.style.height = '500px';
    container.style.padding = '20px';
    container.style.gap = '15px';

    const colors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = data.distribution.map((item, index) => {
        const checkIcon = item.isCorrect ?
            `<div style="margin-bottom: 10px; font-size: 2.5rem; background: white; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 10;">✅</div>`
            : '<div style="height: 60px;"></div>';

        const barHeight = Math.max(5, item.percent);
        const opacity = item.isCorrect ? '1' : '0.6';

        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; flex: 1; max-width: 150px;">
                ${checkIcon}
                <div style="width: 100%; height: ${barHeight}%; background-color: ${colors[index]}; opacity: ${opacity}; border-radius: 5px 5px 0 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 10px; transition: height 1s ease-out; box-shadow: 0 4px 6px rgba(0,0,0,0.1); min-height: 40px;">
                    <span style="color: white; font-weight: bold; font-size: 1.5rem; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${item.count}</span>
                </div>
                <div style="width: 100%; height: 60px; background-color: ${colors[index]}; margin-top: 5px; border-radius: 0 0 5px 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                     <span style="color: white; font-weight: 900; font-size: 2rem;">${letters[index]}</span>
                </div>
                <div style="font-size: 1rem; color: #2d3748; margin-top: 10px; text-align: center; font-weight: 700; line-height: 1.2; width: 100%; word-wrap: break-word;">
                    ${item.text}
                </div>
            </div>
        `;
    }).join('');
}

function showRanking(rankingData) {
    stopTimer();

    const isFinalRanking = gameFinished ||
        rankingData.isFinal === true ||
        (currentGame && currentGame.status === 'finished');

    console.log('[DISPLAY] Exibindo Ranking. Final?', isFinalRanking);

    if (isFinalRanking) {
        showFinalRanking(rankingData);
    } else {
        renderRankingList(rankingData.teams, rankingList);
        showScreen(rankingDisplayScreen);
    }
}

// ====== DENSE RANKING - Lógica de Empate ======
function calculateDenseRanking(teams) {
    if (!teams || teams.length === 0) return [];

    // Ordena por pontuação decrescente
    const sorted = [...teams].sort((a, b) => b.score - a.score);

    let currentRank = 1;
    let previousScore = null;

    return sorted.map((team, index) => {
        // Se a pontuação é diferente da anterior, incrementa o rank
        if (previousScore !== null && team.score < previousScore) {
            currentRank = currentRank + 1; // Dense ranking: próximo número sequencial
        }

        // Verifica se há empate (pontuação igual ao anterior ou ao próximo)
        const hasTie = (index > 0 && sorted[index - 1].score === team.score) ||
            (index < sorted.length - 1 && sorted[index + 1].score === team.score);

        previousScore = team.score;

        return {
            ...team,
            rank: currentRank,
            hasTie: hasTie
        };
    });
}

function showFinalRanking(rankingData) {
    console.log('[DISPLAY] Renderizando pódio com', rankingData.teams.length, 'times');

    const podiumContainer = document.querySelector('.podium');
    if (!podiumContainer) {
        console.error('[DISPLAY] Container do pódio não encontrado!');
        return;
    }

    podiumContainer.innerHTML = '';

    // Aplica Dense Ranking
    const rankedTeams = calculateDenseRanking(rankingData.teams);

    // Pega os 3 primeiros para o pódio
    const podiumTeams = rankedTeams.slice(0, 3);

    // Mapeia rank para posição visual (1º, 2º, 3º podem ter empates)
    const positionMap = {
        1: 'first',
        2: 'second',
        3: 'third'
    };

    const medalMap = {
        1: '🏆',
        2: '🥈',
        3: '🥉'
    };

    // Renderiza na ordem: 2º, 1º, 3º (para visual do pódio)
    const displayOrder = [];

    // Encontra times para cada posição visual
    const firstPlace = podiumTeams.filter(t => t.rank === 1);
    const secondPlace = podiumTeams.filter(t => t.rank === 2);
    const thirdPlace = podiumTeams.filter(t => t.rank === 3);

    // Ordem de exibição: 2º lugar, 1º lugar, 3º lugar
    if (secondPlace.length > 0) {
        displayOrder.push({ team: secondPlace[0], visualPosition: 'second' });
    }
    if (firstPlace.length > 0) {
        displayOrder.push({ team: firstPlace[0], visualPosition: 'first' });
    }
    if (thirdPlace.length > 0) {
        displayOrder.push({ team: thirdPlace[0], visualPosition: 'third' });
    }

    // Se não há 2º ou 3º lugar devido a empates, ajusta
    // Ex: Se dois times empatam em 1º, o próximo é 2º
    podiumTeams.forEach((team, idx) => {
        const alreadyAdded = displayOrder.some(d => d.team.id === team.id);
        if (!alreadyAdded) {
            // Determina posição visual baseada no índice
            const visualPositions = ['second', 'first', 'third'];
            const visualPos = idx === 0 ? 'first' : idx === 1 ? 'second' : 'third';
            displayOrder.push({ team, visualPosition: visualPos });
        }
    });

    // Limpa e re-ordena para exibição correta (2º, 1º, 3º)
    podiumContainer.innerHTML = '';

    // Reordena: second, first, third
    const orderedDisplay = [];
    const secondItem = displayOrder.find(d => d.visualPosition === 'second');
    const firstItem = displayOrder.find(d => d.visualPosition === 'first');
    const thirdItem = displayOrder.find(d => d.visualPosition === 'third');

    if (secondItem) orderedDisplay.push(secondItem);
    if (firstItem) orderedDisplay.push(firstItem);
    if (thirdItem) orderedDisplay.push(thirdItem);

    orderedDisplay.forEach(({ team, visualPosition }) => {
        renderPodiumItemWithTie(team, visualPosition, podiumContainer, medalMap);
    });

    showScreen(endDisplayScreen);
    console.log('[DISPLAY] Tela do pódio exibida');
}

function renderPodiumItemWithTie(team, visualPositionClass, container, medalMap) {
    if (!team || !container) return;

    // Usa o rank real do time (pode ser 1, 2 ou 3)
    const actualRank = team.rank;
    const medal = medalMap[actualRank] || '🏅';
    const positionText = actualRank + 'º';
    const tieBadge = team.hasTie ? '<div class="tie-badge">⚡ EMPATE</div>' : '';

    console.log(`[DISPLAY] Pódio: ${team.name} - Rank ${actualRank} - ${team.score}pts - Empate: ${team.hasTie}`);

    const div = document.createElement('div');
    div.className = `podium-item ${visualPositionClass}`;
    div.innerHTML = `
        <div class="podium-medal">${medal}</div>
        <div class="podium-position">${positionText}</div>
        ${tieBadge}
        <div class="podium-team">${team.name}</div>
        <div class="podium-score">${team.score} pts</div>
        <div class="podium-bar"></div>
    `;
    container.appendChild(div);
}

// Função antiga mantida para compatibilidade com ranking intermediário
function renderPodiumItem(team, positionClass, container) {
    if (!team || !container) return;

    const div = document.createElement('div');
    div.className = `podium-item ${positionClass}`;
    div.innerHTML = `
        <div class="podium-medal">🏅</div>
        <div class="podium-position">
            ${positionClass === 'first' ? '1º' : positionClass === 'second' ? '2º' : '3º'}
        </div>
        <div class="podium-team">${team.name}</div>
        <div class="podium-score">${team.score} pts</div>
        <div class="podium-bar"></div>
    `;
    container.appendChild(div);
}

function renderRankingList(teams, container) {
    if (!container) return;

    // Aplica Dense Ranking também para lista intermediária
    const rankedTeams = calculateDenseRanking(teams);

    container.innerHTML = rankedTeams.map((team, index) => {
        // Classe visual baseada no rank real
        let positionClass = team.rank === 1 ? 'first' : team.rank === 2 ? 'second' : team.rank === 3 ? 'third' : '';
        const tieBadge = team.hasTie ? '<span style="margin-left: 10px; background: #f59e0b; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">⚡ EMPATE</span>' : '';

        return `
            <div class="ranking-display-item ${positionClass}">
                <div class="ranking-display-position">${team.rank}</div>
                <div class="ranking-display-info">
                    <div class="ranking-display-name">${team.name} ${tieBadge}</div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                         <div style="flex: 1; height: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; max-width: 150px;">
                            <div style="width: ${team.accuracy || 0}%; height: 100%; background: #48bb78;"></div>
                         </div>
                         <span style="font-size: 0.9rem; opacity: 0.8">${team.accuracy || 0}% acerto</span>
                    </div>
                </div>
                <div class="ranking-display-score">${team.score} pts</div>
            </div>
        `;
    }).join('');
}

function showScreen(screen) {
    console.log('[DISPLAY] Trocando para tela:', screen.id);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function getStatusText(status) {
    const statusMap = {
        waiting: 'Aguardando Início',
        active: 'Em Andamento',
        finished: 'Finalizado'
    };
    return statusMap[status] || status;
}