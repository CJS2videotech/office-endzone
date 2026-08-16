/**
 * GameState - Core state management and event dispatcher for Office Endzone
 */
export class GameState {
  constructor() {
    this.listeners = [];
    this.reset();
  }

  reset() {
    this.state = {
      homeScore: 0,
      awayScore: 0,
      quarter: 1,
      timeRemaining: '15:00',
      possession: 'HOME', // 'HOME' or 'AWAY'
      down: 1,
      distance: 10,
      ballOnYard: 25, // 0 to 100
      lastEvent: 'Game Initialized',
      lastEventCategory: 'info',
      eventHistory: [
        {
          timestamp: new Date().toLocaleTimeString(),
          text: 'Kickoff! Welcome to Office Endzone.',
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
    if (this.state.eventHistory.length > 30) {
      this.state.eventHistory.pop();
    }
    this.state.lastEvent = text;
    this.state.lastEventCategory = type;
  }

  // --- Mock Game Events ---

  touchdownHome() {
    this.state.homeScore += 6;
    this.state.possession = 'AWAY';
    this.state.down = 1;
    this.state.distance = 10;
    this.state.ballOnYard = 25;
    this.logEvent('TOUCHDOWN HOME! The office goes wild with coffee celebration! (+6 PTS)', 'touchdown');
    this.notify({
      type: 'TOUCHDOWN_HOME',
      payload: { team: 'HOME', scoreChange: 6, state: this.state }
    });
  }

  touchdownAway() {
    this.state.awayScore += 6;
    this.state.possession = 'HOME';
    this.state.down = 1;
    this.state.distance = 10;
    this.state.ballOnYard = 25;
    this.logEvent('TOUCHDOWN AWAY! Opponent silences the boardroom! (+6 PTS)', 'away_touchdown');
    this.notify({
      type: 'TOUCHDOWN_AWAY',
      payload: { team: 'AWAY', scoreChange: 6, state: this.state }
    });
  }

  turnover() {
    const previousPossession = this.state.possession;
    this.state.possession = previousPossession === 'HOME' ? 'AWAY' : 'HOME';
    this.state.down = 1;
    this.state.distance = 10;
    this.state.ballOnYard = Math.max(10, 100 - this.state.ballOnYard);
    
    const msg = `TURNOVER! Interception/Fumble! Possession shifts to ${this.state.possession}!`;
    this.logEvent(msg, 'turnover');
    this.notify({
      type: 'TURNOVER',
      payload: { previousPossession, currentPossession: this.state.possession, state: this.state }
    });
  }

  fieldGoal() {
    const scoringTeam = this.state.possession;
    if (scoringTeam === 'HOME') {
      this.state.homeScore += 3;
    } else {
      this.state.awayScore += 3;
    }
    this.state.possession = scoringTeam === 'HOME' ? 'AWAY' : 'HOME';
    this.state.down = 1;
    this.state.distance = 10;
    this.state.ballOnYard = 25;
    
    this.logEvent(`FIELD GOAL IS GOOD! ${scoringTeam} splits the uprights! (+3 PTS)`, 'field_goal');
    this.notify({
      type: 'FIELD_GOAL',
      payload: { team: scoringTeam, scoreChange: 3, state: this.state }
    });
  }

  sack() {
    const yardLoss = Math.floor(Math.random() * 5) + 5; // 5 to 9 yards loss
    this.state.ballOnYard = Math.max(1, this.state.ballOnYard - yardLoss);
    if (this.state.down < 4) {
      this.state.down += 1;
      this.state.distance += yardLoss;
    } else {
      // Turnover on downs
      this.state.possession = this.state.possession === 'HOME' ? 'AWAY' : 'HOME';
      this.state.down = 1;
      this.state.distance = 10;
      this.state.ballOnYard = Math.max(10, 100 - this.state.ballOnYard);
      this.logEvent(`SACK on 4th down! Turnover on downs! (-${yardLoss} YDS)`, 'turnover');
      this.notify({
        type: 'SACK',
        payload: { yardLoss, turnoverOnDowns: true, state: this.state }
      });
      return;
    }

    this.logEvent(`QB SACKED! Crushed behind the line of scrimmage! (-${yardLoss} YDS, Down ${this.state.down})`, 'sack');
    this.notify({
      type: 'SACK',
      payload: { yardLoss, turnoverOnDowns: false, state: this.state }
    });
  }
}
