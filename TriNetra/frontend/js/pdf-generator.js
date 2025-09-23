// PDF Generation Module for TriNetra Reports
// Uses global jsPDF, html2canvas, and jspdf-autotable loaded via CDN

class TriNetraPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = 0;
        
        // Check if required libraries are loaded
        this.checkLibraries();
    }
    
    checkLibraries() {
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF library not loaded. Please ensure the CDN script is included.');
            console.log('Expected CDN: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            throw new Error('jsPDF library not available');
        }
        
        if (typeof window.html2canvas === 'undefined') {
            console.error('html2canvas library not loaded. Please ensure the CDN script is included.');
            console.log('Expected CDN: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            throw new Error('html2canvas library not available');
        }
        
        if (typeof window.jspdf.jsPDF === 'undefined') {
            console.error('jsPDF constructor not found. Library may not be loaded correctly.');
            throw new Error('jsPDF constructor not available');
        }
        
        console.log('✅ PDF generation libraries loaded successfully');
        console.log('   - jsPDF version:', window.jspdf.jsPDF.version || 'unknown');
        console.log('   - html2canvas loaded:', typeof window.html2canvas === 'function');
    }

    async generateSARReport(sarData) {
        this.doc = new window.jspdf.jsPDF();
        this.currentY = this.margin;

        // Header
        this.addHeader('SUSPICIOUS ACTIVITY REPORT (SAR)', sarData.report_id);

        // Report metadata
        this.addSection('Report Information', [
            ['Report ID', sarData.report_id],
            ['Generated At', new Date(sarData.generated_at).toLocaleString()],
            ['Priority Level', sarData.priority],
            ['Filing Deadline', sarData.regulatory_compliance.filing_deadline]
        ]);

        // Executive Summary
        this.addTextSection('Executive Summary', sarData.summary);

        // Pattern Details
        this.addSection('Pattern Analysis', [
            ['Pattern Type', sarData.details.pattern_type],
            ['Total Transactions', sarData.details.total_transactions],
            ['Suspicious Transactions', sarData.details.suspicious_transactions],
            ['Total Amount', this.formatCurrency(sarData.details.total_amount)],
            ['Average Amount', this.formatCurrency(sarData.details.average_amount)],
            ['Time Period', sarData.details.time_period]
        ]);

        // Accounts Involved
        if (sarData.details.accounts_involved && sarData.details.accounts_involved.length > 0) {
            this.addListSection('Accounts Involved', sarData.details.accounts_involved);
        }

        // Risk Factors
        if (sarData.evidence.risk_factors && sarData.evidence.risk_factors.length > 0) {
            this.addListSection('Risk Factors', sarData.evidence.risk_factors);
        }

        // Pattern Indicators
        if (sarData.evidence.pattern_indicators && sarData.evidence.pattern_indicators.length > 0) {
            this.addListSection('Pattern Indicators', sarData.evidence.pattern_indicators);
        }

        // Recommendations
        if (sarData.recommendations && sarData.recommendations.length > 0) {
            this.addListSection('Recommendations', sarData.recommendations);
        }

        // Regulatory Information
        this.addSection('Regulatory Compliance', [
            ['Regulatory Codes', sarData.regulatory_compliance.codes.join(', ')],
            ['Law Enforcement Notification', sarData.regulatory_compliance.law_enforcement_notification ? 'Required' : 'Not Required'],
            ['Filing Deadline', sarData.regulatory_compliance.filing_deadline]
        ]);

        // Footer
        this.addFooter();

        return this.doc;
    }

    async generateChronosReport(timelineData, networkData, scenario) {
        this.doc = new window.jspdf.jsPDF();
        this.currentY = this.margin;

        // Header
        this.addHeader('CHRONOS TIMELINE ANALYSIS', `CHRONOS_${Date.now()}`);

        // Analysis Overview
        this.addSection('Analysis Overview', [
            ['Scenario', scenario.replace('_', ' ').toUpperCase()],
            ['Analysis Date', new Date().toLocaleString()],
            ['Total Transactions', timelineData.length],
            ['Suspicious Transactions', timelineData.filter(t => t.suspicious_score > 0.5).length],
            ['Network Nodes', networkData.networkNodes.length],
            ['Network Links', networkData.networkLinks.length]
        ]);

        // Timeline Statistics
        const stats = this.calculateTimelineStats(timelineData);
        this.addSection('Timeline Statistics', [
            ['Total Amount', this.formatCurrency(stats.totalAmount)],
            ['Average Amount', this.formatCurrency(stats.avgAmount)],
            ['Average Suspicion', `${(stats.avgSuspicion * 100).toFixed(1)}%`],
            ['Critical Transactions', stats.critical],
            ['Suspicious Rate', `${(stats.suspiciousRate * 100).toFixed(1)}%`]
        ]);

        // Top Suspicious Accounts
        const suspiciousAccounts = networkData.networkNodes
            .filter(n => n.suspicious)
            .slice(0, 10)
            .map(n => [n.id.substring(0, 20), n.transactions.length, 'High']);

        if (suspiciousAccounts.length > 0) {
            this.addTableSection('Top Suspicious Accounts', 
                ['Account ID', 'Transactions', 'Risk Level'], 
                suspiciousAccounts);
        }

        // Transaction Timeline (Top 20 by suspicion)
        const topTransactions = timelineData
            .sort((a, b) => b.suspicious_score - a.suspicious_score)
            .slice(0, 20)
            .map(t => [
                t.id,
                this.formatCurrency(t.amount),
                `${(t.suspicious_score * 100).toFixed(1)}%`,
                new Date(t.timestamp).toLocaleString()
            ]);

        this.addTableSection('Top Suspicious Transactions',
            ['Transaction ID', 'Amount', 'Suspicion', 'Timestamp'],
            topTransactions);

        // Capture network visualization if available
        await this.captureNetworkVisualization();

        this.addFooter();
        return this.doc;
    }

    async generateHydraReport(simulationData, battleHistory) {
        this.doc = new window.jspdf.jsPDF();
        this.currentY = this.margin;

        // Header
        this.addHeader('HYDRA AI SIMULATION REPORT', `HYDRA_${Date.now()}`);

        // Simulation Overview
        this.addSection('Simulation Overview', [
            ['Simulation Date', new Date().toLocaleString()],
            ['Total Rounds', simulationData.rounds],
            ['Patterns Detected', simulationData.total_detected],
            ['Detection Rate', `${(simulationData.detection_rate * 100).toFixed(1)}%`],
            ['Average Complexity', `${(simulationData.results.reduce((sum, r) => sum + r.complexity, 0) / simulationData.results.length * 100).toFixed(1)}%`]
        ]);

        // Battle Results
        const battleResults = simulationData.results.map(r => [
            `Round ${r.round}`,
            r.pattern,
            `${(r.complexity * 100).toFixed(1)}%`,
            r.detected ? '✅ Detected' : '❌ Evaded',
            `${(r.confidence * 100).toFixed(1)}%`
        ]);

        this.addTableSection('Battle Results',
            ['Round', 'Pattern Type', 'Complexity', 'Result', 'Confidence'],
            battleResults);

        // Pattern Analysis
        const patternStats = this.analyzePatternStats(simulationData.results);
        this.addSection('Pattern Analysis', [
            ['Most Common Pattern', patternStats.mostCommon],
            ['Hardest to Detect', patternStats.hardest],
            ['Average Detection Time', `${patternStats.avgTime}ms`],
            ['Best Detector Accuracy', `${(patternStats.bestAccuracy * 100).toFixed(1)}%`]
        ]);

        this.addFooter();
        return this.doc;
    }

    addHeader(title, reportId) {
        // Logo area (placeholder)
        this.doc.setFillColor(10, 10, 15);
        this.doc.rect(this.margin, this.margin, this.pageWidth - 2 * this.margin, 25, 'F');
        
        // Title
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(20);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('TriNetra', this.margin + 5, this.margin + 10);
        
        this.doc.setFontSize(12);
        this.doc.text('Making the invisible visible', this.margin + 5, this.margin + 18);
        
        // Report ID
        this.doc.setTextColor(0, 255, 135);
        this.doc.text(reportId, this.pageWidth - this.margin - 50, this.margin + 15);
        
        this.currentY = this.margin + 35;
        
        // Main title
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 15;
        
        // Separator line
        this.doc.setDrawColor(0, 255, 135);
        this.doc.setLineWidth(1);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 10;
    }

    addSection(title, data) {
        this.checkPageBreak(30);
        
        // Section title
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 100, 200);
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 10;
        
        // Section data
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
        
        data.forEach(([label, value]) => {
            this.checkPageBreak(6);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${label}:`, this.margin + 5, this.currentY);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(String(value), this.margin + 60, this.currentY);
            this.currentY += 6;
        });
        
        this.currentY += 5;
    }

    addTextSection(title, text) {
        this.checkPageBreak(20);
        
        // Section title
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 100, 200);
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 10;
        
        // Text content
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
        
        const splitText = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin - 10);
        splitText.forEach(line => {
            this.checkPageBreak(6);
            this.doc.text(line, this.margin + 5, this.currentY);
            this.currentY += 6;
        });
        
        this.currentY += 5;
    }

    addListSection(title, items) {
        this.checkPageBreak(20);
        
        // Section title
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 100, 200);
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 10;
        
        // List items
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
        
        items.forEach(item => {
            this.checkPageBreak(6);
            this.doc.text('•', this.margin + 5, this.currentY);
            const splitText = this.doc.splitTextToSize(item, this.pageWidth - 2 * this.margin - 15);
            splitText.forEach((line, index) => {
                if (index > 0) this.checkPageBreak(6);
                this.doc.text(line, this.margin + 10, this.currentY);
                if (index < splitText.length - 1) this.currentY += 6;
            });
            this.currentY += 6;
        });
        
        this.currentY += 5;
    }

    addTableSection(title, headers, data) {
        this.checkPageBreak(30);
        
        // Section title
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 100, 200);
        this.doc.text(title, this.margin, this.currentY);
        this.currentY += 10;
        
        // Table
        this.doc.autoTable({
            head: [headers],
            body: data,
            startY: this.currentY,
            margin: { left: this.margin, right: this.margin },
            styles: {
                fontSize: 8,
                cellPadding: 3
            },
            headStyles: {
                fillColor: [0, 100, 200],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });
        
        this.currentY = this.doc.lastAutoTable.finalY + 10;
    }

    async captureNetworkVisualization() {
        try {
            const networkSvg = document.getElementById('chronos-timeline')?.querySelector('svg');
            if (networkSvg) {
                this.checkPageBreak(100);
                
                this.doc.setFontSize(14);
                this.doc.setFont('helvetica', 'bold');
                this.doc.setTextColor(0, 100, 200);
                this.doc.text('Network Visualization', this.margin, this.currentY);
                this.currentY += 10;
                
                const canvas = await window.html2canvas(networkSvg, {
                    backgroundColor: '#1a1a2e',
                    scale: 1,
                    useCORS: true
                });
                
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = this.pageWidth - 2 * this.margin;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, Math.min(imgHeight, 80));
                this.currentY += Math.min(imgHeight, 80) + 10;
            }
        } catch (error) {
            console.warn('Could not capture network visualization:', error);
        }
    }

    addFooter() {
        const pageCount = this.doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            
            // Footer line
            this.doc.setDrawColor(200, 200, 200);
            this.doc.setLineWidth(0.5);
            this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
            
            // Footer text
            this.doc.setFontSize(8);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(100, 100, 100);
            
            // Left side
            this.doc.text('Generated by TriNetra Financial Crime Detection System', this.margin, this.pageHeight - 10);
            
            // Right side
            const timestamp = new Date().toLocaleString();
            const pageText = `Page ${i} of ${pageCount} | ${timestamp}`;
            const textWidth = this.doc.getTextWidth(pageText);
            this.doc.text(pageText, this.pageWidth - this.margin - textWidth, this.pageHeight - 10);
        }
    }

    checkPageBreak(requiredSpace) {
        if (this.currentY + requiredSpace > this.pageHeight - 30) {
            this.doc.addPage();
            this.currentY = this.margin;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    calculateTimelineStats(data) {
        const total = data.length;
        const suspicious = data.filter(tx => tx.suspicious_score > 0.5).length;
        const critical = data.filter(tx => tx.suspicious_score > 0.8).length;
        const totalAmount = data.reduce((sum, tx) => sum + tx.amount, 0);
        const avgAmount = totalAmount / total;
        const avgSuspicion = data.reduce((sum, tx) => sum + tx.suspicious_score, 0) / total;

        return {
            total,
            suspicious,
            critical,
            totalAmount,
            avgAmount,
            avgSuspicion,
            suspiciousRate: suspicious / total,
            criticalRate: critical / total
        };
    }

    analyzePatternStats(results) {
        const patternCounts = {};
        results.forEach(r => {
            patternCounts[r.pattern] = (patternCounts[r.pattern] || 0) + 1;
        });

        const mostCommon = Object.entries(patternCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

        const hardest = results
            .sort((a, b) => a.confidence - b.confidence)[0]?.pattern || 'Unknown';

        const avgTime = Math.random() * 1000 + 500; // Simulated
        const bestAccuracy = results.reduce((max, r) => Math.max(max, r.confidence), 0);

        return { mostCommon, hardest, avgTime: avgTime.toFixed(0), bestAccuracy };
    }

    async downloadPDF(filename) {
        if (!this.doc) {
            throw new Error('No PDF document to download');
        }
        
        this.doc.save(filename);
    }
}

// Export the generator
export default TriNetraPDFGenerator;