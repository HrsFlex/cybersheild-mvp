// TriNetra Main Entry Point
// CSS files are loaded directly in HTML for better compatibility

// Import all JS modules
import api from './api.js'
import * as utils from './utils.js'
import ChronosTimeline from './chronos.js'
import HydraAI from './hydra.js'
import AutoSAR from './autosar.js'
import performanceManager from './performance.js'

// Main Application Class
class TriNetraApp {
    constructor() {
        this.currentScenario = 'all'
        this.modules = {}
        
        this.init()
    }
    
    async init() {
        console.log('🔹 Initializing TriNetra Application...')
        
        try {
            // Setup performance monitoring
            this.setupPerformanceOptimizations()
            
            // Initialize modules with lazy loading
            await this.initializeModulesLazily()
            
            // Setup global event listeners
            this.setupGlobalEventListeners()
            
            // Load initial data
            await this.loadInitialData()
            
            // Setup PWA features
            this.setupPWAFeatures()
            
            console.log('✅ TriNetra Application Initialized Successfully')
            utils.showNotification('TriNetra loaded successfully', 'success')
            
        } catch (error) {
            console.error('❌ Failed to initialize TriNetra:', error)
            utils.showNotification('Failed to initialize application', 'error')
        }
    }
    
    setupPerformanceOptimizations() {
        // Observe critical sections for performance
        const sections = ['chronos-timeline', 'ai-battle', 'sar-report'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                performanceManager.observeElement(element, 'visibility');
                performanceManager.observeElement(element, 'resize');
            }
        });
        
        // Add scroll-based animations
        document.querySelectorAll('.chronos-section, .hydra-section, .autosar-section')
            .forEach(section => {
                section.classList.add('fade-in-on-scroll');
                performanceManager.observeElement(section, 'visibility');
            });
    }
    
    async initializeModulesLazily() {
        // Initialize CHRONOS immediately (primary feature)
        this.modules.chronos = new ChronosTimeline('chronos-timeline')
        
        // Initialize other modules when they become visible
        const hydraSection = document.querySelector('.hydra-section');
        const autosarSection = document.querySelector('.autosar-section');
        
        if (hydraSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.modules.hydra) {
                        this.modules.hydra = new HydraAI();
                        observer.unobserve(entry.target);
                    }
                });
            });
            observer.observe(hydraSection);
        }
        
        if (autosarSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.modules.autosar) {
                        this.modules.autosar = new AutoSAR();
                        observer.unobserve(entry.target);
                    }
                });
            });
            observer.observe(autosarSection);
        }
    }
    
    setupPWAFeatures() {
        // Install prompt handling
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        // App installed handler
        window.addEventListener('appinstalled', () => {
            utils.showNotification('TriNetra installed successfully!', 'success');
            this.deferredPrompt = null;
        });
        
        // Online/offline status
        window.addEventListener('online', () => {
            utils.showNotification('Back online', 'success');
        });
        
        window.addEventListener('offline', () => {
            utils.showNotification('Working offline', 'info');
        });
    }
    
    showInstallPrompt() {
        const installButton = document.createElement('button');
        installButton.className = 'btn btn-primary install-prompt';
        installButton.innerHTML = '📱 Install TriNetra';
        installButton.onclick = () => this.installApp();
        
        const navbar = document.querySelector('.main-nav .nav-controls');
        if (navbar) {
            navbar.appendChild(installButton);
        }
    }
    
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                utils.showNotification('Installing TriNetra...', 'info');
            }
            
            this.deferredPrompt = null;
            document.querySelector('.install-prompt')?.remove();
        }
    }
    
    setupGlobalEventListeners() {
        // Scenario selection
        const scenarioButton = document.getElementById('scenario-select')
        const scenarioModal = document.getElementById('scenario-modal')
        const closeModal = document.getElementById('close-modal')
        
        if (scenarioButton) {
            scenarioButton.addEventListener('click', () => {
                scenarioModal?.classList.remove('hidden')
            })
        }
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                scenarioModal?.classList.add('hidden')
            })
        }
        
        // Scenario buttons
        document.querySelectorAll('.scenario-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const scenario = e.target.dataset.scenario
                this.changeScenario(scenario)
                scenarioModal?.classList.add('hidden')
            })
        })
        
        // Settings button (placeholder)
        const settingsButton = document.getElementById('settings-button')
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                utils.showNotification('Settings panel coming soon!', 'info')
            })
        }
        
        // Close modal on outside click
        if (scenarioModal) {
            scenarioModal.addEventListener('click', (e) => {
                if (e.target === scenarioModal) {
                    scenarioModal.classList.add('hidden')
                }
            })
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                scenarioModal?.classList.add('hidden')
            }
        })
    }
    
    async loadInitialData() {
        // Load timeline data for all scenarios
        if (this.modules.chronos) {
            await this.modules.chronos.loadData('all')
        }
        
        // Initialize other modules
        if (this.modules.hydra) {
            this.modules.hydra.initializeDashboard()
        }
        
        if (this.modules.autosar) {
            this.modules.autosar.initializeContainer()
        }
    }
    
    async changeScenario(scenario) {
        console.log(`🔄 Changing scenario to: ${scenario}`)
        this.currentScenario = scenario
        
        try {
            utils.showLoading()
            
            // Update timeline data
            if (this.modules.chronos) {
                await this.modules.chronos.loadData(scenario)
            }
            
            // Update AutoSAR scenario
            if (this.modules.autosar) {
                this.modules.autosar.setScenario(scenario)
            }
            
            utils.showNotification(`Switched to ${scenario.replace('_', ' ')} scenario`, 'success')
            
        } catch (error) {
            console.error('Failed to change scenario:', error)
            utils.showNotification('Failed to change scenario', 'error')
        } finally {
            utils.hideLoading()
        }
    }
    
    // Public API methods
    getChronos() {
        return this.modules.chronos
    }
    
    getHydra() {
        return this.modules.hydra
    }
    
    getAutoSAR() {
        return this.modules.autosar
    }
    
    getCurrentScenario() {
        return this.currentScenario
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.TriNetra = new TriNetraApp()
})

// Export for potential external access
export default TriNetraApp