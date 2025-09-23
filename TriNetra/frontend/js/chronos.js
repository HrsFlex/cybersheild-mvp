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
        this.setupNetworkOverview();
    }

    setupTimeline() {
        // Clear existing content
        d3.select(`#${this.containerId}`).selectAll('*').remove();
        
        // Add explanation panel first
        const container = d3.select(`#${this.containerId}`);
        
        // Add CHRONOS explanation
        container.append('div')
            .attr('class', 'chronos-explanation bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20 mb-8 shadow-xl')
            .html(`
                <div class="explanation-header text-center mb-8">
                    <h4 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">📊 CHRONOS: Transaction Timeline Analysis</h4>
                    <p class="text-xl text-gray-300 mb-6 leading-relaxed">Interactive time-based visualization of financial transactions and patterns with advanced AI-powered detection.</p>
                    <div class="bg-primary/20 border border-primary/40 rounded-xl p-4 inline-block">
                        <p class="start-instruction text-lg font-bold text-primary">👆 <strong>Click Play to start the timeline animation</strong></p>
                    </div>
                </div>
                <div class="explanation-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="explanation-item bg-dark/40 rounded-xl p-6 border border-green-400/20 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105">
                        <div class="text-center mb-4">
                            <span class="emoji text-4xl block mb-2">🎬</span>
                            <strong class="text-green-400 text-lg block mb-2">Time-Lapse Animation</strong>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">Watch transactions unfold chronologically over time with smooth animations and real-time pattern detection.</p>
                    </div>
                    <div class="explanation-item bg-dark/40 rounded-xl p-6 border border-red-400/20 hover:border-red-400/50 transition-all duration-300 hover:transform hover:scale-105">
                        <div class="text-center mb-4">
                            <span class="emoji text-4xl block mb-2">🔴</span>
                            <strong class="text-red-400 text-lg block mb-2">Risk Indicators</strong>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">
                            <span class="text-red-400 font-semibold">Red</span> = High suspicion, 
                            <span class="text-yellow-400 font-semibold">Yellow</span> = Medium risk, 
                            <span class="text-blue-400 font-semibold">Blue</span> = Normal transactions
                        </p>
                    </div>
                    <div class="explanation-item bg-dark/40 rounded-xl p-6 border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
                        <div class="text-center mb-4">
                            <span class="emoji text-4xl block mb-2">⚡</span>
                            <strong class="text-yellow-400 text-lg block mb-2">Speed Control</strong>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">Adjust animation speed from 0.25x to 4x for detailed forensic analysis and pattern identification.</p>
                    </div>
                    <div class="explanation-item bg-dark/40 rounded-xl p-6 border border-purple-400/20 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105">
                        <div class="text-center mb-4">
                            <span class="emoji text-4xl block mb-2">🔍</span>
                            <strong class="text-purple-400 text-lg block mb-2">Interactive Details</strong>
                        </div>
                        <p class="text-gray-300 text-sm leading-relaxed">Hover over transactions to see detailed information, risk scores, and ML-powered insights.</p>
                    </div>
                </div>
            `);
        
        // Add status bar
        container.append('div')
            .attr('class', 'status-bar bg-gradient-to-r from-dark-secondary/80 to-dark-accent/80 rounded-2xl p-6 mb-8 border border-primary/30 shadow-lg')
            .html(`
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="status-item bg-dark/40 rounded-xl p-4 text-center border border-secondary/20">
                        <div class="text-secondary font-bold text-2xl mb-1" id="total-count">0</div>
                        <div class="text-gray-300 text-sm">Total Transactions</div>
                    </div>
                    <div class="status-item bg-dark/40 rounded-xl p-4 text-center border border-red-400/20">
                        <div class="text-red-400 font-bold text-2xl mb-1" id="suspicious-count">0</div>
                        <div class="text-gray-300 text-sm">Suspicious Patterns</div>
                    </div>
                    <div class="status-item bg-dark/40 rounded-xl p-4 text-center border border-orange-400/20">
                        <div class="font-bold text-2xl mb-1" id="risk-level">LOW</div>
                        <div class="text-gray-300 text-sm">Risk Assessment</div>
                    </div>
                </div>
            `);
        
        // Create clean SVG with improved styling
        this.width = Math.max(this.container.clientWidth - this.margin.left - this.margin.right, 800);
        
        this.svg = container
            .append('svg')
            .attr('class', 'timeline-svg bg-dark/20 rounded-xl border border-primary/20')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .style('background', 'linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.85) 50%, rgba(22, 33, 62, 0.75) 100%)')
            .style('backdrop-filter', 'blur(12px)')
            .style('border', '2px solid rgba(0, 255, 135, 0.3)')
            .style('box-shadow', '0 8px 32px rgba(0, 255, 135, 0.1)');

        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Create scales
        this.xScale = d3.scaleTime().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height - this.margin.bottom, this.margin.top]);

        // Create axes with enhanced styling
        this.xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d3.timeFormat('%m/%d\n%H:%M'))
            .ticks(12)
            .tickSize(-this.height + this.margin.top + this.margin.bottom)
            .tickPadding(15);
            
        this.yAxis = d3.axisLeft(this.yScale)
            .tickFormat(d => {
                if (d >= 1000000) return `₹${(d/1000000).toFixed(1)}M`;
                if (d >= 100000) return `₹${(d/1000).toFixed(0)}K`;
                if (d >= 1000) return `₹${(d/1000).toFixed(1)}K`;
                return `₹${d.toFixed(0)}`;
            })
            .ticks(10)
            .tickSize(-this.width)
            .tickPadding(15);

        // Add grid lines and axes
        this.g.append('g')
            .attr('class', 'x-axis timeline-axis')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
            .style('color', '#4a5568')
            .style('font-size', '12px');

        this.g.append('g')
            .attr('class', 'y-axis timeline-axis')
            .style('color', '#4a5568')
            .style('font-size', '12px');

        // Add enhanced axis labels
        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left + 15)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', '#00ff87')
            .style('font-size', '14px')
            .style('font-weight', '600')
            .text('💰 Transaction Amount (₹)');

        this.g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `translate(${this.width / 2}, ${this.height + this.margin.bottom - 5})`)
            .style('text-anchor', 'middle')
            .style('fill', '#00d4ff')
            .style('font-size', '14px')
            .style('font-weight', '600')
            .text('⏰ Timeline (Date & Time)');
            
        // Add enhanced CSS for grid lines and better readability
        this.svg.append('defs').append('style').text(`
            .timeline-axis .tick line {
                stroke: rgba(255, 255, 255, 0.6);
                stroke-width: 1px;
                opacity: 1;
            }
            .timeline-axis .domain {
                stroke: #ffffff;
                stroke-width: 3px;
                opacity: 1;
            }
            .timeline-axis text {
                fill: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                font-weight: 500;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            }
            .timeline-axis .tick:hover line {
                stroke: rgba(255, 255, 255, 0.8);
                stroke-width: 2px;
            }
        `);

        // Create enhanced tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'chronos-tooltip')
            .style('position', 'absolute')
            .style('background', 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)')
            .style('backdrop-filter', 'blur(12px)')
            .style('border', '1px solid #00ff87')
            .style('border-radius', '12px')
            .style('padding', '16px')
            .style('color', '#ffffff')
            .style('font-size', '13px')
            .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
            .style('box-shadow', '0 8px 32px rgba(0, 255, 135, 0.15)')
            .style('z-index', '10000')
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .style('transition', 'all 0.2s ease-in-out');

        // Add info panel
        container.append('div')
            .attr('class', 'timeline-info bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-8 mb-8 border border-secondary/20 shadow-lg')
            .html(`
                <div class="text-center mb-6">
                    <h4 class="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4">📊 Transaction Analysis Dashboard</h4>
                    <p class="text-lg text-gray-300 leading-relaxed">Comprehensive real-time analysis of financial transaction patterns and risk assessment.</p>
                </div>
            `);
            
        // Add keyboard shortcuts
        container.append('div')
            .attr('class', 'shortcuts-info bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-400/20 shadow-lg')
            .html(`
                <div class="text-center mb-6">
                    <h6 class="text-2xl font-bold text-purple-400 mb-4 flex items-center justify-center">
                        ⌨️ Keyboard Controls
                        <span class="ml-3 text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">Pro Tips</span>
                    </h6>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div class="bg-dark/40 rounded-xl p-4 text-center border border-green-400/20 hover:border-green-400/50 transition-all">
                        <kbd class="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg font-bold text-lg block mb-2">Space</kbd>
                        <span class="text-gray-300 text-sm">Play/Pause</span>
                    </div>
                    <div class="bg-dark/40 rounded-xl p-4 text-center border border-red-400/20 hover:border-red-400/50 transition-all">
                        <kbd class="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg font-bold text-lg block mb-2">R</kbd>
                        <span class="text-gray-300 text-sm">Reset</span>
                    </div>
                    <div class="bg-dark/40 rounded-xl p-4 text-center border border-blue-400/20 hover:border-blue-400/50 transition-all">
                        <kbd class="bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg font-bold text-lg block mb-2">T</kbd>
                        <span class="text-gray-300 text-sm">Timeline View</span>
                    </div>
                    <div class="bg-dark/40 rounded-xl p-4 text-center border border-yellow-400/20 hover:border-yellow-400/50 transition-all">
                        <kbd class="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg font-bold text-lg block mb-2">N</kbd>
                        <span class="text-gray-300 text-sm">Network View</span>
                    </div>
                    <div class="bg-dark/40 rounded-xl p-4 text-center border border-purple-400/20 hover:border-purple-400/50 transition-all">
                        <kbd class="bg-purple-500/20 text-purple-400 px-2 py-2 rounded-lg font-bold text-sm block mb-2">Ctrl+F</kbd>
                        <span class="text-gray-300 text-sm">Search</span>
                    </div>
                </div>
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

    setupNetworkOverview() {
        // Create network overview modal
        this.networkOverviewModal = d3.select('body').append('div')
            .attr('class', 'network-overview-modal hidden')
            .style('position', 'fixed')
            .style('top', '5%')
            .style('left', '5%')
            .style('width', '90%')
            .style('height', '90%')
            .style('background', 'linear-gradient(135deg, rgba(10, 10, 15, 0.98) 0%, rgba(26, 26, 46, 0.95) 50%, rgba(22, 33, 62, 0.98) 100%)')
            .style('backdrop-filter', 'blur(20px)')
            .style('border', '2px solid #00ff87')
            .style('border-radius', '20px')
            .style('z-index', '10001')
            .style('box-shadow', '0 20px 60px rgba(0, 255, 135, 0.3)')
            .style('overflow', 'hidden');

        // Add modal header
        const header = this.networkOverviewModal.append('div')
            .attr('class', 'network-overview-header')
            .style('padding', '20px 30px')
            .style('border-bottom', '2px solid rgba(0, 255, 135, 0.3)')
            .style('background', 'rgba(0, 255, 135, 0.1)')
            .style('display', 'flex')
            .style('justify-content', 'space-between')
            .style('align-items', 'center');

        header.append('div')
            .html(`
                <h2 style="color: #00ff87; font-size: 28px; font-weight: bold; margin: 0; display: flex; align-items: center;">
                    🕸️ Complete Network Overview
                    <span style="margin-left: 15px; font-size: 14px; background: rgba(0, 255, 135, 0.2); color: #00ff87; padding: 5px 12px; border-radius: 20px;">Full Analysis</span>
                </h2>
                <p style="color: #a0aec0; font-size: 16px; margin: 5px 0 0 0;">Interactive visualization of all account connections and transaction flows</p>
            `);

        const controls = header.append('div')
            .style('display', 'flex')
            .style('gap', '15px')
            .style('align-items', 'center');

        // Add control buttons
        controls.append('button')
            .attr('class', 'network-zoom-fit')
            .style('padding', '8px 16px')
            .style('background', 'rgba(0, 212, 255, 0.2)')
            .style('border', '1px solid #00d4ff')
            .style('border-radius', '8px')
            .style('color', '#00d4ff')
            .style('cursor', 'pointer')
            .style('font-weight', '600')
            .style('transition', 'all 0.3s ease')
            .text('🔍 Zoom to Fit')
            .on('click', () => this.zoomToFitNetwork())
            .on('mouseover', function() {
                d3.select(this).style('background', 'rgba(0, 212, 255, 0.3)');
            })
            .on('mouseout', function() {
                d3.select(this).style('background', 'rgba(0, 212, 255, 0.2)');
            });

        controls.append('button')
            .attr('class', 'network-reset')
            .style('padding', '8px 16px')
            .style('background', 'rgba(239, 68, 68, 0.2)')
            .style('border', '1px solid #ef4444')
            .style('border-radius', '8px')
            .style('color', '#ef4444')
            .style('cursor', 'pointer')
            .style('font-weight', '600')
            .style('transition', 'all 0.3s ease')
            .text('🔄 Reset View')
            .on('click', () => this.resetNetworkView())
            .on('mouseover', function() {
                d3.select(this).style('background', 'rgba(239, 68, 68, 0.3)');
            })
            .on('mouseout', function() {
                d3.select(this).style('background', 'rgba(239, 68, 68, 0.2)');
            });

        controls.append('button')
            .attr('class', 'close-network-overview')
            .style('padding', '8px 16px')
            .style('background', 'rgba(156, 163, 175, 0.2)')
            .style('border', '1px solid #9ca3af')
            .style('border-radius', '8px')
            .style('color', '#9ca3af')
            .style('cursor', 'pointer')
            .style('font-weight', '600')
            .style('transition', 'all 0.3s ease')
            .text('✕ Close')
            .on('click', () => this.hideNetworkOverview())
            .on('mouseover', function() {
                d3.select(this).style('background', 'rgba(156, 163, 175, 0.3)');
            })
            .on('mouseout', function() {
                d3.select(this).style('background', 'rgba(156, 163, 175, 0.2)');
            });

        // Add main content area
        this.networkOverviewModal.append('div')
            .attr('class', 'network-overview-content')
            .style('height', 'calc(100% - 100px)')
            .style('position', 'relative');

        // Add zoom and pan controls info
        this.networkOverviewModal.select('.network-overview-content')
            .append('div')
            .attr('class', 'network-controls-info')
            .style('position', 'absolute')
            .style('top', '20px')
            .style('right', '20px')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('border', '1px solid rgba(0, 255, 135, 0.3)')
            .style('border-radius', '12px')
            .style('padding', '12px 16px')
            .style('color', '#e2e8f0')
            .style('font-size', '12px')
            .style('z-index', '10002')
            .html(`
                <div style="font-weight: bold; color: #00ff87; margin-bottom: 8px;">🎮 Network Controls</div>
                <div style="margin-bottom: 4px;">🖱️ <strong>Drag:</strong> Pan network</div>
                <div style="margin-bottom: 4px;">🔍 <strong>Scroll:</strong> Zoom in/out</div>
                <div style="margin-bottom: 4px;">👆 <strong>Click Node:</strong> Focus & info</div>
                <div>🔗 <strong>Drag Node:</strong> Reposition</div>
            `);
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
            <div class="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-400/30 shadow-xl mb-8">
                <div class="text-center mb-8">
                    <h4 class="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
                        🔍 Advanced Layering Analysis Summary
                    </h4>
                    <p class="text-lg text-gray-300 leading-relaxed">Multi-layer detection system performance and risk distribution analysis</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-dark/60 rounded-xl p-6 text-center border border-secondary/20 hover:border-secondary/50 transition-all duration-300">
                        <div class="text-3xl font-bold text-secondary mb-2">${summary.total_transactions}</div>
                        <div class="text-sm text-gray-300 font-medium">Total Transactions</div>
                        <div class="text-xs text-gray-400 mt-1">Analyzed</div>
                    </div>
                    <div class="bg-dark/60 rounded-xl p-6 text-center border border-red-400/20 hover:border-red-400/50 transition-all duration-300">
                        <div class="text-3xl font-bold text-red-400 mb-2">${summary.risk_distribution.critical}</div>
                        <div class="text-sm text-gray-300 font-medium">Critical Risk</div>
                        <div class="text-xs text-red-300 mt-1">Immediate Action</div>
                    </div>
                    <div class="bg-dark/60 rounded-xl p-6 text-center border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300">
                        <div class="text-3xl font-bold text-yellow-400 mb-2">${summary.risk_distribution.medium}</div>
                        <div class="text-sm text-gray-300 font-medium">Medium Risk</div>
                        <div class="text-xs text-yellow-300 mt-1">Monitor Closely</div>
                    </div>
                    <div class="bg-dark/60 rounded-xl p-6 text-center border border-green-400/20 hover:border-green-400/50 transition-all duration-300">
                        <div class="text-3xl font-bold text-green-400 mb-2">${summary.risk_distribution.low}</div>
                        <div class="text-sm text-gray-300 font-medium">Low Risk</div>
                        <div class="text-xs text-green-300 mt-1">Normal Activity</div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-400/30">
                    <h5 class="text-2xl font-bold text-purple-400 mb-6 text-center flex items-center justify-center">
                        ⚡ Detection Effectiveness Matrix
                        <span class="ml-3 text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">AI Powered</span>
                    </h5>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-dark/40 rounded-xl p-6 text-center border border-primary/20">
                            <div class="text-2xl font-bold text-primary mb-2">${(summary.layering_effectiveness.layer_1_detection_rate * 100).toFixed(1)}%</div>
                            <div class="text-gray-300 font-medium">Layer 1: Extraction</div>
                            <div class="text-xs text-gray-400 mt-2">Data Pattern Recognition</div>
                        </div>
                        <div class="bg-dark/40 rounded-xl p-6 text-center border border-secondary/20">
                            <div class="text-2xl font-bold text-secondary mb-2">${(summary.layering_effectiveness.layer_2_processing_rate * 100).toFixed(1)}%</div>
                            <div class="text-gray-300 font-medium">Layer 2: Processing</div>
                            <div class="text-xs text-gray-400 mt-2">Behavioral Analysis</div>
                        </div>
                        <div class="bg-dark/40 rounded-xl p-6 text-center border border-orange-400/20">
                            <div class="text-2xl font-bold text-orange-400 mb-2">${(summary.layering_effectiveness.layer_3_integration_rate * 100).toFixed(1)}%</div>
                            <div class="text-gray-300 font-medium">Layer 3: Integration</div>
                            <div class="text-xs text-gray-400 mt-2">Risk Assessment</div>
                        </div>
                    </div>
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

    showNetworkOverview() {
        if (!this.networkOverviewModal || !this.data || this.data.length === 0) {
            showNotification('No network data available to display', 'warning');
            return;
        }

        console.log('🕸️ CHRONOS: Opening network overview modal');
        
        // Show the modal
        this.networkOverviewModal.classed('hidden', false);
        
        // Clear existing network overview content
        const content = this.networkOverviewModal.select('.network-overview-content');
        content.selectAll('svg').remove();
        
        // Create full-size SVG for overview
        const modalWidth = window.innerWidth * 0.9;
        const modalHeight = window.innerHeight * 0.9 - 100; // Account for header
        
        const overviewSvg = content
            .append('svg')
            .attr('class', 'network-overview-svg')
            .attr('width', modalWidth)
            .attr('height', modalHeight)
            .style('background', 'linear-gradient(135deg, rgba(10, 10, 15, 0.8) 0%, rgba(26, 26, 46, 0.6) 50%, rgba(22, 33, 62, 0.4) 100%)')
            .style('border-radius', '12px')
            .style('border', '1px solid rgba(0, 255, 135, 0.2)');

        // Add zoom and pan behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                overviewGroup.attr('transform', event.transform);
            });

        overviewSvg.call(zoom);

        const overviewGroup = overviewSvg.append('g')
            .attr('class', 'network-overview-group');

        // Create network data if not exists
        if (!this.networkNodes || this.networkNodes.length === 0) {
            this.createNetworkData();
        }

        // Create a more spread out force simulation for overview
        this.overviewSimulation = d3.forceSimulation(this.networkNodes)
            .force('link', d3.forceLink(this.networkLinks).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-800))
            .force('center', d3.forceCenter(modalWidth / 2, modalHeight / 2))
            .force('collision', d3.forceCollide().radius(40))
            .force('x', d3.forceX(modalWidth / 2).strength(0.1))
            .force('y', d3.forceY(modalHeight / 2).strength(0.1));

        // Create links for overview
        const overviewLinks = overviewGroup.append('g')
            .attr('class', 'overview-links')
            .selectAll('line')
            .data(this.networkLinks)
            .enter().append('line')
            .attr('class', 'overview-link')
            .style('stroke', d => d.suspicious ? '#ef4444' : '#00ff87')
            .style('stroke-width', d => d.suspicious ? 6 : 3)
            .style('opacity', d => d.suspicious ? 0.9 : 0.6)
            .style('filter', d => d.suspicious ? 'drop-shadow(0 0 4px #ef4444)' : 'drop-shadow(0 0 2px #00ff87)');

        // Create nodes for overview
        const overviewNodes = overviewGroup.append('g')
            .attr('class', 'overview-nodes')
            .selectAll('circle')
            .data(this.networkNodes)
            .enter().append('circle')
            .attr('class', 'overview-node')
            .attr('r', d => d.type === 'account' ? (d.suspicious ? 25 : 20) : 15)
            .style('fill', d => {
                if (d.type === 'account') {
                    return d.suspicious ? '#ef4444' : '#00d4ff';
                }
                return '#00ff87';
            })
            .style('stroke', '#ffffff')
            .style('stroke-width', 4)
            .style('filter', d => {
                if (d.type === 'account') {
                    return d.suspicious ? 'drop-shadow(0 0 12px #ef4444)' : 'drop-shadow(0 0 10px #00d4ff)';
                }
                return 'drop-shadow(0 0 8px #00ff87)';
            })
            .style('cursor', 'pointer')
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) this.overviewSimulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) this.overviewSimulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }))
            .on('click', (event, d) => this.selectOverviewNode(d))
            .on('mouseover', (event, d) => this.showOverviewTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        // Create labels for overview
        const overviewLabels = overviewGroup.append('g')
            .attr('class', 'overview-labels')
            .selectAll('text')
            .data(this.networkNodes)
            .enter().append('text')
            .attr('class', 'overview-label')
            .style('font-size', '14px')
            .style('font-weight', '700')
            .style('fill', '#e2e8f0')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .style('text-shadow', '2px 2px 4px rgba(0, 0, 0, 0.8)')
            .style('filter', 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))')
            .text(d => d.label);

        // Update positions on simulation tick
        this.overviewSimulation.on('tick', () => {
            overviewLinks
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            overviewNodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            overviewLabels
                .attr('x', d => d.x)
                .attr('y', d => d.y + 6);
        });

        // Store references for control functions
        this.overviewZoom = zoom;
        this.overviewSvg = overviewSvg;
        this.overviewGroup = overviewGroup;
        
        showNotification('Network overview opened - Double-click nodes for details', 'info');
    }

    hideNetworkOverview() {
        if (this.networkOverviewModal) {
            this.networkOverviewModal.classed('hidden', true);
            
            // Stop simulation to improve performance
            if (this.overviewSimulation) {
                this.overviewSimulation.stop();
                this.overviewSimulation = null;
            }
            
            console.log('🕸️ CHRONOS: Closed network overview modal');
        }
    }

    selectOverviewNode(node) {
        console.log('🔍 Selected overview node:', node.id);
        
        // Highlight connected nodes and links
        this.overviewGroup.selectAll('.overview-node')
            .style('opacity', d => d === node || this.isConnected(d, node) ? 1 : 0.3)
            .style('stroke-width', d => d === node ? 6 : 4);
            
        this.overviewGroup.selectAll('.overview-link')
            .style('opacity', d => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                return (sourceId === node.id || targetId === node.id) ? 1 : 0.2;
            });

        // Show detailed info in a side panel
        this.showOverviewNodeDetails(node);
    }

    showOverviewNodeDetails(node) {
        // Remove existing details panel
        this.networkOverviewModal.selectAll('.node-details-panel').remove();
        
        const detailsPanel = this.networkOverviewModal.select('.network-overview-content')
            .append('div')
            .attr('class', 'node-details-panel')
            .style('position', 'absolute')
            .style('top', '20px')
            .style('left', '20px')
            .style('width', '300px')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('border', '2px solid #00ff87')
            .style('border-radius', '12px')
            .style('padding', '20px')
            .style('color', '#e2e8f0')
            .style('z-index', '10002')
            .style('box-shadow', '0 8px 32px rgba(0, 255, 135, 0.3)');

        const connectedAccounts = this.getConnectedAccounts(node);
        const suspiciousTransactions = node.transactions ? node.transactions.filter(tx => tx.suspicious_score > 0.5).length : 0;

        detailsPanel.html(`
            <div style="border-bottom: 2px solid #00ff87; padding-bottom: 12px; margin-bottom: 16px;">
                <h3 style="color: #00ff87; font-size: 18px; margin: 0 0 8px 0; font-weight: bold;">🔍 Node Analysis</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #9ca3af; font-size: 18px; cursor: pointer;">✕</button>
            </div>
            
            <div style="margin-bottom: 16px;">
                <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Account ID</div>
                <div style="color: #00d4ff; font-weight: 600; font-family: monospace; font-size: 14px; word-break: break-all;">${node.id}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Node Type</div>
                    <div style="color: #e2e8f0; font-weight: 600;">${node.type || 'Account'}</div>
                </div>
                <div>
                    <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Risk Level</div>
                    <div style="color: ${node.suspicious ? '#ef4444' : '#10b981'}; font-weight: 700;">${node.suspicious ? 'HIGH' : 'NORMAL'}</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Total Transactions</div>
                    <div style="color: #00d4ff; font-weight: 600; font-size: 18px;">${node.transactions ? node.transactions.length : 0}</div>
                </div>
                <div>
                    <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Suspicious</div>
                    <div style="color: ${suspiciousTransactions > 0 ? '#ef4444' : '#10b981'}; font-weight: 600; font-size: 18px;">${suspiciousTransactions}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Connected Accounts (${connectedAccounts.length})</div>
                <div style="max-height: 120px; overflow-y: auto; background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 8px;">
                    ${connectedAccounts.slice(0, 10).map(acc => `
                        <div style="margin-bottom: 4px; font-size: 11px; color: #a0aec0; font-family: monospace;">
                            ${acc.id.substring(0, 16)}...
                        </div>
                    `).join('')}
                    ${connectedAccounts.length > 10 ? `<div style="font-size: 11px; color: #6b7280;">+ ${connectedAccounts.length - 10} more...</div>` : ''}
                </div>
            </div>
            
            <button onclick="window.TriNetra.getChronos().focusOnNode('${node.id}')" 
                    style="width: 100%; padding: 10px; background: rgba(0, 255, 135, 0.2); border: 1px solid #00ff87; border-radius: 8px; color: #00ff87; cursor: pointer; font-weight: 600;">
                🎯 Focus on This Node
            </button>
        `);
    }

    showOverviewTooltip(event, d) {
        const content = `
            <div style="font-weight: bold; color: #00ff87; margin-bottom: 8px;">🏦 ${d.type === 'account' ? 'Account' : 'Node'}</div>
            <div style="margin-bottom: 4px;"><strong>ID:</strong> ${d.id.substring(0, 12)}...</div>
            <div style="margin-bottom: 4px;"><strong>Transactions:</strong> ${d.transactions ? d.transactions.length : 0}</div>
            <div style="margin-bottom: 4px;"><strong>Risk Level:</strong> <span style="color: ${d.suspicious ? '#ef4444' : '#10b981'}">${d.suspicious ? 'HIGH' : 'NORMAL'}</span></div>
            <div style="margin-bottom: 4px;"><strong>Connections:</strong> ${this.getConnectedAccounts(d).length}</div>
            <div style="font-size: 11px; color: #a0aec0; margin-top: 8px;">💡 Click to select, Double-click for details</div>
        `;
            
        this.tooltip
            .style('opacity', 1)
            .html(content)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    zoomToFitNetwork() {
        if (!this.overviewSvg || !this.overviewZoom) return;
        
        // Calculate bounds of all nodes
        const nodes = this.networkNodes;
        if (!nodes || nodes.length === 0) return;
        
        const bounds = {
            minX: d3.min(nodes, d => d.x),
            maxX: d3.max(nodes, d => d.x),
            minY: d3.min(nodes, d => d.y),
            maxY: d3.max(nodes, d => d.y)
        };
        
        const width = this.overviewSvg.attr('width');
        const height = this.overviewSvg.attr('height');
        const padding = 100;
        
        const scale = Math.min(
            (width - padding) / (bounds.maxX - bounds.minX),
            (height - padding) / (bounds.maxY - bounds.minY)
        ) * 0.8;
        
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        
        const transform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(scale)
            .translate(-centerX, -centerY);
        
        this.overviewSvg.transition()
            .duration(750)
            .call(this.overviewZoom.transform, transform);
            
        showNotification('Network zoomed to fit view', 'info');
    }

    resetNetworkView() {
        if (!this.overviewSvg || !this.overviewZoom) return;
        
        this.overviewSvg.transition()
            .duration(500)
            .call(this.overviewZoom.transform, d3.zoomIdentity);
            
        // Reset node highlighting
        if (this.overviewGroup) {
            this.overviewGroup.selectAll('.overview-node')
                .style('opacity', 1)
                .style('stroke-width', 4);
            this.overviewGroup.selectAll('.overview-link')
                .style('opacity', d => d.suspicious ? 0.9 : 0.6);
        }
        
        // Remove details panel
        this.networkOverviewModal.selectAll('.node-details-panel').remove();
        
        showNotification('Network view reset', 'info');
    }

    focusOnNode(nodeId) {
        const node = this.networkNodes.find(n => n.id === nodeId);
        if (!node || !this.overviewSvg || !this.overviewZoom) return;
        
        const width = this.overviewSvg.attr('width');
        const height = this.overviewSvg.attr('height');
        
        const transform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(2)
            .translate(-node.x, -node.y);
        
        this.overviewSvg.transition()
            .duration(750)
            .call(this.overviewZoom.transform, transform);
            
        showNotification(`Focused on account ${nodeId.substring(0, 12)}...`, 'info');
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

        // Add new nodes with enhanced styling and better visibility
        const nodeEnter = nodes.enter()
            .append('circle')
            .attr('class', d => `transaction-node ${d.suspicionLevel}`)
            .attr('r', 0)
            .attr('cx', d => this.xScale(d.timestamp))
            .attr('cy', d => this.yScale(d.amount))
            .style('fill', d => {
                if (d.suspicious_score > 0.8) return '#ff1744';      // Bright red for critical
                if (d.suspicious_score > 0.5) return '#ff9800';      // Bright orange for suspicious  
                return '#00e5ff';                                     // Bright cyan for normal
            })
            .style('stroke', d => {
                if (d.suspicious_score > 0.8) return '#ffffff';      // White border for critical
                if (d.suspicious_score > 0.5) return '#000000';      // Black border for suspicious
                return '#ffffff';                                     // White border for normal
            })
            .style('stroke-width', d => {
                if (d.suspicious_score > 0.8) return '4px';          // Thicker border for critical
                if (d.suspicious_score > 0.5) return '3px';          // Medium border for suspicious
                return '2px';                                         // Normal border
            })
            .style('opacity', 0)
            .style('cursor', 'pointer')
            .style('filter', d => {
                if (d.suspicious_score > 0.8) return 'drop-shadow(0 0 12px #ff1744) drop-shadow(0 0 20px rgba(255, 23, 68, 0.6))';
                if (d.suspicious_score > 0.5) return 'drop-shadow(0 0 10px #ff9800) drop-shadow(0 0 16px rgba(255, 152, 0, 0.4))';
                return 'drop-shadow(0 0 8px #00e5ff) drop-shadow(0 0 12px rgba(0, 229, 255, 0.3))';
            });

        // Update existing nodes with enhanced animations and better visibility
        nodes.merge(nodeEnter)
            .transition()
            .duration(500)
            .attr('cx', d => this.xScale(d.timestamp))
            .attr('cy', d => this.yScale(d.amount))
            .attr('r', d => {
                // Smaller, cleaner dots for better readability
                if (d.suspicious_score > 0.8) return 6;     // Small for critical
                if (d.suspicious_score > 0.5) return 5;     // Smaller for suspicious
                return 4;                                    // Smallest for normal
            })
            .style('fill', d => {
                if (d.suspicious_score > 0.8) return '#ff1744';
                if (d.suspicious_score > 0.5) return '#ff9800';
                return '#00e5ff';
            })
            .style('opacity', 0.9)
            .style('stroke-width', d => {
                if (d.suspicious_score > 0.8) return '2px';
                if (d.suspicious_score > 0.5) return '1.5px';
                return '1px';
            });

        // Add enhanced hover effects
        this.g.selectAll('.transaction-node')
            .on('mouseover', (event, d) => {
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr('r', d => {
                        // Slightly larger on hover but still small
                        if (d.suspicious_score > 0.8) return 8;     // Small hover for critical
                        if (d.suspicious_score > 0.5) return 7;     // Smaller hover for suspicious
                        return 6;                                    // Smallest hover for normal
                    })
                    .style('stroke-width', '3px')
                    .style('opacity', 1)
                    .style('filter', d => {
                        if (d.suspicious_score > 0.8) return 'drop-shadow(0 0 25px #ff1744) drop-shadow(0 0 35px rgba(255, 23, 68, 0.8))';
                        if (d.suspicious_score > 0.5) return 'drop-shadow(0 0 20px #ff9800) drop-shadow(0 0 30px rgba(255, 152, 0, 0.6))';
                        return 'drop-shadow(0 0 18px #00e5ff) drop-shadow(0 0 25px rgba(0, 229, 255, 0.5))';
                    });
                this.showTooltip(event, d);
            })
            .on('mouseout', (event, d) => {
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr('r', d => {
                        // Return to small default sizes
                        if (d.suspicious_score > 0.8) return 6;
                        if (d.suspicious_score > 0.5) return 5;
                        return 4;
                    })
                    .style('stroke-width', d => {
                        if (d.suspicious_score > 0.8) return '2px';
                        if (d.suspicious_score > 0.5) return '1.5px';
                        return '1px';
                    })
                    .style('opacity', 0.9)
                    .style('filter', d => {
                        if (d.suspicious_score > 0.8) return 'drop-shadow(0 0 12px #ff1744) drop-shadow(0 0 20px rgba(255, 23, 68, 0.6))';
                        if (d.suspicious_score > 0.5) return 'drop-shadow(0 0 10px #ff9800) drop-shadow(0 0 16px rgba(255, 152, 0, 0.4))';
                        return 'drop-shadow(0 0 8px #00e5ff) drop-shadow(0 0 12px rgba(0, 229, 255, 0.3))';
                    });
                this.hideTooltip();
            })
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
            .style('stroke', d => d.suspicious > 0.8 ? '#ef4444' : d.suspicious > 0.5 ? '#f59e0b' : 'rgba(0, 255, 135, 0.6)')
            .style('stroke-width', d => d.suspicious > 0.8 ? 5 : d.suspicious > 0.5 ? 3 : 2)
            .style('opacity', d => d.suspicious > 0.8 ? 0.9 : d.suspicious > 0.5 ? 0.7 : 0.4)
            .style('stroke-dasharray', d => d.suspicious > 0.8 ? 'none' : '6,4')
            .style('filter', d => d.suspicious > 0.8 ? 'drop-shadow(0 0 4px #ef4444)' : d.suspicious > 0.5 ? 'drop-shadow(0 0 3px #f59e0b)' : 'none');
    }

    showTooltip(event, d) {
        const suspicionScore = (d.suspicious_score * 100).toFixed(1);
        let riskClass = 'normal';
        if (d.suspicious_score > 0.8) riskClass = 'critical';
        else if (d.suspicious_score > 0.5) riskClass = 'suspicious';
        
        this.tooltip
            .style('opacity', 1)
            .html(`
                <div style="border-bottom: 2px solid #00ff87; padding-bottom: 8px; margin-bottom: 12px;">
                    <div style="color: #00ff87; font-weight: 700; font-size: 14px; margin-bottom: 4px;">💰 Transaction Details</div>
                    <div style="color: #a0aec0; font-size: 11px;">ID: ${d.id || d.transaction_id}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <div>
                        <div style="color: #4a5568; font-size: 11px; margin-bottom: 2px;">Amount</div>
                        <div style="color: #00d4ff; font-weight: 600; font-size: 15px;">${formatCurrency(d.amount)}</div>
                    </div>
                    <div>
                        <div style="color: #4a5568; font-size: 11px; margin-bottom: 2px;">Risk Level</div>
                        <div style="color: ${riskClass === 'critical' ? '#ef4444' : riskClass === 'suspicious' ? '#f59e0b' : '#10b981'}; font-weight: 700; font-size: 15px;">${suspicionScore}%</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <div style="color: #4a5568; font-size: 11px; margin-bottom: 4px;">⏰ Transaction Time</div>
                    <div style="color: #e2e8f0; font-size: 12px;">${formatDateTime(d.timestamp)}</div>
                </div>
                
                <div style="margin-bottom: 8px;">
                    <div style="color: #4a5568; font-size: 11px; margin-bottom: 4px;">🔄 Account Flow</div>
                    <div style="background: rgba(0, 255, 135, 0.1); border-radius: 6px; padding: 6px; font-size: 11px;">
                        <div style="color: #00ff87; margin-bottom: 2px;">📤 From: <span style="color: #e2e8f0; font-family: monospace;">${d.from_account}</span></div>
                        <div style="color: #00d4ff;">📥 To: <span style="color: #e2e8f0; font-family: monospace;">${d.to_account}</span></div>
                    </div>
                </div>
                
                ${d.scenario ? `<div style="background: rgba(168, 85, 247, 0.1); border-radius: 6px; padding: 6px; margin-top: 8px;">
                    <div style="color: #a855f7; font-size: 11px; font-weight: 600;">🔍 Scenario: ${d.scenario}</div>
                </div>` : ''}
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
                <div class="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-8 border border-secondary/30 shadow-xl">
                    <div class="text-center mb-8">
                        <h4 class="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4">
                            📊 Timeline Overview - ${this.currentScenario.toUpperCase()}
                        </h4>
                        <p class="text-lg text-gray-300 leading-relaxed">Comprehensive statistical analysis of transaction patterns and risk distribution</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                        <div class="bg-dark/60 rounded-xl p-6 text-center border border-secondary/20 hover:border-secondary/50 transition-all duration-300 hover:transform hover:scale-105">
                            <div class="text-4xl font-bold text-secondary mb-2">${stats.total}</div>
                            <div class="text-sm text-gray-300 font-medium">Total Transactions</div>
                            <div class="text-xs text-gray-400 mt-1">Processed & Analyzed</div>
                        </div>
                        <div class="bg-dark/60 rounded-xl p-6 text-center border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
                            <div class="text-4xl font-bold text-yellow-400 mb-2">${stats.suspicious}</div>
                            <div class="text-sm text-gray-300 font-medium">Suspicious Transactions</div>
                            <div class="text-xs text-yellow-300 mt-1">Requires Investigation</div>
                        </div>
                        <div class="bg-dark/60 rounded-xl p-6 text-center border border-red-400/20 hover:border-red-400/50 transition-all duration-300 hover:transform hover:scale-105">
                            <div class="text-4xl font-bold text-red-400 mb-2">${stats.critical}</div>
                            <div class="text-sm text-gray-300 font-medium">Critical Transactions</div>
                            <div class="text-xs text-red-300 mt-1">Immediate Action Required</div>
                        </div>
                        <div class="bg-dark/60 rounded-xl p-6 text-center border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:transform hover:scale-105">
                            <div class="text-2xl font-bold text-primary mb-2">${formatCurrency(stats.totalAmount)}</div>
                            <div class="text-sm text-gray-300 font-medium">Total Amount</div>
                            <div class="text-xs text-gray-400 mt-1">Transaction Volume</div>
                        </div>
                        <div class="bg-dark/60 rounded-xl p-6 text-center border border-purple-400/20 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105">
                            <div class="text-2xl font-bold text-purple-400 mb-2">${formatCurrency(stats.avgAmount)}</div>
                            <div class="text-sm text-gray-300 font-medium">Average Amount</div>
                            <div class="text-xs text-gray-400 mt-1">Per Transaction</div>
                        </div>
                        <div class="bg-dark/60 rounded-xl p-6 text-center border border-orange-400/20 hover:border-orange-400/50 transition-all duration-300 hover:transform hover:scale-105">
                            <div class="text-4xl font-bold text-orange-400 mb-2">${(stats.avgSuspicion * 100).toFixed(1)}%</div>
                            <div class="text-sm text-gray-300 font-medium">Average Suspicion</div>
                            <div class="text-xs text-orange-300 mt-1">Risk Score</div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/30 text-center">
                        <div class="text-blue-400 text-lg font-semibold mb-2">💡 Interactive Analysis</div>
                        <p class="text-gray-300 text-sm leading-relaxed">Click on any transaction point in the timeline to see detailed analysis information including risk factors, ML confidence scores, and regulatory compliance indicators.</p>
                    </div>
                </div>
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

        // Create links with enhanced styling
        const link = this.g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.networkLinks)
            .enter().append('line')
            .attr('class', 'network-link')
            .style('stroke', d => d.suspicious ? '#ef4444' : '#00ff87')
            .style('stroke-width', d => d.suspicious ? 4 : 2)
            .style('opacity', d => d.suspicious ? 0.8 : 0.6)
            .style('filter', d => d.suspicious ? 'drop-shadow(0 0 3px #ef4444)' : 'drop-shadow(0 0 2px #00ff87)');

        // Create nodes with enhanced styling and better visibility
        const node = this.g.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.networkNodes)
            .enter().append('circle')
            .attr('class', 'network-node')
            .attr('r', d => d.type === 'account' ? (d.suspicious ? 18 : 14) : 10)
            .style('fill', d => {
                if (d.type === 'account') {
                    return d.suspicious ? '#ef4444' : '#00d4ff';
                }
                return '#00ff87'; // Default color for non-account nodes
            })
            .style('stroke', '#ffffff')
            .style('stroke-width', 3)
            .style('filter', d => {
                if (d.type === 'account') {
                    return d.suspicious ? 'drop-shadow(0 0 8px #ef4444)' : 'drop-shadow(0 0 6px #00d4ff)';
                }
                return 'drop-shadow(0 0 4px #00ff87)';
            })
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
            .on('dblclick', (event, d) => this.showNetworkOverview())
            .on('contextmenu', (event, d) => {
                event.preventDefault();
                this.showNetworkOverview();
            })
            .on('mouseover', (event, d) => this.showNetworkTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        // Add enhanced labels with better readability
        const label = this.g.append('g')
            .attr('class', 'labels')
            .selectAll('text')
            .data(this.networkNodes)
            .enter().append('text')
            .attr('class', 'network-label')
            .style('font-size', '12px')
            .style('font-weight', '600')
            .style('fill', '#e2e8f0')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .style('text-shadow', '1px 1px 2px rgba(0, 0, 0, 0.8)')
            .style('filter', 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))')
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
            ? `
                <div style="font-weight: bold; color: #00ff87; margin-bottom: 8px;">🏦 Account Node</div>
                <div style="margin-bottom: 4px;"><strong>ID:</strong> ${d.id.substring(0, 12)}...</div>
                <div style="margin-bottom: 4px;"><strong>Transactions:</strong> ${d.transactions.length}</div>
                <div style="margin-bottom: 4px;"><strong>Suspicious:</strong> <span style="color: ${d.suspicious ? '#ef4444' : '#10b981'}">${d.suspicious ? 'Yes' : 'No'}</span></div>
                <div style="margin-bottom: 4px;"><strong>Connections:</strong> ${this.getConnectedAccounts(d).length}</div>
                <div style="font-size: 11px; color: #a0aec0; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
                    💡 <strong>Click:</strong> Select node<br/>
                    🖱️ <strong>Double-click:</strong> Open full network<br/>
                    🖱️ <strong>Right-click:</strong> Network overview
                </div>
            `
            : `
                <div style="font-weight: bold; color: #00ff87; margin-bottom: 8px;">🔗 Network Node</div>
                <div style="margin-bottom: 4px;"><strong>Type:</strong> ${d.type || 'Unknown'}</div>
                <div style="font-size: 11px; color: #a0aec0; margin-top: 8px;">💡 Double-click for full network view</div>
            `;
            
        this.tooltip
            .style('opacity', 1)
            .html(content)
            .style('left', (event.pageX + 15) + 'px')
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
                <button onclick="window.TriNetra.getChronos().clearSelection()" class="control-button" style="margin-right: 10px;">
                    Clear Selection
                </button>
                <button onclick="window.TriNetra.getChronos().showNetworkOverview()" class="control-button" style="background: rgba(0, 255, 135, 0.2); border: 1px solid #00ff87; color: #00ff87;">
                    🕸️ Open Full Network
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