/**
 * FaktenCheck Game - Social Media Inspired Version
 * Inspired by Harmony Square & VoteGuard
 */

class FaktenCheckGame {
    constructor() {
        this.app = document.getElementById('app');
        this.stories = [];
        this.currentIndex = 0;
        this.score = 0;
        this.followers = 0;
        this.networkVibe = 100;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.answered = false;
        this.earnedBadges = [];
        this.currentLevel = 1;
        
        this.levels = [
            { id: 1, name: 'Anfänger', icon: '🌱', minStories: 0, maxStories: 3 },
            { id: 2, name: 'Fortgeschritten', icon: '📰', minStories: 3, maxStories: 6 },
            { id: 3, name: 'Experte', icon: '🎯', minStories: 6, maxStories: 8 },
            { id: 4, name: 'Profi', icon: '🛡️', minStories: 8, maxStories: 10 }
        ];
        
        this.badges = [
            { id: 'first_correct', name: 'Erster Treffer', icon: '🎯', desc: 'Erste richtige Antwort', condition: () => this.correctAnswers >= 1 },
            { id: 'streak_3', name: 'Auf Kurs', icon: '🔥', desc: '3er Streak erreicht', condition: () => this.maxStreak >= 3 },
            { id: 'streak_5', name: 'Unaufhaltbar', icon: '⚡', desc: '5er Streak erreicht', condition: () => this.maxStreak >= 5 },
            { id: 'half_correct', name: 'Halbzeit', icon: '📊', desc: 'Hälfte richtig', condition: () => this.correctAnswers >= Math.ceil(this.stories.length / 2) },
            { id: 'vibe_master', name: 'Vibe Master', icon: '✨', desc: 'Vibe über 80%', condition: () => this.networkVibe >= 80 && this.currentIndex >= 5 },
            { id: 'influencer', name: 'Influencer', icon: '👥', desc: '500+ Follower', condition: () => this.followers >= 500 },
            { id: 'perfect', name: 'Perfektionist', icon: '💎', desc: 'Alles richtig', condition: () => this.correctAnswers === this.stories.length && this.currentIndex >= this.stories.length - 1 },
            { id: 'all_done', name: 'Durchhalter', icon: '🏁', desc: 'Spiel beendet', condition: () => this.currentIndex >= this.stories.length - 1 && this.answered }
        ];
        
        this.loadStories();
    }
    
    loadStories() {
        // First try localStorage (admin-managed stories)
        const savedStories = localStorage.getItem('faktencheck_stories');
        if (savedStories) {
            const parsed = JSON.parse(savedStories);
            // Only use active stories
            this.stories = shuffleArray(parsed.filter(s => s.active !== false));
        } else {
            // Fallback to default STORIES from stories.js
            this.stories = shuffleArray(STORIES);
        }
        
        this.showStartScreen();
    }
    
    saveResult() {
        const result = {
            timestamp: new Date().toISOString(),
            score: this.score,
            correct: this.correctAnswers,
            incorrect: this.incorrectAnswers,
            total: this.stories.length,
            maxStreak: this.maxStreak,
            badges: this.earnedBadges.length,
            followers: this.followers,
            vibe: this.networkVibe
        };
        
        const results = JSON.parse(localStorage.getItem('faktencheck_results') || '[]');
        results.push(result);
        localStorage.setItem('faktencheck_results', JSON.stringify(results));
    }
    
