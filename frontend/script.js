// Political Candidates Frontend - Connected to Backend via WebSockets

let socket;
let candidates = [];

// Initialize socket connection when available
function initSocket() {
    if (typeof io !== 'undefined') {
        const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://your-backend-app.onrender.com';
        socket = io(backendUrl);
        
        socket.on('connect', () => {
            console.log('✅ Connected to backend!');
        });
        
        socket.on('update', (data) => {
            candidates = data.candidates;
            renderCandidates();
            updateCircleChart(data.chart);
        });
        
        socket.on('log', (data) => {
            addLogMessage(data.message, data.type);
        });
        
        socket.on('disconnect', () => {
            console.log('❌ Disconnected from backend');
        });
    } else {
        console.error('Socket.IO not loaded');
    }
}

// API calls
const getBackendUrl = () => window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://your-backend-app.onrender.com';

const startRealTime = () => {
    fetch(`${getBackendUrl()}/start`, { method: 'POST' })
        .then(res => res.json())
        .then(data => console.log('Started:', data))
        .catch(err => console.error('Start error:', err));
};

const stopRealTime = () => {
    fetch(`${getBackendUrl()}/stop`, { method: 'POST' })
        .then(res => res.json())
        .then(data => console.log('Stopped:', data))
        .catch(err => console.error('Stop error:', err));
};

const updateCircleChart = (counts) => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    let currentAngle = 0;
    document.getElementById('chart').innerHTML = `<div class="pie-chart">${Object.entries(counts).map(([party, count], i) => {
        const angle = (count / total) * 360;
        const slice = `<div class="pie-slice" style="--start: ${currentAngle}deg; --end: ${currentAngle + angle}deg; --color: ${colors[i % colors.length]}"></div>`;
        currentAngle += angle;
        return slice;
    }).join('')}</div><div class="legend">${Object.entries(counts).map(([p, c], i) => `<div style="color: ${colors[i % colors.length]}">● ${p}: ${c}</div>`).join('')}</div>`;
};

const addLogMessage = (message, type) => {
    const logsContainer = document.getElementById('logsContainer');
    const logElement = document.createElement('div');
    logElement.className = `log-message log-${type}`;
    logElement.innerHTML = `<span class="log-time">${new Date().toLocaleTimeString()}</span> ${message}`;
    logsContainer.appendChild(logElement);
    logsContainer.scrollTop = logsContainer.scrollHeight;
    
    // Keep only last 10 messages
    if (logsContainer.children.length > 10) {
        logsContainer.removeChild(logsContainer.firstChild);
    }
};

// Function to render candidates
function renderCandidates() {
    const candidatesGrid = document.getElementById('candidatesGrid');
    candidatesGrid.innerHTML = ''; // Clear existing candidates
    
    candidates.forEach(candidate => {
        const candidateCard = createCandidateCard(candidate);
        candidatesGrid.appendChild(candidateCard);
    });
}

// Function to create individual candidate card
function createCandidateCard(candidate) {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.setAttribute('data-id', candidate.id);
    
    card.innerHTML = `
        <div class="candidate-image">
            <img src="https://picsum.photos/seed/${candidate.name.replace(' ', '')}/300/300" alt="${candidate.name}">
        </div>
        <div class="candidate-info">
            <h3 class="candidate-name">${candidate.name}</h3>
            <p class="candidate-party">${candidate.party}</p>
            <p class="candidate-description">${candidate.description}</p>
        </div>
    `;
    
    return card;
}

// Function to get candidate by ID (for future use)
function getCandidateById(id) {
    return candidates.find(candidate => candidate.id === id);
}

// Function to get all candidates (for future use)
function getAllCandidates() {
    return [...candidates]; // Return a copy to prevent external modifications
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('Political Candidates App loaded - Connecting to backend...');
    
    // Initialize socket connection
    setTimeout(() => {
        initSocket();
    }, 500);
    
    // Add click event listeners to candidate cards
    document.addEventListener('click', function(event) {
        const candidateCard = event.target.closest('.candidate-card');
        if (candidateCard) {
            const candidateId = parseInt(candidateCard.getAttribute('data-id'));
            const candidate = getCandidateById(candidateId);
            console.log('Clicked candidate:', candidate);
            
            // Add visual feedback
            candidateCard.style.transform = 'scale(0.98)';
            setTimeout(() => {
                candidateCard.style.transform = 'scale(1)';
            }, 150);
        }
    });
}); 