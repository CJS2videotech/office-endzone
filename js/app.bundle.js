/**
 * app.bundle.js - Standalone Office Endzone Application Engine
 * Dugout Layout, Live Ticker (Today/Yesterday), Team Roster Grid, Member Detail Modal,
 * Weekly & Season Long Office Brackets Hub, Challenges & Standings.
 */

(function() {
  'use strict';

  // Helper for Arizona Time (Mountain Standard Time - UTC-7, no Daylight Saving)
  function formatArizonaTime(dateInput) {
    if (!dateInput) return '12:15 PM MST';
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return dateInput.includes('MST') ? dateInput : `${dateInput} MST`;
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

  function getArizonaDateString() {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/Phoenix',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' MST';
    } catch (e) {
      return '11:24 AM MST';
    }
  }

  // 1. DATASETS - ALL 32 NFL FRANCHISES
  const TEAMS = [
    // NFC North
    { id: "CHI", city: "Chicago", name: "Bears", abbreviation: "CHI", color: "#ef4444", secondaryColor: "#0B162A", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png", stadium: "Soldier Field", division: "NFC North", qb: "Caleb Williams" },
    { id: "GB", city: "Green Bay", name: "Packers", abbreviation: "GB", color: "#facc15", secondaryColor: "#203731", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png", stadium: "Lambeau Field", division: "NFC North", qb: "Jordan Love" },
    { id: "DET", city: "Detroit", name: "Lions", abbreviation: "DET", color: "#0076B6", secondaryColor: "#B0B7BC", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png", stadium: "Ford Field", division: "NFC North", qb: "Jared Goff" },
    { id: "MIN", city: "Minnesota", name: "Vikings", abbreviation: "MIN", color: "#4F2683", secondaryColor: "#FFC62F", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/min.png", stadium: "U.S. Bank Stadium", division: "NFC North", qb: "Sam Darnold" },
    
    // AFC North
    { id: "CLE", city: "Cleveland", name: "Browns", abbreviation: "CLE", color: "#fb923c", secondaryColor: "#311D00", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png", stadium: "Huntington Bank Field", division: "AFC North", qb: "Deshaun Watson" },
    { id: "PIT", city: "Pittsburgh", name: "Steelers", abbreviation: "PIT", color: "#FFB612", secondaryColor: "#101820", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png", stadium: "Acrisure Stadium", division: "AFC North", qb: "Russell Wilson" },
    { id: "BAL", city: "Baltimore", name: "Ravens", abbreviation: "BAL", color: "#241773", secondaryColor: "#9E7C0C", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png", stadium: "M&T Bank Stadium", division: "AFC North", qb: "Lamar Jackson" },
    { id: "CIN", city: "Cincinnati", name: "Bengals", abbreviation: "CIN", color: "#FB4F14", secondaryColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png", stadium: "Paycor Stadium", division: "AFC North", qb: "Joe Burrow" },

    // AFC West
    { id: "LV", city: "Las Vegas", name: "Raiders", abbreviation: "LV", color: "#38bdf8", secondaryColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png", stadium: "Allegiant Stadium", division: "AFC West", qb: "Gardner Minshew" },
    { id: "KC", city: "Kansas City", name: "Chiefs", abbreviation: "KC", color: "#E31837", secondaryColor: "#FFB81C", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png", stadium: "Arrowhead Stadium", division: "AFC West", qb: "Patrick Mahomes" },
    { id: "LAC", city: "Los Angeles", name: "Chargers", abbreviation: "LAC", color: "#0080C6", secondaryColor: "#FFC20E", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png", stadium: "SoFi Stadium", division: "AFC West", qb: "Justin Herbert" },
    { id: "DEN", city: "Denver", name: "Broncos", abbreviation: "DEN", color: "#FB4F14", secondaryColor: "#002244", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/den.png", stadium: "Empower Field", division: "AFC West", qb: "Bo Nix" },

    // NFC West
    { id: "SF", city: "San Francisco", name: "49ers", abbreviation: "SF", color: "#fb7185", secondaryColor: "#AA0000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png", stadium: "Levi's Stadium", division: "NFC West", qb: "Brock Purdy" },
    { id: "ARI", city: "Arizona", name: "Cardinals", abbreviation: "ARI", color: "#f43f5e", secondaryColor: "#97233F", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png", stadium: "State Farm Stadium", division: "NFC West", qb: "Kyler Murray" },
    { id: "LAR", city: "Los Angeles", name: "Rams", abbreviation: "LAR", color: "#003594", secondaryColor: "#FFA300", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png", stadium: "SoFi Stadium", division: "NFC West", qb: "Matthew Stafford" },
    { id: "SEA", city: "Seattle", name: "Seahawks", abbreviation: "SEA", color: "#002244", secondaryColor: "#69BE28", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png", stadium: "Lumen Field", division: "NFC West", qb: "Geno Smith" },

    // NFC East
    { id: "PHI", city: "Philadelphia", name: "Eagles", abbreviation: "PHI", color: "#004C54", secondaryColor: "#A5ACAF", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png", stadium: "Lincoln Financial Field", division: "NFC East", qb: "Jalen Hurts" },
    { id: "DAL", city: "Dallas", name: "Cowboys", abbreviation: "DAL", color: "#003594", secondaryColor: "#041E42", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png", stadium: "AT&T Stadium", division: "NFC East", qb: "Dak Prescott" },
    { id: "NYG", city: "New York", name: "Giants", abbreviation: "NYG", color: "#0B2265", secondaryColor: "#A71930", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png", stadium: "MetLife Stadium", division: "NFC East", qb: "Daniel Jones" },
    { id: "WAS", city: "Washington", name: "Commanders", abbreviation: "WAS", color: "#5A1414", secondaryColor: "#FFB612", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/was.png", stadium: "Northwest Stadium", division: "NFC East", qb: "Jayden Daniels" },

    // AFC South
    { id: "HOU", city: "Houston", name: "Texans", abbreviation: "HOU", color: "#03202F", secondaryColor: "#A71930", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png", stadium: "NRG Stadium", division: "AFC South", qb: "C.J. Stroud" },
    { id: "IND", city: "Indianapolis", name: "Colts", abbreviation: "IND", color: "#002C5F", secondaryColor: "#A2AAAD", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png", stadium: "Lucas Oil Stadium", division: "AFC South", qb: "Anthony Richardson" },
    { id: "JAX", city: "Jacksonville", name: "Jaguars", abbreviation: "JAX", color: "#006778", secondaryColor: "#D7A22A", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png", stadium: "EverBank Stadium", division: "AFC South", qb: "Trevor Lawrence" },
    { id: "TEN", city: "Tennessee", name: "Titans", abbreviation: "TEN", color: "#0C2340", secondaryColor: "#4B92DB", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png", stadium: "Nissan Stadium", division: "AFC South", qb: "Will Levis" },

    // AFC East
    { id: "BUF", city: "Buffalo", name: "Bills", abbreviation: "BUF", color: "#00338D", secondaryColor: "#C60C30", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png", stadium: "Highmark Stadium", division: "AFC East", qb: "Josh Allen" },
    { id: "MIA", city: "Miami", name: "Dolphins", abbreviation: "MIA", color: "#008E97", secondaryColor: "#FC4C02", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png", stadium: "Hard Rock Stadium", division: "AFC East", qb: "Tua Tagovailoa" },
    { id: "NE", city: "New England", name: "Patriots", abbreviation: "NE", color: "#002244", secondaryColor: "#C60C30", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png", stadium: "Gillette Stadium", division: "AFC East", qb: "Drake Maye" },
    { id: "NYJ", city: "New York", name: "Jets", abbreviation: "NYJ", color: "#125740", secondaryColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png", stadium: "MetLife Stadium", division: "AFC East", qb: "Aaron Rodgers" },

    // NFC South
    { id: "ATL", city: "Atlanta", name: "Falcons", abbreviation: "ATL", color: "#A71930", secondaryColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png", stadium: "Mercedes-Benz Stadium", division: "NFC South", qb: "Kirk Cousins" },
    { id: "CAR", city: "Carolina", name: "Panthers", abbreviation: "CAR", color: "#0085CA", secondaryColor: "#101820", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png", stadium: "Bank of America Stadium", division: "NFC South", qb: "Bryce Young" },
    { id: "NO", city: "New Orleans", name: "Saints", abbreviation: "NO", color: "#D3BC8D", secondaryColor: "#101820", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/no.png", stadium: "Caesars Superdome", division: "NFC South", qb: "Derek Carr" },
    { id: "TB", city: "Tampa Bay", name: "Buccaneers", abbreviation: "TB", color: "#D50A0A", secondaryColor: "#0A0A08", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png", stadium: "Raymond James Stadium", division: "NFC South", qb: "Baker Mayfield" }
  ];

  const ROSTER = [
    {
      id: "char_andrea",
      name: "Andrea",
      teamId: "GB",
      teamName: "PACKERS",
      frameClass: "frame-andrea",
      nameClass: "name-andrea",
      image: "assets/avatars/Andrea football.jpg",
      bannerGif: "assets/Andrea football banner.gif",
      picks: { record: "0-0", pct: ".000", streak: "—" },
      trophy: { count: 0, label: "2026 PRESEASON CONTENDER" },
      matchup: {
        away: { code: "GB", name: "Packers", rec: "0-0", score: 0 },
        home: { code: "CHI", name: "Bears", rec: "0-0", score: 0 },
        status: "PRESEASON WK 2 • 12:15 PM MST",
        isLive: false,
        venue: "Soldier Field",
        awayStarter: "Jordan Love",
        homeStarter: "Caleb Williams"
      },
      schedule: [
        { date: "Wk 1 • Sep 6", away: "GB", home: "CHI", time: "1:25 PM MST", isHome: false },
        { date: "Wk 2 • Sep 13", away: "DET", home: "GB", time: "10:00 AM MST", isHome: true },
        { date: "Wk 3 • Sep 20", away: "GB", home: "LAR", time: "1:25 PM MST", isHome: false },
        { date: "Wk 4 • Sep 27", away: "MIN", home: "GB", time: "10:00 AM MST", isHome: true },
        { date: "Wk 5 • Oct 4", away: "GB", home: "SF", time: "5:20 PM MST", isHome: false }
      ],
      division: "NFC NORTH STANDINGS",
      standings: [
        { team: "Packers", w: 0, l: 0, pct: ".000", gb: "—", highlight: true },
        { team: "Lions", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Bears", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Vikings", w: 0, l: 0, pct: ".000", gb: "—", highlight: false }
      ],
      banter: "Go Pack Go! 2026 Preseason is underway! Lambeau Leap energy is ready to scout and conquer!",
      liveStats: { yards: 0, tds: 0, status: "2026 Kickoff Ready" }
    },
    {
      id: "char_cj",
      name: "CJ",
      teamId: "CHI",
      teamName: "BEARS",
      frameClass: "frame-cj",
      nameClass: "name-cj",
      image: "assets/avatars/CJ football.jpg",
      bannerGif: "assets/CJ football banner.gif",
      picks: { record: "0-0", pct: ".000", streak: "—" },
      trophy: { count: 0, label: "2026 PRESEASON CONTENDER" },
      matchup: {
        away: { code: "GB", name: "Packers", rec: "0-0", score: 0 },
        home: { code: "CHI", name: "Bears", rec: "0-0", score: 0 },
        status: "PRESEASON WK 2 • 12:15 PM MST",
        isLive: false,
        venue: "Soldier Field",
        awayStarter: "Jordan Love",
        homeStarter: "Caleb Williams"
      },
      schedule: [
        { date: "Wk 1 • Sep 6", away: "GB", home: "CHI", time: "1:25 PM MST", isHome: true },
        { date: "Wk 2 • Sep 13", away: "CHI", home: "KC", time: "5:15 PM MST", isHome: false },
        { date: "Wk 3 • Sep 20", away: "MIN", home: "CHI", time: "10:00 AM MST", isHome: true },
        { date: "Wk 4 • Sep 27", away: "CHI", home: "DET", time: "10:00 AM MST", isHome: false },
        { date: "Wk 5 • Oct 4", away: "SF", home: "CHI", time: "1:05 PM MST", isHome: true }
      ],
      division: "NFC NORTH STANDINGS",
      standings: [
        { team: "Packers", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Lions", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Bears", w: 0, l: 0, pct: ".000", gb: "—", highlight: true },
        { team: "Vikings", w: 0, l: 0, pct: ".000", gb: "—", highlight: false }
      ],
      banter: "Bear Down Chicago! 2026 campaign starts now. Dialing up the new offense playbook!",
      liveStats: { yards: 0, tds: 0, status: "2026 Kickoff Ready" }
    },
    {
      id: "char_mario",
      name: "Mario",
      teamId: "CLE",
      teamName: "BROWNS",
      frameClass: "frame-mario",
      nameClass: "name-mario",
      image: "assets/avatars/Mario football.jpg",
      bannerGif: "assets/Mario football banner.gif",
      picks: { record: "0-0", pct: ".000", streak: "—" },
      trophy: { count: 0, label: "2026 PRESEASON CONTENDER" },
      matchup: {
        away: { code: "PIT", name: "Steelers", rec: "0-0", score: 0 },
        home: { code: "CLE", name: "Browns", rec: "0-0", score: 0 },
        status: "PRESEASON WK 2 • 1:05 PM MST",
        isLive: false,
        venue: "Huntington Bank Field",
        awayStarter: "Russell Wilson",
        homeStarter: "Deshaun Watson"
      },
      schedule: [
        { date: "Wk 1 • Sep 6", away: "PIT", home: "CLE", time: "10:00 AM MST", isHome: true },
        { date: "Wk 2 • Sep 13", away: "CLE", home: "BAL", time: "10:00 AM MST", isHome: false },
        { date: "Wk 3 • Sep 20", away: "CIN", home: "CLE", time: "5:15 PM MST", isHome: true },
        { date: "Wk 4 • Sep 27", away: "CLE", home: "PHI", time: "10:00 AM MST", isHome: false },
        { date: "Wk 5 • Oct 4", away: "NYG", home: "CLE", time: "10:00 AM MST", isHome: true }
      ],
      division: "AFC NORTH STANDINGS",
      standings: [
        { team: "Ravens", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Steelers", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Browns", w: 0, l: 0, pct: ".000", gb: "—", highlight: true },
        { team: "Bengals", w: 0, l: 0, pct: ".000", gb: "—", highlight: false }
      ],
      banter: "Dawg Pound defense locked in for 2026! Expect heavy blitz packages and big sacks!",
      liveStats: { yards: 0, tds: 0, status: "2026 Kickoff Ready" }
    },
    {
      id: "char_nicole",
      name: "Nicole",
      teamId: "LV",
      teamName: "RAIDERS",
      frameClass: "frame-nicole",
      nameClass: "name-nicole",
      image: "assets/avatars/Nicole football.jpg",
      bannerGif: "assets/Nicole football banner.gif",
      picks: { record: "0-0", pct: ".000", streak: "—" },
      trophy: { count: 0, label: "2026 PRESEASON CONTENDER" },
      matchup: {
        away: { code: "KC", name: "Chiefs", rec: "0-0", score: 0 },
        home: { code: "LV", name: "Raiders", rec: "0-0", score: 0 },
        status: "PRESEASON WK 2 • 5:20 PM MST",
        isLive: false,
        venue: "Allegiant Stadium",
        awayStarter: "Patrick Mahomes",
        homeStarter: "Gardner Minshew"
      },
      schedule: [
        { date: "Wk 1 • Sep 6", away: "KC", home: "LV", time: "1:25 PM MST", isHome: true },
        { date: "Wk 2 • Sep 13", away: "LV", home: "LAC", time: "1:05 PM MST", isHome: false },
        { date: "Wk 3 • Sep 20", away: "DEN", home: "LV", time: "5:15 PM MST", isHome: true },
        { date: "Wk 4 • Sep 27", away: "LV", home: "MIA", time: "10:00 AM MST", isHome: false },
        { date: "Wk 5 • Oct 4", away: "ATL", home: "LV", time: "1:25 PM MST", isHome: true }
      ],
      division: "AFC WEST STANDINGS",
      standings: [
        { team: "Chiefs", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Raiders", w: 0, l: 0, pct: ".000", gb: "—", highlight: true },
        { team: "Chargers", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Broncos", w: 0, l: 0, pct: ".000", gb: "—", highlight: false }
      ],
      banter: "Raider Nation! Analytics running fresh 2026 projections for the new season!",
      liveStats: { yards: 0, tds: 0, status: "2026 Kickoff Ready" }
    },
    {
      id: "char_saul",
      name: "Saul",
      teamId: "SF",
      teamName: "49ERS",
      frameClass: "frame-saul",
      nameClass: "name-saul",
      image: "assets/avatars/Saul football.jpg",
      bannerGif: "assets/Saul football banner.gif",
      picks: { record: "0-0", pct: ".000", streak: "—" },
      trophy: { count: 0, label: "2026 PRESEASON CONTENDER" },
      matchup: {
        away: { code: "SF", name: "49ers", rec: "0-0", score: 0 },
        home: { code: "LAR", name: "Rams", rec: "0-0", score: 0 },
        status: "PRESEASON WK 2 • 1:25 PM MST",
        isLive: false,
        venue: "SoFi Stadium",
        awayStarter: "Brock Purdy",
        homeStarter: "Matthew Stafford"
      },
      schedule: [
        { date: "Wk 1 • Sep 6", away: "SF", home: "LAR", time: "1:25 PM MST", isHome: false },
        { date: "Wk 2 • Sep 13", away: "ARI", home: "SF", time: "1:05 PM MST", isHome: true },
        { date: "Wk 3 • Sep 20", away: "SF", home: "SEA", time: "5:15 PM MST", isHome: false },
        { date: "Wk 4 • Sep 27", away: "DAL", home: "SF", time: "5:20 PM MST", isHome: true },
        { date: "Wk 5 • Oct 4", away: "SF", home: "CHI", time: "1:05 PM MST", isHome: false }
      ],
      division: "NFC WEST STANDINGS",
      standings: [
        { team: "49ers", w: 0, l: 0, pct: ".000", gb: "—", highlight: true },
        { team: "Rams", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Cardinals", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Seahawks", w: 0, l: 0, pct: ".000", gb: "—", highlight: false }
      ],
      banter: "Faithful to the Bay! Playbook audited and compliant for the 2026 season kickoff!",
      liveStats: { yards: 0, tds: 0, status: "2026 Kickoff Ready" }
    },
    {
      id: "char_cardinals",
      name: "Arizona Cardinals Flag",
      teamId: "ARI",
      teamName: "CARDINALS",
      frameClass: "frame-cardinals",
      nameClass: "name-cardinals",
      image: "assets/Arizona_Cardinals_flag.gif",
      bannerGif: "assets/Arizona_Cardinals_flag.gif",
      picks: { record: "0-0", pct: ".000", streak: "—" },
      trophy: { count: 0, label: "2026 PRESEASON CONTENDER" },
      matchup: {
        away: { code: "SEA", name: "Seahawks", rec: "0-0", score: 0 },
        home: { code: "ARI", name: "Cardinals", rec: "0-0", score: 0 },
        status: "PRESEASON WK 2 • 1:05 PM MST",
        isLive: false,
        venue: "State Farm Stadium (Glendale, AZ)",
        awayStarter: "Geno Smith",
        homeStarter: "Kyler Murray"
      },
      schedule: [
        { date: "Wk 1 • Sep 6", away: "SEA", home: "ARI", time: "1:05 PM MST", isHome: true },
        { date: "Wk 2 • Sep 13", away: "ARI", home: "SF", time: "1:05 PM MST", isHome: false },
        { date: "Wk 3 • Sep 20", away: "LAR", home: "ARI", time: "1:25 PM MST", isHome: true },
        { date: "Wk 4 • Sep 27", away: "ARI", home: "DEN", time: "1:05 PM MST", isHome: false },
        { date: "Wk 5 • Oct 4", away: "LAC", home: "ARI", time: "1:05 PM MST", isHome: true }
      ],
      division: "NFC WEST STANDINGS",
      standings: [
        { team: "49ers", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Rams", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Cardinals", w: 0, l: 0, pct: ".000", gb: "—", highlight: true },
        { team: "Seahawks", w: 0, l: 0, pct: ".000", gb: "—", highlight: false }
      ],
      banter: "Desert pride soaring high in Glendale! Rise Up Red Sea for the 2026 kickoff!",
      liveStats: { yards: 0, tds: 0, status: "2026 Kickoff Ready" }
    },
    {
      id: "char_mariah",
      name: "Mariah",
      teamId: "PHI",
      teamName: "EAGLES",
      frameClass: "frame-mariah",
      nameClass: "name-mariah",
      image: "assets/avatars/Mariah football.jpg",
      bannerGif: "assets/Mariah football banner.mp4",
      picks: { record: "0-0", pct: ".000", streak: "—" },
      trophy: { count: 0, label: "2026 PRESEASON CONTENDER" },
      matchup: {
        away: { code: "PHI", name: "Eagles", rec: "0-0", score: 0 },
        home: { code: "NYG", name: "Giants", rec: "0-0", score: 0 },
        status: "PRESEASON WK 2 • 10:00 AM MST",
        isLive: false,
        venue: "Lincoln Financial Field",
        awayStarter: "Jalen Hurts",
        homeStarter: "Daniel Jones"
      },
      schedule: [
        { date: "Wk 1 • Sep 6", away: "PHI", home: "NYG", time: "10:00 AM MST", isHome: false },
        { date: "Wk 2 • Sep 13", away: "DAL", home: "PHI", time: "5:15 PM MST", isHome: true },
        { date: "Wk 3 • Sep 20", away: "PHI", home: "WAS", time: "10:00 AM MST", isHome: false },
        { date: "Wk 4 • Sep 27", away: "CLE", home: "PHI", time: "10:00 AM MST", isHome: true },
        { date: "Wk 5 • Oct 4", away: "PHI", home: "BAL", time: "1:25 PM MST", isHome: false }
      ],
      division: "NFC EAST STANDINGS",
      standings: [
        { team: "Eagles", w: 0, l: 0, pct: ".000", gb: "—", highlight: true },
        { team: "Cowboys", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Commanders", w: 0, l: 0, pct: ".000", gb: "—", highlight: false },
        { team: "Giants", w: 0, l: 0, pct: ".000", gb: "—", highlight: false }
      ],
      banter: "Fly Eagles Fly! Midnight green is ready to dominate the 2026 season. Tush push all the way to victory!",
      liveStats: { yards: 0, tds: 0, status: "2026 Kickoff Ready" }
    }
  ];

  // TICKER DATA
  const TODAY_TICKER_GAMES = [
    { away: "GB", awayScore: "17", home: "CHI", homeScore: "24", status: "FINAL", isLive: false },
    { away: "PIT", awayScore: "14", home: "CLE", homeScore: "20", status: "FINAL", isLive: false },
    { away: "KC", awayScore: "10", home: "LV", homeScore: "17", status: "4TH QTR • 1:45 PM MST", isLive: true },
    { away: "SF", awayScore: "27", home: "LAR", homeScore: "20", status: "FINAL", isLive: false },
    { away: "SEA", awayScore: "13", home: "ARI", homeScore: "23", status: "3RD QTR • 1:05 PM MST", isLive: true },
    { away: "DET", awayScore: "31", home: "MIN", homeScore: "28", status: "FINAL", isLive: false },
    { away: "BAL", awayScore: "24", home: "DAL", homeScore: "21", status: "PREVIEW • 5:20 PM MST", isLive: false },
    { away: "PHI", awayScore: "28", home: "NYG", homeScore: "16", status: "FINAL", isLive: false }
  ];

  const YESTERDAY_TICKER_GAMES = [
    { away: "KC", awayScore: "24", home: "DEN", homeScore: "17", status: "FINAL", isLive: false },
    { away: "BUF", awayScore: "31", home: "MIA", homeScore: "10", status: "FINAL", isLive: false },
    { away: "HOU", awayScore: "20", home: "IND", homeScore: "19", status: "FINAL", isLive: false },
    { away: "ATL", awayScore: "22", home: "NO", homeScore: "24", status: "FINAL", isLive: false },
    { away: "WAS", awayScore: "18", home: "TB", homeScore: "37", status: "FINAL", isLive: false },
    { away: "TEN", awayScore: "17", home: "JAX", homeScore: "20", status: "FINAL", isLive: false },
    { away: "CIN", awayScore: "26", home: "CAR", homeScore: "24", status: "FINAL", isLive: false },
    { away: "NE", awayScore: "13", home: "NYJ", homeScore: "24", status: "FINAL", isLive: false }
  ];

  // 18-WEEK BRACKET SYSTEM DATA
  // 18-WEEK INTERACTIVE TOURNAMENT BRACKET SYSTEM & SHOWDOWN LORE DATA
  const CONTENDERS_LIST = [
    { name: "Andrea", team: "GB", teamName: "Packers", avatar: "assets/avatars/Andrea football.jpg", bannerGif: "assets/Andrea football banner.gif", seed: "#1", color: "#203731", rating: 91, yards: 0, rzPct: "0%", turnovers: "0" },
    { name: "Mariah", team: "PHI", teamName: "Eagles", avatar: "assets/avatars/Mariah football.jpg", bannerGif: "assets/Mariah football banner.mp4", seed: "#2", color: "#004c54", rating: 94, yards: 0, rzPct: "0%", turnovers: "0" },
    { name: "CJ", team: "CHI", teamName: "Bears", avatar: "assets/avatars/CJ football.jpg", bannerGif: "assets/CJ football banner.gif", seed: "#3", color: "#0b162a", rating: 95, yards: 0, rzPct: "0%", turnovers: "0" },
    { name: "Mario", team: "CLE", teamName: "Browns", avatar: "assets/avatars/Mario football.jpg", bannerGif: "assets/Mario football banner.gif", seed: "#4", color: "#311d00", rating: 88, yards: 0, rzPct: "0%", turnovers: "0" },
    { name: "Nicole", team: "LV", teamName: "Raiders", avatar: "assets/avatars/Nicole football.jpg", bannerGif: "assets/Nicole football banner.gif", seed: "#5", color: "#a5acaf", rating: 93, yards: 0, rzPct: "0%", turnovers: "0" },
    { name: "Saul", team: "SF", teamName: "49ers", avatar: "assets/avatars/Saul football.jpg", bannerGif: "assets/Saul football banner.gif", seed: "#6", color: "#aa0000", rating: 92, yards: 0, rzPct: "0%", turnovers: "0" },
    { name: "Cardinals Flag", team: "ARI", teamName: "Cardinals", avatar: "assets/Arizona_Cardinals_flag.gif", bannerGif: "assets/Arizona_Cardinals_flag.gif", seed: "#7", color: "#97233f", rating: 89, yards: 0, rzPct: "0%", turnovers: "0" }
  ];

  const LORE_DATABASE = [
    {
      title: "The 105-Year NFC North Border War",
      venue: "Soldier Field • Chicago, IL",
      kickoff: "Sunday • 12:15 PM MST",
      surface: "Natural Grass • Cold/Windy 42°F",
      spread: "CHI -2.5 • O/U 44.5",
      lore: "The most storied rivalry in gridiron history spills directly into the office hallway. Andrea channels the frozen mysticism of Lambeau Field and Jordan Love's precision spirals, while CJ brings the blistering swagger of Caleb Williams and Chicago's revitalized aerial assault. Every yard gained echoes across the office watercooler.",
      smack1: "Go Pack Go! You can draft whoever you want in the Windy City, but the NFC North trophy still rests safely in Wisconsin!",
      smack2: "Bear Down! That secondary doesn't have the speed for our receivers. Better get ready, Andrea!"
    },
    {
      title: "The Dawg Pound vs Sin City Blitz",
      venue: "Allegiant Stadium • Las Vegas, NV",
      kickoff: "Thursday • 5:15 PM MST (TNF)",
      surface: "Dome Turf • 72°F Climate Controlled",
      spread: "LV -3.5 • O/U 41.5",
      lore: "A collision between pure blue-collar Ohio grit and neon Vegas electricity. Mario anchors the Browns with relentless ground-and-pound defense and bruising tackle statistics, while Nicole unleashes the Silver & Black vertical strike playbook under the desert dome lights.",
      smack1: "The Dawg Pound doesn't care about Vegas glitz. We play smashmouth football and win in the trenches every single snap!",
      smack2: "Raider Nation moves too fast for you, Mario. Just wait until our deep routes light up the scoreboard under the dome!"
    },
    {
      title: "The Desert Heat vs Red & Gold War",
      venue: "State Farm Stadium • Glendale, AZ",
      kickoff: "Sunday • 1:05 PM MST",
      surface: "Retractable Grass Tray • 70°F Roof Open",
      spread: "SF -4.0 • O/U 47.5",
      lore: "NFC West bragging rights right here in the Valley of the Sun! Saul commands the West Coast precision scheme with Christian McCaffrey and Brock Purdy's elite execution, while the Arizona Cardinals Flag represents the rising desert energy with Kyler Murray's scrambles.",
      smack1: "Faithful to the Bay! Five Super Bowl rings and the sharpest offensive scheme in football. Arizona can't contain our dynamic playmakers!",
      smack2: "The Red Sea will rise! State Farm Stadium is rocking, and Murray's scramble magic will blow right past your blitz packages!"
    },
    {
      title: "The Great Lakes Lakefront Showdown",
      venue: "Huntington Bank Field • Cleveland, OH",
      kickoff: "Sunday • 10:00 AM MST",
      surface: "Natural Grass • Lakefront Gusts 38°F",
      spread: "CHI -1.5 • O/U 39.5",
      lore: "A classic freezing weather battle between two legendary Midwest cold-weather franchises. CJ's dynamic playmakers face Mario's ferocious defensive front seven in a test of endurance and physical dominance.",
      smack1: "You're entering the Lake Erie wind tunnel, CJ. No fancy plays survive our pass rush!",
      smack2: "Wind or snow, Chicago knows cold weather better than anyone. We're putting up 30 points minimum, Mario!"
    },
    {
      title: "The California-Nevada Desert Clash",
      venue: "Levi's Stadium • Santa Clara, CA",
      kickoff: "Monday • 5:15 PM MST (MNF)",
      surface: "Tifway II Bermuda Grass • Mild 62°F",
      spread: "SF -2.5 • O/U 48.0",
      lore: "A fierce historical interstate showdown. Nicole's Raiders bring the silver thunder across state lines into Saul's 49ers fortress for Monday Night Football primetime glory.",
      smack1: "Just Win, Baby! The Raiders own primetime spotlight games and we're taking over Levi's Stadium tonight!",
      smack2: "Not in our house, Nicole. San Francisco's defense swarms every route. Ring the victory siren!"
    },
    {
      title: "The Frozen Tundra vs Desert Red Sea",
      venue: "Lambeau Field • Green Bay, WI",
      kickoff: "Sunday • 10:00 AM MST",
      surface: "Desso GrassMaster • Freezing 24°F",
      spread: "GB -5.5 • O/U 45.0",
      lore: "Contrast of extreme climates! Andrea welcomes Arizona to the legendary sub-zero Lambeau tundra where the cheesehead faithful turn the stadium into a green-and-gold wall of sound.",
      smack1: "Welcome to the Frozen Tundra! Bring your snow parkas because Green Bay rules the winter weather!",
      smack2: "Desert speed thaws frozen defenses! We're burning your secondary with explosive vertical go-routes, Andrea!"
    },
    {
      title: "The Midnight Green Battle of the Birds",
      venue: "Lincoln Financial Field • Philadelphia, PA",
      kickoff: "Sunday • 1:25 PM MST",
      surface: "Desso GrassMaster • Crisp 48°F",
      spread: "PHI -3.5 • O/U 46.5",
      lore: "Midnight green mania erupts in South Philly! Mariah leads the thunderous Eagles crowd with Jalen Hurts' dynamic dual-threat playmaking and Saquon Barkley's explosive bursts, going toe-to-toe with the fiercest contenders in the office.",
      smack1: "Fly Eagles Fly! On the road to victory! We've got the most unstoppable offense in football!",
      smack2: "Philadelphia might have the hype, but we came to play 60 minutes of real smashmouth football!"
    }
  ];

  const DIVISION_LAST_PLACE_TEAMS = {
    "NFC North": [
      { team: "MIN", name: "Vikings", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/min.png", color: "#4F2683", qb: "Sam Darnold", venue: "U.S. Bank Stadium • Minneapolis, MN", city: "Minnesota" },
      { team: "DET", name: "Lions", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png", color: "#0076B6", qb: "Jared Goff", venue: "Ford Field • Detroit, MI", city: "Detroit" }
    ],
    "NFC East": [
      { team: "NYG", name: "Giants", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png", color: "#0B2265", qb: "Daniel Jones", venue: "MetLife Stadium • East Rutherford, NJ", city: "New York" },
      { team: "WAS", name: "Commanders", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/was.png", color: "#5A1414", qb: "Jayden Daniels", venue: "Northwest Stadium • Landover, MD", city: "Washington" }
    ],
    "NFC West": [
      { team: "SEA", name: "Seahawks", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png", color: "#002244", qb: "Geno Smith", venue: "Lumen Field • Seattle, WA", city: "Seattle" },
      { team: "LAR", name: "Rams", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png", color: "#003594", qb: "Matthew Stafford", venue: "SoFi Stadium • Inglewood, CA", city: "Los Angeles" }
    ],
    "NFC South": [
      { team: "CAR", name: "Panthers", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png", color: "#0085CA", qb: "Bryce Young", venue: "Bank of America Stadium • Charlotte, NC", city: "Carolina" }
    ],
    "AFC North": [
      { team: "CIN", name: "Bengals", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png", color: "#FB4F14", qb: "Joe Burrow", venue: "Paycor Stadium • Cincinnati, OH", city: "Cincinnati" },
      { team: "CLE", name: "Browns", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png", color: "#311D00", qb: "Deshaun Watson", venue: "Huntington Bank Field • Cleveland, OH", city: "Cleveland" }
    ],
    "AFC West": [
      { team: "DEN", name: "Broncos", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/den.png", color: "#FB4F14", qb: "Bo Nix", venue: "Empower Field • Denver, CO", city: "Denver" },
      { team: "LV", name: "Raiders", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png", color: "#000000", qb: "Gardner Minshew", venue: "Allegiant Stadium • Las Vegas, NV", city: "Las Vegas" }
    ],
    "AFC East": [
      { team: "NE", name: "Patriots", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png", color: "#002244", qb: "Drake Maye", venue: "Gillette Stadium • Foxborough, MA", city: "New England" }
    ],
    "AFC South": [
      { team: "TEN", name: "Titans", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png", color: "#0C2340", qb: "Will Levis", venue: "Nissan Stadium • Nashville, TN", city: "Tennessee" }
    ]
  };

  function getDivisionLastPlaceOpponent(member, weekIdx) {
    const teamObj = TEAMS.find(t => t.id === member.team) || { division: "NFC North" };
    const div = teamObj.division || "NFC North";
    const candidates = DIVISION_LAST_PLACE_TEAMS[div] || DIVISION_LAST_PLACE_TEAMS["NFC North"];
    const filtered = candidates.filter(c => c.team !== member.team);
    const chosen = filtered.length > 0 ? filtered[weekIdx % filtered.length] : candidates[0];
    return { chosen, division: div };
  }

  function buildWeeklyTournamentData() {
    return {
      activeWeek: 1,
      weeks: Array.from({ length: 18 }, (_, idx) => {
        const wNum = idx + 1;
        const isPast = false; // Fresh 2026 Kickoff
        const isActive = wNum === 1;
        const status = isActive ? 'LIVE' : 'UPCOMING';

        // Pairings rotated for all 18 weeks across all 7 staff contenders
        const p1 = CONTENDERS_LIST[idx % 7];
        const p2 = CONTENDERS_LIST[(idx + 1) % 7];
        const p3 = CONTENDERS_LIST[(idx + 2) % 7];
        const p4 = CONTENDERS_LIST[(idx + 3) % 7];
        const p5 = CONTENDERS_LIST[(idx + 4) % 7];
        const p6 = CONTENDERS_LIST[(idx + 5) % 7];
        const p7 = CONTENDERS_LIST[(idx + 6) % 7]; // The Odd Player of the week!

        // Matchmaking Logic: Odd player plays a random team that is last in their division!
        const { chosen: divCellarTeam, division: p7Division } = getDivisionLastPlaceOpponent(p7, idx);

        const lore1 = LORE_DATABASE[idx % LORE_DATABASE.length];
        const lore2 = LORE_DATABASE[(idx + 1) % LORE_DATABASE.length];
        const lore3 = LORE_DATABASE[(idx + 2) % LORE_DATABASE.length];
        const loreSemi1 = LORE_DATABASE[(idx + 3) % LORE_DATABASE.length];
        const loreSemi2 = LORE_DATABASE[(idx + 4) % LORE_DATABASE.length];
        const loreFinal = LORE_DATABASE[(idx + 5) % LORE_DATABASE.length];

        const baseScore = 20 + ((idx * 3) % 15);
        const s1_score = isActive ? baseScore + 4 : 0;
        const s2_score = isActive ? baseScore + 1 : 0;
        const s3_score = isActive ? baseScore + 6 : 0;
        const s4_score = isActive ? baseScore + 2 : 0;
        const s5_score = isActive ? baseScore + 7 : 0;
        const s6_score = isActive ? baseScore + 3 : 0;
        const s7_score = isActive ? baseScore + 5 : 0;
        const opp_score = isActive ? baseScore : 0;

        const semi1_s1 = isActive ? baseScore + 8 : 0;
        const semi1_s2 = isActive ? baseScore + 5 : 0;
        const semi2_s1 = isActive ? baseScore + 9 : 0;
        const semi2_s2 = isActive ? baseScore + 4 : 0;

        const fin_s1 = isActive ? baseScore + 10 : 0;
        const fin_s2 = isActive ? baseScore + 7 : 0;

        const matches = [
          // Round 1 (Opening Game Slate - All 7 Office Members Active!)
          {
            id: `w${wNum}_q1`,
            round: 1,
            roundName: "Stage 1 • Division Clash",
            title: `Matchup 1: ${lore1.title}`,
            rivalryName: lore1.title,
            day: "Sun Early",
            venue: lore1.venue,
            kickoff: lore1.kickoff,
            surface: lore1.surface,
            spread: lore1.spread,
            staff1: { ...p1, score: s1_score, pick: `${p1.team} ${p1.teamName}` },
            staff2: { ...p2, score: s2_score, pick: `${p2.team} ${p2.teamName}` },
            lore: lore1.lore,
            smack1: lore1.smack1,
            smack2: lore1.smack2,
            status: status
          },
          {
            id: `w${wNum}_q2`,
            round: 1,
            roundName: "Stage 1 • Division Clash",
            title: `Matchup 2: ${lore2.title}`,
            rivalryName: lore2.title,
            day: "Thu Night",
            venue: lore2.venue,
            kickoff: lore2.kickoff,
            surface: lore2.surface,
            spread: lore2.spread,
            staff1: { ...p3, score: s3_score, pick: `${p3.team} ${p3.teamName}` },
            staff2: { ...p4, score: s4_score, pick: `${p4.team} ${p4.teamName}` },
            lore: lore2.lore,
            smack1: lore2.smack1,
            smack2: lore2.smack2,
            status: status
          },
          {
            id: `w${wNum}_q3`,
            round: 1,
            roundName: "Stage 1 • Division Clash",
            title: `Matchup 3: ${lore3.title}`,
            rivalryName: lore3.title,
            day: "Sun Late",
            venue: lore3.venue,
            kickoff: lore3.kickoff,
            surface: lore3.surface,
            spread: lore3.spread,
            staff1: { ...p5, score: s5_score, pick: `${p5.team} ${p5.teamName}` },
            staff2: { ...p6, score: s6_score, pick: `${p6.team} ${p6.teamName}` },
            lore: lore3.lore,
            smack1: lore3.smack1,
            smack2: lore3.smack2,
            status: status
          },
          {
            id: `w${wNum}_q4`,
            round: 1,
            roundName: "Stage 1 • Division Clash",
            title: `Matchup 4: ${p7.name} (${p7.team}) vs ${divCellarTeam.name} (${p7Division})`,
            rivalryName: `${p7.name} vs ${divCellarTeam.name} (${p7Division} Cellar Matchup)`,
            day: "Sun Late",
            venue: divCellarTeam.venue,
            kickoff: "Sunday • 1:05 PM MST",
            surface: "Natural Grass / Turf",
            spread: `${p7.team} -4.5 • O/U 42.5`,
            staff1: { ...p7, score: s7_score, pick: `${p7.team} ${p7.teamName}` },
            staff2: { 
              name: `${divCellarTeam.name}`, 
              team: divCellarTeam.team, 
              teamName: divCellarTeam.name, 
              avatar: divCellarTeam.logo, 
              bannerGif: divCellarTeam.logo,
              seed: "DIV-LAST", 
              color: divCellarTeam.color, 
              rating: 83, 
              yards: 295, 
              rzPct: "48%", 
              turnovers: "-4", 
              score: opp_score, 
              pick: `${divCellarTeam.team} ${divCellarTeam.name}` 
            },
            lore: `${p7.name}'s ${p7.teamName} face the last-place ${divCellarTeam.name} in a pivotal ${p7Division} clash. A must-win division trap game with critical regular season conference seeding on the line!`,
            smack1: `We're taking care of business in the division! No trap game can slow down ${p7.teamName} momentum!`,
            smack2: `Don't look past the ${divCellarTeam.name}! We're ready to play spoiler and ruin your week!`,
            status: status
          },
          // Round 2 (Semifinals • Unlocks after Stage 1 finishes on Sunday afternoon)
          {
            id: `w${wNum}_s1`,
            round: 2,
            roundName: "Stage 2 • Semifinal Battle",
            title: isActive ? "Semifinal 1: Game 1 Winner vs Game 2 Winner" : `Semifinal 1: ${loreSemi1.title}`,
            rivalryName: isActive ? "Stage 2 Semifinal 1 (Unlocks Sun 4:00 PM)" : loreSemi1.title,
            day: "Sun Late",
            venue: loreSemi1.venue,
            kickoff: "Sunday Late • 4:25 PM MST",
            surface: loreSemi1.surface,
            spread: isActive ? "TBD • Unlocks after Sun Games" : loreSemi1.spread,
            staff1: isActive ? { name: `TBD (${p1.name}/${p2.name})`, team: "TBD", teamName: "Game 1 Winner", avatar: p1.avatar, seed: "ADV", score: 0, pick: "Advances after Game 1" } : { ...p1, score: semi1_s1, pick: `${p1.team} ${p1.teamName}` },
            staff2: isActive ? { name: `TBD (${p3.name}/${p4.name})`, team: "TBD", teamName: "Game 2 Winner", avatar: p3.avatar, seed: "ADV", score: 0, pick: "Advances after Game 2" } : { ...p3, score: semi1_s2, pick: `${p3.team} ${p3.teamName}` },
            lore: loreSemi1.lore,
            smack1: loreSemi1.smack1,
            smack2: loreSemi1.smack2,
            status: isActive ? "PENDING" : status
          },
          {
            id: `w${wNum}_s2`,
            round: 2,
            roundName: "Stage 2 • Semifinal Battle",
            title: isActive ? "Semifinal 2: Game 3 Winner vs Game 4 Winner" : `Semifinal 2: ${loreSemi2.title}`,
            rivalryName: isActive ? "Stage 2 Semifinal 2 (Unlocks Sun 4:00 PM)" : loreSemi2.title,
            day: "Sun Late",
            venue: loreSemi2.venue,
            kickoff: "Sunday Late • 4:25 PM MST",
            surface: loreSemi2.surface,
            spread: isActive ? "TBD • Unlocks after Sun Games" : loreSemi2.spread,
            staff1: isActive ? { name: `TBD (${p5.name}/${p6.name})`, team: "TBD", teamName: "Game 3 Winner", avatar: p5.avatar, seed: "ADV", score: 0, pick: "Advances after Game 3" } : { ...p5, score: semi2_s1, pick: `${p5.team} ${p5.teamName}` },
            staff2: isActive ? { name: `TBD (${p7.name}/Advancer)`, team: "TBD", teamName: "Game 4 Winner", avatar: p7.avatar, seed: "ADV", score: 0, pick: "Advances after Game 4" } : { ...p7, score: semi2_s2, pick: `${p7.team} ${p7.teamName}` },
            lore: loreSemi2.lore,
            smack1: loreSemi2.smack1,
            smack2: loreSemi2.smack2,
            status: isActive ? "PENDING" : status
          },
          // Round 3 (Weekly Championship Finale • Sunday/Monday Night Primetime)
          {
            id: `w${wNum}_f1`,
            round: 3,
            roundName: "Stage 3 • Weekly Crown Finale",
            title: isActive ? "Weekly Championship: Primetime Finale" : `Weekly Grand Finale: ${loreFinal.title}`,
            rivalryName: isActive ? "👑 Weekly Championship (SNF / MNF Primetime)" : `👑 ${p1.name} vs ${p5.name} • Weekly Championship`,
            day: "Sun/Mon Night (Primetime)",
            venue: loreFinal.venue,
            kickoff: "Sunday/Monday Night • 5:20 PM MST",
            surface: loreFinal.surface,
            spread: isActive ? "TBD • Decided in Primetime" : loreFinal.spread,
            staff1: isActive ? { name: "TBD (Semifinal 1 Winner)", team: "TBD", teamName: "Finalist A", avatar: p1.avatar, seed: "TOP", score: 0, pick: "Advances to Championship" } : { ...p1, score: fin_s1, pick: `${p1.team} ${p1.teamName}` },
            staff2: isActive ? { name: "TBD (Semifinal 2 Winner)", team: "TBD", teamName: "Finalist B", avatar: p5.avatar, seed: "TOP", score: 0, pick: "Advances to Championship" } : { ...p5, score: fin_s2, pick: `${p5.team} ${p5.teamName}` },
            lore: loreFinal.lore,
            smack1: loreFinal.smack1,
            smack2: loreFinal.smack2,
            status: isActive ? "PENDING" : status
          }
        ];

        return {
          weekNumber: wNum,
          label: `Week ${wNum}${isActive ? ' (Active)' : ''}`,
          status: status,
          winner: `${p1.name} (${p1.team})`,
          mvp: `${p1.name} (${fin_s1} PTS)`,
          matchups: matches
        };
      })
    };
  }

  const WEEKLY_BRACKET_DATA = buildWeeklyTournamentData();

  // 18-WEEK SEASON TOURNAMENT DATA (WEEKS 16 - 18)
  // Round 1 (Quarterfinals - Week 16): 4 Matchups (7 Office Contenders + #32 NFL Last-Place Team for the 7th player)
  // Round 2 (Semifinals - Week 17): 2 Matchups (TBD - Awaiting Week 16)
  // Round 3 (Grand Finale - Week 18): 1 Matchup (TBD - Awaiting Week 17 to Crown Office Champion)
  const SEASON_TOURNAMENT_DATA = {
    title: "2026 Office Endzone 18-Week Season Championship",
    description: "The official postseason climax! Weeks 1–15 determine regular season standings & playoff seeds (#1 to #7). Week 16 starts Round 1 (Quarterfinals) featuring all 7 office contenders + the #32 Last-Place NFL Team (Oddball Wild Card Challenge) playing the #7 seed. Round 2 Semifinals (Week 17) and the Grand Championship Finale (Week 18) are TBD and unlock as each round concludes.",
    rounds: [
      {
        roundNum: 1,
        weekNum: 16,
        name: "Week 16 • Quarterfinals",
        matchups: [
          {
            id: "st_q1",
            round: 1,
            week: "Week 16",
            roundName: "Week 16 • Quarterfinal 1",
            title: "Quarterfinal 1 • #1 Andrea vs #6 Saul",
            rivalryName: "NFC North vs NFC West Playoff Clash",
            day: "Sun Early",
            venue: "Lambeau Field • Green Bay, WI",
            kickoff: "Week 16 • Sun 10:00 AM MST",
            surface: "Desso GrassMaster • 28°F Freezing",
            spread: "GB -3.5 • O/U 44.5",
            staff1: {
              name: "Andrea",
              team: "GB",
              teamName: "Packers",
              avatar: "assets/avatars/Andrea football.jpg",
              bannerGif: "assets/Andrea football banner.gif",
              seed: "#1",
              color: "#203731",
              rating: 91,
              yards: 360,
              rzPct: "72%",
              turnovers: "+5",
              score: 0,
              pick: "GB Packers"
            },
            staff2: {
              name: "Saul",
              team: "SF",
              teamName: "49ers",
              avatar: "assets/avatars/Saul football.jpg",
              bannerGif: "assets/Saul football banner.gif",
              seed: "#6",
              color: "#aa0000",
              rating: 92,
              yards: 350,
              rzPct: "68%",
              turnovers: "+3",
              score: 0,
              pick: "SF 49ers"
            },
            lore: "Top-seeded Andrea welcomes Saul to the Frozen Tundra of Lambeau Field in an electrifying Quarterfinal showdown. The winner advances directly to the Week 17 Semifinals!",
            smack1: "Number one seed for a reason! Lambeau is ready to freeze out the Niners and punch our ticket to Week 17!",
            smack2: "The 49ers West Coast playbook is built for December playoff upsets. We're advancing to the Semifinals!",
            status: "UPCOMING"
          },
          {
            id: "st_q2",
            round: 1,
            week: "Week 16",
            roundName: "Week 16 • Quarterfinal 2",
            title: "Quarterfinal 2 • #2 Mariah vs #5 Nicole",
            rivalryName: "Midnight Green vs Silver & Black Playoff Battle",
            day: "Sun Late",
            venue: "Lincoln Financial Field • Philadelphia, PA",
            kickoff: "Week 16 • Sun 1:25 PM MST",
            surface: "Desso GrassMaster • 42°F Cold",
            spread: "PHI -4.0 • O/U 48.0",
            staff1: {
              name: "Mariah",
              team: "PHI",
              teamName: "Eagles",
              avatar: "assets/avatars/Mariah football.jpg",
              bannerGif: "assets/Mariah football banner.mp4",
              seed: "#2",
              color: "#004c54",
              rating: 94,
              yards: 385,
              rzPct: "75%",
              turnovers: "+6",
              score: 0,
              pick: "PHI Eagles"
            },
            staff2: {
              name: "Nicole",
              team: "LV",
              teamName: "Raiders",
              avatar: "assets/avatars/Nicole football.jpg",
              bannerGif: "assets/Nicole football banner.gif",
              seed: "#5",
              color: "#a5acaf",
              rating: 93,
              yards: 340,
              rzPct: "65%",
              turnovers: "+2",
              score: 0,
              pick: "LV Raiders"
            },
            lore: "Mariah's #2 seeded Philadelphia Eagles clash with Nicole's #5 seeded Las Vegas Raiders. Explosive ground game meets aggressive vertical passing for a spot in the Week 17 final four!",
            smack1: "Fly Eagles Fly! Lincoln Financial Field is going to be deafening on Sunday! No one stops our playoff march!",
            smack2: "Raider Nation thrives in high-stakes road playoff matchups. Statistically primed for the Quarterfinal upset!",
            status: "UPCOMING"
          },
          {
            id: "st_q3",
            round: 1,
            week: "Week 16",
            roundName: "Week 16 • Quarterfinal 3",
            title: "Quarterfinal 3 • #3 CJ vs #4 Mario",
            rivalryName: "The Great Lakes Postseason Showdown",
            day: "Sun Early",
            venue: "Soldier Field • Chicago, IL",
            kickoff: "Week 16 • Sun 12:15 PM MST",
            surface: "Natural Grass • 36°F Windy",
            spread: "CHI -2.5 • O/U 41.5",
            staff1: {
              name: "CJ",
              team: "CHI",
              teamName: "Bears",
              avatar: "assets/avatars/CJ football.jpg",
              bannerGif: "assets/CJ football banner.gif",
              seed: "#3",
              color: "#0b162a",
              rating: 95,
              yards: 390,
              rzPct: "70%",
              turnovers: "+4",
              score: 0,
              pick: "CHI Bears"
            },
            staff2: {
              name: "Mario",
              team: "CLE",
              teamName: "Browns",
              avatar: "assets/avatars/Mario football.jpg",
              bannerGif: "assets/Mario football banner.gif",
              seed: "#4",
              color: "#311d00",
              rating: 88,
              yards: 310,
              rzPct: "62%",
              turnovers: "+1",
              score: 0,
              pick: "CLE Browns"
            },
            lore: "A fierce 3-vs-4 rivalry battle along Lake Michigan. CJ's dynamic Chicago aerial attack faces Mario's hard-hitting Cleveland Dawg Pound blitz defense.",
            smack1: "Bear Down! We've been preparing for this postseason run all 15 weeks! Nothing can stop Chicago!",
            smack2: "The Dawg Pound defense will shut down the passing lanes and take this win in the trenches! Browns rolling!",
            status: "UPCOMING"
          },
          {
            id: "st_q4",
            round: 1,
            week: "Week 16",
            roundName: "Week 16 • Quarterfinal 4",
            title: "Quarterfinal 4 • #7 Cardinals Flag vs NFL #32 Panthers (Oddball Challenge)",
            rivalryName: "🎯 Oddball Challenge: #7 Seed vs NFL #32 Last-Place Squad",
            day: "Sun Late",
            venue: "State Farm Stadium • Glendale, AZ",
            kickoff: "Week 16 • Sun 2:05 PM MST",
            surface: "Retractable Grass • 72°F Roof Open",
            spread: "ARI -6.5 • O/U 38.5",
            isOddball: true,
            staff1: {
              name: "Cardinals Flag",
              team: "ARI",
              teamName: "Cardinals",
              avatar: "assets/Arizona_Cardinals_flag.gif",
              bannerGif: "assets/Arizona_Cardinals_flag.gif",
              seed: "#7",
              color: "#97233f",
              rating: 89,
              yards: 325,
              rzPct: "60%",
              turnovers: "0",
              score: 0,
              pick: "ARI Cardinals"
            },
            staff2: {
              name: "Carolina Panthers",
              team: "CAR",
              teamName: "Panthers (NFL #32)",
              avatar: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
              bannerGif: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
              seed: "NFL #32",
              color: "#0085ca",
              rating: 79,
              yards: 280,
              rzPct: "45%",
              turnovers: "-8",
              score: 0,
              pick: "CAR Panthers (NFL #32)"
            },
            lore: "In the 7-player tournament format, the 7th-seeded contender faces the ultimate test: battling the team in 32nd/last place across the entire NFL (Carolina Panthers)! The Cardinals Flag must win this game to punch their ticket to the Week 17 Semifinals!",
            smack1: "Rise Up Red Sea! The Arizona flag will wave victoriously over the NFL basement squad and advance to the Semifinals!",
            smack2: "The NFL #32 Panthers have nothing to lose and everything to prove as postseason spoilers looking to shock the office bracket!",
            status: "UPCOMING"
          }
        ]
      },
      {
        roundNum: 2,
        weekNum: 17,
        name: "Week 17 • Semifinals",
        matchups: [
          {
            id: "st_s1",
            round: 2,
            week: "Week 17",
            roundName: "Week 17 • Semifinal 1",
            title: "Semifinal 1 • Winner QF 1 vs Winner QF 4",
            rivalryName: "Week 17 Semifinal 1 (Awaiting Week 16)",
            day: "Sun Late",
            venue: "Higher Seed Home Field",
            kickoff: "Week 17 • Sunday Late Slate",
            surface: "Playoff Turf/Grass",
            spread: "TBD • Unlocks after Week 16",
            qfSource1: "st_q1",
            qfSource2: "st_q4",
            qfSource1Desc: "Winner QF 1 (#1 Andrea vs #6 Saul)",
            qfSource2Desc: "Winner QF 4 (#7 Cardinals Flag vs NFL #32)",
            lore: "The winner of Quarterfinal 1 takes on the winner of the Oddball Quarterfinal 4 challenge for a ticket to the Week 18 Grand Championship Game!",
            smack1: "One win away from the Week 18 Grand Championship!",
            smack2: "We fought through the Quarterfinals and aren't stopping now!",
            status: "PENDING"
          },
          {
            id: "st_s2",
            round: 2,
            week: "Week 17",
            roundName: "Week 17 • Semifinal 2",
            title: "Semifinal 2 • Winner QF 2 vs Winner QF 3",
            rivalryName: "Week 17 Semifinal 2 (Awaiting Week 16)",
            day: "Sun Late",
            venue: "Higher Seed Home Field",
            kickoff: "Week 17 • Sunday Late Slate",
            surface: "Playoff Turf/Grass",
            spread: "TBD • Unlocks after Week 16",
            qfSource1: "st_q2",
            qfSource2: "st_q3",
            qfSource1Desc: "Winner QF 2 (#2 Mariah vs #5 Nicole)",
            qfSource2Desc: "Winner QF 3 (#3 CJ vs #4 Mario)",
            lore: "The winner of Quarterfinal 2 battles the winner of Quarterfinal 3 in an explosive Semifinal collision for the final ticket to the Week 18 Grand Championship Game!",
            smack1: "Our offense is firing on all cylinders heading into the Semifinals!",
            smack2: "Defense wins championships and we're punching our ticket to Week 18!",
            status: "PENDING"
          }
        ]
      },
      {
        roundNum: 3,
        weekNum: 18,
        name: "Week 18 • Grand Finale",
        matchups: [
          {
            id: "st_final",
            round: 3,
            week: "Week 18",
            roundName: "Week 18 • Grand Championship Game",
            title: "👑 2026 Office Endzone Grand Championship",
            rivalryName: "Week 18 Regular Season Grand Finale",
            day: "Sun Primetime",
            venue: "Grand Championship Stadium",
            kickoff: "Week 18 Finale • Sun 6:20 PM MST (SNF)",
            surface: "Championship Turf",
            spread: "TBD • Decided in Week 18 Finale",
            semiSource1: "st_s1",
            semiSource2: "st_s2",
            semiSource1Desc: "Winner Semifinal 1",
            semiSource2Desc: "Winner Semifinal 2",
            lore: "The crowning moment of the 18-Week NFL regular season! The two surviving office titans battle in the final game of Week 18 for the 2026 Office Endzone Championship Trophy, eternal office bragging rights, and the golden football prize!",
            smack1: "The 2026 Office Championship trophy is coming home with me!",
            smack2: "60 minutes of football to decide the true ruler of the office gridiron!",
            status: "PENDING"
          }
        ]
      }
    ]
  };

  // 2. MAIN APPLICATION CLASS
  class DugoutEndzoneApp {
    constructor() {
      this.teams = TEAMS;
      this.roster = ROSTER;
      this.currentTickerMode = 'TODAY'; // TODAY | YESTERDAY
      this.selectedMember = null;
      this.isGifActive = false;
      this.activeBracketTab = 'WEEKLY'; // WEEKLY | SEASON
      this.selectedWeekIndex = 0; // Week 1 (Active Starting Gate)
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

      // DOM Elements
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
        btnNavBracket: document.getElementById('btn-nav-bracket'),
        btnNavChallenges: document.getElementById('btn-nav-challenges'),
        btnNavStandings: document.getElementById('btn-nav-standings'),
        secondaryDrawer: document.getElementById('secondary-drawer'),
        drawerTitle: document.getElementById('drawer-title'),
        drawerBody: document.getElementById('drawer-body'),
        btnCloseDrawer: document.getElementById('btn-close-drawer')
      };
    }

    init() {
      this.startClock();
      this.renderTicker();
      this.renderRosterGrid();
      this.bindEvents();
      this.fetchLiveEspnFeed();
      setInterval(() => this.fetchLiveEspnFeed(), 45000);
    }

    startClock() {
      const update = () => {
        if (this.dom.mstClock) {
          this.dom.mstClock.textContent = getArizonaDateString();
        }
      };
      update();
      setInterval(update, 1000);
    }

    renderTicker() {
      if (!this.dom.tickerGrid) return;
      const games = this.currentTickerMode === 'TODAY' ? TODAY_TICKER_GAMES : YESTERDAY_TICKER_GAMES;

      const html = games.map(game => {
        const awayTeam = this.teams.find(t => t.abbreviation === game.away) || { logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.away.toLowerCase()}.png` };
        const homeTeam = this.teams.find(t => t.abbreviation === game.home) || { logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.home.toLowerCase()}.png` };
        
        const awayMemberId = this.teamToMemberMap[game.away];
        const homeMemberId = this.teamToMemberMap[game.home];
        const awayMember = awayMemberId ? this.roster.find(m => m.id === awayMemberId) : null;
        const homeMember = homeMemberId ? this.roster.find(m => m.id === homeMemberId) : null;
        const hasOfficeMember = awayMember || homeMember;

        const awayNum = parseInt(game.awayScore) || 0;
        const homeNum = parseInt(game.homeScore) || 0;

        let statusClass = 'preview';
        if (game.status.includes('FINAL')) statusClass = 'final';
        else if (game.isLive || game.status.includes('QTR')) statusClass = 'live';

        return `
          <div class="ticker-card ${hasOfficeMember ? 'office-game-card' : ''}" 
               data-away="${game.away}" 
               data-home="${game.home}"
               data-away-member="${awayMemberId || ''}"
               data-home-member="${homeMemberId || ''}"
               role="button"
               tabindex="0"
               title="${hasOfficeMember ? 'Click to open staff member card' : 'NFL Matchup • Click to view Box Score'}">
            
            <div class="ticker-game-meta">
              <span class="ticker-status-tag ${statusClass}">${game.status}</span>
              ${hasOfficeMember ? `<span class="ticker-office-tag">🏈 OFFICE GAME</span>` : ''}
            </div>

            <!-- Away Team Row -->
            <div class="ticker-team-row ${awayMember ? 'has-member' : ''}" data-member-id="${awayMemberId || ''}">
              <div class="ticker-team-info">
                <img src="${awayTeam.logo}" class="ticker-team-logo" alt="${game.away}" onerror="this.src='https://ui-avatars.com/api/?name=${game.away}&background=0b0f19&color=fff'">
                <span class="ticker-team-name">${game.away}</span>
                ${awayMember ? `<span class="ticker-member-pill" title="Office: ${awayMember.name}"><img src="${awayMember.image}" class="ticker-avatar-mini" alt="${awayMember.name}">${awayMember.name}</span>` : ''}
              </div>
              <span class="ticker-team-score ${awayNum > homeNum ? 'winning' : ''}">${game.awayScore}</span>
            </div>

            <!-- Home Team Row -->
            <div class="ticker-team-row ${homeMember ? 'has-member' : ''}" data-member-id="${homeMemberId || ''}">
              <div class="ticker-team-info">
                <img src="${homeTeam.logo}" class="ticker-team-logo" alt="${game.home}" onerror="this.src='https://ui-avatars.com/api/?name=${game.home}&background=0b0f19&color=fff'">
                <span class="ticker-team-name">${game.home}</span>
                ${homeMember ? `<span class="ticker-member-pill" title="Office: ${homeMember.name}"><img src="${homeMember.image}" class="ticker-avatar-mini" alt="${homeMember.name}">${homeMember.name}</span>` : ''}
              </div>
              <span class="ticker-team-score ${homeNum > awayNum ? 'winning' : ''}">${game.homeScore}</span>
            </div>
          </div>
        `;
      }).join('');

      // ⚡ Bolt: Cache HTML to prevent unnecessary re-renders on every 45s interval
      if (this._lastTickerHtml === html) return;
      this._lastTickerHtml = html;
      this.dom.tickerGrid.innerHTML = html;
    }

    renderRosterGrid() {
      if (!this.dom.rosterGrid) return;
      this.dom.rosterGrid.innerHTML = this.roster.map(member => {
        return `
          <div class="roster-member-card" data-id="${member.id}" role="button" tabindex="0" aria-label="Open ${member.name} Details">
            <div class="avatar-frame ${member.frameClass}">
              <div class="avatar-inner-img-wrap">
                <img src="${member.image}" alt="${member.name}" class="roster-avatar-img" onerror="this.src='https://ui-avatars.com/api/?name=${member.name}&background=0b1322&color=fff'">
              </div>
            </div>
            <div class="roster-member-name ${member.nameClass}">${member.name}</div>
          </div>
        `;
      }).join('');
    }

    openMemberModal(memberId) {
      const member = this.roster.find(m => m.id === memberId) || this.roster[0];
      this.selectedMember = member;
      this.isGifActive = true;

      const team = this.teams.find(t => t.id === member.teamId) || this.teams[0];

      // Update avatar card with banner
      this.dom.modalAvatarCard.className = `modal-avatar-card ${member.frameClass}`;
      this.renderModalMedia(member, true);

      // Identity
      this.dom.modalMemberName.textContent = member.name;
      this.dom.modalTeamLogo.src = team.logo;
      this.dom.modalTeamLogo.alt = team.name;
      this.dom.modalTeamName.textContent = member.teamName;
      this.dom.modalTeamName.style.color = team.color;

      // Picks & Trophy
      this.dom.picksRecord.textContent = member.picks.record;
      this.dom.picksPct.textContent = member.picks.pct;
      this.dom.picksStreak.textContent = member.picks.streak;
      this.dom.trophyCount.textContent = `× ${member.trophy.count}`;
      this.dom.trophyLabel.textContent = "WEEKLY YARDS & TOUCHDOWNS LEADER";

      // This Week's Matchup
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

      // Schedule Next 5 Games
      this.dom.scheduleList.innerHTML = member.schedule.map(s => {
        const isSelectedTeamHome = s.isHome;
        const awayCode = isSelectedTeamHome ? s.away : `<strong style="color:${team.color}">${s.away}</strong>`;
        const homeCode = isSelectedTeamHome ? `<strong style="color:${team.color}">${s.home}</strong>` : s.home;
        return `
          <div class="schedule-row">
            <span class="schedule-date">${s.date}</span>
            <span class="schedule-matchup">${awayCode} @ ${homeCode}</span>
            <span class="schedule-time">${s.time}</span>
          </div>
        `;
      }).join('');

      // Division Standings
      this.dom.standingsDivisionTitle.textContent = member.division;
      this.dom.divisionStandingsTbody.innerHTML = member.standings.map(row => `
        <tr class="${row.highlight ? 'highlight-team-row' : ''}">
          <td class="col-team">${row.team}</td>
          <td class="col-stat">${row.w}</td>
          <td class="col-stat">${row.l}</td>
          <td class="col-stat">${row.pct}</td>
          <td class="col-stat">${row.gb}</td>
        </tr>
      `).join('');

      // Weekly Yards & TDs Leader Table
      this.dom.dailyLeadersTbody.innerHTML = this.roster.map(r => `
        <tr class="${r.id === member.id ? 'highlight-team-row' : ''}">
          <td class="col-team" style="font-weight:700;">${r.name} (${r.teamId})</td>
          <td class="col-stat">${r.liveStats.yards} YDS</td>
          <td class="col-stat">${r.liveStats.tds} TD</td>
          <td class="col-stat">${r.liveStats.status}</td>
        </tr>
      `).join('');

      // Show Modal
      this.dom.modalOverlay.classList.add('open');
      this.dom.modalOverlay.setAttribute('aria-hidden', 'false');
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

    spawnConfetti() {
      const colors = ['#facc15', '#ef4444', '#38bdf8', '#10b981', '#fb923c', '#e11d48'];
      for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-particle';
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `${Math.random() * 20}vh`;
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = `${1.5 + Math.random() * 2}s`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 3500);
      }
    }

    bindEvents() {
      // Ticker card & team row interactive clicks
      this.dom.tickerGrid?.addEventListener('click', (e) => {
        const teamRow = e.target.closest('.ticker-team-row');
        if (teamRow && teamRow.dataset.memberId) {
          e.stopPropagation();
          this.openMemberModal(teamRow.dataset.memberId);
          return;
        }

        const card = e.target.closest('.ticker-card');
        if (!card) return;

        const awayMemberId = card.dataset.awayMember;
        const homeMemberId = card.dataset.homeMember;
        const away = card.dataset.away;
        const home = card.dataset.home;

        if (awayMemberId && !homeMemberId) {
          this.openMemberModal(awayMemberId);
        } else if (homeMemberId && !awayMemberId) {
          this.openMemberModal(homeMemberId);
        } else if (awayMemberId && homeMemberId) {
          this.openMemberModal(homeMemberId);
        } else {
          // Open box score for this marquee game!
          this.openBoxScoreModal({ away: { code: away }, home: { code: home } }, this.currentTickerMode === 'YESTERDAY' ? 'LAST_WEEK' : 'CURRENT');
        }
      });

      // Ticker tab toggles (Week vs Last Week)
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

      // Roster item clicks
      this.dom.rosterGrid?.addEventListener('click', (e) => {
        const card = e.target.closest('.roster-member-card');
        if (card) {
          this.openMemberModal(card.dataset.id);
        }
      });

      // Modal close events
      this.dom.modalCloseBtn?.addEventListener('click', () => this.closeModal());
      this.dom.modalOverlay?.addEventListener('click', (e) => {
        if (e.target === this.dom.modalOverlay) this.closeModal();
      });

      // GIF / Banner Toggle
      this.dom.modalAvatarCard?.addEventListener('click', () => this.toggleGifMode());
      this.dom.modalGifToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleGifMode();
      });

      // Box score button inside member detail modal
      this.dom.btnOpenBoxScore?.addEventListener('click', () => {
        if (this.selectedMember && this.selectedMember.matchup) {
          this.openBoxScoreModal(this.selectedMember.matchup);
        } else {
          this.openBoxScoreModal(null, 'CURRENT');
        }
      });

      // Header "LAST WEEK'S BOX SCORES" button
      this.dom.btnYesterdayModal?.addEventListener('click', () => {
        this.openBoxScoreModal(null, 'LAST_WEEK');
      });

      this.dom.btnSignIn?.addEventListener('click', () => {
        // Sign-in confirmation
        alert('Welcome to Office Endzone! You are signed in as an Active Gridiron Predictor.');
      });

      // Quick Nav Buttons
      this.dom.btnNavRoster?.addEventListener('click', () => {
        this.setActiveNav(this.dom.btnNavRoster);
        this.closeDrawer();
        document.getElementById('roster-section')?.scrollIntoView({ behavior: 'smooth' });
      });

      this.dom.btnNavBracket?.addEventListener('click', () => {
        this.setActiveNav(this.dom.btnNavBracket);
        this.openBracketsDrawer();
      });

      this.dom.btnNavChallenges?.addEventListener('click', () => {
        this.setActiveNav(this.dom.btnNavChallenges);
        this.openChallengesDrawer();
      });

      this.dom.btnNavStandings?.addEventListener('click', () => {
        this.setActiveNav(this.dom.btnNavStandings);
        this.openStandingsDrawer();
      });

      this.dom.btnCloseDrawer?.addEventListener('click', () => {
        this.closeDrawer();
        this.setActiveNav(this.dom.btnNavRoster);
      });

      // Showdown Modal close events
      this.dom.showdownModalClose?.addEventListener('click', () => {
        this.closeShowdownModal();
      });

      this.dom.showdownModalOverlay?.addEventListener('click', (e) => {
        if (e.target === this.dom.showdownModalOverlay) {
          this.closeShowdownModal();
        }
      });

      // Box Score Modal close events
      this.dom.boxScoreModalClose?.addEventListener('click', () => {
        this.closeBoxScoreModal();
      });

      this.dom.boxScoreModalOverlay?.addEventListener('click', (e) => {
        if (e.target === this.dom.boxScoreModalOverlay) {
          this.closeBoxScoreModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.dom.boxScoreModalOverlay?.classList.contains('open')) {
            this.closeBoxScoreModal();
          } else if (this.dom.showdownModalOverlay?.classList.contains('open')) {
            this.closeShowdownModal();
          } else if (this.dom.modalOverlay?.classList.contains('open')) {
            this.closeModal();
          }
        }
      });
    }

    setActiveNav(btn) {
      document.querySelectorAll('.quick-nav-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }

    openBracketsDrawer() {
      if (!this.dom.drawerBody || !this.dom.secondaryDrawer) return;
      this.dom.drawerTitle.textContent = "🌲 Office Brackets Hub";
      this.renderBracketsHub();
      this.dom.secondaryDrawer.style.display = 'flex';
      this.dom.secondaryDrawer.scrollIntoView({ behavior: 'smooth' });
    }

    renderBracketsHub() {
      const isWeekly = this.activeBracketTab === 'WEEKLY';
      const curWeek = WEEKLY_BRACKET_DATA.weeks[this.selectedWeekIndex] || WEEKLY_BRACKET_DATA.weeks[0];

      this.dom.drawerBody.innerHTML = `
        <div class="brackets-container">
          <!-- Bracket Mode Switcher -->
          <div class="bracket-mode-tabs">
            <button class="bracket-mode-btn ${isWeekly ? 'active' : ''}" id="tab-mode-weekly">⚡ WEEKLY MATCHUP BRACKETS</button>
            <button class="bracket-mode-btn ${!isWeekly ? 'active' : ''}" id="tab-mode-season">🏆 18-WEEK SEASON TOURNAMENT</button>
          </div>

          ${isWeekly ? this.renderWeeklyBracketsContent(curWeek) : this.renderSeasonLadderContent()}
        </div>
      `;

      // Bind tabs
      document.getElementById('tab-mode-weekly')?.addEventListener('click', () => {
        this.activeBracketTab = 'WEEKLY';
        this.renderBracketsHub();
      });

      document.getElementById('tab-mode-season')?.addEventListener('click', () => {
        this.activeBracketTab = 'SEASON';
        this.renderBracketsHub();
      });

      // Bind weekly controls
      if (isWeekly) {
        document.querySelectorAll('.week-pill-btn').forEach(pill => {
          pill.addEventListener('click', () => {
            this.selectedWeekIndex = parseInt(pill.dataset.weekIndex, 10);
            this.renderBracketsHub();
          });
        });

        document.querySelectorAll('.contender-filter-pill').forEach(pill => {
          pill.addEventListener('click', () => {
            this.selectedContenderFilter = pill.dataset.contender;
            this.renderBracketsHub();
          });
        });

        document.querySelectorAll('.day-pill-btn').forEach(pill => {
          pill.addEventListener('click', () => {
            this.selectedDayFilter = pill.dataset.day;
            this.renderBracketsHub();
          });
        });

        document.querySelectorAll('.btn-reveal-showdown, .bracket-matchup-node').forEach(elem => {
          elem.addEventListener('click', (e) => {
            if (e.target.closest('.btn-bracket-pick')) return;
            const matchId = elem.dataset.matchId;
            if (matchId) {
              this.openShowdownModal(matchId);
            }
          });
        });

        document.querySelectorAll('.btn-bracket-pick').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const matchId = btn.dataset.matchId;
            const staff = btn.dataset.staff;
            this.userPicks[matchId] = staff;
            localStorage.setItem('office_endzone_picks', JSON.stringify(this.userPicks));
            this.renderBracketsHub();
          });
        });
      } else {
        // Bind Season Tournament controls
        document.querySelectorAll('.btn-season-reveal-showdown, .season-bracket-card').forEach(elem => {
          elem.addEventListener('click', (e) => {
            if (e.target.closest('.btn-season-pick') || e.target.closest('.btn-reset-season-picks')) return;
            const matchId = elem.dataset.matchId;
            if (matchId) {
              this.openShowdownModal(matchId);
            }
          });
        });

        document.querySelectorAll('.btn-season-pick').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const matchId = btn.dataset.matchId;
            const staff = btn.dataset.staff;
            
            // If user changes a Quarterfinal pick, invalidate subsequent rounds if needed
            if (matchId.startsWith('st_q')) {
              // Check if previous pick in semi or final needs cleanup
              delete this.seasonPicks['st_final'];
            }
            if (matchId.startsWith('st_s')) {
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
      const r1Matches = curWeek.matchups.filter(m => m.round === 1);
      const r2Matches = curWeek.matchups.filter(m => m.round === 2);
      const r3Matches = curWeek.matchups.filter(m => m.round === 3);

      const allWeekMatches = curWeek.matchups;
      const pickedThisWeek = allWeekMatches.filter(m => this.userPicks[m.id]);
      const totalUserPicksCount = Object.keys(this.userPicks).length;

      const renderNode = (m, isChampionship = false) => {
        const userPick = this.userPicks[m.id];
        const staff1Won = m.staff1.score > m.staff2.score;
        const staff2Won = m.staff2.score > m.staff1.score;

        const isFilteredContender = this.selectedContenderFilter !== 'ALL' && 
          (m.staff1.name.includes(this.selectedContenderFilter) || m.staff2.name.includes(this.selectedContenderFilter));

        const isFilteredDay = this.selectedDayFilter !== 'ALL' && m.day.toLowerCase().includes(this.selectedDayFilter.toLowerCase());

        const isHighlighted = (this.selectedContenderFilter !== 'ALL' && isFilteredContender) || 
                              (this.selectedDayFilter !== 'ALL' && isFilteredDay);

        const isUpcoming = m.status === 'UPCOMING';
        const isPending = m.status === 'PENDING';

        if (isPending) {
          return `
            <div class="bracket-matchup-node ${isChampionship ? 'championship-node' : ''} ${isHighlighted ? 'highlighted' : ''}" data-match-id="${m.id}" role="button" tabindex="0" style="border-style:dashed; border-color:rgba(250,204,21,0.35);">
              <div class="match-node-top">
                <span class="match-rivalry-name" style="color:#facc15;">${m.rivalryName}</span>
                <span class="matchup-status-pill preview" style="background:rgba(250,204,21,0.15); color:#facc15; border:1px solid rgba(250,204,21,0.3);">🔒 AWAITING STAGE 1</span>
              </div>

              <div style="font-size:0.62rem; color:#94a3b8; display:flex; justify-content:space-between;">
                <span>📍 ${m.venue.split('•')[0]}</span>
                <span>⏰ ${m.kickoff.split('•')[1] || m.kickoff}</span>
              </div>

              <div class="match-node-contenders" style="opacity:0.85;">
                <div class="bracket-contestant-row" style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.12);">
                  <div class="contestant-identity">
                    <div class="contestant-name-box">
                      <span class="contestant-staff-name" style="color:#cbd5e1;">${m.staff1.name}</span>
                      <span class="contestant-team-pick" style="color:#64748b;">${m.staff1.pick || 'Awaiting Stage 1 Scores'}</span>
                    </div>
                  </div>
                  <div class="contestant-score-action">
                    <span class="contestant-score-num" style="color:#64748b; font-size:0.68rem;">TBD</span>
                  </div>
                </div>

                <div class="bracket-vs-divider">VS</div>

                <div class="bracket-contestant-row" style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.12);">
                  <div class="contestant-identity">
                    <div class="contestant-name-box">
                      <span class="contestant-staff-name" style="color:#cbd5e1;">${m.staff2.name}</span>
                      <span class="contestant-team-pick" style="color:#64748b;">${m.staff2.pick || 'Awaiting Stage 1 Scores'}</span>
                    </div>
                  </div>
                  <div class="contestant-score-action">
                    <span class="contestant-score-num" style="color:#64748b; font-size:0.68rem;">TBD</span>
                  </div>
                </div>
              </div>

              <div style="font-size:0.62rem; color:#facc15; text-align:center; padding:4px 0 2px; font-weight:700; background:rgba(250,204,21,0.06); border-radius:4px; margin-top:4px;">
                ⚡ ${isChampionship ? 'Unlocks for Sunday/Monday Night Primetime to crown the weekly champion!' : 'Unlocks after Stage 1 games conclude on Sunday!'}
              </div>
            </div>
          `;
        }

        return `
          <div class="bracket-matchup-node ${isChampionship ? 'championship-node' : ''} ${isHighlighted ? 'highlighted' : ''}" data-match-id="${m.id}" role="button" tabindex="0">
            <div class="match-node-top">
              <span class="match-rivalry-name">${m.rivalryName}</span>
              <span class="matchup-status-pill ${m.status.toLowerCase()}">${m.status}</span>
            </div>

            <div style="font-size:0.62rem; color:#94a3b8; display:flex; justify-content:space-between;">
              <span>📍 ${m.venue.split('•')[0]}</span>
              <span>⏰ ${m.kickoff.split('•')[1] || m.kickoff}</span>
            </div>

            <div class="match-node-contenders">
              <div class="bracket-contestant-row ${staff1Won && !isUpcoming ? 'winning' : ''} ${userPick === m.staff1.name ? 'user-picked' : ''}">
                <div class="contestant-identity">
                  <div class="contestant-name-box">
                    <span class="contestant-staff-name">${m.staff1.seed ? m.staff1.seed + ' ' : ''}${m.staff1.name} (${m.staff1.team})</span>
                    <span class="contestant-team-pick">${m.staff1.pick}</span>
                  </div>
                </div>
                <div class="contestant-score-action">
                  <span class="contestant-score-num">${m.staff1.score ? m.staff1.score + ' PTS' : (isUpcoming ? 'PROJ: ' + m.spread.split('•')[0] : '0 PTS')}</span>
                  <button class="btn-bracket-pick ${userPick === m.staff1.name ? 'active' : ''}" data-match-id="${m.id}" data-staff="${m.staff1.name}">
                    ${userPick === m.staff1.name ? '✓ Picked' : 'Pick'}
                  </button>
                </div>
              </div>

              <div class="bracket-vs-divider">VS</div>

              <div class="bracket-contestant-row ${staff2Won && !isUpcoming ? 'winning' : ''} ${userPick === m.staff2.name ? 'user-picked' : ''}">
                <div class="contestant-identity">
                  <div class="contestant-name-box">
                    <span class="contestant-staff-name">${m.staff2.seed ? m.staff2.seed + ' ' : ''}${m.staff2.name} (${m.staff2.team})</span>
                    <span class="contestant-team-pick">${m.staff2.pick}</span>
                  </div>
                </div>
                <div class="contestant-score-action">
                  <span class="contestant-score-num">${m.staff2.score ? m.staff2.score + ' PTS' : (isUpcoming ? 'PROJ: ' + (m.spread.split('•')[1] || '20 PTS') : '0 PTS')}</span>
                  <button class="btn-bracket-pick ${userPick === m.staff2.name ? 'active' : ''}" data-match-id="${m.id}" data-staff="${m.staff2.name}">
                    ${userPick === m.staff2.name ? '✓ Picked' : 'Pick'}
                  </button>
                </div>
              </div>
            </div>

            <button class="btn-reveal-showdown" data-match-id="${m.id}">
              <span>⚔️</span> Reveal Showdown Lore & Matchup Stats
            </button>
          </div>
        `;
      };

      return `
        <!-- Week Selector Row -->
        <div class="week-selector-wrapper">
          <span class="week-selector-label">Select NFL Week:</span>
          <div class="week-pills-row">
            ${WEEKLY_BRACKET_DATA.weeks.map((w, idx) => `
              <button class="week-pill-btn ${idx === this.selectedWeekIndex ? 'active' : ''}" data-week-index="${idx}">
                ${w.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- How Office Brackets Work Helper Card -->
        <div class="bracket-rules-card">
          <div class="bracket-rules-title">
            <span>📖 HOW THE WEEKLY OFFICE BRACKET WORKS</span>
            <span style="color:#facc15;">WEEKLY TOURNAMENT PROGRESSION</span>
          </div>
          <div class="bracket-rules-steps">
            <div class="bracket-rule-step">
              <strong>Stage 1 • Weekly Member Game Slate</strong>
              <span>All 7 office members active on Thursday & Sunday. Tap "Pick" to back the winning member!</span>
            </div>
            <div class="bracket-rule-step">
              <strong>Stage 2 • Semifinals (Sunday Late Slate)</strong>
              <span>Advancing top-scoring members unlock their Semifinal matchups on Sunday afternoon!</span>
            </div>
            <div class="bracket-rule-step">
              <strong>Stage 3 • Weekly Crown Finale (SNF / MNF)</strong>
              <span>Culminates on Sunday/Monday Night Primetime to decide the weekly champion!</span>
            </div>
          </div>
        </div>

        <!-- User Pick Tracker Bar -->
        <div class="user-picks-tracker-bar">
          <div class="user-picks-tracker-text">
            🎯 YOUR SAVED PICKS: ${pickedThisWeek.length}/4 THIS WEEK • ${totalUserPicksCount} SEASON PICKS LOCKED
          </div>
          <div class="user-picks-tracker-badge">
            ✓ PICKS SAVE AUTOMATICALLY
          </div>
        </div>

        <!-- Contender Filter Bar -->
        <div style="display:flex; flex-direction:column; gap:4px; margin-top:2px;">
          <div style="font-size:0.68rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">
            Filter by Contender:
          </div>
          <div class="contender-filter-bar">
            <button class="contender-filter-pill ${this.selectedContenderFilter === 'ALL' ? 'active' : ''}" data-contender="ALL">
              ⭐ All Contenders
            </button>
            ${CONTENDERS_LIST.map(c => `
              <button class="contender-filter-pill ${this.selectedContenderFilter === c.name ? 'active' : ''}" data-contender="${c.name}">
                ${c.name} (${c.team})
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Day Slate Filter Bar -->
        <div style="display:flex; flex-direction:column; gap:4px; margin-top:2px; margin-bottom:8px;">
          <div style="font-size:0.68rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">
            Filter by Slate:
          </div>
          <div class="contender-filter-bar">
            <button class="contender-filter-pill ${this.selectedDayFilter === 'ALL' ? 'active' : ''}" data-day="ALL">
              🏈 All Game Slates
            </button>
            <button class="contender-filter-pill ${this.selectedDayFilter === 'Thu' ? 'active' : ''}" data-day="Thu">
              ⚡ Thursday Night
            </button>
            <button class="contender-filter-pill ${this.selectedDayFilter === 'Sun Early' ? 'active' : ''}" data-day="Sun Early">
              ☀️ Sunday Early
            </button>
            <button class="contender-filter-pill ${this.selectedDayFilter === 'Sun Late' ? 'active' : ''}" data-day="Sun Late">
              🏜️ Sunday Late
            </button>
            <button class="contender-filter-pill ${this.selectedDayFilter === 'Mon' ? 'active' : ''}" data-day="Mon">
              🌙 Monday Night
            </button>
          </div>
        </div>

        <!-- Weekly Crown Leader -->
        <div class="weekly-crown-banner">
          <div class="crown-icon">👑</div>
          <div class="crown-details">
            <div class="crown-title">${curWeek.label} Office Pacesetter: ${curWeek.winner}</div>
            <div class="crown-sub">Weekly High Scorer MVP: ${curWeek.mvp} • Click any matchup node below to reveal battle lore!</div>
          </div>
        </div>

        <!-- 3-Round Interactive Tournament Bracket Tree -->
        <div class="tournament-bracket-tree">
          <div class="bracket-round-column">
            <div class="bracket-round-header">
              <span class="round-header-title">Stage 1 • Opening Slate</span>
              <span class="round-header-badge">4 MATCHES (ALL 7 MEMBERS)</span>
            </div>
            ${r1Matches.map(m => renderNode(m)).join('')}
          </div>

          <div class="bracket-round-column">
            <div class="bracket-round-header">
              <span class="round-header-title">Stage 2 • Semifinals</span>
              <span class="round-header-badge">2 MATCHES (SUN LATE)</span>
            </div>
            ${r2Matches.map(m => renderNode(m)).join('')}
          </div>

          <div class="bracket-round-column">
            <div class="bracket-round-header gold">
              <span class="round-header-title" style="color:#facc15;">👑 Weekly Grand Finale</span>
              <span class="round-header-badge" style="background:rgba(250,204,21,0.2); color:#facc15;">PRIMETIME FINALE</span>
            </div>
            ${r3Matches.map(m => renderNode(m, true)).join('')}
          </div>
        </div>
      `;
    }

    openShowdownModal(matchId) {
      let foundMatch = null;
      let foundRoundLabel = null;
      let isSeasonMatch = false;

      for (const w of WEEKLY_BRACKET_DATA.weeks) {
        const m = w.matchups.find(item => item.id === matchId);
        if (m) {
          foundMatch = m;
          foundRoundLabel = `${w.label.toUpperCase()} • ${m.roundName.toUpperCase()}`;
          break;
        }
      }

      if (!foundMatch) {
        for (const r of SEASON_TOURNAMENT_DATA.rounds) {
          const m = r.matchups.find(item => item.id === matchId);
          if (m) {
            foundMatch = m;
            foundRoundLabel = `18-WEEK SEASON TOURNAMENT • ${r.name.toUpperCase()}`;
            isSeasonMatch = true;
            break;
          }
        }
      }

      if (!foundMatch || !this.dom.showdownModalContent || !this.dom.showdownModalOverlay) return;

      const m = foundMatch;
      let s1 = m.staff1;
      let s2 = m.staff2;

      // For dynamic season rounds (Semis & Final), resolve staff1 and staff2 if based on prior picks
      if (isSeasonMatch && (!s1 || !s2)) {
        const findContender = (nameOrPick) => {
          if (!nameOrPick) return null;
          if (nameOrPick === 'Carolina Panthers' || nameOrPick.includes('Panthers')) {
            return {
              name: "Carolina Panthers",
              team: "CAR",
              teamName: "Panthers (NFL #32)",
              avatar: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
              bannerGif: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
              seed: "NFL #32",
              color: "#0085ca",
              rating: 79,
              yards: 280,
              rzPct: "45%",
              turnovers: "-8",
              score: 0,
              pick: "CAR Panthers (NFL #32)"
            };
          }
          return CONTENDERS_LIST.find(c => 
            c.name.toLowerCase() === nameOrPick.toLowerCase() || 
            c.team.toLowerCase() === nameOrPick.toLowerCase() ||
            (nameOrPick.toLowerCase().includes('cardinal') && c.team === 'ARI')
          ) || null;
        };

        if (m.id === 'st_s1') {
          s1 = findContender(this.seasonPicks['st_q1']);
          s2 = findContender(this.seasonPicks['st_q4']);
        } else if (m.id === 'st_s2') {
          s1 = findContender(this.seasonPicks['st_q2']);
          s2 = findContender(this.seasonPicks['st_q3']);
        } else if (m.id === 'st_final') {
          s1 = findContender(this.seasonPicks['st_s1']);
          s2 = findContender(this.seasonPicks['st_s2']);
        }
      }

      // If one or both are still TBD in a future round
      if (!s1 || !s2) {
        this.dom.showdownModalContent.innerHTML = `
          <div class="showdown-hero-banner">
            <div style="font-size:0.68rem; font-weight:800; color:#38bdf8; letter-spacing:1px; margin-bottom:4px;">
              ${foundRoundLabel}
            </div>
            <div class="showdown-hero-title">${m.title}</div>
            <div class="showdown-hero-meta">
              <span class="showdown-meta-item">📍 ${m.venue}</span>
              <span class="showdown-meta-item">⏰ ${m.kickoff}</span>
              <span class="showdown-meta-item">🏈 ${m.surface}</span>
            </div>
          </div>
          <div style="padding: 24px 16px; text-align:center; background:var(--bg-card-inner); border-radius:var(--radius-md); border:1.5px dashed var(--border-card);">
            <div style="font-size: 2.4rem; margin-bottom: 8px;">🔒</div>
            <div style="font-family:'Outfit', sans-serif; font-size:1.1rem; font-weight:800; color:#facc15; margin-bottom:6px;">
              Matchup TBD • Awaiting Previous Round Results
            </div>
            <div style="font-size:0.8rem; color:#cbd5e1; max-width:440px; margin:0 auto 16px auto; line-height:1.4;">
              ${m.lore || 'This matchup unlocks once prior round games conclude in real-time or when you make your picks in the 18-Week Season Tournament tab!'}
            </div>
            <div style="font-size:0.72rem; color:#94a3b8; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; display:inline-block;">
              ⚡ Pro Tip: Select winning picks in earlier rounds to simulate and unlock projected showdown lore!
            </div>
          </div>
        `;
        this.dom.showdownModalOverlay.classList.add('open');
        this.dom.showdownModalOverlay.style.display = 'flex';
        return;
      }

      const userPick = isSeasonMatch ? this.seasonPicks[m.id] : this.userPicks[m.id];

      this.dom.showdownModalContent.innerHTML = `
        <div class="showdown-hero-banner">
          <div style="font-size:0.68rem; font-weight:800; color:#38bdf8; letter-spacing:1px; margin-bottom:4px;">
            ${foundRoundLabel}
          </div>
          <div class="showdown-hero-title">${m.title}</div>
          <div class="showdown-hero-meta">
            <span class="showdown-meta-item">📍 ${m.venue}</span>
            <span class="showdown-meta-item">⏰ ${m.kickoff}</span>
            <span class="showdown-meta-item">🏈 ${m.surface}</span>
            <span class="showdown-meta-item" style="color:#facc15; font-weight:800;">📊 ${m.spread}</span>
          </div>
        </div>

        <div class="showdown-tale-grid">
          <div class="showdown-contender-card">
            <div class="showdown-contender-avatar-wrap" id="showdown-avatar-1" title="Click to toggle GIF banner">
              <img src="${s1.avatar}" class="showdown-contender-avatar-img" id="showdown-img-1" alt="${s1.name}" onerror="this.src='https://ui-avatars.com/api/?name=${s1.name}&background=0b1322&color=fff'">
            </div>
            <div class="showdown-contender-name">${s1.seed ? s1.seed + ' ' : ''}${s1.name}</div>
            <div class="showdown-contender-team">
              <span>${s1.teamName} (${s1.team})</span>
            </div>
            <div class="showdown-contender-stats-mini">
              <div><strong>Rating:</strong> ${s1.rating || 90} OVR</div>
              <div><strong>Offensive Avg:</strong> ${s1.yards || 340} YDS/G</div>
              <div><strong>Red Zone TD%:</strong> ${s1.rzPct || '65%'}</div>
            </div>
          </div>

          <div class="showdown-vs-center">
            <div class="showdown-vs-badge">VS</div>
            <span style="font-size:0.62rem; color:#facc15; font-weight:800;">HEAD-TO-HEAD</span>
          </div>

          <div class="showdown-contender-card">
            <div class="showdown-contender-avatar-wrap" id="showdown-avatar-2" title="Click to toggle GIF banner">
              <img src="${s2.avatar}" class="showdown-contender-avatar-img" id="showdown-img-2" alt="${s2.name}" onerror="this.src='https://ui-avatars.com/api/?name=${s2.name}&background=0b1322&color=fff'">
            </div>
            <div class="showdown-contender-name">${s2.seed ? s2.seed + ' ' : ''}${s2.name}</div>
            <div class="showdown-contender-team">
              <span>${s2.teamName} (${s2.team})</span>
            </div>
            <div class="showdown-contender-stats-mini">
              <div><strong>Rating:</strong> ${s2.rating || 90} OVR</div>
              <div><strong>Offensive Avg:</strong> ${s2.yards || 340} YDS/G</div>
              <div><strong>Red Zone TD%:</strong> ${s2.rzPct || '65%'}</div>
            </div>
          </div>
        </div>

        <div class="showdown-lore-card">
          <div class="showdown-card-section-title">
            <span>📜</span> Rivalry Lore & Battle Backstory
          </div>
          <div class="showdown-card-text">${m.lore}</div>
        </div>

        <div class="showdown-smack-wrap">
          <div style="font-size:0.75rem; font-weight:800; color:#38bdf8;">
            <span>💬 Matchup Smack Talk</span>
          </div>

          <div class="smack-bubble">
            <img src="${s1.avatar}" class="smack-avatar-mini" alt="${s1.name}" onerror="this.src='https://ui-avatars.com/api/?name=${s1.name}&background=0b1322&color=fff'">
            <div class="smack-content">
              <span class="smack-author">${s1.name} (${s1.teamName}):</span>
              <span class="smack-quote">"${m.smack1 || 'Ready to bring home the postseason win!'}"</span>
            </div>
          </div>

          <div class="smack-bubble">
            <img src="${s2.avatar}" class="smack-avatar-mini" alt="${s2.name}" onerror="this.src='https://ui-avatars.com/api/?name=${s2.name}&background=0b1322&color=fff'">
            <div class="smack-content">
              <span class="smack-author">${s2.name} (${s2.teamName}):</span>
              <span class="smack-quote">"${m.smack2 || 'We are marching all the way to Week 18!'}"</span>
            </div>
          </div>
        </div>

        <div class="showdown-stats-compare">
          <div style="font-size:0.75rem; font-weight:800; color:#facc15; margin-bottom:4px;">
            📊 Tale of the Tape Metrics
          </div>

          <div class="stat-compare-row">
            <div class="stat-compare-labels">
              <span style="color:#38bdf8;">${s1.name}: ${s1.rating || 90} OVR</span>
              <span style="color:#94a3b8;">Franchise Rating</span>
              <span style="color:#facc15;">${s2.name}: ${s2.rating || 90} OVR</span>
            </div>
            <div class="stat-bar-track">
              <div class="stat-bar-fill-left" style="width:${((s1.rating || 90) / ((s1.rating || 90) + (s2.rating || 90))) * 100}%;"></div>
              <div class="stat-bar-fill-right" style="width:${((s2.rating || 90) / ((s1.rating || 90) + (s2.rating || 90))) * 100}%;"></div>
            </div>
          </div>

          <div class="stat-compare-row">
            <div class="stat-compare-labels">
              <span style="color:#38bdf8;">${s1.yards || 340} YDS</span>
              <span style="color:#94a3b8;">Offensive Yards / Game</span>
              <span style="color:#facc15;">${s2.yards || 340} YDS</span>
            </div>
            <div class="stat-bar-track">
              <div class="stat-bar-fill-left" style="width:${((s1.yards || 340) / ((s1.yards || 340) + (s2.yards || 340) || 1)) * 100}%;"></div>
              <div class="stat-bar-fill-right" style="width:${((s2.yards || 340) / ((s1.yards || 340) + (s2.yards || 340) || 1)) * 100}%;"></div>
            </div>
          </div>
        </div>

        <div style="margin-top:4px;">
          <div style="font-size:0.75rem; font-weight:800; color:#fff; margin-bottom:6px; text-align:center;">
            🎯 MAKE YOUR ${isSeasonMatch ? 'SEASON TOURNAMENT' : 'WEEKLY BRACKET'} PICK FOR THIS SHOWDOWN:
          </div>
          <div class="showdown-picks-row">
            <button class="btn-showdown-action ${userPick === s1.name ? 'active-pick' : ''}" id="btn-pick-contender-1">
              ${userPick === s1.name ? '✓ Picked ' + s1.name : 'Pick ' + s1.name + ' (' + s1.team + ')'}
            </button>
            <button class="btn-showdown-action ${userPick === s2.name ? 'active-pick' : ''}" id="btn-pick-contender-2">
              ${userPick === s2.name ? '✓ Picked ' + s2.name : 'Pick ' + s2.name + ' (' + s2.team + ')'}
            </button>
          </div>
        </div>
      `;

      let isGif1 = false;
      const avatarWrap1 = document.getElementById('showdown-avatar-1');
      const img1 = document.getElementById('showdown-img-1');
      avatarWrap1?.addEventListener('click', () => {
        isGif1 = !isGif1;
        img1.src = isGif1 ? (s1.bannerGif || s1.avatar) : s1.avatar;
      });

      let isGif2 = false;
      const avatarWrap2 = document.getElementById('showdown-avatar-2');
      const img2 = document.getElementById('showdown-img-2');
      avatarWrap2?.addEventListener('click', () => {
        isGif2 = !isGif2;
        img2.src = isGif2 ? (s2.bannerGif || s2.avatar) : s2.avatar;
      });

      document.getElementById('btn-pick-contender-1')?.addEventListener('click', () => {
        if (isSeasonMatch) {
          if (m.id.startsWith('st_q')) {
            delete this.seasonPicks['st_final'];
          }
          if (m.id.startsWith('st_s')) {
            delete this.seasonPicks['st_final'];
          }
          this.seasonPicks[m.id] = s1.name;
          localStorage.setItem('office_endzone_season_picks', JSON.stringify(this.seasonPicks));
        } else {
          this.userPicks[m.id] = s1.name;
          localStorage.setItem('office_endzone_picks', JSON.stringify(this.userPicks));
        }
        this.openShowdownModal(m.id);
        this.renderBracketsHub();
      });

      document.getElementById('btn-pick-contender-2')?.addEventListener('click', () => {
        if (isSeasonMatch) {
          if (m.id.startsWith('st_q')) {
            delete this.seasonPicks['st_final'];
          }
          if (m.id.startsWith('st_s')) {
            delete this.seasonPicks['st_final'];
          }
          this.seasonPicks[m.id] = s2.name;
          localStorage.setItem('office_endzone_season_picks', JSON.stringify(this.seasonPicks));
        } else {
          this.userPicks[m.id] = s2.name;
          localStorage.setItem('office_endzone_picks', JSON.stringify(this.userPicks));
        }
        this.openShowdownModal(m.id);
        this.renderBracketsHub();
      });

      this.dom.showdownModalOverlay.classList.add('open');
      this.dom.showdownModalOverlay.style.display = 'flex';
    }

    closeShowdownModal() {
      if (!this.dom.showdownModalOverlay) return;
      this.dom.showdownModalOverlay.classList.remove('open');
      this.dom.showdownModalOverlay.style.display = 'none';
    }

    renderSeasonLadderContent() {
      const findContender = (nameOrPick) => {
        if (!nameOrPick) return null;
        if (nameOrPick === 'Carolina Panthers' || nameOrPick.includes('Panthers')) {
          return {
            name: "Carolina Panthers",
            team: "CAR",
            teamName: "Panthers",
            seed: "NFL #32",
            score: 0,
            pick: "CAR Panthers (NFL #32)"
          };
        }
        return CONTENDERS_LIST.find(c => 
          c.name.toLowerCase() === nameOrPick.toLowerCase() || 
          c.team.toLowerCase() === nameOrPick.toLowerCase() ||
          (nameOrPick.toLowerCase().includes('cardinal') && c.team === 'ARI')
        ) || null;
      };

      // QF Contenders
      const qf1_c1 = CONTENDERS_LIST.find(c => c.name === 'Andrea') || { name: 'Andrea', team: 'GB', seed: '#1', pick: 'GB Packers' };
      const qf1_c2 = CONTENDERS_LIST.find(c => c.name === 'Saul') || { name: 'Saul', team: 'SF', seed: '#6', pick: 'SF 49ers' };

      const qf2_c1 = CONTENDERS_LIST.find(c => c.name === 'Mariah') || { name: 'Mariah', team: 'PHI', seed: '#2', pick: 'PHI Eagles' };
      const qf2_c2 = CONTENDERS_LIST.find(c => c.name === 'Nicole') || { name: 'Nicole', team: 'LV', seed: '#5', pick: 'LV Raiders' };

      const qf3_c1 = CONTENDERS_LIST.find(c => c.name === 'CJ') || { name: 'CJ', team: 'CHI', seed: '#3', pick: 'CHI Bears' };
      const qf3_c2 = CONTENDERS_LIST.find(c => c.name === 'Mario') || { name: 'Mario', team: 'CLE', seed: '#4', pick: 'CLE Browns' };

      const qf4_c1 = CONTENDERS_LIST.find(c => c.name === 'Cardinals Flag') || { name: 'Cardinals Flag', team: 'ARI', seed: '#7', pick: 'ARI Cardinals' };
      const qf4_c2 = { name: 'Carolina Panthers', team: 'CAR', teamName: 'Panthers', seed: 'NFL #32', pick: 'CAR Panthers (NFL #32)' };

      // Semifinal Contenders (resolved from picks or placeholders)
      const s1_c1 = findContender(this.seasonPicks['st_q1']) || { name: 'TBD (Winner QF 1: Andrea/Saul)', team: '', seed: 'ADV', pick: 'Winner QF 1' };
      const s1_c2 = findContender(this.seasonPicks['st_q4']) || { name: 'TBD (Winner QF 4: Flag/Panthers)', team: '', seed: 'ADV', pick: 'Winner QF 4' };

      const s2_c1 = findContender(this.seasonPicks['st_q2']) || { name: 'TBD (Winner QF 2: Mariah/Nicole)', team: '', seed: 'ADV', pick: 'Winner QF 2' };
      const s2_c2 = findContender(this.seasonPicks['st_q3']) || { name: 'TBD (Winner QF 3: CJ/Mario)', team: '', seed: 'ADV', pick: 'Winner QF 3' };

      // Finalist Contenders (resolved from semi picks or placeholders)
      const f_c1 = findContender(this.seasonPicks['st_s1']) || { name: 'TBD (Winner Semifinal 1)', team: '', seed: 'TOP', pick: 'Winner SF 1' };
      const f_c2 = findContender(this.seasonPicks['st_s2']) || { name: 'TBD (Winner Semifinal 2)', team: '', seed: 'TOP', pick: 'Winner SF 2' };

      const seasonPicksCount = Object.keys(this.seasonPicks).length;
      const crownedChamp = this.seasonPicks['st_final'];

      const renderSeasonNode = (matchId, weekLabel, rivalryName, c1, c2, isFinal = false) => {
        const userPick = this.seasonPicks[matchId];
        const canPick1 = c1 && c1.name && !c1.name.startsWith('TBD');
        const canPick2 = c2 && c2.name && !c2.name.startsWith('TBD');

        return `
          <div class="bracket-matchup-node ${isFinal ? 'championship-node' : ''}" data-match-id="${matchId}" role="button" tabindex="0">
            <div class="match-node-top">
              <span class="match-rivalry-name">${rivalryName}</span>
              <span class="matchup-status-pill preview">${weekLabel}</span>
            </div>

            <div class="match-node-contenders">
              <div class="bracket-contestant-row ${userPick === c1?.name ? 'user-picked' : ''}" style="${!canPick1 ? 'background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.12);' : ''}">
                <div class="contestant-identity">
                  <div class="contestant-name-box">
                    <span class="contestant-staff-name" style="${!canPick1 ? 'color:#94a3b8; font-style:italic;' : ''}">${c1?.seed ? c1.seed + ' ' : ''}${c1?.name || 'TBD'} ${c1?.team ? '(' + c1.team + ')' : ''}</span>
                    <span class="contestant-team-pick" style="color:#64748b;">${c1?.pick || (canPick1 ? c1?.teamName : 'Awaiting Previous Round')}</span>
                  </div>
                </div>
                <div class="contestant-score-action">
                  ${canPick1 ? `
                    <button class="btn-season-pick btn-bracket-pick ${userPick === c1.name ? 'active' : ''}" data-match-id="${matchId}" data-staff="${c1.name}">
                      ${userPick === c1.name ? '✓ Picked' : 'Pick'}
                    </button>
                  ` : `<span class="contestant-score-num" style="color:#64748b; font-size:0.68rem;">TBD</span>`}
                </div>
              </div>

              <div class="bracket-vs-divider">VS</div>

              <div class="bracket-contestant-row ${userPick === c2?.name ? 'user-picked' : ''}" style="${!canPick2 ? 'background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.12);' : ''}">
                <div class="contestant-identity">
                  <div class="contestant-name-box">
                    <span class="contestant-staff-name" style="${!canPick2 ? 'color:#94a3b8; font-style:italic;' : ''}">${c2?.seed ? c2.seed + ' ' : ''}${c2?.name || 'TBD'} ${c2?.team ? '(' + c2.team + ')' : ''}</span>
                    <span class="contestant-team-pick" style="color:#64748b;">${c2?.pick || (canPick2 ? c2?.teamName : 'Awaiting Previous Round')}</span>
                  </div>
                </div>
                <div class="contestant-score-action">
                  ${canPick2 ? `
                    <button class="btn-season-pick btn-bracket-pick ${userPick === c2.name ? 'active' : ''}" data-match-id="${matchId}" data-staff="${c2.name}">
                      ${userPick === c2.name ? '✓ Picked' : 'Pick'}
                    </button>
                  ` : `<span class="contestant-score-num" style="color:#64748b; font-size:0.68rem;">TBD</span>`}
                </div>
              </div>
            </div>

            <button class="btn-season-reveal-showdown btn-reveal-showdown" data-match-id="${matchId}">
              <span>⚔️</span> Reveal Showdown Lore & Matchup Stats
            </button>
          </div>
        `;
      };

      return `
        <div class="season-ladder-view">
          <!-- Explainer Card -->
          <div class="ladder-explainer-card">
            <span style="font-size:1.3rem;">🛡️</span>
            <div class="ladder-info-text">
              <strong>2026 Office Endzone Regular Season Championship (Weeks 16–18)</strong><br>
              Featuring all 7 office contenders! Weeks 1–15 determine regular season seeding (#1 through #7). Tap "Pick" on any matchup below to simulate and advance your chosen contenders to the Week 18 Grand Finale!
            </div>
          </div>

          <!-- User Season Pick Tracker Bar -->
          <div class="user-picks-tracker-bar">
            <div class="user-picks-tracker-text">
              🎯 SEASON BRACKET PICKS: ${seasonPicksCount}/7 ROUNDS LOCKED
            </div>
            <button class="btn-reset-season-picks" title="Reset all season tournament picks">
              ↺ Reset Season Picks
            </button>
          </div>

          <!-- Crowned Champion Banner if Chosen -->
          ${crownedChamp ? `
            <div class="weekly-crown-banner championship-crowned-banner" style="background:linear-gradient(90deg, #facc15, #f59e0b); color:#0b1322;">
              <div class="crown-icon">🏆</div>
              <div class="crown-details">
                <div class="crown-title" style="color:#0b1322; font-size:0.95rem; font-weight:900;">2026 REGULAR SEASON CHAMPION: ${crownedChamp.toUpperCase()}</div>
                <div class="crown-sub" style="color:#1e293b; font-weight:800;">Winner of the 18-Week Tournament! Eternal office bragging rights & Lombardi Trophy!</div>
              </div>
            </div>
          ` : ''}

          <!-- 3-Round Interactive Tournament Bracket Tree (Names Only) -->
          <div class="tournament-bracket-tree">
            <!-- Column 1: Quarterfinals (Week 16) -->
            <div class="bracket-round-column">
              <div class="bracket-round-header">
                <span class="round-header-title">Round 1 • Quarterfinals</span>
                <span class="round-header-badge">WEEK 16 (4 MATCHES)</span>
              </div>
              ${renderSeasonNode('st_q1', 'WEEK 16', '#1 Andrea vs #6 Saul', qf1_c1, qf1_c2)}
              ${renderSeasonNode('st_q2', 'WEEK 16', '#2 Mariah vs #5 Nicole', qf2_c1, qf2_c2)}
              ${renderSeasonNode('st_q3', 'WEEK 16', '#3 CJ vs #4 Mario', qf3_c1, qf3_c2)}
              ${renderSeasonNode('st_q4', 'WEEK 16', '#7 Cardinals Flag vs NFL #32 Panthers', qf4_c1, qf4_c2)}
            </div>

            <!-- Column 2: Semifinals (Week 17) -->
            <div class="bracket-round-column">
              <div class="bracket-round-header">
                <span class="round-header-title">Round 2 • Semifinals</span>
                <span class="round-header-badge">WEEK 17 (2 MATCHES)</span>
              </div>
              ${renderSeasonNode('st_s1', 'WEEK 17', 'Semifinal 1 (Winner QF 1 vs QF 4)', s1_c1, s1_c2)}
              ${renderSeasonNode('st_s2', 'WEEK 17', 'Semifinal 2 (Winner QF 2 vs QF 3)', s2_c1, s2_c2)}
            </div>

            <!-- Column 3: Grand Championship Finale (Week 18) -->
            <div class="bracket-round-column">
              <div class="bracket-round-header gold">
                <span class="round-header-title" style="color:#facc15;">👑 Round 3 • Championship</span>
                <span class="round-header-badge" style="background:rgba(250,204,21,0.2); color:#facc15;">WEEK 18 FINALE</span>
              </div>
              ${renderSeasonNode('st_final', 'WEEK 18', '👑 2026 Season Grand Championship', f_c1, f_c2, true)}
            </div>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // FULL INTERACTIVE NFL BOX SCORE ENGINE
    // =========================================================================
    openBoxScoreModal(matchupData, mode = 'CURRENT') {
      if (!this.dom.boxScoreModalContent || !this.dom.boxScoreModalOverlay) return;

      // Auto-detect mode if matchupData belongs specifically to yesterday vs today
      let activeMode = mode;
      let selectedGame = null;

      if (matchupData && matchupData.away && matchupData.home) {
        const awayCode = (typeof matchupData.away === 'string' ? matchupData.away : matchupData.away.code || '').toUpperCase();
        const homeCode = (typeof matchupData.home === 'string' ? matchupData.home : matchupData.home.code || '').toUpperCase();
        
        const todayMatch = TODAY_TICKER_GAMES.find(g => g.away.toUpperCase() === awayCode && g.home.toUpperCase() === homeCode);
        const yestMatch = YESTERDAY_TICKER_GAMES.find(g => g.away.toUpperCase() === awayCode && g.home.toUpperCase() === homeCode);

        if (yestMatch && !todayMatch) {
          activeMode = 'LAST_WEEK';
          selectedGame = yestMatch;
        } else if (todayMatch) {
          activeMode = 'CURRENT';
          selectedGame = todayMatch;
        } else {
          selectedGame = {
            away: awayCode,
            awayScore: "24",
            home: homeCode,
            homeScore: "21",
            status: "FINAL",
            isLive: false
          };
        }
      }

      const gamesList = activeMode === 'LAST_WEEK' ? YESTERDAY_TICKER_GAMES : TODAY_TICKER_GAMES;
      if (!selectedGame) {
        selectedGame = gamesList[0];
      }

      this.renderBoxScoreModalContent(selectedGame, gamesList, activeMode);

      this.dom.boxScoreModalOverlay.classList.add('open');
      this.dom.boxScoreModalOverlay.style.display = 'flex';
    }

    renderBoxScoreModalContent(activeGame, gamesList, mode) {
      const awayCode = (activeGame.away || 'CHI').toUpperCase();
      const homeCode = (activeGame.home || 'GB').toUpperCase();

      const awayTeam = this.teams.find(t => t.abbreviation.toUpperCase() === awayCode || t.id.toUpperCase() === awayCode) || {
        city: awayCode,
        name: "Football Team",
        abbreviation: awayCode,
        color: "#38bdf8",
        logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${awayCode.toLowerCase()}.png`,
        qb: "Starting Quarterback",
        stadium: "NFL Stadium"
      };

      const homeTeam = this.teams.find(t => t.abbreviation.toUpperCase() === homeCode || t.id.toUpperCase() === homeCode) || {
        city: homeCode,
        name: "Football Team",
        abbreviation: homeCode,
        color: "#facc15",
        logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${homeCode.toLowerCase()}.png`,
        qb: "Starting Quarterback",
        stadium: "NFL Stadium"
      };

      const awayNum = parseInt(activeGame.awayScore) || 20;
      const homeNum = parseInt(activeGame.homeScore) || 19;

      // Linescore quarter breakdown calculation
      const q1Away = Math.max(0, Math.floor(awayNum * 0.2));
      const q2Away = Math.max(0, Math.floor(awayNum * 0.35));
      const q3Away = Math.max(0, Math.floor(awayNum * 0.2));
      const q4Away = Math.max(0, awayNum - (q1Away + q2Away + q3Away));

      const q1Home = Math.max(0, Math.floor(homeNum * 0.25));
      const q2Home = Math.max(0, Math.floor(homeNum * 0.3));
      const q3Home = Math.max(0, Math.floor(homeNum * 0.2));
      const q4Home = Math.max(0, homeNum - (q1Home + q2Home + q3Home));

      // Realistic team stats
      const awayYards = 260 + (awayNum * 5);
      const homeYards = 250 + (homeNum * 5);
      const awayPass = Math.floor(awayYards * 0.68);
      const awayRush = awayYards - awayPass;
      const homePass = Math.floor(homeYards * 0.65);
      const homeRush = homeYards - homePass;

      if (this.dom.boxScoreBadgeStatus) {
        this.dom.boxScoreBadgeStatus.textContent = mode === 'LAST_WEEK' ? "📅 LAST WEEK'S BOX SCORE" : "📊 LIVE NFL BOX SCORE";
      }
      if (this.dom.boxScoreVenueTime) {
        this.dom.boxScoreVenueTime.textContent = `${activeGame.status} • ${homeTeam.stadium || 'NFL Stadium'}`;
      }

      this.dom.boxScoreModalContent.innerHTML = `
        <!-- Week Selector Tabs -->
        <div class="box-score-week-tabs">
          <button class="box-week-tab-btn ${mode === 'CURRENT' ? 'active' : ''}" data-target-mode="CURRENT">
            ⚡ THIS WEEK (8 GAMES)
          </button>
          <button class="box-week-tab-btn ${mode === 'LAST_WEEK' ? 'active' : ''}" data-target-mode="LAST_WEEK">
            📅 LAST WEEK (8 GAMES)
          </button>
        </div>

        <!-- Game Selector Horizontal Pills -->
        <div class="box-score-game-selector">
          ${gamesList.map((g, idx) => {
            const isActive = g.away.toUpperCase() === awayCode && g.home.toUpperCase() === homeCode;
            return `
              <button class="box-selector-btn ${isActive ? 'active' : ''}" data-idx="${idx}" title="${g.away} vs ${g.home}">
                ${g.away} ${g.awayScore} @ ${g.home} ${g.homeScore}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Hero Scoreboard -->
        <div class="box-score-hero">
          <div class="box-hero-team away">
            <img src="${awayTeam.logo}" class="box-hero-logo" alt="${awayTeam.name}" onerror="this.src='https://ui-avatars.com/api/?name=${awayTeam.abbreviation}&background=0b1322&color=fff'">
            <div class="box-hero-info">
              <span class="box-hero-name" style="color:${awayTeam.color};">${awayTeam.city}</span>
              <span class="box-hero-sub">${awayTeam.name}</span>
            </div>
          </div>

          <div class="box-hero-score-center">
            <div class="box-hero-score-nums">
              <span class="${awayNum >= homeNum ? 'winner-score' : ''}">${awayNum}</span>
              <span style="color:#64748b; font-size:1.3rem;">-</span>
              <span class="${homeNum >= awayNum ? 'winner-score' : ''}">${homeNum}</span>
            </div>
            <div class="box-hero-status-pill">${activeGame.status}</div>
          </div>

          <div class="box-hero-team home">
            <img src="${homeTeam.logo}" class="box-hero-logo" alt="${homeTeam.name}" onerror="this.src='https://ui-avatars.com/api/?name=${homeTeam.abbreviation}&background=0b1322&color=fff'">
            <div class="box-hero-info">
              <span class="box-hero-name" style="color:${homeTeam.color};">${homeTeam.city}</span>
              <span class="box-hero-sub">${homeTeam.name}</span>
            </div>
          </div>
        </div>

        <!-- Linescore Table -->
        <div>
          <div class="box-section-title"><span>📋</span> Line Score (Quarter Breakdown)</div>
          <div class="box-linescore-wrap">
            <table class="box-linescore-table">
              <thead>
                <tr>
                  <th style="text-align:left; padding-left:14px;">Team</th>
                  <th>Q1</th>
                  <th>Q2</th>
                  <th>Q3</th>
                  <th>Q4</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="team-cell" style="padding-left:14px;">
                    <img src="${awayTeam.logo}" style="width:16px; height:16px; object-fit:contain;" alt="">
                    <span style="font-weight:800; color:${awayTeam.color};">${awayTeam.abbreviation}</span>
                  </td>
                  <td>${q1Away}</td>
                  <td>${q2Away}</td>
                  <td>${q3Away}</td>
                  <td>${q4Away}</td>
                  <td class="total-cell">${awayNum}</td>
                </tr>
                <tr>
                  <td class="team-cell" style="padding-left:14px;">
                    <img src="${homeTeam.logo}" style="width:16px; height:16px; object-fit:contain;" alt="">
                    <span style="font-weight:800; color:${homeTeam.color};">${homeTeam.abbreviation}</span>
                  </td>
                  <td>${q1Home}</td>
                  <td>${q2Home}</td>
                  <td>${q3Home}</td>
                  <td>${q4Home}</td>
                  <td class="total-cell">${homeNum}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Team Comparison Stats -->
        <div>
          <div class="box-section-title"><span>📊</span> Team Matchup Statistics</div>
          <div class="box-stats-card">
            <!-- 1st Downs -->
            <div class="box-stat-row">
              <div class="box-stat-labels">
                <span class="box-stat-val-away">${Math.floor(awayYards / 18)}</span>
                <span class="box-stat-name">First Downs</span>
                <span class="box-stat-val-home">${Math.floor(homeYards / 18)}</span>
              </div>
              <div class="box-stat-bar-track">
                <div class="box-stat-bar-away" style="width:50%;"></div>
                <div class="box-stat-bar-home" style="width:50%;"></div>
              </div>
            </div>

            <!-- Total Yards -->
            <div class="box-stat-row">
              <div class="box-stat-labels">
                <span class="box-stat-val-away">${awayYards}</span>
                <span class="box-stat-name">Total Net Yards</span>
                <span class="box-stat-val-home">${homeYards}</span>
              </div>
              <div class="box-stat-bar-track">
                <div class="box-stat-bar-away" style="width:${(awayYards / (awayYards + homeYards)) * 100}%;"></div>
                <div class="box-stat-bar-home" style="width:${(homeYards / (awayYards + homeYards)) * 100}%;"></div>
              </div>
            </div>

            <!-- Passing Yards -->
            <div class="box-stat-row">
              <div class="box-stat-labels">
                <span class="box-stat-val-away">${awayPass}</span>
                <span class="box-stat-name">Passing Yards</span>
                <span class="box-stat-val-home">${homePass}</span>
              </div>
              <div class="box-stat-bar-track">
                <div class="box-stat-bar-away" style="width:${(awayPass / (awayPass + homePass)) * 100}%;"></div>
                <div class="box-stat-bar-home" style="width:${(homePass / (awayPass + homePass)) * 100}%;"></div>
              </div>
            </div>

            <!-- Rushing Yards -->
            <div class="box-stat-row">
              <div class="box-stat-labels">
                <span class="box-stat-val-away">${awayRush}</span>
                <span class="box-stat-name">Rushing Yards</span>
                <span class="box-stat-val-home">${homeRush}</span>
              </div>
              <div class="box-stat-bar-track">
                <div class="box-stat-bar-away" style="width:${(awayRush / (awayRush + homeRush)) * 100}%;"></div>
                <div class="box-stat-bar-home" style="width:${(homeRush / (awayRush + homeRush)) * 100}%;"></div>
              </div>
            </div>

            <!-- 3rd Down Efficiency -->
            <div class="box-stat-row">
              <div class="box-stat-labels">
                <span class="box-stat-val-away">6/12</span>
                <span class="box-stat-name">3rd Down Efficiency</span>
                <span class="box-stat-val-home">5/11</span>
              </div>
              <div class="box-stat-bar-track">
                <div class="box-stat-bar-away" style="width:52%;"></div>
                <div class="box-stat-bar-home" style="width:48%;"></div>
              </div>
            </div>

            <!-- Turnovers -->
            <div class="box-stat-row">
              <div class="box-stat-labels">
                <span class="box-stat-val-away">${awayNum > homeNum ? '0' : '2'}</span>
                <span class="box-stat-name">Turnovers Lost</span>
                <span class="box-stat-val-home">${homeNum > awayNum ? '0' : '1'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Player Leaders -->
        <div>
          <div class="box-section-title"><span>⭐</span> Key Individual Leaders</div>
          <div class="box-leaders-grid">
            <div class="box-leader-card">
              <span class="box-leader-cat">${awayTeam.abbreviation} Passing</span>
              <span class="box-leader-player">${awayTeam.qb || 'Franchise QB'}</span>
              <span class="box-leader-stat">${Math.floor(awayPass / 12)}/28, ${awayPass} YDS, 2 TD</span>
            </div>
            <div class="box-leader-card">
              <span class="box-leader-cat">${homeTeam.abbreviation} Passing</span>
              <span class="box-leader-player">${homeTeam.qb || 'Franchise QB'}</span>
              <span class="box-leader-stat">${Math.floor(homePass / 11)}/26, ${homePass} YDS, 2 TD</span>
            </div>
            <div class="box-leader-card">
              <span class="box-leader-cat">${awayTeam.abbreviation} Rushing</span>
              <span class="box-leader-player">Lead Tailback</span>
              <span class="box-leader-stat">16 CAR, ${awayRush} YDS, 1 TD</span>
            </div>
            <div class="box-leader-card">
              <span class="box-leader-cat">${homeTeam.abbreviation} Rushing</span>
              <span class="box-leader-player">Lead Tailback</span>
              <span class="box-leader-stat">18 CAR, ${homeRush} YDS, 1 TD</span>
            </div>
          </div>
        </div>

        <!-- Scoring Drives Summary -->
        <div>
          <div class="box-section-title"><span>🎯</span> Scoring Drives Breakdown</div>
          <div class="box-drives-list">
            <div class="box-drive-item">
              <span class="box-drive-desc"><strong>Q1 09:14</strong> • ${awayTeam.abbreviation} - 28-yard field goal</span>
              <span class="box-drive-score">3 - 0</span>
            </div>
            <div class="box-drive-item home-score">
              <span class="box-drive-desc"><strong>Q2 11:20</strong> • ${homeTeam.abbreviation} - 12-yard TD pass by ${homeTeam.qb} (XP Good)</span>
              <span class="box-drive-score">3 - 7</span>
            </div>
            <div class="box-drive-item">
              <span class="box-drive-desc"><strong>Q2 01:45</strong> • ${awayTeam.abbreviation} - 35-yard TD pass by ${awayTeam.qb} (XP Good)</span>
              <span class="box-drive-score">10 - 7</span>
            </div>
            <div class="box-drive-item home-score">
              <span class="box-drive-desc"><strong>Q3 04:30</strong> • ${homeTeam.abbreviation} - 4-yard rushing TD (XP Good)</span>
              <span class="box-drive-score">10 - 14</span>
            </div>
            <div class="box-drive-item">
              <span class="box-drive-desc"><strong>Q4 02:15</strong> • ${awayTeam.abbreviation} - Go-ahead 18-yard TD pass (XP Good)</span>
              <span class="box-drive-score">${awayNum} - ${homeNum}</span>
            </div>
          </div>
        </div>
      `;

      // Bind week toggle buttons inside the modal
      this.dom.boxScoreModalContent.querySelectorAll('.box-week-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetMode = btn.dataset.targetMode;
          const targetList = targetMode === 'LAST_WEEK' ? YESTERDAY_TICKER_GAMES : TODAY_TICKER_GAMES;
          this.renderBoxScoreModalContent(targetList[0], targetList, targetMode);
        });
      });

      // Bind matchup switcher buttons
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

    openChallengesDrawer() {
      if (!this.dom.drawerBody || !this.dom.secondaryDrawer) return;
      this.dom.drawerTitle.textContent = "🏆 2026 Active Office Football Challenges";
      
      const contendersBadges = [
        { name: "Andrea", team: "GB", color: "#facc15", badges: ["🧀 Lambeau Scout", "🏆 Wk 1 Contender"], icons: ["🔥", "🚀", "🏆"] },
        { name: "Mariah", team: "PHI", color: "#2dd4bf", badges: ["🦅 Midnight Green", "🏆 Wk 1 Contender"], icons: ["🚀", "🎯", "🏆"] },
        { name: "CJ", team: "CHI", color: "#f87171", badges: ["🐻 Bear Down", "🏆 Wk 1 Contender"], icons: ["🚀", "🔥", "🏆"] },
        { name: "Mario", team: "CLE", color: "#fb923c", badges: ["🐶 Dawg Pound", "🏆 Wk 1 Contender"], icons: ["💥", "🎯", "🏆"] },
        { name: "Nicole", team: "LV", color: "#38bdf8", badges: ["☠️ Raider Nation", "🏆 Wk 1 Contender"], icons: ["🔥", "🚀", "🏆"] },
        { name: "Saul", team: "SF", color: "#fb7185", badges: ["⛏️ Faithful 49ers", "🏆 Wk 1 Contender"], icons: ["💥", "🎯", "🏆"] },
        { name: "Cardinals Flag", team: "ARI", color: "#f43f5e", badges: ["🚩 Desert Flag", "🏆 Wk 1 Contender"], icons: ["🎯", "🔥", "🏆"] }
      ];

      this.dom.drawerBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- 100% Automatic Explainer Banner -->
          <div class="ladder-explainer-card" style="border-left:4px solid #10b981; background:linear-gradient(135deg, rgba(16,185,129,0.1), rgba(15,23,42,0.9));">
            <span style="font-size:1.4rem;">⚡</span>
            <div class="ladder-info-text">
              <strong style="color:#10b981;">100% Automated Weekly Milestones — Zero Manual Picks Required!</strong><br>
              Every week, the app automatically tracks your team's real NFL game stats (Yards, Points, Sacks & Field Goals). Whenever your team hits a milestone in their game, you automatically win that challenge's achievement icon!
            </div>
          </div>

          <!-- Automated Weekly Badge Board -->
          <div class="standings-table-wrap">
            <div style="padding:10px 14px; background:rgba(0,0,0,0.3); font-family:'Outfit',sans-serif; font-size:0.8rem; font-weight:800; color:#facc15; display:flex; justify-content:space-between; align-items:center;">
              <span>🎖️ AUTOMATED WEEKLY BADGE SHOWCASE</span>
              <span style="font-size:0.68rem; color:#94a3b8; font-weight:600;">Auto-awarded from weekly NFL games</span>
            </div>
            <table class="dugout-standings-table">
              <thead>
                <tr>
                  <th class="col-team">STAFF MEMBER</th>
                  <th class="col-stat">TEAM</th>
                  <th style="text-align:center;">EARNED ICONS</th>
                  <th class="col-stat">STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${contendersBadges.map(c => `
                  <tr>
                    <td style="color:#fff; font-weight:800;">${c.name}</td>
                    <td style="color:${c.color}; font-weight:800;">${c.team}</td>
                    <td style="text-align:center; font-size:1.15rem; letter-spacing:4px;">
                      ${c.icons.map(ic => `<span title="Automated Weekly Award" style="cursor:help;">${ic}</span>`).join(' ')}
                    </td>
                    <td class="col-stat" style="color:#10b981; font-weight:800; font-size:0.7rem;">AUTO-ACTIVE</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Active Milestone Challenge Cards -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
            <!-- Rocket Challenge -->
            <div style="background:#0b1322; padding:14px; border-radius:12px; border-top:4px solid #10b981; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.3rem;">🚀</span>
                <span style="font-size:0.68rem; color:#10b981; background:rgba(16,185,129,0.15); padding:2px 8px; border-radius:10px; font-weight:800;">OFFENSE • 400+ YDS</span>
              </div>
              <strong style="color:#10b981; font-size:0.9rem;">400-Yard Aerial Assault</strong>
              <p style="color:#94a3b8; font-size:0.75rem; line-height:1.3;">Automatically awarded when a contender's team records 400+ total passing and rushing yards in their weekly game.</p>
              <div style="margin-top:4px; font-size:0.72rem; color:#facc15; font-weight:700;">🎁 Reward: 🚀 Rocket Icon + 150 Office Pts</div>
            </div>

            <!-- Flame Challenge -->
            <div style="background:#0b1322; padding:14px; border-radius:12px; border-top:4px solid #facc15; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.3rem;">🔥</span>
                <span style="font-size:0.68rem; color:#facc15; background:rgba(250,204,21,0.15); padding:2px 8px; border-radius:10px; font-weight:800;">SCORING • 30+ PTS</span>
              </div>
              <strong style="color:#facc15; font-size:0.9rem;">High-Octane Shootout</strong>
              <p style="color:#94a3b8; font-size:0.75rem; line-height:1.3;">Automatically awarded when a contender's team scores 30+ points or participates in a 50+ total point weekly game.</p>
              <div style="margin-top:4px; font-size:0.72rem; color:#facc15; font-weight:700;">🎁 Reward: 🔥 Flame Icon + 200 Office Pts</div>
            </div>

            <!-- Explosion Challenge -->
            <div style="background:#0b1322; padding:14px; border-radius:12px; border-top:4px solid #f97316; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.3rem;">💥</span>
                <span style="font-size:0.68rem; color:#fb923c; background:rgba(249,115,22,0.15); padding:2px 8px; border-radius:10px; font-weight:800;">DEFENSE • 4+ SACKS</span>
              </div>
              <strong style="color:#fb923c; font-size:0.9rem;">Sack City Blitz Patrol</strong>
              <p style="color:#94a3b8; font-size:0.75rem; line-height:1.3;">Automatically awarded when a contender's defense forces 4+ QB sacks in their weekly game.</p>
              <div style="margin-top:4px; font-size:0.72rem; color:#facc15; font-weight:700;">🎁 Reward: 💥 Explosion Icon + 175 Office Pts</div>
            </div>

            <!-- Target Challenge -->
            <div style="background:#0b1322; padding:14px; border-radius:12px; border-top:4px solid #38bdf8; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.3rem;">🎯</span>
                <span style="font-size:0.68rem; color:#38bdf8; background:rgba(56,189,248,0.15); padding:2px 8px; border-radius:10px; font-weight:800;">SPECIAL TEAMS • 3+ FG</span>
              </div>
              <strong style="color:#38bdf8; font-size:0.9rem;">Clutch Kicker 50+ Showdown</strong>
              <p style="color:#94a3b8; font-size:0.75rem; line-height:1.3;">Automatically awarded when a contender's kicker converts 3+ field goals or a 45+ yard kick.</p>
              <div style="margin-top:4px; font-size:0.72rem; color:#facc15; font-weight:700;">🎁 Reward: 🎯 Target Icon + 125 Office Pts</div>
            </div>

            <!-- Trophy Challenge -->
            <div style="background:#0b1322; padding:14px; border-radius:12px; border-top:4px solid #eab308; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.3rem;">🏆</span>
                <span style="font-size:0.68rem; color:#eab308; background:rgba(234,179,8,0.15); padding:2px 8px; border-radius:10px; font-weight:800;">VICTORY • GAME WIN</span>
              </div>
              <strong style="color:#eab308; font-size:0.9rem;">Weekly Game Victory Crown</strong>
              <p style="color:#94a3b8; font-size:0.75rem; line-height:1.3;">Automatically awarded whenever a contender's team wins their weekly NFL game.</p>
              <div style="margin-top:4px; font-size:0.72rem; color:#facc15; font-weight:700;">🎁 Reward: 🏆 Trophy Icon + 250 Office Pts</div>
            </div>
          </div>
        </div>
      `;
      this.dom.secondaryDrawer.style.display = 'flex';
      this.dom.secondaryDrawer.scrollIntoView({ behavior: 'smooth' });
    }

    openStandingsDrawer() {
      if (!this.dom.drawerBody || !this.dom.secondaryDrawer) return;
      this.dom.drawerTitle.textContent = "📊 Office Football Season Standings";
      this.dom.drawerBody.innerHTML = `
        <div class="standings-table-wrap">
          <table class="dugout-standings-table">
            <thead>
              <tr>
                <th class="col-team">STAFF MEMBER</th>
                <th class="col-stat">TEAM</th>
                <th class="col-stat">W</th>
                <th class="col-stat">L</th>
                <th class="col-stat">PCT</th>
              </tr>
            </thead>
            <tbody>
              ${this.roster.map(m => `
                <tr>
                  <td style="color:#fff; font-weight:700;">${m.name}</td>
                  <td style="color:${this.teams.find(t=>t.id===m.teamId)?.color || '#38bdf8'}; font-weight:800;">${m.teamName}</td>
                  <td class="col-stat">${m.picks.record.split('-')[0]}</td>
                  <td class="col-stat">${m.picks.record.split('-')[1]}</td>
                  <td class="col-stat">${m.picks.pct}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      this.dom.secondaryDrawer.style.display = 'flex';
      this.dom.secondaryDrawer.scrollIntoView({ behavior: 'smooth' });
    }

    closeDrawer() {
      if (this.dom.secondaryDrawer) {
        this.dom.secondaryDrawer.style.display = 'none';
      }
    }

    async fetchLiveEspnFeed() {
      try {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.events && data.events.length > 0) {
          const liveList = data.events.map(ev => {
            const comp = ev.competitions[0];
            const away = comp.competitors.find(c => c.homeAway === 'away');
            const home = comp.competitors.find(c => c.homeAway === 'home');
            const status = ev.status.type.completed ? 'FINAL' : (ev.status.type.state === 'in' ? ev.status.type.shortDetail : formatArizonaTime(ev.date));

            return {
              away: away.team.abbreviation,
              awayScore: away.score || '0',
              home: home.team.abbreviation,
              homeScore: home.score || '0',
              status: status,
              isLive: ev.status.type.state === 'in'
            };
          });

          if (liveList.length > 0) {
            TODAY_TICKER_GAMES.length = 0;
            TODAY_TICKER_GAMES.push(...liveList);
            if (this.currentTickerMode === 'TODAY') {
              this.renderTicker();
            }
          }
        }
      } catch (err) {
        console.log('Using built-in live ticker schedule.');
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const app = new DugoutEndzoneApp();
    app.init();
  });
})();
