// Progress Tracker for TriNetra Workflow
// Tracks user progress through CHRONOS -> Auto-SAR -> HYDRA flow

class ProgressTracker {
    constructor() {
        this.steps = [
            { id: 'chronos', name: 'CHRONOS Timeline', page: 'chronos.html', icon: '🕐' },
            { id: 'autosar', name: 'Auto-SAR Report', page: 'autosar.html', icon: '📋' },
            { id: 'hydra', name: 'HYDRA AI Battle', page: 'hydra.html', icon: '🐍' }
        ];
        this.currentStep = this.getCurrentStep();
        this.initializeTracker();
    }

    getCurrentStep() {
        const path = window.location.pathname;
        if (path.includes('chronos')) return 'chronos';
        if (path.includes('autosar')) return 'autosar';
        if (path.includes('hydra')) return 'hydra';
        return 'chronos'; // default
    }

    initializeTracker() {
        this.saveProgress();
        this.updateProgressDisplay();
    }

    saveProgress() {
        const progress = {
            currentStep: this.currentStep,
            timestamp: new Date().toISOString(),
            completedSteps: this.getCompletedSteps()
        };
        
        localStorage.setItem('trinetra_progress', JSON.stringify(progress));
    }

    getCompletedSteps() {
        const saved = localStorage.getItem('trinetra_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            return progress.completedSteps || [];
        }
        return [];
    }

    markStepCompleted(stepId) {
        const completedSteps = this.getCompletedSteps();
        if (!completedSteps.includes(stepId)) {
            completedSteps.push(stepId);
        }
        
        const progress = {
            currentStep: this.currentStep,
            timestamp: new Date().toISOString(),
            completedSteps: completedSteps
        };
        
        localStorage.setItem('trinetra_progress', JSON.stringify(progress));
        this.updateProgressDisplay();
    }

    updateProgressDisplay() {
        // This method can be called to update any progress indicators on the page
        const completedSteps = this.getCompletedSteps();
        
        // Emit a custom event that pages can listen to
        const progressEvent = new CustomEvent('progressUpdated', {
            detail: {
                currentStep: this.currentStep,
                completedSteps: completedSteps,
                totalSteps: this.steps.length
            }
        });
        
        document.dispatchEvent(progressEvent);
    }

    getProgressPercentage() {
        const completedSteps = this.getCompletedSteps();
        return Math.round((completedSteps.length / this.steps.length) * 100);
    }

    getNextStep() {
        const currentIndex = this.steps.findIndex(step => step.id === this.currentStep);
        if (currentIndex < this.steps.length - 1) {
            return this.steps[currentIndex + 1];
        }
        return null;
    }

    getPreviousStep() {
        const currentIndex = this.steps.findIndex(step => step.id === this.currentStep);
        if (currentIndex > 0) {
            return this.steps[currentIndex - 1];
        }
        return null;
    }

    // Enhanced navigation with progress tracking
    navigateToNext() {
        const nextStep = this.getNextStep();
        if (nextStep) {
            this.markStepCompleted(this.currentStep);
            window.location.href = nextStep.page;
        }
    }

    navigateToPrevious() {
        const prevStep = this.getPreviousStep();
        if (prevStep) {
            window.location.href = prevStep.page;
        }
    }

    // Analytics method for tracking user journey
    getAnalytics() {
        const saved = localStorage.getItem('trinetra_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            return {
                progressPercentage: this.getProgressPercentage(),
                timeSpent: this.calculateTimeSpent(),
                completionStatus: progress.completedSteps.length === this.steps.length ? 'completed' : 'in_progress',
                currentStep: this.currentStep,
                stepsCompleted: progress.completedSteps.length,
                totalSteps: this.steps.length
            };
        }
        return null;
    }

    calculateTimeSpent() {
        const saved = localStorage.getItem('trinetra_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            const startTime = new Date(progress.timestamp);
            const now = new Date();
            return Math.round((now - startTime) / 1000 / 60); // minutes
        }
        return 0;
    }

    // Method to show completion celebration
    showCompletionCelebration() {
        if (this.getProgressPercentage() === 100) {
            const celebration = document.createElement('div');
            celebration.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
            celebration.innerHTML = `
                <div class="bg-gradient-to-br from-primary to-secondary text-dark p-8 rounded-2xl text-center animate-pulse">
                    <div class="text-6xl mb-4">🎉</div>
                    <h2 class="text-2xl font-bold mb-2">Congratulations!</h2>
                    <p class="text-lg">You've completed the full TriNetra analysis workflow!</p>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            class="mt-4 px-6 py-2 bg-dark text-primary rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                        Continue
                    </button>
                </div>
            `;
            
            document.body.appendChild(celebration);
            
            setTimeout(() => {
                if (document.body.contains(celebration)) {
                    celebration.remove();
                }
            }, 5000);
        }
    }
}

// Initialize progress tracker on page load
document.addEventListener('DOMContentLoaded', () => {
    window.progressTracker = new ProgressTracker();
});

export default ProgressTracker;