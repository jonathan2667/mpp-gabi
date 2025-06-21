const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static('../frontend'));

// Root route - serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Handle favicon.ico request (prevent 404)
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Candidates data in memory  
let candidates = [
    {id: 1, name: "Elena Popescu", party: "PDL", description: "Experienced politician"},
    {id: 2, name: "Mihai Ionescu", party: "PSD", description: "Young entrepreneur"},
    {id: 3, name: "Ana Georgescu", party: "USR", description: "Former prosecutor"},
    {id: 4, name: "Gheorghe Marinescu", party: "PNL", description: "Veteran politician"},
    {id: 5, name: "Carmen Stanescu", party: "AUR", description: "Environmental scientist"}
];

const names = ["Adrian", "Cristina", "Valentin", "Monica", "Florin", "Andreea"];
const parties = ["PDL", "PSD", "USR", "PNL", "AUR", "PMP"];
let updateInterval;

// Get all candidates
app.get('/candidates', (req, res) => res.json(candidates));

// Start real-time updates
app.post('/start', (req, res) => {
    if (updateInterval) clearInterval(updateInterval);
    console.log('🚀 Starting real-time candidate generation...');
    io.emit('log', { message: '🚀 Real-time updates started!', type: 'info' });
    
    updateInterval = setInterval(() => {
        const newId = candidates.length + 1;
        const newCandidate = {
            id: newId,
            name: names[Math.floor(Math.random() * names.length)] + " " + newId,
            party: parties[Math.floor(Math.random() * parties.length)],
            description: "New candidate"
        };
        candidates.push(newCandidate);
        console.log(`➕ New candidate created: ${newCandidate.name} (${newCandidate.party})`);
        io.emit('update', { candidates, chart: getPartyCounts() });
        io.emit('log', { message: `➕ New candidate: ${newCandidate.name} (${newCandidate.party})`, type: 'success' });
    }, 2000);
    res.json({ status: 'started' });
});

// Stop updates
app.post('/stop', (req, res) => {
    clearInterval(updateInterval);
    updateInterval = null;
    console.log('⏹️ Real-time updates stopped');
    io.emit('log', { message: '⏹️ Real-time updates stopped', type: 'warning' });
    res.json({ status: 'stopped' });
});

const getPartyCounts = () => candidates.reduce((acc, c) => ({...acc, [c.party]: (acc[c.party] || 0) + 1}), {});

io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    socket.emit('update', { candidates, chart: getPartyCounts() });
    socket.emit('log', { message: '🔌 Connected to backend server', type: 'success' });
    
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); 