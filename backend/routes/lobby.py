# backend/routes/lobby.py
from flask import Blueprint, request, jsonify
import uuid

lobby_bp = Blueprint('lobby_bp', __name__)

# In-memory store for lobbies.
# Structure: { lobby_id: { 'host': 'host_id', 'lobby_name': 'name', 'participants': [user_ids] } }
lobbies = {}

@lobby_bp.route('/lobby', methods=['POST'])
def create_lobby():
    """Creates a new lobby given a host_id and optional lobby_name."""
    data = request.json
    host_id = data.get('host_id')
    lobby_name = data.get('lobby_name', 'Default Lobby')
    
    if not host_id:
        return jsonify({'error': 'host_id is required'}), 400
    
    lobby_id = str(uuid.uuid4())
    lobbies[lobby_id] = {
        'host': host_id,
        'lobby_name': lobby_name,
        'participants': [host_id]
    }
    # Update lobby_url as needed
    lobby_url = f"http://localhost:5000/lobby/{lobby_id}"
    return jsonify({'lobby_id': lobby_id, 'lobby_url': lobby_url, 'lobby_name': lobby_name}), 201

@lobby_bp.route('/lobby/<lobby_id>', methods=['GET'])
def get_lobby(lobby_id):
    """Returns the lobby information for the given lobby_id."""
    lobby = lobbies.get(lobby_id)
    if not lobby:
        return jsonify({'error': 'Lobby not found'}), 404
    return jsonify(lobby), 200

def get_lobbies():
    """Utility function to access the in-memory lobby store."""
    return lobbies
