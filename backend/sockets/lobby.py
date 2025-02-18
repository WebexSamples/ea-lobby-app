# backend/sockets/lobby.py
from flask_socketio import join_room, leave_room, emit
from ..routes.lobby import get_lobbies
from ..constants import (
    LOBBY_JOIN,
    LOBBY_LEAVE,
    LOBBY_UPDATE_DISPLAY_NAME,
    LOBBY_TOGGLE_READY,
    LOBBY_UPDATE,
    LOBBY_ERROR,
)

def register_lobby_socket_handlers(socketio):
    @socketio.on(LOBBY_JOIN)
    def handle_join_lobby(data):
        lobby_id = data.get('lobby_id')
        user = data.get('user')  # Expecting an object: { id, display_name }
        
        if not user or not user.get('id') or not user.get('display_name'):
            emit(LOBBY_ERROR, {'message': 'User id and display_name are required'})
            return
        
        lobbies = get_lobbies()
        if lobby_id not in lobbies:
            emit(LOBBY_ERROR, {'message': 'Lobby not found'})
            return
        
        join_room(lobby_id)
        # Add participant if not already present
        if not any(p['id'] == user['id'] for p in lobbies[lobby_id]['participants']):
            lobbies[lobby_id]['participants'].append({
                'id': user['id'],
                'display_name': user['display_name'],
                'ready': False
            })
        emit(LOBBY_UPDATE, lobbies[lobby_id], room=lobby_id)

    @socketio.on(LOBBY_LEAVE)
    def handle_leave_lobby(data):
        lobby_id = data.get('lobby_id')
        user_id = data.get('user_id')
        
        lobbies = get_lobbies()
        if lobby_id in lobbies:
            lobbies[lobby_id]['participants'] = [
                p for p in lobbies[lobby_id]['participants'] if p['id'] != user_id
            ]
            leave_room(lobby_id)
            emit(LOBBY_UPDATE, lobbies[lobby_id], room=lobby_id)

    @socketio.on(LOBBY_UPDATE_DISPLAY_NAME)
    def handle_update_display_name(data):
        lobby_id = data.get('lobby_id')
        user_id = data.get('user_id')
        new_display_name = data.get('new_display_name')
        
        lobbies = get_lobbies()
        if lobby_id not in lobbies:
            emit(LOBBY_ERROR, {'message': 'Lobby not found'})
            return

        for participant in lobbies[lobby_id]['participants']:
            if participant['id'] == user_id:
                participant['display_name'] = new_display_name
                break

        emit(LOBBY_UPDATE, lobbies[lobby_id], room=lobby_id)

    @socketio.on(LOBBY_TOGGLE_READY)
    def handle_toggle_ready(data):
        lobby_id = data.get('lobby_id')
        user_id = data.get('user_id')
        
        lobbies = get_lobbies()
        if lobby_id not in lobbies:
            emit(LOBBY_ERROR, {'message': 'Lobby not found'})
            return

        for participant in lobbies[lobby_id]['participants']:
            if participant['id'] == user_id:
                participant['ready'] = not participant['ready']
                break
        emit(LOBBY_UPDATE, lobbies[lobby_id], room=lobby_id)
