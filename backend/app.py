# backend/app.py
from flask import Flask
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_cors import CORS
from config import Config
from routes.lobby import lobby_bp, get_lobbies

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Enable CORS for all routes

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Register API routes
app.register_blueprint(lobby_bp, url_prefix='/api')

@socketio.on('join_lobby')
def handle_join_lobby(data):
    lobby_id = data.get('lobby_id')
    user = data.get('user')  # Expecting an object: { id, display_name }
    
    if not user or not user.get('id') or not user.get('display_name'):
        emit('error', {'message': 'User id and display_name are required'})
        return
    
    lobbies = get_lobbies()
    if lobby_id not in lobbies:
        emit('error', {'message': 'Lobby not found'})
        return
    
    join_room(lobby_id)
    # Add participant if not already present
    if not any(p['id'] == user['id'] for p in lobbies[lobby_id]['participants']):
        lobbies[lobby_id]['participants'].append({'id': user['id'], 'display_name': user['display_name'], 'ready': False})
    emit('lobby_update', lobbies[lobby_id], room=lobby_id)

@socketio.on('leave_lobby')
def handle_leave_lobby(data):
    lobby_id = data.get('lobby_id')
    user_id = data.get('user_id')
    
    lobbies = get_lobbies()
    if lobby_id in lobbies:
        lobbies[lobby_id]['participants'] = [
            p for p in lobbies[lobby_id]['participants'] if p['id'] != user_id
        ]
        leave_room(lobby_id)
        emit('lobby_update', lobbies[lobby_id], room=lobby_id)

@socketio.on('update_display_name')
def handle_update_display_name(data):
    lobby_id = data.get('lobby_id')
    user_id = data.get('user_id')
    new_display_name = data.get('new_display_name')
    
    lobbies = get_lobbies()
    if lobby_id not in lobbies:
        emit('error', {'message': 'Lobby not found'})
        return

    for participant in lobbies[lobby_id]['participants']:
        if participant['id'] == user_id:
            participant['display_name'] = new_display_name
            break

    # Update the host's display name if needed
    if lobbies[lobby_id]['host'] == user_id:
        # Here we assume host's display name is stored only in the participant object
        pass

    emit('lobby_update', lobbies[lobby_id], room=lobby_id)

@socketio.on('toggle_ready')
def handle_toggle_ready(data):
    lobby_id = data.get('lobby_id')
    user_id = data.get('user_id')
    
    lobbies = get_lobbies()
    if lobby_id not in lobbies:
        emit('error', {'message': 'Lobby not found'})
        return

    for participant in lobbies[lobby_id]['participants']:
        if participant['id'] == user_id:
            participant['ready'] = not participant['ready']
            break
    emit('lobby_update', lobbies[lobby_id], room=lobby_id)

if __name__ == '__main__':
    socketio.run(app, debug=True)