    showStartScreen() {
        this.app.innerHTML = `
            <div class="start-screen">
                <a href="admin/" class="admin-link" title="Admin-Bereich">⚙️</a>
                
                <div class="start-logo">🛡️</div>
                <h1 class="start-title">FaktenCheck</h1>
                <p class="start-subtitle">Erkenne Manipulation wie ein Profi</p>
                
                <p class="start-description">
                    Trainiere dein Auge für Desinformation. Lerne die Tricks zu erkennen, 
                    die Trolle und Fake-News-Verbreiter nutzen.
                </p>
                
                <div class="feature-cards">
                    <div class="feature-card">
                        <div class="feature-icon">📰</div>
                        <div class="feature-title">${this.stories.length} Posts</div>
                        <div class="feature-desc">Echte vs. Fake News</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🎖️</div>
                        <div class="feature-title">${this.badges.length} Badges</div>
                        <div class="feature-desc">Zum Freischalten</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <div class="feature-title">4 Level</div>
                        <div class="feature-desc">Steigender Schwierigkeit</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⏱️</div>
                        <div class="feature-title">~5 Min</div>
                        <div class="feature-desc">Spielzeit</div>
                    </div>
                </div>
                
                <button class="btn btn-primary" id="start-btn">
                    🚀 Spiel starten
                </button>
            </div>
        `;
        
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    }
    
    startGame() {
        // Reload stories in case they were updated in admin
        const savedStories = localStorage.getItem('faktencheck_stories');
        if (savedStories) {
            const parsed = JSON.parse(savedStories);
            this.stories = shuffleArray(parsed.filter(s => s.active !== false));
        } else {
            this.stories = shuffleArray(STORIES);
        }
        
        this.currentIndex = 0;
        this.score = 0;
        this.followers = 100;
        this.networkVibe = 100;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.earnedBadges = [];
        this.currentLevel = 1;
        this.showStory();
    }
    
