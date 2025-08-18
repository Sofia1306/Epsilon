document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        password: document.getElementById('password').value,
        money: document.getElementById('money').value
    };
    
    try {
        const response = await fetch('/API/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        const messageDiv = document.getElementById('message');
        
        if (result.success) {
            messageDiv.innerHTML = '<div class="message success">¡Registro exitoso! Redirigiendo al login...</div>';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            messageDiv.innerHTML = `<div class="message error">${result.message}</div>`;
        }
    } catch (error) {
        document.getElementById('message').innerHTML = '<div class="message error">Error de conexión</div>';
    }
});