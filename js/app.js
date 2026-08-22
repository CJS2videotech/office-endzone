/**
 * app.js - Office Endzone Master Controller
 * Orchestrates ESPN Live Data with Arizona Time (MST), Big Square Staff Avatars & Challenges
 */

import { GameState } from './gameState.js';
import { CharacterController } from './characterController.js';
import { EspnService } from './espnService.js';
import { CompetitionsController } from './competitionsController.js';

class OfficeEndzoneApp {
  constructor() {
    this.gameState = new GameState();
    this.espnService = new EspnService();
    this.competitionsController = new CompetitionsController();
    
    this.characterController = new CharacterController({
      stageId: 'stage-container',
      characterId: 'mascot-character',
      avatarId: 'mascot-avatar',
      dialogId: 'character-dialog',
      nameBadgeId: 'character-name-badge',
      roleBadgeId: 'character-role-badge',
      bannerId: 'event-banner'
    });

    this.teams = [];
    this.roster = [];
    this.liveGames = [];
    this.activeGameId = null;
  }

  async init() {
    this.cacheDom();
    this.bindTabEvents();
    
    await this.loadLocalData();
    await this.competitionsController.init();

    this.characterController.setRoster(this.roster);
    this.populateSelectors();
    this.bindSimulatorEvents();
    this.bindTeamSelectors();
    this.bindMascotInteraction();
    this.bindCardinalsHQEvents();

    // Subscribe to GameState updates
    this.gameState.subscribe((event, state) => {
      this.renderUI(state);
      this.handleGameEvent(event);
    });

    // Initial render
    this.renderUI(this.gameState.getState());
    this.renderCompetitionsViews();

    // Fetch ESPN NFL Live Feed
    await this.fetchEspnScoreboard();

    // Auto-refresh ESPN feed every 45 seconds
    setInterval(() => this.fetchEspnScoreboard(true), 45000);
  }

  cacheDom() {
    this.dom = {
      tickerCarousel: document.getElementById('ticker-carousel'),
      espnStatusBadge: document.getElementById('espn-status-badge'),
      espnStatusText: document.getElementById('espn-status-text'),
      characterSelect: document.getElementById('character-select'),
      homeTeamSelect: document.getElementById('home-team-select'),
      awayTeamSelect: document.getElementById('away-team-select'),
      // Scoreboard
      scoreHome: document.getElementById('score-home'),
      scoreAway: document.getElementById('score-away'),
      nameHome: document.getElementById('team-name-home'),
      nameAway: document.getElementById('team-name-away'),
      logoHome: document.getElementById('team-logo-home'),
      logoAway: document.getElementById('team-logo-away'),
      deptHome: document.getElementById('team-dept-home'),
      deptAway: document.getElementById('team-dept-away'),
      quarterBadge: document.getElementById('quarter-badge'),
      gameClock: document.getElementById('game-clock'),
      downDistance: document.getElementById('down-distance'),
      gameOdds: document.getElementById('game-odds-tag'),
      gameVenue: document.getElementById('game-venue-text'),
      teamBoxHome: document.getElementById('team-box-home'),
      teamBoxAway: document.getElementById('team-box-away'),
      possessionTagHome: document.getElementById('possession-tag-home'),
      possessionTagAway: document.getElementById('possession-tag-away'),
      // Field Visualizer
      ballLine: document.getElementById('ball-scrimmage-line'),
      firstDownLine: document.getElementById('first-down-line'),
      // Tactical Stats
      statYardsHome: document.getElementById('stat-yards-home'),
      statYardsAway: document.getElementById('stat-yards-away'),
      statSacksHome: document.getElementById('stat-sacks-home'),
      statSacksAway: document.getElementById('stat-sacks-away'),
      statFgHome: document.getElementById('stat-fg-home'),
      statFgAway: document.getElementById('stat-fg-away'),
      // Simulator Buttons
      btnTdHome: document.getElementById('btn-td-home'),
      btnTdAway: document.getElementById('btn-td-away'),
      btnGain: document.getElementById('btn-gain'),
      btnFg: document.getElementById('btn-fg'),
      btnSack: document.getElementById('btn-sack'),
      btnTurnover: document.getElementById('btn-turnover'),
      btnReset: document.getElementById('btn-reset'),
      eventLogList: document.getElementById('event-log-list'),
      mascotAvatar: document.getElementById('mascot-avatar'),
      // Tabs
      navTabs: document.querySelectorAll('.nav-tab'),
      tabContents: document.querySelectorAll('.tab-content'),
      challengesView: document.getElementById('challenges-view'),
      bracketView: document.getElementById('bracket-view'),
      leaderboardView: document.getElementById('leaderboard-view'),
      // Cardinals HQ
      btnLoadCardinalsGame: document.getElementById('btn-load-cardinals-game'),
      btnCheerArizona: document.getElementById('btn-cheer-arizona')
    };
  }

