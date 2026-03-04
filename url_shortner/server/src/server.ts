import express from 'express';
import 'dotenv/config';

const app = express();

// Middleware to parse JSON (needed for your URL shortener later)
app.use(express.json());

const port = process.env.PORT || 4001;

app.get('/', (req, res) => {
    res.send('Hello world ');
});

// This line is what keeps the process running
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});