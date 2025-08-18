
const input = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

async function cargarBusquedaStock(valor){
    try{
    const searchContainer = document.getElementById("searchContainer");
    const res= await fetch(`/API/market/stock?value=${valor}`);
    const data = await res.json();
    searchContainer.innerHTML="";
    for (const item of data) {
        const container = document.createElement("div");
        container.className = "stock-container";
        try {
        const resPrice = await fetch(`/API/market/stock-price/${item.symbol}`);
        const dataPrice = await resPrice.json();
        container.innerHTML = `
            <h3>${item.description}</h3>
            <p id="item_Symbol">Symbol: ${item.symbol}</p>
            <p id="item_CPrice">Price: $${dataPrice.c}</p>
            <p id="item_PChange">Percent change: ${dataPrice.dp}%</p>
        `;
        } catch (err) {
        container.innerHTML = `
            <h3>${item.description}</h3>
            <p>Symbol: ${item.symbol}</p>
            <p style="color:red;">Error fetching price</p>
        `;
        console.error(`Error fetching price for ${item.symbol}:`, err);
        }
        searchContainer.appendChild(container);
    }
    }catch(err){
    console.log(err);
    }
}

// Buscar al presionar ENTER
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
    const value = input.value.trim();
    if (value) cargarBusquedaStock(value);
    }
});

// Buscar al dar clic en la lupa
searchBtn.addEventListener('click', () => {
    const value = input.value.trim();
    if (value) cargarBusquedaStock(value);
});