  async loadLocalData() {
    try {
      const [teamsRes, rosterRes] = await Promise.all([
        fetch('./data/teams.json'),
        fetch('./data/roster.json')
      ]);
      this.teams = await teamsRes.json();
      this.roster = await rosterRes.json();
    } catch (err) {
      console.warn('Fallback to local memory data.');
    }
  }

  async fetchEspnScoreboard(isBackground = false) {
    if (!isBackground && this.dom.espnStatusText) {
      this.dom.espnStatusText.textContent = 'CONNECTING TO ESPN (MST)...';
    }

    const result = await this.espnService.getScoreboard();
    this.liveGames = result.games || [];

    if (this.dom.espnStatusBadge && this.dom.espnStatusText) {
      this.dom.espnStatusBadge.className = 'header-status-pill live';
      this.dom.espnStatusText.textContent = `ESPN LIVE • ARIZONA TIME (MST)`;
    }

    this.renderTickerCarousel();

    if (!this.activeGameId && this.liveGames.length > 0) {
      this.selectGame(this.liveGames[0].id);
    }
  }

  renderTickerCarousel() {
    if (!this.dom.tickerCarousel) return;

    if (this.liveGames.length === 0) {
      this.dom.tickerCarousel.innerHTML = '<div class="ticker-loading">No NFL games scheduled currently.</div>';
      return;
    }

    const html = this.liveGames.map(game => {
      const isSelected = game.id === this.activeGameId;
      const isLive = game.status.state === 'in';
      const statusBadgeClass = isLive ? 'badge-live' : (game.status.completed ? 'badge-final' : 'badge-pre');

      return `
        <div class="ticker-game-card ${isSelected ? 'selected' : ''}" data-game-id="${game.id}">
          <div class="ticker-card-top">
            <span class="ticker-status ${statusBadgeClass}">${game.status.detail}</span>
            <span class="ticker-broadcast">${game.broadcast || 'NFL'}</span>
          </div>
          <div class="ticker-matchup-row">
            <div class="ticker-team">
              <img src="${game.awayTeam.logo}" class="ticker-logo" alt="${game.awayTeam.abbreviation}" onerror="this.src='https://a.espncdn.com/i/teamlogos/nfl/500/${game.awayTeam.abbreviation.toLowerCase()}.png'">
              <span class="ticker-abbr">${game.awayTeam.abbreviation}</span>
              <span class="ticker-score">${game.awayTeam.score}</span>
            </div>
            <div class="ticker-team">
              <img src="${game.homeTeam.logo}" class="ticker-logo" alt="${game.homeTeam.abbreviation}" onerror="this.src='https://a.espncdn.com/i/teamlogos/nfl/500/${game.homeTeam.abbreviation.toLowerCase()}.png'">
              <span class="ticker-abbr">${game.homeTeam.abbreviation}</span>
              <span class="ticker-score">${game.homeTeam.score}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // ⚡ Bolt: Cache HTML to prevent unnecessary re-renders
    if (this._lastTickerHtml === html) return;
    this._lastTickerHtml = html;
    this.dom.tickerCarousel.innerHTML = html;

    this.dom.tickerCarousel.querySelectorAll('.ticker-game-card').forEach(card => {
      card.addEventListener('click', () => {
        const gameId = card.dataset.gameId;
        this.selectGame(gameId);
      });
    });
  }

  selectGame(gameId) {
    this.activeGameId = gameId;
    const game = this.liveGames.find(g => g.id === gameId);
    if (game) {
      this.gameState.syncWithEspnGame(game, this.teams);
      this.renderTickerCarousel();
    }
  }

  populateSelectors() {
    if (this.dom.characterSelect && this.roster.length > 0) {
      this.dom.characterSelect.innerHTML = '';
      this.roster.forEach(char => {
        const opt = document.createElement('option');
        opt.value = char.id;
        opt.textContent = `${char.name} (${char.teamName || char.role})`;
        this.dom.characterSelect.appendChild(opt);
      });
      this.dom.characterSelect.value = this.roster[0].id;
    }

    if (this.dom.homeTeamSelect && this.dom.awayTeamSelect && this.teams.length > 0) {
      this.dom.homeTeamSelect.innerHTML = '';
      this.dom.awayTeamSelect.innerHTML = '';

      this.teams.forEach(team => {
        const optH = document.createElement('option');
        optH.value = team.id;
        optH.textContent = `${team.city} ${team.name} (${team.id})`;
        this.dom.homeTeamSelect.appendChild(optH);

        const optA = document.createElement('option');
        optA.value = team.id;
        optA.textContent = `${team.city} ${team.name} (${team.id})`;
        this.dom.awayTeamSelect.appendChild(optA);
      });

      this.dom.homeTeamSelect.value = 'CHI';
      this.dom.awayTeamSelect.value = 'SF';
    }
  }

  bindTabEvents() {
    this.dom.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        
        this.dom.navTabs.forEach(t => t.classList.remove('active'));
        this.dom.tabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.classList.add('active');
        }

        if (targetId === 'tab-challenges') {
          this.competitionsController.renderChallenges(this.dom.challengesView);
        } else if (targetId === 'tab-bracket') {
          this.competitionsController.renderBracket(this.dom.bracketView);
        } else if (targetId === 'tab-leaderboard') {
          this.competitionsController.renderLeaderboard(this.dom.leaderboardView);
        }
      });
    });
  }

  renderCompetitionsViews() {
    this.competitionsController.renderChallenges(this.dom.challengesView);
    this.competitionsController.renderBracket(this.dom.bracketView);
    this.competitionsController.renderLeaderboard(this.dom.leaderboardView);
  }

  bindTeamSelectors() {
    this.dom.homeTeamSelect?.addEventListener('change', () => this.handleManualTeamChange());
    this.dom.awayTeamSelect?.addEventListener('change', () => this.handleManualTeamChange());

    this.dom.characterSelect?.addEventListener('change', (e) => {
      this.characterController.selectCharacter(e.target.value);
    });
  }

  handleManualTeamChange() {
    const homeId = this.dom.homeTeamSelect.value;
    const awayId = this.dom.awayTeamSelect.value;

    const homeTeam = this.teams.find(t => t.id === homeId) || this.teams[0];
    const awayTeam = this.teams.find(t => t.id === awayId) || this.teams[1];

    this.gameState.setManualTeams(homeTeam, awayTeam);
  }

  bindSimulatorEvents() {
    this.dom.btnTdHome?.addEventListener('click', () => this.gameState.touchdownHome());
    this.dom.btnTdAway?.addEventListener('click', () => this.gameState.touchdownAway());
    this.dom.btnGain?.addEventListener('click', () => this.gameState.advancePlay(15));
    this.dom.btnFg?.addEventListener('click', () => this.gameState.fieldGoal(48));
    this.dom.btnSack?.addEventListener('click', () => this.gameState.sack(8));
    this.dom.btnTurnover?.addEventListener('click', () => this.gameState.turnover('INTERCEPTION'));
    this.dom.btnReset?.addEventListener('click', () => this.gameState.reset());
  }

  bindMascotInteraction() {
    this.dom.mascotAvatar?.addEventListener('click', () => {
      this.characterController.spawnConfetti();
      this.characterController.flashStadium('#10b981');
      this.characterController.speak('TOUCHDOWN_HOME');
    });
  }

  bindCardinalsHQEvents() {
    this.dom.btnLoadCardinalsGame?.addEventListener('click', () => {
      const ariTeam = this.teams.find(t => t.id === 'ARI') || { id: 'ARI', city: 'Arizona', name: 'Cardinals', displayName: 'Arizona Cardinals', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png', officeDept: 'Desert Division HQ' };
      const sfTeam = this.teams.find(t => t.id === 'SF') || { id: 'SF', city: 'San Francisco', name: '49ers', displayName: 'San Francisco 49ers', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png', officeDept: 'Legal & Compliance (Saul)' };

      this.gameState.setManualTeams(ariTeam, sfTeam);
      this.characterController.selectCharacter('char_cardinals');
      if (this.dom.characterSelect) this.dom.characterSelect.value = 'char_cardinals';

      document.getElementById('tab-btn-stadium')?.click();
      this.characterController.triggerTouchdownHome('ARIZONA CARDINALS');
    });

    this.dom.btnCheerArizona?.addEventListener('click', () => {
      this.characterController.selectCharacter('char_cardinals');
      if (this.dom.characterSelect) this.dom.characterSelect.value = 'char_cardinals';
      this.characterController.spawnConfetti();
      this.characterController.flashStadium('#97233F');
      this.characterController.speak('TOUCHDOWN_HOME', 'RISE UP RED SEA! Waving the Arizona Flag proud across State Farm Stadium! 🏈');
      this.characterController.showEventBanner('RISE UP RED SEA! 🏜️', 'ARIZONA CARDINALS TOUCHDOWN & FLAG CELEBRATION!', 'banner-home');
    });

    document.querySelectorAll('.btn-play-rivalry').forEach(btn => {
      btn.addEventListener('click', () => {
        const awayId = btn.dataset.away;
        const homeId = btn.dataset.home;

        const homeTeam = this.teams.find(t => t.id === homeId) || this.teams[0];
        const awayTeam = this.teams.find(t => t.id === awayId) || this.teams[1];

        this.gameState.setManualTeams(homeTeam, awayTeam);
        document.getElementById('tab-btn-stadium')?.click();
      });
    });
  }

  handleGameEvent(event) {
    switch (event.type) {
      case 'TOUCHDOWN_HOME':
        this.characterController.triggerTouchdownHome(event.payload.team);
        break;
      case 'TOUCHDOWN_AWAY':
        this.characterController.triggerTouchdownAway(event.payload.team);
        break;
      case 'TURNOVER':
        this.characterController.triggerTurnover(event.payload.takeawayTeam);
        break;
      case 'FIELD_GOAL':
        this.characterController.triggerFieldGoal(event.payload.team, event.payload.distance);
        break;
      case 'SACK':
        this.characterController.triggerSack(event.payload.yardLoss, event.payload.team);
        break;
      case 'PLAY_ADVANCED':
        this.characterController.speak('IDLE', `Gained ${event.payload.yards} yards! Moving the chains!`);
        break;
      case 'STATE_RESET':
        this.characterController.speak('IDLE');
        break;
      default:
        break;
    }
  }

  renderUI(state) {
    if (this.dom.scoreHome) this.dom.scoreHome.textContent = state.homeScore;
    if (this.dom.scoreAway) this.dom.scoreAway.textContent = state.awayScore;

    const homeTeam = state.homeTeam || this.teams[0];
    const awayTeam = state.awayTeam || this.teams[1];

    if (this.dom.nameHome) this.dom.nameHome.textContent = homeTeam.displayName || `${homeTeam.city} ${homeTeam.name}`;
    if (this.dom.nameAway) this.dom.nameAway.textContent = awayTeam.displayName || `${awayTeam.city} ${awayTeam.name}`;

    if (this.dom.logoHome && homeTeam.logo) this.dom.logoHome.src = homeTeam.logo;
    if (this.dom.logoAway && awayTeam.logo) this.dom.logoAway.src = awayTeam.logo;

    if (this.dom.deptHome) this.dom.deptHome.innerHTML = `${homeTeam.officeDept || 'Executive Strategy'} • <span id="team-record-home">${homeTeam.record || '10-5'}</span>`;
    if (this.dom.deptAway) this.dom.deptAway.innerHTML = `${awayTeam.officeDept || 'Operations'} • <span id="team-record-away">${awayTeam.record || '11-4'}</span>`;

    if (this.dom.quarterBadge) this.dom.quarterBadge.textContent = `Q${state.quarter}`;
    if (this.dom.gameClock) this.dom.gameClock.textContent = state.timeRemaining;
    if (this.dom.gameOdds && state.odds) {
      this.dom.gameOdds.textContent = `ODDS: ${state.odds.details} • ${state.odds.overUnder}`;
    }
    if (this.dom.gameVenue && state.venue) {
      this.dom.gameVenue.textContent = `📍 ${state.venue}`;
    }

    if (this.dom.downDistance) {
      const downSuffix = ['th', 'st', 'nd', 'rd', 'th'][state.down] || 'th';
      const side = state.ballOnYard <= 50 ? 'OWN' : 'OPP';
      const yardDisplay = state.ballOnYard <= 50 ? state.ballOnYard : 100 - state.ballOnYard;
      this.dom.downDistance.textContent = `${state.down}${downSuffix} & ${state.distance} at ${side} ${yardDisplay}`;
    }

    if (state.possession === 'HOME') {
      this.dom.teamBoxHome?.classList.add('active-possession');
      this.dom.teamBoxAway?.classList.remove('active-possession');
      if (this.dom.possessionTagHome) this.dom.possessionTagHome.style.display = 'inline-block';
      if (this.dom.possessionTagAway) this.dom.possessionTagAway.style.display = 'none';
    } else {
      this.dom.teamBoxHome?.classList.remove('active-possession');
      this.dom.teamBoxAway?.classList.add('active-possession');
      if (this.dom.possessionTagHome) this.dom.possessionTagHome.style.display = 'none';
      if (this.dom.possessionTagAway) this.dom.possessionTagAway.style.display = 'inline-block';
    }

    if (this.dom.ballLine) {
      const leftPct = Math.max(5, Math.min(95, state.ballOnYard));
      this.dom.ballLine.style.left = `${leftPct}%`;
    }
    if (this.dom.firstDownLine) {
      const firstDownYard = Math.max(5, Math.min(95, state.ballOnYard + (state.distance || 10)));
      this.dom.firstDownLine.style.left = `${firstDownYard}%`;
    }

    if (this.dom.statYardsHome) this.dom.statYardsHome.textContent = `${state.stats?.homeYards || 384} YDS`;
    if (this.dom.statYardsAway) this.dom.statYardsAway.textContent = `${state.stats?.awayYards || 342} YDS`;
    if (this.dom.statSacksHome) this.dom.statSacksHome.textContent = `${state.stats?.homeSacks || 3} SACKS`;
    if (this.dom.statSacksAway) this.dom.statSacksAway.textContent = `${state.stats?.awaySacks || 2} SACKS`;
    if (this.dom.statFgHome) this.dom.statFgHome.textContent = `${state.stats?.homeFG || 2} FG`;
    if (this.dom.statFgAway) this.dom.statFgAway.textContent = `${state.stats?.awayFG || 1} FG`;

    this.renderLogs(state.eventHistory);
  }

  renderLogs(history) {
    if (!this.dom.eventLogList) return;
    this.dom.eventLogList.innerHTML = '';
    history.forEach(item => {
      const row = document.createElement('div');
      row.className = `event-item ${item.type}`;
      row.innerHTML = `
        <span class="event-text">${item.text}</span>
        <span class="event-time">${item.timestamp}</span>
      `;
      this.dom.eventLogList.appendChild(row);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new OfficeEndzoneApp();
  app.init();
});
