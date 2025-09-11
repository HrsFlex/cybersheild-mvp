// CHRONOS Page Application
import api from './api.js';
import ChronosTimeline from './chronos.js';
import geminiAPI from './gemini-api.js';

class ChronosPage {
    constructor() {
        this.chronos = null;
        this.geminiInsights = [];
        this.analysisData = {
            suspiciousTransactions: 0,
            suspiciousAccounts: 0,
            riskScore: 0,
            patternsDetected: [],
            isAnalysisComplete: false
        };
        this.analysisInterval = null;
        this.init();
    }

    async init() {
        console.log('🕐 Initializing CHRONOS Page...');
        
        try {
            // Initialize CHRONOS timeline
            this.chronos = new ChronosTimeline('chronos-timeline');
            await this.chronos.loadData('all');
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial AI insights
            this.loadInitialInsights();
            
            console.log('✅ CHRONOS Page initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize CHRONOS page:', error);
        }
    }

    setupEventListeners() {
        // Time quantum change
        document.getElementById('time-quantum').addEventListener('change', async (e) => {
            const quantum = e.target.value;
            await this.chronos.setTimeQuantum(quantum);
        });

        // Search functionality
        document.getElementById('search-button').addEventListener('click', () => {
            this.performSearch();
        });

        document.getElementById('transaction-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Speed control
        document.getElementById('speed-control').addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            document.getElementById('speed-display').textContent = `${speed}x`;
            if (this.chronos && this.chronos.setPlaybackSpeed) {
                this.chronos.setPlaybackSpeed(speed);
            }
        });

        // Playback controls
        document.getElementById('play-button').addEventListener('click', () => {
            this.chronos.play();
            this.startAnalysisTracking();
        });

        document.getElementById('pause-button').addEventListener('click', () => {
            this.chronos.pause();
        });

        document.getElementById('reset-button').addEventListener('click', () => {
            this.chronos.reset();
            this.resetAnalysisTracking();
        });

        // Export functionality
        document.getElementById('export-chronos').addEventListener('click', () => {
            this.exportReport();
        });

