/**
 * Office Endzone - Main Application Entry Point
 */
import { GameState } from './gameState.js';
import { CharacterController } from './characterController.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State and Controller
  const gameState = new GameState();
  const characterController = new CharacterController('stage-container', 'mascot-character');

  // 2. Cache DOM Elements
  const scoreHomeEl = document.getElementById('score-home');
  const scoreAwayEl = document.getElementById('score-away');
  const quarterBadgeEl = document.getElementById('quarter-badge');
  const gameClockEl = document.getElementById('game-clock');
  const downDistanceEl = document.getElementById('down-distance');
  const teamBoxHomeEl = document.getElementById('team-box-home');
  const teamBoxAwayEl = document.getElementById('team-box-away');
  const possessionTagHomeEl = document.getElementById('possession-tag-home');
  const possessionTagAwayEl = document.getElementById('possession-tag-away');
  const eventLogListEl = document.getElementById('event-log-list');
  const mascotAvatarEl = document.getElementById('mascot-avatar');

  // 3. Mock Action Buttons
  const btnTdHome = document.getElementById('btn-td-home');
  const btnTdAway = document.getElementById('btn-td-away');
  const btnTurnover = document.getElementById('btn-turnover');
  const btnFg = document.getElementById('btn-fg');
  const btnSack = document.getElementById('btn-sack');
  const btnReset = document.getElementById('btn-reset');

  // 4. Update UI View based on State
  function renderUI(state) {
    // Scores
    scoreHomeEl.textContent = state.homeScore;
    scoreAwayEl.textContent = state.awayScore;

    // Clock & Quarter
    quarterBadgeEl.textContent = `Q${state.quarter}`;
    gameClockEl.textContent = state.timeRemaining;

    // Down & Distance
    const downSuffix = ['th', 'st', 'nd', 'rd', 'th'][state.down] || 'th';
    const side = state.ballOnYard <= 50 ? 'OWN' : 'OPP';
    const yardDisplay = state.ballOnYard <= 50 ? state.ballOnYard : 100 - state.ballOnYard;
    downDistanceEl.textContent = `${state.down}${downSuffix} & ${state.distance} at ${side} ${yardDisplay}`;

    // Possession Highlights
    if (state.possession === 'HOME') {
      teamBoxHomeEl.classList.add('active-possession');
      teamBoxAwayEl.classList.remove('active-possession');
      possessionTagHomeEl.style.display = 'inline-block';
      possessionTagAwayEl.style.display = 'none';
    } else {
      teamBoxHomeEl.classList.remove('active-possession');
      teamBoxAwayEl.classList.add('active-possession');
      possessionTagHomeEl.style.display = 'none';
      possessionTagAwayEl.style.display = 'inline-block';
    }

    // Play-by-Play Log Feed
    renderEventLogs(state.eventHistory);
  }

  function renderEventLogs(history) {
    if (!eventLogListEl) return;
    eventLogListEl.innerHTML = '';
    
    history.forEach(item => {
      const row = document.createElement('div');
      row.className = `event-item ${item.type}`;

      const textSpan = document.createElement('span');
      textSpan.className = 'event-text';
      textSpan.textContent = item.text;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'event-time';
      timeSpan.textContent = item.timestamp;

      row.appendChild(textSpan);
      row.appendChild(timeSpan);

      eventLogListEl.appendChild(row);
    });
  }

  // 5. Subscribe to GameState Events to trigger Mascot Animations & UI Sync
  gameState.subscribe((event, state) => {
    renderUI(state);

    switch (event.type) {
      case 'TOUCHDOWN_HOME':
        characterController.triggerTouchdownHome();
        break;
      case 'TOUCHDOWN_AWAY':
        characterController.triggerTouchdownAway();
        break;
      case 'TURNOVER':
        characterController.triggerTurnover();
        break;
      case 'FIELD_GOAL':
        characterController.triggerFieldGoal(event.payload.team);
        break;
      case 'SACK':
        characterController.triggerSack(event.payload.yardLoss, event.payload.turnoverOnDowns);
        break;
      case 'STATE_RESET':
        characterController.setMood('', '🏈 Ready for the next snap in the cubicle!');
        break;
      default:
        break;
    }
  });

  // 6. Bind Event Listeners to Mock Buttons
  btnTdHome.addEventListener('click', () => gameState.touchdownHome());
  btnTdAway.addEventListener('click', () => gameState.touchdownAway());
  btnTurnover.addEventListener('click', () => gameState.turnover());
  btnFg.addEventListener('click', () => gameState.fieldGoal());
  btnSack.addEventListener('click', () => gameState.sack());
  btnReset.addEventListener('click', () => gameState.reset());

  // Mascot Click Interaction
  if (mascotAvatarEl) {
    mascotAvatarEl.addEventListener('click', () => {
      characterController.spawnConfetti();
      characterController.setMood('anim-spike', '🥳 Let\'s go Team Office!');
    });
  }

  // Initial Render
  renderUI(gameState.getState());
});
