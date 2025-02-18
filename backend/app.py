# backend/app.py
from flask import Flask
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_cors import CORS  # Import Flask-CORS
from config import Config
from routes.lobby import lobby_bp, get_lobbies

app = Flask(__name__)
app.config.from_object(Config)

# Initialize SocketIO with eventlet support.
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Enable CORS for all routes
CORS(app)

# Register our lobby API routes under the '/api' prefix.
app.register_blueprint(lobby_bp, url_prefix='/api')

# SocketIO event: when a client wants to join a lobby.
@socketio.on('join_lobby')
def handle_join_lobby(data):
    lobby_id = data.get('lobby_id')
    user_id = data.get('user_id')
    
    lobbies = get_lobbies()  # Access our in-memory store
    
    if lobby_id not in lobbies:
        emit('error', {'message': 'Lobby not found'})
        return
    
    join_room(lobby_id)
    if user_id not in lobbies[lobby_id]['participants']:
        lobbies[lobby_id]['participants'].append(user_id)
    emit('lobby_update', lobbies[lobby_id], room=lobby_id)

# SocketIO event: when a client wants to leave a lobby.
@socketio.on('leave_lobby')
def handle_leave_lobby(data):
    lobby_id = data.get('lobby_id')
    user_id = data.get('user_id')
    
    lobbies = get_lobbies()
    
    if lobby_id in lobbies and user_id in lobbies[lobby_id]['participants']:
        leave_room(lobby_id)
        lobbies[lobby_id]['participants'].remove(user_id)
        emit('lobby_update', lobbies[lobby_id], room=lobby_id)

@socketio.on('update_username')
def handle_update_username(data):
    lobby_id = data.get('lobby_id')
    old_user_id = data.get('old_user_id')
    new_user_id = data.get('new_user_id')
    
    lobbies = get_lobbies()  # Using the in-memory lobby store
    if lobby_id not in lobbies:
        emit('error', {'message': 'Lobby not found'})
        return
    
    # Update the participant list if the old username exists
    participants = lobbies[lobby_id]['participants']
    if old_user_id in participants:
        index = participants.index(old_user_id)
        participants[index] = new_user_id
        # If the host is changing their name, update the host field as well
        if lobbies[lobby_id]['host'] == old_user_id:
            lobbies[lobby_id]['host'] = new_user_id
        emit('lobby_update', lobbies[lobby_id], room=lobby_id)
    else:
        emit('error', {'message': 'User not found in lobby'})


if __name__ == '__main__':
    socketio.run(app, debug=True)
