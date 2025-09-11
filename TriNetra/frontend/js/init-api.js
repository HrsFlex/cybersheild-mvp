// Initialize API Configuration
// This script sets up the Gemini API key for the application

class APIInitializer {
    constructor() {
        this.initializeAPI();
    }

    initializeAPI() {
        // Configure the Gemini API key
        const apiKey = 'AIzaSyBu_3HVHUojFWJgK_APYx9h-4CkJJ-XXVY';
        
        // Store in localStorage for the application to use
        localStorage.setItem('gemini_api_key', apiKey);
        
        console.log('✅ Gemini API key configured successfully');
        
        // Skip automatic API test to avoid rate limiting
        // Test will happen when API is actually used
        console.log('🔄 API test skipped - will test on first use to avoid rate limiting');
        this.showAPIStatus('API Ready - Test on Use', 'success');
    }

    async testAPIConnection() {
        try {
            // Import and test the Gemini API
            const { default: geminiAPI } = await import('./gemini-api.js');
            
            if (geminiAPI.isConfigured()) {
                console.log('🔗 Testing Gemini API connection...');
                
                const testResult = await geminiAPI.testConnection();
                
                if (testResult.success) {
                    console.log('✅ Gemini API connection successful');
                    this.showAPIStatus('API Connected', 'success');
                } else {
                    console.log('⚠️ Gemini API connection failed:', testResult.message);
                    this.showAPIStatus('API Error - Using Mock Data', 'warning');
                }
            } else {
                console.log('⚠️ Gemini API not configured properly');
                this.showAPIStatus('API Not Configured', 'error');
            }
        } catch (error) {
            console.log('🔄 API test skipped - module not loaded yet');
        }
    }

    showAPIStatus(message, type) {
        // Create a small status indicator
        const statusDiv = document.createElement('div');
        statusDiv.id = 'api-status';
        statusDiv.className = `fixed bottom-4 right-4 px-3 py-2 rounded-lg text-xs font-semibold z-50 ${
            type === 'success' ? 'bg-green-600 text-white' :
            type === 'warning' ? 'bg-yellow-600 text-black' :
            'bg-red-600 text-white'
        }`;
        statusDiv.textContent = message;
        
        document.body.appendChild(statusDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (document.getElementById('api-status')) {
                statusDiv.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new APIInitializer();
});

export default APIInitializer;