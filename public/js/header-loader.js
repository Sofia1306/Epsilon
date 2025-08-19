class HeaderLoader {
    constructor() {
        this.headerLoaded = false;
        this.init();
    }

    async init() {
        // Only load header on authenticated pages
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        // Skip loading on login/register pages
        const currentPage = window.location.pathname.split('/').pop();
        const skipPages = ['login.html', 'register.html', 'forgot-password.html', 'reset-password.html', 'index.html'];
        
        if (skipPages.includes(currentPage)) return;

        await this.loadHeader();
    }

    async loadHeader() {
        try {
            const response = await fetch('./components/header.html');
            const headerHTML = await response.text();
            
            // Create header container if it doesn't exist
            let headerContainer = document.getElementById('global-header-container');
            if (!headerContainer) {
                headerContainer = document.createElement('div');
                headerContainer.id = 'global-header-container';
                document.body.insertBefore(headerContainer, document.body.firstChild);
            }
            
            headerContainer.innerHTML = headerHTML;
            this.headerLoaded = true;

            // Adjust body padding to account for fixed header
            document.body.style.paddingTop = '0px';
            
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    // Method to update cash balance from other components
    updateCashBalance(newBalance) {
        if (this.headerLoaded && typeof updateHeaderCashBalance === 'function') {
            updateHeaderCashBalance(newBalance);
        }
    }
}

// Create global instance
const headerLoader = new HeaderLoader();

// Make it available globally
window.headerLoader = headerLoader;
