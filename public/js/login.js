class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('loginBtn');
        this.messageDiv = document.getElementById('message');
        
        this.init();
    }

    init() {
        // Check if already logged in
        this.checkExistingSession();
        
        // Set up event listeners
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Auto-focus email field
        this.emailInput.focus();
        
        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.loginBtn.disabled) {
                this.form.dispatchEvent(new Event('submit'));
            }
        });
    }

    checkExistingSession() {
        const existingToken = localStorage.getItem('authToken');
        const existingUserId = localStorage.getItem('userId');
        
        if (existingToken && existingUserId) {
            // Verify token is still valid
            fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${existingToken}`,
                    'x-user-id': existingUserId
                }
            }).then(response => {
                if (response.ok) {
                    window.location.href = 'dashboard.html';
                }
            }).catch(error => {
                // Token invalid, clear storage
                this.clearSession();
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const originalText = this.loginBtn.textContent;
        
        // Disable button and show loading
        this.loginBtn.disabled = true;
        this.loginBtn.textContent = 'Iniciando sesión...';
        this.messageDiv.innerHTML = '';
        
        const formData = {
            email: this.emailInput.value.trim(),
            password: this.passwordInput.value
        };
        
        // Basic client-side validation
        if (!formData.email || !formData.password) {
            this.showMessage('Por favor completa todos los campos', 'error');
            this.resetButton(originalText);
            return;
        }

        if (!this.isValidEmail(formData.email)) {
            this.showMessage('Por favor ingresa un email válido', 'error');
            this.resetButton(originalText);
            return;
        }
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.handleLoginSuccess(result);
            } else {
                this.showMessage(result.message, 'error');
                this.resetButton(originalText);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Error de conexión. Intenta de nuevo.', 'error');
            this.resetButton(originalText);
        }
    }

    handleLoginSuccess(result) {
        // Store JWT token and user data
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('userId', result.data.user.id.toString());
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        this.showMessage(`
            ¡Login exitoso! Balance actual: $${parseFloat(result.data.user.cashBalance).toLocaleString()}<br>
            Redirigiendo al dashboard...
        `, 'success');
        
        // Clear form for security
        this.form.reset();
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    showMessage(text, type) {
        this.messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    }

    resetButton(originalText) {
        this.loginBtn.disabled = false;
        this.loginBtn.textContent = originalText;
    }

    clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});
