// HYDRA AI Red-Team Module
import api from './api.js';
import { showLoading, hideLoading, showNotification, formatPercentage, animateCounter } from './utils.js';
import TriNetraPDFGenerator from './pdf-generator.js';

class HydraAI {
    constructor() {
        this.isRunning = false;
        this.currentSimulation = null;
        this.detectionHistory = [];
        
        this.setupEventListeners();
        this.initializeDashboard();
    }

    setupEventListeners() {
        const generateButton = document.getElementById('generate-pattern');
        const simulationButton = document.getElementById('run-simulation');
        const exportButton = document.getElementById('export-hydra');

        if (generateButton) {
            generateButton.addEventListener('click', () => this.generatePattern());
        }

        if (simulationButton) {
            simulationButton.addEventListener('click', () => this.runSimulation());
        }
        
        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportReport());
        }
    }

    initializeDashboard() {
        this.setupBattleVisualization();
        this.setupMetricsDisplay();
    }

    setupBattleVisualization() {
        const battleContainer = document.getElementById('ai-battle');
        if (!battleContainer) return;

        battleContainer.innerHTML = `
            <h4>AI vs AI Battle Arena</h4>
            <div class="battle-visualization">
                <div class="ai-entity ai-generator" title="HYDRA Generator - Creates new attack patterns">
                    <div class="ai-icon">🔥</div>
                    <small>Generator</small>
                    <div class="ai-stats">
                        <div class="stat-item">Patterns: <span id="gen-patterns">0</span></div>
                        <div class="stat-item">Success: <span id="gen-success">0%</span></div>
                    </div>
                </div>
                <div class="battle-line">
                    <div class="battle-spark" id="battle-spark"></div>
                </div>
                <div class="ai-entity ai-detector" title="HYDRA Detector - Analyzes and catches attacks">
                    <div class="ai-icon">🛡️</div>
                    <small>Detector</small>
                    <div class="ai-stats">
                        <div class="stat-item">Analyzed: <span id="det-analyzed">0</span></div>
                        <div class="stat-item">Accuracy: <span id="det-accuracy">0%</span></div>
                    </div>
                </div>
            </div>
            <div class="battle-status">
                <p id="battle-status-text">💡 Click "Generate Attack" to see AI vs AI in action!</p>
                <div class="battle-explanation">
                    <p><strong>How HYDRA Works:</strong></p>
                    <ul>
                        <li>🔥 Generator creates sophisticated money laundering patterns</li>
                        <li>🛡️ Detector tries to identify and stop these patterns</li>
                        <li>⚔️ Both AIs learn and improve from each battle</li>
                        <li>📊 System evolves to catch future criminal techniques</li>
                    </ul>
                </div>
            </div>
        `;
    }

    setupMetricsDisplay() {
        const metricsContainer = document.getElementById('detection-metrics');
        if (!metricsContainer) return;

        metricsContainer.innerHTML = `
            <h4>Detection Metrics</h4>
            <div class="metric-item">
                <span class="metric-label">Detection Rate</span>
                <span class="metric-value" id="detection-rate">--</span>
                <div class="metric-bar">
                    <div class="metric-fill" id="detection-rate-bar" style="width: 0%"></div>
                </div>
            </div>
            <div class="metric-item">
                <span class="metric-label">Patterns Generated</span>
                <span class="metric-value" id="patterns-generated">0</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Avg Complexity</span>
                <span class="metric-value" id="avg-complexity">--</span>
                <div class="metric-bar">
                    <div class="metric-fill" id="complexity-bar" style="width: 0%"></div>
                </div>
            </div>
            <div class="metric-item">
                <span class="metric-label">Last Pattern</span>
                <span class="metric-value" id="last-pattern">None</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Battle Results</span>
                <div id="battle-results" class="battle-results"></div>
            </div>
        `;
    }

    async generatePattern() {
        if (this.isRunning) return;

        try {
            this.isRunning = true;
            showLoading();
            
            // Step 1: Generator creates pattern
            this.updateBattleStatus('🔥 Generator: Analyzing financial networks...');
            this.animateAIEntity('generator', 'thinking');
            await this.delay(800);
            
            this.updateBattleStatus('🔥 Generator: Creating sophisticated attack pattern...');
            this.animateAIEntity('generator', 'attacking');
            
            const response = await api.generateAdversarialPattern();
            
            if (response.status === 'success') {
                const pattern = response.pattern;
                
                // Show pattern details
                this.showPatternDetails(pattern);
                
                await this.delay(1000);
                
                // Step 2: Detector analyzes
                this.updateBattleStatus('🛡️ Detector: Scanning for suspicious patterns...');
                this.animateAIEntity('detector', 'thinking');
                this.activateBattleSpark();
                
                await this.delay(1200);
                
                this.updateBattleStatus('🛡️ Detector: Running deep analysis algorithms...');
                
                const detectionResponse = await api.testDetection(pattern);
                
                if (detectionResponse.status === 'success') {
                    const detection = detectionResponse.detection;
                    
                    // Step 3: Battle result
                    this.animateAIEntity('detector', detection.detected ? 'defending' : 'failing');
                    
                    await this.delay(500);
                    
                    // Update all metrics and stats
                    this.updateMetrics(pattern, detection);
                    this.updateBattleStats(pattern, detection);
                    this.showBattleResult(pattern, detection);
                    
                    const resultMessage = detection.detected 
                        ? `🛡️ DETECTED! Confidence: ${formatPercentage(detection.confidence)}`
                        : `🔥 EVADED! Only ${formatPercentage(detection.confidence)} confidence`;
                    
                    this.updateBattleStatus(resultMessage);
                    
                    showNotification(
                        `${detection.detected ? 'Attack blocked' : 'Attack succeeded'} - ${formatPercentage(detection.confidence)} confidence`,
                        detection.detected ? 'success' : 'warning'
                    );
                }
            } else {
                throw new Error(response.message || 'Failed to generate pattern');
            }
        } catch (error) {
            console.error('HYDRA battle failed:', error);
            this.updateBattleStatus('❌ Battle failed - System error');
            showNotification('HYDRA battle failed', 'error');
        } finally {
            this.isRunning = false;
            hideLoading();
        }
    }

    showPatternDetails(pattern) {
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'pattern-details-popup';
        detailsDiv.innerHTML = `
            <div class="pattern-popup-content">
                <h5>🔥 Generated Attack Pattern</h5>
                <p><strong>Type:</strong> ${pattern.pattern_type}</p>
                <p><strong>Complexity:</strong> ${formatPercentage(pattern.complexity_score)}</p>
                <p><strong>Transactions:</strong> ${pattern.transactions.length}</p>
                <p><strong>Strategy:</strong> ${this.getPatternDescription(pattern.pattern_type)}</p>
            </div>
        `;
        
        detailsDiv.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: var(--bg-card);
            border: 2px solid var(--accent-green);
            border-radius: 8px;
            padding: 1rem;
            max-width: 300px;
            z-index: 100;
            animation: slideIn 0.5s ease-out;
        `;
        
        const battleContainer = document.getElementById('ai-battle');
        if (battleContainer) {
            battleContainer.style.position = 'relative';
            battleContainer.appendChild(detailsDiv);
            
            // Remove after 4 seconds
            setTimeout(() => {
                if (detailsDiv.parentNode) {
                    detailsDiv.style.animation = 'slideOut 0.5s ease-in forwards';
                    setTimeout(() => detailsDiv.remove(), 500);
                }
            }, 4000);
        }
    }

    getPatternDescription(patternType) {
        const descriptions = {
            'smurfing_enhanced': 'Breaking large amounts into small transactions across multiple accounts',
            'layering_complex': 'Multiple transfers through shell companies to obscure origin',
            'integration_hidden': 'Mixing illicit funds with legitimate business transactions',
            'shell_company_web_v2': 'Complex network of fake companies for money movement'
        };
        return descriptions[patternType] || 'Advanced money laundering technique';
    }

    updateBattleStats(pattern, detection) {
        // Update generator stats
        const genPatterns = document.getElementById('gen-patterns');
        const genSuccess = document.getElementById('gen-success');
        
        if (genPatterns) {
            const current = parseInt(genPatterns.textContent) || 0;
            genPatterns.textContent = current + 1;
        }
        
        // Update success rate (patterns that evaded detection)
        if (genSuccess) {
            const successCount = this.detectionHistory.filter(h => !h.detection.detected).length;
            const totalCount = this.detectionHistory.length;
            genSuccess.textContent = totalCount > 0 ? formatPercentage(successCount / totalCount) : '0%';
        }
        
        // Update detector stats
        const detAnalyzed = document.getElementById('det-analyzed');
        const detAccuracy = document.getElementById('det-accuracy');
        
        if (detAnalyzed) {
            detAnalyzed.textContent = this.detectionHistory.length;
        }
        
        if (detAccuracy) {
            const detectedCount = this.detectionHistory.filter(h => h.detection.detected).length;
            const totalCount = this.detectionHistory.length;
            detAccuracy.textContent = totalCount > 0 ? formatPercentage(detectedCount / totalCount) : '0%';
        }
    }

    activateBattleSpark() {
        const spark = document.getElementById('battle-spark');
        if (spark) {
            spark.style.opacity = '1';
            spark.style.animation = 'battleSpark 0.5s ease-in-out infinite';
            
            setTimeout(() => {
                spark.style.opacity = '0.3';
                spark.style.animation = 'none';
            }, 2000);
        }
    }

    animateAIEntity(entity, action) {
        const entityElement = document.querySelector(`.ai-${entity}`);
        if (!entityElement) return;

        // Remove existing animation classes
        entityElement.classList.remove('attacking', 'defending', 'failing', 'thinking');
        
        // Add new animation class
        entityElement.classList.add(action);
        
        // Remove class after animation
        setTimeout(() => {
            entityElement.classList.remove(action);
        }, 1000);
    }

    async runSimulation(rounds = 10) {
        if (this.isRunning) return;

        try {
            this.isRunning = true;
            showLoading();
            this.updateBattleStatus(`Running ${rounds}-round simulation...`);
            
            const response = await api.runHydraSimulation(rounds);
            
            if (response.status === 'success') {
                const simulation = response.simulation;
                this.currentSimulation = simulation;
                
                // Animate the simulation
                await this.animateSimulation(simulation);
                
                // Update final metrics
                this.updateSimulationMetrics(simulation);
                
                showNotification(
                    `Simulation complete: ${formatPercentage(simulation.detection_rate)} detection rate`,
                    'success'
                );
            } else {
                throw new Error(response.message || 'Simulation failed');
            }
        } catch (error) {
            console.error('Simulation failed:', error);
            showNotification('Simulation failed', 'error');
        } finally {
            this.isRunning = false;
            hideLoading();
        }
    }

    async animateSimulation(simulation) {
        const results = simulation.results;
        let detectedCount = 0;
        
        this.updateBattleStatus('Battle in progress...');
        
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            
            // Update status
            this.updateBattleStatus(`Round ${result.round}: ${result.pattern}`);
            
            // Animate generator
            this.animateAIEntity('generator', 'attacking');
            
            // Wait for animation
            await this.delay(300);
            
            // Animate detector
            this.animateAIEntity('detector', result.detected ? 'defending' : 'failing');
            
            if (result.detected) {
                detectedCount++;
            }
            
            // Update running detection rate
            const currentRate = detectedCount / (i + 1);
            this.updateDetectionRate(currentRate);
            
            // Wait before next round
            await this.delay(200);
        }
        
        this.updateBattleStatus(`Simulation complete! Final detection rate: ${formatPercentage(simulation.detection_rate)}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    animateAIEntity(entity, action) {
        const entityElement = document.querySelector(`.ai-${entity}`);
        if (!entityElement) return;

        // Remove existing animation classes
        entityElement.classList.remove('attacking', 'defending', 'failing');
        
        // Add new animation class
        entityElement.classList.add(action);
        
        // Remove class after animation
        setTimeout(() => {
            entityElement.classList.remove(action);
        }, 1000);
    }

    updateBattleStatus(message) {
        const statusElement = document.getElementById('battle-status-text');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    updateMetrics(pattern, detection) {
        // Update patterns generated
        const patternsElement = document.getElementById('patterns-generated');
        if (patternsElement) {
            const current = parseInt(patternsElement.textContent) || 0;
            animateCounter(patternsElement, current, current + 1);
        }

        // Update last pattern
        const lastPatternElement = document.getElementById('last-pattern');
        if (lastPatternElement) {
            lastPatternElement.textContent = pattern.pattern_type;
        }

        // Update complexity
        const complexityElement = document.getElementById('avg-complexity');
        const complexityBar = document.getElementById('complexity-bar');
        if (complexityElement && complexityBar) {
            const complexity = pattern.complexity_score;
            complexityElement.textContent = formatPercentage(complexity);
            complexityBar.style.width = `${complexity * 100}%`;
        }

        // Store detection result
        this.detectionHistory.push({
            pattern: pattern,
            detection: detection,
            timestamp: new Date()
        });

        // Update detection rate
        const detectedCount = this.detectionHistory.filter(h => h.detection.detected).length;
        const detectionRate = detectedCount / this.detectionHistory.length;
        this.updateDetectionRate(detectionRate);
    }

    updateDetectionRate(rate) {
        const detectionRateElement = document.getElementById('detection-rate');
        const detectionRateBar = document.getElementById('detection-rate-bar');
        
        if (detectionRateElement) {
            detectionRateElement.textContent = formatPercentage(rate);
        }
        
        if (detectionRateBar) {
            detectionRateBar.style.width = `${rate * 100}%`;
            
            // Color based on rate
            if (rate >= 0.8) {
                detectionRateBar.style.background = 'linear-gradient(to right, var(--accent-green), var(--accent-blue))';
            } else if (rate >= 0.6) {
                detectionRateBar.style.background = 'linear-gradient(to right, var(--warning-yellow), var(--accent-green))';
            } else {
                detectionRateBar.style.background = 'linear-gradient(to right, var(--danger-red), var(--warning-yellow))';
            }
        }
    }

    updateSimulationMetrics(simulation) {
        // Update overall detection rate
        this.updateDetectionRate(simulation.detection_rate);

        // Calculate average complexity
        const avgComplexity = simulation.results.reduce((sum, r) => sum + r.complexity, 0) / simulation.results.length;
        const complexityElement = document.getElementById('avg-complexity');
        const complexityBar = document.getElementById('complexity-bar');
        
        if (complexityElement && complexityBar) {
            complexityElement.textContent = formatPercentage(avgComplexity);
            complexityBar.style.width = `${avgComplexity * 100}%`;
        }

        // Update battle results
        this.updateBattleResults(simulation);
    }

    updateBattleResults(simulation) {
        const resultsContainer = document.getElementById('battle-results');
        if (!resultsContainer) return;

        const recentResults = simulation.results.slice(-5); // Show last 5 results
        
        resultsContainer.innerHTML = recentResults.map(result => `
            <div class="battle-result-item ${result.detected ? 'detected' : 'missed'}">
                <span class="result-icon">${result.detected ? '✅' : '❌'}</span>
                <span class="result-pattern">${result.pattern}</span>
                <span class="result-confidence">${formatPercentage(result.confidence)}</span>
            </div>
        `).join('');
    }

    showBattleResult(pattern, detection) {
        const battleContainer = document.getElementById('ai-battle');
        if (!battleContainer) return;

        // Create result notification
        const resultDiv = document.createElement('div');
        resultDiv.className = `battle-result ${detection.detected ? 'victory' : 'defeat'}`;
        resultDiv.innerHTML = `
            <div class="result-text">
                ${detection.detected ? '🛡️ DETECTED!' : '🔥 EVADED!'}<br>
                <small>${pattern.pattern_type} - ${formatPercentage(detection.confidence)}</small>
            </div>
        `;
        
        resultDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${detection.detected ? 'var(--accent-green)' : 'var(--danger-red)'};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            z-index: 10;
            animation: resultPop 4s ease-out forwards;
        `;

        battleContainer.style.position = 'relative';
        battleContainer.appendChild(resultDiv);

        // Remove after animation
        setTimeout(() => {
            if (resultDiv.parentNode) {
                resultDiv.parentNode.removeChild(resultDiv);
            }
        }, 4000);
    }

    reset() {
        this.detectionHistory = [];
        this.currentSimulation = null;
        this.initializeDashboard();
        this.updateBattleStatus('Ready for battle...');
    }
    
    async exportReport() {
        if (!this.currentSimulation && this.detectionHistory.length === 0) {
            showNotification('No simulation data to export. Run a simulation first.', 'warning');
            return;
        }

        try {
            showLoading();
            showNotification('Generating HYDRA PDF report...', 'info');
            
            // Create PDF generator
            const pdfGenerator = new TriNetraPDFGenerator();
            
            // Use current simulation or create summary from detection history
            const simulationData = this.currentSimulation || {
                rounds: this.detectionHistory.length,
                total_detected: this.detectionHistory.filter(h => h.detection.detected).length,
                detection_rate: this.detectionHistory.length > 0 ? 
                    this.detectionHistory.filter(h => h.detection.detected).length / this.detectionHistory.length : 0,
                results: this.detectionHistory.map((h, i) => ({
                    round: i + 1,
                    pattern: h.pattern.pattern_type,
                    complexity: h.pattern.complexity_score,
                    detected: h.detection.detected,
                    confidence: h.detection.confidence
                }))
            };
            
            // Generate HYDRA PDF
            const pdf = await pdfGenerator.generateHydraReport(simulationData, this.detectionHistory);
            
            // Download PDF
            const filename = `HYDRA_Simulation_${new Date().toISOString().split('T')[0]}.pdf`;
            await pdfGenerator.downloadPDF(filename);
            
            showNotification('HYDRA PDF report downloaded successfully', 'success');
        } catch (error) {
            console.error('HYDRA PDF export failed:', error);
            showNotification('Failed to export HYDRA PDF report', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .ai-entity.attacking {
        animation: ai-attack 1s ease-in-out;
    }
    
    .ai-entity.defending {
        animation: ai-defend 1s ease-in-out;
    }
    
    .ai-entity.failing {
        animation: ai-fail 1s ease-in-out;
    }
    
    @keyframes ai-attack {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2) translateX(10px); }
    }
    
    @keyframes ai-defend {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2) translateX(-10px); filter: brightness(1.5); }
    }
    
    @keyframes ai-fail {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.8); opacity: 0.5; }
    }
    
    @keyframes resultPop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        15% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        25% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        85% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    }
    
    .battle-result-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem;
        margin: 0.25rem 0;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    
    .battle-result-item.detected {
        background: rgba(0, 255, 135, 0.2);
        border: 1px solid var(--accent-green);
    }
    
    .battle-result-item.missed {
        background: rgba(255, 71, 87, 0.2);
        border: 1px solid var(--danger-red);
    }
    
    .battle-status {
        margin-top: 1rem;
        text-align: center;
        color: var(--text-gray);
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);

// Export the class
export default HydraAI;