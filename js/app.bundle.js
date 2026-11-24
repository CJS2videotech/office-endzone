/**
 * app.bundle.js - Live ESPN-Powered Office Endzone Application Engine
 * Dynamic NFL Season/Week sync, Live Ticker (Current Week & Last Week), Team Roster Grid,
 * Member Detail Modal (Real Records, Standings, Next 5 Schedule, Automated Fantasy Stats),
 * Real ESPN Box Score Modal, Weekly & 18-Week Season Brackets, Automated Challenges & Standings.
 */

(function() {
  'use strict';

  const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
  const ESPN_STANDINGS_URL = 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings?level=3';

  // Normalize team abbreviations across ESPN / legacy aliases
  function normalizeAbbr(abbr) {
    if (!abbr) return '';
    const u = String(abbr).toUpperCase().trim();
    if (u === 'WAS') return 'WSH';
    if (u === 'LA') return 'LAR';
    return u;
  }

  // Escape HTML safely for dynamic ESPN text
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Arizona Time (Mountain Standard Time - UTC-7, no Daylight Saving)
  function formatArizonaTime(dateInput) {
    if (!dateInput) return 'TBD MST';
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return String(dateInput).includes('MST') ? dateInput : `${dateInput} MST`;
      return date.toLocaleTimeString('en-US', {
        timeZone: 'America/Phoenix',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' MST';
    } catch (e) {
      return `${dateInput} MST`;
    }
  }

  function formatArizonaShortDate(dateInput) {
    if (!dateInput) return '';
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', {
        timeZone: 'America/Phoenix',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  function formatArizonaDayTime(dateInput) {
    if (!dateInput) return 'TBD MST';
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return 'TBD MST';
      const day = date.toLocaleDateString('en-US', {
        timeZone: 'America/Phoenix',
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const time = date.toLocaleTimeString('en-US', {
        timeZone: 'America/Phoenix',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${day} • ${time} MST`;
    } catch (e) {
      return 'TBD MST';
    }
  }

  function getArizonaClockString() {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/Phoenix',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' MST';
    } catch (e) {
      return '--:-- MST';
    }
  }

  function formatRecordPct(wins, losses, ties = 0) {
    const total = wins + losses + ties;
    if (total <= 0) return '.000';
    const pct = (wins + ties * 0.5) / total;
    return pct === 1 ? '1.000' : pct.toFixed(3).replace(/^0\./, '.');
  }

  // 1. ALL 32 NFL FRANCHISES (Metadata & Division Map — NO hardcoded rosters/records)
  const TEAMS = [
    // NFC North
    { id: "CHI", city: "Chicago", name: "Bears", abbreviation: "CHI", color: "#ef4444", secondaryColor: "#0B162A", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png", stadium: "Soldier Field", division: "NFC North" },
    { id: "GB", city: "Green Bay", name: "Packers", abbreviation: "GB", color: "#facc15", secondaryColor: "#203731", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png", stadium: "Lambeau Field", division: "NFC North" },
    { id: "DET", city: "Detroit", name: "Lions", abbreviation: "DET", color: "#0076B6", secondaryColor: "#B0B7BC", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png", stadium: "Ford Field", division: "NFC North" },
    { id: "MIN", city: "Minnesota", name: "Vikings", abbreviation: "MIN", color: "#4F2683", secondaryColor: "#FFC62F", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/min.png", stadium: "U.S. Bank Stadium", division: "NFC North" },

    // AFC North
    { id: "CLE", city: "Cleveland", name: "Browns", abbreviation: "CLE", color: "#fb923c", secondaryColor: "#311D00", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png", stadium: "Huntington Bank Field", division: "AFC North" },
    { id: "PIT", city: "Pittsburgh", name: "Steelers", abbreviation: "PIT", color: "#FFB612", secondaryColor: "#101820", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png", stadium: "Acrisure Stadium", division: "AFC North" },
    { id: "BAL", city: "Baltimore", name: "Ravens", abbreviation: "BAL", color: "#241773", secondaryColor: "#9E7C0C", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png", stadium: "M&T Bank Stadium", division: "AFC North" },
    { id: "CIN", city: "Cincinnati", name: "Bengals", abbreviation: "CIN", color: "#FB4F14", secondaryColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png", stadium: "Paycor Stadium", division: "AFC North" },

    // AFC West
    { id: "LV", city: "Las Vegas", name: "Raiders", abbreviation: "LV", color: "#38bdf8", secondaryColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png", stadium: "Allegiant Stadium", division: "AFC West" },
    { id: "KC", city: "Kansas City", name: "Chiefs", abbreviation: "KC", color: "#E31837", secondaryColor: "#FFB81C", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png", stadium: "GEHA Field at Arrowhead Stadium", division: "AFC West" },
    { id: "LAC", city: "Los Angeles", name: "Chargers", abbreviation: "LAC", color: "#0080C6", secondaryColor: "#FFC20E", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png", stadium: "SoFi Stadium", division: "AFC West" },
    { id: "DEN", city: "Denver", name: "Broncos", abbreviation: "DEN", color: "#FB4F14", secondaryColor: "#002244", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/den.png", stadium: "Empower Field at Mile High", division: "AFC West" },

    // NFC West
    { id: "SF", city: "San Francisco", name: "49ers", abbreviation: "SF", color: "#fb7185", secondaryColor: "#AA0000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png", stadium: "Levi's Stadium", division: "NFC West" },
    { id: "ARI", city: "Arizona", name: "Cardinals", abbreviation: "ARI", color: "#f43f5e", secondaryColor: "#97233F", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png", stadium: "State Farm Stadium", division: "NFC West" },
    { id: "LAR", city: "Los Angeles", name: "Rams", abbreviation: "LAR", color: "#003594", secondaryColor: "#FFA300", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png", stadium: "SoFi Stadium", division: "NFC West" },
    { id: "SEA", city: "Seattle", name: "Seahawks", abbreviation: "SEA", color: "#69BE28", secondaryColor: "#002244", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png", stadium: "Lumen Field", division: "NFC West" },

    // NFC East
    { id: "PHI", city: "Philadelphia", name: "Eagles", abbreviation: "PHI", color: "#2dd4bf", secondaryColor: "#004C54", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png", stadium: "Lincoln Financial Field", division: "NFC East" },
    { id: "DAL", city: "Dallas", name: "Cowboys", abbreviation: "DAL", color: "#3b82f6", secondaryColor: "#041E42", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png", stadium: "AT&T Stadium", division: "NFC East" },
    { id: "NYG", city: "New York", name: "Giants", abbreviation: "NYG", color: "#3b82f6", secondaryColor: "#0B2265", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png", stadium: "MetLife Stadium", division: "NFC East" },
    { id: "WSH", city: "Washington", name: "Commanders", abbreviation: "WSH", color: "#f59e0b", secondaryColor: "#5A1414", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png", stadium: "Northwest Stadium", division: "NFC East" },

    // AFC South
    { id: "HOU", city: "Houston", name: "Texans", abbreviation: "HOU", color: "#ef4444", secondaryColor: "#03202F", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png", stadium: "NRG Stadium", division: "AFC South" },
    { id: "IND", city: "Indianapolis", name: "Colts", abbreviation: "IND", color: "#3b82f6", secondaryColor: "#002C5F", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png", stadium: "Lucas Oil Stadium", division: "AFC South" },
    { id: "JAX", city: "Jacksonville", name: "Jaguars", abbreviation: "JAX", color: "#14b8a6", secondaryColor: "#006778", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png", stadium: "EverBank Stadium", division: "AFC South" },
    { id: "TEN", city: "Tennessee", name: "Titans", abbreviation: "TEN", color: "#38bdf8", secondaryColor: "#0C2340", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png", stadium: "Nissan Stadium", division: "AFC South" },

    // AFC East
    { id: "BUF", city: "Buffalo", name: "Bills", abbreviation: "BUF", color: "#3b82f6", secondaryColor: "#00338D", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png", stadium: "Highmark Stadium", division: "AFC East" },
    { id: "MIA", city: "Miami", name: "Dolphins", abbreviation: "MIA", color: "#14b8a6", secondaryColor: "#008E97", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png", stadium: "Hard Rock Stadium", division: "AFC East" },
    { id: "NE", city: "New England", name: "Patriots", abbreviation: "NE", color: "#ef4444", secondaryColor: "#002244", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png", stadium: "Gillette Stadium", division: "AFC East" },
    { id: "NYJ", city: "New York", name: "Jets", abbreviation: "NYJ", color: "#22c55e", secondaryColor: "#125740", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png", stadium: "MetLife Stadium", division: "AFC East" },

    // NFC South
    { id: "ATL", city: "Atlanta", name: "Falcons", abbreviation: "ATL", color: "#ef4444", secondaryColor: "#A71930", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png", stadium: "Mercedes-Benz Stadium", division: "NFC South" },
    { id: "CAR", city: "Carolina", name: "Panthers", abbreviation: "CAR", color: "#38bdf8", secondaryColor: "#0085CA", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png", stadium: "Bank of America Stadium", division: "NFC South" },
    { id: "NO", city: "New Orleans", name: "Saints", abbreviation: "NO", color: "#eab308", secondaryColor: "#D3BC8D", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/no.png", stadium: "Caesars Superdome", division: "NFC South" },
    { id: "TB", city: "Tampa Bay", name: "Buccaneers", abbreviation: "TB", color: "#ef4444", secondaryColor: "#D50A0A", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png", stadium: "Raymond James Stadium", division: "NFC South" }
  ];

  function createEmptyFantasy(label = 'Loading...', sub = 'Syncing ESPN box score...') {
    return {
      totalPoints: 0,
      hasStats: false,
      qb: { player: label, stats: sub, points: 0 },
      rec: { player: label, stats: sub, points: 0 },
      rush: { player: label, stats: sub, points: 0 },
      def: { player: label, stats: sub, points: 0 },
      st: { player: label, stats: sub, points: 0 }
    };
  }

  function createInitialRoster() {
    const members = [
      {
        id: "char_andrea",
        name: "Andrea",
        teamId: "GB",
        teamName: "PACKERS",
        division: "NFC North",
        frameClass: "frame-andrea",
        nameClass: "name-andrea",
        image: "assets/avatars/Andrea football.jpg",
        bannerGif: "assets/Andrea football banner.gif",
        color: "#facc15",
        badgeTag: "🧀 Lambeau Scout"
      },
      {
        id: "char_cj",
        name: "CJ",
        teamId: "CHI",
        teamName: "BEARS",
        division: "NFC North",
        frameClass: "frame-cj",
        nameClass: "name-cj",
        image: "assets/avatars/CJ football.jpg",
        bannerGif: "assets/CJ football banner.gif",
        color: "#f87171",
        badgeTag: "🐻 Bear Down"
      },
      {
        id: "char_mario",
        name: "Mario",
        teamId: "CLE",
        teamName: "BROWNS",
        division: "AFC North",
        frameClass: "frame-mario",
        nameClass: "name-mario",
        image: "assets/avatars/Mario football.jpg",
        bannerGif: "assets/Mario football banner.gif",
        color: "#fb923c",
        badgeTag: "🐶 Dawg Pound"
      },
      {
        id: "char_nicole",
        name: "Nicole",
        teamId: "LV",
        teamName: "RAIDERS",
        division: "AFC West",
        frameClass: "frame-nicole",
        nameClass: "name-nicole",
        image: "assets/avatars/Nicole football.jpg",
        bannerGif: "assets/Nicole football banner.gif",
        color: "#38bdf8",
        badgeTag: "☠️ Raider Nation"
      },
      {
        id: "char_saul",
        name: "Saul",
        teamId: "SF",
        teamName: "49ERS",
        division: "NFC West",
        frameClass: "frame-saul",
        nameClass: "name-saul",
        image: "assets/avatars/Saul football.jpg",
        bannerGif: "assets/Saul football banner.gif",
        color: "#fb7185",
        badgeTag: "⛏️ Faithful 49ers"
      },
      {
        id: "char_cardinals",
        name: "Arizona Cardinals Flag",
        shortName: "Cardinals Flag",
        teamId: "ARI",
        teamName: "CARDINALS",
        division: "NFC West",
        frameClass: "frame-cardinals",
        nameClass: "name-cardinals",
        image: "assets/Arizona_Cardinals_flag.gif",
        bannerGif: "assets/Arizona_Cardinals_flag.gif",
        color: "#f43f5e",
        badgeTag: "🚩 Desert Flag"
      },
      {
        id: "char_mariah",
        name: "Mariah",
        teamId: "PHI",
        teamName: "EAGLES",
        division: "NFC East",
        frameClass: "frame-mariah",
        nameClass: "name-mariah",
        image: "assets/avatars/Mariah football.jpg",
        bannerGif: "assets/Mariah football banner.mp4",
        color: "#2dd4bf",
        badgeTag: "🦅 Midnight Green"
      }
    ];

    return members.map(m => ({
      ...m,
      picks: { record: "--", pct: "--", streak: "--", wins: 0, losses: 0, ties: 0, winPercent: 0 },
      trophy: { count: 0, label: "SYNCING LIVE NFL DATA..." },
      fantasy: createEmptyFantasy(),
      matchup: {
        eventId: null,
        isBye: false,
        away: { code: "--", name: "TBD", rec: "--", score: "-" },
        home: { code: m.teamId, name: m.teamName, rec: "--", score: "-" },
        status: "Loading live ESPN schedule...",
        state: "pre",
        isLive: false,
        venue: "NFL Stadium",
        awayStarter: "--",
        homeStarter: "--"
      },
      schedule: [],
      divisionTitle: `${m.division.toUpperCase()} STANDINGS`,
      standings: [],
      liveStats: {
        yards: 0,
        tds: 0,
        sacks: 0,
        fieldGoals: 0,
        longFG: 0,
        pointsScored: 0,
        pointsAllowed: 0,
        won: false,
        hasPlayed: false,
        isBye: false,
        status: "Loading..."
      }
    }));
  }

  // Evergreen rivalry lore templates (no hardcoded player names or outdated seasons)
  const LORE_DATABASE = [
    {
      title: "The Office Gridiron Showdown",
      surface: "Championship Turf",
      lore: "Two office heavyweights go head-to-head with real weekly NFL team performance deciding every single point on the board.",
      smack1: "Our squad is dialed in this week—check the scoreboard when the clock hits zero!",
      smack2: "Talk is cheap! Let the real NFL box scores settle this one on Sunday!"
    },
    {
      title: "Watercooler Rivalry Clash",
      surface: "Stadium Grass",
      lore: "Bragging rights across the entire office hallway are on the line as automated QB, WR, RB, DEF, and Special Teams stats decide the winner.",
      smack1: "We're putting up points on both sides of the ball this week!",
      smack2: "Our defense and playmakers are ready to steal the crown!"
    },
    {
      title: "Primetime Office Spotlight",
      surface: "Under the Floodlights",
      lore: "Big plays, red-zone touchdowns, and clutch kicks fuel this weekly matchup—powered 100% by real-time ESPN game telemetry.",
      smack1: "Look at the live numbers—this matchup is already trending our way!",
      smack2: "Never count us out until the final whistle blows!"
    },
    {
      title: "Division Bragging Rights Battle",
      surface: "Outdoor Stadium Field",
      lore: "Every yard, sack, and field goal counts in this heated head-to-head duel for weekly Office Endzone supremacy.",
      smack1: "We came to dominate the trenches and light up the fantasy leaderboard!",
      smack2: "Bring your best game—our roster is built for clutch performances!"
    },
    {
      title: "Sunday Slate Slugfest",
      surface: "Pro Gridiron Surface",
      lore: "High-stakes weekly action where official NFL box scores automatically tally every passing yard, catch, rush, sack, and kick.",
      smack1: "Our offense is rolling and the numbers don't lie!",
      smack2: "Wait until our second-half surge flips the leaderboard!"
    }
  ];

  // =========================================================================
  // ESPN BOX SCORE & FANTASY PARSING HELPERS
  // =========================================================================

  function parseNumeric(val) {
    if (val === null || val === undefined || val === '') return 0;
    const n = parseFloat(String(val).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function parseMadeAttempt(str) {
    if (!str) return { made: 0, att: 0 };
    const parts = String(str).split(/[\/\-]/);
    return {
      made: parseInt(parts[0], 10) || 0,
      att: parseInt(parts[1], 10) || 0
    };
  }

  function getStatByKey(group, athlete, keyName) {
    if (!group || !athlete || !Array.isArray(group.keys) || !Array.isArray(athlete.stats)) return '';
    const idx = group.keys.indexOf(keyName);
    if (idx === -1) return '';
    return athlete.stats[idx] ?? '';
  }

  function getTeamBoxStat(teamBox, statName) {
    if (!teamBox || !Array.isArray(teamBox.statistics)) return '';
    const item = teamBox.statistics.find(s => s.name === statName);
    return item ? item.displayValue : '';
  }

  function calcDefensePointsAllowedBonus(pointsAllowed) {
    if (pointsAllowed === 0) return 10;
    if (pointsAllowed <= 6) return 7;
    if (pointsAllowed <= 13) return 4;
    if (pointsAllowed <= 20) return 1;
    if (pointsAllowed <= 27) return 0;
    if (pointsAllowed <= 34) return -1;
    return -4;
  }

  /**
   * Computes real NFL box score metrics and automated 5-category Fantasy Points
   * directly from an official ESPN /summary?event={id} response.
   */
  function extractTeamStatsAndFantasy(summary, teamAbbr) {
    const normAbbr = normalizeAbbr(teamAbbr);
    const comp = summary?.header?.competitions?.[0];
    if (!comp) return null;

    const competitors = comp.competitors || [];
    const teamComp = competitors.find(c => normalizeAbbr(c.team?.abbreviation) === normAbbr);
    const oppComp = competitors.find(c => normalizeAbbr(c.team?.abbreviation) !== normAbbr);
    if (!teamComp) return null;

    const state = comp.status?.type?.state || 'pre';
    const completed = !!comp.status?.type?.completed;
    const pointsScored = parseInt(teamComp.score || 0, 10);
    const pointsAllowed = parseInt(oppComp?.score || 0, 10);
    const teamDisplayName = teamComp.team?.name || teamComp.team?.displayName || normAbbr;

    if (state === 'pre') {
      const kick = formatArizonaDayTime(comp.date);
      return {
        state: 'pre',
        completed: false,
        won: false,
        pointsScored: 0,
        pointsAllowed: 0,
        totalYards: 0,
        totalTDs: 0,
        sacks: 0,
        fieldGoals: 0,
        longFG: 0,
        qbName: 'TBD (Pregame)',
        fantasy: createEmptyFantasy('Pregame', `Kickoff: ${kick}`)
      };
    }

    const boxTeams = summary?.boxscore?.teams || [];
    const teamBox = boxTeams.find(t => normalizeAbbr(t.team?.abbreviation) === normAbbr);
    const oppBox = boxTeams.find(t => normalizeAbbr(t.team?.abbreviation) !== normAbbr);

    const boxPlayers = summary?.boxscore?.players || [];
    const teamPlayerBlock = boxPlayers.find(p => normalizeAbbr(p.team?.abbreviation) === normAbbr);
    const groups = teamPlayerBlock?.statistics || [];
    const findGroup = (name) => groups.find(g => g.name === name);

    // 1. QB (Passing + that QB's rushing)
    const passGroup = findGroup('passing');
    const rushGroup = findGroup('rushing');
    const recGroup = findGroup('receiving');
    const defGroup = findGroup('defensive');
    const intGroup = findGroup('interceptions');
    const kickGroup = findGroup('kicking');
    const krGroup = findGroup('kickReturns');
    const prGroup = findGroup('puntReturns');

    let qbObj = { player: `${teamDisplayName} QB`, stats: 'No passing stats yet', points: 0 };
    let qbId = null;
    let qbDisplayName = null;
    let totalPassTDs = 0;

    if (passGroup && passGroup.athletes && passGroup.athletes.length > 0) {
      let bestQb = null;
      let bestQbScore = -999;

      passGroup.athletes.forEach(ath => {
        const pYds = parseNumeric(getStatByKey(passGroup, ath, 'passingYards'));
        const pTds = parseNumeric(getStatByKey(passGroup, ath, 'passingTouchdowns'));
        const pInt = parseNumeric(getStatByKey(passGroup, ath, 'interceptions'));
        totalPassTDs += pTds;

        let rYds = 0, rTds = 0;
        if (rushGroup?.athletes) {
          const rMatch = rushGroup.athletes.find(ra => ra.athlete?.id === ath.athlete?.id);
          if (rMatch) {
            rYds = parseNumeric(getStatByKey(rushGroup, rMatch, 'rushingYards'));
            rTds = parseNumeric(getStatByKey(rushGroup, rMatch, 'rushingTouchdowns'));
          }
        }

        const pts = (pYds * 0.04) + (pTds * 4) - (pInt * 2) + (rYds * 0.1) + (rTds * 6);
        const rankMetric = pYds + (pTds * 40);
        if (!bestQb || rankMetric > bestQbScore) {
          bestQbScore = rankMetric;
          bestQb = { ath, pYds, pTds, pInt, rYds, rTds, pts };
        }
      });

      if (bestQb) {
        qbId = bestQb.ath.athlete?.id;
        qbDisplayName = bestQb.ath.athlete?.displayName || `${teamDisplayName} QB`;
        const parts = [`${bestQb.pYds} Pass Yds`, `${bestQb.pTds} TD`];
        if (bestQb.pInt > 0) parts.push(`${bestQb.pInt} INT`);
        if (bestQb.rYds !== 0 || bestQb.rTds > 0) {
          parts.push(`${bestQb.rYds} Rush Yds${bestQb.rTds > 0 ? `, ${bestQb.rTds} Rush TD` : ''}`);
        }
        qbObj = {
          player: `${qbDisplayName} (QB)`,
          stats: parts.join(', '),
          points: Math.round(bestQb.pts * 10) / 10
        };
      }
    }

    // 2. Top Receiver (WR/TE/RB in receiving, 1.0 PPR + 0.1/yd + 6/TD)
    let recObj = { player: `${teamDisplayName} Top Receiver`, stats: 'No receiving stats yet', points: 0 };
    if (recGroup && recGroup.athletes && recGroup.athletes.length > 0) {
      let bestRec = null;
      recGroup.athletes.forEach(ath => {
        const catches = parseNumeric(getStatByKey(recGroup, ath, 'receptions'));
        const yds = parseNumeric(getStatByKey(recGroup, ath, 'receivingYards'));
        const tds = parseNumeric(getStatByKey(recGroup, ath, 'receivingTouchdowns'));
        const pts = (catches * 1.0) + (yds * 0.1) + (tds * 6);
        if (!bestRec || pts > bestRec.pts) {
          bestRec = { ath, catches, yds, tds, pts };
        }
      });
      if (bestRec) {
        const name = bestRec.ath.athlete?.displayName || 'Top Receiver';
        recObj = {
          player: `${name} (REC)`,
          stats: `${bestRec.catches} Rec, ${bestRec.yds} Yds, ${bestRec.tds} TD`,
          points: Math.round(bestRec.pts * 10) / 10
        };
      }
    }

    // 3. Top Rusher (RB/Offense, prefer non-QB if available; 0.1/yd + 6/TD)
    let rushObj = { player: `${teamDisplayName} Top Rusher`, stats: 'No rushing stats yet', points: 0 };
    let totalRushTDs = 0;
    if (rushGroup && rushGroup.athletes && rushGroup.athletes.length > 0) {
      let bestRush = null;
      const nonQbRushers = rushGroup.athletes.filter(a => a.athlete?.id !== qbId);
      const pool = nonQbRushers.length > 0 ? nonQbRushers : rushGroup.athletes;

      rushGroup.athletes.forEach(ath => {
        totalRushTDs += parseNumeric(getStatByKey(rushGroup, ath, 'rushingTouchdowns'));
      });

      pool.forEach(ath => {
        const car = parseNumeric(getStatByKey(rushGroup, ath, 'rushingAttempts'));
        const yds = parseNumeric(getStatByKey(rushGroup, ath, 'rushingYards'));
        const tds = parseNumeric(getStatByKey(rushGroup, ath, 'rushingTouchdowns'));
        const pts = (yds * 0.1) + (tds * 6);
        if (!bestRush || pts > bestRush.pts) {
          bestRush = { ath, car, yds, tds, pts };
        }
      });
      if (bestRush) {
        const name = bestRush.ath.athlete?.displayName || 'Top Rusher';
        rushObj = {
          player: `${name} (RB)`,
          stats: `${bestRush.car} Car, ${bestRush.yds} Rush Yds, ${bestRush.tds} TD`,
          points: Math.round(bestRush.pts * 10) / 10
        };
      }
    }

    // 4. Team Defense (Sacks +1, Takeaways +2, Def TD +6, PA Bonus)
    let sacks = 0;
    let defTDs = 0;
    if (defGroup && defGroup.athletes) {
      defGroup.athletes.forEach(ath => {
        sacks += parseNumeric(getStatByKey(defGroup, ath, 'sacks'));
        defTDs += parseNumeric(getStatByKey(defGroup, ath, 'defensiveTouchdowns'));
      });
    }
    // Fallback sacks from opponent sacksYardsLost if defensive player table is empty
    if (sacks === 0 && oppBox) {
      const oppSacked = parseMadeAttempt(getTeamBoxStat(oppBox, 'sacksYardsLost'));
      sacks = oppSacked.made;
    }

    let ints = 0;
    if (intGroup && intGroup.athletes) {
      intGroup.athletes.forEach(ath => {
        ints += parseNumeric(getStatByKey(intGroup, ath, 'interceptions'));
      });
    }
    const oppTurnovers = parseNumeric(getTeamBoxStat(oppBox, 'turnovers'));
    const oppFumblesLost = parseNumeric(getTeamBoxStat(oppBox, 'fumblesLost'));
    const oppInts = parseNumeric(getTeamBoxStat(oppBox, 'interceptions'));
    const totalTakeaways = Math.max(oppTurnovers, ints + oppFumblesLost, oppInts + oppFumblesLost);
    const paBonus = calcDefensePointsAllowedBonus(pointsAllowed);
    const defPts = (sacks * 1.0) + (totalTakeaways * 2.0) + (defTDs * 6.0) + paBonus;

    const defStatParts = [`${sacks} Sacks`, `${totalTakeaways} TO`];
    if (defTDs > 0) defStatParts.push(`${defTDs} Def TD`);
    defStatParts.push(`${pointsAllowed} PA`);

    const defObj = {
      player: `${teamDisplayName} Defense (DEF)`,
      stats: defStatParts.join(', '),
      points: Math.round(defPts * 10) / 10
    };

    // 5. Special Teams (Kicking FGs +3/+4 for 50+, XPs +1, Return TDs +6)
    let fgMade = 0, fgAtt = 0, xpMade = 0, xpAtt = 0, longFG = 0, retTDs = 0;
    let kickerName = `${teamDisplayName} Special Teams`;
    if (kickGroup && kickGroup.athletes && kickGroup.athletes.length > 0) {
      const k = kickGroup.athletes[0];
      kickerName = `${k.athlete?.displayName || 'Kicker'} (K/ST)`;
      kickGroup.athletes.forEach(ath => {
        const fg = parseMadeAttempt(getStatByKey(kickGroup, ath, 'fieldGoalsMade/fieldGoalAttempts'));
        const xp = parseMadeAttempt(getStatByKey(kickGroup, ath, 'extraPointsMade/extraPointAttempts'));
        const lg = parseNumeric(getStatByKey(kickGroup, ath, 'longFieldGoalMade'));
        fgMade += fg.made;
        fgAtt += fg.att;
        xpMade += xp.made;
        xpAtt += xp.att;
        if (lg > longFG) longFG = lg;
      });
    }
    if (krGroup?.athletes) {
      krGroup.athletes.forEach(ath => { retTDs += parseNumeric(getStatByKey(krGroup, ath, 'kickReturnTouchdowns')); });
    }
    if (prGroup?.athletes) {
      prGroup.athletes.forEach(ath => { retTDs += parseNumeric(getStatByKey(prGroup, ath, 'puntReturnTouchdowns')); });
    }

    const longBonus = (fgMade > 0 && longFG >= 50) ? 1.0 : 0;
    const stPts = (fgMade * 3.0) + longBonus + (xpMade * 1.0) + (retTDs * 6.0);
    const stStatParts = [`${fgMade}/${fgAtt} FG`, `${xpMade}/${xpAtt} XP`];
    if (longFG > 0) stStatParts.push(`Long ${longFG}y`);
    if (retTDs > 0) stStatParts.push(`${retTDs} Ret TD`);

    const stObj = {
      player: kickerName,
      stats: stStatParts.join(', '),
      points: Math.round(stPts * 10) / 10
    };

    const totalPoints = Math.round((qbObj.points + recObj.points + rushObj.points + defObj.points + stObj.points) * 10) / 10;
    const totalYards = parseNumeric(getTeamBoxStat(teamBox, 'totalYards'));
    const totalTDs = totalPassTDs + totalRushTDs + defTDs + retTDs;

    return {
      state,
      completed,
      won: completed && pointsScored > pointsAllowed,
      pointsScored,
      pointsAllowed,
      totalYards,
      totalTDs,
      sacks,
      fieldGoals: fgMade,
      longFG,
      qbName: qbDisplayName || `${teamDisplayName} QB`,
      fantasy: {
        totalPoints,
        hasStats: true,
        qb: qbObj,
        rec: recObj,
        rush: rushObj,
        def: defObj,
        st: stObj
      }
    };
  }

  // =========================================================================
  // 2. MAIN APPLICATION CLASS
  // =========================================================================

  class DugoutEndzoneApp {
    constructor() {
      this.teams = TEAMS;
      this.roster = createInitialRoster();

      // Live ESPN Season & Week State
      this.currentSeason = new Date().getFullYear();
      this.currentSeasonType = 2; // 1=Pre, 2=Reg, 3=Post
      this.currentWeek = 1;
      this.prevWeekNumber = 1;
      this.hasInitializedWeekSelection = false;
      this.hasLoadedSchedules = false;

      // Live Data Stores
      this.currentWeekGames = [];
      this.lastWeekGames = [];
      this.standingsByDivision = {};
      this.standingsByTeam = {};
      this.divisionLastPlace = {};
      this.nflLastPlaceTeam = null;
      this.summaryCache = {}; // eventId -> { data, fetchedAt, isFinal }
      this.weekScoreboardCache = {}; // weekNum -> { events, scoresByTeam }
      this.weeklyBracketData = null;

      // UI State
      this.currentTickerMode = 'TODAY'; // TODAY (Current Week) | YESTERDAY (Last Week)
      this.activeDrawer = null; // null | 'FANTASY' | 'BRACKETS' | 'CHALLENGES' | 'STANDINGS'
      this.selectedMember = null;
      this.isGifActive = false;
      this.activeBracketTab = 'WEEKLY'; // WEEKLY | SEASON
      this.selectedWeekIndex = 0;
      this.selectedContenderFilter = 'ALL';
      this.selectedDayFilter = 'ALL';
      this.userPicks = JSON.parse(localStorage.getItem('office_endzone_picks') || '{}');
      this.seasonPicks = JSON.parse(localStorage.getItem('office_endzone_season_picks') || '{}');

      // Team abbreviation to Office Staff Member ID Map
      this.teamToMemberMap = {
        'GB': 'char_andrea',
        'CHI': 'char_cj',
        'CLE': 'char_mario',
        'LV': 'char_nicole',
        'SF': 'char_saul',
        'ARI': 'char_cardinals',
        'PHI': 'char_mariah'
      };

      // DOM Elements (including fixed fantasy-*-name IDs!)
      this.dom = {
        mstClock: document.getElementById('current-mst-clock'),
        tabTodayTicker: document.getElementById('tab-today-ticker'),
        tabYesterdayTicker: document.getElementById('tab-yesterday-ticker'),
        tickerGrid: document.getElementById('ticker-grid'),
        rosterGrid: document.getElementById('roster-grid'),

        // Member Modal elements
        modalOverlay: document.getElementById('member-modal-overlay'),
        modalContent: document.getElementById('member-modal-content'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalAvatarCard: document.getElementById('modal-avatar-card'),
        modalAvatarImg: document.getElementById('modal-avatar-img'),
        modalAvatarVideo: document.getElementById('modal-avatar-video'),
        modalGifToggle: document.getElementById('modal-gif-toggle'),
        photoBadgeText: document.getElementById('photo-badge-text'),
        modalMemberName: document.getElementById('modal-member-name'),
        modalTeamLogo: document.getElementById('modal-team-logo'),
        modalTeamName: document.getElementById('modal-team-name'),
        picksRecord: document.getElementById('picks-record'),
        picksPct: document.getElementById('picks-pct'),
        picksStreak: document.getElementById('picks-streak'),
        trophyCount: document.getElementById('trophy-count'),
        trophyLabel: document.getElementById('trophy-label'),
        matchupSectionTitle: document.getElementById('matchup-section-title'),
        todayMatchupCard: document.getElementById('today-matchup-card'),
        matchupLiveTag: document.getElementById('matchup-live-tag'),
        matchupAwayCode: document.getElementById('matchup-away-code'),
        matchupAwayRec: document.getElementById('matchup-away-rec'),
        matchupAwayScore: document.getElementById('matchup-away-score'),
        matchupHomeCode: document.getElementById('matchup-home-code'),
        matchupHomeRec: document.getElementById('matchup-home-rec'),
        matchupHomeScore: document.getElementById('matchup-home-score'),
        matchupClockStatus: document.getElementById('matchup-clock-status'),
        matchupVenue: document.getElementById('matchup-venue'),
        starterAway: document.getElementById('starter-away'),
        starterHome: document.getElementById('starter-home'),
        scheduleList: document.getElementById('schedule-list'),
        standingsDivisionTitle: document.getElementById('standings-division-title'),
        divisionStandingsTbody: document.getElementById('division-standings-tbody'),
        dailyLeadersTbody: document.getElementById('daily-leaders-tbody'),
        leaderTableTitle: document.getElementById('leader-table-title'),
        btnOpenBoxScore: document.getElementById('btn-open-box-score'),

        // Showdown Reveal Modal elements
        showdownModalOverlay: document.getElementById('showdown-modal-overlay'),
        showdownModalContent: document.getElementById('showdown-modal-content'),
        showdownModalClose: document.getElementById('showdown-modal-close'),

        // Box Score Modal elements
        boxScoreModalOverlay: document.getElementById('box-score-modal-overlay'),
        boxScoreModalContent: document.getElementById('box-score-modal-content'),
        boxScoreModalClose: document.getElementById('box-score-modal-close'),
        boxScoreBadgeStatus: document.getElementById('box-score-badge-status'),
        boxScoreVenueTime: document.getElementById('box-score-venue-time'),

        // Top actions
        btnYesterdayModal: document.getElementById('btn-yesterday-modal-toggle'),
        btnSignIn: document.getElementById('btn-signin'),

        // Quick Nav & Drawer
        btnNavRoster: document.getElementById('btn-nav-roster'),
        btnNavFantasy: document.getElementById('btn-nav-fantasy'),
        btnNavBracket: document.getElementById('btn-nav-bracket'),
        btnNavChallenges: document.getElementById('btn-nav-challenges'),
        btnNavStandings: document.getElementById('btn-nav-standings'),
        secondaryDrawer: document.getElementById('secondary-drawer'),
        drawerTitle: document.getElementById('drawer-title'),
        drawerBody: document.getElementById('drawer-body'),
        btnCloseDrawer: document.getElementById('btn-close-drawer'),

        // Fantasy Category Elements in Modal (matched to index.html IDs!)
        fantasyHeaderTotalBadge: document.getElementById('fantasy-header-total-badge'),
        fantasyTotalLabel: document.getElementById('fantasy-total-label'),
        fantasyTotalVal: document.getElementById('fantasy-total-val'),
        fantasyQbName: document.getElementById('fantasy-qb-name'),
        fantasyQbStats: document.getElementById('fantasy-qb-stats'),
        fantasyQbPts: document.getElementById('fantasy-qb-pts'),
        fantasyRecName: document.getElementById('fantasy-rec-name'),
        fantasyRecStats: document.getElementById('fantasy-rec-stats'),
        fantasyRecPts: document.getElementById('fantasy-rec-pts'),
        fantasyRushName: document.getElementById('fantasy-rush-name'),
        fantasyRushStats: document.getElementById('fantasy-rush-stats'),
        fantasyRushPts: document.getElementById('fantasy-rush-pts'),
        fantasyDefName: document.getElementById('fantasy-def-name'),
        fantasyDefStats: document.getElementById('fantasy-def-stats'),
        fantasyDefPts: document.getElementById('fantasy-def-pts'),
        fantasyStName: document.getElementById('fantasy-st-name'),
        fantasyStStats: document.getElementById('fantasy-st-stats'),
        fantasyStPts: document.getElementById('fantasy-st-pts')
      };
    }

    getSeasonTypeLabel() {
      if (this.currentSeasonType === 1) return 'Preseason';
      if (this.currentSeasonType === 3) return 'Postseason';
      return 'Regular Season';
    }

    getTeamMeta(abbr) {
      const norm = normalizeAbbr(abbr);
      return this.teams.find(t => t.abbreviation === norm || t.id === norm) || {
        id: norm,
        city: norm,
        name: norm,
        abbreviation: norm,
        color: '#38bdf8',
        secondaryColor: '#0b1322',
        logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${norm.toLowerCase()}.png`,
        stadium: 'NFL Stadium',
        division: 'NFL'
      };
    }

    init() {
      this.startClock();
      this.renderRosterGrid();
      this.bindEvents();
      this.fetchLiveEspnFeed();
      setInterval(() => this.fetchLiveEspnFeed(), 45000);
    }

    startClock() {
      const update = () => {
        if (this.dom.mstClock) {
          this.dom.mstClock.textContent = getArizonaClockString();
        }
      };
      update();
      setInterval(update, 1000);
    }

    // =========================================================================
    // LIVE ESPN DATA SYNC ENGINE
    // =========================================================================

    parseScoreboardEvents(events) {
      return (events || []).map(ev => {
        const comp = ev.competitions?.[0] || {};
        const competitors = comp.competitors || [];
        const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {};
        const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {};
        const state = ev.status?.type?.state || 'pre';
        const completed = !!ev.status?.type?.completed;
        const awayAbbr = normalizeAbbr(away.team?.abbreviation);
        const homeAbbr = normalizeAbbr(home.team?.abbreviation);

        let statusText = formatArizonaDayTime(ev.date);
        if (completed) {
          statusText = ev.status?.type?.shortDetail || 'FINAL';
        } else if (state === 'in') {
          statusText = `${ev.status?.type?.shortDetail || 'LIVE'} • ${formatArizonaTime(ev.date)}`;
        }

        const isOfficeGame = !!(this.teamToMemberMap[awayAbbr] || this.teamToMemberMap[homeAbbr]);

        return {
          eventId: ev.id,
          date: ev.date,
          away: awayAbbr,
          awayName: away.team?.name || away.team?.shortDisplayName || awayAbbr,
          awayRec: away.records?.[0]?.summary || '',
          awayScore: state === 'pre' ? '-' : String(away.score ?? '0'),
          home: homeAbbr,
          homeName: home.team?.name || home.team?.shortDisplayName || homeAbbr,
          homeRec: home.records?.[0]?.summary || '',
          homeScore: state === 'pre' ? '-' : String(home.score ?? '0'),
          status: statusText,
          state,
          completed,
          isLive: state === 'in',
          isOfficeGame,
          venue: comp.venue?.fullName || this.getTeamMeta(homeAbbr).stadium || 'NFL Stadium',
          broadcast: comp.broadcasts?.[0]?.names?.[0] || '',
          odds: comp.odds?.[0]?.details || '',
          leaders: comp.leaders || [],
          rawEvent: ev
        };
      }).sort((a, b) => {
        // Put office games first, then live games, then chronological
        if (a.isOfficeGame !== b.isOfficeGame) return a.isOfficeGame ? -1 : 1;
        if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
        return new Date(a.date) - new Date(b.date);
      });
    }

    async fetchGameSummary(eventId, forceRefresh = false) {
      if (!eventId) return null;
      const cached = this.summaryCache[eventId];
      if (cached && !forceRefresh) {
        if (cached.isFinal || (Date.now() - cached.fetchedAt < 35000)) {
          return cached.data;
        }
      }
      try {
        const res = await fetch(`${ESPN_BASE}/summary?event=${eventId}`, { cache: 'no-cache' });
        if (!res.ok) return cached?.data || null;
        const data = await res.json();
        const isFinal = !!data?.header?.competitions?.[0]?.status?.type?.completed;
        this.summaryCache[eventId] = { data, fetchedAt: Date.now(), isFinal };
        return data;
      } catch (e) {
        return cached?.data || null;
      }
    }

    async fetchStandings() {
      try {
        const res = await fetch(ESPN_STANDINGS_URL, { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();

        const byDiv = {};
        const byTeam = {};
        const allTeams = [];

        (data.children || []).forEach(conf => {
          (conf.children || []).forEach(div => {
            const divName = div.name || 'Division';
            const entries = (div.standings?.entries || []).map(entry => {
              const abbr = normalizeAbbr(entry.team?.abbreviation);
              const statMap = {};
              (entry.stats || []).forEach(s => {
                statMap[s.name] = s;
              });

              const wins = parseInt(statMap.wins?.value ?? 0, 10);
              const losses = parseInt(statMap.losses?.value ?? 0, 10);
              const ties = parseInt(statMap.ties?.value ?? 0, 10);
              const winPercent = parseFloat(statMap.winPercent?.value ?? 0);
              const pctDisplay = statMap.winPercent?.displayValue || formatRecordPct(wins, losses, ties);
              const gb = statMap.gamesBehind?.displayValue || '—';
              const streak = statMap.streak?.displayValue || '--';
              const overall = statMap.overall?.displayValue || (ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`);
              const pointDiff = parseFloat(statMap.pointDifferential?.value ?? statMap.differential?.value ?? 0);

              const rec = {
                abbr,
                team: entry.team?.name || entry.team?.shortDisplayName || abbr,
                displayName: entry.team?.displayName || abbr,
                logo: entry.team?.logos?.[0]?.href || this.getTeamMeta(abbr).logo,
                division: divName,
                w: wins,
                l: losses,
                t: ties,
                overall,
                winPercent,
                pct: pctDisplay,
                gb: (gb === '-' || gb === '0' || gb === '0.0') ? '—' : gb,
                streak,
                pointDiff
              };
              byTeam[abbr] = rec;
              allTeams.push(rec);
              return rec;
            });

            // Sort each division properly by winPercent desc, wins desc, pointDiff desc
            entries.sort((a, b) => {
              if (b.winPercent !== a.winPercent) return b.winPercent - a.winPercent;
              if (b.w !== a.w) return b.w - a.w;
              return b.pointDiff - a.pointDiff;
            });

            byDiv[divName] = entries;
            if (entries.length > 0) {
              this.divisionLastPlace[divName] = entries[entries.length - 1];
            }
          });
        });

        // Determine actual NFL #32 Last-Place team across all 32 teams
        if (allTeams.length > 0) {
          const sortedWorst = [...allTeams].sort((a, b) => {
            if (a.winPercent !== b.winPercent) return a.winPercent - b.winPercent;
            if (a.w !== b.w) return a.w - b.w;
            return a.pointDiff - b.pointDiff;
          });
          this.nflLastPlaceTeam = sortedWorst[0];
        }

        this.standingsByDivision = byDiv;
        this.standingsByTeam = byTeam;

        // Hydrate every office member's record, streak, and real division standings
        this.roster.forEach(member => {
          const st = byTeam[member.teamId];
          if (st) {
            member.picks = {
              record: st.overall,
              pct: st.pct,
              streak: st.streak,
              wins: st.w,
              losses: st.l,
              ties: st.t,
              winPercent: st.winPercent
            };
            member.division = st.division;
            member.divisionTitle = `${st.division.toUpperCase()} STANDINGS`;
            const divEntries = byDiv[st.division] || [];
            member.standings = divEntries.map(row => ({
              team: row.team,
              abbr: row.abbr,
              w: row.w,
              l: row.l,
              t: row.t,
              pct: row.pct,
              gb: row.gb,
              highlight: row.abbr === member.teamId
            }));
          }
        });
      } catch (e) {
        console.warn('Could not load ESPN standings:', e);
      }
    }

    async fetchAllTeamSchedules() {
      if (this.hasLoadedSchedules) return;
      this.hasLoadedSchedules = true;

      await Promise.all(this.roster.map(async member => {
        try {
          const res = await fetch(`${ESPN_BASE}/teams/${member.teamId.toLowerCase()}/schedule`, { cache: 'no-cache' });
          if (!res.ok) return;
          const data = await res.json();
          const events = data.events || [];

          const upcoming = [];
          events.forEach(ev => {
            const comp = ev.competitions?.[0];
            if (!comp) return;
            const state = comp.status?.type?.state || 'pre';
            if (state === 'post') return;

            const competitors = comp.competitors || [];
            const away = competitors.find(c => c.homeAway === 'away') || competitors[1];
            const home = competitors.find(c => c.homeAway === 'home') || competitors[0];
            if (!away || !home) return;

            const awayAbbr = normalizeAbbr(away.team?.abbreviation);
            const homeAbbr = normalizeAbbr(home.team?.abbreviation);
            const wkNum = ev.week?.number;
            const dateShort = formatArizonaShortDate(ev.date);

            upcoming.push({
              weekNumber: wkNum,
              date: wkNum ? `Wk ${wkNum} • ${dateShort}` : dateShort,
              away: awayAbbr,
              home: homeAbbr,
              time: formatArizonaTime(ev.date),
              isHome: homeAbbr === member.teamId,
              rawDate: ev.date
            });
          });

          member.schedule = upcoming.slice(0, 5);
        } catch (e) {
          console.warn(`Schedule fetch failed for ${member.teamId}:`, e);
        }
      }));
    }

    async fetchLiveEspnFeed() {
      try {
        // 1. Fetch Current Scoreboard
        const sbRes = await fetch(`${ESPN_BASE}/scoreboard`, { cache: 'no-cache' });
        if (!sbRes.ok) throw new Error(`ESPN scoreboard HTTP ${sbRes.status}`);
        const sbData = await sbRes.json();

        this.currentSeason = sbData.season?.year || new Date().getFullYear();
        this.currentSeasonType = sbData.season?.type || 2;
        this.currentWeek = sbData.week?.number || 1;
        this.prevWeekNumber = this.currentWeek > 1 ? this.currentWeek - 1 : 18;

        if (!this.hasInitializedWeekSelection) {
          const regWeek = this.currentSeasonType === 2 ? this.currentWeek : 18;
          this.selectedWeekIndex = Math.max(0, Math.min(17, regWeek - 1));
          this.hasInitializedWeekSelection = true;
        }

        // Update Ticker Tab Labels with real Week numbers
        if (this.dom.tabTodayTicker) {
          const wkPrefix = this.currentSeasonType === 1 ? 'PRE WK' : (this.currentSeasonType === 3 ? 'PLAYOFF WK' : 'WEEK');
          this.dom.tabTodayTicker.textContent = `${wkPrefix} ${this.currentWeek}`;
        }
        if (this.dom.tabYesterdayTicker) {
          this.dom.tabYesterdayTicker.textContent = this.currentWeek > 1
            ? `LAST WEEK (WK ${this.prevWeekNumber})`
            : 'LAST WEEK';
        }

        this.currentWeekGames = this.parseScoreboardEvents(sbData.events || []);
        this.weekScoreboardCache[this.currentWeek] = {
          games: this.currentWeekGames,
          fetchedAt: Date.now()
        };

        // Render ticker right away so user sees real scores immediately
        if (this.currentTickerMode === 'TODAY') {
          this.renderTicker();
        }

        // 2. Fetch Previous Week Scoreboard, Standings, and Schedules in parallel
        const prevType = (this.currentWeek === 1 && this.currentSeasonType === 3) ? 2 : this.currentSeasonType;
        const prevUrl = `${ESPN_BASE}/scoreboard?seasontype=${prevType}&week=${this.prevWeekNumber}`;

        const prevPromise = (this.currentWeek > 1 || this.currentSeasonType === 3)
          ? fetch(prevUrl, { cache: 'no-cache' })
              .then(r => r.ok ? r.json() : null)
              .then(d => {
                if (d?.events) {
                  this.lastWeekGames = this.parseScoreboardEvents(d.events);
                  this.weekScoreboardCache[this.prevWeekNumber] = {
                    games: this.lastWeekGames,
                    fetchedAt: Date.now()
                  };
                  if (this.currentTickerMode === 'YESTERDAY') {
                    this.renderTicker();
                  }
                }
              }).catch(() => {})
          : Promise.resolve();

        await Promise.all([
          prevPromise,
          this.fetchStandings(),
          this.fetchAllTeamSchedules()
        ]);

        // 3. Synchronize each Office Staff Member's current-week game & real ESPN summary/fantasy stats
        await Promise.all(this.roster.map(async member => {
          const game = this.currentWeekGames.find(g => g.away === member.teamId || g.home === member.teamId);

          if (!game) {
            // BYE WEEK!
            const nextGame = member.schedule[0];
            const nextLabel = nextGame
              ? `Next: ${nextGame.away} @ ${nextGame.home} (${nextGame.date})`
              : 'Season schedule syncing...';
            member.matchup = {
              eventId: null,
              isBye: true,
              away: { code: member.teamId, name: member.teamName, rec: member.picks.record, score: 'BYE' },
              home: { code: 'BYE', name: `Week ${this.currentWeek}`, rec: 'OFF', score: '--' },
              status: `BYE WEEK • ${this.currentSeason} WEEK ${this.currentWeek}`,
              state: 'bye',
              isLive: false,
              venue: nextLabel,
              awayStarter: 'Bye Week',
              homeStarter: 'Rest & Prep'
            };
            member.fantasy = createEmptyFantasy('BYE WEEK', `No game in Week ${this.currentWeek}`);
            member.liveStats = {
              yards: 0,
              tds: 0,
              sacks: 0,
              fieldGoals: 0,
              longFG: 0,
              pointsScored: 0,
              pointsAllowed: 0,
              won: false,
              hasPlayed: false,
              isBye: true,
              status: 'Bye Week'
            };
            return;
          }

          // Active week matchup exists!
          const awayMeta = this.getTeamMeta(game.away);
          const homeMeta = this.getTeamMeta(game.home);
          const awayRec = game.awayRec || this.standingsByTeam[game.away]?.overall || '--';
          const homeRec = game.homeRec || this.standingsByTeam[game.home]?.overall || '--';

          member.matchup = {
            eventId: game.eventId,
            isBye: false,
            away: { code: game.away, name: awayMeta.name, rec: awayRec, score: game.awayScore },
            home: { code: game.home, name: homeMeta.name, rec: homeRec, score: game.homeScore },
            status: game.status,
            state: game.state,
            isLive: game.isLive,
            venue: game.venue,
            awayStarter: game.state === 'pre' ? 'Scheduled' : 'Loading...',
            homeStarter: game.state === 'pre' ? 'Scheduled' : 'Loading...'
          };

          // Fetch real ESPN Summary for accurate Box Score + Automated Fantasy Points
          const summary = await this.fetchGameSummary(game.eventId);
          if (summary) {
            const memberStats = extractTeamStatsAndFantasy(summary, member.teamId);
            const awayStats = extractTeamStatsAndFantasy(summary, game.away);
            const homeStats = extractTeamStatsAndFantasy(summary, game.home);

            if (awayStats?.qbName) member.matchup.awayStarter = awayStats.qbName;
            if (homeStats?.qbName) member.matchup.homeStarter = homeStats.qbName;

            if (memberStats) {
              member.fantasy = memberStats.fantasy;
              member.liveStats = {
                yards: memberStats.totalYards,
                tds: memberStats.totalTDs,
                sacks: memberStats.sacks,
                fieldGoals: memberStats.fieldGoals,
                longFG: memberStats.longFG,
                pointsScored: memberStats.pointsScored,
                pointsAllowed: memberStats.pointsAllowed,
                won: memberStats.won,
                hasPlayed: memberStats.state !== 'pre',
                isBye: false,
                status: memberStats.state === 'in'
                  ? `Live (${game.status.split('•')[0].trim()})`
                  : (memberStats.completed ? (memberStats.won ? 'Final (W)' : 'Final (L)') : formatArizonaDayTime(game.date))
              };
            }
          }
        }));

        // 4. Calculate real Weekly Yards & Touchdowns Leader + Weekly Fantasy Leader
        let maxComposite = -1;
        let leaderMember = null;
        this.roster.forEach(m => {
          if (!m.liveStats.hasPlayed) return;
          const score = (m.liveStats.yards || 0) + ((m.liveStats.tds || 0) * 50);
          if (score > maxComposite) {
            maxComposite = score;
            leaderMember = m;
          }
        });

        this.roster.forEach(m => {
          const earnedCount = this.getMemberChallengeBadges(m).length;
          m.trophy.count = earnedCount;
          if (leaderMember && m.id === leaderMember.id) {
            m.trophy.label = `WEEK ${this.currentWeek} YARDS & TDS LEADER (${m.liveStats.yards} YDS • ${m.liveStats.tds} TD)`;
          } else if (m.liveStats.isBye) {
            m.trophy.label = `WEEK ${this.currentWeek} BYE WEEK • ${m.picks.record} OVERALL`;
          } else if (!m.liveStats.hasPlayed) {
            m.trophy.label = `${this.currentSeason} WEEK ${this.currentWeek} CONTENDER • ${m.picks.record}`;
          } else {
            m.trophy.label = `WEEK ${this.currentWeek}: ${m.liveStats.yards} YDS • ${m.liveStats.tds} TD • ${m.fantasy.totalPoints.toFixed(1)} FPTS`;
          }
        });

        // 5. Rebuild Weekly Bracket Data dynamically around real currentWeek & live stats
        this.weeklyBracketData = this.buildWeeklyTournamentData();

        // 6. Refresh any currently visible UI components (ticker, open modal, open drawer)
        this.renderTicker();
        if (this.selectedMember && this.dom.modalOverlay?.classList.contains('open')) {
          this.populateMemberModalData(this.selectedMember.id);
        }
        if (this.activeDrawer === 'FANTASY') this.openFantasyDrawer(false);
        else if (this.activeDrawer === 'BRACKETS') this.renderBracketsHub();
        else if (this.activeDrawer === 'CHALLENGES') this.openChallengesDrawer(false);
        else if (this.activeDrawer === 'STANDINGS') this.openStandingsDrawer(false);

      } catch (err) {
        console.warn('Live ESPN data sync error:', err);
        if (this.dom.tickerGrid && this.currentWeekGames.length === 0) {
          this.dom.tickerGrid.innerHTML = `<div class="ticker-loading-placeholder">Unable to reach live ESPN NFL feed. Retrying automatically...</div>`;
        }
      }
    }

    async fetchPastWeekScoreboard(weekNum) {
      if (this.weekScoreboardCache[weekNum]) {
        return this.weekScoreboardCache[weekNum].games;
      }
      try {
        const res = await fetch(`${ESPN_BASE}/scoreboard?seasontype=2&week=${weekNum}`, { cache: 'no-cache' });
        if (!res.ok) return [];
        const data = await res.json();
        const games = this.parseScoreboardEvents(data.events || []);
        this.weekScoreboardCache[weekNum] = { games, fetchedAt: Date.now() };
        return games;
      } catch (e) {
        return [];
      }
    }

    // =========================================================================
    // CONTENDERS, SEEDING & BRACKETS BUILDERS (100% DYNAMIC)
    // =========================================================================

    getSeededContenders() {
      const sorted = [...this.roster].sort((a, b) => {
        if (b.picks.winPercent !== a.picks.winPercent) return b.picks.winPercent - a.picks.winPercent;
        if (b.picks.wins !== a.picks.wins) return b.picks.wins - a.picks.wins;
        return (b.fantasy?.totalPoints || 0) - (a.fantasy?.totalPoints || 0);
      });

      return sorted.map((m, idx) => {
        const meta = this.getTeamMeta(m.teamId);
        return {
          id: m.id,
          name: m.shortName || m.name,
          fullName: m.name,
          team: m.teamId,
          teamName: meta.name,
          avatar: m.image,
          bannerGif: m.bannerGif,
          seed: `#${idx + 1}`,
          color: m.color || meta.color,
          record: m.picks.record,
          winPercent: m.picks.winPercent,
          yards: m.liveStats.yards || 0,
          fantasyPoints: m.fantasy?.totalPoints || 0,
          isBye: m.liveStats.isBye
        };
      });
    }

    getDivisionCellarTeam(memberTeamAbbr) {
      const meta = this.getTeamMeta(memberTeamAbbr);
      const div = meta.division || 'NFC North';
      const divList = this.standingsByDivision[div] || [];
      const nonSelf = divList.filter(t => t.abbr !== memberTeamAbbr);
      const cellar = nonSelf.length > 0 ? nonSelf[nonSelf.length - 1] : divList[divList.length - 1];

      if (cellar) {
        const cMeta = this.getTeamMeta(cellar.abbr);
        return {
          team: cellar.abbr,
          name: cellar.team,
          displayName: cellar.displayName,
          record: cellar.overall,
          logo: cellar.logo || cMeta.logo,
          color: cMeta.color,
          venue: cMeta.stadium,
          division: div
        };
      }
      return {
        team: 'NFL',
        name: 'Division Rival',
        displayName: 'Division Rival',
        record: '--',
        logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png',
        color: '#64748b',
        venue: 'NFL Stadium',
        division: div
      };
    }

    getNflLastPlaceContender() {
      const worst = this.nflLastPlaceTeam;
      if (worst) {
        const meta = this.getTeamMeta(worst.abbr);
        return {
          name: worst.displayName,
          team: worst.abbr,
          teamName: `${worst.team} (NFL #32)`,
          avatar: worst.logo || meta.logo,
          bannerGif: worst.logo || meta.logo,
          seed: 'NFL #32',
          color: meta.color,
          record: worst.overall,
          yards: 0,
          score: 0,
          pick: `${worst.abbr} ${worst.team} (${worst.overall})`
        };
      }
      return {
        name: 'NFL #32 Team',
        team: 'TBD',
        teamName: 'NFL #32 Last-Place Team',
        avatar: 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png',
        bannerGif: 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png',
        seed: 'NFL #32',
        color: '#64748b',
        record: '--',
        yards: 0,
        score: 0,
        pick: 'TBD (Syncing Standings)'
      };
    }

    buildWeeklyTournamentData() {
      const activeWk = this.currentSeasonType === 2 ? this.currentWeek : 18;
      const contenders = this.getSeededContenders();

      return {
        activeWeek: activeWk,
        weeks: Array.from({ length: 18 }, (_, idx) => {
          const wNum = idx + 1;
          const isPast = wNum < activeWk;
          const isActive = wNum === activeWk;
          const status = isPast ? 'FINAL' : (isActive ? 'ACTIVE' : 'UPCOMING');

          // Rotate pairings deterministically across all 18 weeks
          const p1 = contenders[idx % 7];
          const p2 = contenders[(idx + 1) % 7];
          const p3 = contenders[(idx + 2) % 7];
          const p4 = contenders[(idx + 3) % 7];
          const p5 = contenders[(idx + 4) % 7];
          const p6 = contenders[(idx + 5) % 7];
          const p7 = contenders[(idx + 6) % 7];

          const divCellar = this.getDivisionCellarTeam(p7.team);
          const pastGames = this.weekScoreboardCache[wNum]?.games || [];

          const getTeamWeekScore = (teamAbbr) => {
            const g = pastGames.find(gm => gm.away === teamAbbr || gm.home === teamAbbr);
            if (!g) return null;
            const sc = g.away === teamAbbr ? parseInt(g.awayScore, 10) : parseInt(g.homeScore, 10);
            return isNaN(sc) ? null : sc;
          };

          const isTeamByeThisWeek = (contender) => {
            if (!contender) return false;
            if (isActive) return !!contender.isBye;
            if (isPast && pastGames.length > 0) return getTeamWeekScore(contender.team) === null;
            return false;
          };

          const getScore = (contender) => {
            if (!contender) return 0;
            if (isActive) return contender.fantasyPoints || 0;
            if (isPast) {
              const realPts = getTeamWeekScore(contender.team);
              return realPts !== null ? realPts : 0;
            }
            return 0;
          };

          const getActiveTeamFantasy = (teamAbbr) => {
            const g = this.currentWeekGames.find(gm => gm.away === teamAbbr || gm.home === teamAbbr);
            if (!g) return { score: 0, isBye: true };
            const cached = this.summaryCache[g.eventId]?.data;
            if (cached) {
              const st = extractTeamStatsAndFantasy(cached, teamAbbr);
              if (st?.fantasy) return { score: st.fantasy.totalPoints, isBye: false };
            }
            const rawPts = g.away === teamAbbr ? parseInt(g.awayScore, 10) : parseInt(g.homeScore, 10);
            return { score: isNaN(rawPts) ? 0 : rawPts, isBye: false };
          };

          const scoreUnit = isActive ? 'PTS' : (isPast && pastGames.length > 0 ? 'NFL PTS' : 'PTS');

          const s1 = getScore(p1);
          const s2 = getScore(p2);
          const s3 = getScore(p3);
          const s4 = getScore(p4);
          const s5 = getScore(p5);
          const s6 = getScore(p6);
          const s7 = getScore(p7);
          const cellarActive = isActive ? getActiveTeamFantasy(divCellar.team) : null;
          const sCellar = isActive
            ? (cellarActive?.score || 0)
            : (isPast ? (getTeamWeekScore(divCellar.team) || 0) : 0);
          const isCellarBye = isActive
            ? !!cellarActive?.isBye
            : (isPast && pastGames.length > 0 && getTeamWeekScore(divCellar.team) === null);

          // Winners of Stage 1 advance cleanly
          const w1 = s1 >= s2 ? p1 : p2;
          const w2 = s3 >= s4 ? p3 : p4;
          const w3 = s5 >= s6 ? p5 : p6;
          const w4 = p7;

          const lore1 = LORE_DATABASE[idx % LORE_DATABASE.length];
          const lore2 = LORE_DATABASE[(idx + 1) % LORE_DATABASE.length];
          const lore3 = LORE_DATABASE[(idx + 2) % LORE_DATABASE.length];
          const loreSemi1 = LORE_DATABASE[(idx + 3) % LORE_DATABASE.length];
          const loreSemi2 = LORE_DATABASE[(idx + 4) % LORE_DATABASE.length];
          const loreFinal = LORE_DATABASE[(idx + 5) % LORE_DATABASE.length];

          const scoreReady = isActive || (isPast && pastGames.length > 0);
          const weekLeader = isActive
            ? [...contenders].sort((a, b) => b.fantasyPoints - a.fantasyPoints)[0]
            : (isPast && pastGames.length > 0
                ? [...contenders].sort((a, b) => getScore(b) - getScore(a))[0]
                : null);

          const wrapStaff = (c, sc) => ({
            ...c,
            isBye: isTeamByeThisWeek(c),
            score: sc,
            pick: `${c.team} ${c.teamName} (${c.record})`
          });

          const matches = [
            {
              id: `w${wNum}_q1`,
              round: 1,
              roundName: 'Stage 1 • Opening Matchup',
              title: `Matchup 1: ${p1.name} (${p1.team}) vs ${p2.name} (${p2.team})`,
              rivalryName: `${p1.name} (${p1.team}) vs ${p2.name} (${p2.team})`,
              day: 'Week Slate',
              venue: this.getTeamMeta(p1.team).stadium,
              kickoff: `${this.currentSeason} Week ${wNum}`,
              surface: lore1.surface,
              spread: `${p1.record} vs ${p2.record}`,
              scoreUnit,
              staff1: wrapStaff(p1, s1),
              staff2: wrapStaff(p2, s2),
              lore: lore1.lore,
              smack1: lore1.smack1,
              smack2: lore1.smack2,
              status
            },
            {
              id: `w${wNum}_q2`,
              round: 1,
              roundName: 'Stage 1 • Opening Matchup',
              title: `Matchup 2: ${p3.name} (${p3.team}) vs ${p4.name} (${p4.team})`,
              rivalryName: `${p3.name} (${p3.team}) vs ${p4.name} (${p4.team})`,
              day: 'Week Slate',
              venue: this.getTeamMeta(p3.team).stadium,
              kickoff: `${this.currentSeason} Week ${wNum}`,
              surface: lore2.surface,
              spread: `${p3.record} vs ${p4.record}`,
              scoreUnit,
              staff1: wrapStaff(p3, s3),
              staff2: wrapStaff(p4, s4),
              lore: lore2.lore,
              smack1: lore2.smack1,
              smack2: lore2.smack2,
              status
            },
            {
              id: `w${wNum}_q3`,
              round: 1,
              roundName: 'Stage 1 • Opening Matchup',
              title: `Matchup 3: ${p5.name} (${p5.team}) vs ${p6.name} (${p6.team})`,
              rivalryName: `${p5.name} (${p5.team}) vs ${p6.name} (${p6.team})`,
              day: 'Week Slate',
              venue: this.getTeamMeta(p5.team).stadium,
              kickoff: `${this.currentSeason} Week ${wNum}`,
              surface: lore3.surface,
              spread: `${p5.record} vs ${p6.record}`,
              scoreUnit,
              staff1: wrapStaff(p5, s5),
              staff2: wrapStaff(p6, s6),
              lore: lore3.lore,
              smack1: lore3.smack1,
              smack2: lore3.smack2,
              status
            },
            {
              id: `w${wNum}_q4`,
              round: 1,
              roundName: 'Stage 1 • Division Cellar Challenge',
              title: `Matchup 4: ${p7.name} (${p7.team}) vs ${divCellar.name} (${divCellar.division})`,
              rivalryName: `${p7.name} vs ${divCellar.name} (${divCellar.division} Rival)`,
              day: 'Week Slate',
              venue: divCellar.venue,
              kickoff: `${this.currentSeason} Week ${wNum}`,
              surface: 'Natural Grass / Turf',
              spread: `${p7.record} vs ${divCellar.record}`,
              scoreUnit,
              staff1: wrapStaff(p7, s7),
              staff2: {
                name: divCellar.name,
                team: divCellar.team,
                teamName: `${divCellar.name} (${divCellar.record})`,
                avatar: divCellar.logo,
                bannerGif: divCellar.logo,
                seed: 'DIV-LAST',
                color: divCellar.color,
                record: divCellar.record,
                yards: 0,
                isBye: isCellarBye,
                score: sCellar,
                pick: `${divCellar.team} ${divCellar.name} (${divCellar.record})`
              },
              lore: `${p7.name}'s ${p7.teamName} face ${divCellar.displayName} (${divCellar.record}) from the ${divCellar.division} in this week's odd-player matchup!`,
              smack1: `Taking care of business in the ${divCellar.division}!`,
              smack2: `Don't overlook the ${divCellar.name}—ready to play spoiler!`,
              status
            },
            {
              id: `w${wNum}_s1`,
              round: 2,
              roundName: 'Stage 2 • Semifinal 1',
              title: scoreReady ? `Semifinal 1: ${w1.name} vs ${w2.name}` : 'Semifinal 1: Match 1 Winner vs Match 2 Winner',
              rivalryName: scoreReady ? `${w1.name} vs ${w2.name} (Semifinal 1)` : 'Awaiting Stage 1 Results',
              day: 'Semifinals',
              venue: this.getTeamMeta(w1.team).stadium,
              kickoff: `Week ${wNum} Semifinal`,
              surface: loreSemi1.surface,
              spread: scoreReady ? `${w1.record} vs ${w2.record}` : 'TBD',
              scoreUnit,
              staff1: scoreReady
                ? wrapStaff(w1, getScore(w1))
                : { name: `TBD (${p1.name}/${p2.name})`, team: 'TBD', teamName: 'Match 1 Winner', avatar: p1.avatar, seed: 'ADV', score: 0, pick: 'Advances from Match 1' },
              staff2: scoreReady
                ? wrapStaff(w2, getScore(w2))
                : { name: `TBD (${p3.name}/${p4.name})`, team: 'TBD', teamName: 'Match 2 Winner', avatar: p3.avatar, seed: 'ADV', score: 0, pick: 'Advances from Match 2' },
              lore: loreSemi1.lore,
              smack1: loreSemi1.smack1,
              smack2: loreSemi1.smack2,
              status: scoreReady ? status : 'PENDING'
            },
            {
              id: `w${wNum}_s2`,
              round: 2,
              roundName: 'Stage 2 • Semifinal 2',
              title: scoreReady ? `Semifinal 2: ${w3.name} vs ${w4.name}` : 'Semifinal 2: Match 3 Winner vs Match 4 Winner',
              rivalryName: scoreReady ? `${w3.name} vs ${w4.name} (Semifinal 2)` : 'Awaiting Stage 1 Results',
              day: 'Semifinals',
              venue: this.getTeamMeta(w3.team).stadium,
              kickoff: `Week ${wNum} Semifinal`,
              surface: loreSemi2.surface,
              spread: scoreReady ? `${w3.record} vs ${w4.record}` : 'TBD',
              scoreUnit,
              staff1: scoreReady
                ? wrapStaff(w3, getScore(w3))
                : { name: `TBD (${p5.name}/${p6.name})`, team: 'TBD', teamName: 'Match 3 Winner', avatar: p5.avatar, seed: 'ADV', score: 0, pick: 'Advances from Match 3' },
              staff2: scoreReady
                ? wrapStaff(w4, getScore(w4))
                : { name: `TBD (${p7.name}/Rival)`, team: 'TBD', teamName: 'Match 4 Winner', avatar: p7.avatar, seed: 'ADV', score: 0, pick: 'Advances from Match 4' },
              lore: loreSemi2.lore,
              smack1: loreSemi2.smack1,
              smack2: loreSemi2.smack2,
              status: scoreReady ? status : 'PENDING'
            },
            {
              id: `w${wNum}_f1`,
              round: 3,
              roundName: 'Stage 3 • Weekly Crown Finale',
              title: scoreReady ? `Weekly Crown: ${w1.name} vs ${w3.name}` : 'Weekly Championship Finale',
              rivalryName: scoreReady ? `👑 Week ${wNum} Championship` : '👑 Weekly Championship Finale',
              day: 'Primetime Finale',
              venue: 'Office Championship Arena',
              kickoff: `Week ${wNum} Finale`,
              surface: loreFinal.surface,
              spread: scoreReady ? 'Live Automated Scoring' : 'TBD',
              scoreUnit,
              staff1: scoreReady
                ? wrapStaff((getScore(w1) >= getScore(w2) ? w1 : w2), Math.max(getScore(w1), getScore(w2)))
                : { name: 'TBD (Semifinal 1 Winner)', team: 'TBD', teamName: 'Finalist A', avatar: p1.avatar, seed: 'TOP', score: 0, pick: 'Advances to Championship' },
              staff2: scoreReady
                ? wrapStaff((getScore(w3) >= getScore(w4) ? w3 : w4), Math.max(getScore(w3), getScore(w4)))
                : { name: 'TBD (Semifinal 2 Winner)', team: 'TBD', teamName: 'Finalist B', avatar: p5.avatar, seed: 'TOP', score: 0, pick: 'Advances to Championship' },
              lore: loreFinal.lore,
              smack1: loreFinal.smack1,
              smack2: loreFinal.smack2,
              status: scoreReady ? status : 'PENDING'
            }
          ];

          return {
            weekNumber: wNum,
            label: `Week ${wNum}${isActive ? ' (Active)' : ''}`,
            status,
            winner: weekLeader
              ? `${weekLeader.name} (${weekLeader.team}) — ${getScore(weekLeader).toFixed(isActive ? 1 : 0)} ${scoreUnit}`
              : (isPast ? 'Loading ESPN Week Results...' : 'Upcoming'),
            mvp: weekLeader
              ? `${weekLeader.name} (${weekLeader.record})`
              : (isPast ? 'Fetching...' : 'TBD'),
            matchups: matches
          };
        })
      };
    }

    // =========================================================================
    // AUTOMATED CHALLENGES EVALUATOR (100% REAL WEEKLY STATS)
    // =========================================================================

    getMemberChallengeBadges(member) {
      const st = member.liveStats || {};
      if (!st.hasPlayed || st.isBye) return [];
      const icons = [];
      if (st.yards >= 400) icons.push({ icon: '🚀', label: `400+ Yds (${st.yards} YDS)` });
      if (st.pointsScored >= 30) icons.push({ icon: '🔥', label: `30+ Pts (${st.pointsScored} PTS)` });
      if (st.sacks >= 4) icons.push({ icon: '💥', label: `4+ Sacks (${st.sacks} SACKS)` });
      if (st.fieldGoals >= 3 || st.longFG >= 50) icons.push({ icon: '🎯', label: `Clutch Kicker (${st.fieldGoals} FG, Long ${st.longFG}y)` });
      if (st.won) icons.push({ icon: '🏆', label: `Week ${this.currentWeek} Victory` });
      return icons;
    }

    // =========================================================================
    // TICKER & ROSTER RENDERERS
    // =========================================================================

    renderTicker() {
      if (!this.dom.tickerGrid) return;
      const games = this.currentTickerMode === 'TODAY' ? this.currentWeekGames : this.lastWeekGames;

      if (!games || games.length === 0) {
        this.dom.tickerGrid.innerHTML = `<div class="ticker-loading-placeholder">Loading live ${this.currentSeason} NFL scores (MST)...</div>`;
        return;
      }

      this.dom.tickerGrid.innerHTML = games.map(game => {
        const awayTeam = this.getTeamMeta(game.away);
        const homeTeam = this.getTeamMeta(game.home);

        const awayMemberId = this.teamToMemberMap[game.away];
        const homeMemberId = this.teamToMemberMap[game.home];
        const awayMember = awayMemberId ? this.roster.find(m => m.id === awayMemberId) : null;
        const homeMember = homeMemberId ? this.roster.find(m => m.id === homeMemberId) : null;
        const hasOfficeMember = awayMember || homeMember;

        const awayNum = parseInt(game.awayScore, 10);
        const homeNum = parseInt(game.homeScore, 10);
        const hasScores = !isNaN(awayNum) && !isNaN(homeNum);

        let statusClass = 'preview';
        if (game.completed || game.status.toUpperCase().includes('FINAL')) statusClass = 'final';
        else if (game.isLive) statusClass = 'live';

        return `
          <div class="ticker-card ${hasOfficeMember ? 'office-game-card' : ''}"
               data-event-id="${game.eventId || ''}"
               data-away="${game.away}"
               data-home="${game.home}"
               data-away-member="${awayMemberId || ''}"
               data-home-member="${homeMemberId || ''}"
               role="button"
               tabindex="0"
               title="${hasOfficeMember ? 'Click team row for staff card or card for Box Score' : 'NFL Matchup • Click to view real ESPN Box Score'}">

            <div class="ticker-game-meta">
              <span class="ticker-status-tag ${statusClass}">${escapeHtml(game.status)}</span>
              ${hasOfficeMember ? `<span class="ticker-office-tag">🏈 OFFICE GAME</span>` : ''}
            </div>

            <div class="ticker-team-row ${awayMember ? 'has-member' : ''}" data-member-id="${awayMemberId || ''}">
              <div class="ticker-team-info">
                <img src="${awayTeam.logo}" class="ticker-team-logo" alt="${game.away}" onerror="this.src='https://ui-avatars.com/api/?name=${game.away}&background=0b0f19&color=fff'">
                <span class="ticker-team-name">${game.away}</span>
                ${awayMember ? `<span class="ticker-member-pill" title="Office: ${awayMember.name}"><img src="${awayMember.image}" class="ticker-avatar-mini" alt="${awayMember.name}">${awayMember.shortName || awayMember.name}</span>` : ''}
              </div>
              <span class="ticker-team-score ${hasScores && awayNum > homeNum ? 'winning' : ''}">${game.awayScore}</span>
            </div>

            <div class="ticker-team-row ${homeMember ? 'has-member' : ''}" data-member-id="${homeMemberId || ''}">
              <div class="ticker-team-info">
                <img src="${homeTeam.logo}" class="ticker-team-logo" alt="${game.home}" onerror="this.src='https://ui-avatars.com/api/?name=${game.home}&background=0b0f19&color=fff'">
                <span class="ticker-team-name">${game.home}</span>
                ${homeMember ? `<span class="ticker-member-pill" title="Office: ${homeMember.name}"><img src="${homeMember.image}" class="ticker-avatar-mini" alt="${homeMember.name}">${homeMember.shortName || homeMember.name}</span>` : ''}
              </div>
              <span class="ticker-team-score ${hasScores && homeNum > awayNum ? 'winning' : ''}">${game.homeScore}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    renderRosterGrid() {
      if (!this.dom.rosterGrid) return;
      this.dom.rosterGrid.innerHTML = this.roster.map(member => `
        <div class="roster-member-card" data-id="${member.id}" role="button" tabindex="0" aria-label="Open ${member.name} Details">
          <div class="avatar-frame ${member.frameClass}">
            <div class="avatar-inner-img-wrap">
              <img src="${member.image}" alt="${member.name}" class="roster-avatar-img" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0b1322&color=fff'">
            </div>
          </div>
          <div class="roster-member-name ${member.nameClass}">${member.name}</div>
        </div>
      `).join('');
    }

    // =========================================================================
    // MEMBER DETAIL MODAL
    // =========================================================================

    openMemberModal(memberId) {
      const member = this.roster.find(m => m.id === memberId) || this.roster[0];
      this.selectedMember = member;
      this.isGifActive = true;

      this.dom.modalAvatarCard.className = `modal-avatar-card ${member.frameClass}`;
      this.renderModalMedia(member, true);
      this.populateMemberModalData(member.id);

      this.dom.modalOverlay.classList.add('open');
      this.dom.modalOverlay.setAttribute('aria-hidden', 'false');
    }

    populateMemberModalData(memberId) {
      const member = this.roster.find(m => m.id === memberId) || this.roster[0];
      const team = this.getTeamMeta(member.teamId);

      // Identity
      this.dom.modalMemberName.textContent = member.name;
      this.dom.modalTeamLogo.src = team.logo;
      this.dom.modalTeamLogo.alt = team.name;
      this.dom.modalTeamName.textContent = member.teamName;
      this.dom.modalTeamName.style.color = team.color;

      // Real Record, Win Pct & Streak
      this.dom.picksRecord.textContent = member.picks.record;
      this.dom.picksPct.textContent = member.picks.pct;
      this.dom.picksStreak.textContent = member.picks.streak;
      this.dom.trophyCount.textContent = `× ${member.trophy.count}`;
      this.dom.trophyLabel.textContent = member.trophy.label;

      // This Week's Matchup
      if (this.dom.matchupSectionTitle) {
        this.dom.matchupSectionTitle.textContent = `WEEK ${this.currentWeek} MATCHUP (${this.currentSeason})`;
      }
      const m = member.matchup;
      this.dom.matchupAwayCode.textContent = m.away.code;
      this.dom.matchupAwayRec.textContent = m.away.rec;
      this.dom.matchupAwayScore.textContent = m.away.score;
      this.dom.matchupHomeCode.textContent = m.home.code;
      this.dom.matchupHomeRec.textContent = m.home.rec;
      this.dom.matchupHomeScore.textContent = m.home.score;
      this.dom.matchupClockStatus.textContent = m.status;
      this.dom.matchupVenue.textContent = m.venue;
      this.dom.starterAway.textContent = m.awayStarter;
      this.dom.starterHome.textContent = m.homeStarter;
      this.dom.matchupLiveTag.style.display = m.isLive ? 'block' : 'none';
      if (this.dom.btnOpenBoxScore) {
        this.dom.btnOpenBoxScore.style.display = m.isBye ? 'none' : 'inline-flex';
      }

      // Upcoming Schedule (Next 5 Games from live ESPN team schedule)
      if (member.schedule && member.schedule.length > 0) {
        this.dom.scheduleList.innerHTML = member.schedule.map(s => {
          const awayCode = s.isHome ? s.away : `<strong style="color:${team.color}">${s.away}</strong>`;
          const homeCode = s.isHome ? `<strong style="color:${team.color}">${s.home}</strong>` : s.home;
          return `
            <div class="schedule-row">
              <span class="schedule-date">${escapeHtml(s.date)}</span>
              <span class="schedule-matchup">${awayCode} @ ${homeCode}</span>
              <span class="schedule-time">${escapeHtml(s.time)}</span>
            </div>
          `;
        }).join('');
      } else {
        this.dom.scheduleList.innerHTML = `<div class="schedule-row"><span class="schedule-date">No remaining regular-season games scheduled.</span></div>`;
      }

      // Real Division Standings
      this.dom.standingsDivisionTitle.textContent = member.divisionTitle || `${member.division.toUpperCase()} STANDINGS`;
      if (member.standings && member.standings.length > 0) {
        this.dom.divisionStandingsTbody.innerHTML = member.standings.map(row => `
          <tr class="${row.highlight ? 'highlight-team-row' : ''}">
            <td class="col-team">${escapeHtml(row.team)}</td>
            <td class="col-stat">${row.w}</td>
            <td class="col-stat">${row.t > 0 ? `${row.l}-${row.t}` : row.l}</td>
            <td class="col-stat">${row.pct}</td>
            <td class="col-stat">${row.gb}</td>
          </tr>
        `).join('');
      } else {
        this.dom.divisionStandingsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Loading live NFL standings...</td></tr>`;
      }

      // Weekly Yards & TDs Leader Table
      if (this.dom.leaderTableTitle) {
        this.dom.leaderTableTitle.textContent = `WEEK ${this.currentWeek} YARDS & TOUCHDOWNS LEADER`;
      }
      const sortedLeaders = [...this.roster].sort((a, b) => {
        if (a.liveStats.isBye !== b.liveStats.isBye) return a.liveStats.isBye ? 1 : -1;
        return (b.liveStats.yards - a.liveStats.yards) || (b.liveStats.tds - a.liveStats.tds);
      });
      this.dom.dailyLeadersTbody.innerHTML = sortedLeaders.map(r => `
        <tr class="${r.id === member.id ? 'highlight-team-row' : ''}">
          <td class="col-team" style="font-weight:700;">${escapeHtml(r.shortName || r.name)} (${r.teamId})</td>
          <td class="col-stat">${r.liveStats.hasPlayed ? `${r.liveStats.yards} YDS` : '—'}</td>
          <td class="col-stat">${r.liveStats.hasPlayed ? `${r.liveStats.tds} TD` : '—'}</td>
          <td class="col-stat">${escapeHtml(r.liveStats.status)}</td>
        </tr>
      `).join('');

      // Real Automated Fantasy Football Breakdown (fixed DOM IDs!)
      if (member.fantasy) {
        const f = member.fantasy;
        const fmtPts = (p) => `${p >= 0 ? '+' : ''}${p.toFixed(1)} PTS`;

        if (this.dom.fantasyHeaderTotalBadge) this.dom.fantasyHeaderTotalBadge.textContent = `${f.totalPoints.toFixed(1)} PTS`;
        if (this.dom.fantasyTotalLabel) this.dom.fantasyTotalLabel.textContent = `AUTOMATED WEEK ${this.currentWeek} FANTASY TOTAL:`;
        if (this.dom.fantasyTotalVal) this.dom.fantasyTotalVal.textContent = `${f.totalPoints.toFixed(1)} PTS`;

        if (this.dom.fantasyQbName) this.dom.fantasyQbName.textContent = f.qb.player;
        if (this.dom.fantasyQbStats) this.dom.fantasyQbStats.textContent = f.qb.stats;
        if (this.dom.fantasyQbPts) this.dom.fantasyQbPts.textContent = fmtPts(f.qb.points);

        if (this.dom.fantasyRecName) this.dom.fantasyRecName.textContent = f.rec.player;
        if (this.dom.fantasyRecStats) this.dom.fantasyRecStats.textContent = f.rec.stats;
        if (this.dom.fantasyRecPts) this.dom.fantasyRecPts.textContent = fmtPts(f.rec.points);

        if (this.dom.fantasyRushName) this.dom.fantasyRushName.textContent = f.rush.player;
        if (this.dom.fantasyRushStats) this.dom.fantasyRushStats.textContent = f.rush.stats;
        if (this.dom.fantasyRushPts) this.dom.fantasyRushPts.textContent = fmtPts(f.rush.points);

        if (this.dom.fantasyDefName) this.dom.fantasyDefName.textContent = f.def.player;
        if (this.dom.fantasyDefStats) this.dom.fantasyDefStats.textContent = f.def.stats;
        if (this.dom.fantasyDefPts) this.dom.fantasyDefPts.textContent = fmtPts(f.def.points);

        if (this.dom.fantasyStName) this.dom.fantasyStName.textContent = f.st.player;
        if (this.dom.fantasyStStats) this.dom.fantasyStStats.textContent = f.st.stats;
        if (this.dom.fantasyStPts) this.dom.fantasyStPts.textContent = fmtPts(f.st.points);
      }
    }

    renderModalMedia(member, isBannerActive) {
      const bannerSrc = member.bannerGif || "assets/Arizona_Cardinals_flag.gif";
      const isVideo = bannerSrc.toLowerCase().endsWith('.mp4') || bannerSrc.toLowerCase().endsWith('.webm');

      if (isBannerActive) {
        if (isVideo) {
          if (this.dom.modalAvatarImg) this.dom.modalAvatarImg.style.display = 'none';
          if (this.dom.modalAvatarVideo) {
            this.dom.modalAvatarVideo.style.display = 'block';
            this.dom.modalAvatarVideo.src = bannerSrc;
            this.dom.modalAvatarVideo.play().catch(() => {});
          }
        } else {
          if (this.dom.modalAvatarVideo) {
            this.dom.modalAvatarVideo.style.display = 'none';
            this.dom.modalAvatarVideo.pause();
          }
          if (this.dom.modalAvatarImg) {
            this.dom.modalAvatarImg.style.display = 'block';
            this.dom.modalAvatarImg.src = bannerSrc;
            this.dom.modalAvatarImg.alt = `${member.name} Animated Banner`;
          }
        }
        if (this.dom.photoBadgeText) this.dom.photoBadgeText.textContent = "BANNER ACTIVE (CLICK FOR PHOTO)";
      } else {
        if (this.dom.modalAvatarVideo) {
          this.dom.modalAvatarVideo.style.display = 'none';
          this.dom.modalAvatarVideo.pause();
        }
        if (this.dom.modalAvatarImg) {
          this.dom.modalAvatarImg.style.display = 'block';
          this.dom.modalAvatarImg.src = member.image;
          this.dom.modalAvatarImg.alt = member.name;
        }
        if (this.dom.photoBadgeText) this.dom.photoBadgeText.textContent = "PHOTO (CLICK FOR BANNER)";
      }
    }

    closeModal() {
      if (this.dom.modalAvatarVideo) {
        this.dom.modalAvatarVideo.pause();
      }
      this.dom.modalOverlay.classList.remove('open');
      this.dom.modalOverlay.setAttribute('aria-hidden', 'true');
    }

    toggleGifMode() {
      if (!this.selectedMember) return;
      this.isGifActive = !this.isGifActive;
      this.renderModalMedia(this.selectedMember, this.isGifActive);
    }

    // =========================================================================
    // EVENT BINDINGS
    // =========================================================================

    bindEvents() {
      this.dom.tickerGrid?.addEventListener('click', (e) => {
        const teamRow = e.target.closest('.ticker-team-row');
        if (teamRow && teamRow.dataset.memberId) {
          e.stopPropagation();
          this.openMemberModal(teamRow.dataset.memberId);
          return;
        }

        const card = e.target.closest('.ticker-card');
        if (!card) return;

        const eventId = card.dataset.eventId;
        const away = card.dataset.away;
        const home = card.dataset.home;
        const mode = this.currentTickerMode === 'YESTERDAY' ? 'LAST_WEEK' : 'CURRENT';
        this.openBoxScoreModal({ eventId, away: { code: away }, home: { code: home } }, mode);
      });

      this.dom.tabTodayTicker?.addEventListener('click', () => {
        this.currentTickerMode = 'TODAY';
        this.dom.tabTodayTicker.classList.add('active');
        this.dom.tabYesterdayTicker.classList.remove('active');
        this.renderTicker();
      });

      this.dom.tabYesterdayTicker?.addEventListener('click', () => {
        this.currentTickerMode = 'YESTERDAY';
        this.dom.tabYesterdayTicker.classList.add('active');
        this.dom.tabTodayTicker.classList.remove('active');
        this.renderTicker();
      });

      this.dom.rosterGrid?.addEventListener('click', (e) => {
        const card = e.target.closest('.roster-member-card');
        if (card) this.openMemberModal(card.dataset.id);
      });

      this.dom.modalCloseBtn?.addEventListener('click', () => this.closeModal());
      this.dom.modalOverlay?.addEventListener('click', (e) => {
        if (e.target === this.dom.modalOverlay) this.closeModal();
      });

      this.dom.modalAvatarCard?.addEventListener('click', () => this.toggleGifMode());
      this.dom.modalGifToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleGifMode();
      });

      this.dom.btnOpenBoxScore?.addEventListener('click', () => {
        if (this.selectedMember?.matchup && !this.selectedMember.matchup.isBye) {
          this.openBoxScoreModal(this.selectedMember.matchup, 'CURRENT');
        } else {
          this.openBoxScoreModal(null, 'CURRENT');
        }
      });

      this.dom.btnYesterdayModal?.addEventListener('click', () => {
        this.openBoxScoreModal(null, 'LAST_WEEK');
      });

      this.dom.btnSignIn?.addEventListener('click', () => {
        alert(`Welcome to Office Endzone! Live ${this.currentSeason} NFL Week ${this.currentWeek} feed is active.`);
      });

      // Quick Nav Buttons
      this.dom.btnNavRoster?.addEventListener('click', () => {
        this.setActiveNav(this.dom.btnNavRoster);
        this.closeDrawer();
        document.getElementById('roster-section')?.scrollIntoView({ behavior: 'smooth' });
      });

      this.dom.btnNavFantasy?.addEventListener('click', () => {
        this.closeModal();
        this.setActiveNav(this.dom.btnNavFantasy);
        this.openFantasyDrawer(true);
      });

      this.dom.btnNavBracket?.addEventListener('click', () => {
        this.closeModal();
        this.setActiveNav(this.dom.btnNavBracket);
        this.openBracketsDrawer(true);
      });

      this.dom.btnNavChallenges?.addEventListener('click', () => {
        this.closeModal();
        this.setActiveNav(this.dom.btnNavChallenges);
        this.openChallengesDrawer(true);
      });

      this.dom.btnNavStandings?.addEventListener('click', () => {
        this.closeModal();
        this.setActiveNav(this.dom.btnNavStandings);
        this.openStandingsDrawer(true);
      });

      this.dom.btnCloseDrawer?.addEventListener('click', () => {
        this.closeDrawer();
        this.setActiveNav(this.dom.btnNavRoster);
      });

      this.dom.showdownModalClose?.addEventListener('click', () => this.closeShowdownModal());
      this.dom.showdownModalOverlay?.addEventListener('click', (e) => {
        if (e.target === this.dom.showdownModalOverlay) this.closeShowdownModal();
      });

      this.dom.boxScoreModalClose?.addEventListener('click', () => this.closeBoxScoreModal());
      this.dom.boxScoreModalOverlay?.addEventListener('click', (e) => {
        if (e.target === this.dom.boxScoreModalOverlay) this.closeBoxScoreModal();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.dom.boxScoreModalOverlay?.classList.contains('open')) this.closeBoxScoreModal();
          else if (this.dom.showdownModalOverlay?.classList.contains('open')) this.closeShowdownModal();
          else if (this.dom.modalOverlay?.classList.contains('open')) this.closeModal();
        }
      });
    }

    setActiveNav(btn) {
      document.querySelectorAll('.quick-nav-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }

    // =========================================================================
    // BRACKETS HUB (DYNAMIC WEEK + ON-DEMAND PAST WEEK ESPN SYNC)
    // =========================================================================

    openBracketsDrawer(scroll = true) {
      if (!this.dom.drawerBody || !this.dom.secondaryDrawer) return;
      this.activeDrawer = 'BRACKETS';
      this.dom.drawerTitle.textContent = `🌲 Office Brackets Hub (${this.currentSeason} • Week ${this.currentWeek})`;
      this.renderBracketsHub();
      this.dom.secondaryDrawer.style.display = 'flex';
      if (scroll) this.dom.secondaryDrawer.scrollIntoView({ behavior: 'smooth' });
    }

    renderBracketsHub() {
      if (!this.dom.drawerBody) return;
      if (!this.weeklyBracketData) {
        this.weeklyBracketData = this.buildWeeklyTournamentData();
      }
      const isWeekly = this.activeBracketTab === 'WEEKLY';
      const curWeek = this.weeklyBracketData.weeks[this.selectedWeekIndex] || this.weeklyBracketData.weeks[0];

      this.dom.drawerBody.innerHTML = `
        <div class="brackets-container">
          <div class="bracket-mode-tabs">
            <button class="bracket-mode-btn ${isWeekly ? 'active' : ''}" id="tab-mode-weekly">⚡ WEEKLY MATCHUP BRACKETS</button>
            <button class="bracket-mode-btn ${!isWeekly ? 'active' : ''}" id="tab-mode-season">🏆 18-WEEK SEASON TOURNAMENT</button>
          </div>
          ${isWeekly ? this.renderWeeklyBracketsContent(curWeek) : this.renderSeasonLadderContent()}
        </div>
      `;

      document.getElementById('tab-mode-weekly')?.addEventListener('click', () => {
        this.activeBracketTab = 'WEEKLY';
        this.renderBracketsHub();
      });

      document.getElementById('tab-mode-season')?.addEventListener('click', () => {
        this.activeBracketTab = 'SEASON';
        this.renderBracketsHub();
      });

      if (isWeekly) {
        document.querySelectorAll('.week-pill-btn').forEach(pill => {
          pill.addEventListener('click', async () => {
            this.selectedWeekIndex = parseInt(pill.dataset.weekIndex, 10);
            const targetWeekNum = this.selectedWeekIndex + 1;
            this.renderBracketsHub();
            // Load real ESPN scores for any past week on demand!
            if (targetWeekNum < this.currentWeek && !this.weekScoreboardCache[targetWeekNum]) {
              await this.fetchPastWeekScoreboard(targetWeekNum);
              this.weeklyBracketData = this.buildWeeklyTournamentData();
              if (this.activeDrawer === 'BRACKETS' && this.activeBracketTab === 'WEEKLY') {
                this.renderBracketsHub();
              }
            }
          });
        });

        document.querySelectorAll('.contender-filter-pill').forEach(pill => {
          pill.addEventListener('click', () => {
            if (pill.dataset.contender) {
              this.selectedContenderFilter = pill.dataset.contender;
              this.renderBracketsHub();
            }
          });
        });

        document.querySelectorAll('.btn-reveal-showdown, .bracket-matchup-node').forEach(elem => {
          elem.addEventListener('click', (e) => {
            if (e.target.closest('.btn-bracket-pick')) return;
            const matchId = elem.dataset.matchId;
            if (matchId) this.openShowdownModal(matchId);
          });
        });
      } else {
        document.querySelectorAll('.btn-season-reveal-showdown, .bracket-matchup-node').forEach(elem => {
          elem.addEventListener('click', (e) => {
            if (e.target.closest('.btn-season-pick') || e.target.closest('.btn-reset-season-picks')) return;
            const matchId = elem.dataset.matchId;
            if (matchId) this.openShowdownModal(matchId);
          });
        });

        document.querySelectorAll('.btn-season-pick').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const matchId = btn.dataset.matchId;
            const staff = btn.dataset.staff;
            if (matchId.startsWith('st_q') || matchId.startsWith('st_s')) {
              delete this.seasonPicks['st_final'];
            }
            this.seasonPicks[matchId] = staff;
            localStorage.setItem('office_endzone_season_picks', JSON.stringify(this.seasonPicks));
            this.renderBracketsHub();
          });
        });

        document.querySelectorAll('.btn-reset-season-picks').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.seasonPicks = {};
            localStorage.removeItem('office_endzone_season_picks');
            this.renderBracketsHub();
          });
        });
      }
    }

    renderWeeklyBracketsContent(curWeek) {
      const contenders = this.getSeededContenders();
      const r1Matches = curWeek.matchups.filter(m => m.round === 1);
      const r2Matches = curWeek.matchups.filter(m => m.round === 2);
      const r3Matches = curWeek.matchups.filter(m => m.round === 3);

      const renderNode = (m, isChampionship = false) => {
        const isUpcoming = m.status === 'UPCOMING';
        const isPending = m.status === 'PENDING';
        const staff1Won = !isUpcoming && !isPending && m.staff1.score > m.staff2.score;
        const staff2Won = !isUpcoming && !isPending && m.staff2.score > m.staff1.score;

        const isHighlighted = this.selectedContenderFilter !== 'ALL' &&
          (m.staff1.name.includes(this.selectedContenderFilter) || m.staff2.name.includes(this.selectedContenderFilter));

        const fmtVal = (staff) => {
          if (isUpcoming || isPending) return 'TBD';
          if (staff.isBye) return 'BYE';
          const unit = m.scoreUnit || 'PTS';
          return unit === 'PTS' ? `${(staff.score || 0).toFixed(1)} PTS` : `${Math.round(staff.score || 0)} ${unit}`;
        };

        return `
          <div class="bracket-matchup-node ${isChampionship ? 'championship-node' : ''} ${isHighlighted ? 'highlighted' : ''}" data-match-id="${m.id}" role="button" tabindex="0">
            <div class="match-node-top">
              <span class="match-rivalry-name">${escapeHtml(m.rivalryName)}</span>
              <span class="matchup-status-pill ${m.status === 'ACTIVE' ? 'live' : m.status.toLowerCase()}">${m.status}</span>
            </div>

            <div style="font-size:0.62rem; color:#94a3b8; display:flex; justify-content:space-between;">
              <span>📍 ${escapeHtml(m.venue)}</span>
              <span>🗓️ ${escapeHtml(m.kickoff)}</span>
            </div>

            <div class="match-node-contenders">
              <div class="bracket-contestant-row ${staff1Won ? 'winning' : ''}">
                <div class="contestant-identity">
                  <div class="contestant-name-box">
                    <span class="contestant-staff-name">${m.staff1.seed ? m.staff1.seed + ' ' : ''}${escapeHtml(m.staff1.name)} (${m.staff1.team})</span>
                    <span class="contestant-team-pick">${escapeHtml(m.staff1.pick)}</span>
                  </div>
                </div>
                <div class="contestant-score-action" style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
                  <span class="contestant-score-num" style="color:#facc15; font-weight:900; font-family:'JetBrains Mono',monospace;">${fmtVal(m.staff1)}</span>
                </div>
              </div>

              <div class="bracket-vs-divider">VS</div>

              <div class="bracket-contestant-row ${staff2Won ? 'winning' : ''}">
                <div class="contestant-identity">
                  <div class="contestant-name-box">
                    <span class="contestant-staff-name">${m.staff2.seed ? m.staff2.seed + ' ' : ''}${escapeHtml(m.staff2.name)} (${m.staff2.team})</span>
                    <span class="contestant-team-pick">${escapeHtml(m.staff2.pick)}</span>
                  </div>
                </div>
                <div class="contestant-score-action" style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
                  <span class="contestant-score-num" style="color:#facc15; font-weight:900; font-family:'JetBrains Mono',monospace;">${fmtVal(m.staff2)}</span>
                </div>
              </div>
            </div>

            <button class="btn-reveal-showdown" data-match-id="${m.id}">
              <span>📊</span> View Matchup Details
            </button>
          </div>
        `;
      };

      return `
        <div class="week-selector-wrapper">
          <span class="week-selector-label">Select ${this.currentSeason} NFL Week:</span>
          <div class="week-pills-row">
            ${this.weeklyBracketData.weeks.map((w, idx) => `
              <button class="week-pill-btn ${idx === this.selectedWeekIndex ? 'active' : ''}" data-week-index="${idx}">
                ${w.label}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="user-picks-tracker-bar" style="background:linear-gradient(90deg, rgba(250,204,21,0.15), rgba(16,185,129,0.15)); border-color:rgba(250,204,21,0.3);">
          <div class="user-picks-tracker-text" style="color:#facc15;">
            ⚡ LIVE ${this.currentSeason} NFL SYNC • ACTIVE WEEK ${this.currentWeek} AUTOMATED SCORING
          </div>
          <div class="user-picks-tracker-badge" style="background:rgba(16,185,129,0.2); color:#10b981; border:1px solid rgba(16,185,129,0.4);">
            ✓ REAL ESPN STATS
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:4px; margin-top:2px; margin-bottom:8px;">
          <div style="font-size:0.68rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">
            Highlight Contender:
          </div>
          <div class="contender-filter-bar">
            <button class="contender-filter-pill ${this.selectedContenderFilter === 'ALL' ? 'active' : ''}" data-contender="ALL">
              ⭐ All Contenders
            </button>
            ${contenders.map(c => `
              <button class="contender-filter-pill ${this.selectedContenderFilter === c.name ? 'active' : ''}" data-contender="${escapeHtml(c.name)}">
                ${escapeHtml(c.name)} (${c.team})
              </button>
            `).join('')}
          </div>
        </div>

        <div class="weekly-crown-banner">
          <div class="crown-icon">👑</div>
          <div class="crown-details">
            <div class="crown-title">${escapeHtml(curWeek.label)} Pacesetter: ${escapeHtml(curWeek.winner)}</div>
            <div class="crown-sub">Top Seed / Record: ${escapeHtml(curWeek.mvp)} • Click any past week above to fetch real ${this.currentSeason} ESPN scores!</div>
          </div>
        </div>

        <div class="tournament-bracket-tree">
          <div class="bracket-round-column">
            <div class="bracket-round-header">
              <span class="round-header-title">Stage 1 • Opening Slate</span>
              <span class="round-header-badge">4 MATCHES</span>
            </div>
            ${r1Matches.map(m => renderNode(m)).join('')}
          </div>

          <div class="bracket-round-column">
            <div class="bracket-round-header">
              <span class="round-header-title">Stage 2 • Semifinals</span>
              <span class="round-header-badge">2 MATCHES</span>
            </div>
            ${r2Matches.map(m => renderNode(m)).join('')}
          </div>

          <div class="bracket-round-column">
            <div class="bracket-round-header gold">
              <span class="round-header-title" style="color:#facc15;">👑 Weekly Grand Finale</span>
              <span class="round-header-badge" style="background:rgba(250,204,21,0.2); color:#facc15;">CHAMPIONSHIP</span>
            </div>
            ${r3Matches.map(m => renderNode(m, true)).join('')}
          </div>
        </div>
      `;
    }

    renderSeasonLadderContent() {
      const seeded = this.getSeededContenders();
      const nflWorst = this.getNflLastPlaceContender();

      const c1 = seeded[0], c2 = seeded[1], c3 = seeded[2], c4 = seeded[3], c5 = seeded[4], c6 = seeded[5], c7 = seeded[6];

      const findContender = (name) => {
        if (!name) return null;
        if (name === nflWorst.name) return nflWorst;
        return seeded.find(c => c.name === name || c.fullName === name) || null;
      };

      const s1_c1 = findContender(this.seasonPicks['st_q1']) || { name: `TBD (Winner QF 1)`, team: '', seed: 'ADV', pick: `${c1.name} vs ${c6.name}` };
      const s1_c2 = findContender(this.seasonPicks['st_q4']) || { name: `TBD (Winner QF 4)`, team: '', seed: 'ADV', pick: `${c7.name} vs ${nflWorst.team}` };
      const s2_c1 = findContender(this.seasonPicks['st_q2']) || { name: `TBD (Winner QF 2)`, team: '', seed: 'ADV', pick: `${c2.name} vs ${c5.name}` };
      const s2_c2 = findContender(this.seasonPicks['st_q3']) || { name: `TBD (Winner QF 3)`, team: '', seed: 'ADV', pick: `${c3.name} vs ${c4.name}` };

      const f_c1 = findContender(this.seasonPicks['st_s1']) || { name: 'TBD (Winner SF 1)', team: '', seed: 'TOP', pick: 'Semifinal 1 Winner' };
      const f_c2 = findContender(this.seasonPicks['st_s2']) || { name: 'TBD (Winner SF 2)', team: '', seed: 'TOP', pick: 'Semifinal 2 Winner' };

      const seasonPicksCount = Object.keys(this.seasonPicks).length;
      const crownedChamp = this.seasonPicks['st_final'];

      const renderSeasonNode = (matchId, weekLabel, rivalryName, left, right, isFinal = false) => {
        const userPick = this.seasonPicks[matchId];
        const canPick1 = left && left.name && !left.name.startsWith('TBD');
        const canPick2 = right && right.name && !right.name.startsWith('TBD');

        return `
          <div class="bracket-matchup-node ${isFinal ? 'championship-node' : ''}" data-match-id="${matchId}" role="button" tabindex="0">
            <div class="match-node-top">
              <span class="match-rivalry-name">${escapeHtml(rivalryName)}</span>
              <span class="matchup-status-pill preview">${weekLabel}</span>
            </div>

            <div class="match-node-contenders">
              <div class="bracket-contestant-row ${userPick === left?.name ? 'user-picked' : ''}">
                <div class="contestant-identity">
                  <div class="contestant-name-box">
                    <span class="contestant-staff-name">${left?.seed ? left.seed + ' ' : ''}${escapeHtml(left?.name || 'TBD')} ${left?.team ? '(' + left.team + ')' : ''}</span>
                    <span class="contestant-team-pick" style="color:#64748b;">${escapeHtml(left?.record ? `${left.teamName} • ${left.record}` : (left?.pick || 'Awaiting Previous Round'))}</span>
                  </div>
                </div>
                <div class="contestant-score-action">
                  ${canPick1 ? `
                    <button class="btn-season-pick btn-bracket-pick ${userPick === left.name ? 'active' : ''}" data-match-id="${matchId}" data-staff="${escapeHtml(left.name)}">
                      ${userPick === left.name ? '✓ Picked' : 'Pick'}
                    </button>
                  ` : `<span class="contestant-score-num" style="color:#64748b; font-size:0.68rem;">TBD</span>`}
                </div>
              </div>

              <div class="bracket-vs-divider">VS</div>

              <div class="bracket-contestant-row ${userPick === right?.name ? 'user-picked' : ''}">
                <div class="contestant-identity">
                  <div class="contestant-name-box">
                    <span class="contestant-staff-name">${right?.seed ? right.seed + ' ' : ''}${escapeHtml(right?.name || 'TBD')} ${right?.team ? '(' + right.team + ')' : ''}</span>
                    <span class="contestant-team-pick" style="color:#64748b;">${escapeHtml(right?.record ? `${right.teamName} • ${right.record}` : (right?.pick || 'Awaiting Previous Round'))}</span>
                  </div>
                </div>
                <div class="contestant-score-action">
                  ${canPick2 ? `
                    <button class="btn-season-pick btn-bracket-pick ${userPick === right.name ? 'active' : ''}" data-match-id="${matchId}" data-staff="${escapeHtml(right.name)}">
                      ${userPick === right.name ? '✓ Picked' : 'Pick'}
                    </button>
                  ` : `<span class="contestant-score-num" style="color:#64748b; font-size:0.68rem;">TBD</span>`}
                </div>
              </div>
            </div>
          </div>
        `;
      };

      return `
        <div class="season-ladder-view">
          <div class="ladder-explainer-card">
            <span style="font-size:1.3rem;">🛡️</span>
            <div class="ladder-info-text">
              <strong>${this.currentSeason} Office Endzone Regular Season Championship (Weeks 16–18)</strong><br>
              Live Playoff Seeding updated automatically from real ${this.currentSeason} NFL standings through Week ${this.currentWeek}! #7 faces the current NFL #32 team (${escapeHtml(nflWorst.name)} • ${escapeHtml(nflWorst.record)}).
            </div>
          </div>

          <div class="user-picks-tracker-bar">
            <div class="user-picks-tracker-text">🎯 SEASON BRACKET PICKS: ${seasonPicksCount}/7 ROUNDS LOCKED</div>
            <button class="btn-reset-season-picks" title="Reset all season tournament picks">↺ Reset Season Picks</button>
          </div>

          ${crownedChamp ? `
            <div class="weekly-crown-banner championship-crowned-banner" style="background:linear-gradient(90deg, #facc15, #f59e0b); color:#0b1322;">
              <div class="crown-icon">🏆</div>
              <div class="crown-details">
                <div class="crown-title" style="color:#0b1322; font-size:0.95rem; font-weight:900;">${this.currentSeason} PROJECTED CHAMPION: ${escapeHtml(crownedChamp.toUpperCase())}</div>
                <div class="crown-sub" style="color:#1e293b; font-weight:800;">Winner of the 18-Week Office Endzone Tournament!</div>
              </div>
            </div>
          ` : ''}

          <div class="tournament-bracket-tree">
            <div class="bracket-round-column">
              <div class="bracket-round-header">
                <span class="round-header-title">Round 1 • Quarterfinals</span>
                <span class="round-header-badge">WEEK 16</span>
              </div>
              ${renderSeasonNode('st_q1', 'WEEK 16', `#1 ${c1.name} vs #6 ${c6.name}`, c1, c6)}
              ${renderSeasonNode('st_q2', 'WEEK 16', `#2 ${c2.name} vs #5 ${c5.name}`, c2, c5)}
              ${renderSeasonNode('st_q3', 'WEEK 16', `#3 ${c3.name} vs #4 ${c4.name}`, c3, c4)}
              ${renderSeasonNode('st_q4', 'WEEK 16', `#7 ${c7.name} vs NFL #32 ${nflWorst.team}`, c7, nflWorst)}
            </div>

            <div class="bracket-round-column">
              <div class="bracket-round-header">
                <span class="round-header-title">Round 2 • Semifinals</span>
                <span class="round-header-badge">WEEK 17</span>
              </div>
              ${renderSeasonNode('st_s1', 'WEEK 17', 'Semifinal 1 (QF 1 vs QF 4)', s1_c1, s1_c2)}
              ${renderSeasonNode('st_s2', 'WEEK 17', 'Semifinal 2 (QF 2 vs QF 3)', s2_c1, s2_c2)}
            </div>

            <div class="bracket-round-column">
              <div class="bracket-round-header gold">
                <span class="round-header-title" style="color:#facc15;">👑 Round 3 • Championship</span>
                <span class="round-header-badge" style="background:rgba(250,204,21,0.2); color:#facc15;">WEEK 18 FINALE</span>
              </div>
              ${renderSeasonNode('st_final', 'WEEK 18', `👑 ${this.currentSeason} Season Grand Championship`, f_c1, f_c2, true)}
            </div>
          </div>
        </div>
      `;
    }

    openShowdownModal(matchId) {
      if (!this.weeklyBracketData || !this.dom.showdownModalContent || !this.dom.showdownModalOverlay) return;
      let foundMatch = null;
      let foundRoundLabel = '';

      for (const w of this.weeklyBracketData.weeks) {
        const m = w.matchups.find(item => item.id === matchId);
        if (m) {
          foundMatch = m;
          foundRoundLabel = `${this.currentSeason} ${w.label.toUpperCase()} • ${m.roundName.toUpperCase()}`;
          break;
        }
      }
      if (!foundMatch) return;

      const s1 = foundMatch.staff1;
      const s2 = foundMatch.staff2;

      this.dom.showdownModalContent.innerHTML = `
        <div class="showdown-hero-banner">
          <div style="font-size:0.68rem; font-weight:800; color:#38bdf8; letter-spacing:1px; margin-bottom:4px;">${escapeHtml(foundRoundLabel)}</div>
          <div class="showdown-hero-title">${escapeHtml(foundMatch.title)}</div>
          <div class="showdown-hero-meta">
            <span class="showdown-meta-item">📍 ${escapeHtml(foundMatch.venue)}</span>
            <span class="showdown-meta-item">🗓️ ${escapeHtml(foundMatch.kickoff)}</span>
            <span class="showdown-meta-item" style="color:#facc15; font-weight:800;">📊 ${escapeHtml(foundMatch.spread)}</span>
          </div>
        </div>

        <div class="showdown-tale-grid">
          <div class="showdown-contender-card">
            <div class="showdown-contender-avatar-wrap">
              <img src="${s1.avatar}" class="showdown-contender-avatar-img" alt="${escapeHtml(s1.name)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s1.name)}&background=0b1322&color=fff'">
            </div>
            <div class="showdown-contender-name">${s1.seed ? s1.seed + ' ' : ''}${escapeHtml(s1.name)}</div>
            <div class="showdown-contender-team"><span>${escapeHtml(s1.teamName)} (${s1.team})</span></div>
            <div class="showdown-contender-stats-mini">
              <div><strong>Record:</strong> ${escapeHtml(s1.record || '--')}</div>
              <div><strong>Score:</strong> ${(s1.score || 0).toFixed(1)} ${foundMatch.scoreUnit || 'PTS'}</div>
            </div>
          </div>

          <div class="showdown-vs-center">
            <div class="showdown-vs-badge">VS</div>
            <span style="font-size:0.62rem; color:#facc15; font-weight:800;">HEAD-TO-HEAD</span>
          </div>

          <div class="showdown-contender-card">
            <div class="showdown-contender-avatar-wrap">
              <img src="${s2.avatar}" class="showdown-contender-avatar-img" alt="${escapeHtml(s2.name)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s2.name)}&background=0b1322&color=fff'">
            </div>
            <div class="showdown-contender-name">${s2.seed ? s2.seed + ' ' : ''}${escapeHtml(s2.name)}</div>
            <div class="showdown-contender-team"><span>${escapeHtml(s2.teamName)} (${s2.team})</span></div>
            <div class="showdown-contender-stats-mini">
              <div><strong>Record:</strong> ${escapeHtml(s2.record || '--')}</div>
              <div><strong>Score:</strong> ${(s2.score || 0).toFixed(1)} ${foundMatch.scoreUnit || 'PTS'}</div>
            </div>
          </div>
        </div>

        <div class="showdown-lore-card">
          <div class="showdown-card-section-title"><span>📜</span> Matchup Overview</div>
          <div class="showdown-card-text">${escapeHtml(foundMatch.lore)}</div>
        </div>

        <div class="showdown-smack-wrap">
          <div style="font-size:0.75rem; font-weight:800; color:#38bdf8;"><span>💬 Office Watercooler</span></div>
          <div class="smack-bubble">
            <img src="${s1.avatar}" class="smack-avatar-mini" alt="${escapeHtml(s1.name)}">
            <div class="smack-content">
              <span class="smack-author">${escapeHtml(s1.name)}:</span>
              <span class="smack-quote">"${escapeHtml(foundMatch.smack1)}"</span>
            </div>
          </div>
          <div class="smack-bubble">
            <img src="${s2.avatar}" class="smack-avatar-mini" alt="${escapeHtml(s2.name)}">
            <div class="smack-content">
              <span class="smack-author">${escapeHtml(s2.name)}:</span>
              <span class="smack-quote">"${escapeHtml(foundMatch.smack2)}"</span>
            </div>
          </div>
        </div>
      `;

      this.dom.showdownModalOverlay.classList.add('open');
      this.dom.showdownModalOverlay.style.display = 'flex';
    }

    closeShowdownModal() {
      if (!this.dom.showdownModalOverlay) return;
      this.dom.showdownModalOverlay.classList.remove('open');
      this.dom.showdownModalOverlay.style.display = 'none';
    }

    // =========================================================================
    // FULL REAL-TIME ESPN BOX SCORE MODAL (ZERO FAKE DATA!)
    // =========================================================================

    openBoxScoreModal(matchupData, mode = 'CURRENT') {
      if (!this.dom.boxScoreModalContent || !this.dom.boxScoreModalOverlay) return;

      let activeMode = mode;
      let selectedGame = null;

      if (matchupData) {
        if (matchupData.eventId) {
          selectedGame = this.currentWeekGames.find(g => g.eventId === matchupData.eventId)
            || this.lastWeekGames.find(g => g.eventId === matchupData.eventId);
          if (selectedGame && this.lastWeekGames.includes(selectedGame) && !this.currentWeekGames.includes(selectedGame)) {
            activeMode = 'LAST_WEEK';
          }
        }
        if (!selectedGame && matchupData.away && matchupData.home) {
          const awayCode = normalizeAbbr(typeof matchupData.away === 'string' ? matchupData.away : matchupData.away.code);
          const homeCode = normalizeAbbr(typeof matchupData.home === 'string' ? matchupData.home : matchupData.home.code);
          const cur = this.currentWeekGames.find(g => g.away === awayCode && g.home === homeCode);
          const prev = this.lastWeekGames.find(g => g.away === awayCode && g.home === homeCode);
          if (mode === 'LAST_WEEK' && prev) {
            selectedGame = prev;
            activeMode = 'LAST_WEEK';
          } else if (cur) {
            selectedGame = cur;
            activeMode = 'CURRENT';
          } else if (prev) {
            selectedGame = prev;
            activeMode = 'LAST_WEEK';
          }
        }
      }

      const gamesList = activeMode === 'LAST_WEEK' ? this.lastWeekGames : this.currentWeekGames;
      if (!selectedGame && gamesList.length > 0) {
        selectedGame = gamesList[0];
      }

      this.dom.boxScoreModalOverlay.classList.add('open');
      this.dom.boxScoreModalOverlay.style.display = 'flex';
      this.renderBoxScoreModalContent(selectedGame, gamesList, activeMode);
    }

    async renderBoxScoreModalContent(activeGame, gamesList, mode) {
      if (!activeGame) {
        this.dom.boxScoreModalContent.innerHTML = `<div style="padding:2rem; text-align:center; color:#94a3b8;">No games loaded for this week yet.</div>`;
        return;
      }

      const awayCode = normalizeAbbr(activeGame.away);
      const homeCode = normalizeAbbr(activeGame.home);
      const awayTeam = this.getTeamMeta(awayCode);
      const homeTeam = this.getTeamMeta(homeCode);

      if (this.dom.boxScoreBadgeStatus) {
        this.dom.boxScoreBadgeStatus.textContent = mode === 'LAST_WEEK'
          ? `📅 WEEK ${this.prevWeekNumber} BOX SCORE`
          : `📊 WEEK ${this.currentWeek} LIVE BOX SCORE`;
      }
      if (this.dom.boxScoreVenueTime) {
        this.dom.boxScoreVenueTime.textContent = `${activeGame.status} • ${activeGame.venue || homeTeam.stadium}`;
      }

      // Render header + loading skeleton while fetching real ESPN summary
      const selectorHtml = `
        <div class="box-score-week-tabs">
          <button class="box-week-tab-btn ${mode === 'CURRENT' ? 'active' : ''}" data-target-mode="CURRENT">
            ⚡ WEEK ${this.currentWeek} (${this.currentWeekGames.length} GAMES)
          </button>
          <button class="box-week-tab-btn ${mode === 'LAST_WEEK' ? 'active' : ''}" data-target-mode="LAST_WEEK">
            📅 LAST WEEK — WK ${this.prevWeekNumber} (${this.lastWeekGames.length} GAMES)
          </button>
        </div>

        <div class="box-score-game-selector">
          ${gamesList.map((g, idx) => {
            const isActive = g.eventId ? (g.eventId === activeGame.eventId) : (g.away === awayCode && g.home === homeCode);
            return `
              <button class="box-selector-btn ${isActive ? 'active' : ''}" data-idx="${idx}" title="${g.away} @ ${g.home}">
                ${g.away} ${g.awayScore} @ ${g.home} ${g.homeScore}
              </button>
            `;
          }).join('')}
        </div>
      `;

      this.dom.boxScoreModalContent.innerHTML = `${selectorHtml}<div style="padding:2.5rem; text-align:center; color:#94a3b8;">Loading official ESPN box score for ${awayCode} @ ${homeCode}...</div>`;

      const summary = await this.fetchGameSummary(activeGame.eventId);

      // Extract real linescores, stats, leaders, and scoring drives from ESPN summary
      const headerComp = summary?.header?.competitions?.[0];
      const hAway = headerComp?.competitors?.find(c => c.homeAway === 'away');
      const hHome = headerComp?.competitors?.find(c => c.homeAway === 'home');
      const state = headerComp?.status?.type?.state || activeGame.state || 'pre';

      const awayNum = state === 'pre' ? '-' : (hAway?.score ?? activeGame.awayScore);
      const homeNum = state === 'pre' ? '-' : (hHome?.score ?? activeGame.homeScore);
      const awayRec = hAway?.record?.[0]?.summary || activeGame.awayRec || '';
      const homeRec = hHome?.record?.[0]?.summary || activeGame.homeRec || '';

      const awayLines = (hAway?.linescores || []).map(l => l.displayValue ?? '-');
      const homeLines = (hHome?.linescores || []).map(l => l.displayValue ?? '-');
      const maxPeriods = Math.max(4, awayLines.length, homeLines.length);

      const boxTeams = summary?.boxscore?.teams || [];
      const awayBox = boxTeams.find(t => normalizeAbbr(t.team?.abbreviation) === awayCode);
      const homeBox = boxTeams.find(t => normalizeAbbr(t.team?.abbreviation) === homeCode);

      const awayYards = parseNumeric(getTeamBoxStat(awayBox, 'totalYards'));
      const homeYards = parseNumeric(getTeamBoxStat(homeBox, 'totalYards'));
      const awayPass = parseNumeric(getTeamBoxStat(awayBox, 'netPassingYards'));
      const homePass = parseNumeric(getTeamBoxStat(homeBox, 'netPassingYards'));
      const awayRush = parseNumeric(getTeamBoxStat(awayBox, 'rushingYards'));
      const homeRush = parseNumeric(getTeamBoxStat(homeBox, 'rushingYards'));
      const awayFD = getTeamBoxStat(awayBox, 'firstDowns') || '0';
      const homeFD = getTeamBoxStat(homeBox, 'firstDowns') || '0';
      const away3rd = getTeamBoxStat(awayBox, 'thirdDownEff') || '0-0';
      const home3rd = getTeamBoxStat(homeBox, 'thirdDownEff') || '0-0';
      const awayTO = getTeamBoxStat(awayBox, 'turnovers') || '0';
      const homeTO = getTeamBoxStat(homeBox, 'turnovers') || '0';
      const awayTOP = getTeamBoxStat(awayBox, 'possessionTime') || '--:--';
      const homeTOP = getTeamBoxStat(homeBox, 'possessionTime') || '--:--';

      // Extract real top passers & rushers/receivers
      const getTopPlayer = (abbr, groupName, formatter) => {
        const blk = (summary?.boxscore?.players || []).find(p => normalizeAbbr(p.team?.abbreviation) === abbr);
        const grp = blk?.statistics?.find(s => s.name === groupName);
        const top = grp?.athletes?.[0];
        if (!top) return { name: '—', line: 'No stats recorded' };
        return { name: top.athlete?.displayName || '—', line: formatter(grp, top) };
      };

      const awayPasser = getTopPlayer(awayCode, 'passing', (g, a) =>
        `${getStatByKey(g, a, 'completions/passingAttempts')}, ${getStatByKey(g, a, 'passingYards')} YDS, ${getStatByKey(g, a, 'passingTouchdowns')} TD, ${getStatByKey(g, a, 'interceptions')} INT`);
      const homePasser = getTopPlayer(homeCode, 'passing', (g, a) =>
        `${getStatByKey(g, a, 'completions/passingAttempts')}, ${getStatByKey(g, a, 'passingYards')} YDS, ${getStatByKey(g, a, 'passingTouchdowns')} TD, ${getStatByKey(g, a, 'interceptions')} INT`);
      const awayRusher = getTopPlayer(awayCode, 'rushing', (g, a) =>
        `${getStatByKey(g, a, 'rushingAttempts')} CAR, ${getStatByKey(g, a, 'rushingYards')} YDS, ${getStatByKey(g, a, 'rushingTouchdowns')} TD`);
      const homeRusher = getTopPlayer(homeCode, 'rushing', (g, a) =>
        `${getStatByKey(g, a, 'rushingAttempts')} CAR, ${getStatByKey(g, a, 'rushingYards')} YDS, ${getStatByKey(g, a, 'rushingTouchdowns')} TD`);
      const awayReceiver = getTopPlayer(awayCode, 'receiving', (g, a) =>
        `${getStatByKey(g, a, 'receptions')} REC, ${getStatByKey(g, a, 'receivingYards')} YDS, ${getStatByKey(g, a, 'receivingTouchdowns')} TD`);
      const homeReceiver = getTopPlayer(homeCode, 'receiving', (g, a) =>
        `${getStatByKey(g, a, 'receptions')} REC, ${getStatByKey(g, a, 'receivingYards')} YDS, ${getStatByKey(g, a, 'receivingTouchdowns')} TD`);

      const scoringPlays = summary?.scoringPlays || [];
      const pctBar = (a, b) => {
        const tot = (a || 0) + (b || 0);
        if (tot <= 0) return [50, 50];
        return [(a / tot) * 100, (b / tot) * 100];
      };
      const [yBarA, yBarH] = pctBar(awayYards, homeYards);
      const [pBarA, pBarH] = pctBar(awayPass, homePass);
      const [rBarA, rBarH] = pctBar(awayRush, homeRush);
      const [fdBarA, fdBarH] = pctBar(parseNumeric(awayFD), parseNumeric(homeFD));

      const periodHeaders = Array.from({ length: maxPeriods }, (_, i) => i < 4 ? `Q${i + 1}` : `OT${i > 4 ? i - 3 : ''}`);

      this.dom.boxScoreModalContent.innerHTML = `
        ${selectorHtml}

        <!-- Hero Scoreboard -->
        <div class="box-score-hero">
          <div class="box-hero-team away">
            <img src="${awayTeam.logo}" class="box-hero-logo" alt="${awayTeam.name}" onerror="this.src='https://ui-avatars.com/api/?name=${awayTeam.abbreviation}&background=0b1322&color=fff'">
            <div class="box-hero-info">
              <span class="box-hero-name" style="color:${awayTeam.color};">${awayTeam.city}</span>
              <span class="box-hero-sub">${awayTeam.name} ${awayRec ? `(${awayRec})` : ''}</span>
            </div>
          </div>

          <div class="box-hero-score-center">
            <div class="box-hero-score-nums">
              <span class="${parseInt(awayNum, 10) > parseInt(homeNum, 10) ? 'winner-score' : ''}">${awayNum}</span>
              <span style="color:#64748b; font-size:1.3rem;">-</span>
              <span class="${parseInt(homeNum, 10) > parseInt(awayNum, 10) ? 'winner-score' : ''}">${homeNum}</span>
            </div>
            <div class="box-hero-status-pill">${escapeHtml(activeGame.status)}</div>
          </div>

          <div class="box-hero-team home">
            <img src="${homeTeam.logo}" class="box-hero-logo" alt="${homeTeam.name}" onerror="this.src='https://ui-avatars.com/api/?name=${homeTeam.abbreviation}&background=0b1322&color=fff'">
            <div class="box-hero-info">
              <span class="box-hero-name" style="color:${homeTeam.color};">${homeTeam.city}</span>
              <span class="box-hero-sub">${homeTeam.name} ${homeRec ? `(${homeRec})` : ''}</span>
            </div>
          </div>
        </div>

        ${state === 'pre' ? `
          <div style="padding:1.5rem; text-align:center; background:rgba(0,0,0,0.25); border-radius:10px; border:1px solid rgba(255,255,255,0.08); color:#cbd5e1;">
            <div style="font-size:1rem; font-weight:800; color:#facc15; margin-bottom:6px;">⏰ Kickoff: ${escapeHtml(formatArizonaDayTime(activeGame.date))}</div>
            <div style="font-size:0.82rem; color:#94a3b8;">📍 ${escapeHtml(activeGame.venue)} ${activeGame.broadcast ? `• 📺 ${escapeHtml(activeGame.broadcast)}` : ''} ${activeGame.odds ? `• 📊 ${escapeHtml(activeGame.odds)}` : ''}</div>
            <div style="font-size:0.78rem; color:#64748b; margin-top:8px;">Official live box score, player stats, and scoring drives will populate automatically once the game kicks off.</div>
          </div>
        ` : `
          <!-- Real Linescore Table -->
          <div>
            <div class="box-section-title"><span>📋</span> Official Line Score</div>
            <div class="box-linescore-wrap">
              <table class="box-linescore-table">
                <thead>
                  <tr>
                    <th style="text-align:left; padding-left:14px;">Team</th>
                    ${periodHeaders.map(h => `<th>${h}</th>`).join('')}
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="team-cell" style="padding-left:14px;">
                      <img src="${awayTeam.logo}" style="width:16px; height:16px; object-fit:contain;" alt="">
                      <span style="font-weight:800; color:${awayTeam.color};">${awayTeam.abbreviation}</span>
                    </td>
                    ${periodHeaders.map((_, i) => `<td>${awayLines[i] ?? '-'}</td>`).join('')}
                    <td class="total-cell">${awayNum}</td>
                  </tr>
                  <tr>
                    <td class="team-cell" style="padding-left:14px;">
                      <img src="${homeTeam.logo}" style="width:16px; height:16px; object-fit:contain;" alt="">
                      <span style="font-weight:800; color:${homeTeam.color};">${homeTeam.abbreviation}</span>
                    </td>
                    ${periodHeaders.map((_, i) => `<td>${homeLines[i] ?? '-'}</td>`).join('')}
                    <td class="total-cell">${homeNum}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Real Team Comparison Stats -->
          <div>
            <div class="box-section-title"><span>📊</span> Official Team Statistics</div>
            <div class="box-stats-card">
              <div class="box-stat-row">
                <div class="box-stat-labels">
                  <span class="box-stat-val-away">${awayFD}</span>
                  <span class="box-stat-name">First Downs</span>
                  <span class="box-stat-val-home">${homeFD}</span>
                </div>
                <div class="box-stat-bar-track">
                  <div class="box-stat-bar-away" style="width:${fdBarA}%;"></div>
                  <div class="box-stat-bar-home" style="width:${fdBarH}%;"></div>
                </div>
              </div>

              <div class="box-stat-row">
                <div class="box-stat-labels">
                  <span class="box-stat-val-away">${awayYards}</span>
                  <span class="box-stat-name">Total Net Yards</span>
                  <span class="box-stat-val-home">${homeYards}</span>
                </div>
                <div class="box-stat-bar-track">
                  <div class="box-stat-bar-away" style="width:${yBarA}%;"></div>
                  <div class="box-stat-bar-home" style="width:${yBarH}%;"></div>
                </div>
              </div>

              <div class="box-stat-row">
                <div class="box-stat-labels">
                  <span class="box-stat-val-away">${awayPass}</span>
                  <span class="box-stat-name">Net Passing Yards</span>
                  <span class="box-stat-val-home">${homePass}</span>
                </div>
                <div class="box-stat-bar-track">
                  <div class="box-stat-bar-away" style="width:${pBarA}%;"></div>
                  <div class="box-stat-bar-home" style="width:${pBarH}%;"></div>
                </div>
              </div>

              <div class="box-stat-row">
                <div class="box-stat-labels">
                  <span class="box-stat-val-away">${awayRush}</span>
                  <span class="box-stat-name">Rushing Yards</span>
                  <span class="box-stat-val-home">${homeRush}</span>
                </div>
                <div class="box-stat-bar-track">
                  <div class="box-stat-bar-away" style="width:${rBarA}%;"></div>
                  <div class="box-stat-bar-home" style="width:${rBarH}%;"></div>
                </div>
              </div>

              <div class="box-stat-row">
                <div class="box-stat-labels">
                  <span class="box-stat-val-away">${escapeHtml(away3rd)}</span>
                  <span class="box-stat-name">3rd Down Efficiency</span>
                  <span class="box-stat-val-home">${escapeHtml(home3rd)}</span>
                </div>
              </div>

              <div class="box-stat-row">
                <div class="box-stat-labels">
                  <span class="box-stat-val-away">${escapeHtml(awayTO)}</span>
                  <span class="box-stat-name">Turnovers</span>
                  <span class="box-stat-val-home">${escapeHtml(homeTO)}</span>
                </div>
              </div>

              <div class="box-stat-row">
                <div class="box-stat-labels">
                  <span class="box-stat-val-away">${escapeHtml(awayTOP)}</span>
                  <span class="box-stat-name">Possession Time</span>
                  <span class="box-stat-val-home">${escapeHtml(homeTOP)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Real Key Player Leaders -->
          <div>
            <div class="box-section-title"><span>⭐</span> Official Individual Leaders</div>
            <div class="box-leaders-grid">
              <div class="box-leader-card">
                <span class="box-leader-cat">${awayTeam.abbreviation} Passing</span>
                <span class="box-leader-player">${escapeHtml(awayPasser.name)}</span>
                <span class="box-leader-stat">${escapeHtml(awayPasser.line)}</span>
              </div>
              <div class="box-leader-card">
                <span class="box-leader-cat">${homeTeam.abbreviation} Passing</span>
                <span class="box-leader-player">${escapeHtml(homePasser.name)}</span>
                <span class="box-leader-stat">${escapeHtml(homePasser.line)}</span>
              </div>
              <div class="box-leader-card">
                <span class="box-leader-cat">${awayTeam.abbreviation} Rushing</span>
                <span class="box-leader-player">${escapeHtml(awayRusher.name)}</span>
                <span class="box-leader-stat">${escapeHtml(awayRusher.line)}</span>
              </div>
              <div class="box-leader-card">
                <span class="box-leader-cat">${homeTeam.abbreviation} Rushing</span>
                <span class="box-leader-player">${escapeHtml(homeRusher.name)}</span>
                <span class="box-leader-stat">${escapeHtml(homeRusher.line)}</span>
              </div>
              <div class="box-leader-card">
                <span class="box-leader-cat">${awayTeam.abbreviation} Receiving</span>
                <span class="box-leader-player">${escapeHtml(awayReceiver.name)}</span>
                <span class="box-leader-stat">${escapeHtml(awayReceiver.line)}</span>
              </div>
              <div class="box-leader-card">
                <span class="box-leader-cat">${homeTeam.abbreviation} Receiving</span>
                <span class="box-leader-player">${escapeHtml(homeReceiver.name)}</span>
                <span class="box-leader-stat">${escapeHtml(homeReceiver.line)}</span>
              </div>
            </div>
          </div>

          <!-- Real Scoring Drives Summary -->
          <div>
            <div class="box-section-title"><span>🎯</span> Official Scoring Summary</div>
            <div class="box-drives-list">
              ${scoringPlays.length > 0 ? scoringPlays.map(sp => {
                const spAbbr = normalizeAbbr(sp.team?.abbreviation);
                const isHomePlay = spAbbr === homeCode;
                const qLabel = sp.period?.number > 4 ? 'OT' : `Q${sp.period?.number || 1}`;
                const clk = sp.clock?.displayValue || '';
                return `
                  <div class="box-drive-item ${isHomePlay ? 'home-score' : ''}">
                    <span class="box-drive-desc"><strong>${qLabel} ${escapeHtml(clk)}</strong> • ${escapeHtml(spAbbr)} — ${escapeHtml(sp.text || '')}</span>
                    <span class="box-drive-score">${sp.awayScore} - ${sp.homeScore}</span>
                  </div>
                `;
              }).join('') : `<div class="box-drive-item"><span class="box-drive-desc" style="color:#94a3b8;">No scoring plays recorded yet.</span></div>`}
            </div>
          </div>
        `}
      `;

      // Bind week toggle & game switcher buttons
      this.dom.boxScoreModalContent.querySelectorAll('.box-week-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetMode = btn.dataset.targetMode;
          const targetList = targetMode === 'LAST_WEEK' ? this.lastWeekGames : this.currentWeekGames;
          this.renderBoxScoreModalContent(targetList[0], targetList, targetMode);
        });
      });

      this.dom.boxScoreModalContent.querySelectorAll('.box-selector-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          this.renderBoxScoreModalContent(gamesList[idx], gamesList, mode);
        });
      });
    }

    closeBoxScoreModal() {
      if (!this.dom.boxScoreModalOverlay) return;
      this.dom.boxScoreModalOverlay.classList.remove('open');
      this.dom.boxScoreModalOverlay.style.display = 'none';
    }

    // =========================================================================
    // CHALLENGES DRAWER (REAL LIVE WEEK EVALUATION)
    // =========================================================================

    openChallengesDrawer(scroll = true) {
      if (!this.dom.drawerBody || !this.dom.secondaryDrawer) return;
      this.activeDrawer = 'CHALLENGES';
      this.dom.drawerTitle.textContent = `🏆 ${this.currentSeason} Week ${this.currentWeek} Office Football Challenges`;

      const sortedRoster = [...this.roster].sort((a, b) => {
        const bCount = this.getMemberChallengeBadges(b).length;
        const aCount = this.getMemberChallengeBadges(a).length;
        if (bCount !== aCount) return bCount - aCount;
        return (b.liveStats.yards || 0) - (a.liveStats.yards || 0);
      });

      this.dom.drawerBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="ladder-explainer-card" style="border-left:4px solid #10b981; background:linear-gradient(135deg, rgba(16,185,129,0.1), rgba(15,23,42,0.9));">
            <span style="font-size:1.4rem;">⚡</span>
            <div class="ladder-info-text">
              <strong style="color:#10b981;">100% Live ESPN Week ${this.currentWeek} Milestones</strong><br>
              Automatically scored from your team's real ${this.currentSeason} Week ${this.currentWeek} ESPN box score (400+ Yards, 30+ Points, 4+ Sacks, 3+ FGs or 50+ yd Kick, and Game Win).
            </div>
          </div>

          <div class="standings-table-wrap">
            <div style="padding:10px 14px; background:rgba(0,0,0,0.3); font-family:'Outfit',sans-serif; font-size:0.8rem; font-weight:800; color:#facc15; display:flex; justify-content:space-between; align-items:center;">
              <span>🎖️ WEEK ${this.currentWeek} EARNED ACHIEVEMENTS</span>
              <span style="font-size:0.68rem; color:#94a3b8; font-weight:600;">Live ESPN box score telemetry</span>
            </div>
            <table class="dugout-standings-table">
              <thead>
                <tr>
                  <th class="col-team">STAFF MEMBER</th>
                  <th class="col-stat">TEAM</th>
                  <th class="col-stat">WEEK ${this.currentWeek} STATS</th>
                  <th style="text-align:center;">EARNED ICONS</th>
                </tr>
              </thead>
              <tbody>
                ${sortedRoster.map(m => {
                  const badges = this.getMemberChallengeBadges(m);
                  const st = m.liveStats;
                  const statSummary = st.isBye
                    ? 'BYE WEEK'
                    : (!st.hasPlayed ? 'PREGAME' : `${st.pointsScored} PTS • ${st.yards} YDS • ${st.sacks} SCK • ${st.fieldGoals} FG`);
                  return `
                    <tr>
                      <td style="color:#fff; font-weight:800;">${escapeHtml(m.shortName || m.name)}</td>
                      <td style="color:${m.color}; font-weight:800;">${m.teamId}</td>
                      <td class="col-stat" style="font-size:0.7rem; color:#cbd5e1;">${escapeHtml(statSummary)}</td>
                      <td style="text-align:center; font-size:1.1rem; letter-spacing:3px;">
                        ${badges.length > 0
                          ? badges.map(b => `<span title="${escapeHtml(b.label)}" style="cursor:help;">${b.icon}</span>`).join(' ')
                          : `<span style="font-size:0.7rem; color:#64748b; letter-spacing:0;">${st.isBye ? 'Bye' : (st.hasPlayed ? 'None yet' : 'Pending')}</span>`}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
            <div style="background:#0b1322; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); border-top:4px solid #10b981;">
              <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:1.3rem;">🚀</span><span style="font-size:0.68rem; color:#10b981; font-weight:800;">OFFENSE • 400+ YDS</span></div>
              <strong style="color:#10b981; font-size:0.9rem;">400-Yard Aerial Assault</strong>
              <p style="color:#94a3b8; font-size:0.75rem; margin-top:4px;">Awarded when a contender's team reaches 400+ total net yards in Week ${this.currentWeek}.</p>
            </div>
            <div style="background:#0b1322; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); border-top:4px solid #facc15;">
              <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:1.3rem;">🔥</span><span style="font-size:0.68rem; color:#facc15; font-weight:800;">SCORING • 30+ PTS</span></div>
              <strong style="color:#facc15; font-size:0.9rem;">High-Octane Shootout</strong>
              <p style="color:#94a3b8; font-size:0.75rem; margin-top:4px;">Awarded when a contender's team scores 30+ points in Week ${this.currentWeek}.</p>
            </div>
            <div style="background:#0b1322; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); border-top:4px solid #f97316;">
              <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:1.3rem;">💥</span><span style="font-size:0.68rem; color:#fb923c; font-weight:800;">DEFENSE • 4+ SACKS</span></div>
              <strong style="color:#fb923c; font-size:0.9rem;">Sack City Blitz Patrol</strong>
              <p style="color:#94a3b8; font-size:0.75rem; margin-top:4px;">Awarded when a contender's defense records 4+ QB sacks in Week ${this.currentWeek}.</p>
            </div>
            <div style="background:#0b1322; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); border-top:4px solid #38bdf8;">
              <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:1.3rem;">🎯</span><span style="font-size:0.68rem; color:#38bdf8; font-weight:800;">SPECIAL TEAMS • 3+ FG / 50+ YD</span></div>
              <strong style="color:#38bdf8; font-size:0.9rem;">Clutch Kicker Showdown</strong>
              <p style="color:#94a3b8; font-size:0.75rem; margin-top:4px;">Awarded for 3+ made field goals or a 50+ yard clutch kick in Week ${this.currentWeek}.</p>
            </div>
            <div style="background:#0b1322; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); border-top:4px solid #eab308;">
              <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:1.3rem;">🏆</span><span style="font-size:0.68rem; color:#eab308; font-weight:800;">VICTORY • GAME WIN</span></div>
              <strong style="color:#eab308; font-size:0.9rem;">Weekly Game Victory Crown</strong>
              <p style="color:#94a3b8; font-size:0.75rem; margin-top:4px;">Awarded whenever a contender's NFL team wins their Week ${this.currentWeek} game.</p>
            </div>
          </div>
        </div>
      `;
      this.dom.secondaryDrawer.style.display = 'flex';
      if (scroll) this.dom.secondaryDrawer.scrollIntoView({ behavior: 'smooth' });
    }

    // =========================================================================
    // FANTASY DRAWER (100% REAL WEEKLY BOX SCORE STATS)
    // =========================================================================

    openFantasyDrawer(scroll = true) {
      if (!this.dom.drawerBody || !this.dom.secondaryDrawer) return;
      this.activeDrawer = 'FANTASY';
      this.dom.drawerTitle.textContent = `🏈 Automated Fantasy Matchups (${this.currentSeason} • Week ${this.currentWeek})`;

      const sortedByFantasy = [...this.roster].sort((a, b) => {
        if (a.liveStats.isBye !== b.liveStats.isBye) return a.liveStats.isBye ? 1 : -1;
        return (b.fantasy?.totalPoints || 0) - (a.fantasy?.totalPoints || 0);
      });

      // Build Head-to-Head Duels dynamically from active (non-bye) members, plus Bye note for off-week members
      const activeMembers = sortedByFantasy.filter(m => !m.liveStats.isBye);
      const byeMembers = sortedByFantasy.filter(m => m.liveStats.isBye);
      const duels = [];
      for (let i = 0; i < activeMembers.length; i += 2) {
        if (activeMembers[i + 1]) {
          duels.push({
            title: `${activeMembers[i].shortName || activeMembers[i].name} vs ${activeMembers[i + 1].shortName || activeMembers[i + 1].name}`,
            sub: `Week ${this.currentWeek} Automated Fantasy Duel`,
            c1: activeMembers[i],
            c2: activeMembers[i + 1]
          });
        } else {
          const solo = activeMembers[i];
          const oppCode = solo.matchup.away.code === solo.teamId ? solo.matchup.home.code : solo.matchup.away.code;
          const oppMeta = this.getTeamMeta(oppCode);
          const cachedSum = solo.matchup.eventId ? this.summaryCache[solo.matchup.eventId]?.data : null;
          const oppExtracted = cachedSum ? extractTeamStatsAndFantasy(cachedSum, oppCode) : null;
          duels.push({
            title: `${solo.shortName || solo.name} vs ${oppMeta.name} (Solo Spotlight)`,
            sub: `Week ${this.currentWeek} Real Matchup`,
            c1: solo,
            c2: {
              id: null,
              name: oppMeta.name,
              teamId: oppCode,
              teamName: oppMeta.name.toUpperCase(),
              image: oppMeta.logo,
              fantasy: oppExtracted?.fantasy || createEmptyFantasy(`${oppMeta.name}`, `Opponent (${solo.matchup.status})`)
            }
          });
        }
      }

      this.dom.drawerBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background: linear-gradient(135deg, rgba(250, 204, 21, 0.12) 0%, rgba(56, 189, 248, 0.08) 100%); border: 1.5px solid rgba(250, 204, 21, 0.3); border-radius: 12px; padding: 14px 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:6px;">
              <span style="font-family:'Outfit',sans-serif; font-size:0.95rem; font-weight:800; color:#facc15;">⚡ 100% AUTOMATED FROM REAL ${this.currentSeason} ESPN STATS</span>
              <span style="font-size:0.7rem; font-weight:800; background:rgba(16,185,129,0.2); color:#10b981; border:1px solid rgba(16,185,129,0.4); padding:2px 8px; border-radius:12px;">ACTIVE • WEEK ${this.currentWeek}</span>
            </div>
            <p style="font-size:0.78rem; color:#cbd5e1; line-height:1.45; margin:0;">
              Live points computed automatically from official ESPN Week ${this.currentWeek} box scores across
              <strong style="color:#38bdf8;">QB</strong>,
              <strong style="color:#a78bfa;">Top Receiver (PPR)</strong>,
              <strong style="color:#34d399;">Top Rusher</strong>,
              <strong style="color:#fb923c;">Team Defense</strong>, and
              <strong style="color:#f472b6;">Special Teams</strong>.
            </p>
          </div>

          <div class="standings-table-wrap" style="background:#091322; border-radius:12px; border:1px solid rgba(255,255,255,0.08); overflow:hidden;">
            <div style="padding:10px 14px; background:rgba(0,0,0,0.3); font-family:'Outfit',sans-serif; font-size:0.8rem; font-weight:800; color:#38bdf8; display:flex; justify-content:space-between; align-items:center;">
              <span>🏆 OFFICE FANTASY LEADERBOARD (WEEK ${this.currentWeek})</span>
              <span style="font-size:0.68rem; color:#94a3b8; font-weight:600;">Click any row for player breakdown</span>
            </div>
            <table class="dugout-standings-table">
              <thead>
                <tr>
                  <th style="width:40px; text-align:center;">RANK</th>
                  <th class="col-team">COWORKER / TEAM</th>
                  <th class="col-stat">QB</th>
                  <th class="col-stat">REC</th>
                  <th class="col-stat">RUSH</th>
                  <th class="col-stat">DEF</th>
                  <th class="col-stat">ST</th>
                  <th class="col-stat" style="color:#facc15; font-weight:900;">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${sortedByFantasy.map((m, idx) => {
                  const isBye = m.liveStats.isBye;
                  const f = m.fantasy;
                  return `
                    <tr class="fantasy-leaderboard-row" data-member-id="${m.id}" style="cursor:pointer;" title="Click to view full player details">
                      <td style="text-align:center; font-weight:900; color:${isBye ? '#64748b' : (idx === 0 ? '#facc15' : (idx === 1 ? '#cbd5e1' : (idx === 2 ? '#fb923c' : '#64748b')))};">${isBye ? 'BYE' : '#' + (idx + 1)}</td>
                      <td style="font-weight:700; color:#fff; display:flex; align-items:center; gap:8px;">
                        <img src="${m.image}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;" alt="">
                        <span>${escapeHtml(m.shortName || m.name)} <span style="font-size:0.7rem; color:${m.color}; font-weight:800;">(${m.teamId})</span></span>
                      </td>
                      <td class="col-stat" style="font-family:'JetBrains Mono',monospace;">${isBye ? '—' : f.qb.points.toFixed(1)}</td>
                      <td class="col-stat" style="font-family:'JetBrains Mono',monospace;">${isBye ? '—' : f.rec.points.toFixed(1)}</td>
                      <td class="col-stat" style="font-family:'JetBrains Mono',monospace;">${isBye ? '—' : f.rush.points.toFixed(1)}</td>
                      <td class="col-stat" style="font-family:'JetBrains Mono',monospace;">${isBye ? '—' : f.def.points.toFixed(1)}</td>
                      <td class="col-stat" style="font-family:'JetBrains Mono',monospace;">${isBye ? '—' : f.st.points.toFixed(1)}</td>
                      <td class="col-stat" style="color:#facc15; font-weight:900; font-size:0.95rem; font-family:'JetBrains Mono',monospace;">${isBye ? 'BYE' : f.totalPoints.toFixed(1)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          ${byeMembers.length > 0 ? `
            <div style="font-size:0.75rem; color:#94a3b8; background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.12); border-radius:8px; padding:8px 12px;">
              🛌 <strong>Week ${this.currentWeek} Bye Week:</strong> ${byeMembers.map(b => `${b.shortName || b.name} (${b.teamId})`).join(', ')}
            </div>
          ` : ''}

          <div style="font-family:'Outfit',sans-serif; font-size:0.9rem; font-weight:800; color:#cbd5e1; letter-spacing:0.5px; margin-top:4px;">
            ⚔️ WEEK ${this.currentWeek} HEAD-TO-HEAD FANTASY BATTLES
          </div>

          <div class="fantasy-matchups-grid">
            ${duels.map(d => {
              const pts1 = d.c1.fantasy?.totalPoints || 0;
              const pts2 = d.c2.fantasy?.totalPoints || 0;
              return `
                <div class="fantasy-duel-card">
                  <div class="fantasy-duel-header">
                    <span>${escapeHtml(d.title)}</span>
                    <span style="color:#facc15;">${escapeHtml(d.sub)}</span>
                  </div>
                  <div class="fantasy-contenders-row">
                    <div class="fantasy-contender-box ${pts1 >= pts2 ? 'leading' : ''} ${d.c1.id ? 'interactive-fantasy-box' : ''}" data-member-id="${d.c1.id || ''}" style="cursor:pointer;">
                      <img src="${d.c1.image}" class="fantasy-contender-avatar" alt="${escapeHtml(d.c1.name)}">
                      <div class="fantasy-contender-meta">
                        <span class="fantasy-contender-name">${escapeHtml(d.c1.shortName || d.c1.name)}</span>
                        <span class="fantasy-contender-team" style="color:${this.getTeamMeta(d.c1.teamId).color};">${d.c1.teamName}</span>
                      </div>
                      <div class="fantasy-contender-score">${pts1.toFixed(1)} <span style="font-size:0.65rem; color:#94a3b8;">PTS</span></div>
                    </div>
                    <span class="fantasy-vs-separator">VS</span>
                    <div class="fantasy-contender-box ${pts2 > pts1 ? 'leading' : ''} ${d.c2.id ? 'interactive-fantasy-box' : ''}" data-member-id="${d.c2.id || ''}" style="cursor:pointer;">
                      <img src="${d.c2.image}" class="fantasy-contender-avatar" alt="${escapeHtml(d.c2.name)}">
                      <div class="fantasy-contender-meta">
                        <span class="fantasy-contender-name">${escapeHtml(d.c2.shortName || d.c2.name)}</span>
                        <span class="fantasy-contender-team" style="color:${this.getTeamMeta(d.c2.teamId).color};">${d.c2.teamName}</span>
                      </div>
                      <div class="fantasy-contender-score">${pts2.toFixed(1)} <span style="font-size:0.65rem; color:#94a3b8;">PTS</span></div>
                    </div>
                  </div>
                  <div class="fantasy-category-pill-row">
                    <span style="color:#facc15; font-weight:700;">BREAKDOWN:</span>
                    <span><strong style="color:#38bdf8;">QB</strong>: ${(d.c1.fantasy?.qb?.points || 0).toFixed(1)} vs ${(d.c2.fantasy?.qb?.points || 0).toFixed(1)}</span>
                    <span>•</span>
                    <span><strong style="color:#a78bfa;">REC</strong>: ${(d.c1.fantasy?.rec?.points || 0).toFixed(1)} vs ${(d.c2.fantasy?.rec?.points || 0).toFixed(1)}</span>
                    <span>•</span>
                    <span><strong style="color:#34d399;">RUSH</strong>: ${(d.c1.fantasy?.rush?.points || 0).toFixed(1)} vs ${(d.c2.fantasy?.rush?.points || 0).toFixed(1)}</span>
                    <span>•</span>
                    <span><strong style="color:#fb923c;">DEF</strong>: ${(d.c1.fantasy?.def?.points || 0).toFixed(1)} vs ${(d.c2.fantasy?.def?.points || 0).toFixed(1)}</span>
                    <span>•</span>
                    <span><strong style="color:#f472b6;">ST</strong>: ${(d.c1.fantasy?.st?.points || 0).toFixed(1)} vs ${(d.c2.fantasy?.st?.points || 0).toFixed(1)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      this.dom.drawerBody.querySelectorAll('.fantasy-leaderboard-row, .interactive-fantasy-box').forEach(el => {
        el.addEventListener('click', () => {
          const mId = el.dataset.memberId;
          if (mId) this.openMemberModal(mId);
        });
      });

      this.dom.secondaryDrawer.style.display = 'flex';
      if (scroll) this.dom.secondaryDrawer.scrollIntoView({ behavior: 'smooth' });
    }

    // =========================================================================
    // STANDINGS DRAWER (REAL LIVE NFL RECORDS)
    // =========================================================================

    openStandingsDrawer(scroll = true) {
      if (!this.dom.drawerBody || !this.dom.secondaryDrawer) return;
      this.activeDrawer = 'STANDINGS';
      this.dom.drawerTitle.textContent = `📊 ${this.currentSeason} Office Football Season Standings (Week ${this.currentWeek})`;

      const sorted = [...this.roster].sort((a, b) => {
        if (b.picks.winPercent !== a.picks.winPercent) return b.picks.winPercent - a.picks.winPercent;
        return b.picks.wins - a.picks.wins;
      });

      this.dom.drawerBody.innerHTML = `
        <div class="standings-table-wrap">
          <table class="dugout-standings-table">
            <thead>
              <tr>
                <th style="width:40px; text-align:center;">SEED</th>
                <th class="col-team">STAFF MEMBER</th>
                <th class="col-team">TEAM</th>
                <th class="col-stat">W</th>
                <th class="col-stat">L</th>
                <th class="col-stat">PCT</th>
                <th class="col-stat">STREAK</th>
              </tr>
            </thead>
            <tbody>
              ${sorted.map((m, idx) => `
                <tr class="standings-member-row" data-member-id="${m.id}" style="cursor:pointer;">
                  <td style="text-align:center; font-weight:900; color:${idx === 0 ? '#facc15' : '#94a3b8'};">#${idx + 1}</td>
                  <td style="color:#fff; font-weight:700;">${escapeHtml(m.shortName || m.name)}</td>
                  <td style="color:${m.color}; font-weight:800;">${m.teamName}</td>
                  <td class="col-stat">${m.picks.wins}</td>
                  <td class="col-stat">${m.picks.ties > 0 ? `${m.picks.losses}-${m.picks.ties}` : m.picks.losses}</td>
                  <td class="col-stat">${m.picks.pct}</td>
                  <td class="col-stat" style="color:${String(m.picks.streak).startsWith('W') ? '#10b981' : '#f87171'}; font-weight:800;">${escapeHtml(m.picks.streak)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      this.dom.drawerBody.querySelectorAll('.standings-member-row').forEach(row => {
        row.addEventListener('click', () => this.openMemberModal(row.dataset.memberId));
      });

      this.dom.secondaryDrawer.style.display = 'flex';
      if (scroll) this.dom.secondaryDrawer.scrollIntoView({ behavior: 'smooth' });
    }

    closeDrawer() {
      this.activeDrawer = null;
      if (this.dom.secondaryDrawer) {
        this.dom.secondaryDrawer.style.display = 'none';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const app = new DugoutEndzoneApp();
    window.app = app;
    app.init();
  });
})();
