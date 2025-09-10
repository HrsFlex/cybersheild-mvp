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
            const data = this.generateSampleTransactions();
            return {
                status: 'success',
                data: data,
                total_transactions: data.length,
                time_quantum: '1m',
                date_range: {
                    start: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
                    end: new Date().toISOString()
                },
                layering_summary: this.generateLayeringSummary(data),
                message: "Demo mode - Using enhanced sample data"
            };
        }
        
        if (endpoint.includes('/chronos/search')) {
            return {
                status: 'success',
                results: this.generateSampleTransactions().slice(0, 5),
                total_matches: 5,
                search_term: 'demo',
                search_type: 'all',
                message: "Demo mode - Sample search results"
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
                sar_report: {
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
        const types = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Wire Transfer', 'Cryptocurrency', 'Hawala'];
        const suspicionLevels = [0.1, 0.3, 0.5, 0.7, 0.9];
        const scenarios = ['terrorist_financing', 'crypto_sanctions', 'human_trafficking'];
        const patternTypes = ['rapid_sequence', 'smurfing', 'layering', 'structuring'];
        
        // Indian locations
        const locations = [
            { city: 'Mumbai', state: 'Maharashtra', country: 'India', region: 'Western' },
            { city: 'Delhi', state: 'Delhi', country: 'India', region: 'Northern' },
            { city: 'Bangalore', state: 'Karnataka', country: 'India', region: 'Southern' },
            { city: 'Chennai', state: 'Tamil Nadu', country: 'India', region: 'Southern' },
            { city: 'Kolkata', state: 'West Bengal', country: 'India', region: 'Eastern' },
            { city: 'Dubai', state: 'Dubai', country: 'UAE', region: 'Middle East' },
            { city: 'Karachi', state: 'Karachi', country: 'Pakistan', region: 'South Asia' }
        ];
        
        const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'];
        
        const baseTime = new Date('2024-01-01').getTime();
        
        for (let i = 0; i < 50; i++) {
            const timestamp = new Date(baseTime + (i * 24 * 60 * 60 * 1000 * Math.random() * 30));
            const amount = Math.random() * 49900 + 100; // $100 to $50,000
            const fromAccount = accounts[Math.floor(Math.random() * accounts.length)];
            let toAccount = accounts[Math.floor(Math.random() * accounts.length)];
            while (toAccount === fromAccount) {
                toAccount = accounts[Math.floor(Math.random() * accounts.length)];
            }
            
            const suspicionScore = suspicionLevels[Math.floor(Math.random() * suspicionLevels.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const transactionMethod = types[Math.floor(Math.random() * types.length)];
            
            // Generate layering analysis
            const layeringAnalysis = this.generateLayeringAnalysis(suspicionScore, amount);
            
            // Country risk assessment
            const countryRiskLevel = this.getCountryRiskLevel(location.country);
            
            transactions.push({
                id: `TXN_${String(i + 1).padStart(3, '0')}`,
                transaction_id: `TXN_${String(i + 1).padStart(3, '0')}`,
                timestamp: timestamp.toISOString(),
                from_account: fromAccount,
                to_account: toAccount,
                amount: Math.round(amount * 100) / 100,
                transaction_type: transactionMethod,
                suspicious_score: suspicionScore,
                scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
                pattern_type: patternTypes[Math.floor(Math.random() * patternTypes.length)],
                
                // Enhanced fields
                aadhar_location: {
                    ...location,
                    lat: this.getLocationCoordinates(location.city).lat,
                    lng: this.getLocationCoordinates(location.city).lng
                },
                layering_analysis: layeringAnalysis,
                country_risk_level: countryRiskLevel,
                transaction_method: transactionMethod,
                bank_details: {
                    bank_name: banks[Math.floor(Math.random() * banks.length)],
                    branch_code: `BR${Math.floor(Math.random() * 9000) + 1000}`,
                    ifsc_code: `SBIN${Math.floor(Math.random() * 900000) + 100000}`,
                    swift_code: `SWIFT${Math.floor(Math.random() * 90000) + 10000}`
                },
                
                description: `Sample transaction ${i + 1}`,
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

    // Helper methods for enhanced mock data
    generateLayeringAnalysis(suspicionScore, amount) {
        const layeringAnalysis = {
            layer_1_extraction: {
                description: 'Transaction data extraction and basic pattern identification',
                patterns_detected: [],
                risk_indicators: []
            },
            layer_2_processing: {
                description: 'Advanced pattern analysis and relationship mapping',
                connected_accounts: Math.floor(Math.random() * 13) + 2,
                temporal_patterns: [],
                amount_patterns: []
            },
            layer_3_integration: {
                description: 'Cross-reference with known threat patterns and geolocation',
                threat_level: 'LOW',
                geolocation_risk: 'NORMAL',
                pattern_match_confidence: 0.0
            }
        };
        
        // Layer 1: Basic pattern detection
        if (amount < 10000) {
            layeringAnalysis.layer_1_extraction.patterns_detected.push('Small value transaction');
        } else if (amount > 500000) {
            layeringAnalysis.layer_1_extraction.patterns_detected.push('Large value transaction');
            layeringAnalysis.layer_1_extraction.risk_indicators.push('High amount alert');
        }
        
        // Layer 2: Advanced processing
        if (suspicionScore > 0.7) {
            layeringAnalysis.layer_2_processing.temporal_patterns.push('Suspicious timing patterns');
            layeringAnalysis.layer_2_processing.amount_patterns.push('Irregular amount structure');
        }
        
        // Layer 3: Integration and final assessment
        if (suspicionScore > 0.8) {
            layeringAnalysis.layer_3_integration.threat_level = 'CRITICAL';
            layeringAnalysis.layer_3_integration.pattern_match_confidence = suspicionScore;
        } else if (suspicionScore > 0.5) {
            layeringAnalysis.layer_3_integration.threat_level = 'MEDIUM';
            layeringAnalysis.layer_3_integration.pattern_match_confidence = suspicionScore;
        }
        
        return layeringAnalysis;
    }

    getCountryRiskLevel(country) {
        const highRiskCountries = ['Pakistan', 'Afghanistan', 'North Korea', 'Iran'];
        const mediumRiskCountries = ['UAE', 'Malaysia', 'Thailand', 'Myanmar'];
        
        if (highRiskCountries.includes(country)) {
            return { level: 3, description: 'High Risk Country', color: '#ff4444' };
        } else if (mediumRiskCountries.includes(country)) {
            return { level: 2, description: 'Medium Risk Country', color: '#ffaa00' };
        } else {
            return { level: 1, description: 'Low Risk Country', color: '#44ff44' };
        }
    }

    getLocationCoordinates(city) {
        const coordinates = {
            'Mumbai': { lat: 19.0760, lng: 72.8777 },
            'Delhi': { lat: 28.6139, lng: 77.2090 },
            'Bangalore': { lat: 12.9716, lng: 77.5946 },
            'Chennai': { lat: 13.0827, lng: 80.2707 },
            'Kolkata': { lat: 22.5726, lng: 88.3639 },
            'Dubai': { lat: 25.2048, lng: 55.2708 },
            'Karachi': { lat: 24.8607, lng: 67.0011 }
        };
        
        return coordinates[city] || { lat: 0, lng: 0 };
    }

    generateLayeringSummary(transactions) {
        const totalTransactions = transactions.length;
        const highRisk = transactions.filter(tx => tx.suspicious_score > 0.8).length;
        const mediumRisk = transactions.filter(tx => tx.suspicious_score > 0.5 && tx.suspicious_score <= 0.8).length;
        const lowRisk = totalTransactions - highRisk - mediumRisk;
        
        return {
            total_transactions: totalTransactions,
            risk_distribution: {
                critical: highRisk,
                medium: mediumRisk,
                low: lowRisk
            },
            layering_effectiveness: {
                layer_1_detection_rate: Math.random() * 0.1 + 0.85,
                layer_2_processing_rate: Math.random() * 0.15 + 0.75,
                layer_3_integration_rate: Math.random() * 0.2 + 0.60
            }
        };
    }

    // CHRONOS API calls
    async getTimelineData(scenario = 'all', timeQuantum = '1m') {
        return this.request(`/chronos/timeline?scenario=${scenario}&time_quantum=${timeQuantum}`);
    }

    async getPatternAnalysis() {
        return this.request('/chronos/patterns');
    }

    async searchTransactions(searchTerm, searchType = 'all') {
        return this.request('/chronos/search', {
            method: 'POST',
            body: JSON.stringify({
                term: searchTerm,
                type: searchType
            })
        });
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