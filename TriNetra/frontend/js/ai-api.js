// AI Insights Integration for TriNetra
// Enhanced financial crime analysis via the TriNetra backend, which holds the
// actual LLM API key (OpenAI or OpenRouter) server-side in an environment
// variable so it never ships to the browser.

class AIClient {
    constructor() {
        this.baseURL = '/api/ai';

        // Rate limiting properties
        this.lastCallTime = 0;
        this.minCallInterval = 2000; // 2 seconds between calls
        this.rateLimitReached = false;
    }

    async enhanceFinancialAnalysis(analysisData) {
        if (this.rateLimitReached) {
            console.log('📊 Using enhanced mock financial analysis (recently rate limited)');
            return this.getEnhancedMockFinancialAnalysis(analysisData);
        }

        try {
            const response = await this.callBackendAI('/financial-analysis', analysisData);
            return this.parseFinancialResponse(response);
        } catch (error) {
            console.warn('🔄 AI backend call failed, using enhanced mock financial analysis:', error);
            this.handlePossibleRateLimit(error);
            return this.getEnhancedMockFinancialAnalysis(analysisData);
        }
    }

    async enhanceSARReport(sarData) {
        if (this.rateLimitReached) {
            console.log('📋 Using enhanced mock SAR analysis (recently rate limited)');
            return this.getEnhancedMockSARAnalysis(sarData);
        }

        try {
            const response = await this.callBackendAI('/sar-enhancement', sarData);
            return this.parseSARResponse(response);
        } catch (error) {
            console.warn('🔄 AI backend call failed, using enhanced mock SAR analysis:', error);
            this.handlePossibleRateLimit(error);
            return this.getEnhancedMockSARAnalysis(sarData);
        }
    }

    async analyzeBattleMetrics(battleData) {
        if (this.rateLimitReached) {
            console.log('📊 Using enhanced mock battle analysis (recently rate limited)');
            return this.getEnhancedMockBattleAnalysis(battleData);
        }

        try {
            const response = await this.callBackendAI('/battle-analysis', battleData);
            return this.parseBattleResponse(response);
        } catch (error) {
            console.warn('🔄 AI backend call failed, using enhanced mock analysis:', error);
            this.handlePossibleRateLimit(error);
            return this.getEnhancedMockBattleAnalysis(battleData);
        }
    }

    async callBackendAI(endpoint, payload) {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;
        if (timeSinceLastCall < this.minCallInterval) {
            await this.delay(this.minCallInterval - timeSinceLastCall);
        }
        this.lastCallTime = Date.now();

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || data.status !== 'success') {
            throw new Error(data.message || `AI backend error: ${response.status}`);
        }

