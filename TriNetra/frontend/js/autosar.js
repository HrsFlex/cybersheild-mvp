// Auto-SAR Report Generator Module
import api from './api.js';
import { showLoading, hideLoading, showNotification, formatCurrency, formatDateTime } from './utils.js';
import TriNetraPDFGenerator from './pdf-generator.js';

class AutoSAR {
    constructor() {
        this.currentReport = null;
        this.currentScenario = 'terrorist_financing';
        
        this.setupEventListeners();
        this.initializeContainer();
    }

    setupEventListeners() {
        const generateButton = document.getElementById('generate-sar');
        const exportButton = document.getElementById('export-sar');

        if (generateButton) {
            generateButton.addEventListener('click', () => this.generateReport());
        }

        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportReport());
        }
    }

    initializeContainer() {
        const container = document.getElementById('sar-report');
        if (!container) return;

        container.innerHTML = `
            <div class="sar-placeholder">
                <div class="placeholder-content">
                    <div class="placeholder-icon">📋</div>
                    <h4>Auto-SAR Generator Ready</h4>
                    <p>Click "Generate Report" to create a Suspicious Activity Report based on detected patterns.</p>
                    <div class="scenario-selector">
                        <label for="sar-scenario">Scenario:</label>
                        <select id="sar-scenario" class="scenario-select">
                            <option value="terrorist_financing">🎯 Terrorist Financing</option>
                            <option value="crypto_sanctions">💰 Crypto Sanctions</option>
                            <option value="human_trafficking">🚨 Human Trafficking</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        // Setup scenario selector
        const scenarioSelect = document.getElementById('sar-scenario');
        if (scenarioSelect) {
            scenarioSelect.addEventListener('change', (e) => {
                this.currentScenario = e.target.value;
            });
        }
    }

    async generateReport() {
        try {
            showLoading();
            
            // Show progress steps
            this.showGenerationProgress();
            
            const patternData = {
                scenario: this.currentScenario,
                timestamp: new Date().toISOString()
            };

            // Step 1: Analyze transactions
            this.updateProgress('Analyzing transaction patterns...', 25);
            await this.delay(800);
            
            // Step 2: Generate report
            this.updateProgress('Generating suspicious activity report...', 50);
            const response = await api.generateSARReport(patternData);
            
            if (response.status === 'success') {
                // Step 3: Format and validate
                this.updateProgress('Formatting regulatory compliance...', 75);
                await this.delay(600);
                
                this.updateProgress('Finalizing report...', 100);
                await this.delay(400);
                
                // Handle both response.data and direct response structures
                this.currentReport = response.data || response.sar_report || response;
                
                if (this.currentReport && (this.currentReport.report_id || this.currentReport.summary)) {
                    this.renderReport(this.currentReport);
                    showNotification(`SAR report ${this.currentReport.report_id || 'generated'} successfully`, 'success');
                } else {
                    console.error('❌ Auto-SAR: Invalid response structure:', response);
                    throw new Error('No valid report data received from API');
                }
            } else {
                throw new Error(response.message || 'Failed to generate SAR report');
            }
        } catch (error) {
            console.error('SAR generation failed:', error);
            this.showErrorState('Failed to generate SAR report: ' + error.message);
            showNotification('Failed to generate SAR report', 'error');
        } finally {
            hideLoading();
        }
    }

    showGenerationProgress() {
        const container = document.getElementById('sar-report');
        if (!container) return;
        
        container.innerHTML = `
            <div class="sar-generation-progress">
                <div class="progress-header">
                    <h4>🔄 Generating SAR Report</h4>
                    <p>Creating comprehensive suspicious activity analysis...</p>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="sar-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text" id="sar-progress-text">Initializing...</div>
                </div>
                <div class="generation-steps">
                    <div class="step-item" id="step-1">
                        <span class="step-icon">📊</span>
                        <span class="step-text">Analyzing transaction patterns</span>
                    </div>
                    <div class="step-item" id="step-2">
                        <span class="step-icon">📝</span>
                        <span class="step-text">Generating report content</span>
                    </div>
                    <div class="step-item" id="step-3">
                        <span class="step-icon">⚖️</span>
                        <span class="step-text">Ensuring regulatory compliance</span>
                    </div>
                    <div class="step-item" id="step-4">
                        <span class="step-icon">✅</span>
                        <span class="step-text">Finalizing documentation</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateProgress(message, percent) {
        const progressFill = document.getElementById('sar-progress-fill');
        const progressText = document.getElementById('sar-progress-text');
        
        if (progressFill) {
            progressFill.style.width = percent + '%';
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        // Update step indicators
        const stepNumber = Math.ceil(percent / 25);
        for (let i = 1; i <= stepNumber; i++) {
            const step = document.getElementById(`step-${i}`);
            if (step) {
                step.classList.add('completed');
            }
        }
    }

    showErrorState(message) {
        const container = document.getElementById('sar-report');
        if (!container) return;
        
        container.innerHTML = `
            <div class="sar-error-state">
                <div class="error-icon">❌</div>
                <h4>Report Generation Failed</h4>
                <p>${message}</p>
                <div class="error-actions">
                    <button class="retry-button" onclick="window.TriNetra.getAutoSAR().generateReport()">
                        🔄 Try Again
                    </button>
                    <button class="reset-button" onclick="window.TriNetra.getAutoSAR().reset()">
                        🏠 Reset
                    </button>
                </div>
            </div>
        `;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    renderReport(report) {
        const container = document.getElementById('sar-report');
        if (!container) return;

        container.innerHTML = `
            <div class="sar-report-content">
                <!-- Report Header -->
                <div class="sar-report-header">
                    <div class="sar-report-id">Report ID: ${report.report_id}</div>
                    <div class="sar-report-title">${report.title}</div>
                    <div class="sar-priority ${report.priority}">${report.priority} PRIORITY</div>
                    <div class="sar-generated">Generated: ${formatDateTime(report.generated_at)}</div>
                </div>

                <!-- Executive Summary -->
                <div class="sar-section">
                    <h5>Executive Summary</h5>
                    <p>${report.summary}</p>
                </div>

                <!-- Transaction Details -->
                <div class="sar-section">
                    <h5>Transaction Analysis</h5>
                    <div class="sar-details-grid">
                        <div class="sar-detail-item">
                            <div class="detail-label">Pattern Type</div>
                            <div class="detail-value">${report.details.pattern_type}</div>
                        </div>
                        <div class="sar-detail-item">
                            <div class="detail-label">Total Transactions</div>
                            <div class="detail-value">${report.details.total_transactions}</div>
                        </div>
                        <div class="sar-detail-item">
                            <div class="detail-label">Suspicious Transactions</div>
                            <div class="detail-value">${report.details.suspicious_transactions}</div>
                        </div>
                        <div class="sar-detail-item">
                            <div class="detail-label">Total Amount</div>
                            <div class="detail-value">${formatCurrency(report.details.total_amount)}</div>
                        </div>
                        <div class="sar-detail-item">
                            <div class="detail-label">Average Amount</div>
                            <div class="detail-value">${formatCurrency(report.details.average_amount)}</div>
                        </div>
                        <div class="sar-detail-item">
                            <div class="detail-label">Time Period</div>
                            <div class="detail-value">${report.details.time_period}</div>
                        </div>
                    </div>
                </div>

                <!-- Evidence Section -->
                <div class="sar-section">
                    <h5>Evidence & Indicators</h5>
                    <div class="evidence-subsection">
                        <h6>Pattern Indicators</h6>
                        <ul class="sar-evidence-list">
                            ${report.evidence.pattern_indicators.map(indicator => 
                                `<li>• ${indicator}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="evidence-subsection">
                        <h6>Risk Factors</h6>
                        <ul class="sar-evidence-list">
                            ${report.evidence.risk_factors.map(factor => 
                                `<li>• ${factor}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="evidence-subsection">
                        <h6>Sample Transaction IDs</h6>
                        <div class="transaction-ids">
                            ${(report.evidence.transaction_ids || []).slice(0, 5).map(id => 
                                `<code class="transaction-id">${id}</code>`
                            ).join(' ')}
                        </div>
                    </div>
                </div>

                <!-- Accounts Involved -->
                <div class="sar-section">
                    <h5>Accounts Involved</h5>
                    <div class="accounts-grid">
                        ${(report.details.accounts_involved || []).slice(0, 10).map(account => 
                            `<div class="account-item">
                                <code>${account}</code>
                            </div>`
                        ).join('')}
                    </div>
                    ${(report.details.accounts_involved || []).length > 10 ? 
                        `<div class="accounts-more">... and ${(report.details.accounts_involved || []).length - 10} more accounts</div>` : ''
                    }
                </div>

                <!-- Regulatory Compliance -->
                <div class="sar-section">
                    <h5>Regulatory Compliance</h5>
                    <div class="sar-details-grid">
                        <div class="sar-detail-item">
                            <div class="detail-label">Regulatory Codes</div>
                            <div class="detail-value">${report.regulatory_compliance.codes.join(', ')}</div>
                        </div>
                        <div class="sar-detail-item">
                            <div class="detail-label">Filing Deadline</div>
                            <div class="detail-value">${report.regulatory_compliance.filing_deadline}</div>
                        </div>
                        <div class="sar-detail-item">
                            <div class="detail-label">Law Enforcement Notification</div>
                            <div class="detail-value">${report.regulatory_compliance.law_enforcement_notification ? 'Required' : 'Not Required'}</div>
                        </div>
                    </div>
                </div>

                <!-- Recommendations -->
                <div class="sar-recommendations">
                    <h6>Immediate Actions Required</h6>
                    <ul>
                        ${(report.recommendations || []).map(rec => 
                            `<li>${rec}</li>`
                        ).join('')}
                    </ul>
                </div>

                <!-- Attachments -->
                <div class="sar-section">
                    <h5>Attachments</h5>
                    <div class="attachments-list">
                        ${Object.entries(report.attachments).map(([type, filename]) => 
                            `<div class="attachment-item">
                                <span class="attachment-icon">📎</span>
                                <span class="attachment-name">${filename}</span>
                                <span class="attachment-type">${type.replace('_', ' ').toUpperCase()}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>

                <!-- Digital Signature -->
                <div class="sar-signature">
                    <div class="signature-line">
                        <strong>Digital Signature:</strong> TriNetra AI System v1.0
                    </div>
                    <div class="signature-line">
                        <strong>Verification Hash:</strong> ${this.generateHash(report.report_id)}
                    </div>
                </div>
            </div>
        `;

        // Add some additional styling
        this.addReportStyling();
    }

    addReportStyling() {
        const style = document.createElement('style');
        style.textContent = `
            .sar-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 300px;
                text-align: center;
                color: var(--text-gray);
            }
            
            .placeholder-content .placeholder-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .scenario-selector {
                margin-top: 1.5rem;
            }
            
            .scenario-select {
                background: var(--bg-secondary);
                border: 1px solid var(--accent-green);
                color: var(--text-light);
                padding: 0.5rem 1rem;
                border-radius: 6px;
                margin-left: 0.5rem;
            }
            
            .evidence-subsection {
                margin: 1rem 0;
            }
            
            .evidence-subsection h6 {
                color: var(--accent-blue);
                margin-bottom: 0.5rem;
                font-size: 0.9rem;
            }
            
            .transaction-ids {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }
            
            .transaction-id {
                background: var(--bg-dark);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                border: 1px solid var(--accent-green);
                font-family: monospace;
                font-size: 0.8rem;
            }
            
            .accounts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 0.5rem;
                margin-top: 0.5rem;
            }
            
            .account-item {
                background: var(--bg-dark);
                padding: 0.5rem;
                border-radius: 4px;
                border: 1px solid var(--accent-blue);
            }
            
            .account-item code {
                font-family: monospace;
                font-size: 0.8rem;
                color: var(--text-light);
            }
            
            .accounts-more {
                text-align: center;
                color: var(--text-gray);
                font-style: italic;
                margin-top: 0.5rem;
            }
            
            .attachments-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .attachment-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: var(--bg-dark);
                padding: 0.5rem;
                border-radius: 4px;
                border: 1px solid var(--accent-green);
            }
            
            .attachment-icon {
                font-size: 1.2rem;
            }
            
            .attachment-name {
                flex: 1;
                font-family: monospace;
                font-size: 0.9rem;
            }
            
            .attachment-type {
                background: var(--accent-green);
                color: var(--bg-dark);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.7rem;
                font-weight: 600;
            }
            
            .sar-signature {
                background: var(--bg-secondary);
                padding: 1rem;
                border-radius: 6px;
                border: 2px solid var(--accent-green);
                margin-top: 2rem;
                font-family: monospace;
            }
            
            .signature-line {
                margin: 0.25rem 0;
                font-size: 0.9rem;
            }
        `;
        
        // Only add if not already added
        if (!document.querySelector('#autosar-styles')) {
            style.id = 'autosar-styles';
            document.head.appendChild(style);
        }
    }

    generateHash(reportId) {
        // Simple hash generation for demo purposes
        let hash = 0;
        const str = reportId + new Date().toISOString();
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    }

    async exportReport() {
        if (!this.currentReport) {
            showNotification('No report to export. Generate a report first.', 'warning');
            return;
        }

        try {
            showLoading();
            showNotification('Generating PDF report...', 'info');
            
            // Create PDF generator
            const pdfGenerator = new TriNetraPDFGenerator();
            
            // Generate SAR PDF
            const pdf = await pdfGenerator.generateSARReport(this.currentReport);
            
            // Download PDF
            const filename = `SAR_${this.currentReport.report_id}_${new Date().toISOString().split('T')[0]}.pdf`;
            await pdfGenerator.downloadPDF(filename);
            
            showNotification('PDF report downloaded successfully', 'success');
        } catch (error) {
            console.error('PDF export failed:', error);
            showNotification('Failed to export PDF report', 'error');
        } finally {
            hideLoading();
        }
    }

    formatReportForExport(report) {
        return `
SUSPICIOUS ACTIVITY REPORT
==========================

Report ID: ${report.report_id}
Generated: ${formatDateTime(report.generated_at)}
Priority: ${report.priority}
Title: ${report.title}

EXECUTIVE SUMMARY
-----------------
${report.summary}

TRANSACTION ANALYSIS
-------------------
Pattern Type: ${report.details.pattern_type}
Total Transactions: ${report.details.total_transactions}
Suspicious Transactions: ${report.details.suspicious_transactions}
Total Amount: ${formatCurrency(report.details.total_amount)}
Average Amount: ${formatCurrency(report.details.average_amount)}
Time Period: ${report.details.time_period}

EVIDENCE & INDICATORS
--------------------
Pattern Indicators:
${report.evidence.pattern_indicators.map(indicator => `• ${indicator}`).join('\n')}

Risk Factors:
${report.evidence.risk_factors.map(factor => `• ${factor}`).join('\n')}

Sample Transaction IDs:
${(report.evidence.transaction_ids || []).slice(0, 10).join(', ')}

ACCOUNTS INVOLVED
-----------------
${(report.details.accounts_involved || []).slice(0, 20).join('\n')}

REGULATORY COMPLIANCE
--------------------
Regulatory Codes: ${(report.regulatory_compliance.codes || []).join(', ')}
Filing Deadline: ${report.regulatory_compliance.filing_deadline}
Law Enforcement Notification: ${report.regulatory_compliance.law_enforcement_notification ? 'Required' : 'Not Required'}

RECOMMENDATIONS
--------------
${(report.recommendations || []).map(rec => `• ${rec}`).join('\n')}

ATTACHMENTS
-----------
${Object.entries(report.attachments || {}).map(([type, filename]) => `${type}: ${filename}`).join('\n')}

DIGITAL SIGNATURE
-----------------
System: TriNetra AI System v1.0
Verification Hash: ${this.generateHash(report.report_id)}
Generated at: ${new Date().toISOString()}

---END OF REPORT---
        `.trim();
    }

    setScenario(scenario) {
        this.currentScenario = scenario;
        const select = document.getElementById('sar-scenario');
        if (select) {
            select.value = scenario;
        }
    }

    reset() {
        this.currentReport = null;
        this.initializeContainer();
    }
}

// Export the class
export default AutoSAR;