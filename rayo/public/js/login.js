document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
    try {
        const response = await fetch('/API/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        console.log(result);
        const messageDiv = document.getElementById('message');
        
        if (result.success) {
            // Store JWT token and user data
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('userId', result.data.user.id);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            
            messageDiv.innerHTML = '<div class="message success">¡Login exitoso! Redirigiendo...</div>';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            messageDiv.innerHTML = `<div class="message error">${result.message}</div>`;
        }
    } catch (error) {
        document.getElementById('message').innerHTML = '<div class="message error">Error de conexión</div>';
    }
});