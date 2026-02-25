/**
 * FaktenCheck Game - Standalone Version for Vercel
 */

class FaktenCheckGame {
    constructor() {
        this.app = document.getElementById('app');
        this.stories = shuffleArray(STORIES);
        this.currentIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.answered = false;
        this.earnedBadges = [];
        
        this.badges = [
            { id: 'first_correct', name: 'Erster Treffer', icon: '🎯', condition: () => this.correctAnswers >= 1 },
            { id: 'streak_3', name: 'Auf Kurs', icon: '🔥', condition: () => this.maxStreak >= 3 },
            { id: 'streak_5', name: 'Unaufhaltbar', icon: '⚡', condition: () => this.maxStreak >= 5 },
            { id: 'perfect', name: 'Perfektionist', icon: '💎', condition: () => this.correctAnswers === this.stories.length },
            { id: 'half_correct', name: 'Fortgeschritten', icon: '📚', condition: () => this.correctAnswers >= Math.ceil(this.stories.length / 2) },
            { id: 'all_done', name: 'Durchhalter', icon: '🏁', condition: () => this.currentIndex >= this.stories.length - 1 && this.answered },
            { id: 'high_score', name: 'Top Score', icon: '🏆', condition: () => this.score >= 800 },
            { id: 'expert', name: 'Experte', icon: '🎓', condition: () => (this.correctAnswers / this.stories.length) >= 0.8 },
        ];
        
        this.showStartScreen();
    }
    
    showStartScreen() {
        this.app.innerHTML = `
            <div class="start-screen">
                <div class="logo">🏛️</div>
                <h1 class="title">FaktenCheck</h1>
                <p class="subtitle">Erkenne politische Manipulation</p>
                <p class="description">
                    Politiker, Medien und soziale Netzwerke verbreiten täglich Informationen. 
                    Aber was ist wahr und was ist Manipulation? Teste dein Wissen mit ${this.stories.length} 
                    politischen Nachrichten und lerne, Desinformation zu erkennen.
                </p>
                
                <div class="stats-preview">
                    <div class="stat-preview">
                        <div class="stat-preview-icon">📰</div>
                        <div class="stat-preview-value">${this.stories.length}</div>
                        <div class="stat-preview-label">Nachrichten</div>
                    </div>
                    <div class="stat-preview">
                        <div class="stat-preview-icon">🏆</div>
                        <div class="stat-preview-value">${this.badges.length}</div>
                        <div class="stat-preview-label">Badges</div>
                    </div>
                    <div class="stat-preview">
                        <div class="stat-preview-icon">⏱️</div>
                        <div class="stat-preview-value">~5</div>
                        <div class="stat-preview-label">Minuten</div>
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
        this.stories = shuffleArray(STORIES);
        this.currentIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.earnedBadges = [];
        this.showStory();
    }
    
    showStory() {
        const story = this.stories[this.currentIndex];
        this.answered = false;
        
        const streakClass = this.streak >= 2 ? '' : 'inactive';
        const streakText = this.streak >= 2 ? `${this.streak}x Streak` : 'Streak';
        const progress = ((this.currentIndex) / this.stories.length) * 100;
        
        this.app.innerHTML = `
            <div class="game-screen">
                <div class="game-header">
                    <div class="progress-section">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">Frage ${this.currentIndex + 1} von ${this.stories.length}</span>
                    </div>
                    <div class="game-stats">
                        <span class="streak-display ${streakClass}">🔥 ${streakText}</span>
                        <span class="score-display">⭐ ${this.score}</span>
                    </div>
                </div>
                
                <div class="story-card">
                    <div class="story-image">🏛️</div>
                    <div class="story-content">
                        <div class="story-meta">
                            <span class="story-source">📰 ${story.source}</span>
                            <span class="story-category">🏛️ Politik</span>
                        </div>
                        <h2 class="story-headline">${story.headline}</h2>
                        <p class="story-text">${story.content}</p>
                    </div>
                </div>
                
                <div class="answer-buttons">
                    <button class="answer-btn true" data-answer="true">
                        ✓ Das ist wahr
                    </button>
                    <button class="answer-btn false" data-answer="false">
                        ✗ Das ist falsch
                    </button>
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
        
        // Disable buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Show result on buttons
        e.currentTarget.classList.add('selected', isCorrect ? 'correct' : 'incorrect');
        
        if (!isCorrect) {
            document.querySelector(`.answer-btn[data-answer="${story.isTrue}"]`).classList.add('reveal', 'correct');
        }
        
        // Show feedback popup
        this.showFeedbackPopup(isCorrect);
        
        // Calculate points
        let pointsEarned = 0;
        if (isCorrect) {
            this.correctAnswers++;
            this.streak++;
            if (this.streak > this.maxStreak) {
                this.maxStreak = this.streak;
            }
            
            pointsEarned = 100 + (this.streak > 1 ? (this.streak - 1) * 25 : 0);
            this.score += pointsEarned;
            
            document.querySelector('.score-display').textContent = `⭐ ${this.score}`;
            const streakEl = document.querySelector('.streak-display');
            streakEl.classList.remove('inactive');
            streakEl.textContent = `🔥 ${this.streak}x Streak`;
        } else {
            this.incorrectAnswers++;
            this.streak = 0;
            const streakEl = document.querySelector('.streak-display');
            streakEl.classList.add('inactive');
            streakEl.textContent = '🔥 Streak';
        }
        
        // Check for new badges
        const newBadges = this.checkBadges();
        
        // Show explanation
        this.showExplanation(story, isCorrect, pointsEarned, newBadges);
    }
    
