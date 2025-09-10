// TriNetra Performance Optimization Module

class PerformanceManager {
    constructor() {
        this.isObserving = false;
        this.intersectionObserver = null;
        this.resizeObserver = null;
        this.performanceEntries = [];
        
        this.initializeObservers();
        this.setupPerformanceMonitoring();
    }

    initializeObservers() {
        // Intersection Observer for lazy loading and animations
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.handleVisibilityChange(entry.target, true);
                    } else {
                        this.handleVisibilityChange(entry.target, false);
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: [0, 0.25, 0.5, 0.75, 1]
            });
        }

        // Resize Observer for responsive components
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver((entries) => {
                this.throttle(() => {
                    entries.forEach(entry => {
                        this.handleResize(entry.target, entry.contentRect);
                    });
                }, 100)();
            });
        }

        this.isObserving = true;
    }

    observeElement(element, type = 'visibility') {
        if (!this.isObserving) return;

        if (type === 'visibility' && this.intersectionObserver) {
            this.intersectionObserver.observe(element);
        } else if (type === 'resize' && this.resizeObserver) {
            this.resizeObserver.observe(element);
        }
    }

    unobserveElement(element, type = 'visibility') {
        if (!this.isObserving) return;

        if (type === 'visibility' && this.intersectionObserver) {
            this.intersectionObserver.unobserve(element);
        } else if (type === 'resize' && this.resizeObserver) {
            this.resizeObserver.unobserve(element);
        }
    }

    handleVisibilityChange(element, isVisible) {
        if (isVisible) {
            // Add animation class when element becomes visible
            element.classList.add('fade-in-on-scroll', 'visible');
            
            // Trigger lazy loading for images
            this.lazyLoadImages(element);
            
            // Initialize components when they become visible
            this.initializeComponent(element);
        } else {
            // Pause animations when not visible
            this.pauseAnimations(element);
        }
    }

    handleResize(element, rect) {
        // Dispatch custom resize event
        const resizeEvent = new CustomEvent('elementResize', {
            detail: { element, rect }
        });
        element.dispatchEvent(resizeEvent);
    }

    lazyLoadImages(container) {
        const images = container.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
            }
        });
    }

    initializeComponent(element) {
        // Initialize D3 visualizations only when visible
        if (element.classList.contains('timeline-container') || 
            element.classList.contains('network-container')) {
            const event = new CustomEvent('componentVisible', {
                detail: { element }
            });
            document.dispatchEvent(event);
        }
    }

    pauseAnimations(element) {
        // Pause CSS animations when not visible
        const animatedElements = element.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        this.observeWebVitals();
        
        // Monitor API performance
        this.observeNetworkRequests();
        
        // Monitor render performance
        this.observeRenderPerformance();
    }

    observeWebVitals() {
        // First Contentful Paint (FCP)
        this.observePerformanceEntry('paint', (entry) => {
            if (entry.name === 'first-contentful-paint') {
                console.log('🎨 FCP:', entry.startTime + 'ms');
                this.trackMetric('FCP', entry.startTime);
            }
        });

        // Largest Contentful Paint (LCP)
        this.observePerformanceEntry('largest-contentful-paint', (entry) => {
            console.log('🖼️ LCP:', entry.startTime + 'ms');
            this.trackMetric('LCP', entry.startTime);
        });

        // Cumulative Layout Shift (CLS)
        this.observePerformanceEntry('layout-shift', (entry) => {
            if (!entry.hadRecentInput) {
                console.log('📐 CLS:', entry.value);
                this.trackMetric('CLS', entry.value);
            }
        });

        // First Input Delay (FID)
        this.observePerformanceEntry('first-input', (entry) => {
            console.log('👆 FID:', entry.processingStart - entry.startTime + 'ms');
            this.trackMetric('FID', entry.processingStart - entry.startTime);
        });
    }

    observeNetworkRequests() {
        this.observePerformanceEntry('navigation', (entry) => {
            console.log('🌐 Navigation Timing:', {
                DNS: entry.domainLookupEnd - entry.domainLookupStart,
                TCP: entry.connectEnd - entry.connectStart,
                Request: entry.responseStart - entry.requestStart,
                Response: entry.responseEnd - entry.responseStart,
                DOM: entry.domContentLoadedEventEnd - entry.responseEnd,
                Load: entry.loadEventEnd - entry.loadEventStart
            });
        });

        this.observePerformanceEntry('resource', (entry) => {
            if (entry.name.includes('/api/')) {
                console.log('🔗 API Request:', entry.name, entry.duration + 'ms');
                this.trackMetric('API_Response_Time', entry.duration);
            }
        });
    }

    observeRenderPerformance() {
        this.observePerformanceEntry('measure', (entry) => {
            if (entry.name.includes('render')) {
                console.log('🎭 Render Timing:', entry.name, entry.duration + 'ms');
                this.trackMetric('Render_Time', entry.duration);
            }
        });
    }

    observePerformanceEntry(type, callback) {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach(callback);
                });
                observer.observe({ type, buffered: true });
            } catch (e) {
                console.warn('Performance Observer not supported for:', type);
            }
        }
    }

    trackMetric(name, value) {
        this.performanceEntries.push({
            name,
            value,
            timestamp: Date.now()
        });

        // Send to analytics (if implemented)
        this.sendToAnalytics(name, value);
    }

    sendToAnalytics(metric, value) {
        // Implementation for sending metrics to analytics service
        console.log('📊 Metric:', metric, value);
        
        // Could send to Google Analytics, custom analytics, etc.
        if (window.gtag) {
            window.gtag('event', 'performance_metric', {
                metric_name: metric,
                metric_value: value,
                custom_parameter: 'trinetra_app'
            });
        }
    }

    // Utility functions
    throttle(func, limit) {
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

    debounce(func, wait) {
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

    // Memory management
    optimizeMemory() {
        // Clear old performance entries
        if (this.performanceEntries.length > 1000) {
            this.performanceEntries = this.performanceEntries.slice(-500);
        }

        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    // Service Worker communication
    updateServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'CACHE_UPDATED') {
                    this.showUpdateNotification();
                }
            });
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>🔄 Update available!</span>
                <button onclick="location.reload()">Refresh</button>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 10000);
    }

    // Resource preloading
    preloadCriticalResources() {
        const criticalResources = [
            '/js/chronos.js',
            '/js/hydra.js',
            '/js/autosar.js',
            'https://d3js.org/d3.v7.min.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'modulepreload';
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    // Image optimization
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.loading) {
                img.loading = 'lazy';
            }
            if (!img.decoding) {
                img.decoding = 'async';
            }
        });
    }

    // Cleanup
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this.isObserving = false;
        this.performanceEntries = [];
    }

    // Performance report
    getPerformanceReport() {
        return {
            entries: this.performanceEntries,
            memory: this.getMemoryInfo(),
            connection: this.getConnectionInfo(),
            timestamp: Date.now()
        };
    }

    getMemoryInfo() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    getConnectionInfo() {
        if ('connection' in navigator) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }
        return null;
    }
}

// Create global performance manager instance
const performanceManager = new PerformanceManager();

// Auto-start performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    performanceManager.preloadCriticalResources();
    performanceManager.optimizeImages();
    performanceManager.updateServiceWorker();
    
    // Clean up memory periodically
    setInterval(() => {
        performanceManager.optimizeMemory();
    }, 300000); // Every 5 minutes
});

export default performanceManager;