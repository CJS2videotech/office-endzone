/**
 * gameState.js - Core Football State & Matchup Engine for Office Endzone
 * Synchronizes with real ESPN NFL game feeds or runs local tactical simulations.
 */

export class GameState {
  constructor() {
    this.listeners = [];
    this.isLiveEspnSync = false;
    this.reset();
  }

  reset() {
    this.state = {
      homeScore: 28,
      awayScore: 24,
      quarter: 4,
      timeRemaining: '2:14',
      possession: 'HOME', // 'HOME' or 'AWAY'
      down: 3,
      distance: 4,
      ballOnYard: 68, // 1 to 99 (100 = touchdown)
      isRedZone: false,
      homeTeamId: 'KC',
      awayTeamId: 'SF',
      homeTeam: {
        name: 'Chiefs',
        city: 'Kansas City',
        displayName: 'Kansas City Chiefs',
        abbreviation: 'KC',
        logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
        primaryColor: '#E31837',
        secondaryColor: '#FFB81C',
        officeDept: 'Executive Strategy'
      },
      awayTeam: {
        name: '49ers',
        city: 'San Francisco',
        displayName: 'San Francisco 49ers',
        abbreviation: 'SF',
        logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
        primaryColor: '#AA0000',
        secondaryColor: '#B3995D',
        officeDept: 'Engineering & Security'
      },
      stats: {
        homeYards: 384,
        awayYards: 342,
        homeSacks: 3,
        awaySacks: 2,
        homeFG: 2,
        awayFG: 1
      },
      odds: { details: 'KC -3.5', overUnder: 'O/U 49.5' },
      venue: 'GEHA Field at Arrowhead Stadium',
      broadcast: 'NBC Sunday Night Football',
      lastEvent: 'Game Initialized in 4th Quarter Shootout',
      lastEventCategory: 'info',
      eventHistory: [
        {
          timestamp: new Date().toLocaleTimeString(),
          text: '⚡ Welcome to Office Endzone! Live football simulation ready.',
          type: 'info'
        }
      ]
    };
    this.notify({ type: 'STATE_RESET', payload: this.state });
  }

  getState() {
    return { ...this.state };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event) {
    for (const listener of this.listeners) {
      listener(event, this.state);
    }
  }

