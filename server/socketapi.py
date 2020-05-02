from flask_socketio import emit
from flask import request
import json


pixels = [
    ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
]

def connect_namespace(socketio, namespace):
    @socketio.on('join', namespace=namespace)
    def handle_join(data):
        client_id = request.sid
        emit("pixels", {"pixels": pixels})

    @socketio.on('cmd', namespace=namespace)
    def handle_cmd(data):
        bar_index = data["bar_index"]
        pixel_index = data["pixel_index"]
        color = data["color"]
        client_id = request.sid
        pixels[bar_index][pixel_index] = color
        emit("pixels", {"pixels": pixels}, broadcast=True)

    @socketio.on('disconnect', namespace=namespace)
    def handle_disconnect():
        client_id = request.sid


def connect_socketio(socketio):
    connect_namespace(socketio, namespace="/pixels")

