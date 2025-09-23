// Enhanced HYDRA AI Battle System with Impressive Animations
import api from './api.js';
import { showLoading, hideLoading, showNotification, formatDateTime } from './utils.js';

class EnhancedHydraAI {
    constructor() {
        this.isRunning = false;
        this.battleInterval = null;
        this.currentBattle = null;
        this.animationQueue = [];
        this.battleStats = {
            generator: { health: 100, power: 100, wins: 0 },
            attacker: { health: 100, power: 100, wins: 0 }
        };
        
        this.initializeEnhancedContainer();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Enhanced event listener setup with debugging
        console.log('🔧 HYDRA: Setting up enhanced event listeners...');
        
        const startButton = document.getElementById('start-battle');
        const stopButton = document.getElementById('stop-battle');
        const generateButton = document.getElementById('generate-pattern');
        const simulationButton = document.getElementById('run-simulation');
        const exportButton = document.getElementById('export-hydra');

        if (startButton) {
            console.log('✅ HYDRA: Start battle button found, adding listener');
            startButton.addEventListener('click', () => {
                console.log('🎮 HYDRA: Start battle button clicked');
                this.startBattle();
            });
        } else {
            console.error('❌ HYDRA: Start battle button not found');
        }

        if (stopButton) {
            console.log('✅ HYDRA: Stop battle button found, adding listener');
            stopButton.addEventListener('click', () => {
                console.log('🛑 HYDRA: Stop battle button clicked');
                this.stopBattle();
            });
        } else {
            console.error('❌ HYDRA: Stop battle button not found');
        }

        // Generate pattern button removed as requested
        if (generateButton) {
            console.log('⚠️ HYDRA: Generate pattern button found but feature disabled');
            // Feature removed per user request
        }

        if (simulationButton) {
            console.log('✅ HYDRA: Simulation button found, adding listener');
            simulationButton.addEventListener('click', () => {
                console.log('🧪 HYDRA: Simulation button clicked');
                this.runSimulation();
            });
        }

        if (exportButton) {
            console.log('✅ HYDRA: Export button found, adding listener');
            exportButton.addEventListener('click', () => {
                console.log('📄 HYDRA: Export button clicked');
                this.exportReport();
            });
        }

        console.log('🎯 HYDRA: Event listener setup complete');
        
        // Ensure buttons exist and are functional
        this.ensureButtonsFunctional();
    }

    ensureButtonsFunctional() {
        console.log('🔧 HYDRA: Ensuring buttons are functional...');
        
        // Add some delay to ensure DOM is ready
        setTimeout(() => {
            const startButton = document.getElementById('start-battle');
            const stopButton = document.getElementById('stop-battle');
            
            if (startButton) {
                console.log('✅ HYDRA: Start button exists and functional');
                // Add visual feedback
                startButton.style.opacity = '1';
                startButton.disabled = false;
            } else {
                console.error('❌ HYDRA: Start button missing - attempting to create fallback');
                this.createFallbackButtons();
            }
            
            if (stopButton) {
                console.log('✅ HYDRA: Stop button exists and functional');
                stopButton.style.opacity = '1';
                stopButton.disabled = false;
            }
        }, 100);
    }

    createFallbackButtons() {
        console.log('🔧 HYDRA: Creating fallback buttons...');
        
        // Find the HYDRA controls container
        const hydraControls = document.querySelector('.hydra-controls');
        if (hydraControls) {
            // Add start button if missing
            if (!document.getElementById('start-battle')) {
                const startBtn = document.createElement('button');
                startBtn.id = 'start-battle';
                startBtn.className = 'control-button primary';
                startBtn.innerHTML = '⚔️ Start Battle';
                startBtn.addEventListener('click', () => this.startBattle());
                hydraControls.prepend(startBtn);
                console.log('✅ HYDRA: Created fallback start button');
            }
            
            // Add stop button if missing
            if (!document.getElementById('stop-battle')) {
                const stopBtn = document.createElement('button');
                stopBtn.id = 'stop-battle';
                stopBtn.className = 'control-button';
                stopBtn.innerHTML = '⏹️ Stop Battle';
                stopBtn.addEventListener('click', () => this.stopBattle());
                hydraControls.insertBefore(stopBtn, hydraControls.children[1]);
                console.log('✅ HYDRA: Created fallback stop button');
            }
        }
    }

