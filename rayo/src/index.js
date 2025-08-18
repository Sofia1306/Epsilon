import express from 'express';
import bodyParser from 'body-parser'
import path from 'path';
import { fileURLToPath } from 'url';
import {DBinit} from './config/DBconnection.js';
import AUTH from './API_AUTH/API_AUTH.js';

//set up and configure express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

const connection= await DBinit();
AUTH(app,connection);

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

/*
app.get('/', (req, res) => {
    const indexUrl= new URL('./public/Dashboard2.html',import.meta.url);
    const fpath=process.platform=='win32'?indexUrl.pathname.substring(1):indexUrl.pathname;
    res.sendFile(fpath);
});*/

app.get('/market/stock', (req, res) => {
    const indexUrl= new URL('./public/buscador.html',import.meta.url);
    const fpath=process.platform=='win32'?indexUrl.pathname.substring(1):indexUrl.pathname;
    res.sendFile(fpath);
});

app.get('/API/market/stock', async (req, res) => {
    if(Object.keys(req.query).length===0){
        try {
            console.log("no hay keys papoi");
            res.status(500).send("no hay parametros papoi");
        } catch (err) {
            console.log(err);
        }
    }else{
        const queryKeys = Object.keys(req.query);
        if(queryKeys[0]=='value'){
            const valor =req.query.value;
            const Response = await fetch(`https://finnhub.io/api/v1/search?q=${valor}&exchange=US&token=d2f2qkpr01qj3egqt150d2f2qkpr01qj3egqt15g`);
            const Data = await Response.json();
            console.log(Data.result);
            res.status(200).json(Data.result);
        }
    }
});

app.get('/API/market/stock-price/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol;
        const Response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=d2f2qkpr01qj3egqt150d2f2qkpr01qj3egqt15g`);
        const Data = await Response.json();
        res.status(200).json(Data); // results contains rows returned by server
        
    } catch (err) {
        console.log(err);
    }
});



app.get('/API/market/market-data', async (req, res) => {
    try {
        let Response = await fetch(`${RootURL}/API/stock`);
        const DataStock = await Response.json();
        Response = await fetch(`${RootURL}/API/forex`);
        const DataForex = await Response.json();
        Response = await fetch(`${RootURL}/API/crypto`);
        const DataCrypto = await Response.json();
        const Data = {
            Stock: DataStock,
            Forex: DataForex,
            Crypto: DataCrypto
        };
        res.status(200).json(Data); // results contains rows returned by server
        
    } catch (err) {
        console.log(err);
    }
});

app.get('/API/stock', async (req, res) => {
    try {
        const Response = await fetch('https://finnhub.io/api/v1/stock/symbol?exchange=US&token=d2f2qkpr01qj3egqt150d2f2qkpr01qj3egqt15g');
        const Data = await Response.json();
        const LimitedData = Data.slice(0,10);
        res.status(200).json(LimitedData); // results contains rows returned by server
        
    } catch (err) {
        console.log(err);
    }
});

app.get('/API/news', async (req, res) => {
    try {
        const Response = await fetch('https://finnhub.io/api/v1/news?category=general&token=d2f2qkpr01qj3egqt150d2f2qkpr01qj3egqt15g');
        const Data = await Response.json();
        const LimitedData = Data.slice(0,10);
        res.send(Data); // results contains rows returned by server
        
    } catch (err) {
        console.log(err);
    }
});

app.get('/API/forex', async (req, res) => {
    try {
        const Response = await fetch('https://finnhub.io/api/v1/forex/symbol?exchange=oanda&token=d2f2qkpr01qj3egqt150d2f2qkpr01qj3egqt15g');
        const Data = await Response.json();
        const LimitedData = Data.slice(0,10);
        res.json(LimitedData); // results contains rows returned by server
        
    } catch (err) {
        console.log(err);
    }
});

app.get('/API/crypto', async (req, res) => {
    try {
        const Response = await fetch('https://finnhub.io/api/v1/crypto/symbol?exchange=binance&token=d2f2qkpr01qj3egqt150d2f2qkpr01qj3egqt15g');
        const Data = await Response.json();
        const LimitedData = Data.slice(0,10);
        res.json(LimitedData); // results contains rows returned by server
        
    } catch (err) {
        console.log(err);
    }
});
//start the server
app.listen(8081, () => { 
    console.log("Server is running.");
     });

//routes.function();
