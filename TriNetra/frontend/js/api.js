// TriNetra API Module
class TriNetraAPI {
    constructor() {
        this.baseURL = '/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Only use mock data if we're in production (deployed environment)
                if (this.isDeployedEnvironment()) {
                    console.warn(`🌐 DEPLOYED: API endpoint ${endpoint} not available - using mock data`);
                    return this.getMockData(endpoint);
                } else {
                    // In localhost, throw the actual error
                    console.error(`🏠 LOCALHOST: API endpoint ${endpoint} returned non-JSON response`);
                    throw new Error(`API endpoint ${endpoint} returned non-JSON response (${response.status})`);
                }
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                if (this.isDeployedEnvironment()) {
                    console.warn(`🌐 DEPLOYED: API error ${response.status} for ${endpoint} - using mock data`);
                    return this.getMockData(endpoint);
                } else {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }
            }
            
            console.log(`✅ API Success: ${endpoint}`, data);
            return data;
        } catch (error) {
            console.error(`❌ API request failed for ${endpoint}:`, error.message);
            
            // Only use mock data if we're in production (deployed environment)
            if (this.isDeployedEnvironment()) {
                console.warn(`🌐 DEPLOYED: Using mock data for ${endpoint} due to error: ${error.message}`);
                return this.getMockData(endpoint);
            } else {
                // In localhost, re-throw the error for proper debugging
                console.error(`🏠 LOCALHOST: API call failed, re-throwing error for debugging`);
                throw error;
            }
        }
    }

    isDeployedEnvironment() {
        // Check if we're running on Vercel or other deployment platforms
        return window.location.hostname.includes('vercel.app') || 
               window.location.hostname.includes('netlify.app') ||
               window.location.hostname.includes('herokuapp.com') ||
               (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
    }

    getMockData(endpoint) {
        // Return appropriate mock data based on endpoint
        if (endpoint.includes('/chronos/timeline')) {
            return {
                status: 'success',
                data: this.generateSampleTransactions(),
                summary: {
                    total_transactions: 50,
                    suspicious_count: 12,
                    amount_range: { min: 100, max: 50000 }
                },
                message: "Demo mode - Using sample data"
            };
        }
        
        if (endpoint.includes('/hydra/generate')) {
            return {
                status: "success",
                data: {
                    pattern_id: `PATTERN_${Date.now()}`,
                    pattern_type: "layering_scheme",
                    attack_type: "layering_scheme",
                    complexity_score: Math.random() * 0.3 + 0.6, // 0.6-0.9
                    complexity: Math.random() * 0.3 + 0.6,
                    evasion_score: Math.random() * 0.4 + 0.6,
                    description: "Demo adversarial pattern - Complex layering with multiple intermediaries",
                    transactions: this.generateAdversarialPattern(),
                    timestamp: new Date().toISOString()
                },
                message: "Demo mode - Generated sample adversarial pattern"
            };
        }
        
        if (endpoint.includes('/hydra/detect')) {
            return {
                status: "success",
                detection_result: {
                    detected: Math.random() > 0.3,
                    confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
                    detection_time_ms: Math.floor(Math.random() * 200) + 50,
                    alerts: ["Unusual transaction pattern", "High velocity transfers"]
                },
                message: "Demo mode - Simulated detection result"
            };
        }
        
        if (endpoint.includes('/hydra/')) {
            return {
                status: "success",
                message: "Demo mode - HYDRA service available",
                data: []
            };
        }
        
        if (endpoint.includes('/autosar/generate')) {
            return {
                status: "success",
                data: {
                    report_id: `SAR_${Date.now()}`,
                    title: "Suspicious Layering Activity Report",
                    priority: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)],
                    generated_at: new Date().toISOString(),
                    report_content: this.generateSampleSARReport(),
                    confidence_score: Math.random() * 0.3 + 0.7, // 0.7-1.0
                    suspicious_transactions: Math.floor(Math.random() * 10) + 5,
                    risk_level: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)],
                    summary: "Multiple structured transactions detected involving potential money laundering scheme.",
                    details: {
                        pattern_type: "Layering & Structuring",
                        total_transactions: Math.floor(Math.random() * 50) + 20,
                        suspicious_transactions: Math.floor(Math.random() * 10) + 5,
                        total_amount: Math.random() * 500000 + 100000,
                        average_amount: Math.random() * 15000 + 5000,
                        time_period: "30 days",
                        accounts_involved: [
                            "ACC_001_DEMO", "ACC_002_DEMO", "ACC_003_DEMO", 
                            "ACC_004_DEMO", "ACC_005_DEMO", "SHELL_001", 
                            "SHELL_002", "TARGET_ACC"
                        ]
                    },
                    evidence: {
                        risk_factors: [
                            "Multiple cash deposits just under $10,000 reporting threshold",
                            "Rapid movement of funds between multiple accounts",
                            "Transactions with no apparent business purpose",
                            "Pattern consistent with layering money laundering technique"
                        ],
                        regulatory_flags: [
                            "BSA_STRUCTURING",
                            "AML_SUSPICIOUS_PATTERN",
                            "CTR_AVOIDANCE"
                        ],
                        suspicious_patterns: [
                            "Structured deposits",
                            "Rapid fund transfers",
                            "Shell account usage"
                        ],
                        pattern_indicators: [
                            "High frequency transactions",
                            "Just-below-threshold amounts",
                            "Multiple account usage",
                            "Rapid fund movement"
                        ],
                        transaction_ids: [
                            "TXN_001_DEMO", "TXN_002_DEMO", "TXN_003_DEMO", 
                            "TXN_004_DEMO", "TXN_005_DEMO", "TXN_006_DEMO",
                            "TXN_007_DEMO", "TXN_008_DEMO"
                        ]
                    },
                    regulatory_compliance: {
                        filing_deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                        required_fields: ["completed"],
                        validation_status: "PASSED",
                        codes: ["BSA_314B", "AML_CTR", "SAR_031"],
                        law_enforcement_notification: true
                    },
                    attachments: {
                        "Transaction Log": "txn_log.csv",
                        "Account Analysis": "account_analysis.pdf",
                        "Risk Assessment": "risk_assessment.pdf"
                    },
                    recommendations: [
                        "File SAR report with FinCEN within 30 days",
                        "Implement enhanced monitoring for identified accounts",
                        "Review and update transaction monitoring thresholds",
                        "Conduct additional due diligence on high-risk customers",
                        "Consider account closure or restrictions if activity continues"
                    ]
                },
                message: "Demo mode - Generated sample SAR report"
            };
        }
        
        if (endpoint.includes('/autosar/')) {
            return {
                status: "success", 
                message: "Demo mode - Auto-SAR service available",
                data: []
            };
        }
        
        return {
            status: "mock",
            message: "Demo mode - Backend API not available"
        };
    }

    generateSampleTransactions() {
        const transactions = [];
        const accounts = ['ACC_001', 'ACC_002', 'ACC_003', 'ACC_004', 'ACC_005', 'ACC_006'];
        const types = ['wire_transfer', 'cash_deposit', 'check_deposit', 'ach_transfer'];
        const suspicionLevels = [0.1, 0.3, 0.5, 0.7, 0.9];
        
        const baseTime = new Date('2024-01-01').getTime();
        
        for (let i = 0; i < 50; i++) {
            const timestamp = new Date(baseTime + (i * 24 * 60 * 60 * 1000 * Math.random() * 30));
            const amount = Math.random() * 49900 + 100; // $100 to $50,000
            const fromAccount = accounts[Math.floor(Math.random() * accounts.length)];
            let toAccount = accounts[Math.floor(Math.random() * accounts.length)];
            while (toAccount === fromAccount) {
                toAccount = accounts[Math.floor(Math.random() * accounts.length)];
            }
            
            transactions.push({
                id: `TXN_${String(i + 1).padStart(3, '0')}`,
                timestamp: timestamp.toISOString(),
                from_account: fromAccount,
                to_account: toAccount,
                amount: Math.round(amount * 100) / 100,
                transaction_type: types[Math.floor(Math.random() * types.length)],
                suspicion_score: suspicionLevels[Math.floor(Math.random() * suspicionLevels.length)],
                description: `Sample transaction ${i + 1}`,
                location: 'Demo Location',
                flags: Math.random() > 0.7 ? ['large_amount'] : []
            });
        }
        
        return transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    generateAdversarialPattern() {
        const pattern = [];
        const accounts = ['SHELL_001', 'SHELL_002', 'SHELL_003', 'TARGET_ACC'];
        
        // Generate a complex layering pattern
        for (let i = 0; i < 8; i++) {
            const baseAmount = 10000;
            const amount = baseAmount + (Math.random() * 1000 - 500); // Small variations
            
            pattern.push({
                step: i + 1,
                from_account: accounts[i % (accounts.length - 1)],
                to_account: accounts[(i + 1) % accounts.length],
                amount: Math.round(amount * 100) / 100,
                delay_minutes: Math.floor(Math.random() * 60) + 5,
                technique: i < 4 ? "structuring" : "layering"
            });
        }
        
        return pattern;
    }

    generateSampleSARReport() {
        const reportContent = `
SUSPICIOUS ACTIVITY REPORT (SAR)
================================

Report ID: SAR_${Date.now()}
Date Generated: ${new Date().toLocaleDateString()}
Institution: Demo Financial Institution

SUSPICIOUS ACTIVITY SUMMARY:
----------------------------
Multiple structured transactions detected involving potential money laundering scheme.

PARTIES INVOLVED:
----------------
Primary Subject: John Doe (DOB: 01/01/1980)
Account: ACC_001
SSN: XXX-XX-1234

TRANSACTION DETAILS:
-------------------
Date Range: ${new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}
Total Amount: $${(Math.random() * 100000 + 50000).toFixed(2)}
Number of Transactions: ${Math.floor(Math.random() * 20) + 10}

SUSPICIOUS INDICATORS:
---------------------
• Multiple cash deposits just under $10,000 reporting threshold
• Rapid movement of funds between multiple accounts
• Transactions with no apparent business purpose
• Pattern consistent with layering money laundering technique

NARRATIVE:
----------
Subject has engaged in a pattern of financial activity that appears designed to evade 
Bank Secrecy Act reporting requirements. Transactions show characteristics of 
structured deposits followed by rapid fund transfers to obscure the money trail.

AI ANALYSIS CONFIDENCE: ${(Math.random() * 30 + 70).toFixed(1)}%

Generated by TriNetra Auto-SAR System (Demo Mode)
        `.trim();
        
        return reportContent;
    }

    // CHRONOS API calls
    async getTimelineData(scenario = 'all', timeRange = '30d') {
        return this.request(`/chronos/timeline?scenario=${scenario}&time_range=${timeRange}`);
    }

    async getPatternAnalysis() {
        return this.request('/chronos/patterns');
    }

    // HYDRA API calls
    async generateAdversarialPattern() {
        return this.request('/hydra/generate', {
            method: 'POST'
        });
    }

    async testDetection(patternData) {
        return this.request('/hydra/detect', {
            method: 'POST',
            body: JSON.stringify(patternData)
        });
    }

    async runHydraSimulation(rounds = 10) {
        return this.request(`/hydra/simulation?rounds=${rounds}`);
    }

    // Auto-SAR API calls
    async generateSARReport(patternData) {
        return this.request('/autosar/generate', {
            method: 'POST',
            body: JSON.stringify({ pattern: patternData })
        });
    }

    async getSARTemplates() {
        return this.request('/autosar/templates');
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Export singleton instance
const api = new TriNetraAPI();
export default api;