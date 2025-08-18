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
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
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