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

  // 1. DATASETS
  const TEAMS = [
    { id: "CHI", city: "Chicago", name: "Bears", abbreviation: "CHI", color: "#ef4444", secondaryColor: "#0B162A", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png", stadium: "Soldier Field", division: "NFC North", qb: "Caleb Williams" },
    { id: "GB", city: "Green Bay", name: "Packers", abbreviation: "GB", color: "#facc15", secondaryColor: "#203731", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png", stadium: "Lambeau Field", division: "NFC North", qb: "Jordan Love" },
    { id: "CLE", city: "Cleveland", name: "Browns", abbreviation: "CLE", color: "#fb923c", secondaryColor: "#311D00", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png", stadium: "Huntington Bank Field", division: "AFC North", qb: "Deshaun Watson" },
    { id: "LV", city: "Las Vegas", name: "Raiders", abbreviation: "LV", color: "#38bdf8", secondaryColor: "#000000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png", stadium: "Allegiant Stadium", division: "AFC West", qb: "Gardner Minshew" },
    { id: "SF", city: "San Francisco", name: "49ers", abbreviation: "SF", color: "#fb7185", secondaryColor: "#AA0000", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png", stadium: "Levi's Stadium", division: "NFC West", qb: "Brock Purdy" },
    { id: "ARI", city: "Arizona", name: "Cardinals", abbreviation: "ARI", color: "#f43f5e", secondaryColor: "#97233F", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png", stadium: "State Farm Stadium", division: "NFC West", qb: "Kyler Murray" },
    { id: "DET", city: "Detroit", name: "Lions", abbreviation: "DET", color: "#0076B6", secondaryColor: "#B0B7BC", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png", stadium: "Ford Field", division: "NFC North", qb: "Jared Goff" },
    { id: "MIN", city: "Minnesota", name: "Vikings", abbreviation: "MIN", color: "#4F2683", secondaryColor: "#FFC62F", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/min.png", stadium: "U.S. Bank Stadium", division: "NFC North", qb: "Sam Darnold" },
    { id: "PIT", city: "Pittsburgh", name: "Steelers", abbreviation: "PIT", color: "#FFB612", secondaryColor: "#101820", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png", stadium: "Acrisure Stadium", division: "AFC North", qb: "Russell Wilson" },
    { id: "BAL", city: "Baltimore", name: "Ravens", abbreviation: "BAL", color: "#241773", secondaryColor: "#9E7C0C", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png", stadium: "M&T Bank Stadium", division: "AFC North", qb: "Lamar Jackson" },
    { id: "KC", city: "Kansas City", name: "Chiefs", abbreviation: "KC", color: "#E31837", secondaryColor: "#FFB81C", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png", stadium: "Arrowhead Stadium", division: "AFC West", qb: "Patrick Mahomes" },
    { id: "LAC", city: "Los Angeles", name: "Chargers", abbreviation: "LAC", color: "#0080C6", secondaryColor: "#FFC20E", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png", stadium: "SoFi Stadium", division: "AFC West", qb: "Justin Herbert" },
    { id: "DEN", city: "Denver", name: "Broncos", abbreviation: "DEN", color: "#FB4F14", secondaryColor: "#002244", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/den.png", stadium: "Empower Field", division: "AFC West", qb: "Bo Nix" },
    { id: "LAR", city: "Los Angeles", name: "Rams", abbreviation: "LAR", color: "#003594", secondaryColor: "#FFA300", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png", stadium: "SoFi Stadium", division: "NFC West", qb: "Matthew Stafford" },
    { id: "SEA", city: "Seattle", name: "Seahawks", abbreviation: "SEA", color: "#002244", secondaryColor: "#69BE28", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png", stadium: "Lumen Field", division: "NFC West", qb: "Geno Smith" },
    { id: "PHI", city: "Philadelphia", name: "Eagles", abbreviation: "PHI", color: "#004C54", secondaryColor: "#A5ACAF", logo: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png", stadium: "Lincoln Financial Field", division: "NFC East", qb: "Jalen Hurts" }
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
        { date: "8/16", away: "GB", home: "CHI", time: "12:15 PM MST", isHome: false },
        { date: "8/17", away: "DET", home: "GB", time: "5:05 PM MST", isHome: true },
        { date: "8/18", away: "DET", home: "GB", time: "5:05 PM MST", isHome: true },
        { date: "8/19", away: "MIN", home: "GB", time: "11:20 AM MST", isHome: true },
        { date: "8/21", away: "GB", home: "LAR", time: "7:10 PM MST", isHome: false }
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
        { date: "8/16", away: "GB", home: "CHI", time: "12:15 PM MST", isHome: true },
        { date: "8/17", away: "CHI", home: "KC", time: "5:15 PM MST", isHome: false },
        { date: "8/18", away: "MIN", home: "CHI", time: "10:00 AM MST", isHome: true },
        { date: "8/20", away: "CHI", home: "DET", time: "5:00 PM MST", isHome: false },
        { date: "8/22", away: "SF", home: "CHI", time: "6:15 PM MST", isHome: true }
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
        { date: "8/16", away: "PIT", home: "CLE", time: "1:05 PM MST", isHome: true },
        { date: "8/17", away: "CLE", home: "BAL", time: "10:00 AM MST", isHome: false },
        { date: "8/19", away: "CIN", home: "CLE", time: "5:15 PM MST", isHome: true },
        { date: "8/21", away: "CLE", home: "PHI", time: "5:00 PM MST", isHome: false },
        { date: "8/23", away: "NYG", home: "CLE", time: "1:00 PM MST", isHome: true }
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
        { date: "8/16", away: "KC", home: "LV", time: "5:20 PM MST", isHome: true },
        { date: "8/18", away: "LV", home: "LAC", time: "1:05 PM MST", isHome: false },
        { date: "8/20", away: "DEN", home: "LV", time: "5:00 PM MST", isHome: true },
        { date: "8/22", away: "LV", home: "MIA", time: "10:00 AM MST", isHome: false },
        { date: "8/24", away: "ATL", home: "LV", time: "1:25 PM MST", isHome: true }
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
        { date: "8/16", away: "SF", home: "LAR", time: "1:25 PM MST", isHome: false },
        { date: "8/17", away: "ARI", home: "SF", time: "5:00 PM MST", isHome: true },
        { date: "8/19", away: "SF", home: "SEA", time: "5:15 PM MST", isHome: false },
        { date: "8/21", away: "DAL", home: "SF", time: "5:20 PM MST", isHome: true },
        { date: "8/23", away: "SF", home: "NO", time: "10:00 AM MST", isHome: false }
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
        { date: "8/16", away: "SEA", home: "ARI", time: "1:05 PM MST", isHome: true },
        { date: "8/17", away: "ARI", home: "SF", time: "5:00 PM MST", isHome: false },
        { date: "8/19", away: "LAR", home: "ARI", time: "1:25 PM MST", isHome: true },
        { date: "8/21", away: "ARI", home: "DEN", time: "1:05 PM MST", isHome: false },
        { date: "8/23", away: "LAC", home: "ARI", time: "5:00 PM MST", isHome: true }
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
        { date: "8/16", away: "PHI", home: "NYG", time: "10:00 AM MST", isHome: false },
        { date: "8/17", away: "DAL", home: "PHI", time: "5:15 PM MST", isHome: true },
        { date: "8/19", away: "PHI", home: "WAS", time: "10:00 AM MST", isHome: false },
        { date: "8/21", away: "CLE", home: "PHI", time: "5:00 PM MST", isHome: true },
        { date: "8/23", away: "PHI", home: "BAL", time: "1:00 PM MST", isHome: false }
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

  function buildWeeklyTournamentData() {
    return {
      activeWeek: 1,
      weeks: Array.from({ length: 18 }, (_, idx) => {
        const wNum = idx + 1;
        const isPast = false; // Fresh 2026 Kickoff
        const isActive = wNum === 1;
        const status = isActive ? 'LIVE' : 'UPCOMING';

        // Pairings rotated for all 18 weeks across 7 staff contenders
        const p1 = CONTENDERS_LIST[idx % 7]; // #1 Seed of the week (Earns Round 1 Bye!)
        const p2 = CONTENDERS_LIST[(idx + 1) % 7];
        const p3 = CONTENDERS_LIST[(idx + 2) % 7];
        const p4 = CONTENDERS_LIST[(idx + 3) % 7];
        const p5 = CONTENDERS_LIST[(idx + 4) % 7];
        const p6 = CONTENDERS_LIST[(idx + 5) % 7];
        const p7 = CONTENDERS_LIST[(idx + 6) % 7];

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
            title: `Matchup 4: ${p7.name}'s Featured Showdown`,
            rivalryName: `${p7.name} vs Conference Showdown`,
            day: "Sun Late",
            venue: "State Farm Stadium • Glendale, AZ",
            kickoff: "Sunday • 1:05 PM MST",
            surface: "Natural Grass Tray",
            spread: "ARI -2.5 • O/U 43.5",
            staff1: { ...p7, score: s1_score, pick: `${p7.team} ${p7.teamName}` },
            staff2: { name: "Seahawks/Rams", team: "SEA", teamName: "Rivals", avatar: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png", seed: "OPP", color: "#002244", rating: 87, yards: 0, rzPct: "0%", turnovers: "0", score: s2_score, pick: "SEA Seahawks" },
            lore: "Arizona's Red Sea defense battles in the division trenches for critical Week 1 conference standing.",
            smack1: "The desert heat will melt your defensive gameplan! Protect the nest!",
            smack2: "We're coming into Glendale to set the tone for the entire season!",
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
        banterSpeaker: document.getElementById('banter-speaker'),
        modalDialogText: document.getElementById('modal-dialog-text'),
        btnModalCheer: document.getElementById('btn-modal-cheer'),
        btnOpenBoxScore: document.getElementById('btn-open-box-score'),

        // Showdown Reveal Modal elements
        showdownModalOverlay: document.getElementById('showdown-modal-overlay'),
        showdownModalContent: document.getElementById('showdown-modal-content'),
        showdownModalClose: document.getElementById('showdown-modal-close'),

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
        btnCloseDrawer: document.getElementById('btn-close-drawer'),

        // Banner
        eventBanner: document.getElementById('event-banner')
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

      this.dom.tickerGrid.innerHTML = games.map(game => {
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
               title="${hasOfficeMember ? 'Click to open staff member card' : 'NFL Matchup'}">
            
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
      this.isGifActive = true; // Auto-play animated banner immediately upon opening card

      const team = this.teams.find(t => t.id === member.teamId) || this.teams[0];

      // Update avatar card with autoplaying banner
      this.dom.modalAvatarCard.className = `modal-avatar-card ${member.frameClass}`;
      this.renderModalMedia(member, true);

      // Identity
      this.dom.modalMemberName.textContent = member.name;
      this.dom.modalTeamLogo.src = team.logo;
      this.dom.modalTeamLogo.alt = team.name;
      this.dom.modalTeamName.textContent = member.teamName;
      this.dom.modalTeamName.style.color = team.color;

      // Picks
      this.dom.picksRecord.textContent = member.picks.record;
      this.dom.picksPct.textContent = member.picks.pct;
      this.dom.picksStreak.textContent = member.picks.streak;
      this.dom.trophyCount.textContent = `× ${member.trophy.count}`;
      this.dom.trophyLabel.textContent = member.trophy.label;

      // Today's Matchup
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

      // Schedule Next 5 Days
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

      // Daily Yards & TDs Leader Table
      this.dom.dailyLeadersTbody.innerHTML = this.roster.map(r => `
        <tr class="${r.id === member.id ? 'highlight-team-row' : ''}">
          <td class="col-team" style="font-weight:700;">${r.name} (${r.teamId})</td>
          <td class="col-stat">${r.liveStats.yards} YDS</td>
          <td class="col-stat">${r.liveStats.tds} TD</td>
          <td class="col-stat">${r.liveStats.status}</td>
        </tr>
      `).join('');

      // Banter
      this.dom.banterSpeaker.textContent = `${member.name}'s Watercooler Intel:`;
      this.dom.modalDialogText.textContent = member.banter;

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

    showBanner(title, subtitle) {
      if (!this.dom.eventBanner) return;
      this.dom.eventBanner.innerHTML = `
        <div class="banner-title">${title}</div>
        <div class="banner-sub">${subtitle}</div>
      `;
      this.dom.eventBanner.classList.add('show');
      if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
      this.bannerTimeout = setTimeout(() => {
        this.dom.eventBanner.classList.remove('show');
      }, 2200);
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
          this.showBanner(`NFL MATCHUP: ${away} @ ${home}`, `NFL Gridiron Matchup • Check live scores & odds`);
        }
      });

      // Ticker tab toggles
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

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });

      // GIF / Banner Toggle (Clicking on avatar card or badge)
      this.dom.modalAvatarCard?.addEventListener('click', () => this.toggleGifMode());
      this.dom.modalGifToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleGifMode();
      });

      // Modal cheer button
      this.dom.btnModalCheer?.addEventListener('click', () => {
        this.spawnConfetti();
        this.showBanner('TOUCHDOWN CELEBRATION! 🏈', `${this.selectedMember?.name || 'The office'} fired up the stadium siren! Bear Down & Go Pack Go!`);
      });

      // Box score click
      this.dom.btnOpenBoxScore?.addEventListener('click', () => {
        this.showBanner('LIVE NFL BOX SCORE 📊', `Opening ESPN Live Tracker for ${this.selectedMember?.matchup.venue || 'Stadium'}`);
      });

      // Top buttons
      this.dom.btnYesterdayModal?.addEventListener('click', () => {
        this.currentTickerMode = 'YESTERDAY';
        this.dom.tabYesterdayTicker.classList.add('active');
        this.dom.tabTodayTicker.classList.remove('active');
        this.renderTicker();
        this.showBanner("YESTERDAY'S SCORES LOADED 📅", "Displaying final NFL scores and box outcomes.");
      });

      this.dom.btnSignIn?.addEventListener('click', () => {
        this.showBanner('OFFICE ROSTER CONNECTED 🏈', 'Signed in as Active Gridiron Predictor.');
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

      // Event banner click to dismiss immediately
      this.dom.eventBanner?.addEventListener('click', () => {
        if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
        this.dom.eventBanner.classList.remove('show');
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.dom.showdownModalOverlay?.classList.contains('open')) {
            this.closeShowdownModal();
          } else if (this.dom.modalOverlay?.classList.contains('open')) {
            this.closeMemberModal();
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
      const curWeek = WEEKLY_BRACKET_DATA.weeks[this.selectedWeekIndex] || WEEKLY_BRACKET_DATA.weeks[1];

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
        // Week selection pills
        document.querySelectorAll('.week-pill-btn').forEach(pill => {
          pill.addEventListener('click', () => {
            this.selectedWeekIndex = parseInt(pill.dataset.weekIndex, 10);
            this.renderBracketsHub();
          });
        });

        // Contender Filter pills
        document.querySelectorAll('.contender-filter-pill').forEach(pill => {
          pill.addEventListener('click', () => {
            this.selectedContenderFilter = pill.dataset.contender;
            this.renderBracketsHub();
          });
        });

        // Day Slate Filter pills
        document.querySelectorAll('.day-pill-btn').forEach(pill => {
          pill.addEventListener('click', () => {
            this.selectedDayFilter = pill.dataset.day;
            this.renderBracketsHub();
          });
        });

        // Reveal Showdown Modal buttons & card clicks
        document.querySelectorAll('.btn-reveal-showdown, .bracket-matchup-node').forEach(elem => {
          elem.addEventListener('click', (e) => {
            if (e.target.closest('.btn-bracket-pick')) return; // ignore pick button clicks
            const matchId = elem.dataset.matchId;
            if (matchId) {
              this.openShowdownModal(matchId);
            }
          });
        });

        // Bracket Pick buttons
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
                <!-- Contender Slot 1 -->
                <div class="bracket-contestant-row" style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.12);">
                  <div class="contestant-identity">
                    <div style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:800; color:#94a3b8;">?</div>
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

                <!-- Contender Slot 2 -->
                <div class="bracket-contestant-row" style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.12);">
                  <div class="contestant-identity">
                    <div style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:800; color:#94a3b8;">?</div>
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

              <!-- Unlocking Note -->
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
              <!-- Staff 1 -->
              <div class="bracket-contestant-row ${staff1Won && !isUpcoming ? 'winning' : ''} ${userPick === m.staff1.name ? 'user-picked' : ''}">
                <div class="contestant-identity">
                  <img src="${m.staff1.avatar}" class="contestant-avatar-sm" alt="${m.staff1.name}" onerror="this.src='https://ui-avatars.com/api/?name=${m.staff1.name}&background=0b1322&color=fff'">
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

              <!-- Staff 2 -->
              <div class="bracket-contestant-row ${staff2Won && !isUpcoming ? 'winning' : ''} ${userPick === m.staff2.name ? 'user-picked' : ''}">
                <div class="contestant-identity">
                  <img src="${m.staff2.avatar}" class="contestant-avatar-sm" alt="${m.staff2.name}" onerror="this.src='https://ui-avatars.com/api/?name=${m.staff2.name}&background=0b1322&color=fff'">
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

            <!-- Reveal Button -->
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
              <span>All 7 office members' NFL games are live on Thursday & Sunday. Tap "Pick" to back the winning member!</span>
            </div>
            <div class="bracket-rule-step">
              <strong>Stage 2 • Semifinals (Sunday Late Slate)</strong>
              <span>As Stage 1 games conclude, the advancing top-scoring office members unlock their Semifinal matchups!</span>
            </div>
            <div class="bracket-rule-step">
              <strong>Stage 3 • Weekly Crown Finale (SNF / MNF)</strong>
              <span>Culminates on Sunday/Monday Night Primetime when the final office team finishes to decide the weekly champion!</span>
            </div>
          </div>
        </div>

        <!-- User Pick & Scoring Tracker Bar -->
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
                <img src="${c.avatar}" style="width:14px; height:14px; border-radius:50%; object-fit:cover;" alt="${c.name}">
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
          <!-- Column 1: Stage 1 / Opening Round -->
          <div class="bracket-round-column">
            <div class="bracket-round-header">
              <span class="round-header-title">Stage 1 • Opening Slate</span>
              <span class="round-header-badge">4 MATCHES (ALL 7 MEMBERS)</span>
            </div>
            ${r1Matches.map(m => renderNode(m)).join('')}
          </div>

          <!-- Column 2: Stage 2 / Semifinals -->
          <div class="bracket-round-column">
            <div class="bracket-round-header">
              <span class="round-header-title">Stage 2 • Semifinals</span>
              <span class="round-header-badge">2 MATCHES (SUN LATE)</span>
            </div>
            ${r2Matches.map(m => renderNode(m)).join('')}
          </div>

          <!-- Column 3: Stage 3 / Grand Finale -->
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
      // Find matchup across all weeks
      let foundMatch = null;
      let foundWeek = null;

      for (const w of WEEKLY_BRACKET_DATA.weeks) {
        const m = w.matchups.find(item => item.id === matchId);
        if (m) {
          foundMatch = m;
          foundWeek = w;
          break;
        }
      }

      if (!foundMatch || !this.dom.showdownModalContent || !this.dom.showdownModalOverlay) return;

      const m = foundMatch;
      const userPick = this.userPicks[m.id];
      const s1 = m.staff1;
      const s2 = m.staff2;

      this.dom.showdownModalContent.innerHTML = `
        <!-- Hero Header -->
        <div class="showdown-hero-banner">
          <div style="font-size:0.68rem; font-weight:800; color:#38bdf8; letter-spacing:1px; margin-bottom:4px;">
            ${foundWeek.label.toUpperCase()} • ${m.roundName.toUpperCase()}
          </div>
          <div class="showdown-hero-title">${m.title}</div>
          <div class="showdown-hero-meta">
            <span class="showdown-meta-item">📍 ${m.venue}</span>
            <span class="showdown-meta-item">⏰ ${m.kickoff}</span>
            <span class="showdown-meta-item">🏈 ${m.surface}</span>
            <span class="showdown-meta-item" style="color:#facc15; font-weight:800;">📊 ${m.spread}</span>
          </div>
        </div>

        <!-- Tale of the Tape Grid -->
        <div class="showdown-tale-grid">
          <!-- Contender 1 -->
          <div class="showdown-contender-card">
            <div class="showdown-contender-avatar-wrap" id="showdown-avatar-1" title="Click to toggle GIF banner">
              <img src="${s1.avatar}" class="showdown-contender-avatar-img" id="showdown-img-1" alt="${s1.name}" onerror="this.src='https://ui-avatars.com/api/?name=${s1.name}&background=0b1322&color=fff'">
            </div>
            <div class="showdown-contender-name">${s1.seed} ${s1.name}</div>
            <div class="showdown-contender-team">
              <span>${s1.teamName} (${s1.team})</span>
            </div>
            <div class="showdown-contender-stats-mini">
              <div><strong>Rating:</strong> ${s1.rating} OVR</div>
              <div><strong>Offensive Avg:</strong> ${s1.yards} YDS/G</div>
              <div><strong>Red Zone TD%:</strong> ${s1.rzPct}</div>
            </div>
          </div>

          <!-- VS Badge Center -->
          <div class="showdown-vs-center">
            <div class="showdown-vs-badge">VS</div>
            <span style="font-size:0.62rem; color:#facc15; font-weight:800;">HEAD-TO-HEAD</span>
          </div>

          <!-- Contender 2 -->
          <div class="showdown-contender-card">
            <div class="showdown-contender-avatar-wrap" id="showdown-avatar-2" title="Click to toggle GIF banner">
              <img src="${s2.avatar}" class="showdown-contender-avatar-img" id="showdown-img-2" alt="${s2.name}" onerror="this.src='https://ui-avatars.com/api/?name=${s2.name}&background=0b1322&color=fff'">
            </div>
            <div class="showdown-contender-name">${s2.seed} ${s2.name}</div>
            <div class="showdown-contender-team">
              <span>${s2.teamName} (${s2.team})</span>
            </div>
            <div class="showdown-contender-stats-mini">
              <div><strong>Rating:</strong> ${s2.rating} OVR</div>
              <div><strong>Offensive Avg:</strong> ${s2.yards} YDS/G</div>
              <div><strong>Red Zone TD%:</strong> ${s2.rzPct}</div>
            </div>
          </div>
        </div>

        <!-- Rivalry Lore & Battle Backstory -->
        <div class="showdown-lore-card">
          <div class="showdown-card-section-title">
            <span>📜</span> Rivalry Lore & Battle Backstory
          </div>
          <div class="showdown-card-text">${m.lore}</div>
        </div>

        <!-- Watercooler Smack Talk -->
        <div class="showdown-smack-wrap">
          <div style="font-size:0.75rem; font-weight:800; color:#38bdf8; display:flex; align-items:center; justify-content:space-between;">
            <span>💬 Watercooler Smack Talk</span>
            <button id="btn-showdown-cheer" style="background:rgba(56,189,248,0.15); border:1px solid #38bdf8; border-radius:12px; color:#38bdf8; font-size:0.65rem; padding:2px 8px; cursor:pointer;">
              📣 Cheer Loud!
            </button>
          </div>

          <div class="smack-bubble">
            <img src="${s1.avatar}" class="smack-avatar-mini" alt="${s1.name}">
            <div class="smack-content">
              <span class="smack-author">${s1.name} (${s1.teamName}):</span>
              <span class="smack-quote">"${m.smack1}"</span>
            </div>
          </div>

          <div class="smack-bubble">
            <img src="${s2.avatar}" class="smack-avatar-mini" alt="${s2.name}">
            <div class="smack-content">
              <span class="smack-author">${s2.name} (${s2.teamName}):</span>
              <span class="smack-quote">"${m.smack2}"</span>
            </div>
          </div>
        </div>

        <!-- Head-to-Head Stats Comparison -->
        <div class="showdown-stats-compare">
          <div style="font-size:0.75rem; font-weight:800; color:#facc15; margin-bottom:4px;">
            📊 Tale of the Tape Metrics
          </div>

          <!-- Rating -->
          <div class="stat-compare-row">
            <div class="stat-compare-labels">
              <span style="color:#38bdf8;">${s1.name}: ${s1.rating} OVR</span>
              <span style="color:#94a3b8;">Franchise Rating</span>
              <span style="color:#facc15;">${s2.name}: ${s2.rating} OVR</span>
            </div>
            <div class="stat-bar-track">
              <div class="stat-bar-fill-left" style="width:${(s1.rating / (s1.rating + s2.rating)) * 100}%;"></div>
              <div class="stat-bar-fill-right" style="width:${(s2.rating / (s1.rating + s2.rating)) * 100}%;"></div>
            </div>
          </div>

          <!-- Yards -->
          <div class="stat-compare-row">
            <div class="stat-compare-labels">
              <span style="color:#38bdf8;">${s1.yards} YDS</span>
              <span style="color:#94a3b8;">Offensive Yards / Game</span>
              <span style="color:#facc15;">${s2.yards} YDS</span>
            </div>
            <div class="stat-bar-track">
              <div class="stat-bar-fill-left" style="width:${(s1.yards / (s1.yards + s2.yards)) * 100}%;"></div>
              <div class="stat-bar-fill-right" style="width:${(s2.yards / (s1.yards + s2.yards)) * 100}%;"></div>
            </div>
          </div>

          <!-- Turnovers -->
          <div class="stat-compare-row">
            <div class="stat-compare-labels">
              <span style="color:#38bdf8;">${s1.turnovers}</span>
              <span style="color:#94a3b8;">Turnover Differential</span>
              <span style="color:#facc15;">${s2.turnovers}</span>
            </div>
            <div class="stat-bar-track">
              <div class="stat-bar-fill-left" style="width:55%;"></div>
              <div class="stat-bar-fill-right" style="width:45%;"></div>
            </div>
          </div>
        </div>

        <!-- Pick Action Row -->
        <div style="margin-top:4px;">
          <div style="font-size:0.75rem; font-weight:800; color:#fff; margin-bottom:6px; text-align:center;">
            🎯 MAKE YOUR BRACKET PICK FOR THIS SHOWDOWN:
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

      // Bind GIF toggle on avatar clicks
      let isGif1 = false;
      const avatarWrap1 = document.getElementById('showdown-avatar-1');
      const img1 = document.getElementById('showdown-img-1');
      avatarWrap1?.addEventListener('click', () => {
        isGif1 = !isGif1;
        img1.src = isGif1 ? s1.bannerGif : s1.avatar;
      });

      let isGif2 = false;
      const avatarWrap2 = document.getElementById('showdown-avatar-2');
      const img2 = document.getElementById('showdown-img-2');
      avatarWrap2?.addEventListener('click', () => {
        isGif2 = !isGif2;
        img2.src = isGif2 ? s2.bannerGif : s2.avatar;
      });

      // Bind Pick buttons inside modal
      document.getElementById('btn-pick-contender-1')?.addEventListener('click', () => {
        this.userPicks[m.id] = s1.name;
        localStorage.setItem('office_endzone_picks', JSON.stringify(this.userPicks));
        this.openShowdownModal(m.id);
        this.renderBracketsHub();
      });

      document.getElementById('btn-pick-contender-2')?.addEventListener('click', () => {
        this.userPicks[m.id] = s2.name;
        localStorage.setItem('office_endzone_picks', JSON.stringify(this.userPicks));
        this.openShowdownModal(m.id);
        this.renderBracketsHub();
      });

      // Bind Cheer button
      document.getElementById('btn-showdown-cheer')?.addEventListener('click', () => {
        this.showBanner('STADIUM ROAR! 📣🔥', `Office crowd goes wild for ${m.rivalryName}!`);
      });

      // Open Modal
      this.dom.showdownModalOverlay.classList.add('open');
      this.dom.showdownModalOverlay.style.display = 'flex';
    }

    closeShowdownModal() {
      if (!this.dom.showdownModalOverlay) return;
      this.dom.showdownModalOverlay.classList.remove('open');
      this.dom.showdownModalOverlay.style.display = 'none';
    }

    renderSeasonLadderContent() {
      return `
        <div class="season-ladder-view">
          <div class="ladder-explainer-card">
            <span style="font-size:1.3rem;">🛡️</span>
            <div class="ladder-info-text">
              <strong>2026 Office Endzone Regular Season Championship (Weeks 1-18)</strong><br>
              Tracks the entire 2026 NFL regular season journey among office members. Concludes at the final game of Week 18 prior to the NFL playoffs to crown the 2026 Office Gridiron Champion!
            </div>
          </div>

          <div class="ladder-rounds-grid">
            <!-- Round 1 / Quarterfinals -->
            <div class="ladder-round-box">
              <span class="ladder-round-label">Round 1 • Quarterfinals (2026 Playoff Qualifier)</span>
              <div class="bracket-contestant-row">
                <span class="contestant-staff-name">#3 Mario (CLE Browns)</span>
                <span class="contestant-score-num">0 PTS</span>
              </div>
              <div class="bracket-contestant-row">
                <span class="contestant-staff-name">#6 Cardinals Flag (ARI Cardinals)</span>
                <span class="contestant-score-num">0 PTS</span>
              </div>
              <div style="height:4px;"></div>
              <div class="bracket-contestant-row">
                <span class="contestant-staff-name">#4 Nicole (LV Raiders)</span>
                <span class="contestant-score-num">0 PTS</span>
              </div>
              <div class="bracket-contestant-row">
                <span class="contestant-staff-name">#5 Saul (SF 49ers)</span>
                <span class="contestant-score-num">0 PTS</span>
              </div>
            </div>

            <!-- Round 2 / Semifinals -->
            <div class="ladder-round-box">
              <span class="ladder-round-label">Round 2 • Semifinals (2026 Championship Semis)</span>
              <div class="bracket-contestant-row">
                <span class="contestant-staff-name">#1 Andrea (GB Packers • Round 1 Bye)</span>
                <span class="contestant-score-num">0 PTS</span>
              </div>
              <div class="bracket-contestant-row">
                <span class="contestant-staff-name">Winner QF 1</span>
                <span class="contestant-score-num">0 PTS</span>
              </div>
              <div style="height:4px;"></div>
              <div class="bracket-contestant-row">
                <span class="contestant-staff-name">#2 CJ (CHI Bears • Round 1 Bye)</span>
                <span class="contestant-score-num">0 PTS</span>
              </div>
              <div class="bracket-contestant-row">
                <span class="contestant-staff-name">Winner QF 2</span>
                <span class="contestant-score-num">0 PTS</span>
              </div>
            </div>

            <!-- Championship Finale -->
            <div class="ladder-round-box ladder-championship-grand">
              <span class="ladder-round-label">👑 Week 18 Regular Season Grand Finale</span>
              <div class="bracket-contestant-row" style="background:rgba(250,204,21,0.1);">
                <div class="contestant-identity">
                  <span class="contestant-staff-name" style="color:#facc15; font-size:0.9rem;">2026 Semifinal 1 Winner</span>
                </div>
                <span class="contestant-score-num" style="font-size:1.1rem;">0 PTS</span>
              </div>
              <div class="bracket-vs-divider" style="color:#facc15;">VS</div>
              <div class="bracket-contestant-row">
                <div class="contestant-identity">
                  <span class="contestant-staff-name">2026 Semifinal 2 Winner</span>
                </div>
                <span class="contestant-score-num">0 PTS</span>
              </div>
            </div>

            <!-- Grand Winner Ribbon -->
            <div class="weekly-crown-banner" style="background:linear-gradient(90deg, #38bdf8, #2563eb); color:#fff;">
              <div class="crown-icon">🏈</div>
              <div class="crown-details">
                <div class="crown-title" style="color:#fff; font-weight:900;">2026 Office Endzone Season Championship: Starting Gate</div>
                <div class="crown-sub" style="color:#e2e8f0; font-weight:700;">6 Contenders Ready • Crowned Week 18 Prior to NFL Playoffs</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    openChallengesDrawer() {
      if (!this.dom.drawerBody || !this.dom.secondaryDrawer) return;
      this.dom.drawerTitle.textContent = "🏆 2026 Active Office Football Challenges";
      this.dom.drawerBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="background:#0b1322; padding:12px; border-radius:10px; border-top:3px solid #10b981; border:1px solid rgba(255,255,255,0.08);">
            <strong style="color:#10b981;">🚀 400-Yard Aerial Assault Challenge</strong>
            <p style="color:#94a3b8; font-size:0.75rem; margin-top:4px;">Predict 400+ total passing & rushing yards in a single game.</p>
            <div style="margin-top:6px; font-size:0.72rem; color:#facc15;">Leader: 2026 Preseason Kickoff</div>
          </div>

          <div style="background:#0b1322; padding:12px; border-radius:10px; border-top:3px solid #facc15; border:1px solid rgba(255,255,255,0.08);">
            <strong style="color:#facc15;">🔥 High-Octane 50+ Shootout Challenge</strong>
            <p style="color:#94a3b8; font-size:0.75rem; margin-top:4px;">Pick the highest scoring matchup of the week.</p>
            <div style="margin-top:6px; font-size:0.72rem; color:#facc15;">Leader: 2026 Preseason Kickoff</div>
          </div>

          <div style="background:#0b1322; padding:12px; border-radius:10px; border-top:3px solid #f97316; border:1px solid rgba(255,255,255,0.08);">
            <strong style="color:#fb923c;">💥 Sack Attack Blitz Defense</strong>
            <p style="color:#94a3b8; font-size:0.75rem; margin-top:4px;">Predict which defense tallies 4+ sacks.</p>
            <div style="margin-top:6px; font-size:0.72rem; color:#facc15;">Leader: 2026 Preseason Kickoff</div>
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
