const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for frontend communication
app.use(cors({
    origin: [
        'http://localhost:8081',
        'http://127.0.0.1:8081'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
    res.json({
        message: 'Backend template is running',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

// TODO: Database initialization will be implemented here following the mppEx1 pattern:
// - SQLite database setup
// - Tables creation (characters, game_players, spawn_points, etc.)
// - Initial data population
// - CRUD operations for characters

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}`);
}); 