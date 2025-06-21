const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 3001;

// Initialize database
db.initDatabase();

app.use(cors({ origin: "*" }));
app.use(express.json());

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

// === VOTING SYSTEM API ROUTES ===

// Register/Login with CNP
app.post('/api/auth', async (req, res) => {
    try {
        const { cnp, name } = req.body;
        
        // Validate CNP (13 digits)
        if (!cnp || cnp.length !== 13 || !/^\d+$/.test(cnp)) {
            return res.status(400).json({ error: 'CNP must be exactly 13 digits' });
        }
        
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }

        // Check if user exists
        let user = await db.findUser(cnp);
        
        if (!user) {
            // Register new user
            user = await db.createUser(cnp, name.trim());
            console.log(`✅ New user registered: ${name} (${cnp})`);
        }
        
        res.json({ success: true, user: { cnp: user.cnp, name: user.name } });
    } catch (error) {
        console.error('Auth error:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'CNP already registered with different name' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

// Cast vote
app.post('/api/vote', async (req, res) => {
    try {
        const { cnp, candidateId } = req.body;
        
        // Validate inputs
        if (!cnp || !candidateId) {
            return res.status(400).json({ error: 'CNP and candidate ID required' });
        }
        
        // Check if user exists
        const user = await db.findUser(cnp);
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please register first.' });
        }
        
        // Check if user already voted
        const existingVote = await db.getUserVote(cnp);
        if (existingVote) {
            return res.status(400).json({ error: 'You have already voted!' });
        }
        
        // Check if candidate exists
        const candidate = candidates.find(c => c.id === parseInt(candidateId));
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        
        // Cast vote
        await db.castVote(cnp, candidateId);
        console.log(`🗳️ Vote cast: ${user.name} voted for ${candidate.name}`);
        
        res.json({ 
            success: true, 
            message: `Vote cast for ${candidate.name}!`,
            candidate: candidate
        });
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
});

// Get user's vote status
app.get('/api/vote-status/:cnp', async (req, res) => {
    try {
        const { cnp } = req.params;
        const vote = await db.getUserVote(cnp);
        
        if (vote) {
            const candidate = candidates.find(c => c.id === parseInt(vote.candidate_id));
            res.json({ 
                hasVoted: true, 
                candidate: candidate,
                votedAt: vote.voted_at
            });
        } else {
            res.json({ hasVoted: false });
        }
    } catch (error) {
        console.error('Vote status error:', error);
        res.status(500).json({ error: 'Failed to get vote status' });
    }
});

// Get voting results
app.get('/api/results', async (req, res) => {
    try {
        const voteResults = await db.getVoteResults();
        const totalVotes = await db.getTotalVotes();
        
        // Combine with candidate info
        const results = voteResults.map(result => {
            const candidate = candidates.find(c => c.id === parseInt(result.candidate_id));
            return {
                candidate: candidate,
                votes: result.vote_count,
                percentage: totalVotes > 0 ? ((result.vote_count / totalVotes) * 100).toFixed(1) : 0
            };
        });
        
        // Add candidates with 0 votes
        candidates.forEach(candidate => {
            if (!results.find(r => r.candidate.id === candidate.id)) {
                results.push({
                    candidate: candidate,
                    votes: 0,
                    percentage: 0
                });
            }
        });
        
        res.json({
            results: results.sort((a, b) => b.votes - a.votes),
            totalVotes: totalVotes
        });
    } catch (error) {
        console.error('Results error:', error);
        res.status(500).json({ error: 'Failed to get results' });
    }
});

// === STATIC FILE SERVING (MUST BE AFTER API ROUTES) ===

// Serve static files from frontend directory
app.use(express.static('../frontend'));

// Root route - serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Serve voting page
app.get('/vote', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/vote.html'));
});

// Serve results page
app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/results.html'));
});

// Serve news page
app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/news.html'));
});

io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    socket.emit('update', { candidates, chart: getPartyCounts() });
    socket.emit('log', { message: '🔌 Connected to backend server', type: 'success' });
    
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); 