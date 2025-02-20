# Multi-User Pregame Lobby

A sample project demonstrating a multi-user pregame lobby system built with a Flask backend and a React frontend (using Vite). The backend leverages Flask-SocketIO for real-time communication, while the frontend uses Socket.IO to interact with the backend. The project features include lobby creation, user join/leave, display name updates, and a "Ready" status toggle—all organized into modular components.

## Features

- **Lobby Creation:** Create a lobby with a custom lobby name.
- **User Join/Leave:** Users can join or leave a lobby without navigating away.
- **Unique User Identification:** Each user is assigned a unique UUID, and their display name is stored separately.
- **Display Name Update:** Users can update their display name.
- **Ready Toggle:** Users can switch between "Ready" and "Not Ready" states.
- **Real-Time Updates:** All lobby updates are pushed in real time using Socket.IO.
- **Modular Codebase:** Clear separation of concerns with dedicated modules for REST routes, socket handlers, and constants.

## Project Structure

```
multi-user-pregame-lobby/
├── backend/
│   ├── app.py              # Main Flask app
│   ├── config.py           # Flask configuration
│   ├── constants.py        # Socket event constants
│   ├── requirements.txt    # Python dependencies
│   ├── __init__.py         # Marks the backend directory as a package
│   ├── routes/
│   │   ├── __init__.py     # Marks the routes directory as a package
│   │   └── lobby.py        # REST routes for lobby management
│   ├── sockets/
│   │   ├── __init__.py     # Marks the sockets directory as a package
│   │   └── lobby.py        # Socket.IO event handlers for lobby events
│   └── utils/
│       ├── __init__.py     # Marks the utils directory as a package
│       └── helpers.py      # Utility functions
└── frontend/
    ├── index.html          # Main HTML template for React
    ├── package.json        # Node dependencies and scripts
    ├── vite.config.js      # Vite configuration file
    ├── public/             # Public assets (optional)
    └── src/
        ├── assets/         # Static assets (images, styles, etc.)
        ├── components/
        │   ├── CreateLobby.jsx  # Component for lobby creation
        │   └── Lobby.jsx        # Component for joining and interacting in a lobby
        ├── App.jsx         # Main React component with routing
        ├── main.jsx        # React entry point
        └── constants.js    # Socket event constants for the frontend
```

## Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm

### Backend Setup

1. **Navigate to the `backend` folder:**

   ```bash
   cd multi-user-pregame-lobby/backend
   ```

2. **Create a virtual environment:**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**

   - On macOS/Linux:

     ```bash
     source venv/bin/activate
     ```

   - On Windows:

     ```bash
     venv\Scripts\activate
     ```

4. **Install the required packages:**

   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. **Navigate to the `frontend` folder:**

   ```bash
   cd multi-user-pregame-lobby/frontend
   ```

2. **Install Node dependencies:**

   ```bash
   npm install
   ```

## Running the Project

### Start the Backend

From the project root (`multi-user-pregame-lobby`), run:

```bash
python -m backend.app
```

This starts the Flask server with Socket.IO on the default port (5000).

### Start the Frontend

In a separate terminal, navigate to the `frontend` folder and run:

```bash
npm run dev
```

This starts the Vite development server, usually available at `http://localhost:5173`.

## Usage

### Creating a Lobby

1. Navigate to `http://localhost:5173/create-lobby` in your browser.
2. Enter a lobby name and your display name.
3. Click **Create Lobby**. You will be redirected to the lobby page with your host details auto-joined.

### Joining an Existing Lobby

- If you’re not the host, navigate to `http://localhost:5173/lobby/<lobby_id>`:
  - Enter your display name and click **Join Lobby**.

### Lobby Controls

- **Toggle Ready:** Click the **Toggle Ready** button to switch between "Ready" and "Not Ready."
- **Update Display Name:** Enter a new display name and click **Update Name**.
- **Leave Lobby:** Click **Leave Lobby** to exit the lobby. The page remains on the lobby view, allowing you to rejoin if desired.

## Socket Event Constants

Both the backend and frontend use centralized constants to manage socket event names:

- **Backend:** `backend/constants.py`
- **Frontend:** `frontend/src/constants.js`

Example constants:

```python
# backend/constants.py
LOBBY_JOIN = 'lobby:join'
LOBBY_LEAVE = 'lobby:leave'
LOBBY_UPDATE_DISPLAY_NAME = 'lobby:update_display_name'
LOBBY_TOGGLE_READY = 'lobby:toggle_ready'
LOBBY_UPDATE = 'lobby:update'
LOBBY_ERROR = 'lobby:error'
```

```js
// frontend/src/constants.js
export const SOCKET_EVENTS = {
  LOBBY_JOIN: 'lobby:join',
  LOBBY_LEAVE: 'lobby:leave',
  LOBBY_UPDATE_DISPLAY_NAME: 'lobby:update_display_name',
  LOBBY_TOGGLE_READY: 'lobby:toggle_ready',
  LOBBY_UPDATE: 'lobby:update',
  LOBBY_ERROR: 'lobby:error',
};
```

## Acknowledgements

- [Flask](https://flask.palletsprojects.com/)
- [Flask-SocketIO](https://flask-socketio.readthedocs.io/)
- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)

## Thanks!

Made with <3 by the Webex Developer Relations Team at Cisco