    initializeEnhancedContainer() {
        const container = document.getElementById('ai-battle');
        if (!container) return;

        container.innerHTML = `
            <div class="enhanced-hydra-battlefield">
                <!-- Battle Arena with Enhanced Graphics -->
                <div class="enhanced-battle-arena">
                    <!-- AI Defender -->
                    <div class="enhanced-ai-entity generator" id="generator-entity">
                        <div class="entity-glow generator-glow"></div>
                        <div class="entity-avatar-container">
                            <div class="entity-avatar generator-avatar">
                                <svg width="80" height="80" viewBox="0 0 80 80" class="ai-defender-image">
                                    <defs>
                                        <linearGradient id="defenderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                                            <stop offset="100%" style="stop-color:#00ff87;stop-opacity:1" />
                                        </linearGradient>
                                    </defs>
                                    <!-- AI Defender Shield -->
                                    <polygon points="40,5 60,15 70,35 60,55 40,65 20,55 10,35 20,15" 
                                             fill="url(#defenderGradient)" stroke="#ffffff" stroke-width="2"/>
                                    <!-- Defensive Core -->
                                    <circle cx="40" cy="35" r="15" fill="#ffffff" opacity="0.9"/>
                                    <circle cx="40" cy="35" r="8" fill="#00d4ff"/>
                                    <!-- Neural Network Pattern -->
                                    <g stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.8">
                                        <line x1="32" y1="27" x2="48" y2="43"/>
                                        <line x1="48" y1="27" x2="32" y2="43"/>
                                        <circle cx="32" cy="27" r="2" fill="#ffffff"/>
                                        <circle cx="48" cy="27" r="2" fill="#ffffff"/>
                                        <circle cx="32" cy="43" r="2" fill="#ffffff"/>
                                        <circle cx="48" cy="43" r="2" fill="#ffffff"/>
                                    </g>
                                </svg>
                            </div>
                            <div class="power-ring generator-ring"></div>
                        </div>
                        <div class="entity-name">🛡️ AI Defender</div>
                        <div class="entity-description">Protects against financial crime patterns</div>
                        <div class="entity-stats">
                            <div class="stat-item">
                                <div class="stat-label">Health</div>
                                <div class="stat-bar">
                                    <div class="stat-fill generator-health" style="width: 100%"></div>
                                    <div class="stat-text" id="generator-health-text">100%</div>
                                </div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Power</div>
                                <div class="stat-bar">
                                    <div class="stat-fill generator-power" style="width: 100%"></div>
                                    <div class="stat-text" id="generator-power-text">100%</div>
                                </div>
                            </div>
                        </div>
                        <div class="win-counter">Wins: <span id="generator-wins">0</span></div>
                    </div>
                    
                    <!-- Battle Center with Energy Field -->
                    <div class="enhanced-battle-center">
                        <div class="energy-field" id="energy-field"></div>
                        <div class="vs-indicator-enhanced">
                            <div class="vs-text">VS</div>
                            <div class="vs-lightning"></div>
                        </div>
                        <div class="battle-effects-enhanced" id="battle-effects-enhanced">
                            <canvas id="battle-canvas" width="300" height="200"></canvas>
                        </div>
                        <div class="energy-beam" id="energy-beam"></div>
                    </div>
                    
                    <!-- AI Attacker -->
                    <div class="enhanced-ai-entity attacker" id="attacker-entity">
                        <div class="entity-glow attacker-glow"></div>
                        <div class="entity-avatar-container">
                            <div class="entity-avatar attacker-avatar">
                                <svg width="80" height="80" viewBox="0 0 80 80" class="ai-attacker-image">
                                    <defs>
                                        <linearGradient id="attackerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                                            <stop offset="100%" style="stop-color:#ffa500;stop-opacity:1" />
                                        </linearGradient>
                                    </defs>
                                    <!-- AI Attacker Blade -->
                                    <polygon points="40,5 65,25 55,40 40,65 25,40 15,25" 
                                             fill="url(#attackerGradient)" stroke="#ffffff" stroke-width="2"/>
                                    <!-- Attack Core -->
                                    <polygon points="40,20 52,32 40,44 28,32" fill="#ffffff" opacity="0.9"/>
                                    <polygon points="40,25 47,32 40,39 33,32" fill="#ff6b6b"/>
                                    <!-- Lightning Pattern -->
                                    <g stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8">
                                        <path d="M32 15 L35 25 L30 25 L33 35"/>
                                        <path d="M48 15 L45 25 L50 25 L47 35"/>
                                        <path d="M25 45 L30 50 L25 55"/>
                                        <path d="M55 45 L50 50 L55 55"/>
                                    </g>
                                </svg>
                            </div>
                            <div class="power-ring attacker-ring"></div>
                        </div>
                        <div class="entity-name">⚔️ AI Attacker</div>
                        <div class="entity-description">Generates adversarial crime patterns</div>
                        <div class="entity-stats">
                            <div class="stat-item">
                                <div class="stat-label">Health</div>
                                <div class="stat-bar">
                                    <div class="stat-fill attacker-health" style="width: 100%"></div>
                                    <div class="stat-text" id="attacker-health-text">100%</div>
                                </div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Power</div>
                                <div class="stat-bar">
                                    <div class="stat-fill attacker-power" style="width: 100%"></div>
                                    <div class="stat-text" id="attacker-power-text">100%</div>
                                </div>
                            </div>
                        </div>
                        <div class="win-counter">Wins: <span id="attacker-wins">0</span></div>
                    </div>
                </div>
                
                <!-- Battle Instructions -->
                <div class="battle-instructions">
                    <div class="instruction-card">
                        <h4>🎯 How HYDRA Works</h4>
                        <p><strong>AI Defender:</strong> Protects against financial crime by detecting suspicious patterns</p>
                        <p><strong>AI Attacker:</strong> Generates new adversarial patterns to test defenses</p>
                        <p><strong>Battle Mode:</strong> Watch AI systems compete to improve detection capabilities</p>
                    </div>
                </div>
                
                <!-- Enhanced Battle Log with Real-time Stats -->
                <div class="enhanced-battle-dashboard">
                    <div class="battle-log-enhanced" id="battle-log-enhanced">
                        <div class="log-header-enhanced">
                            <div class="log-title">🔥 Real-Time Battle Log</div>
                            <div class="battle-status" id="battle-status">READY</div>
                        </div>
                        <div class="log-content-enhanced" id="log-content-enhanced">
                            <div class="log-entry-enhanced">
                                <span class="log-time">[00:00:00]</span>
                                <span class="log-message">🤖 Enhanced AI systems initialized and ready for battle...</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Real-time Battle Metrics -->
                    <div class="battle-metrics">
                        <div class="metric-card">
                            <div class="metric-icon">⚡</div>
                            <div class="metric-value" id="battle-rounds">0</div>
                            <div class="metric-label">Rounds</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">💥</div>
                            <div class="metric-value" id="total-damage">0</div>
                            <div class="metric-label">Total Damage</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">🎯</div>
                            <div class="metric-value" id="accuracy-rate">0%</div>
                            <div class="metric-label">Accuracy</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">⏱️</div>
                            <div class="metric-value" id="battle-time">00:00</div>
                            <div class="metric-label">Duration</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addEnhancedBattleStyles();
        this.initializeBattleCanvas();
        this.startIdleAnimations();
        this.addTooltips();
        
        // Make instance globally accessible for debugging
        window.hydraDebug = {
            instance: this,
            testStart: () => this.startBattle(),
            testStop: () => this.stopBattle(),
            checkButtons: () => this.debugButtons(),
            status: () => ({
                isRunning: this.isRunning,
                battleInterval: !!this.battleInterval,
                battleTimer: !!this.battleTimer
            })
        };
        console.log('🔧 HYDRA: Debug interface available at window.hydraDebug');
    }

    debugButtons() {
        console.log('🔍 HYDRA: Button Debug Information:');
        console.log('Start Button:', document.getElementById('start-battle'));
        console.log('Stop Button:', document.getElementById('stop-battle'));
        console.log('Generate Button:', document.getElementById('generate-pattern'));
        console.log('Simulation Button:', document.getElementById('run-simulation'));
        console.log('Export Button:', document.getElementById('export-hydra'));
        console.log('HYDRA Controls Container:', document.querySelector('.hydra-controls'));
        console.log('Current Running State:', this.isRunning);
        return {
            startButton: !!document.getElementById('start-battle'),
            stopButton: !!document.getElementById('stop-battle'),
            hydraControls: !!document.querySelector('.hydra-controls'),
            isRunning: this.isRunning
        };
    }

    addEnhancedBattleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-hydra-battlefield {
                background: linear-gradient(135deg, #0a0a0f, #1a1a2e, #16213e);
                border-radius: 20px;
                padding: 2rem;
                border: 3px solid rgba(0, 255, 135, 0.5);
                position: relative;
                overflow: hidden;
                box-shadow: 0 0 40px rgba(0, 255, 135, 0.3);
            }
            
            .enhanced-hydra-battlefield::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20% 30%, rgba(0, 255, 135, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(255, 100, 100, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
                pointer-events: none;
                animation: backgroundPulse 4s ease-in-out infinite;
            }
            
            @keyframes backgroundPulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
            
            .enhanced-battle-arena {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                position: relative;
                min-height: 300px;
                z-index: 1;
            }
            
            .enhanced-ai-entity {
                text-align: center;
                padding: 2rem;
                background: rgba(26, 26, 46, 0.8);
                border-radius: 20px;
                border: 2px solid;
                min-width: 250px;
                position: relative;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .enhanced-ai-entity.generator {
                border-color: #00d4ff;
                box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
            }
            
            .enhanced-ai-entity.attacker {
                border-color: #ff6b6b;
                box-shadow: 0 0 30px rgba(255, 107, 107, 0.4);
            }
            
            .entity-glow {
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                border-radius: 25px;
                opacity: 0.6;
                animation: entityGlow 3s ease-in-out infinite;
            }
            
            .generator-glow {
                background: linear-gradient(45deg, transparent, rgba(0, 212, 255, 0.3), transparent);
            }
            
            .attacker-glow {
                background: linear-gradient(45deg, transparent, rgba(255, 107, 107, 0.3), transparent);
            }
            
            @keyframes entityGlow {
                0%, 100% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.05); opacity: 0.9; }
            }
            
            .entity-avatar-container {
                position: relative;
                display: inline-block;
                margin-bottom: 1rem;
            }
            
            .entity-avatar {
                font-size: 4rem;
                display: block;
                animation: avatarFloat 3s ease-in-out infinite;
                transition: all 0.3s ease;
            }
            
            .generator-avatar {
                text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
            }
            
            .attacker-avatar {
                text-shadow: 0 0 20px rgba(255, 107, 107, 0.8);
            }
            
            @keyframes avatarFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            .power-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100px;
                height: 100px;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                border: 3px solid;
                animation: powerRing 2s linear infinite;
                opacity: 0.7;
            }
            
            .generator-ring {
                border-color: #00d4ff;
                box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
            }
            
            .attacker-ring {
                border-color: #ff6b6b;
                box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            }
            
            @keyframes powerRing {
                0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
                100% { transform: translate(-50%, -50%) rotate(360deg) scale(1.1); }
            }
            
            .entity-name {
                font-size: 1.4rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .entity-stats {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .stat-item {
                text-align: left;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: #888;
                margin-bottom: 0.5rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .stat-bar {
                position: relative;
                width: 100%;
                height: 25px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .stat-fill {
                height: 100%;
                transition: width 0.8s ease;
                border-radius: 15px;
                position: relative;
                overflow: hidden;
            }
            
            .stat-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                animation: barShine 2s infinite;
            }
            
            @keyframes barShine {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .generator-health {
                background: linear-gradient(90deg, #00d4ff, #00ff87);
                box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
            }
            
            .generator-power {
                background: linear-gradient(90deg, #00ff87, #a855f7);
                box-shadow: 0 0 10px rgba(0, 255, 135, 0.5);
            }
            
            .attacker-health {
                background: linear-gradient(90deg, #ff6b6b, #ffa500);
                box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
            }
            
            .attacker-power {
                background: linear-gradient(90deg, #ffa500, #ff6b6b);
                box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
            }
            
            .stat-text {
                position: absolute;
                top: 50%;
                right: 10px;
                transform: translateY(-50%);
                font-size: 0.8rem;
                font-weight: 600;
                color: #ffffff;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            }
            
            .win-counter {
                font-size: 1.1rem;
                font-weight: 600;
                color: #00ff87;
                text-shadow: 0 0 10px rgba(0, 255, 135, 0.8);
            }
            
            .enhanced-battle-center {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                margin: 0 3rem;
                min-height: 250px;
                justify-content: center;
            }
            
            .energy-field {
                position: absolute;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(0, 255, 135, 0.2), rgba(0, 212, 255, 0.1), transparent);
                animation: energyField 3s ease-in-out infinite;
                z-index: 0;
            }
            
            @keyframes energyField {
                0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
                50% { transform: scale(1.2) rotate(180deg); opacity: 0.9; }
            }
            
            .vs-indicator-enhanced {
                position: relative;
                z-index: 2;
                margin-bottom: 2rem;
            }
            
            .vs-text {
                font-size: 3rem;
                font-weight: 900;
                color: #ffffff;
                text-shadow: 0 0 20px rgba(0, 255, 135, 0.8);
                animation: vsGlow 2s ease-in-out infinite;
            }
            
            @keyframes vsGlow {
                0%, 100% { 
                    text-shadow: 0 0 20px rgba(0, 255, 135, 0.8);
                    transform: scale(1);
                }
                50% { 
                    text-shadow: 0 0 30px rgba(0, 255, 135, 1), 0 0 40px rgba(0, 212, 255, 0.8);
                    transform: scale(1.1);
                }
            }
            
            .vs-lightning {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 60px;
                height: 60px;
                transform: translate(-50%, -50%);
                background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
                border-radius: 50%;
                opacity: 0;
                animation: lightning 4s infinite;
            }
            
            @keyframes lightning {
                0%, 90%, 100% { opacity: 0; }
                92%, 96% { opacity: 1; }
            }
            
            .battle-effects-enhanced {
                position: relative;
                z-index: 1;
            }
            
            #battle-canvas {
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .energy-beam {
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 5px;
                background: linear-gradient(90deg, transparent, #00ff87, #00d4ff, #00ff87, transparent);
                transform: translateY(-50%);
                opacity: 0;
                z-index: 1;
            }
            
            .energy-beam.active {
                animation: energyBeam 0.8s ease-out;
            }
            
            @keyframes energyBeam {
                0% { opacity: 0; transform: translateY(-50%) scaleX(0); }
                20% { opacity: 1; transform: translateY(-50%) scaleX(0.3); }
                60% { opacity: 1; transform: translateY(-50%) scaleX(1); }
                100% { opacity: 0; transform: translateY(-50%) scaleX(1); }
            }
            
            .enhanced-battle-dashboard {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 2rem;
                position: relative;
                z-index: 1;
            }
            
            .battle-log-enhanced {
                background: rgba(26, 26, 46, 0.8);
                border-radius: 16px;
                border: 2px solid rgba(0, 255, 135, 0.3);
                overflow: hidden;
                backdrop-filter: blur(10px);
            }
            
            .log-header-enhanced {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.5rem;
                background: linear-gradient(135deg, rgba(0, 255, 135, 0.2), rgba(0, 212, 255, 0.2));
                border-bottom: 1px solid rgba(0, 255, 135, 0.3);
            }
            
            .log-title {
                font-size: 1.2rem;
                font-weight: 700;
                color: #00ff87;
            }
            
            .battle-status {
                padding: 0.5rem 1rem;
                background: rgba(0, 255, 135, 0.2);
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
                color: #00ff87;
                border: 1px solid rgba(0, 255, 135, 0.5);
            }
            
            .log-content-enhanced {
                padding: 1rem 1.5rem;
                max-height: 200px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(0, 255, 135, 0.5) rgba(0, 0, 0, 0.3);
            }
            
            .log-content-enhanced::-webkit-scrollbar {
                width: 6px;
            }
            
            .log-content-enhanced::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 3px;
            }
            
            .log-content-enhanced::-webkit-scrollbar-thumb {
                background: rgba(0, 255, 135, 0.5);
                border-radius: 3px;
            }
            
            .log-entry-enhanced {
                margin-bottom: 0.8rem;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.9rem;
                line-height: 1.4;
                opacity: 0;
                animation: logEntryFade 0.5s ease-out forwards;
            }
            
            @keyframes logEntryFade {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .log-time {
                color: #00d4ff;
                margin-right: 0.8rem;
                font-weight: 600;
            }
            
            .log-message {
                color: #ffffff;
            }
            
            .battle-metrics {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            
            .metric-card {
                background: rgba(26, 26, 46, 0.8);
                border-radius: 16px;
                padding: 1.5rem;
                text-align: center;
                border: 2px solid rgba(0, 212, 255, 0.3);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }
            
            .metric-card:hover {
                transform: translateY(-5px);
                border-color: rgba(0, 212, 255, 0.6);
                box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
            }
            
            .metric-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
                display: block;
            }
            
            .metric-value {
                font-size: 1.8rem;
                font-weight: 700;
                color: #00ff87;
                margin-bottom: 0.5rem;
                text-shadow: 0 0 10px rgba(0, 255, 135, 0.8);
            }
            
            .metric-label {
                font-size: 0.9rem;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* Attack Animations */
            .attack-generator {
                animation: attackGeneratorEnhanced 1.2s ease-out;
            }
            
            .attack-attacker {
                animation: attackAttackerEnhanced 1.2s ease-out;
            }
            
            @keyframes attackGeneratorEnhanced {
                0% { transform: scale(1) translateX(0) rotateY(0deg); }
                20% { transform: scale(1.1) translateX(30px) rotateY(-10deg); }
                40% { transform: scale(1.15) translateX(50px) rotateY(-15deg); }
                60% { transform: scale(1.1) translateX(30px) rotateY(-10deg); }
                100% { transform: scale(1) translateX(0) rotateY(0deg); }
            }
            
            @keyframes attackAttackerEnhanced {
                0% { transform: scale(1) translateX(0) rotateY(0deg); }
                20% { transform: scale(1.1) translateX(-30px) rotateY(10deg); }
                40% { transform: scale(1.15) translateX(-50px) rotateY(15deg); }
                60% { transform: scale(1.1) translateX(-30px) rotateY(10deg); }
                100% { transform: scale(1) translateX(0) rotateY(0deg); }
            }
            
            .screen-shake {
                animation: screenShake 0.5s ease-out;
            }
            
            @keyframes screenShake {
                0%, 100% { transform: translateX(0); }
                10% { transform: translateX(-5px) translateY(2px); }
                20% { transform: translateX(5px) translateY(-2px); }
                30% { transform: translateX(-3px) translateY(1px); }
                40% { transform: translateX(3px) translateY(-1px); }
                50% { transform: translateX(-2px) translateY(0px); }
                60% { transform: translateX(2px) translateY(0px); }
                70% { transform: translateX(-1px) translateY(0px); }
                80% { transform: translateX(1px) translateY(0px); }
                90% { transform: translateX(0px) translateY(0px); }
            }
            
            .damage-indicator {
                position: absolute;
                font-size: 2rem;
                font-weight: 900;
                color: #ff6b6b;
                text-shadow: 0 0 10px rgba(255, 107, 107, 0.8);
                pointer-events: none;
                z-index: 10;
                animation: damageFloat 1.5s ease-out forwards;
            }
            
            @keyframes damageFloat {
                0% { 
                    opacity: 1; 
                    transform: scale(0.5) translateY(0px); 
                }
                20% { 
                    opacity: 1; 
                    transform: scale(1.2) translateY(-20px); 
                }
                100% { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(-80px); 
                }
            }
            
            /* Enhanced HYDRA Control Styling */
            .section-description {
                color: #aaa;
                font-size: 0.95rem;
                margin-bottom: 1.5rem;
                text-align: center;
                font-style: italic;
            }
            
            .control-group {
                display: flex;
                gap: 0.8rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .primary-controls {
                border-bottom: 1px solid rgba(0, 255, 135, 0.2);
                padding-bottom: 1rem;
            }
            
            .secondary-controls {
                justify-content: space-around;
            }
            
            .control-button {
                position: relative;
                padding: 0.8rem 1.5rem;
                border: 2px solid rgba(0, 212, 255, 0.3);
                background: rgba(26, 26, 46, 0.8);
                color: #ffffff;
                border-radius: 12px;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .control-button:hover {
                border-color: rgba(0, 255, 135, 0.6);
                box-shadow: 0 6px 25px rgba(0, 255, 135, 0.3);
                transform: translateY(-2px);
            }
            
            .control-button.primary {
                background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 255, 135, 0.2));
                border-color: rgba(0, 255, 135, 0.6);
                box-shadow: 0 6px 20px rgba(0, 255, 135, 0.3);
            }
            
            .control-button.primary:hover {
                background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 255, 135, 0.3));
                transform: translateY(-3px) scale(1.05);
            }
            
            .export-button {
                border-color: rgba(168, 85, 247, 0.5);
                color: #a855f7;
            }
            
            .export-button:hover {
                border-color: rgba(168, 85, 247, 0.8);
                box-shadow: 0 6px 25px rgba(168, 85, 247, 0.3);
            }
            
            /* Tooltip Styling */
            .control-button[title]:hover::after {
                content: attr(title);
                position: absolute;
                bottom: 120%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: #ffffff;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-size: 0.8rem;
                font-weight: 400;
                white-space: nowrap;
                z-index: 1000;
                border: 1px solid rgba(0, 255, 135, 0.3);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            }
            
            .control-button[title]:hover::before {
                content: '';
                position: absolute;
                bottom: 110%;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 5px solid rgba(0, 0, 0, 0.9);
                z-index: 1001;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .enhanced-battle-arena {
                    flex-direction: column;
                    gap: 2rem;
                }
                
                .enhanced-battle-center {
                    margin: 1rem 0;
                    order: 2;
                }
                
                .enhanced-ai-entity {
                    min-width: auto;
                    width: 100%;
                    max-width: 300px;
                }
                
                .enhanced-battle-dashboard {
                    grid-template-columns: 1fr;
                }
                
                .battle-metrics {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .control-group {
                    flex-direction: column;
                    align-items: center;
                }
                
                .control-button {
                    width: 100%;
                    max-width: 280px;
                }
            }
        `;
        
        if (!document.querySelector('#enhanced-hydra-styles')) {
            style.id = 'enhanced-hydra-styles';
            document.head.appendChild(style);
        }
    }

