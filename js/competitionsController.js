/**
 * competitionsController.js - Office Endzone Competitions, Brackets & Leaderboard
 * Manages challenges centered on Yards, Points, Sacks, and Field Goals.
 */

export class CompetitionsController {
  constructor(options = {}) {
    this.containerId = options.containerId || 'competitions-view';
    this.data = null;
    this.userPicks = JSON.parse(localStorage.getItem('office_endzone_picks') || '{}');
  }

  async init() {
    try {
      const response = await fetch('./data/competitions.json');
      this.data = await response.json();
    } catch (err) {
      console.warn('Fallback: Failed to load competitions.json, using defaults.', err);
    }
  }

  setData(data) {
    this.data = data;
  }

  renderChallenges(containerEl) {
    if (!containerEl || !this.data?.challenges) return;

    containerEl.innerHTML = `
      <div class="challenges-header">
        <div>
          <h3 class="section-heading">⚡ Automated Office Football Challenges</h3>
          <p class="section-subheading">${this.data.activeWeek} • 100% Automatic Milestone Awards (No Manual Picks Required)</p>
        </div>
        <button class="btn-refresh-challenges" id="btn-simulate-challenges" title="Simulate Challenge Progress">
          🎲 Advance Challenge Week
        </button>
      </div>

      <div class="ladder-explainer-card" style="margin-bottom: 16px; border-left:4px solid #10b981;">
        <span style="font-size:1.3rem;">⚡</span>
        <div class="ladder-info-text">
          <strong style="color:#10b981;">100% Automated Weekly Milestones:</strong> Whenever your team hits a stat milestone in their weekly game (Yards, Points, Sacks, Field Goals or Wins), you automatically win that challenge's achievement icon (🚀 Rocket, 🔥 Flame, 💥 Explosion, 🎯 Target, 🏆 Trophy)!
        </div>
      </div>

      <div class="challenges-grid">
        ${this.data.challenges.map(chal => this.renderChallengeCard(chal)).join('')}
      </div>
    `;

    // Bind simulate button
    const simBtn = containerEl.querySelector('#btn-simulate-challenges');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        this.simulateProgress();
        this.renderChallenges(containerEl);
      });
    }
  }

  renderChallengeCard(chal) {
    const metricColorMap = {
      'YARDS': 'var(--accent-green)',
      'POINTS': 'var(--accent-gold)',
      'SACKS': 'var(--accent-purple)',
      'FIELD_GOALS': 'var(--accent-blue)'
    };
    const accentColor = metricColorMap[chal.metric] || 'var(--accent-green)';

    return `
      <div class="challenge-card" data-id="${chal.id}" style="border-top: 4px solid ${accentColor}">
        <div class="challenge-top">
          <div class="challenge-icon-box" style="background: ${accentColor}20; color: ${accentColor}">
            ${chal.icon}
          </div>
          <div class="challenge-meta">
            <span class="challenge-category" style="color: ${accentColor}">${chal.category} • Target: ${chal.target} ${chal.unit}</span>
            <h4 class="challenge-title">${chal.title}</h4>
          </div>
        </div>

        <p class="challenge-desc">${chal.description}</p>

        <div class="challenge-reward-pill">
          <span>🎁 Reward:</span>
          <strong>${chal.reward}</strong>
        </div>

        <div class="challenge-leader-row">
          <span>Current Pacesetter:</span>
          <span class="leader-badge">${chal.leader}</span>
        </div>

        <div class="participants-list">
          <div class="participants-title">Office Staff Progress:</div>
          ${chal.participants.map(p => {
            const pct = Math.min(100, Math.round((p.progress / chal.target) * 100));
            const isDone = p.progress >= chal.target;
            return `
              <div class="participant-row">
                <div class="participant-name">
                  <span>${p.name}</span>
                  ${isDone ? '<span class="status-done-badge">COMPLETED 🎯</span>' : ''}
                </div>
                <div class="participant-bar-container">
                  <div class="participant-bar" style="width: ${pct}%; background: ${accentColor}"></div>
                </div>
                <span class="participant-val">${p.progress} / ${chal.target} ${chal.unit}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderBracket(containerEl) {
    if (!containerEl || !this.data?.bracket) return;

    const bracket = this.data.bracket;

    containerEl.innerHTML = `
      <div class="bracket-header">
        <div>
          <h3 class="section-heading">🏆 ${bracket.title}</h3>
          <p class="section-subheading">Head-to-Head Office Staff Predictions • Current Round: ${bracket.round}</p>
        </div>
      </div>

      <div class="bracket-canvas">
        <div class="bracket-round-column">
          <div class="round-label">SEMIFINALS</div>
          ${bracket.matchups.filter(m => m.round === 'Semifinals').map(m => this.renderMatchupBox(m)).join('')}
        </div>

        <div class="bracket-connector">
          <div class="connector-line"></div>
        </div>

        <div class="bracket-round-column">
          <div class="round-label">CHAMPIONSHIP FINALS</div>
          ${bracket.matchups.filter(m => m.round === 'Finals').map(m => this.renderMatchupBox(m, true)).join('')}
        </div>
      </div>
    `;

    // Bind pick buttons
    containerEl.querySelectorAll('.bracket-pick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const matchId = btn.dataset.matchId;
        const pickedStaff = btn.dataset.staff;
        this.userPicks[matchId] = pickedStaff;
        localStorage.setItem('office_endzone_picks', JSON.stringify(this.userPicks));
        this.renderBracket(containerEl);
      });
    });
  }

  renderMatchupBox(m, isFinal = false) {
    const userPick = this.userPicks[m.id];

    return `
      <div class="matchup-box ${isFinal ? 'championship-matchup' : ''}" data-match-id="${m.id}">
        <div class="matchup-header-row">
          <span class="matchup-tag">${m.matchupLabel}</span>
          <span class="matchup-status-badge ${m.status.toLowerCase()}">${m.status}</span>
        </div>

        <div class="staff-pick-row ${m.staff1.score > m.staff2.score && m.status !== 'UPCOMING' ? 'winner' : ''} ${userPick === m.staff1.name ? 'user-selected' : ''}">
          <div class="staff-info">
            <div>
              <div class="staff-name-text">${m.staff1.name}</div>
              <div class="staff-pick-detail">Picked <strong>${m.staff1.pick}</strong> (${m.staff1.spread})</div>
            </div>
          </div>
          <div class="staff-score-box">${m.staff1.score}</div>
          <button class="bracket-pick-btn ${userPick === m.staff1.name ? 'active' : ''}" data-match-id="${m.id}" data-staff="${m.staff1.name}">
            ${userPick === m.staff1.name ? '✓ Picked' : 'Pick'}
          </button>
        </div>

        <div class="matchup-divider-vs">VS</div>

        <div class="staff-pick-row ${m.staff2.score > m.staff1.score && m.status !== 'UPCOMING' ? 'winner' : ''} ${userPick === m.staff2.name ? 'user-selected' : ''}">
          <div class="staff-info">
            <div>
              <div class="staff-name-text">${m.staff2.name}</div>
              <div class="staff-pick-detail">Picked <strong>${m.staff2.pick}</strong> (${m.staff2.spread})</div>
            </div>
          </div>
          <div class="staff-score-box">${m.staff2.score}</div>
          <button class="bracket-pick-btn ${userPick === m.staff2.name ? 'active' : ''}" data-match-id="${m.id}" data-staff="${m.staff2.name}">
            ${userPick === m.staff2.name ? '✓ Picked' : 'Pick'}
          </button>
        </div>
      </div>
    `;
  }

  renderLeaderboard(containerEl) {
    if (!containerEl || !this.data?.leaderboard) return;

    containerEl.innerHTML = `
      <div class="leaderboard-header">
        <div>
          <h3 class="section-heading">📊 Office Football Season Standings</h3>
          <p class="section-subheading">Ranked by Season Points, Prediction Yards, Defensive Sacks & Field Goals</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Staff Member</th>
              <th>Dept / Position</th>
              <th>Total Points</th>
              <th>Yards Picked</th>
              <th>Sacks</th>
              <th>Field Goals</th>
              <th>Win %</th>
              <th>Trophies & Accolades</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.leaderboard.map(row => `
              <tr class="leaderboard-row rank-${row.rank}">
                <td>
                  <span class="rank-number">${row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : row.rank}</span>
                </td>
                <td>
                  <div class="leaderboard-user">
                    <img src="${row.avatar}" class="staff-avatar-thumb" alt="${row.name}" onerror="this.src='https://ui-avatars.com/api/?name=${row.name}&background=0b0f19&color=fff'">
                    <span class="user-display-name">${row.name}</span>
                  </div>
                </td>
                <td>
                  <div class="user-role-text">${row.role}</div>
                  <div class="user-dept-text">${row.dept}</div>
                </td>
                <td><strong class="highlight-pts">${row.totalPoints} PTS</strong></td>
                <td>${row.yards.toLocaleString()} YDS</td>
                <td><span class="badge-sacks">${row.sacks} SACKS</span></td>
                <td>${row.fieldGoals} FG</td>
                <td><strong>${row.winPct}</strong></td>
                <td>
                  <div class="trophy-tag-group">
                    ${row.trophies.map(t => `<span class="trophy-tag">${t}</span>`).join('')}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  simulateProgress() {
    if (!this.data?.challenges) return;
    this.data.challenges.forEach(chal => {
      chal.participants.forEach(p => {
        let add = 0;
        if (chal.metric === 'YARDS') add = Math.floor(Math.random() * 45) + 15;
        if (chal.metric === 'POINTS') add = Math.floor(Math.random() * 7) + 3;
        if (chal.metric === 'SACKS') add = Math.random() > 0.6 ? 1 : 0;
        if (chal.metric === 'FIELD_GOALS') add = Math.random() > 0.5 ? 1 : 0;
        
        p.progress += add;
        if (p.progress >= chal.target) p.completed = true;
      });
      // update leader
      const top = [...chal.participants].sort((a, b) => b.progress - a.progress)[0];
      chal.leader = `${top.name} (${top.progress} ${chal.unit})`;
    });
  }
}