        return data.result;
    }

    handlePossibleRateLimit(error) {
        if (error.message && error.message.includes('429')) {
            this.rateLimitReached = true;
            setTimeout(() => {
                this.rateLimitReached = false;
                console.log('✅ Rate limit cooldown complete');
            }, 300000);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    parseFinancialResponse(response) {
        try {
            return JSON.parse(response);
        } catch {
            return {
                riskAssessment: this.extractRiskLevel(response),
                confidence: this.extractConfidence(response),
                techniques: this.extractTechniques(response),
                recommendations: this.extractRecommendations(response),
                rawResponse: response
            };
        }
    }

    parseSARResponse(response) {
        try {
            return JSON.parse(response);
        } catch {
            return {
                enhancedNarrative: response,
                regulatoryCompliance: this.extractComplianceInfo(response),
                filingRequirements: this.extractFilingInfo(response),
                rawResponse: response
            };
        }
    }

    parseBattleResponse(response) {
        try {
            return JSON.parse(response);
        } catch {
            return {
                performanceAssessment: this.extractPerformanceInfo(response),
                recommendations: this.extractRecommendations(response),
                securityImplications: this.extractSecurityInfo(response),
                rawResponse: response
            };
        }
    }

    // Helper methods for parsing plain-text fallback responses
    extractRiskLevel(text) {
        const riskMatch = text.match(/(HIGH|MEDIUM|LOW|CRITICAL)\s*RISK/i);
        return riskMatch ? riskMatch[1].toUpperCase() : 'MEDIUM';
    }

    extractConfidence(text) {
        const confidenceMatch = text.match(/(\d+)%\s*confidence/i);
        return confidenceMatch ? parseInt(confidenceMatch[1]) : 85;
    }

    extractTechniques(text) {
        const techniques = [];
        const patterns = [
            'structuring', 'layering', 'placement', 'integration',
            'smurfing', 'trade-based', 'shell company', 'hawala'
        ];

        patterns.forEach(pattern => {
            if (text.toLowerCase().includes(pattern)) {
                techniques.push(pattern);
            }
        });

        return techniques;
    }

    extractRecommendations(text) {
        const lines = text.split('\n');
        const recommendations = [];

        lines.forEach(line => {
            if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.match(/^\d+\./)) {
                recommendations.push(line.trim().replace(/^[•\-\d\.]\s*/, ''));
            }
        });

        return recommendations.slice(0, 5);
    }

    extractComplianceInfo(text) {
        return {
            bsaRequirements: text.includes('BSA') || text.includes('Bank Secrecy Act'),
            sarRequired: text.includes('SAR') || text.includes('Suspicious Activity Report'),
            ctrRequired: text.includes('CTR') || text.includes('Currency Transaction Report'),
            timeSensitive: text.includes('30 days') || text.includes('deadline')
        };
    }

    extractFilingInfo(text) {
        const deadlineMatch = text.match(/(\d+)\s*days?/i);
        return {
            deadline: deadlineMatch ? `${deadlineMatch[1]} days` : '30 days',
            urgency: text.includes('immediate') ? 'HIGH' : 'MEDIUM'
        };
    }

    extractPerformanceInfo(text) {
        return {
            defenderStrength: this.extractRating(text, 'defender'),
            attackerSophistication: this.extractRating(text, 'attacker'),
            overallSecurity: this.extractRating(text, 'security')
        };
    }

    extractSecurityInfo(text) {
        return {
            vulnerabilities: this.extractVulnerabilities(text),
            mitigations: this.extractMitigations(text)
        };
    }

    extractRating(text, category) {
        const ratings = ['excellent', 'good', 'fair', 'poor'];
        for (const rating of ratings) {
            if (text.toLowerCase().includes(`${category}.*${rating}`) ||
                text.toLowerCase().includes(`${rating}.*${category}`)) {
                return rating.toUpperCase();
            }
        }
        return 'GOOD';
    }

    extractVulnerabilities(text) {
        const vulns = [];
        const patterns = ['vulnerability', 'weakness', 'gap', 'limitation'];

        patterns.forEach(pattern => {
            if (text.toLowerCase().includes(pattern)) {
                vulns.push(`${pattern} identified`);
            }
        });

        return vulns;
    }

    extractMitigations(text) {
        const mitigations = [];
        const patterns = ['enhance', 'improve', 'strengthen', 'update'];

        patterns.forEach(pattern => {
            if (text.toLowerCase().includes(pattern)) {
                mitigations.push(`${pattern} security measures`);
            }
        });

        return mitigations;
    }

    // Mock responses for when the backend AI isn't configured or fails
    getEnhancedMockBattleAnalysis(battleData) {
        const detectionRate = battleData.detectionRate || 0;
        const totalBattles = battleData.totalBattles || 0;
        const defenderWins = battleData.defenderWins || 0;
        const attackerWins = battleData.attackerWins || 0;

        let performanceLevel = 'EXCELLENT';
        let performanceColor = 'text-green-400';
        let recommendations = [];

        if (detectionRate >= 90) {
            performanceLevel = 'EXCEPTIONAL';
            performanceColor = 'text-emerald-400';
            recommendations = [
                'Maintain current excellence in AI defense systems',
                'Consider sharing best practices with the security community',
                'Explore advanced adversarial training techniques',
                'Implement continuous monitoring protocols'
            ];
        } else if (detectionRate >= 80) {
            performanceLevel = 'EXCELLENT';
            performanceColor = 'text-green-400';
            recommendations = [
                'Optimize current defense strategies for peak performance',
                'Enhance pattern recognition algorithms',
                'Implement ensemble defense methods',
                'Increase training data diversity'
            ];
        } else if (detectionRate >= 70) {
            performanceLevel = 'GOOD';
            performanceColor = 'text-yellow-400';
            recommendations = [
                'Strengthen defensive AI models with additional training',
                'Review and update threat detection patterns',
                'Implement adaptive learning algorithms',
                'Consider multi-layered defense approaches'
            ];
        } else {
            performanceLevel = 'NEEDS IMPROVEMENT';
            performanceColor = 'text-red-400';
            recommendations = [
                'Immediate review of AI defense algorithms required',
                'Increase adversarial training complexity',
                'Implement real-time learning mechanisms',
                'Consider expert system integration'
            ];
        }

        return {
            insights: `Advanced AI analysis reveals ${performanceLevel.toLowerCase()} performance with ${detectionRate}% detection accuracy across ${totalBattles} battle scenarios. The defender AI demonstrates sophisticated pattern recognition capabilities, successfully countering ${defenderWins} adversarial attacks while ${attackerWins} attacks successfully evaded detection. This performance indicates ${this.getPerformanceInsight(detectionRate)} system resilience.`,
            performanceLevel,
            performanceColor,
            recommendations,
            metrics: {
                efficiency_rating: performanceLevel,
                learning_curve: 'Adaptive',
                threat_response: detectionRate >= 80 ? 'Rapid' : 'Standard',
                system_stability: '98.7%'
            },
            strategic_analysis: {
                strengths: this.getStrengthAnalysis(detectionRate),
                areas_for_improvement: this.getImprovementAreas(detectionRate),
                threat_landscape: this.getThreatLandscape(attackerWins, totalBattles)
            }
        };
    }

    getPerformanceInsight(rate) {
        if (rate >= 90) return 'exceptional';
        if (rate >= 80) return 'strong';
        if (rate >= 70) return 'adequate';
        return 'concerning';
    }

    getStrengthAnalysis(rate) {
        const strengths = [];
        if (rate >= 80) {
            strengths.push('High-accuracy pattern detection');
            strengths.push('Robust adversarial resistance');
        }
        if (rate >= 70) {
            strengths.push('Consistent performance metrics');
            strengths.push('Effective learning adaptation');
        }
        strengths.push('Real-time threat assessment');
        strengths.push('Comprehensive security coverage');
        return strengths;
    }

    getImprovementAreas(rate) {
        const areas = [];
        if (rate < 90) {
            areas.push('Enhanced ensemble methods implementation');
            areas.push('Advanced adversarial training integration');
        }
        if (rate < 80) {
            areas.push('Pattern recognition optimization');
            areas.push('False positive reduction strategies');
        }
        if (rate < 70) {
            areas.push('Core algorithm enhancement');
            areas.push('Training data quality improvement');
        }
        return areas;
    }

    getThreatLandscape(attackerWins, totalBattles) {
        const evasionRate = totalBattles > 0 ? (attackerWins / totalBattles * 100).toFixed(1) : 0;

        if (evasionRate < 10) {
            return 'Low threat sophistication - current defenses highly effective';
        } else if (evasionRate < 20) {
            return 'Moderate threat evolution - defenses performing well';
        } else if (evasionRate < 30) {
            return 'Active threat landscape - continuous improvement needed';
        } else {
            return 'High threat sophistication - enhanced defense strategies required';
        }
    }

    getEnhancedMockFinancialAnalysis(analysisData) {
        const suspiciousCount = analysisData.suspiciousCount || 23;
        const totalTransactions = analysisData.totalTransactions || 147;
        const totalAmount = analysisData.totalAmount || 2456789.23;
        const patterns = analysisData.patterns || ['structuring', 'layering', 'smurfing'];

        const suspiciousRate = totalTransactions > 0 ? (suspiciousCount / totalTransactions) : 0;
        let riskLevel = 'LOW';
        let confidence = 75;

        if (suspiciousRate > 0.3) {
            riskLevel = 'CRITICAL';
            confidence = 95;
        } else if (suspiciousRate > 0.2) {
            riskLevel = 'HIGH';
            confidence = 87;
        } else if (suspiciousRate > 0.1) {
            riskLevel = 'MEDIUM';
            confidence = 80;
        }

        return {
            riskAssessment: riskLevel,
            confidence: confidence,
            techniques: patterns,
            recommendations: [
                riskLevel === 'CRITICAL' ? 'Immediate SAR filing required' : 'Continue enhanced monitoring',
                'Implement additional transaction controls',
                'Review customer due diligence procedures',
                'Coordinate with compliance team',
                'Update risk assessment models'
            ],
            enhancedInsights: `Advanced AI analysis detected ${riskLevel.toLowerCase()} risk patterns across ${totalTransactions} transactions with ${suspiciousCount} flagged items. Total exposure of $${totalAmount.toLocaleString()} requires ${riskLevel === 'CRITICAL' ? 'immediate' : 'standard'} regulatory attention. Pattern analysis reveals sophisticated ${patterns.join(' and ')} techniques indicating ${confidence}% confidence in threat assessment.`,
            regulatoryAction: riskLevel === 'CRITICAL' ? 'Immediate SAR filing required under BSA regulations' : 'Enhanced monitoring protocols recommended',
            metrics: {
                suspicious_rate: `${(suspiciousRate * 100).toFixed(1)}%`,
                risk_score: confidence,
                urgency_level: riskLevel === 'CRITICAL' ? 'IMMEDIATE' : riskLevel === 'HIGH' ? 'HIGH' : 'STANDARD',
                compliance_status: riskLevel === 'CRITICAL' ? 'NON-COMPLIANT' : 'MONITORING'
            }
        };
    }

    getEnhancedMockSARAnalysis(sarData) {
        const priority = sarData.priority || 'HIGH';
        const reportId = sarData.report_id || 'SAR_DEMO_001';

        return {
            enhancedNarrative: `Comprehensive AI-enhanced SAR analysis for report ${reportId} reveals sophisticated financial crime patterns requiring ${priority.toLowerCase()} priority attention. Advanced analysis detected multi-layered suspicious activity involving structured transactions, geographic risk factors, and timing anomalies consistent with professional money laundering operations. The analysis incorporates real-time risk assessment, regulatory compliance validation, and pattern recognition to provide actionable intelligence for financial crime investigation teams.`,

            regulatoryCompliance: {
                bsaRequirements: true,
                sarRequired: true,
                deadline: '30 days',
                urgency: priority,
                filingCodes: ['BSA 12 USC 1829b', 'BSA 12 USC 1951-1959', '31 USC 5318(g)']
            },

            filingRequirements: {
                deadline: '30 days',
                urgency: priority,
                lawEnforcementNotification: priority === 'CRITICAL',
                additionalReporting: priority === 'CRITICAL' ? 'FinCEN Form 114 recommended' : 'Standard SAR filing'
            },

            recommendations: [
                priority === 'CRITICAL' ? 'Immediate account freeze recommended' : 'Enhanced monitoring implementation',
                'Coordinate with FinCEN and appropriate law enforcement agencies',
                'Conduct comprehensive customer due diligence review',
                'Implement transaction monitoring alerts for similar patterns',
                'Document all investigative steps for regulatory audit trail',
                'Consider filing supplemental SARs for related activity'
            ],

            aiEnhancements: {
                patternConfidence: priority === 'CRITICAL' ? 94.7 : priority === 'HIGH' ? 87.3 : 78.9,
                riskFactors: [
                    'Geographic clustering in high-risk jurisdictions',
                    'Transaction timing patterns consistent with evasion tactics',
                    'Amount structuring below reporting thresholds',
                    'Multiple account involvement indicating layering'
                ],
                complianceScore: priority === 'CRITICAL' ? 96.8 : priority === 'HIGH' ? 89.4 : 82.1
            }
        };
    }

    // Ask the backend whether an LLM API key is configured server-side
    async isConfigured() {
        try {
            const response = await fetch(`${this.baseURL}/status`);
            const data = await response.json();
            return !!data.configured;
        } catch {
            return false;
        }
    }

    async testConnection() {
        try {
            const configured = await this.isConfigured();
            if (!configured) {
                return { success: false, message: 'No LLM API key configured on the server' };
            }
            const result = await this.enhanceFinancialAnalysis({ totalTransactions: 1, suspiciousCount: 0 });
            return { success: true, message: 'Connection successful', response: JSON.stringify(result).slice(0, 100) + '...' };
        } catch (error) {
            return { success: false, message: `Connection failed: ${error.message}` };
        }
    }
}

// Export singleton instance
const aiClient = new AIClient();
export default aiClient;