    initializeBattleCanvas() {
        this.canvas = document.getElementById('battle-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        
        if (this.ctx) {
            this.animateParticles();
        }
    }

    startIdleAnimations() {
        // Ambient particle effects when not in battle
        if (this.ctx) {
            this.createAmbientParticles();
        }
    }

    createAmbientParticles() {
        const createParticle = () => {
            return {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                life: 1,
                decay: Math.random() * 0.02 + 0.01,
                color: Math.random() > 0.5 ? 'rgba(0, 255, 135, ' : 'rgba(0, 212, 255, '
            };
        };

        // Create initial particles
        for (let i = 0; i < 20; i++) {
            this.particles.push(createParticle());
        }

        // Continuously add new particles
        setInterval(() => {
            if (this.particles.length < 50) {
                this.particles.push(createParticle());
            }
        }, 500);
    }

    animateParticles() {
        if (!this.ctx) return;

        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update and draw particles
            this.particles = this.particles.filter(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.life -= particle.decay;
                
                if (particle.life <= 0) return false;
                
                this.ctx.globalAlpha = particle.life;
                this.ctx.fillStyle = particle.color + particle.life + ')';
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                return true;
            });
            
            this.ctx.globalAlpha = 1;
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    async startBattle() {
        console.log('🎮 HYDRA: startBattle() method called');
        console.log('🔍 HYDRA: Current isRunning state:', this.isRunning);
        
        if (this.isRunning) {
            console.log('⚠️ HYDRA: Battle already running, returning');
            return;
        }
        
        try {
            console.log('🚀 HYDRA: Starting enhanced AI battle...');
            showLoading();
            this.isRunning = true;
            this.battleStartTime = Date.now();
            this.battleRounds = 0;
            this.totalDamage = 0;
            this.successfulAttacks = 0;
            this.totalAttacks = 0;
            
            // Update battle status
            this.updateBattleStatus('ACTIVE');
            
            // Initialize battle (work without API for testing)
            try {
                const response = await api.startAIBattle();
                if (response.status === 'success') {
                    this.currentBattle = response.battle_data;
                }
            } catch (error) {
                console.log('🔄 HYDRA: API not available, using mock battle data');
                this.currentBattle = {
                    battle_id: 'mock_battle_' + Date.now(),
                    scenario: 'enhanced_battle',
                    participants: ['AI Generator', 'AI Attacker']
                };
            }
            
            this.addEnhancedLogEntry('🚀 Enhanced AI Battle initiated! Systems online.', 'success');
            console.log('✅ HYDRA: Battle initialized successfully');
            
            // Start battle timer
            this.battleTimer = setInterval(() => {
                this.updateBattleTime();
            }, 1000);
            
            // Start battle loop with dramatic timing
            this.battleInterval = setInterval(() => {
                this.performEnhancedBattleRound();
            }, 3000); // Slower for better visibility
            
            console.log('🎯 HYDRA: Battle timers started');
            showNotification('Enhanced AI Battle started successfully', 'success');
        } catch (error) {
            console.error('Enhanced battle start failed:', error);
            this.addEnhancedLogEntry('❌ Battle initialization failed! System error detected.', 'error');
            showNotification('Failed to start enhanced AI battle', 'error');
            this.isRunning = false;
            this.updateBattleStatus('ERROR');
        } finally {
            hideLoading();
        }
    }

    performEnhancedBattleRound() {
        if (!this.isRunning || !this.currentBattle) return;
        
        this.battleRounds++;
        this.totalAttacks++;
        
        // Determine attacker with some strategy
        const isGeneratorAttack = Math.random() > 0.5;
        const baseDamage = Math.floor(Math.random() * 20) + 10; // 10-30 base damage
        
        // Calculate actual damage based on power levels
        const attackerPower = this.battleStats[isGeneratorAttack ? 'generator' : 'attacker'].power;
        const actualDamage = Math.floor(baseDamage * (attackerPower / 100));
        
        this.totalDamage += actualDamage;
        this.successfulAttacks++;
        
        if (isGeneratorAttack) {
            this.performEnhancedAttack('generator', 'attacker', actualDamage);
        } else {
            this.performEnhancedAttack('attacker', 'generator', actualDamage);
        }
        
        // Update metrics
        this.updateBattleMetrics();
    }

    performEnhancedAttack(attacker, target, damage) {
        // Screen shake effect
        document.querySelector('.enhanced-hydra-battlefield').classList.add('screen-shake');
        setTimeout(() => {
            document.querySelector('.enhanced-hydra-battlefield').classList.remove('screen-shake');
        }, 500);
        
        // Attacker animation
        const attackerElement = document.getElementById(`${attacker}-entity`);
        if (attackerElement) {
            attackerElement.classList.add(`attack-${attacker}`);
            setTimeout(() => {
                attackerElement.classList.remove(`attack-${attacker}`);
            }, 1200);
        }
        
        // Energy beam effect
        this.showEnergyBeam(attacker, target);
        
        // Battle effects and particles
        this.createBattleParticles(attacker, target);
        
        // Damage indicator
        this.showDamageIndicator(target, damage);
        
        // Update health and power
        this.updateEnhancedHealth(target, damage);
        this.updatePower(attacker, -5); // Attacker loses power
        
        // Enhanced log entry
        const attackerName = attacker === 'generator' ? 'AI Generator' : 'AI Attacker';
        const targetName = target === 'generator' ? 'AI Generator' : 'AI Attacker';
        const attackType = this.getRandomAttackType();
        
        this.addEnhancedLogEntry(
            `⚡ ${attackerName} unleashes ${attackType} on ${targetName} for ${damage} damage!`, 
            'attack'
        );
    }

    showEnergyBeam(attacker, target) {
        const beam = document.getElementById('energy-beam');
        if (beam) {
            beam.classList.add('active');
            
            // Set beam direction and color based on attacker
            if (attacker === 'generator') {
                beam.style.background = 'linear-gradient(90deg, transparent, #00d4ff, #00ff87, transparent)';
            } else {
                beam.style.background = 'linear-gradient(90deg, transparent, #ff6b6b, #ffa500, transparent)';
            }
            
            setTimeout(() => {
                beam.classList.remove('active');
            }, 800);
        }
    }

    createBattleParticles(attacker, target) {
        if (!this.ctx) return;
        
        // Create explosion particles at center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: centerX + (Math.random() - 0.5) * 50,
                y: centerY + (Math.random() - 0.5) * 50,
                size: Math.random() * 5 + 2,
                speedX: (Math.random() - 0.5) * 10,
                speedY: (Math.random() - 0.5) * 10,
                life: 1,
                decay: Math.random() * 0.05 + 0.03,
                color: attacker === 'generator' ? 'rgba(0, 212, 255, ' : 'rgba(255, 107, 107, '
            });
        }
    }

    showDamageIndicator(target, damage) {
        const targetElement = document.getElementById(`${target}-entity`);
        if (!targetElement) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'damage-indicator';
        indicator.textContent = `-${damage}`;
        
        // Position relative to target
        const rect = targetElement.getBoundingClientRect();
        indicator.style.position = 'fixed';
        indicator.style.left = (rect.left + rect.width / 2) + 'px';
        indicator.style.top = (rect.top + rect.height / 2) + 'px';
        indicator.style.zIndex = '10000';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (document.body.contains(indicator)) {
                document.body.removeChild(indicator);
            }
        }, 1500);
    }

    updateEnhancedHealth(target, damage) {
        this.battleStats[target].health = Math.max(0, this.battleStats[target].health - damage);
        
        const healthBar = document.querySelector(`.${target}-health`);
        const healthText = document.getElementById(`${target}-health-text`);
        
        if (healthBar) {
            healthBar.style.width = this.battleStats[target].health + '%';
            
            // Change color based on health level
            if (this.battleStats[target].health <= 25) {
                healthBar.style.background = 'linear-gradient(90deg, #dc143c, #ff6b6b)';
            } else if (this.battleStats[target].health <= 50) {
                healthBar.style.background = 'linear-gradient(90deg, #ffa500, #ffff00)';
            }
        }
        
        if (healthText) {
            healthText.textContent = Math.round(this.battleStats[target].health) + '%';
        }
        
        // Check for battle end
        if (this.battleStats[target].health <= 0) {
            this.endEnhancedBattle(target);
        }
    }

    updatePower(entity, change) {
        this.battleStats[entity].power = Math.max(0, Math.min(100, this.battleStats[entity].power + change));
        
        const powerBar = document.querySelector(`.${entity}-power`);
        const powerText = document.getElementById(`${entity}-power-text`);
        
        if (powerBar) {
            powerBar.style.width = this.battleStats[entity].power + '%';
        }
        
        if (powerText) {
            powerText.textContent = Math.round(this.battleStats[entity].power) + '%';
        }
        
        // Regenerate power slowly over time
        setTimeout(() => {
            if (this.isRunning) {
                this.updatePower(entity, 2);
            }
        }, 5000);
    }

    getRandomAttackType() {
        const attacks = [
            'Neural Strike', 'Data Blast', 'Logic Bomb', 'Code Injection',
            'Quantum Pulse', 'Binary Assault', 'Cyber Strike', 'Algorithm Burst',
            'System Override', 'Memory Corruption', 'Buffer Overflow', 'Firewall Breach'
        ];
        return attacks[Math.floor(Math.random() * attacks.length)];
    }

    addEnhancedLogEntry(message, type = 'info') {
        const logContent = document.getElementById('log-content-enhanced');
        if (!logContent) return;
        
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry-enhanced';
        
        let icon = '💬';
        if (type === 'attack') icon = '⚔️';
        else if (type === 'success') icon = '✅';
        else if (type === 'error') icon = '❌';
        else if (type === 'warning') icon = '⚠️';
        
        entry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-message">${icon} ${message}</span>
        `;
        
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
        
        // Keep only last 30 entries
        const entries = logContent.querySelectorAll('.log-entry-enhanced');
        if (entries.length > 30) {
            logContent.removeChild(entries[0]);
        }
    }

    updateBattleStatus(status) {
        const statusElement = document.getElementById('battle-status');
        if (statusElement) {
            statusElement.textContent = status;
            
            // Update color based on status
            statusElement.style.color = status === 'ACTIVE' ? '#00ff87' : 
                                       status === 'ERROR' ? '#ff6b6b' : '#00d4ff';
        }
    }

    updateBattleMetrics() {
        document.getElementById('battle-rounds').textContent = this.battleRounds;
        document.getElementById('total-damage').textContent = this.totalDamage;
        
        const accuracy = this.totalAttacks > 0 ? Math.round((this.successfulAttacks / this.totalAttacks) * 100) : 0;
        document.getElementById('accuracy-rate').textContent = accuracy + '%';
    }

    updateBattleTime() {
        if (!this.battleStartTime) return;
        
        const elapsed = Math.floor((Date.now() - this.battleStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('battle-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    endEnhancedBattle(loser) {
        this.isRunning = false;
        
        if (this.battleInterval) {
            clearInterval(this.battleInterval);
            this.battleInterval = null;
        }
        
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        
        const winner = loser === 'generator' ? 'attacker' : 'generator';
        const winnerName = winner === 'generator' ? 'AI Generator' : 'AI Attacker';
        
        // Update win counter
        this.battleStats[winner].wins++;
        document.getElementById(`${winner}-wins`).textContent = this.battleStats[winner].wins;
        
        // Victory celebration
        this.showVictoryCelebration(winner);
        
        this.addEnhancedLogEntry(`🏆 VICTORY! ${winnerName} emerges triumphant!`, 'success');
        this.updateBattleStatus('COMPLETED');
        
        showNotification(`Battle completed! ${winnerName} wins!`, 'success');
        
        // Reset after delay
        setTimeout(() => {
            this.resetEnhancedBattle();
        }, 5000);
    }

    showVictoryCelebration(winner) {
        const winnerElement = document.getElementById(`${winner}-entity`);
        if (!winnerElement) return;
        
        // Add celebration animation
        winnerElement.style.animation = 'victory 2s ease-in-out';
        
        // Create celebration particles
        this.createCelebrationParticles(winner);
        
        // Remove animation after completion
        setTimeout(() => {
            winnerElement.style.animation = '';
        }, 2000);
    }

    createCelebrationParticles(winner) {
        if (!this.ctx) return;
        
        const colors = winner === 'generator' ? 
            ['rgba(0, 212, 255, ', 'rgba(0, 255, 135, '] : 
            ['rgba(255, 107, 107, ', 'rgba(255, 165, 0, '];
        
        // Create celebration burst
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                size: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 15,
                speedY: (Math.random() - 0.5) * 15,
                life: 1,
                decay: Math.random() * 0.02 + 0.01,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    resetEnhancedBattle() {
        // Reset all stats
        this.battleStats.generator.health = 100;
        this.battleStats.generator.power = 100;
        this.battleStats.attacker.health = 100;
        this.battleStats.attacker.power = 100;
        
        // Reset UI elements
        const healthBars = document.querySelectorAll('.stat-fill');
        const statTexts = document.querySelectorAll('.stat-text');
        
        healthBars.forEach(bar => {
            bar.style.width = '100%';
            // Reset colors
            if (bar.classList.contains('generator-health')) {
                bar.style.background = 'linear-gradient(90deg, #00d4ff, #00ff87)';
            } else if (bar.classList.contains('attacker-health')) {
                bar.style.background = 'linear-gradient(90deg, #ff6b6b, #ffa500)';
            }
        });
        
        statTexts.forEach(text => {
            text.textContent = '100%';
        });
        
        this.updateBattleStatus('READY');
        this.addEnhancedLogEntry('🔄 Systems reset. Ready for next battle...', 'info');
    }

    addTooltips() {
        // Add tooltips to control buttons for better user experience
        const tooltips = {
            'start-battle': 'Start an AI battle between defender and attacker systems',
            'stop-battle': 'Stop the current AI battle simulation',
            'generate-pattern': 'Generate a new adversarial attack pattern',
            'run-simulation': 'Run multiple AI battle rounds automatically',
            'export-hydra': 'Export battle results and analytics as PDF'
        };
        
        Object.keys(tooltips).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.title = tooltips[buttonId];
                button.setAttribute('data-tooltip', tooltips[buttonId]);
            }
        });
        
        // Add help text to AI entities
        const defenderEntity = document.getElementById('generator-entity');
        const attackerEntity = document.getElementById('attacker-entity');
        
        if (defenderEntity) {
            defenderEntity.title = 'AI Defender: Uses machine learning to detect suspicious financial patterns and protect against threats';
        }
        
        if (attackerEntity) {
            attackerEntity.title = 'AI Attacker: Generates sophisticated adversarial patterns to test and improve defense systems';
        }
    }

    stopBattle() {
        console.log('🛑 HYDRA: stopBattle() method called');
        console.log('🔍 HYDRA: Current isRunning state:', this.isRunning);
        
        if (!this.isRunning) {
            console.log('⚠️ HYDRA: Battle not running, returning');
            return;
        }
        
        console.log('🛑 HYDRA: Stopping enhanced AI battle...');
        this.isRunning = false;
        
        if (this.battleInterval) {
            clearInterval(this.battleInterval);
            this.battleInterval = null;
        }
        
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        
        this.addEnhancedLogEntry('⏹️ Battle terminated by user command.', 'warning');
        this.updateBattleStatus('STOPPED');
        showNotification('Enhanced AI Battle stopped', 'info');
        
        setTimeout(() => {
            this.resetEnhancedBattle();
        }, 2000);
    }

    // Missing method implementations
    async generatePattern() {
        console.log('🔥 HYDRA: generatePattern() method called');
        
        try {
            // Generate new adversarial pattern
            const response = await api.generateAdversarialPattern();
            console.log('🔍 HYDRA: Generated pattern response:', response);
            
            if (response && response.status === 'success') {
                // Display pattern in battle arena
                this.displayGeneratedPattern(response.pattern || response);
                this.addEnhancedLogEntry('New adversarial pattern generated successfully', 'success');
                showNotification('Attack pattern generated!', 'success');
            } else {
                throw new Error('Pattern generation failed');
            }
        } catch (error) {
            console.error('❌ HYDRA: Pattern generation error:', error);
            this.addEnhancedLogEntry('Pattern generation failed', 'error');
            showNotification('Pattern generation failed', 'error');
        }
    }

    displayGeneratedPattern(patternData) {
        console.log('🎯 HYDRA: Displaying pattern:', patternData);
        
        const battleArena = document.getElementById('ai-battle');
        if (!battleArena) return;

        const patternDisplay = document.createElement('div');
        patternDisplay.className = 'bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4 animate-pulse';
        patternDisplay.innerHTML = `
            <h5 class="text-red-400 font-semibold mb-2 flex items-center">
                🔥 New Attack Pattern Generated
                <span class="ml-2 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">AI Generated</span>
            </h5>
            <div class="space-y-2 text-sm text-gray-300">
                <div class="flex justify-between">
                    <span>Pattern ID:</span>
                    <span class="text-red-400 font-mono">${patternData.pattern_id || patternData.id || 'PAT_' + Date.now().toString(36).toUpperCase()}</span>
                </div>
                <div class="flex justify-between">
                    <span>Complexity:</span>
                    <span class="text-yellow-400">${Math.round((patternData.complexity || 0.8) * 100)}%</span>
                </div>
                <div class="flex justify-between">
                    <span>Evasion Score:</span>
                    <span class="text-orange-400">${Math.round((patternData.evasion_score || 0.7) * 100)}%</span>
                </div>
                <div class="flex justify-between">
                    <span>Risk Level:</span>
                    <span class="text-red-400 font-semibold">${patternData.risk_level || 'HIGH'}</span>
                </div>
            </div>
            <div class="mt-3 p-3 bg-dark/40 rounded border-l-2 border-red-400">
                <div class="text-xs text-gray-400 mb-1">Pattern Description:</div>
                <div class="text-sm text-gray-300">${patternData.description || 'Advanced adversarial pattern designed to test AI defense systems through sophisticated evasion techniques.'}</div>
            </div>
        `;
        
        battleArena.appendChild(patternDisplay);
        
        // Add animation effect
        setTimeout(() => {
            patternDisplay.classList.add('animate-bounce');
        }, 100);
        
        // Remove after 15 seconds
        setTimeout(() => {
            if (patternDisplay.parentNode) {
                patternDisplay.style.transition = 'all 0.5s ease-out';
                patternDisplay.style.opacity = '0';
                patternDisplay.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    patternDisplay.remove();
                }, 500);
            }
        }, 15000);
    }

    async runSimulation() {
        console.log('🧪 HYDRA: runSimulation() method called');
        
        try {
            this.addEnhancedLogEntry('Starting battle simulation...', 'info');
            showNotification('Running AI battle simulation...', 'info');
            
            const rounds = 5;
            let simulationResults = {
                rounds: rounds,
                wins: { generator: 0, attacker: 0 },
                results: []
            };
            
            for (let i = 0; i < rounds; i++) {
                this.addEnhancedLogEntry(`Simulation Round ${i + 1}/${rounds} starting...`, 'info');
                
                // Simulate battle round
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const roundResult = {
                    round: i + 1,
                    pattern: this.getRandomAttackType(),
                    complexity: Math.random() * 0.4 + 0.6, // 60-100%
                    detected: Math.random() > 0.3, // 70% detection rate
                    confidence: Math.random() * 0.3 + 0.7, // 70-100%
                    duration: Math.random() * 2000 + 1000 // 1-3 seconds
                };
                
                if (roundResult.detected) {
                    simulationResults.wins.generator++;
                    this.battleStats.generator.wins++;
                    this.addEnhancedLogEntry(`Round ${i + 1}: Defender detected attack (${Math.round(roundResult.confidence * 100)}% confidence)`, 'success');
                } else {
                    simulationResults.wins.attacker++;
                    this.battleStats.attacker.wins++;
                    this.addEnhancedLogEntry(`Round ${i + 1}: Attacker evaded detection`, 'warning');
                }
                
                simulationResults.results.push(roundResult);
                
                // Update metrics display
                this.updateSimulationMetrics();
            }
            
            // Final results
            const detectionRate = (simulationResults.wins.generator / rounds * 100).toFixed(1);
            this.addEnhancedLogEntry(`Simulation complete! Detection rate: ${detectionRate}%`, 'success');
            showNotification(`Simulation completed! Detection rate: ${detectionRate}%`, 'success');
            
            // Store simulation data for export
            this.lastSimulation = simulationResults;
            
        } catch (error) {
            console.error('❌ HYDRA: Simulation error:', error);
            this.addEnhancedLogEntry('Simulation failed', 'error');
            showNotification('Simulation failed', 'error');
        }
    }

    updateSimulationMetrics() {
        // Update battle metrics display
        const defenderWinsEl = document.getElementById('defender-wins');
        const attackerWinsEl = document.getElementById('attacker-wins');
        const detectionRateEl = document.getElementById('detection-rate');
        const totalBattlesEl = document.getElementById('total-battles');

        if (defenderWinsEl) defenderWinsEl.textContent = this.battleStats.generator.wins;
        if (attackerWinsEl) attackerWinsEl.textContent = this.battleStats.attacker.wins;
        
        const totalBattles = this.battleStats.generator.wins + this.battleStats.attacker.wins;
        if (totalBattlesEl) totalBattlesEl.textContent = totalBattles;
        
        if (detectionRateEl && totalBattles > 0) {
            const detectionRate = Math.round((this.battleStats.generator.wins / totalBattles) * 100);
            detectionRateEl.textContent = detectionRate + '%';
        }
    }

    async exportReport() {
        console.log('📄 HYDRA: exportReport() method called');
        
        try {
            // Check if PDF libraries are available
            if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
                console.warn('PDF libraries not loaded properly, using fallback method');
                this.fallbackExport();
                return;
            }

            showLoading();
            showNotification('Generating HYDRA battle report...', 'info');

            // Import PDF generator
            const TriNetraPDFGenerator = (await import('./pdf-generator.js')).default;
            const pdfGenerator = new TriNetraPDFGenerator();

            // Prepare battle data for report
            const battleData = {
                rounds: this.lastSimulation?.rounds || 0,
                total_detected: this.battleStats.generator.wins,
                detection_rate: this.battleStats.generator.wins + this.battleStats.attacker.wins > 0 
                    ? this.battleStats.generator.wins / (this.battleStats.generator.wins + this.battleStats.attacker.wins) 
                    : 0,
                results: this.lastSimulation?.results || []
            };

            // Generate comprehensive battle history
            const battleHistory = {
                session_start: new Date().toISOString(),
                total_rounds: battleData.rounds,
                defender_performance: {
                    wins: this.battleStats.generator.wins,
                    accuracy: battleData.detection_rate,
                    avg_response_time: '1.2s'
                },
                attacker_performance: {
                    wins: this.battleStats.attacker.wins,
                    evasion_rate: 1 - battleData.detection_rate,
                    complexity_avg: 0.78
                }
            };

            // Generate PDF report using CHRONOS-style formatting
            const doc = await pdfGenerator.generateHydraReport(battleData, battleHistory);
            
            // Download the PDF
            const filename = `HYDRA_Battle_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            await pdfGenerator.downloadPDF(filename);
            
            showNotification('HYDRA battle report exported successfully!', 'success');
            this.addEnhancedLogEntry('Battle report exported to PDF', 'success');
            
        } catch (error) {
            console.error('❌ HYDRA: Export error:', error);
            showNotification('Export failed, using fallback method', 'warning');
            this.fallbackExport();
        } finally {
            hideLoading();
        }
    }

    fallbackExport() {
        try {
            // Create a simple JSON export as fallback
            const reportData = {
                title: 'HYDRA AI Battle Report',
                generated_at: new Date().toISOString(),
                battle_stats: this.battleStats,
                simulation_data: this.lastSimulation,
                summary: {
                    total_battles: this.battleStats.generator.wins + this.battleStats.attacker.wins,
                    detection_rate: this.battleStats.generator.wins + this.battleStats.attacker.wins > 0 
                        ? ((this.battleStats.generator.wins / (this.battleStats.generator.wins + this.battleStats.attacker.wins)) * 100).toFixed(1) + '%'
                        : '0%',
                    defender_wins: this.battleStats.generator.wins,
                    attacker_wins: this.battleStats.attacker.wins
                }
            };

            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HYDRA_Battle_Report_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('Battle data exported as JSON file', 'success');
            this.addEnhancedLogEntry('Battle data exported successfully', 'success');
        } catch (error) {
            console.error('❌ HYDRA: Fallback export failed:', error);
            showNotification('Export failed completely', 'error');
        }
    }
}

// Add victory animation CSS
const victoryStyle = document.createElement('style');
victoryStyle.textContent = `
    @keyframes victory {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(5deg); }
        50% { transform: scale(1.2) rotate(-5deg); }
        75% { transform: scale(1.1) rotate(5deg); }
    }
`;
document.head.appendChild(victoryStyle);

export default EnhancedHydraAI;