const { pool } = require('../config/database');
const QRCode = require('qrcode');

class Team {
  // Criar novo time
  static async create(gameId, name) {
    const accessCode = this.generateAccessCode();
    const [result] = await pool.execute(
      'INSERT INTO teams (game_id, name, access_code) VALUES (?, ?, ?)',
      [gameId, name, accessCode]
    );
    const teamId = result.insertId;

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const participantUrl = `${baseUrl}/participant.html?code=${accessCode}`;

    const qrCodeDataUrl = await QRCode.toDataURL(participantUrl);
    await pool.execute(
      'UPDATE teams SET qr_code = ? WHERE id = ?',
      [qrCodeDataUrl, teamId]
    );
    return { id: teamId, name, accessCode, qrCode: qrCodeDataUrl };
  }

  // Gerar código de acesso aleatório
  static generateAccessCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Buscar time por código de acesso
  static async findByAccessCode(accessCode) {
    const [teams] = await pool.execute(
      'SELECT * FROM teams WHERE access_code = ?',
      [accessCode]
    );
    return teams.length > 0 ? teams[0] : null;
  }

  // Buscar times por jogo
  static async findByGameId(gameId) {
    const [teams] = await pool.execute(
      'SELECT * FROM teams WHERE game_id = ?',
      [gameId]
    );
    return teams;
  }

  // Atualizar pontuação do time
  static async updateScore(teamId, score) {
    await pool.execute(
      'UPDATE teams SET total_score = ? WHERE id = ?',
      [score, teamId]
    );
  }

  // MUDANÇA 3: Média justa - só conta quem respondeu algo
  static async calculateTotalScore(teamId) {
    // Soma dos pontos de todos os participantes
    const [sumResult] = await pool.execute(
      'SELECT SUM(total_score) as total_points FROM participants WHERE team_id = ?',
      [teamId]
    );
    // MUDANÇA: Conta APENAS participantes que têm pelo menos 1 resposta no histórico
    const [activeResult] = await pool.execute(
      `SELECT COUNT(DISTINCT p.id) as active_participants 
       FROM participants p 
       INNER JOIN participant_answers pa ON p.id = pa.participant_id 
       WHERE p.team_id = ?`,
      [teamId]
    );

    const totalPoints = sumResult[0].total_points || 0;
    const activeParticipants = activeResult[0].active_participants || 1; // Evita divisão por zero

    // Calcula a média (arredondada) usando apenas participantes ativos
    const averageScore = Math.round(totalPoints / activeParticipants);

    // Salva a média no time
    await this.updateScore(teamId, averageScore);
    return averageScore;
  }

  // Deletar time
  static async delete(teamId) {
    await pool.execute('DELETE FROM teams WHERE id = ?', [teamId]);
  }

  // Estatísticas
  static async getStats(teamId) {
    const [totalRes] = await pool.execute(
      `SELECT COUNT(*) as total FROM participant_answers 
       JOIN participants ON participant_answers.participant_id = participants.id 
       WHERE participants.team_id = ?`,
      [teamId]
    );
    const [correctRes] = await pool.execute(
      `SELECT COUNT(*) as correct FROM participant_answers 
       JOIN participants ON participant_answers.participant_id = participants.id 
       WHERE participants.team_id = ? AND participant_answers.points_earned > 0`,
      [teamId]
    );

    const total = parseInt(totalRes[0].total) || 0;
    const correct = parseInt(correctRes[0].correct) || 0;

    const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

    return { total, correct, percentage };
  }

  static async findById(teamId) {
    const [teams] = await pool.execute(
      'SELECT * FROM teams WHERE id = ?',
      [teamId]
    );
    return teams.length > 0 ? teams[0] : null;
  }

  static async findByTeamId(teamId) {
    return await this.findById(teamId);
  }
}

module.exports = Team;