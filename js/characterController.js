/**
 * characterController.js - Office Endzone Avatar & Reaction Engine
 * Manages photo avatars, stadium reactions, celebratory FX, and office banter.
 */

export class CharacterController {
  constructor(options = {}) {
    this.stage = document.getElementById(options.stageId || 'stage-container');
    this.characterEl = document.getElementById(options.characterId || 'mascot-character');
    this.avatarContainer = document.getElementById(options.avatarId || 'mascot-avatar');
    this.dialogBubble = document.getElementById(options.dialogId || 'character-dialog');
    this.nameBadge = document.getElementById(options.nameBadgeId || 'character-name-badge');
    this.roleBadge = document.getElementById(options.roleBadgeId || 'character-role-badge');
    this.banner = document.getElementById(options.bannerId || 'event-banner');
    this.soundWaveEl = document.getElementById('sound-wave-indicator');

    this.roster = [];
    this.activeCharacter = null;
    this.idleTimer = null;
  }

  setRoster(roster) {
    this.roster = roster || [];
    if (this.roster.length > 0) {
      this.selectCharacter(this.roster[0].id);
    }
  }

  selectCharacter(charId) {
    this.activeCharacter = this.roster.find(c => c.id === charId) || this.roster[0];
    if (this.activeCharacter) {
      this.renderAvatar();
      if (this.nameBadge) {
        this.nameBadge.textContent = this.activeCharacter.name;
      }
      if (this.roleBadge) {
        this.roleBadge.textContent = `${this.activeCharacter.role} • ${this.activeCharacter.dept}`;
      }
      this.speak('IDLE');
    }
  }

  renderAvatar() {
    if (!this.avatarContainer || !this.activeCharacter) return;

    const imgSrc = this.activeCharacter.image;
    const charName = this.activeCharacter.name;

    this.avatarContainer.innerHTML = `
      <div class="avatar-photo-wrapper">
        <img 
          src="${imgSrc}" 
          alt="${charName}" 
          class="avatar-photo-img" 
          onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'avatar-fallback-initials\\'>${charName.charAt(0)}</div>';"
        />
        <div class="avatar-glow-ring"></div>
        <div class="avatar-status-badge">⚡ LIVE</div>
      </div>
    `;
  }

  getRandomLine(category) {
    if (!this.activeCharacter || !this.activeCharacter.reactions) {
      return '🏈 Focus on the playbook! Let\'s execute the game plan!';
    }
    const lines = this.activeCharacter.reactions[category] || this.activeCharacter.reactions['IDLE'] || [];
    if (lines.length === 0) {
      return '🏈 Focus on the playbook! Let\'s execute the game plan!';
    }
    return lines[Math.floor(Math.random() * lines.length)];
  }

  speak(category, customText = null) {
    const line = customText || this.getRandomLine(category);
    if (this.dialogBubble) {
      this.dialogBubble.textContent = line;
      this.dialogBubble.classList.remove('bubble-pop');
      void this.dialogBubble.offsetWidth;
      this.dialogBubble.classList.add('bubble-pop');
    }

    if (this.soundWaveEl) {
      this.soundWaveEl.classList.add('active-wave');
      setTimeout(() => this.soundWaveEl.classList.remove('active-wave'), 2000);
    }
  }

  setAnimation(animationClass) {
    if (!this.characterEl) return;
    this.characterEl.classList.remove('anim-spike', 'anim-despair', 'anim-kick', 'anim-sack', 'anim-away-td');
    if (animationClass) {
      this.characterEl.classList.add(animationClass);
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
    }, 2800);
  }

  triggerTouchdownHome(teamName = 'HOME TEAM') {
    this.setAnimation('anim-spike');
    this.speak('TOUCHDOWN_HOME');
    this.showEventBanner('TOUCHDOWN! 🏈', `+6 POINTS FOR ${teamName.toUpperCase()}!`, 'banner-home');
    this.spawnConfetti();
    this.flashStadium('#10b981');
  }

  triggerTouchdownAway(teamName = 'AWAY TEAM') {
    this.setAnimation('anim-away-td');
    this.speak('TOUCHDOWN_AWAY');
    this.showEventBanner('AWAY TOUCHDOWN! 🚨', `${teamName.toUpperCase()} SCORES 6 POINTS!`, 'banner-away');
    this.flashStadium('#3b82f6');
  }

  triggerTurnover(teamName = 'DEFENSE') {
    this.setAnimation('anim-despair');
    this.speak('TURNOVER');
    this.showEventBanner('TURNOVER! ⚠️', `TURNOVER FORCED BY ${teamName.toUpperCase()}!`, 'banner-turnover');
    this.shakeStage();
    this.flashStadium('#ef4444');
  }

  triggerFieldGoal(teamName = 'SQUAD', distance = 45) {
    this.setAnimation('anim-kick');
    this.speak('FIELD_GOAL');
    this.showEventBanner('FIELD GOAL GOOD! 🎯', `${teamName.toUpperCase()} DRILLS A ${distance}-YD KICK (+3 PTS)`, 'banner-fg');
    this.flashStadium('#f59e0b');
  }

  triggerSack(yardLoss = 8, teamName = 'DEFENSE') {
    this.setAnimation('anim-sack');
    this.speak('SACK');
    this.showEventBanner('QB SACKED! 💥', `${teamName.toUpperCase()} BLITZ TAKES DOWN QB FOR -${yardLoss} YDS!`, 'banner-sack');
    this.shakeStage();
    this.flashStadium('#8b5cf6');
  }

  shakeStage() {
    if (!this.stage) return;
    this.stage.classList.remove('screen-shake');
    void this.stage.offsetWidth;
    this.stage.classList.add('screen-shake');
  }

  flashStadium(colorHex) {
    if (!this.stage) return;
    const flashEl = document.createElement('div');
    flashEl.className = 'stadium-flash-overlay';
    flashEl.style.backgroundColor = colorHex;
    this.stage.appendChild(flashEl);
    setTimeout(() => flashEl.remove(), 600);
  }

  spawnConfetti() {
    if (!this.stage) return;
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#fbbf24', '#ffffff'];
    
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      particle.style.left = `${Math.random() * 92 + 4}%`;
      particle.style.top = `${Math.random() * 40 + 10}%`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      particle.style.animationDuration = `${Math.random() * 1.5 + 1.2}s`;
      particle.style.animationDelay = `${Math.random() * 0.2}s`;
      
      this.stage.appendChild(particle);
      setTimeout(() => particle.remove(), 2800);
    }
  }
}
