// TriNetra Main Application
import api from './api.js';
import ChronosTimeline from './chronos.js';
import EnhancedHydraAI from './hydra-enhanced.js';
import EnhancedAutoSAR from './autosar-enhanced.js';
import { showLoading, hideLoading, showNotification } from './utils.js';

class TriNetraApp {
    constructor() {
        this.chronos = null;
        this.hydra = null;
        this.autosar = null;
        this.currentScenario = 'terrorist_financing';
        
        this.init();
    }

    async init() {
        try {
            showLoading();
            
            // Initialize components
            this.chronos = new ChronosTimeline('chronos-timeline');
            this.hydra = new EnhancedHydraAI();
            this.autosar = new EnhancedAutoSAR();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Perform health check
            await this.healthCheck();
            
            // Load initial data
            await this.loadInitialData();
            
            showNotification('TriNetra initialized successfully', 'success');
        } catch (error) {
            console.error('Initialization failed:', error);
            showNotification('Failed to initialize TriNetra', 'error');
        } finally {
            hideLoading();
        }
    }

    setupEventListeners() {
        // Scenario selection
        const scenarioButton = document.getElementById('scenario-select');
        const scenarioModal = document.getElementById('scenario-modal');
        const closeModal = document.getElementById('close-modal');
        const scenarioButtons = document.querySelectorAll('.scenario-button');

        if (scenarioButton && scenarioModal) {
            scenarioButton.addEventListener('click', () => {
                scenarioModal.classList.remove('hidden');
            });
        }

        if (closeModal && scenarioModal) {
            closeModal.addEventListener('click', () => {
                scenarioModal.classList.add('hidden');
            });
        }

        // Scenario selection buttons
        scenarioButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const scenario = e.target.dataset.scenario;
                if (scenario) {
                    this.changeScenario(scenario);
                    scenarioModal.classList.add('hidden');
                }
            });
        });

        // Close modal on background click
        if (scenarioModal) {
            scenarioModal.addEventListener('click', (e) => {
                if (e.target === scenarioModal) {
                    scenarioModal.classList.add('hidden');
                }
            });
        }

        // Settings button (placeholder)
        const settingsButton = document.getElementById('settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                showNotification('Settings panel coming soon...', 'info');
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            if (this.chronos) {
                this.chronos.resize();
            }
        });

        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause animations when tab is not visible
                if (this.chronos && this.chronos.isPlaying) {
                    this.chronos.pause();
                }
            }
        });
    }

    async healthCheck() {
        try {
            const response = await api.healthCheck();
            if (response.status === 'healthy') {
                console.log('✅ TriNetra backend is healthy');
                return true;
            } else {
                throw new Error('Backend health check failed');
            }
        } catch (error) {
            console.error('❌ Backend health check failed:', error);
            showNotification('Backend connection failed', 'error');
            return false;
        }
    }

    async loadInitialData() {
        try {
            // Load default scenario data
            if (this.chronos) {
                await this.chronos.loadData(this.currentScenario);
            }

            // Set initial scenario for AutoSAR
            if (this.autosar) {
                this.autosar.setScenario(this.currentScenario);
            }

        } catch (error) {
            console.error('Failed to load initial data:', error);
            showNotification('Failed to load initial data', 'error');
        }
    }

    async changeScenario(scenario) {
        try {
            showLoading();
            this.currentScenario = scenario;
            
            // Update CHRONOS timeline
            if (this.chronos) {
                await this.chronos.loadData(scenario);
            }

            // Update AutoSAR scenario
            if (this.autosar) {
                this.autosar.setScenario(scenario);
            }

            showNotification(`Switched to ${scenario.replace('_', ' ')} scenario`, 'success');
        } catch (error) {
            console.error('Failed to change scenario:', error);
            showNotification('Failed to change scenario', 'error');
        } finally {
            hideLoading();
        }
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case ' ': // Spacebar - Play/Pause timeline
                e.preventDefault();
                if (this.chronos) {
                    if (this.chronos.isPlaying) {
                        this.chronos.pause();
                    } else {
                        this.chronos.play();
                    }
                }
                break;
                
            case 'r': // R - Reset timeline
                e.preventDefault();
                if (this.chronos) {
                    this.chronos.reset();
                }
                break;
                
            case 'h': // H - Generate HYDRA pattern
                e.preventDefault();
                if (this.hydra) {
                    this.hydra.generatePattern();
                }
                break;
                
            case 's': // S - Generate SAR report
                e.preventDefault();
                if (this.autosar) {
                    this.autosar.generateReport();
                }
                break;
                
            case '1': // 1 - Terrorist financing scenario
                e.preventDefault();
                this.changeScenario('terrorist_financing');
                break;
                
            case '2': // 2 - Crypto sanctions scenario
                e.preventDefault();
                this.changeScenario('crypto_sanctions');
                break;
                
            case '3': // 3 - Human trafficking scenario
                e.preventDefault();
                this.changeScenario('human_trafficking');
                break;

            case 'Escape': // Escape - Close modals
                e.preventDefault();
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.add('hidden');
                });
                break;
        }
    }

    // Public methods for external access
    getChronos() {
        return this.chronos;
    }

    getHydra() {
        return this.hydra;
    }

    getAutoSAR() {
        return this.autosar;
    }

    getCurrentScenario() {
        return this.currentScenario;
    }

    // Demo mode for presentations
    async runDemo() {
        try {
            showNotification('Starting demo sequence...', 'info');
            
            // Step 1: Load terrorist financing scenario
            await this.changeScenario('terrorist_financing');
            await this.delay(2000);
            
            // Step 2: Play CHRONOS timeline
            if (this.chronos) {
                this.chronos.play();
                await this.delay(5000);
                this.chronos.pause();
            }
            
            // Step 3: Generate HYDRA pattern
            if (this.hydra) {
                await this.hydra.generatePattern();
                await this.delay(3000);
            }
            
            // Step 4: Generate SAR report
            if (this.autosar) {
                await this.autosar.generateReport();
            }
            
            showNotification('Demo sequence completed!', 'success');
        } catch (error) {
            console.error('Demo failed:', error);
            showNotification('Demo sequence failed', 'error');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make app globally accessible for debugging
    window.TriNetra = new TriNetraApp();
    
    // Add keyboard shortcut help
    console.log(`
🔹 TriNetra Keyboard Shortcuts:
   Space: Play/Pause timeline
   R: Reset timeline  
   H: Generate HYDRA pattern
   S: Generate SAR report
   1: Terrorist financing scenario
   2: Crypto sanctions scenario
   3: Human trafficking scenario
   Escape: Close modals
   
🔹 Demo mode: window.TriNetra.runDemo()
    `);
});

// Handle service worker updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        showNotification('TriNetra has been updated. Refresh to see changes.', 'info');
    });
}

// Export for module access
export default TriNetraApp;