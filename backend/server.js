import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    // Return current date and time in JSON format
    const currentDateTime = new Date();
    res.json({ 
      status: 'OK', 
      currentDateTime: currentDateTime.toISOString(),
      service: 'VinoVenture Backend',
      version: '1.0.0',
      uptime: process.uptime()
    });
});

// Simple liveness check endpoint
app.get('/api/health/live', (req, res) => {
    res.json({ status: 'alive' });
});

// Readiness check endpoint
app.get('/api/health/ready', (req, res) => {
    // In a real application, you would check database connections, etc.
    // For now, we just return ready status
    res.json({ status: 'ready' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