    getCurrentLevel() {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (this.currentIndex >= this.levels[i].minStories) {
                return this.levels[i];
            }
        }
        return this.levels[0];
    }
    
    showStory() {
        const story = this.stories[this.currentIndex];
        this.answered = false;
        const level = this.getCurrentLevel();
        const progress = ((this.currentIndex) / this.stories.length) * 100;
        
        const sourceIcons = {
            'Tagesschau': '📺',
            'ZDF heute': '📺',
            'Süddeutsche Zeitung': '📰',
            'Handelsblatt': '📊',
            'Reuters': '🌐',
            'default': '🔗'
        };
        const sourceIcon = sourceIcons[story.source] || sourceIcons['default'];
        
        const engagementLikes = Math.floor(Math.random() * 5000) + 500;
        const engagementShares = Math.floor(Math.random() * 1000) + 100;
        const engagementComments = Math.floor(Math.random() * 500) + 50;
        
        this.app.innerHTML = `
            <div class="game-screen">
                <!-- Header -->
                <div class="header-bar">
                    <div class="header-logo">
                        <span class="header-logo-icon">🛡️</span>
                        <span class="header-logo-text">FaktenCheck</span>
                    </div>
                    <div class="header-level">
                        ${level.icon} Level ${level.id}
                    </div>
                </div>
                
                <!-- Stats Bar -->
                <div class="stats-bar">
                    <div class="stat-box followers">
                        <div class="stat-box-icon">👥</div>
                        <div class="stat-box-value">${this.followers}</div>
                        <div class="stat-box-label">Follower</div>
                    </div>
                    <div class="stat-box vibe">
                        <div class="stat-box-icon">📊</div>
                        <div class="stat-box-value">${this.networkVibe}%</div>
                        <div class="stat-box-label">Vibe</div>
                        <div class="vibe-meter">
                            <div class="vibe-fill" style="width: ${this.networkVibe}%"></div>
                        </div>
                    </div>
                    <div class="stat-box badges">
                        <div class="stat-box-icon">🏅</div>
                        <div class="stat-box-value">${this.earnedBadges.length}</div>
                        <div class="stat-box-label">Badges</div>
                    </div>
                </div>
                
                <!-- Progress -->
                <div class="progress-section">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-label">
                        <span>Post ${this.currentIndex + 1} von ${this.stories.length}</span>
                        <span>⭐ ${this.score} Punkte</span>
                    </div>
                </div>
                
                <!-- Level Indicator -->
                <div class="level-indicator">
                    <span class="level-badge">${level.icon} LVL ${level.id}</span>
                    <span class="level-name">${level.name}</span>
                    <span class="level-progress">${this.streak > 0 ? `🔥 ${this.streak}x` : ''}</span>
                </div>
                
                <!-- Post Card -->
                <div class="post-card">
                    <div class="post-header">
                        <div class="post-avatar">${sourceIcon}</div>
                        <div class="post-meta">
                            <div class="post-source">${story.source}</div>
                            <div class="post-time">vor ${Math.floor(Math.random() * 12) + 1} Stunden</div>
                        </div>
                        ${story.isTrue ? '<span class="post-verified" title="Verifiziert">✓</span>' : ''}
                    </div>
                    
                    <div class="post-body">
                        <h2 class="post-headline">${story.headline}</h2>
                        <p class="post-content">${story.content}</p>
                    </div>
                    
                    <div class="post-image">🏛️</div>
                    
                    <div class="post-engagement">
                        <span>❤️ ${engagementLikes.toLocaleString()}</span>
                        <span>🔁 ${engagementShares.toLocaleString()}</span>
                        <span>💬 ${engagementComments.toLocaleString()}</span>
                    </div>
                </div>
                
                <!-- Answer Section -->
                <div class="answer-section">
                    <div class="answer-prompt">Ist dieser Post vertrauenswürdig?</div>
                    <div class="answer-buttons">
                        <button class="answer-btn true" data-answer="true">
                            <span class="answer-btn-icon">✅</span>
                            <span>Vertrauenswürdig</span>
                        </button>
                        <button class="answer-btn false" data-answer="false">
                            <span class="answer-btn-icon">🚫</span>
                            <span>Manipulation</span>
                        </button>
                    </div>
                </div>
                
                <div id="explanation-container"></div>
            </div>
        `;
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e));
        });
    }
    
    handleAnswer(e) {
        if (this.answered) return;
        this.answered = true;
        
        const story = this.stories[this.currentIndex];
        const userAnswer = e.currentTarget.dataset.answer === 'true';
        const isCorrect = userAnswer === story.isTrue;
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        e.currentTarget.classList.add('selected', isCorrect ? 'correct' : 'incorrect');
        
        if (!isCorrect) {
            document.querySelector(`.answer-btn[data-answer="${story.isTrue}"]`).classList.add('reveal', 'correct');
        }
        
        this.showFeedbackPopup(isCorrect);
        
        let pointsEarned = 0;
        let followerChange = 0;
        let vibeChange = 0;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.streak++;
            if (this.streak > this.maxStreak) {
                this.maxStreak = this.streak;
            }
            
            pointsEarned = 100 + (this.streak > 1 ? (this.streak - 1) * 25 : 0);
            this.score += pointsEarned;
            
            followerChange = 50 + (this.streak * 10);
            this.followers += followerChange;
            
            vibeChange = 5;
            this.networkVibe = Math.min(100, this.networkVibe + vibeChange);
        } else {
            this.incorrectAnswers++;
            this.streak = 0;
            
            followerChange = -30;
            this.followers = Math.max(0, this.followers + followerChange);
            
            vibeChange = -15;
            this.networkVibe = Math.max(0, this.networkVibe + vibeChange);
        }
        
        this.updateStatsDisplay(isCorrect, followerChange, vibeChange);
        
        const newBadges = this.checkBadges();
        
        this.showExplanation(story, isCorrect, pointsEarned, newBadges);
    }
    
    updateStatsDisplay(isCorrect, followerChange, vibeChange) {
        const followerEl = document.querySelector('.stat-box.followers .stat-box-value');
        const vibeEl = document.querySelector('.stat-box.vibe .stat-box-value');
        const vibeFill = document.querySelector('.vibe-fill');
        
        if (followerEl) {
            followerEl.textContent = this.followers;
            followerEl.style.color = followerChange > 0 ? 'var(--success)' : 'var(--danger)';
            setTimeout(() => {
                followerEl.style.color = '';
            }, 1000);
        }
        
        if (vibeEl) {
            vibeEl.textContent = `${this.networkVibe}%`;
        }
        
        if (vibeFill) {
            vibeFill.style.width = `${this.networkVibe}%`;
            vibeFill.style.background = this.networkVibe > 50 
                ? 'var(--gradient-success)' 
                : 'var(--gradient-danger)';
        }
    }
    
    showFeedbackPopup(isCorrect) {
        const emoji = isCorrect ? '✅' : '❌';
        const popup = document.createElement('div');
        popup.className = 'feedback-popup';
        popup.textContent = emoji;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 800);
    }
    
    showNotification(type, icon, title, text) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-text">${text}</div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    checkBadges() {
        const newBadges = [];
        
        this.badges.forEach(badge => {
            if (!this.earnedBadges.includes(badge.id) && badge.condition()) {
                this.earnedBadges.push(badge.id);
                newBadges.push(badge);
            }
        });
        
        newBadges.forEach((badge, index) => {
            setTimeout(() => {
                this.showNotification('badge', badge.icon, 'Badge freigeschaltet!', badge.name);
            }, index * 500);
        });
        
        const badgeCountEl = document.querySelector('.stat-box.badges .stat-box-value');
        if (badgeCountEl) {
            badgeCountEl.textContent = this.earnedBadges.length;
        }
        
        return newBadges;
    }
    
    showExplanation(story, isCorrect, pointsEarned, newBadges) {
        const explanationTitle = isCorrect ? 'Richtig erkannt!' : 'Leider falsch';
        const titleClass = isCorrect ? 'correct' : 'incorrect';
        const verdict = story.isTrue 
            ? '✅ Diese Nachricht ist <strong>vertrauenswürdig</strong>.' 
            : '🚫 Diese Nachricht enthält <strong>Manipulation</strong>.';
        
        const isLast = this.currentIndex >= this.stories.length - 1;
        const nextButtonText = isLast ? '🏆 Ergebnis anzeigen' : 'Nächster Post →';
        
        const tricksHtml = story.tricks && story.tricks.length > 0 ? `
            <div class="tricks-section">
                <div class="tricks-label">⚠️ Erkannte Manipulationstricks:</div>
                <div class="tricks-list">
                    ${story.tricks.map(t => `<span class="trick-tag">🎭 ${t}</span>`).join('')}
                </div>
            </div>
        ` : '';
        
        const badgeHtml = newBadges.map(badge => `
            <div class="badge-unlock">
                <div class="badge-unlock-icon">${badge.icon}</div>
                <div class="badge-unlock-label">🎉 Badge freigeschaltet!</div>
                <div class="badge-unlock-name">${badge.name}</div>
            </div>
        `).join('');
        
        document.getElementById('explanation-container').innerHTML = `
            <div class="explanation">
                <div class="explanation-header">
                    <span class="explanation-icon">${isCorrect ? '✅' : '❌'}</span>
                    <h3 class="explanation-title ${titleClass}">${explanationTitle}</h3>
                    ${pointsEarned > 0 ? `<span class="points-badge">+${pointsEarned}</span>` : ''}
                </div>
                
                <div class="explanation-verdict">${verdict}</div>
                
                ${tricksHtml}
                
                <p class="explanation-text">${story.explanation}</p>
                
                ${badgeHtml}
                
                <button class="btn btn-primary" id="next-btn">
                    ${nextButtonText}
                </button>
            </div>
        `;
        
        document.getElementById('next-btn').addEventListener('click', () => {
            if (isLast) {
                this.showResults();
            } else {
                this.currentIndex++;
                this.showStory();
            }
        });
    }
    
    showResults() {
        this.checkBadges();
        
        // Save result to localStorage
        this.saveResult();
        
        const percentage = Math.round((this.correctAnswers / this.stories.length) * 100);
        
        let resultIcon, resultTitle, resultMessage;
        
        if (percentage >= 90) {
            resultIcon = '🏆';
            resultTitle = 'Medien-Profi!';
            resultMessage = 'Hervorragend! Du durchschaust fast jede Manipulation. Du bist bestens gewappnet gegen Desinformation. Teile dein Wissen mit anderen!';
        } else if (percentage >= 70) {
            resultIcon = '🎯';
            resultTitle = 'Sehr gut!';
            resultMessage = 'Du hast ein geschultes Auge für Fake News. Die meisten Tricks erkennst du sofort. Bleib wachsam!';
        } else if (percentage >= 50) {
            resultIcon = '📚';
            resultTitle = 'Gut gemacht!';
            resultMessage = 'Du bist auf dem richtigen Weg. Achte besonders auf emotionale Sprache, anonyme Quellen und reißerische Überschriften.';
        } else {
            resultIcon = '💪';
            resultTitle = 'Übung macht den Meister!';
            resultMessage = 'Keine Sorge, Medienkompetenz kann man lernen! Tipp: Überprüfe immer mehrere Quellen und sei skeptisch bei extremen Behauptungen.';
        }
        
        const badgesHtml = this.badges.map(badge => {
            const earned = this.earnedBadges.includes(badge.id);
            return `
                <div class="badge-item ${earned ? 'earned' : 'locked'}" title="${badge.desc}">
                    <div class="badge-item-icon">${badge.icon}</div>
                    <div class="badge-item-name">${badge.name}</div>
                </div>
            `;
        }).join('');
        
        this.app.innerHTML = `
            <div class="results-screen">
                <a href="admin/" class="admin-link" title="Admin-Bereich">⚙️</a>
                
                <div class="results-header">
                    <div class="results-icon">${resultIcon}</div>
                    <h1 class="results-title">${resultTitle}</h1>
                    <p class="results-subtitle">Du hast das Training abgeschlossen!</p>
                </div>
                
                <div class="score-card">
                    <div class="score-main">
                        <div class="score-number">${this.score}</div>
                        <div class="score-label">Punkte erreicht</div>
                    </div>
                    
                    <div class="score-stats">
                        <div class="score-stat">
                            <div class="score-stat-value success">${this.correctAnswers}</div>
                            <div class="score-stat-label">Richtig</div>
                        </div>
                        <div class="score-stat">
                            <div class="score-stat-value danger">${this.incorrectAnswers}</div>
                            <div class="score-stat-label">Falsch</div>
                        </div>
                        <div class="score-stat">
                            <div class="score-stat-value accent">${this.followers}</div>
                            <div class="score-stat-label">Follower</div>
                        </div>
                    </div>
                </div>
                
                <div class="badges-section">
                    <h3 class="badges-title">🎖️ Deine Badges (${this.earnedBadges.length}/${this.badges.length})</h3>
                    <div class="badges-grid">
                        ${badgesHtml}
                    </div>
                </div>
                
                <div class="results-message">
                    ${resultMessage}
                </div>
                
                <div class="results-buttons">
                    <button class="btn btn-primary" id="restart-btn">
                        🔄 Nochmal spielen
                    </button>
                    <button class="btn btn-secondary" id="share-btn">
                        📤 Ergebnis teilen
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        
        document.getElementById('share-btn').addEventListener('click', () => {
            const shareText = `Ich habe ${this.score} Punkte beim FaktenCheck erreicht und ${this.earnedBadges.length}/${this.badges.length} Badges freigeschaltet! Kannst du Fake News erkennen? 🛡️`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'FaktenCheck - Mein Ergebnis',
                    text: shareText,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(shareText + ' ' + window.location.href).then(() => {
                    this.showNotification('success', '📋', 'Kopiert!', 'Link in Zwischenablage');
                });
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FaktenCheckGame();
});
