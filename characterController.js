/**
 * CharacterController - Handles visual mascot/character animations, reactions, and celebration FX
 */
export class CharacterController {
  constructor(stageContainerId, characterElementId) {
    this.stage = document.getElementById(stageContainerId);
    this.character = document.getElementById(characterElementId);
    this.statusBadge = document.getElementById('character-status');
    this.banner = document.getElementById('event-banner');
    this.init();
  }

  init() {
    this.setMood('ready', '🏈 Ready for the next snap in the cubicle!');
  }

  setMood(animationClass, statusText) {
    if (!this.character) return;
    
    // Clear previous dynamic animations
    this.character.classList.remove('anim-spike', 'anim-despair', 'anim-kick', 'anim-sack', 'anim-away-td');
    
    if (animationClass) {
      this.character.classList.add(animationClass);
    }

    if (this.statusBadge && statusText) {
      this.statusBadge.textContent = statusText;
    }
  }

  showEventBanner(title, subtitle, typeClass) {
    if (!this.banner) return;
    
    this.banner.className = `event-banner show ${typeClass}`;
    this.banner.innerHTML = `
      <div class="banner-title">${title}</div>
      <div class="banner-sub">${subtitle}</div>
    `;

    setTimeout(() => {
      this.banner.classList.remove('show');
    }, 2400);
  }

  triggerTouchdownHome() {
    this.setMood('anim-spike', '🎉 TOUCHDOWN! Coffee mug spike celebration!');
    this.showEventBanner('TOUCHDOWN!', '+6 POINTS FOR THE HOME SQUAD!', 'banner-home');
    this.spawnConfetti();
  }

  triggerTouchdownAway() {
    this.setMood('anim-away-td', '😰 Away TD! Cubicle fans in shock!');
    this.showEventBanner('AWAY TOUCHDOWN', 'DEFENSE BROKEN DOWN!', 'banner-away');
  }

  triggerTurnover() {
    this.setMood('anim-despair', '😱 TURNOVER! Ball lost on the field!');
    this.showEventBanner('TURNOVER!', 'CHANGE OF POSSESSION!', 'banner-turnover');
    this.shakeStage();
  }

  triggerFieldGoal(team) {
    this.setMood('anim-kick', `🎯 FIELD GOAL! ${team} puts 3 on the board!`);
    this.showEventBanner('FIELD GOAL!', `${team} SCORES 3 POINTS!`, 'banner-fg');
  }

  triggerSack(yardLoss, turnoverOnDowns) {
    this.setMood('anim-sack', `💥 SACKED! Lost ${yardLoss} yards!`);
    const sub = turnoverOnDowns ? `TURNOVER ON DOWNS! (-${yardLoss} YDS)` : `DOWN TAKEN DOWN! (-${yardLoss} YDS)`;
    this.showEventBanner('QB SACKED!', sub, 'banner-sack');
    this.shakeStage();
  }

  shakeStage() {
    if (!this.stage) return;
    this.stage.classList.remove('screen-shake');
    void this.stage.offsetWidth; // Force reflow
    this.stage.classList.add('screen-shake');
  }

  spawnConfetti() {
    if (!this.stage) return;
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7', '#fbbf24'];
    
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      particle.style.left = `${Math.random() * 90 + 5}%`;
      particle.style.top = `${Math.random() * 40 + 20}%`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      particle.style.animationDuration = `${Math.random() * 1.5 + 1}s`;
      particle.style.animationDelay = `${Math.random() * 0.2}s`;
      
      this.stage.appendChild(particle);
      setTimeout(() => particle.remove(), 2500);
    }
  }
}
