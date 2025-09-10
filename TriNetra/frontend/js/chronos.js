// CHRONOS Timeline Visualization Module
import api from './api.js';
import { showLoading, hideLoading, formatCurrency, formatDateTime, getSuspicionColor, parseTransactionData, showNotification } from './utils.js';
import TriNetraPDFGenerator from './pdf-generator.js';

class ChronosTimeline {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.width = 0;
        this.height = 400;
        this.margin = { top: 20, right: 30, bottom: 40, left: 50 };
        this.data = [];
        this.currentScenario = 'all';
        this.timeQuantum = '1m'; // New time quantum selection
        this.isPlaying = false;
        this.speed = 10;
        this.currentFrame = 0;
        this.animationId = null;
        this.viewMode = 'timeline'; // 'timeline' or 'network'
        this.selectedNode = null;
        this.networkNodes = [];
        this.networkLinks = [];
        this.searchResults = []; // Store search results
        this.searchModal = null; // Search results modal
        
        this.setupTimeline();
        this.setupControls();
        this.setupSearchModal();
    }

    setupTimeline() {
        // Clear existing content
        d3.select(`#${this.containerId}`).selectAll('*').remove();
        
        // Add explanation panel first
        const container = d3.select(`#${this.containerId}`);
        
        // Add CHRONOS explanation
        container.append('div')
            .attr('class', 'chronos-explanation')
            .html(`
                <div class="explanation-header">
                    <h4>📊 CHRONOS: Transaction Timeline Analysis</h4>
                    <p>Interactive time-based visualization of financial transactions and patterns.</p>
                    <p class="start-instruction">👆 <strong>Click Play to start the timeline animation</strong></p>
                </div>
                <div class="explanation-content">
                    <div class="explanation-item">
                        <span class="emoji">🎬</span>
                        <div>
                            <strong>Time-Lapse Animation:</strong>
                            <span>Watch transactions unfold chronologically over time</span>
                        </div>
                    </div>
                    <div class="explanation-item">
                        <span class="emoji">🔴</span>
                        <div>
                            <strong>Risk Indicators:</strong>
                            <span>Red = High suspicion, Yellow = Medium risk, Blue = Normal</span>
                        </div>
                    </div>
                    <div class="explanation-item">
                        <span class="emoji">⚡</span>
                        <div>
                            <strong>Speed Control:</strong>
                            <span>Adjust animation speed from 1x to 50x for detailed analysis</span>
                        </div>
                    </div>
                    <div class="explanation-item">
                        <span class="emoji">🔍</span>
                        <div>
                            <strong>Interactive Details:</strong>
                            <span>Hover over transactions to see detailed information</span>
                        </div>
                    </div>
                </div>
            `);
        
        // Add status bar
        container.append('div')
            .attr('class', 'status-bar')
            .html(`
                <div class="status-item">
                    <span class="status-label">Total Transactions:</span>
                    <span class="status-value" id="total-count">0</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Suspicious:</span>
                    <span class="status-value" id="suspicious-count">0</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Risk Level:</span>
                    <span class="status-value" id="risk-level">LOW</span>
                </div>
            `);
        
        // Create clean SVG
        this.width = Math.max(this.container.clientWidth - this.margin.left - this.margin.right, 600);
        
        this.svg = container
            .append('svg')
            .attr('class', 'timeline-svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Create scales
        this.xScale = d3.scaleTime().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height - this.margin.bottom, this.margin.top]);

        // Create axes
        this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat('%m/%d %H:%M'));
        this.yAxis = d3.axisLeft(this.yScale).tickFormat(d => formatCurrency(d));

        this.g.append('g')
            .attr('class', 'x-axis timeline-axis')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`);

        this.g.append('g')
            .attr('class', 'y-axis timeline-axis');

        // Add axis labels
        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', 'var(--text-light)')
            .text('Transaction Amount (₹)');

        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${this.width / 2}, ${this.height + 35})`)
            .style('text-anchor', 'middle')
            .style('fill', 'var(--text-light)')
            .text('Time');

        // Create tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${this.width / 2}, ${this.height + this.margin.bottom - 5})`)
            .style('text-anchor', 'middle')
            .style('fill', 'var(--text-gray)')
            .text('Timeline');

        // Create tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'timeline-tooltip')
            .style('position', 'absolute')
            .style('background', 'var(--bg-card)')
            .style('border', '1px solid var(--accent-green)')
            .style('border-radius', '6px')
            .style('padding', '10px')
            .style('color', 'var(--text-light)')
            .style('font-size', '12px')
            .style('z-index', '1000')
            .style('opacity', 0);

        // Add info panel
        container.append('div')
            .attr('class', 'timeline-info')
            .html(`
                <h4>📊 Transaction Analysis</h4>
                <p>Hover over any transaction point to see detailed information</p>
            `);
            
        // Add keyboard shortcuts
        container.append('div')
            .attr('class', 'shortcuts-info')
            .html(`
                <h6>⌨️ Keyboard Controls</h6>
                <ul>
                    <li><kbd>Space</kbd> <span>Play/Pause</span></li>
                    <li><kbd>R</kbd> <span>Reset</span></li>
                    <li><kbd>T</kbd> <span>Timeline View</span></li>
                    <li><kbd>N</kbd> <span>Network View</span></li>
                    <li><kbd>Ctrl+F</kbd> <span>Search</span></li>
                </ul>
            `);
    }

    setupSearchModal() {
        // Create search results modal
        this.searchModal = d3.select('body').append('div')
            .attr('class', 'search-modal hidden')
            .style('position', 'fixed')
            .style('top', '50%')
            .style('left', '50%')
            .style('transform', 'translate(-50%, -50%)')
            .style('background', 'var(--color-dark-light)')
            .style('border', '1px solid var(--color-primary)')
            .style('border-radius', 'var(--radius-xl)')
            .style('padding', 'var(--space-8)')
            .style('max-width', '800px')
            .style('max-height', '600px')
            .style('overflow-y', 'auto')
            .style('z-index', 'var(--z-modal)')
            .style('box-shadow', 'var(--shadow-2xl)');

        // Add modal content structure
        this.searchModal.append('div')
            .attr('class', 'search-modal-header')
            .html(`
                <h3>🔍 Transaction Search Results</h3>
                <button class="close-search-modal" style="float: right; background: none; border: none; color: var(--color-light); font-size: 24px; cursor: pointer;">&times;</button>
            `);

        this.searchModal.append('div')
            .attr('class', 'search-modal-content');

        // Add event listener to close modal
        this.searchModal.select('.close-search-modal')
            .on('click', () => this.hideSearchModal());
    }

    setupControls() {
        const playButton = document.getElementById('play-button');
        const pauseButton = document.getElementById('pause-button');
        const resetButton = document.getElementById('reset-button');
        const speedSlider = document.getElementById('speed-slider');
        const speedDisplay = document.getElementById('speed-display');
        const timelineView = document.getElementById('timeline-view');
        const networkView = document.getElementById('network-view');
        
        // New controls
        const timeQuantumSelect = document.getElementById('time-quantum');
        const transactionSearch = document.getElementById('transaction-search');
        const searchButton = document.getElementById('search-button');
        const searchType = document.getElementById('search-type');

        if (playButton) {
            playButton.addEventListener('click', () => this.play());
        }

        if (pauseButton) {
            pauseButton.addEventListener('click', () => this.pause());
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => this.reset());
        }

        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.speed = parseInt(e.target.value);
                if (speedDisplay) {
                    speedDisplay.textContent = `${this.speed}x`;
                }
            });
        }

        if (timelineView) {
            timelineView.addEventListener('click', () => this.switchView('timeline'));
        }

        if (networkView) {
            networkView.addEventListener('click', () => this.switchView('network'));
        }
        
        const exportButton = document.getElementById('export-chronos');
        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportReport());
        }

        // Time quantum control
        if (timeQuantumSelect) {
            timeQuantumSelect.addEventListener('change', (e) => {
                this.timeQuantum = e.target.value;
                this.loadData(this.currentScenario);
                showNotification(`Time period changed to ${e.target.selectedOptions[0].text}`, 'info');
            });
        }

        // Search controls
        if (searchButton) {
            searchButton.addEventListener('click', () => this.searchTransactions());
        }

        if (transactionSearch) {
            transactionSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchTransactions();
                }
            });
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' && !e.ctrlKey) return; // Don't interfere with input fields
            
            switch(e.key) {
                case ' ':
                case 'Space':
                    e.preventDefault();
                    this.isPlaying ? this.pause() : this.play();
                    break;
                case 'r':
                case 'R':
                    this.reset();
                    break;
                case 't':
                case 'T':
                    this.switchView('timeline');
                    break;
                case 'n':
                case 'N':
                    this.switchView('network');
                    break;
                case 'f':
                case 'F':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        if (transactionSearch) {
                            transactionSearch.focus();
                        }
                    }
                    break;
            }
        });
    }

    async loadData(scenario = 'all') {
        try {
            showLoading();
            this.currentScenario = scenario;
            
            console.log(`🔄 CHRONOS: Loading data for scenario: ${scenario}, time quantum: ${this.timeQuantum}`);
            const response = await api.getTimelineData(scenario, this.timeQuantum);
            console.log('📊 CHRONOS: API Response:', response);
            
            if (response.status === 'success' && response.data) {
                console.log(`📈 CHRONOS: Raw data received: ${response.data.length} transactions`);
                this.data = this.parseEnhancedTransactionData(response.data);
                console.log(`✅ CHRONOS: Parsed data: ${this.data.length} transactions`);
                
                if (this.data.length > 0) {
                    this.render();
                    const timeRange = response.date_range ? 
                        `(${new Date(response.date_range.start).toLocaleDateString()} - ${new Date(response.date_range.end).toLocaleDateString()})` : '';
                    const notificationMessage = `Loaded ${this.data.length} transactions for ${scenario} ${timeRange}`;
                    showNotification(notificationMessage, 'success');
                    
                    // Display layering summary if available
                    if (response.layering_summary) {
                        this.displayLayeringSummary(response.layering_summary);
                    }
                } else {
                    throw new Error('No transaction data available for this scenario and time period');
                }
            } else {
                throw new Error(response.message || 'Failed to load timeline data');
            }
        } catch (error) {
            console.error('❌ CHRONOS Error loading timeline data:', error);
            this.showErrorState(error.message);
            showNotification('Failed to load timeline data', 'error');
        } finally {
            hideLoading();
        }
    }
    
    showErrorState(message) {
        const container = d3.select(`#${this.containerId}`);
        container.selectAll('.error-state').remove();
        
        container.append('div')
            .attr('class', 'error-state')
            .html(`
                <div class="error-content">
                    <h4>⚠️ Unable to Load Timeline Data</h4>
                    <p>${message}</p>
                    <button class="retry-button" onclick="window.TriNetra.getChronos().loadData('${this.currentScenario}')">
                        🔄 Try Again
                    </button>
                </div>
            `);
    }

    parseEnhancedTransactionData(rawData) {
        return rawData.map(tx => {
            // Enhanced parsing with new fields
            const parsedTx = parseTransactionData([tx])[0];
            
            // Add enhanced fields
            parsedTx.aadhar_location = tx.aadhar_location || {};
            parsedTx.layering_analysis = tx.layering_analysis || {};
            parsedTx.country_risk_level = tx.country_risk_level || { level: 1, description: 'Low Risk', color: '#44ff44' };
            parsedTx.transaction_method = tx.transaction_method || 'Unknown';
            parsedTx.bank_details = tx.bank_details || {};
            
            return parsedTx;
        });
    }

    async searchTransactions() {
        const searchInput = document.getElementById('transaction-search');
        const searchTypeSelect = document.getElementById('search-type');
        
        if (!searchInput || !searchInput.value.trim()) {
            showNotification('Please enter a search term', 'warning');
            return;
        }
        
        const searchTerm = searchInput.value.trim();
        const searchType = searchTypeSelect ? searchTypeSelect.value : 'all';
        
        try {
            showLoading();
            console.log(`🔍 CHRONOS: Searching for "${searchTerm}" (type: ${searchType})`);
            
            const response = await api.searchTransactions(searchTerm, searchType);
            
            if (response.status === 'success' && response.results) {
                this.searchResults = response.results;
                this.displaySearchResults(response);
                
                if (response.results.length > 0) {
                    showNotification(`Found ${response.results.length} matching transactions`, 'success');
                } else {
                    showNotification('No transactions found matching your search', 'info');
                }
            } else {
                throw new Error(response.message || 'Search failed');
            }
        } catch (error) {
            console.error('❌ CHRONOS Search error:', error);
            showNotification('Search failed. Please try again.', 'error');
        } finally {
            hideLoading();
        }
    }

    displaySearchResults(response) {
        if (!this.searchModal) return;
        
        const content = this.searchModal.select('.search-modal-content');
        content.selectAll('*').remove();
        
        if (response.results.length === 0) {
            content.html(`
                <div class="no-results">
                    <h4>📭 No Results Found</h4>
                    <p>No transactions match your search criteria.</p>
                    <p><strong>Search term:</strong> "${response.search_term}"</p>
                    <p><strong>Search type:</strong> ${response.search_type}</p>
                </div>
            `);
        } else {
            // Create search results header
            content.append('div')
                .attr('class', 'search-results-header')
                .html(`
                    <p><strong>Found ${response.results.length} transactions</strong></p>
                    <p>Search: "${response.search_term}" in ${response.search_type}</p>
                `);
            
            // Create results container
            const resultsContainer = content.append('div')
                .attr('class', 'search-results-container');
            
            // Add each result
            response.results.forEach((result, index) => {
                const resultDiv = resultsContainer.append('div')
                    .attr('class', 'search-result-item')
                    .style('border', '1px solid var(--color-gray)')
                    .style('border-radius', 'var(--radius-lg)')
                    .style('padding', 'var(--space-4)')
                    .style('margin-bottom', 'var(--space-3)')
                    .style('background', 'rgba(255, 255, 255, 0.02)')
                    .style('cursor', 'pointer')
                    .on('click', () => this.highlightSearchResult(result));
                
                resultDiv.html(this.formatSearchResult(result, index + 1));
            });
        }
        
        this.showSearchModal();
    }

    formatSearchResult(result, index) {
        const suspicionLevel = result.suspicious_score > 0.8 ? 'CRITICAL' : 
                              result.suspicious_score > 0.5 ? 'SUSPICIOUS' : 'NORMAL';
        const suspicionClass = suspicionLevel.toLowerCase();
        
        return `
            <div class="search-result-header">
                <h5>#${index} - Transaction ${result.id}</h5>
                <span class="suspicion-badge ${suspicionClass}">${suspicionLevel}</span>
            </div>
            <div class="search-result-details">
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">${formatCurrency(result.amount)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formatDateTime(result.timestamp)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">From:</span>
                    <span class="detail-value">${result.from_account}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">To:</span>
                    <span class="detail-value">${result.to_account}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${result.aadhar_location ? 
                        `${result.aadhar_location.city}, ${result.aadhar_location.state}, ${result.aadhar_location.country}` : 
                        'Unknown'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Method:</span>
                    <span class="detail-value">${result.transaction_method}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Risk Score:</span>
                    <span class="detail-value ${suspicionClass}">${(result.suspicious_score * 100).toFixed(1)}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Country Risk:</span>
                    <span class="detail-value" style="color: ${result.country_risk_level.color}">
                        ${result.country_risk_level.description}
                    </span>
                </div>
                ${result.layering_analysis && result.layering_analysis.layer_3_integration ? 
                    `<div class="detail-row">
                        <span class="detail-label">Threat Level:</span>
                        <span class="detail-value">${result.layering_analysis.layer_3_integration.threat_level}</span>
                    </div>` : ''}
            </div>
            <div class="search-result-actions">
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); window.TriNetra.getChronos().showDetailedAnalysis('${result.id}')">
                    📊 Detailed Analysis
                </button>
            </div>
        `;
    }

    highlightSearchResult(result) {
        // Close search modal
        this.hideSearchModal();
        
        // Find and highlight the transaction in the timeline
        if (this.data && this.data.length > 0) {
            const transaction = this.data.find(tx => tx.id === result.id);
            if (transaction) {
                this.selectTransaction(transaction);
                showNotification(`Highlighted transaction ${result.id}`, 'info');
            } else {
                showNotification('Transaction not visible in current timeline', 'warning');
            }
        }
    }

    showDetailedAnalysis(transactionId) {
        const result = this.searchResults.find(r => r.id === transactionId);
        if (!result) return;
        
        // Create detailed analysis modal
        const analysisModal = d3.select('body').append('div')
            .attr('class', 'analysis-modal')
            .style('position', 'fixed')
            .style('top', '50%')
            .style('left', '50%')
            .style('transform', 'translate(-50%, -50%)')
            .style('background', 'var(--color-dark-light)')
            .style('border', '1px solid var(--color-primary)')
            .style('border-radius', 'var(--radius-xl)')
            .style('padding', 'var(--space-8)')
            .style('max-width', '900px')
            .style('max-height', '80vh')
            .style('overflow-y', 'auto')
            .style('z-index', 'var(--z-modal)')
            .style('box-shadow', 'var(--shadow-2xl)');
        
        analysisModal.html(this.formatDetailedAnalysis(result));
        
        // Add close button functionality
        analysisModal.select('.close-analysis-modal')
            .on('click', () => analysisModal.remove());
    }

    formatDetailedAnalysis(result) {
        return `
            <div class="analysis-modal-header">
                <h3>🔍 Detailed Transaction Analysis</h3>
                <button class="close-analysis-modal" style="float: right; background: none; border: none; color: var(--color-light); font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div class="analysis-content">
                <div class="analysis-section">
                    <h4>📊 Basic Information</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <strong>Transaction ID:</strong> ${result.id}
                        </div>
                        <div class="analysis-item">
                            <strong>Amount:</strong> ${formatCurrency(result.amount)}
                        </div>
                        <div class="analysis-item">
                            <strong>Date & Time:</strong> ${formatDateTime(result.timestamp)}
                        </div>
                        <div class="analysis-item">
                            <strong>Method:</strong> ${result.transaction_method}
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>🏦 Account Details</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <strong>From Account:</strong> ${result.from_account}
                        </div>
                        <div class="analysis-item">
                            <strong>To Account:</strong> ${result.to_account}
                        </div>
                        <div class="analysis-item">
                            <strong>Bank:</strong> ${result.bank_details.bank_name || 'Unknown'}
                        </div>
                        <div class="analysis-item">
                            <strong>IFSC Code:</strong> ${result.bank_details.ifsc_code || 'Unknown'}
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>📍 Location Analysis</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <strong>City:</strong> ${result.aadhar_location.city || 'Unknown'}
                        </div>
                        <div class="analysis-item">
                            <strong>State/Region:</strong> ${result.aadhar_location.state || 'Unknown'}
                        </div>
                        <div class="analysis-item">
                            <strong>Country:</strong> ${result.aadhar_location.country || 'Unknown'}
                        </div>
                        <div class="analysis-item">
                            <strong>Country Risk:</strong> 
                            <span style="color: ${result.country_risk_level.color}">
                                ${result.country_risk_level.description}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>🔍 Layering Analysis</h4>
                    ${this.formatLayeringAnalysis(result.layering_analysis)}
                </div>
                
                <div class="analysis-section">
                    <h4>⚠️ Risk Assessment</h4>
                    <div class="risk-assessment">
                        <div class="risk-score" style="color: ${result.suspicious_score > 0.8 ? '#ff4444' : 
                                                             result.suspicious_score > 0.5 ? '#ffaa00' : '#44ff44'}">
                            Risk Score: ${(result.suspicious_score * 100).toFixed(1)}%
                        </div>
                        <div class="risk-level">
                            Threat Level: ${result.layering_analysis.layer_3_integration?.threat_level || 'LOW'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatLayeringAnalysis(layering) {
        if (!layering) return '<p>No layering analysis available</p>';
        
        return `
            <div class="layering-layers">
                <div class="layer-item">
                    <h5>Layer 1: ${layering.layer_1_extraction?.description || 'Data Extraction'}</h5>
                    <ul>
                        ${(layering.layer_1_extraction?.patterns_detected || []).map(p => `<li>${p}</li>`).join('')}
                        ${(layering.layer_1_extraction?.risk_indicators || []).map(r => `<li style="color: #ffaa00">${r}</li>`).join('')}
                    </ul>
                </div>
                <div class="layer-item">
                    <h5>Layer 2: ${layering.layer_2_processing?.description || 'Pattern Processing'}</h5>
                    <ul>
                        <li>Connected Accounts: ${layering.layer_2_processing?.connected_accounts || 0}</li>
                        ${(layering.layer_2_processing?.temporal_patterns || []).map(p => `<li>${p}</li>`).join('')}
                        ${(layering.layer_2_processing?.amount_patterns || []).map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
                <div class="layer-item">
                    <h5>Layer 3: ${layering.layer_3_integration?.description || 'Integration Analysis'}</h5>
                    <ul>
                        <li>Threat Level: <strong>${layering.layer_3_integration?.threat_level || 'LOW'}</strong></li>
                        <li>Geolocation Risk: ${layering.layer_3_integration?.geolocation_risk || 'NORMAL'}</li>
                        <li>Confidence: ${((layering.layer_3_integration?.pattern_match_confidence || 0) * 100).toFixed(1)}%</li>
                    </ul>
                </div>
            </div>
        `;
    }

    displayLayeringSummary(summary) {
        // Display layering summary in the info panel
        const infoContainer = document.getElementById('timeline-info');
        if (!infoContainer) return;
        
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'layering-summary';
        summaryDiv.innerHTML = `
            <h4>🔍 Layering Analysis Summary</h4>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">Total Transactions:</span>
                    <span class="stat-value">${summary.total_transactions}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Critical Risk:</span>
                    <span class="stat-value critical">${summary.risk_distribution.critical}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Medium Risk:</span>
                    <span class="stat-value suspicious">${summary.risk_distribution.medium}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Low Risk:</span>
                    <span class="stat-value normal">${summary.risk_distribution.low}</span>
                </div>
            </div>
            <div class="effectiveness-metrics">
                <h5>Detection Effectiveness:</h5>
                <div class="metric-item">
                    Layer 1: ${(summary.layering_effectiveness.layer_1_detection_rate * 100).toFixed(1)}%
                </div>
                <div class="metric-item">
                    Layer 2: ${(summary.layering_effectiveness.layer_2_processing_rate * 100).toFixed(1)}%
                </div>
                <div class="metric-item">
                    Layer 3: ${(summary.layering_effectiveness.layer_3_integration_rate * 100).toFixed(1)}%
                </div>
            </div>
        `;
        
        infoContainer.insertBefore(summaryDiv, infoContainer.firstChild);
    }

    showSearchModal() {
        if (this.searchModal) {
            this.searchModal.classed('hidden', false);
        }
    }

    hideSearchModal() {
        if (this.searchModal) {
            this.searchModal.classed('hidden', true);
        }
    }

    updateStatusBar() {
        if (!this.data || this.data.length === 0) return;
        
        const suspiciousCount = this.data.filter(d => d.suspicious_score > 0.5).length;
        const criticalCount = this.data.filter(d => d.suspicious_score > 0.8).length;
        const threatPercentage = (suspiciousCount / this.data.length) * 100;
        
        let riskLevel, riskClass;
        if (criticalCount > 0) {
            riskLevel = 'HIGH';
            riskClass = 'critical';
        } else if (threatPercentage > 25) {
            riskLevel = 'MEDIUM';
            riskClass = 'medium';
        } else if (threatPercentage > 10) {
            riskLevel = 'LOW';
            riskClass = 'low';
        } else {
            riskLevel = 'MINIMAL';
            riskClass = 'low';
        }
        
        const totalElement = document.getElementById('total-count');
        const suspiciousElement = document.getElementById('suspicious-count');
        const riskElement = document.getElementById('risk-level');
        
        if (totalElement) totalElement.textContent = this.data.length;
        if (suspiciousElement) {
            suspiciousElement.textContent = suspiciousCount;
            suspiciousElement.className = suspiciousCount > 0 ? 'status-value alert' : 'status-value';
        }
        if (riskElement) {
            riskElement.textContent = riskLevel;
            riskElement.className = `status-value ${riskClass}`;
        }
    }
    
    showNoDataState() {
        const infoPanel = d3.select(`#${this.containerId} .timeline-info`);
        if (!infoPanel.empty()) {
            infoPanel.html(`
                <h4>⚠️ No Data Available</h4>
                <p>No transaction data found for the selected scenario. Please try a different filter or check the data source.</p>
            `);
        }
    }

    render() {
        if (!this.data.length) {
            this.showNoDataState();
            return;
        }

        // Update status bar
        this.updateStatusBar();

        // Clear any existing content first (important for view switching)
        this.g.selectAll('*').remove();
        
        // Re-create axes for timeline view
        this.g.append('g')
            .attr('class', 'x-axis timeline-axis')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`);

        this.g.append('g')
            .attr('class', 'y-axis timeline-axis');

        // Re-add axis labels
        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', 'var(--text-gray)')
            .text('Transaction Amount (₹)');

        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${this.width / 2}, ${this.height + this.margin.bottom - 5})`)
            .style('text-anchor', 'middle')
            .style('fill', 'var(--text-gray)')
            .text('Timeline');

        // Update scales
        this.xScale.domain(d3.extent(this.data, d => d.timestamp));
        this.yScale.domain([0, d3.max(this.data, d => d.amount)]);

        // Update axes
        this.g.select('.x-axis').call(this.xAxis);
        this.g.select('.y-axis').call(this.yAxis);

        // Render transactions (all hidden initially)
        this.renderTransactions();
        this.renderConnections();
        
        // Reset animation and ensure it starts paused
        this.currentFrame = 0;
        this.isPlaying = false;
        this.updateButtonStates();
        this.updateTimelineInfo();
        
        // Hide all transactions initially
        this.g.selectAll('.transaction-node').style('opacity', 0.1);
        this.g.selectAll('.transaction-link').style('opacity', 0.1);
        
        console.log('📈 CHRONOS: Timeline view rendered successfully');
    }

    renderTransactions() {
        const nodes = this.g.selectAll('.transaction-node')
            .data(this.data, d => d.id);

        // Remove old nodes
        nodes.exit().remove();

        // Add new nodes
        const nodeEnter = nodes.enter()
            .append('circle')
            .attr('class', d => `transaction-node ${d.suspicionLevel}`)
            .attr('r', 0)
            .attr('cx', d => this.xScale(d.timestamp))
            .attr('cy', d => this.yScale(d.amount))
            .style('fill', d => d.color)
            .style('opacity', 0);

        // Update existing nodes
        nodes.merge(nodeEnter)
            .transition()
            .duration(500)
            .attr('cx', d => this.xScale(d.timestamp))
            .attr('cy', d => this.yScale(d.amount))
            .attr('r', d => d.suspicionLevel === 'critical' ? 8 : d.suspicionLevel === 'suspicious' ? 6 : 4)
            .style('fill', d => d.color)
            .style('opacity', 0.8);

        // Add hover effects
        this.g.selectAll('.transaction-node')
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip())
            .on('click', (event, d) => this.selectTransaction(d));
    }

    renderConnections() {
        // Group transactions by account to show flow patterns
        const connections = [];
        const accountMap = new Map();

        this.data.forEach(tx => {
            if (!accountMap.has(tx.from_account)) {
                accountMap.set(tx.from_account, []);
            }
            if (!accountMap.has(tx.to_account)) {
                accountMap.set(tx.to_account, []);
            }
            
            accountMap.get(tx.from_account).push(tx);
            accountMap.get(tx.to_account).push(tx);
        });

        // Create connections for suspicious patterns
        this.data.forEach((tx, i) => {
            if (tx.suspicious_score > 0.7 && i < this.data.length - 1) {
                const nextTx = this.data[i + 1];
                if (tx.to_account === nextTx.from_account) {
                    connections.push({
                        source: tx,
                        target: nextTx,
                        suspicious: Math.max(tx.suspicious_score, nextTx.suspicious_score)
                    });
                }
            }
        });

        const links = this.g.selectAll('.transaction-link')
            .data(connections);

        links.exit().remove();

        links.enter()
            .append('line')
            .attr('class', 'transaction-link')
            .merge(links)
            .attr('x1', d => this.xScale(d.source.timestamp))
            .attr('y1', d => this.yScale(d.source.amount))
            .attr('x2', d => this.xScale(d.target.timestamp))
            .attr('y2', d => this.yScale(d.target.amount))
            .style('stroke-width', d => d.suspicious > 0.8 ? 3 : 1)
            .style('opacity', d => d.suspicious > 0.8 ? 0.8 : 0.4);
    }

    showTooltip(event, d) {
        const suspicionScore = (d.suspicious_score * 100).toFixed(1);
        let riskClass = 'normal';
        if (d.suspicious_score > 0.8) riskClass = 'critical';
        else if (d.suspicious_score > 0.5) riskClass = 'suspicious';
        
        this.tooltip
            .style('opacity', 1)
            .html(`
                <h6>Transaction Details</h6>
                <div class="detail-row">
                    <span class="detail-label">ID:</span>
                    <span class="detail-value">${d.id || d.transaction_id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">${formatCurrency(d.amount)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${formatDateTime(d.timestamp)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">From:</span>
                    <span class="detail-value">${d.from_account}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">To:</span>
                    <span class="detail-value">${d.to_account}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Risk Score:</span>
                    <span class="detail-value ${riskClass}">${suspicionScore}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Scenario:</span>
                    <span class="detail-value">${d.scenario || 'Unknown'}</span>
                </div>
            `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        
        // Don't update info panel on hover - only show tooltip
    }

    hideTooltip() {
        this.tooltip.style('opacity', 0);
    }

    selectTransaction(transaction) {
        // Highlight related transactions
        this.g.selectAll('.transaction-node')
            .classed('highlighted', false)
            .style('opacity', 0.3);

        this.g.selectAll('.transaction-node')
            .filter(d => d.from_account === transaction.from_account || 
                        d.to_account === transaction.to_account ||
                        d.id === transaction.id)
            .classed('highlighted', true)
            .style('opacity', 1);

        this.updateTimelineInfo(transaction);
    }

    updateTimelineInfo(selectedTransaction = null) {
        const infoPanel = d3.select(`#${this.containerId} .timeline-info`);
        if (infoPanel.empty()) return;

        if (selectedTransaction) {
            const suspicionScore = (selectedTransaction.suspicious_score * 100).toFixed(1);
            let riskLevel = 'Normal';
            let riskClass = 'normal';
            
            if (selectedTransaction.suspicious_score > 0.8) {
                riskLevel = 'Critical';
                riskClass = 'critical';
            } else if (selectedTransaction.suspicious_score > 0.5) {
                riskLevel = 'Suspicious';
                riskClass = 'suspicious';
            }
            
            infoPanel.html(`
                <h4>🔍 Selected Transaction Analysis</h4>
                <div class="transaction-details">
                    <div class="detail-item">
                        <div class="detail-label">Transaction ID</div>
                        <div class="detail-value">${selectedTransaction.id || selectedTransaction.transaction_id}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Amount</div>
                        <div class="detail-value">${formatCurrency(selectedTransaction.amount)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date & Time</div>
                        <div class="detail-value">${formatDateTime(selectedTransaction.timestamp)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">From Account</div>
                        <div class="detail-value">${selectedTransaction.from_account}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">To Account</div>
                        <div class="detail-value">${selectedTransaction.to_account}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Risk Assessment</div>
                        <div class="detail-value ${riskClass}">${riskLevel} (${suspicionScore}%)</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Scenario</div>
                        <div class="detail-value">${selectedTransaction.scenario || 'Unknown'}</div>
                    </div>
                </div>
            `);
        } else {
            // Show overview statistics when no transaction is selected
            const stats = this.calculateStats();
            infoPanel.html(`
                <h4>📊 Timeline Overview - ${this.currentScenario}</h4>
                <div class="transaction-details">
                    <div class="detail-item">
                        <div class="detail-label">Total Transactions</div>
                        <div class="detail-value">${stats.total}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Suspicious Transactions</div>
                        <div class="detail-value">${stats.suspicious}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Critical Transactions</div>
                        <div class="detail-value">${stats.critical}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Total Amount</div>
                        <div class="detail-value">${formatCurrency(stats.totalAmount)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Average Amount</div>
                        <div class="detail-value">${formatCurrency(stats.avgAmount)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Average Suspicion</div>
                        <div class="detail-value">${(stats.avgSuspicion * 100).toFixed(1)}%</div>
                    </div>
                </div>
                <p style="margin-top: 1rem; color: var(--text-gray); font-size: 0.9rem;">💡 Click on any transaction point to see detailed analysis information.</p>
            `);
        }
    }

    calculateStats() {
        const total = this.data.length;
        const suspicious = this.data.filter(tx => tx.suspicious_score > 0.5).length;
        const critical = this.data.filter(tx => tx.suspicious_score > 0.8).length;
        const totalAmount = this.data.reduce((sum, tx) => sum + tx.amount, 0);
        const avgAmount = totalAmount / total;
        const avgSuspicion = this.data.reduce((sum, tx) => sum + tx.suspicious_score, 0) / total;

        return { total, suspicious, critical, totalAmount, avgAmount, avgSuspicion };
    }

    play() {
        if (this.isPlaying || !this.data.length) return;
        
        this.isPlaying = true;
        
        // Update button states
        this.updateButtonStates();
        
        this.animate();
        showNotification('Timeline animation started', 'info');
    }

    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Update button states
        this.updateButtonStates();
        
        showNotification('Timeline animation paused', 'info');
    }

    animate() {
        if (!this.isPlaying || !this.data.length) {
            console.log(`⏸️ CHRONOS: Animation stopped. Playing: ${this.isPlaying}, Data length: ${this.data.length}`);
            return;
        }

        // Calculate step size based on speed - slower speeds show fewer transactions per frame
        const step = Math.max(1, Math.floor(this.speed / 5));
        const visibleCount = Math.min(this.currentFrame * step, this.data.length);
        
        console.log(`🎬 CHRONOS: Frame ${this.currentFrame}, showing ${visibleCount}/${this.data.length} transactions`);
        
        // Animate transaction nodes
        const nodes = this.g.selectAll('.transaction-node');
        
        nodes.style('opacity', (d, i) => {
            if (!d) return 0; // Handle undefined data
            
            if (i < visibleCount) {
                // Add entrance animation for new nodes
                if (i >= (this.currentFrame - 1) * step && i < this.currentFrame * step) {
                    // Use d3.select with the current element instead of 'this'
                    d3.select(nodes.nodes()[i]).transition().duration(500)
                        .attr('r', d => {
                            if (!d) return 4;
                            return d.suspicionLevel === 'critical' ? 8 : d.suspicionLevel === 'suspicious' ? 6 : 4;
                        })
                        .style('opacity', 0.8);
                }
                return 0.8;
            }
            return 0.1;
        });

        // Animate transaction links
        this.g.selectAll('.transaction-link')
            .style('opacity', (d, i) => i < visibleCount ? 0.6 : 0.1);

        // Update info panel with current progress
        this.updateAnimationProgress(visibleCount);

        this.currentFrame++;
        
        if (visibleCount < this.data.length) {
            this.animationId = requestAnimationFrame(() => {
                setTimeout(() => this.animate(), Math.max(50, 150 - this.speed)); // Improved speed control
            });
        } else {
            this.isPlaying = false;
            this.updateButtonStates();
            console.log('✅ CHRONOS: Animation completed');
            showNotification('Timeline animation completed', 'success');
            // Reset for replay
            this.currentFrame = 0;
        }
    }

    updateAnimationProgress(visibleCount) {
        if (!this.data || this.data.length === 0) {
            console.log('⚠️ CHRONOS: No data available for progress update');
            return;
        }
        
        const progress = Math.round((visibleCount / this.data.length) * 100);
        const infoContainer = document.getElementById('timeline-info');
        
        if (infoContainer && this.isPlaying) {
            const progressDiv = infoContainer.querySelector('.animation-progress') || document.createElement('div');
            progressDiv.className = 'animation-progress';
            progressDiv.innerHTML = `
                <h4>🎬 Animation Progress: ${progress}%</h4>
                <div style="background: var(--bg-secondary); border-radius: 10px; height: 20px; margin: 10px 0;">
                    <div style="background: linear-gradient(90deg, var(--accent-green), var(--accent-blue)); 
                               height: 100%; border-radius: 10px; width: ${progress}%; transition: width 0.3s ease;"></div>
                </div>
                <p>📊 Showing ${visibleCount} of ${this.data.length} transactions</p>
                <p>⚡ Speed: ${this.speed}x | Scenario: ${this.currentScenario}</p>
            `;
            if (!infoContainer.querySelector('.animation-progress')) {
                infoContainer.insertBefore(progressDiv, infoContainer.firstChild);
            }
        }
    }

    switchView(mode) {
        if (this.viewMode === mode) return;
        
        this.pause(); // Stop animation when switching views
        this.viewMode = mode;
        
        // Update button states
        document.querySelectorAll('.view-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-view`).classList.add('active');
        
        // Clear the current visualization before switching
        this.clearVisualization();
        
        if (mode === 'timeline') {
            this.renderTimeline();
        } else if (mode === 'network') {
            this.renderNetwork();
        }
        
        showNotification(`Switched to ${mode} view`, 'info');
    }

    renderNetwork() {
        if (!this.data.length) {
            console.log('⚠️ CHRONOS: No data available for network view');
            return;
        }
        
        console.log(`🕸️ CHRONOS: Rendering network view with ${this.data.length} transactions`);
        
        // Clear existing visualization
        this.g.selectAll('*').remove();
        
        // Create network data from transactions
        this.createNetworkData();
        
        // Set up force simulation
        this.simulation = d3.forceSimulation(this.networkNodes)
            .force('link', d3.forceLink(this.networkLinks).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(30));

        // Create links
        const link = this.g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.networkLinks)
            .enter().append('line')
            .attr('class', 'network-link')
            .style('stroke', d => d.suspicious ? 'var(--danger-red)' : 'var(--accent-green)')
            .style('stroke-width', d => d.suspicious ? 3 : 1)
            .style('opacity', 0.6);

        // Create nodes
        const node = this.g.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.networkNodes)
            .enter().append('circle')
            .attr('class', 'network-node')
            .attr('r', d => d.type === 'account' ? (d.suspicious ? 15 : 10) : 8)
            .style('fill', d => {
                if (d.type === 'account') {
                    return d.suspicious ? 'var(--danger-red)' : 'var(--accent-blue)';
                }
                return 'var(--accent-green)'; // Default color for non-account nodes
            })
            .style('stroke', 'white')
            .style('stroke-width', 2)
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }))
            .on('click', (event, d) => this.selectNetworkNode(d))
            .on('mouseover', (event, d) => this.showNetworkTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        // Add labels
        const label = this.g.append('g')
            .attr('class', 'labels')
            .selectAll('text')
            .data(this.networkNodes)
            .enter().append('text')
            .attr('class', 'network-label')
            .style('font-size', '10px')
            .style('fill', 'var(--text-light)')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .text(d => d.label);

        // Update positions on simulation tick
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            label
                .attr('x', d => d.x)
                .attr('y', d => d.y + 5);
        });
    }

    createNetworkData() {
        // Create account nodes and transaction links
        const accounts = new Map();
        const links = [];
        
        console.log(`🔧 CHRONOS: Creating network data from ${this.data.length} transactions`);
        
        this.data.forEach(tx => {
            // Create or update account nodes
            if (!accounts.has(tx.from_account)) {
                accounts.set(tx.from_account, {
                    id: tx.from_account,
                    label: tx.from_account.substring(0, 8) + '...',
                    type: 'account',
                    suspicious: false,
                    transactions: []
                });
            }
            
            if (!accounts.has(tx.to_account)) {
                accounts.set(tx.to_account, {
                    id: tx.to_account,
                    label: tx.to_account.substring(0, 8) + '...',
                    type: 'account',
                    suspicious: false,
                    transactions: []
                });
            }
            
            // Update suspicion levels
            if (tx.suspicious_score > 0.7) {
                accounts.get(tx.from_account).suspicious = true;
                accounts.get(tx.to_account).suspicious = true;
            }
            
            accounts.get(tx.from_account).transactions.push(tx);
            accounts.get(tx.to_account).transactions.push(tx);
            
            // Create link
            links.push({
                source: tx.from_account,
                target: tx.to_account,
                suspicious: tx.suspicious_score > 0.7,
                amount: tx.amount,
                transaction: tx
            });
        });
        
        this.networkNodes = Array.from(accounts.values());
        this.networkLinks = links;
        
        console.log(`🕸️ CHRONOS: Created network with ${this.networkNodes.length} nodes and ${this.networkLinks.length} links`);
    }

    clearVisualization() {
        // Stop any ongoing animations
        this.pause();
        
        // Clear all SVG content when switching views
        if (this.g) {
            this.g.selectAll('*').remove();
        }
        
        // Stop and clear any D3 force simulations
        if (this.simulation) {
            this.simulation.stop();
            this.simulation = null;
        }
        
        // Reset stored selections and state
        this.selectedNode = null;
        this.currentFrame = 0;
        
        // Clear any animation intervals
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Reset button states
        this.isPlaying = false;
        this.updateButtonStates();
        
        console.log('🧹 CHRONOS: Cleared visualization completely for view switch');
    }

    renderTimeline() {
        console.log('📈 CHRONOS: Rendering timeline view');
        
        // Clear any network-specific selections
        this.clearSelection();
        
        // Render the timeline
        this.render(); // Use existing timeline render method
    }

    selectNetworkNode(node) {
        this.selectedNode = node;
        
        // Highlight connected nodes and links
        this.g.selectAll('.network-node')
            .style('opacity', d => d === node || this.isConnected(d, node) ? 1 : 0.3);
            
        this.g.selectAll('.network-link')
            .style('opacity', d => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                return (sourceId === node.id || targetId === node.id) ? 1 : 0.1;
            });
            
        // Update info panel
        this.updateNetworkInfo(node);
    }

    isConnected(nodeA, nodeB) {
        return this.networkLinks.some(link => {
            // Handle both string IDs and node objects
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            return (sourceId === nodeA.id && targetId === nodeB.id) ||
                   (sourceId === nodeB.id && targetId === nodeA.id);
        });
    }

    showNetworkTooltip(event, d) {
        const content = d.type === 'account' 
            ? `Account: ${d.id}<br/>Transactions: ${d.transactions.length}<br/>Suspicious: ${d.suspicious ? 'Yes' : 'No'}`
            : `Network Node<br/>Type: ${d.type || 'Unknown'}`;
            
        this.tooltip
            .style('opacity', 1)
            .html(content)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    updateNetworkInfo(node) {
        const infoContainer = document.getElementById('timeline-info');
        if (!infoContainer || !node) return;

        infoContainer.innerHTML = `
            <h4>🕸️ Network Node Details</h4>
            <div class="network-details">
                <div class="detail-item">
                    <div class="detail-label">Node ID</div>
                    <div class="detail-value">${node.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Type</div>
                    <div class="detail-value">${node.type}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Transactions</div>
                    <div class="detail-value">${node.transactions ? node.transactions.length : 0}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Risk Level</div>
                    <div class="detail-value">${node.suspicious ? 'High' : 'Normal'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Connected Accounts</div>
                    <div class="detail-value">${this.getConnectedAccounts(node).length}</div>
                </div>
            </div>
            <div class="network-actions">
                <button onclick="window.TriNetra.getChronos().clearSelection()" class="control-button">
                    Clear Selection
                </button>
            </div>
        `;
    }

    getConnectedAccounts(node) {
        return this.networkLinks
            .filter(link => link.source.id === node.id || link.target.id === node.id)
            .map(link => link.source.id === node.id ? link.target : link.source)
            .filter((account, index, self) => self.findIndex(a => a.id === account.id) === index);
    }

    clearSelection() {
        this.selectedNode = null;
        
        // Reset all opacities for both network and timeline elements
        this.g.selectAll('.network-node').style('opacity', 1);
        this.g.selectAll('.network-link').style('opacity', 0.6);
        this.g.selectAll('.transaction-node').style('opacity', 0.8).classed('highlighted', false);
        this.g.selectAll('.transaction-link').style('opacity', 0.4);
        
        // Reset info panel
        this.updateTimelineInfo();
        
        console.log('🧹 CHRONOS: Cleared all selections');
    }

    updateButtonStates() {
        const playButton = document.getElementById('play-button');
        const pauseButton = document.getElementById('pause-button');
        
        if (playButton && pauseButton) {
            if (this.isPlaying) {
                playButton.style.opacity = '0.5';
                playButton.disabled = true;
                pauseButton.style.opacity = '1';
                pauseButton.disabled = false;
            } else {
                playButton.style.opacity = '1';
                playButton.disabled = false;
                pauseButton.style.opacity = '0.5';
                pauseButton.disabled = true;
            }
        }
    }

    reset() {
        this.pause();
        this.currentFrame = 0;
        this.selectedNode = null;
        
        // Clear any existing visualization first
        this.clearVisualization();
        
        // Always ensure proper view rendering
        if (this.viewMode === 'timeline') {
            this.renderTimeline();
        } else if (this.viewMode === 'network') {
            this.renderNetwork();
        }
        
        console.log(`🔄 CHRONOS: Reset completed for ${this.viewMode} view`);
    }

    resize() {
        this.width = this.container.clientWidth - this.margin.left - this.margin.right;
        this.svg.attr('width', this.width + this.margin.left + this.margin.right);
        this.xScale.range([0, this.width]);
        
        if (this.viewMode === 'timeline') {
            this.render();
        } else {
            this.renderNetwork();
        }
    }
    
    async exportReport() {
        if (!this.data || this.data.length === 0) {
            showNotification('No data to export. Load timeline data first.', 'warning');
            return;
        }

        try {
            showLoading();
            showNotification('Generating CHRONOS PDF report...', 'info');
            
            // Create PDF generator
            const pdfGenerator = new TriNetraPDFGenerator();
            
            // Prepare network data if available
            const networkData = {
                networkNodes: this.networkNodes || [],
                networkLinks: this.networkLinks || []
            };
            
            // Generate CHRONOS PDF
            const pdf = await pdfGenerator.generateChronosReport(
                this.data, 
                networkData, 
                this.currentScenario
            );
            
            // Download PDF
            const filename = `CHRONOS_${this.currentScenario}_${new Date().toISOString().split('T')[0]}.pdf`;
            await pdfGenerator.downloadPDF(filename);
            
            showNotification('CHRONOS PDF report downloaded successfully', 'success');
        } catch (error) {
            console.error('CHRONOS PDF export failed:', error);
            showNotification('Failed to export CHRONOS PDF report', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Export the class
export default ChronosTimeline;