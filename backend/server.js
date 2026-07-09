import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ message: "Connection established!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
