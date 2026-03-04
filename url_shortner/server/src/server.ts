import 'dotenv/config';
import express from 'express';
import cors from 'cors'
import DB_CONNECTION from './config/db'
const app = express();

const corsOptions = {
    origin: 'http://localhost:3000/',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true
}

DB_CONNECTION();

// Middleware to parse JSON (needed for your URL shortener later)
app.use(express.json());

app.use(express.urlencoded({ extended: true }))

const port = process.env.PORT || 4001;
// Adds headers: Access-Control-Allow-Origin: *
app.use(cors(corsOptions))

app.get('/', (req, res) => {
    res.send('Hello world ');
});

// This line is what keeps the process running
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});