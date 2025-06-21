# MPP Exam Template

This is a full-stack application template based on the `mppEx1` project structure.

## Technology Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Development Tools**: http-server, nodemon, concurrently

## Project Structure

```
MPP EXAM/
├── frontend/           # Frontend application
│   ├── index.html     # Main HTML file (currently shows "test")
│   ├── styles.css     # CSS styles
│   ├── script.js      # JavaScript functionality
│   └── package.json   # Frontend dependencies
├── backend/            # Backend API
│   ├── server.js      # Express server (basic setup)
│   └── package.json   # Backend dependencies
└── package.json       # Main project file with scripts
```

## Getting Started

1. Install all dependencies:
   ```bash
   npm run install-all
   ```

2. Start both frontend and backend:
   ```bash
   npm start
   ```

3. Access the application:
   - Frontend: http://localhost:8081
   - Backend API: http://localhost:3001

## Database Implementation Pattern (from mppEx1)

When implementing the database, follow this exact pattern:

### Database Setup
```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./game_world.db');
```

### Table Structure
```sql
-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    ability1 REAL NOT NULL,
    ability2 REAL NOT NULL,
    ability3 REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Game players table (for world functionality)
CREATE TABLE IF NOT EXISTS game_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL,
    player_id TEXT UNIQUE NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters (id)
);

-- Spawn points table
CREATE TABLE IF NOT EXISTS spawn_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL
);
```

### Key Implementation Features

1. **Database Initialization**: Automatic table creation and initial data population
2. **CORS Configuration**: Proper cross-origin setup for frontend-backend communication
3. **Character Management**: Full CRUD operations for characters with abilities
4. **Game World**: Position tracking and spawn point management
5. **Real-time Features**: Statistics tracking and live updates

### Dependencies Used

**Frontend:**
- `http-server`: Development server
- `express`: For production server option

**Backend:**
- `express`: Web framework
- `sqlite3`: Database
- `cors`: Cross-origin resource sharing
- `nodemon`: Development auto-restart

**Main Project:**
- `concurrently`: Run frontend and backend simultaneously

## Current Status

- ✅ Project structure created
- ✅ Frontend shows "test" page
- ✅ Backend basic setup (empty but functional)
- ⏳ Database implementation (to be added following the documented pattern)
- ⏳ Character management features (to be implemented)
- ⏳ Game world functionality (to be implemented)

## Scripts Available

- `npm start` - Start both frontend and backend
- `npm run frontend` - Start only frontend
- `npm run backend` - Start only backend
- `npm run install-all` - Install all dependencies "# MPP-EXAM" 