    showFeedbackPopup(isCorrect) {
        const emoji = isCorrect ? '✅' : '❌';
        const popup = document.createElement('div');
        popup.className = 'feedback-popup';
        popup.textContent = emoji;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 800);
    }
    
    checkBadges() {
        const newBadges = [];
        
        this.badges.forEach(badge => {
            if (!this.earnedBadges.includes(badge.id) && badge.condition()) {
                this.earnedBadges.push(badge.id);
                newBadges.push(badge);
            }
        });
        
        return newBadges;
    }
    
    showExplanation(story, isCorrect, pointsEarned, newBadges) {
        const explanationIcon = isCorrect ? '✅' : '❌';
        const explanationTitle = isCorrect ? 'Richtig!' : 'Leider falsch';
        const truthText = story.isTrue 
            ? 'Diese Nachricht ist <strong>wahr</strong>.' 
            : 'Diese Nachricht ist <strong>falsch oder irreführend</strong>.';
        
        const isLast = this.currentIndex >= this.stories.length - 1;
        const nextButtonText = isLast ? '🏆 Ergebnis anzeigen' : 'Weiter →';
        
        const pointsHtml = isCorrect && pointsEarned > 0 
            ? `<span class="points-earned">+${pointsEarned} Punkte</span>` 
            : '';
        
        // Trick badges HTML
        const tricksHtml = story.tricks && story.tricks.length > 0 
            ? `<div class="trick-badges">${story.tricks.map(t => `<span class="trick-badge">⚠️ ${t}</span>`).join('')}</div>` 
            : '';
        
        // Badge unlock HTML
        const badgeHtml = newBadges.map(badge => `
            <div class="badge-unlock">
                <div class="badge-unlock-icon">${badge.icon}</div>
                <div class="badge-unlock-title">🎉 Badge freigeschaltet!</div>
                <div class="badge-unlock-name">${badge.name}</div>
            </div>
        `).join('');
        
        document.getElementById('explanation-container').innerHTML = `
            <div class="explanation">
                <div class="explanation-header">
                    <span class="explanation-icon">${explanationIcon}</span>
                    <h3 class="explanation-title">${explanationTitle}</h3>
                    ${pointsHtml}
                </div>
                ${tricksHtml}
                <p class="explanation-text">
                    ${truthText}<br><br>
                    ${story.explanation}
                </p>
                ${badgeHtml}
                <button class="btn btn-primary next-btn" id="next-btn">
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
        // Final badge check
        this.checkBadges();
        
        const percentage = Math.round((this.correctAnswers / this.stories.length) * 100);
        
        let resultIcon, resultTitle, resultMessage;
        
        if (percentage >= 90) {
            resultIcon = '🏆';
            resultTitle = 'Herausragend!';
            resultMessage = 'Du durchschaust politische Manipulation wie ein Profi! Du erkennst fast alle Tricks und lässt dich nicht täuschen. Teile dein Wissen mit anderen!';
        } else if (percentage >= 70) {
            resultIcon = '🎯';
            resultTitle = 'Sehr gut!';
            resultMessage = 'Du hast ein geschultes Auge für Desinformation. Die meisten manipulativen Nachrichten erkennst du sofort. Weiter so!';
        } else if (percentage >= 50) {
            resultIcon = '📚';
            resultTitle = 'Gut gemacht!';
            resultMessage = 'Du bist auf dem richtigen Weg. Achte besonders auf emotionale Sprache, fehlende Quellen und reißerische Überschriften.';
        } else {
            resultIcon = '💪';
            resultTitle = 'Übung macht den Meister!';
            resultMessage = 'Keine Sorge, Medienkompetenz kann man lernen! Tipp: Überprüfe immer mehrere Quellen und sei skeptisch bei extremen Behauptungen.';
        }
        
        // Generate badges HTML
        const badgesHtml = this.badges.map(badge => {
            const earned = this.earnedBadges.includes(badge.id);
            return `
                <div class="badge ${earned ? 'earned' : 'locked'}">
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-name">${badge.name}</div>
                </div>
            `;
        }).join('');
        
        this.app.innerHTML = `
            <div class="results-screen">
                <div class="results-icon">${resultIcon}</div>
                <h1 class="results-title">${resultTitle}</h1>
                <p class="results-subtitle">Du hast das Quiz abgeschlossen!</p>
                
                <div class="results-score">
                    <div class="score-number">${this.score}</div>
                    <div class="score-label">Punkte erreicht</div>
                </div>
                
                <div class="results-stats">
                    <div class="stat correct">
                        <div class="stat-number">${this.correctAnswers}</div>
                        <div class="stat-label">Richtig</div>
                    </div>
                    <div class="stat incorrect">
                        <div class="stat-number">${this.incorrectAnswers}</div>
                        <div class="stat-label">Falsch</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${this.maxStreak}x</div>
                        <div class="stat-label">Max Streak</div>
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
                    <button class="btn btn-outline" id="share-btn">
                        📤 Ergebnis teilen
                    </button>
                </div>
            </div>
            
            <div class="footer">
                <p>FaktenCheck - Lerne, Desinformation zu erkennen</p>
            </div>
        `;
        
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        
        document.getElementById('share-btn').addEventListener('click', () => {
            const shareText = `Ich habe ${this.score} Punkte beim FaktenCheck erreicht und ${this.earnedBadges.length}/${this.badges.length} Badges freigeschaltet! Kannst du politische Manipulation erkennen? 🏛️`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'FaktenCheck Quiz',
                    text: shareText,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(shareText + ' ' + window.location.href).then(() => {
                    alert('Link wurde in die Zwischenablage kopiert!');
                });
            }
        });
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FaktenCheckGame();
});
