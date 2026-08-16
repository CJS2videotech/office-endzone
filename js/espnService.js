/**
 * espnService.js - Real-time ESPN NFL API Data Engine
 * Fetches live NFL scoreboard, real team logos, down/distance, scores, and odds.
 */

export class EspnService {
  constructor() {
    this.baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
    this.cachedGames = [];
    this.lastFetched = null;
  }

  /**
   * Fetches the current NFL Scoreboard from ESPN
   */
  async getScoreboard() {
    try {
      const response = await fetch(`${this.baseUrl}/scoreboard`, {
        cache: 'no-cache'
      });
      if (!response.ok) {
        throw new Error(`ESPN API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      this.lastFetched = new Date();

      if (data && data.events && data.events.length > 0) {
        this.cachedGames = data.events.map(event => this.normalizeGame(event));
        return {
          success: true,
          season: data.season?.displayName || '2026',
          week: data.week?.number || 1,
          games: this.cachedGames,
          isLive: true
        };
      } else {
        return this.getFallbackScoreboard('No active events in ESPN feed');
      }
    } catch (error) {
      console.warn('ESPN API fetch failed or blocked by CORS. Using high-fidelity NFL match dataset:', error);
      return this.getFallbackScoreboard(error.message);
    }
  }

  /**
   * Normalizes an ESPN event object into a clean game format
   */
  normalizeGame(event) {
    const competition = event.competitions?.[0] || {};
    const competitors = competition.competitors || [];
    const homeComp = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
    const awayComp = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};

    const homeTeam = homeComp.team || {};
    const awayTeam = awayComp.team || {};

    const situation = competition.situation || {};
    const status = event.status || {};
    const type = status.type || {};

    // Down & distance formatting
    let downDistance = '1st & 10 at OWN 25';
    if (situation.down && situation.distance) {
      const downSuffix = ['th', 'st', 'nd', 'rd', 'th'][situation.down] || 'th';
      const possessionText = situation.possessionText ? `at ${situation.possessionText}` : '';
      downDistance = `${situation.down}${downSuffix} & ${situation.distance} ${possessionText}`.trim();
    } else if (type.state === 'pre') {
      downDistance = status.detail || 'Scheduled';
    } else if (type.completed) {
      downDistance = 'Final';
    }

    // Odds formatting
    const odds = competition.odds?.[0] || {};
    const spreadDetails = odds.details || 'EVEN';
    const overUnder = odds.overUnder ? `O/U ${odds.overUnder}` : '';

    return {
      id: event.id,
      name: event.name || `${awayTeam.displayName} at ${homeTeam.displayName}`,
      shortName: event.shortName || `${awayTeam.abbreviation} @ ${homeTeam.abbreviation}`,
      date: event.date,
      status: {
        state: type.state || 'in', // 'pre', 'in', 'post'
        completed: type.completed || false,
        detail: type.shortDetail || type.detail || status.displayClock || 'Live',
        clock: status.displayClock || '15:00',
        period: status.period || 1,
        quarter: `Q${status.period || 1}`
      },
      homeTeam: {
        id: homeTeam.abbreviation || homeTeam.id || 'KC',
        name: homeTeam.name || 'Chiefs',
        city: homeTeam.location || 'Kansas City',
        displayName: homeTeam.displayName || 'Kansas City Chiefs',
        abbreviation: homeTeam.abbreviation || 'KC',
        color: `#${homeTeam.color || 'E31837'}`,
        alternateColor: `#${homeTeam.alternateColor || 'FFB81C'}`,
        logo: homeTeam.logo || `https://a.espncdn.com/i/teamlogos/nfl/500/${(homeTeam.abbreviation || 'kc').toLowerCase()}.png`,
        score: parseInt(homeComp.score || 0, 10),
        record: homeComp.records?.[0]?.summary || '0-0',
        hasPossession: situation.possession === homeComp.id
      },
      awayTeam: {
        id: awayTeam.abbreviation || awayTeam.id || 'SF',
        name: awayTeam.name || '49ers',
        city: awayTeam.location || 'San Francisco',
        displayName: awayTeam.displayName || 'San Francisco 49ers',
        abbreviation: awayTeam.abbreviation || 'SF',
        color: `#${awayTeam.color || 'AA0000'}`,
        alternateColor: `#${awayTeam.alternateColor || 'B3995D'}`,
        logo: awayTeam.logo || `https://a.espncdn.com/i/teamlogos/nfl/500/${(awayTeam.abbreviation || 'sf').toLowerCase()}.png`,
        score: parseInt(awayComp.score || 0, 10),
        record: awayComp.records?.[0]?.summary || '0-0',
        hasPossession: situation.possession === awayComp.id
      },
      venue: competition.venue?.fullName || 'NFL Stadium',
      broadcast: competition.broadcasts?.[0]?.names?.[0] || 'NFL Network',
      odds: {
        details: spreadDetails,
        overUnder: overUnder
      },
      situation: {
        down: situation.down || 1,
        distance: situation.distance || 10,
        yardLine: situation.yardLine || 25,
        isRedZone: situation.isRedZone || (situation.yardLine && situation.yardLine >= 80),
        downDistanceText: downDistance
      }
    };
  }

  /**
   * Fallback dataset with top marquee NFL games when ESPN is offline
   */
  getFallbackScoreboard(reason = '') {
    const fallbackGames = [
      {
        id: 'nfl_game_1',
        name: 'San Francisco 49ers at Kansas City Chiefs',
        shortName: 'SF @ KC',
        date: new Date().toISOString(),
        status: {
          state: 'in',
          completed: false,
          detail: '4th - 2:14',
          clock: '2:14',
          period: 4,
          quarter: 'Q4'
        },
        homeTeam: {
          id: 'KC',
          name: 'Chiefs',
          city: 'Kansas City',
          displayName: 'Kansas City Chiefs',
          abbreviation: 'KC',
          color: '#E31837',
          alternateColor: '#FFB81C',
          logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
          score: 28,
          record: '0-0',
          hasPossession: true
        },
        awayTeam: {
          id: 'SF',
          name: '49ers',
          city: 'San Francisco',
          displayName: 'San Francisco 49ers',
          abbreviation: 'SF',
          color: '#AA0000',
          alternateColor: '#B3995D',
          logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
          score: 24,
          record: '0-0',
          hasPossession: false
        },
        venue: 'GEHA Field at Arrowhead Stadium',
        broadcast: 'NBC Sunday Night Football',
        odds: { details: 'KC -3.5', overUnder: 'O/U 49.5' },
        situation: {
          down: 3,
          distance: 4,
          yardLine: 68,
          isRedZone: false,
          downDistanceText: '3rd & 4 at OPP 32'
        }
      },
      {
        id: 'nfl_game_2',
        name: 'Philadelphia Eagles at Detroit Lions',
        shortName: 'PHI @ DET',
        date: new Date().toISOString(),
        status: {
          state: 'in',
          completed: false,
          detail: '3rd - 8:45',
          clock: '8:45',
          period: 3,
          quarter: 'Q3'
        },
        homeTeam: {
          id: 'DET',
          name: 'Lions',
          city: 'Detroit',
          displayName: 'Detroit Lions',
          abbreviation: 'DET',
          color: '#0076B6',
          alternateColor: '#B0B7BC',
          logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
          score: 27,
          record: '0-0',
          hasPossession: true
        },
        awayTeam: {
          id: 'PHI',
          name: 'Eagles',
          city: 'Philadelphia',
          displayName: 'Philadelphia Eagles',
          abbreviation: 'PHI',
          color: '#004C54',
          alternateColor: '#A5ACAF',
          logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
          score: 31,
          record: '0-0',
          hasPossession: false
        },
        venue: 'Ford Field',
        broadcast: 'FOX Game of the Week',
        odds: { details: 'PHI -2.5', overUnder: 'O/U 52.0' },
        situation: {
          down: 1,
          distance: 10,
          yardLine: 45,
          isRedZone: false,
          downDistanceText: '1st & 10 at OWN 45'
        }
      },
      {
        id: 'nfl_game_3',
        name: 'Baltimore Ravens at Buffalo Bills',
        shortName: 'BAL @ BUF',
        date: new Date().toISOString(),
        status: {
          state: 'in',
          completed: false,
          detail: '2nd - 0:34',
          clock: '0:34',
          period: 2,
          quarter: 'Q2'
        },
        homeTeam: {
          id: 'BUF',
          name: 'Bills',
          city: 'Buffalo',
          displayName: 'Buffalo Bills',
          abbreviation: 'BUF',
          color: '#00338D',
          alternateColor: '#C60C30',
          logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
          score: 17,
          record: '0-0',
          hasPossession: false
        },
        awayTeam: {
          id: 'BAL',
          name: 'Ravens',
          city: 'Baltimore',
          displayName: 'Baltimore Ravens',
          abbreviation: 'BAL',
          color: '#241773',
          alternateColor: '#9E7C0C',
          logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
          score: 21,
          record: '0-0',
          hasPossession: true
        },
        venue: 'Highmark Stadium',
        broadcast: 'CBS Sports',
        odds: { details: 'BAL -1.5', overUnder: 'O/U 48.0' },
        situation: {
          down: 2,
          distance: 8,
          yardLine: 92,
          isRedZone: true,
          downDistanceText: '2nd & Goal at BUF 8'
        }
      },
      {
        id: 'nfl_game_4',
        name: 'Dallas Cowboys at Green Bay Packers',
        shortName: 'DAL @ GB',
        date: new Date().toISOString(),
        status: {
          state: 'pre',
          completed: false,
          detail: 'Tonight - 8:15 PM EDT',
          clock: '15:00',
          period: 1,
          quarter: 'Q1'
        },
        homeTeam: {
          id: 'GB',
          name: 'Packers',
          city: 'Green Bay',
          displayName: 'Green Bay Packers',
          abbreviation: 'GB',
          color: '#203731',
          alternateColor: '#FFB612',
          logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
          score: 0,
          record: '0-0',
          hasPossession: false
        },
        awayTeam: {
          id: 'DAL',
          name: 'Cowboys',
          city: 'Dallas',
          displayName: 'Dallas Cowboys',
          abbreviation: 'DAL',
          color: '#041E42',
          alternateColor: '#869397',
          logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
          score: 0,
          record: '0-0',
          hasPossession: false
        },
        venue: 'Lambeau Field',
        broadcast: 'ESPN Monday Night Football',
        odds: { details: 'GB -3.0', overUnder: 'O/U 46.5' },
        situation: {
          down: 1,
          distance: 10,
          yardLine: 25,
          isRedZone: false,
          downDistanceText: 'Tonight - 8:15 PM EDT'
        }
      }
    ];

    this.cachedGames = fallbackGames;
    return {
      success: true,
      season: '2026 NFL Preseason / Season',
      week: 2,
      games: fallbackGames,
      isLive: false,
      reason: reason
    };
  }
}
