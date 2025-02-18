# backend/sockets/lobby.py
from flask_socketio import join_room, leave_room, emit
from routes.lobby import get_lobbies

def register_lobby_socket_handlers(socketio):
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
        # Add the participant if they are not already in the lobby.
        if not any(p['id'] == user['id'] for p in lobbies[lobby_id]['participants']):
            lobbies[lobby_id]['participants'].append({
                'id': user['id'],
                'display_name': user['display_name'],
                'ready': False
            })
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
