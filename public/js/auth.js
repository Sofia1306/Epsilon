class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    // Get auth headers for API requests
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        // Fallback for existing implementation
        if (this.user.id) {
            headers['x-user-id'] = this.user.id;
        }
        
        return headers;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user.id;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Update user data
    updateUser(userData) {
        this.user = { ...this.user, ...userData };
        localStorage.setItem('user', JSON.stringify(this.user));
    }

    // Login user
    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const result = await response.json();

            if (result.success) {
                this.token = result.data.token;
                this.user = result.data.user;
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('userId', this.user.id);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                return { success: true, user: this.user };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    // Logout user
    async logout() {
        try {
            if (this.token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.token = null;
            this.user = {};
            
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            
            window.location.href = 'login.html';
        }
    }

    // Refresh token
    async refreshToken() {
        try {
            if (!this.token) return false;

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            const result = await response.json();

            if (result.success) {
                this.token = result.data.token;
                localStorage.setItem('authToken', this.token);
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    // Make authenticated API request
    async apiRequest(url, options = {}) {
        const config = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, config);
            
            // Handle token expiration
            if (response.status === 401) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry with new token
                    config.headers = {
                        ...this.getAuthHeaders(),
                        ...(options.headers || {})
                    };
                    return await fetch(url, config);
                } else {
                    throw new Error('Authentication failed');
                }
            }

            return response;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Check authentication and redirect if needed
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Initialize auth on page load
    init() {
        // Auto-refresh token if it expires in the next 5 minutes
        if (this.token) {
            try {
                const payload = JSON.parse(atob(this.token.split('.')[1]));
                const expiresIn = (payload.exp * 1000) - Date.now();
                
                if (expiresIn < 5 * 60 * 1000) { // Less than 5 minutes
                    this.refreshToken();
                }
            } catch (error) {
                console.error('Token parsing error:', error);
            }
        }
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    authManager.init();
});

// Export for use in other scripts
window.authManager = authManager;