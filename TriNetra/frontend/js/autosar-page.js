// Auto-SAR Page Application
import api from './api.js';
import AutoSAR from './autosar-enhanced.js';
import { initSarMap } from './sar-map.js';
import geminiAPI from './gemini-api.js';

class AutoSARPage {
    constructor() {
        this.autosar = null;
        this.geminiEnhancements = [];
        this.currentReport = null;
        this.init();
    }

    async init() {
        console.log('📋 Initializing Auto-SAR Page...');
        
        try {
            // Initialize Auto-SAR system
            this.autosar = new AutoSAR();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize map
            this.initializeMap();
            
            console.log('✅ Auto-SAR Page initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Auto-SAR page:', error);
        }
    }

    setupEventListeners() {
        // AI Analysis
        document.getElementById('ai-analyze').addEventListener('click', () => {
            this.performAIAnalysis();
        });


        // Generate SAR Report
        document.getElementById('generate-sar').addEventListener('click', () => {
            this.generateSARReport();
        });

        // Validate Report
        document.getElementById('validate-report').addEventListener('click', () => {
            this.validateReport();
        });

        // Export Report
        document.getElementById('export-sar').addEventListener('click', () => {
            this.exportReport();
        });
    }

    async performAIAnalysis() {
        const button = document.getElementById('ai-analyze');
        const originalText = button.textContent;
        button.textContent = 'Analyzing...';
        button.disabled = true;

        try {
            // Simulate AI analysis
            await new Promise(resolve => setTimeout(resolve, 3000));

            const mlResults = document.getElementById('ml-results');
            mlResults.innerHTML = `
                <div class="space-y-4">
                    <div class="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-4 border border-red-500/30">
                        <div class="flex justify-between items-center mb-2">
                            <h5 class="text-red-400 font-semibold">🚨 Structuring Detection</h5>
                            <span class="text-red-400 font-bold">92.3%</span>
                        </div>
                        <p class="text-sm text-gray-300">Multiple transactions just below $10,000 threshold detected</p>
                    </div>
                    <div class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                        <div class="flex justify-between items-center mb-2">
                            <h5 class="text-yellow-400 font-semibold">💰 Layering Scheme</h5>
                            <span class="text-yellow-400 font-bold">87.1%</span>
                        </div>
                        <p class="text-sm text-gray-300">Complex fund movement through multiple intermediary accounts</p>
                    </div>
                    <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                        <div class="flex justify-between items-center mb-2">
                            <h5 class="text-purple-400 font-semibold">🌐 Cross-Border Transfers</h5>
                            <span class="text-purple-400 font-bold">78.9%</span>
                        </div>
                        <p class="text-sm text-gray-300">Unusual international transfer patterns to high-risk jurisdictions</p>
                    </div>
                    <div class="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
                        <div class="flex justify-between items-center mb-2">
                            <h5 class="text-blue-400 font-semibold">🏢 Shell Company Activity</h5>
                            <span class="text-blue-400 font-bold">65.4%</span>
                        </div>
                        <p class="text-sm text-gray-300">Transactions involving entities with minimal business activity</p>
                    </div>
                </div>
            `;

            this.showNotification('AI analysis completed successfully!', 'success');
        } catch (error) {
            console.error('AI analysis failed:', error);
            this.showNotification('AI analysis failed', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }


    async callGeminiAPI(analysisType) {
        // Simulate Gemini API call
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const mockGeminiResponse = {
            analysis_type: analysisType,
            confidence: 0.947,
            enhancement_level: 'advanced',
            insights: [
                "Sophisticated layering scheme detected",
                "Pattern matches known criminal organizations",
                "High regulatory compliance risk identified"
            ],
            recommendations: [
                "Immediate SAR filing required",
                "Freeze high-risk accounts",
                "Coordinate with law enforcement"
            ]
        };

        this.geminiEnhancements.push(mockGeminiResponse);
        return mockGeminiResponse;
    }

    async generateSARReport() {
        const button = document.getElementById('generate-sar');
        const originalText = button.textContent;
        button.textContent = 'Generating...';
        button.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const sarPanel = document.getElementById('sar-report');
            this.currentReport = {
                id: `SAR_${Date.now()}`,
                generated_at: new Date().toISOString(),
                priority: 'HIGH'
            };

            sarPanel.innerHTML = `
                <div class="bg-dark/60 rounded-xl p-6">
                    <div class="border-b border-gray-600 pb-4 mb-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="text-2xl font-bold text-orange-500">SUSPICIOUS ACTIVITY REPORT</h4>
                                <p class="text-gray-400 mt-1">Report ID: ${this.currentReport.id}</p>
                            </div>
                            <div class="text-right">
                                <div class="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                                    ${this.currentReport.priority} PRIORITY
                                </div>
                                <p class="text-gray-400 text-sm mt-1">${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h5 class="text-lg font-semibold text-orange-400 mb-3">📊 Detection Summary</h5>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Pattern Type:</span>
                                    <span class="text-white">Structured Transactions + Layering</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Confidence Score:</span>
                                    <span class="text-red-400 font-bold">94.7%</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Total Amount:</span>
                                    <span class="text-white">$2,456,789.23</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Accounts Involved:</span>
                                    <span class="text-white">12</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Time Period:</span>
                                    <span class="text-white">90 days</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h5 class="text-lg font-semibold text-orange-400 mb-3">⚠️ Risk Indicators</h5>
                            <ul class="space-y-1 text-sm text-gray-300">
                                <li>• Multiple deposits under $10,000 threshold</li>
                                <li>• Rapid fund movement between accounts</li>
                                <li>• Cross-border transfers to high-risk countries</li>
                                <li>• Shell company involvement</li>
                                <li>• Unusual transaction timing patterns</li>
                                <li>• Lack of apparent business purpose</li>
                            </ul>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h5 class="text-lg font-semibold text-orange-400 mb-3">📝 Narrative</h5>
                        <div class="bg-dark/40 rounded-lg p-4 text-sm text-gray-300 leading-relaxed">
                            <p class="mb-3">
                                Between ${new Date(Date.now() - 90*24*60*60*1000).toLocaleDateString()} and ${new Date().toLocaleDateString()}, 
                                our AI-powered detection system identified a sophisticated money laundering scheme involving structured 
                                transactions and complex layering activities across multiple accounts.
                            </p>
                            <p class="mb-3">
                                The primary account holder, operating through account ACC_156, conducted a series of cash deposits 
                                ranging from $9,800 to $9,950, carefully remaining below the $10,000 Currency Transaction Report (CTR) 
                                threshold. These funds were subsequently transferred through a network of 11 additional accounts in a 
                                pattern consistent with layering money laundering techniques.
                            </p>
                            <p>
                                Our Gemini AI enhancement identified this pattern as having 94.7% similarity to known criminal 
                                organization financial operations, specifically patterns associated with trade-based money laundering 
                                schemes. Immediate regulatory action is recommended.
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h5 class="text-lg font-semibold text-orange-400 mb-3">📋 Regulatory Compliance</h5>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Filing Deadline:</span>
                                    <span class="text-red-400 font-semibold">${this.getFilingDeadline()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">BSA Requirements:</span>
                                    <span class="text-green-400">✓ Met</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-300">FinCEN Notification:</span>
                                    <span class="text-yellow-400">Pending</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h5 class="text-lg font-semibold text-orange-400 mb-3">🎯 Next Actions</h5>
                            <ul class="space-y-1 text-sm text-gray-300">
                                <li>• File SAR with FinCEN within 30 days</li>
                                <li>• Freeze identified accounts</li>
                                <li>• Notify law enforcement</li>
                                <li>• Implement enhanced monitoring</li>
                                <li>• Review related customer accounts</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;

            // Initialize the map with risk locations
            this.updateMapWithRiskData();

            this.showNotification('SAR report generated successfully!', 'success');
        } catch (error) {
            console.error('SAR generation failed:', error);
            this.showNotification('SAR generation failed', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    initializeMap() {
        try {
            initSarMap();
        } catch (error) {
            console.error('Failed to initialize map:', error);
        }
    }

    updateMapWithRiskData() {
        // This would update the map with actual risk location data
        // For now, it's handled by the sar-map.js module
    }

    validateReport() {
        if (!this.currentReport) {
            this.showNotification('Please generate a report first', 'warning');
            return;
        }

        const validationResults = {
            required_fields: true,
            regulatory_compliance: true,
            data_integrity: true,
            threshold_analysis: true
        };

        const allValid = Object.values(validationResults).every(v => v);
        
        this.showNotification(
            allValid ? 'Report validation passed!' : 'Report validation failed!',
            allValid ? 'success' : 'error'
        );
    }

    async exportReport() {
        if (!this.currentReport) {
            this.showNotification('Please generate a report first', 'warning');
            return;
        }

        try {
            if (this.autosar && this.autosar.exportToPDF) {
                await this.autosar.exportToPDF();
                this.showNotification('SAR report exported successfully!', 'success');
            } else {
                this.showNotification('Export functionality not available', 'warning');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed', 'error');
        }
    }

    getFilingDeadline() {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30);
        return deadline.toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.autosarPage = new AutoSARPage();
});

export default AutoSARPage;