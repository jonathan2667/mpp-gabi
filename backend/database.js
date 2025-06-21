const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'voting.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cnp TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Votes table
    db.run(`CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_cnp TEXT NOT NULL,
        candidate_id INTEGER NOT NULL,
        voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_cnp) REFERENCES users(cnp),
        UNIQUE(user_cnp) -- One vote per user
    )`);

    console.log('✅ Database initialized');
};

// User operations
const createUser = (cnp, name) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (cnp, name) VALUES (?, ?)', [cnp, name], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, cnp, name });
            }
        });
    });
};

const findUser = (cnp) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE cnp = ?', [cnp], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Vote operations
const castVote = (userCnp, candidateId) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO votes (user_cnp, candidate_id) VALUES (?, ?)', [userCnp, candidateId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, userCnp, candidateId });
            }
        });
    });
};

const getUserVote = (userCnp) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM votes WHERE user_cnp = ?', [userCnp], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const getVoteResults = () => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT 
                candidate_id,
                COUNT(*) as vote_count
            FROM votes 
            GROUP BY candidate_id 
            ORDER BY vote_count DESC
        `, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const getTotalVotes = () => {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as total FROM votes', (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.total);
            }
        });
    });
};

module.exports = {
    initDatabase,
    createUser,
    findUser,
    castVote,
    getUserVote,
    getVoteResults,
    getTotalVotes
}; 