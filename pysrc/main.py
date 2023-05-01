import socketio
import asyncio

from flask import Flask, request, jsonify
from WebSocket import WebSocket as ws

app = Flask(__name__)
sio = socketio.AsyncClient()

WS_PORT = 5001
PYTHON_PORT = 5003
WS_HOST = 'node'
PYTHON_HOST = '0.0.0.0'

sockets = []

@app.route('/api/join/client', methods=['POST'])
async def joinClient():
    # get token from request (x-www-form-urlencoded)
    if request.method != 'POST':
        return jsonify({'error' : 'Method not allowed', 'status' : 405})

    if request.headers['Content-Type'] != 'application/json':
        return jsonify({'error' : 'Content-Type must be application/json', 'status' : 400})

    request_data = request.get_json()
    token = request_data['token']
    room = request_data['room']

    if token == None or room == None:
        return jsonify({'error' : 'Token or room are not provided', 'status' : 400})

    socket = ws()
    socket.setNeuralNetwork()
    try:
        socket.connect(WS_HOST, WS_PORT)
        socket.joinRoom(room, token)

        sockets.append(socket)
    except:
        return jsonify({'error' : 'Error connecting to server', 'status' : 500})

    return jsonify({'status' : 200})

@app.route('/api/python/verify', methods=['POST', 'GET'])
async def verify():
    return jsonify({'status' : 200}) 

if __name__ ==  '__main__':

    app.run(host=PYTHON_HOST, port=PYTHON_PORT, debug=True)