  logEvent(text, type = 'info') {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      text,
      type
    };
    this.state.eventHistory.unshift(entry);
    if (this.state.eventHistory.length > 40) {
      this.state.eventHistory.pop();
    }
    this.state.lastEvent = text;
    this.state.lastEventCategory = type;
  }

  /**
   * Syncs state directly with an ESPN normalized game object
   */
  syncWithEspnGame(game, teamsRoster = []) {
    if (!game) return;

    this.isLiveEspnSync = true;
    this.state.homeScore = game.homeTeam.score;
    this.state.awayScore = game.awayTeam.score;
    this.state.quarter = game.status.period || 1;
    this.state.timeRemaining = game.status.clock || game.status.detail;
    this.state.possession = game.homeTeam.hasPossession ? 'HOME' : (game.awayTeam.hasPossession ? 'AWAY' : this.state.possession);
    this.state.down = game.situation.down || 1;
    this.state.distance = game.situation.distance || 10;
    this.state.ballOnYard = game.situation.yardLine || 25;
    this.state.isRedZone = game.situation.isRedZone || this.state.ballOnYard >= 80;
    this.state.venue = game.venue;
    this.state.broadcast = game.broadcast;
    this.state.odds = game.odds;

    // Resolve full team metadata with office departments
    const matchHome = teamsRoster.find(t => t.id === game.homeTeam.abbreviation || t.name.toLowerCase() === game.homeTeam.name.toLowerCase());
    const matchAway = teamsRoster.find(t => t.id === game.awayTeam.abbreviation || t.name.toLowerCase() === game.awayTeam.name.toLowerCase());

    this.state.homeTeamId = game.homeTeam.abbreviation;
    this.state.awayTeamId = game.awayTeam.abbreviation;

    this.state.homeTeam = {
      ...game.homeTeam,
      officeDept: matchHome?.officeDept || 'Executive Strategy',
      logo: matchHome?.logo || game.homeTeam.logo
    };

    this.state.awayTeam = {
      ...game.awayTeam,
      officeDept: matchAway?.officeDept || 'Operations',
      logo: matchAway?.logo || game.awayTeam.logo
    };

    this.logEvent(`Synced with live ESPN game: ${game.awayTeam.displayName} vs ${game.homeTeam.displayName}`, 'info');
    this.notify({ type: 'ESPN_SYNC', payload: { game, state: this.state } });
  }

  setManualTeams(homeTeam, awayTeam) {
    this.state.homeTeamId = homeTeam.id;
    this.state.awayTeamId = awayTeam.id;
    this.state.homeTeam = { ...homeTeam };
    this.state.awayTeam = { ...awayTeam };
    this.notify({ type: 'TEAMS_UPDATED', payload: { homeTeam, awayTeam, state: this.state } });
  }

  // --- Tactical Gameplay Triggers ---

  touchdownHome(gainYards = 35) {
    this.state.homeScore += 6;
    this.state.stats.homeYards += gainYards;
    this.state.ballOnYard = 100;
    this.state.isRedZone = false;
    this.logEvent(`TOUCHDOWN ${this.state.homeTeam.displayName}! +6 PTS (${gainYards}-yd scoring play)`, 'touchdown');
    
    this.notify({
      type: 'TOUCHDOWN_HOME',
      payload: { team: this.state.homeTeam.displayName, scoreChange: 6, state: this.state }
    });

    // Reset possession after score
    setTimeout(() => {
      this.state.possession = 'AWAY';
      this.state.down = 1;
      this.state.distance = 10;
      this.state.ballOnYard = 25;
      this.notify({ type: 'POSSESSION_CHANGE', payload: this.state });
    }, 1500);
  }

  touchdownAway(gainYards = 42) {
    this.state.awayScore += 6;
    this.state.stats.awayYards += gainYards;
    this.state.ballOnYard = 100;
    this.state.isRedZone = false;
    this.logEvent(`TOUCHDOWN ${this.state.awayTeam.displayName}! +6 PTS (${gainYards}-yd bomb)`, 'away_touchdown');
    
    this.notify({
      type: 'TOUCHDOWN_AWAY',
      payload: { team: this.state.awayTeam.displayName, scoreChange: 6, state: this.state }
    });

    setTimeout(() => {
      this.state.possession = 'HOME';
      this.state.down = 1;
      this.state.distance = 10;
      this.state.ballOnYard = 25;
      this.notify({ type: 'POSSESSION_CHANGE', payload: this.state });
    }, 1500);
  }

  fieldGoal(dist = 48) {
    const isHome = this.state.possession === 'HOME';
    if (isHome) {
      this.state.homeScore += 3;
      this.state.stats.homeFG += 1;
    } else {
      this.state.awayScore += 3;
      this.state.stats.awayFG += 1;
    }

    const scoringTeam = isHome ? this.state.homeTeam.displayName : this.state.awayTeam.displayName;
    this.logEvent(`FIELD GOAL GOOD! ${scoringTeam} converts from ${dist} yards (+3 PTS)`, 'field_goal');

    this.notify({
      type: 'FIELD_GOAL',
      payload: { team: scoringTeam, distance: dist, state: this.state }
    });

    setTimeout(() => {
      this.state.possession = isHome ? 'AWAY' : 'HOME';
      this.state.down = 1;
      this.state.distance = 10;
      this.state.ballOnYard = 25;
      this.state.isRedZone = false;
      this.notify({ type: 'POSSESSION_CHANGE', payload: this.state });
    }, 1500);
  }

  sack(loss = 8) {
    const isHomePoss = this.state.possession === 'HOME';
    if (isHomePoss) {
      this.state.stats.awaySacks += 1;
    } else {
      this.state.stats.homeSacks += 1;
    }

    this.state.ballOnYard = Math.max(1, this.state.ballOnYard - loss);
    this.state.isRedZone = this.state.ballOnYard >= 80;

    const defTeam = isHomePoss ? this.state.awayTeam.displayName : this.state.homeTeam.displayName;

    if (this.state.down < 4) {
      this.state.down += 1;
      this.state.distance += loss;
      this.logEvent(`QB SACKED by ${defTeam}! Loss of ${loss} yards (Now ${this.state.down}th down)`, 'sack');
      this.notify({
        type: 'SACK',
        payload: { yardLoss: loss, turnoverOnDowns: false, team: defTeam, state: this.state }
      });
    } else {
      this.state.possession = isHomePoss ? 'AWAY' : 'HOME';
      this.state.down = 1;
      this.state.distance = 10;
      this.state.ballOnYard = Math.max(15, 100 - this.state.ballOnYard);
      this.logEvent(`SACK on 4th Down! Turnover on Downs by ${defTeam}!`, 'turnover');
      this.notify({
        type: 'SACK',
        payload: { yardLoss: loss, turnoverOnDowns: true, team: defTeam, state: this.state }
      });
    }
  }

  turnover(type = 'INTERCEPTION') {
    const prevPoss = this.state.possession;
    this.state.possession = prevPoss === 'HOME' ? 'AWAY' : 'HOME';
    this.state.down = 1;
    this.state.distance = 10;
    this.state.ballOnYard = Math.max(15, 100 - this.state.ballOnYard);
    this.state.isRedZone = this.state.ballOnYard >= 80;

    const takeawayTeam = this.state.possession === 'HOME' ? this.state.homeTeam.displayName : this.state.awayTeam.displayName;
    this.logEvent(`${type}! ${takeawayTeam} takes over possession!`, 'turnover');

    this.notify({
      type: 'TURNOVER',
      payload: { takeawayTeam, previousPossession: prevPoss, state: this.state }
    });
  }

  advancePlay(yards = 15) {
    const isHome = this.state.possession === 'HOME';
    if (isHome) {
      this.state.stats.homeYards += yards;
    } else {
      this.state.stats.awayYards += yards;
    }

    this.state.ballOnYard = Math.min(99, this.state.ballOnYard + yards);
    this.state.isRedZone = this.state.ballOnYard >= 80;

    if (yards >= this.state.distance) {
      this.state.down = 1;
      this.state.distance = 10;
      this.logEvent(`FIRST DOWN! +${yards} YDS gain (Ball on yard ${this.state.ballOnYard})`, 'info');
    } else {
      this.state.down = Math.min(4, this.state.down + 1);
      this.state.distance -= yards;
      this.logEvent(`Gain of ${yards} yards (Now ${this.state.down}th & ${this.state.distance})`, 'info');
    }

    this.notify({ type: 'PLAY_ADVANCED', payload: { yards, state: this.state } });
  }
}