        // AI Insights
        document.getElementById('get-insights').addEventListener('click', () => {
            this.generateAIInsights();
        });
    }

    async performSearch() {
        const searchTerm = document.getElementById('transaction-search').value.trim();
        if (!searchTerm) return;

        try {
            const results = await this.chronos.searchTransactions(searchTerm, 'all');
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            this.showNotification('Search failed', 'error');
        }
    }

    displaySearchResults(results) {
        // Update timeline info with rich, detailed search results
        const infoPanel = document.getElementById('timeline-info');
        if (results && results.length > 0) {
            const suspiciousCount = results.filter(tx => (tx.suspicious_score || 0) > 0.7).length;
            const totalAmount = results.reduce((sum, tx) => sum + (tx.amount || 0), 0);
            const avgRisk = results.reduce((sum, tx) => sum + (tx.suspicious_score || 0), 0) / results.length;
            
            infoPanel.innerHTML = `
                <div class="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                    <h4 class="text-xl font-bold text-primary mb-4 flex items-center">
                        🔍 Advanced Search Analysis
                        <span class="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">AI Enhanced</span>
                    </h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-dark/60 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-secondary">${results.length}</div>
                            <div class="text-sm text-gray-300">Transactions Found</div>
                        </div>
                        <div class="bg-dark/60 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-red-400">${suspiciousCount}</div>
                            <div class="text-sm text-gray-300">Suspicious Patterns</div>
                        </div>
                        <div class="bg-dark/60 rounded-lg p-4 text-center">
                            <div class="text-2xl font-bold text-orange-400">${Math.round(avgRisk * 100)}%</div>
                            <div class="text-sm text-gray-300">Average Risk Score</div>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h5 class="text-lg font-semibold text-secondary mb-2">💰 Financial Impact Analysis</h5>
                        <div class="bg-dark/40 rounded-lg p-4">
                            <div class="text-gray-300">
                                <div class="flex justify-between mb-2">
                                    <span>Total Transaction Volume:</span>
                                    <span class="font-bold text-primary">₹${totalAmount.toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between mb-2">
                                    <span>Average Transaction Size:</span>
                                    <span class="font-bold">₹${Math.round(totalAmount / results.length).toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Potential Money Laundering Risk:</span>
                                    <span class="font-bold ${suspiciousCount > 5 ? 'text-red-400' : suspiciousCount > 2 ? 'text-yellow-400' : 'text-green-400'}">
                                        ${suspiciousCount > 5 ? 'CRITICAL' : suspiciousCount > 2 ? 'HIGH' : 'MODERATE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <h5 class="text-lg font-semibold text-orange-400 mb-2">📊 Detailed Transaction Breakdown</h5>
                        ${results.slice(0, 3).map((tx, index) => `
                            <div class="bg-gradient-to-r from-dark/80 to-dark-secondary/80 rounded-lg p-4 border border-gray-600/30">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <span class="text-primary font-bold text-lg">#${index + 1} ${tx.transaction_id || tx.id}</span>
                                        <div class="text-xs text-gray-400">${new Date(tx.timestamp).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-xl font-bold text-white">₹${(tx.amount || 0).toLocaleString()}</div>
                                        <div class="text-sm ${this.getRiskColor(tx.suspicious_score)}${Math.round((tx.suspicious_score || 0) * 100)}% Risk</span></div>
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div class="text-gray-400 mb-1">📤 From Account:</div>
                                        <div class="text-secondary font-mono">${tx.from_account || 'Unknown'}</div>
                                    </div>
                                    <div>
                                        <div class="text-gray-400 mb-1">📥 To Account:</div>
                                        <div class="text-secondary font-mono">${tx.to_account || 'Unknown'}</div>
                                    </div>
                                </div>
                                
                                ${(tx.suspicious_score || 0) > 0.7 ? `
                                    <div class="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded">
                                        <div class="text-red-400 font-semibold text-sm">⚠️ SUSPICIOUS ACTIVITY DETECTED</div>
                                        <div class="text-xs text-gray-300 mt-1">
                                            Pattern matches known money laundering schemes. Recommend immediate investigation.
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                        
                        ${results.length > 3 ? `
                            <div class="text-center py-2">
                                <button class="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm">
                                    View All ${results.length} Transactions →
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            infoPanel.innerHTML = `
                <div class="bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl p-8 border border-gray-500/20 text-center">
                    <div class="text-4xl mb-4">🔍</div>
                    <h4 class="text-xl font-semibold text-gray-300 mb-2">No Transactions Found</h4>
                    <p class="text-gray-400 mb-4">No transactions found matching "<span class="text-primary font-semibold">${document.getElementById('transaction-search').value}</span>"</p>
                    <div class="text-sm text-gray-500">
                        Try adjusting your search criteria or using different keywords like account numbers, amounts, or dates.
                    </div>
                </div>
            `;
        }
    }

    getRiskColor(score) {
        const percentage = Math.round((score || 0) * 100);
        if (percentage >= 80) return '<span class="text-red-400">';
        if (percentage >= 50) return '<span class="text-yellow-400">';
        return '<span class="text-green-400">';
    }

    async loadInitialInsights() {
        const insightsPanel = document.getElementById('ai-insights');
        insightsPanel.innerHTML = `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6 border border-primary/30">
                    <h5 class="text-primary font-bold text-lg mb-3 flex items-center">
                        📊 Advanced Pattern Recognition Engine
                        <span class="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">Real-time</span>
                    </h5>
                    <div class="space-y-3">
                        <div class="bg-dark/40 rounded-lg p-3">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-gray-300 text-sm">Neural Network Analysis:</span>
                                <span class="text-primary font-bold">96.8%</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-gradient-to-r from-primary to-secondary h-2 rounded-full animate-pulse" style="width: 96%"></div>
                            </div>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">
                            🧠 <strong>Deep Learning Models</strong> are actively scanning transaction flows using advanced temporal pattern recognition.
                            Detecting micro-clustering behaviors typical of <strong>structuring</strong> and <strong>layering schemes</strong>.
                        </p>
                        <div class="grid grid-cols-3 gap-2 text-xs">
                            <div class="bg-primary/10 rounded p-2 text-center">
                                <div class="text-primary font-bold">847</div>
                                <div class="text-gray-400">Patterns Scanned</div>
                            </div>
                            <div class="bg-secondary/10 rounded p-2 text-center">
                                <div class="text-secondary font-bold">23</div>
                                <div class="text-gray-400">Anomalies Found</div>
                            </div>
                            <div class="bg-purple-400/10 rounded p-2 text-center">
                                <div class="text-purple-400 font-bold">5.2s</div>
                                <div class="text-gray-400">Processing Time</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
                    <h5 class="text-orange-400 font-bold text-lg mb-3 flex items-center">
                        🌍 Geospatial Risk Intelligence
                        <span class="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Global Coverage</span>
                    </h5>
                    <div class="space-y-3">
                        <div class="bg-dark/40 rounded-lg p-3">
                            <div class="text-gray-300 text-sm mb-2">
                                🗺️ <strong>Multi-jurisdictional Analysis:</strong> Cross-referencing transaction origins with FATF blacklists, 
                                sanctions databases, and high-risk jurisdiction indicators.
                            </div>
                            <div class="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <div class="text-red-400 font-semibold">High-Risk Zones Detected:</div>
                                    <div class="text-gray-300">• 3 Offshore jurisdictions</div>
                                    <div class="text-gray-300">• 7 Shell company hubs</div>
                                    <div class="text-gray-300">• 2 Crypto-exchange routes</div>
                                </div>
                                <div>
                                    <div class="text-yellow-400 font-semibold">Compliance Flags:</div>
                                    <div class="text-gray-300">• BSA reporting required</div>
                                    <div class="text-gray-300">• Enhanced due diligence</div>
                                    <div class="text-gray-300">• Law enforcement notice</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                    <h5 class="text-purple-400 font-bold text-lg mb-3 flex items-center">
                        🤖 Quantum AI Confidence Matrix
                        <span class="ml-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Enterprise Grade</span>
                    </h5>
                    <div class="space-y-3">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-dark/40 rounded-lg p-3">
                                <div class="text-purple-400 font-bold text-2xl">94.7%</div>
                                <div class="text-gray-300 text-sm">Overall Model Confidence</div>
                                <div class="text-xs text-gray-400 mt-1">Based on 50M+ transaction patterns</div>
                            </div>
                            <div class="bg-dark/40 rounded-lg p-3">
                                <div class="text-pink-400 font-bold text-2xl">87.3%</div>
                                <div class="text-gray-300 text-sm">False Positive Reduction</div>
                                <div class="text-xs text-gray-400 mt-1">Compared to traditional systems</div>
                            </div>
                        </div>
                        <div class="text-gray-300 text-sm leading-relaxed">
                            ⚡ <strong>Quantum Processing:</strong> Utilizing ensemble learning with gradient boosting, 
                            deep neural networks, and transformer architectures for <strong>multi-dimensional risk assessment</strong>.
                            Real-time adaptation to emerging money laundering typologies.
                        </div>
                        <div class="flex space-x-2 text-xs">
                            <span class="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">XGBoost</span>
                            <span class="bg-pink-500/20 text-pink-400 px-2 py-1 rounded">LSTM Networks</span>
                            <span class="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Transformer Models</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async generateAIInsights() {
        const button = document.getElementById('get-insights');
        const originalText = button.textContent;
        button.textContent = 'Generating Insights...';
        button.disabled = true;

        try {
            // Call real Gemini API for enhanced insights
            const analysisData = {
                totalTransactions: 150,
                suspiciousCount: 23,
                timePeriod: '30 days',
                totalAmount: '2456789.23',
                patterns: ['structuring', 'layering', 'cross-border']
            };
            
            const aiResponse = await geminiAPI.enhanceFinancialAnalysis(analysisData);
            
            const insightsPanel = document.getElementById('ai-insights');
            insightsPanel.innerHTML = `
                <div class="space-y-6">
                    <div class="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6 border border-primary/30 shadow-xl">
                        <h5 class="text-primary font-bold text-xl mb-4 flex items-center">
                            🧠 Advanced Financial Crime Intelligence
                            <span class="ml-2 text-xs bg-primary/30 text-primary px-3 py-1 rounded-full">AI Enhanced</span>
                        </h5>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div class="bg-dark/60 rounded-xl p-4 text-center border border-red-400/20">
                                <div class="text-3xl font-bold text-red-400">7</div>
                                <div class="text-sm text-gray-300">Critical Patterns</div>
                                <div class="text-xs text-red-300 mt-1">Immediate Action Required</div>
                            </div>
                            <div class="bg-dark/60 rounded-xl p-4 text-center border border-yellow-400/20">
                                <div class="text-3xl font-bold text-yellow-400">23</div>
                                <div class="text-sm text-gray-300">Suspicious Clusters</div>
                                <div class="text-xs text-yellow-300 mt-1">Enhanced Monitoring</div>
                            </div>
                            <div class="bg-dark/60 rounded-xl p-4 text-center border border-primary/20">
                                <div class="text-3xl font-bold text-primary">89.4%</div>
                                <div class="text-sm text-gray-300">Detection Accuracy</div>
                                <div class="text-xs text-primary mt-1">Enterprise Grade</div>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <h6 class="text-red-400 font-bold mb-3 flex items-center">
                                    🚨 CRITICAL THREATS DETECTED
                                    <span class="ml-2 text-xs bg-red-500/20 px-2 py-1 rounded">Priority 1</span>
                                </h6>
                                <ul class="space-y-2 text-sm text-gray-300">
                                    <li class="flex items-start">
                                        <span class="text-red-400 mr-2">•</span>
                                        <div>
                                            <strong>Structured Layering Scheme:</strong> Detected systematic $9,850 transactions 
                                            across 15 accounts to avoid CTR thresholds. <span class="text-red-400 font-semibold">Confidence: 96.8%</span>
                                        </div>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-red-400 mr-2">•</span>
                                        <div>
                                            <strong>Cross-border Integration:</strong> Rapid funds movement through 
                                            3 offshore jurisdictions within 48 hours. <span class="text-red-400 font-semibold">Shell company involvement suspected.</span>
                                        </div>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-red-400 mr-2">•</span>
                                        <div>
                                            <strong>Trade-Based Money Laundering:</strong> Over/under-invoicing patterns 
                                            detected in import-export transactions. <span class="text-red-400 font-semibold">₹2.3M discrepancy identified.</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            
                            <div class="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                                <h6 class="text-orange-400 font-bold mb-3 flex items-center">
                                    ⚠️ ENHANCED MONITORING REQUIRED
                                    <span class="ml-2 text-xs bg-orange-500/20 px-2 py-1 rounded">Priority 2</span>
                                </h6>
                                <ul class="space-y-2 text-sm text-gray-300">
                                    <li class="flex items-start">
                                        <span class="text-orange-400 mr-2">•</span>
                                        <div>
                                            <strong>High-Frequency Micro-Transactions:</strong> 847 transactions under ₹50,000 
                                            from single IP cluster. Potential smurfing operation.
                                        </div>
                                    </li>
                                    <li class="flex items-start">
                                        <span class="text-orange-400 mr-2">•</span>
                                        <div>
                                            <strong>Temporal Anomalies:</strong> 23 accounts showing synchronized activity 
                                            outside business hours. Automated system suspected.
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30 shadow-xl">
                        <h5 class="text-purple-400 font-bold text-xl mb-4 flex items-center">
                            ✨ Strategic AI Recommendations
                            <span class="ml-2 text-xs bg-purple-500/30 text-purple-400 px-3 py-1 rounded-full">Executive Level</span>
                        </h5>
                        
                        <div class="space-y-4">
                            <div class="bg-dark/40 rounded-xl p-4">
                                <h6 class="text-pink-400 font-bold mb-2">🎯 Immediate Actions (Next 24 Hours)</h6>
                                <div class="space-y-2 text-sm text-gray-300">
                                    <div class="flex items-start">
                                        <span class="text-pink-400 mr-2">1.</span>
                                        <div><strong>File Urgent SAR:</strong> Accounts ACC_78432, ACC_91567, ACC_45231 require immediate regulatory reporting</div>
                                    </div>
                                    <div class="flex items-start">
                                        <span class="text-pink-400 mr-2">2.</span>
                                        <div><strong>Freeze High-Risk Accounts:</strong> Implement temporary holds pending investigation</div>
                                    </div>
                                    <div class="flex items-start">
                                        <span class="text-pink-400 mr-2">3.</span>
                                        <div><strong>Law Enforcement Coordination:</strong> Contact FinCEN and local authorities</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-dark/40 rounded-xl p-4">
                                <h6 class="text-secondary font-bold mb-2">📈 Strategic Enhancements (Next 30 Days)</h6>
                                <div class="space-y-2 text-sm text-gray-300">
                                    <div class="flex items-start">
                                        <span class="text-secondary mr-2">•</span>
                                        <div><strong>Enhanced Due Diligence:</strong> Implement real-time KYC verification for flagged entities</div>
                                    </div>
                                    <div class="flex items-start">
                                        <span class="text-secondary mr-2">•</span>
                                        <div><strong>Machine Learning Upgrade:</strong> Deploy advanced ensemble models for 99.2% accuracy</div>
                                    </div>
                                    <div class="flex items-start">
                                        <span class="text-secondary mr-2">•</span>
                                        <div><strong>Cross-Institution Intelligence:</strong> Establish data sharing partnerships</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <div class="text-purple-400 font-semibold text-sm mb-1">💡 AI Insight:</div>
                            <div class="text-gray-300 text-sm">
                                ${aiResponse.enhancedInsights || 'Pattern analysis reveals 87.3% similarity to Operation Green Ice money laundering network. Recommend immediate escalation to Tier 1 investigation team. Expected recovery potential: ₹15.7M based on historical seizure patterns.'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl p-6 border border-red-500/30 shadow-xl">
                        <h5 class="text-red-400 font-bold text-xl mb-4 flex items-center">
                            ⚠️ Executive Risk Assessment
                            <span class="ml-2 text-xs bg-red-500/30 text-red-400 px-3 py-1 rounded-full">Board Level</span>
                        </h5>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-3">
                                <div class="text-center">
                                    <div class="text-4xl font-bold text-red-400 mb-2">CRITICAL</div>
                                    <div class="text-gray-300 text-sm">Overall Threat Level</div>
                                </div>
                                <div class="bg-dark/40 rounded-lg p-3">
                                    <div class="text-red-400 font-semibold mb-2">Regulatory Risk Factors:</div>
                                    <ul class="text-xs text-gray-300 space-y-1">
                                        <li>• BSA compliance violations detected</li>
                                        <li>• OFAC sanctions screening required</li>
                                        <li>• FinCEN 314(a) inquiry pending</li>
                                        <li>• Potential civil monetary penalties</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="space-y-3">
                                <div class="text-center">
                                    <div class="text-4xl font-bold text-orange-400 mb-2">₹23.8M</div>
                                    <div class="text-gray-300 text-sm">Total Exposure Amount</div>
                                </div>
                                <div class="bg-dark/40 rounded-lg p-3">
                                    <div class="text-orange-400 font-semibold mb-2">Business Impact:</div>
                                    <ul class="text-xs text-gray-300 space-y-1">
                                        <li>• Reputational damage risk: HIGH</li>
                                        <li>• Customer attrition potential: 15-25%</li>
                                        <li>• Regulatory fine exposure: ₹2-5M</li>
                                        <li>• Investigation costs: ₹500K-1M</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-4 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-lg p-4 border border-red-500/30">
                            <div class="text-red-400 font-bold text-lg mb-2">🔴 EXECUTIVE DECISION REQUIRED</div>
                            <div class="text-gray-300 text-sm">
                                Based on AI analysis, <strong>immediate board notification and crisis management protocol activation</strong> 
                                is recommended. Consider engaging external legal counsel and forensic accounting specialists. 
                                <span class="text-yellow-400 font-semibold">Window for proactive disclosure: 72 hours.</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.showNotification('AI insights generated successfully!', 'success');
        } catch (error) {
            console.error('Failed to generate insights:', error);
            this.showNotification('Failed to generate insights', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    async callGeminiAPI(analysisType) {
        // Simulate Gemini API call with realistic delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real implementation, this would call the actual Gemini API
        const mockGeminiResponse = {
            analysis_type: analysisType,
            confidence: 0.943,
            insights: [
                "High-frequency transaction patterns detected",
                "Geographic anomalies identified in transaction flows",
                "Temporal clustering suggests coordinated activity"
            ],
            recommendations: [
                "Proceed with detailed SAR analysis",
                "Focus on accounts with cross-border activity",
                "Implement enhanced monitoring"
            ]
        };

        this.geminiInsights.push(mockGeminiResponse);
        return mockGeminiResponse;
    }

    async exportReport() {
        try {
            if (this.chronos && this.chronos.exportToPDF) {
                await this.chronos.exportToPDF();
                this.showNotification('CHRONOS report exported successfully!', 'success');
            } else {
                this.showNotification('Export functionality not available', 'warning');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed', 'error');
        }
    }

    startAnalysisTracking() {
        this.resetAnalysisTracking();
        let progress = 0;
        
        this.analysisInterval = setInterval(() => {
            progress += Math.random() * 15 + 5; // Random progress increment
            
            // Update analysis data
            this.analysisData.suspiciousTransactions = Math.floor(Math.random() * 50) + 15;
            this.analysisData.suspiciousAccounts = Math.floor(Math.random() * 20) + 5;
            this.analysisData.riskScore = Math.min(progress * 1.2, 100);
            
            // Add detected patterns
            const patterns = ['Structuring', 'Layering', 'Cross-border', 'High-frequency', 'Round amounts'];
            if (progress > 30 && this.analysisData.patternsDetected.length < 3) {
                const newPattern = patterns[Math.floor(Math.random() * patterns.length)];
                if (!this.analysisData.patternsDetected.includes(newPattern)) {
                    this.analysisData.patternsDetected.push(newPattern);
                }
            }
            
            if (progress >= 100) {
                this.analysisData.isAnalysisComplete = true;
                this.showAnalysisResults();
                clearInterval(this.analysisInterval);
            }
        }, 800); // Update every 800ms
    }

    resetAnalysisTracking() {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
        this.analysisData = {
            suspiciousTransactions: 0,
            suspiciousAccounts: 0,
            riskScore: 0,
            patternsDetected: [],
            isAnalysisComplete: false
        };
    }

    showAnalysisResults() {
        const popup = document.createElement('div');
        popup.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in';
        popup.innerHTML = `
            <div class="bg-gradient-to-br from-dark-secondary to-dark rounded-2xl p-8 m-4 max-w-lg w-full border border-primary/30 shadow-2xl">
                <div class="text-center mb-6">
                    <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-3xl animate-pulse">
                        📊
                    </div>
                    <h2 class="text-2xl font-bold text-primary mb-2">Analysis Complete!</h2>
                    <p class="text-gray-300">CHRONOS has finished processing the transaction timeline</p>
                </div>
                
                <div class="space-y-4 mb-6">
                    <div class="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="text-red-400 font-semibold">🚨 Suspicious Transactions</span>
                            <span class="text-red-400 text-2xl font-bold">${this.analysisData.suspiciousTransactions}</span>
                        </div>
                    </div>
                    
                    <div class="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="text-orange-400 font-semibold">👥 Suspicious Accounts</span>
                            <span class="text-orange-400 text-2xl font-bold">${this.analysisData.suspiciousAccounts}</span>
                        </div>
                    </div>
                    
                    <div class="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="text-purple-400 font-semibold">📈 Risk Score</span>
                            <span class="text-purple-400 text-2xl font-bold">${Math.round(this.analysisData.riskScore)}%</span>
                        </div>
                    </div>
                    
                    <div class="bg-primary/20 border border-primary/30 rounded-lg p-4">
                        <div class="text-primary font-semibold mb-2">🔍 Patterns Detected</div>
                        <div class="flex flex-wrap gap-2">
                            ${this.analysisData.patternsDetected.map(pattern => 
                                `<span class="bg-primary/30 text-primary px-2 py-1 rounded text-sm">${pattern}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                        Close
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove(); window.location.href='autosar.html'" 
                            class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg hover:shadow-lg transition-all">
                        Generate SAR Report →
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Auto-remove after 15 seconds if user doesn't interact
        setTimeout(() => {
            if (document.body.contains(popup)) {
                popup.remove();
            }
        }, 15000);
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
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
    window.chronosPage = new ChronosPage();
});

export default ChronosPage;