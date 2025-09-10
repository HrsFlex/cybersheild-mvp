// TriNetra Utility Functions

// Show/hide loading overlay
export function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Format currency
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date/time
export function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format percentage
export function formatPercentage(value) {
    return `${(value * 100).toFixed(1)}%`;
}

// Get suspicion level based on score
export function getSuspicionLevel(score) {
    if (score >= 0.8) return 'critical';
    if (score >= 0.5) return 'suspicious';
    return 'normal';
}

// Get color based on suspicion level
export function getSuspicionColor(score) {
    const level = getSuspicionLevel(score);
    switch (level) {
        case 'critical': return '#ff4757';
        case 'suspicious': return '#ffa502';
        case 'normal': return '#00d4ff';
        default: return '#00d4ff';
    }
}

// Create notification
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '6px',
        color: 'white',
        zIndex: '9999',
        maxWidth: '300px',
        fontSize: '0.9rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        backgroundColor: type === 'error' ? '#ff4757' : 
                         type === 'success' ? '#00ff87' : 
                         type === 'warning' ? '#ffa502' : '#00d4ff'
    });
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Parse transaction data for visualization
export function parseTransactionData(transactions) {
    return transactions.map(tx => ({
        ...tx,
        timestamp: new Date(tx.timestamp),
        suspicionLevel: getSuspicionLevel(tx.suspicious_score),
        color: getSuspicionColor(tx.suspicious_score)
    }));
}

// Calculate pattern statistics
export function calculatePatternStats(transactions) {
    const total = transactions.length;
    const suspicious = transactions.filter(tx => tx.suspicious_score > 0.5).length;
    const critical = transactions.filter(tx => tx.suspicious_score > 0.8).length;
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const avgAmount = totalAmount / total;
    const avgSuspicion = transactions.reduce((sum, tx) => sum + tx.suspicious_score, 0) / total;
    
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

// Animate counter
export function animateCounter(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Generate random ID
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Deep clone object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Create loading dots animation
export function createLoadingDots() {
    const dots = document.createElement('span');
    dots.className = 'loading-dots';
    dots.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        .loading-dots span {
            animation: loading-dot 1.4s infinite ease-in-out both;
        }
        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes loading-dot {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    return dots;
}