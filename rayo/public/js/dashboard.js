const userId = localStorage.getItem('userId');
const user = JSON.parse(localStorage.getItem('user') || '{}');
document.getElementById('userName').textContent = user.firstName || user.username || 'Usuario';

console.log(userId);
let portfolioVisible = false;
let portfolioCharts = {};

if (!userId) {
    window.location.href = 'login.html';
}

async function cargarNoticias(){
    try{
        const res= await fetch("/API/news");
        const data = await res.json();
        const contenedor = document.getElementById("news");
        contenedor.innerHTML="";
        data.forEach(noticia => {
            const card = document.createElement("div");
            card.className="news-card";
            card.innerHTML=`
            ${noticia.image?`<img src="${noticia.image}" alt="Noticia">`:""}
            <h3>${noticia.headline}</h3>
            <p>${noticia.summary||"sin descripcion."}</p>
            <a href="${noticia.url}" target="_blank">Leer más</a>
            `;
            contenedor.appendChild(card);
        });
    }catch(err){
        console.log(err);
    }
}
window.onload=cargarNoticias;

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
