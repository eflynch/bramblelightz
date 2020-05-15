import urllib.request
from flask_socketio import emit
from flask import request
import json

from pixelwrapper import PixelWrapper


def send_json(url, data):
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    jsondata = json.dumps(data)
    jsondataasbytes = jsondata.encode('utf-8')   # needs to be bytes
    req.add_header('Content-Length', len(jsondataasbytes))
    response = urllib.request.urlopen(req, jsondataasbytes)
    string = response.read().decode('utf-8')
    json_obj = json.loads(string)
    return json_obj




def connect_namespace(socketio, namespace, pixels):
    @socketio.on('join', namespace=namespace)
    def handle_join(data):
        emit("frames", {"frames": pixels.get_state()}, broadcast=True)

    @socketio.on('pixel', namespace=namespace)
    def handle_cmd(data):
        pixels.send_cmd(("update-pixel", data))

    @socketio.on('duration', namespace=namespace)
    def handle_duration(data):
        pixels.send_cmd(("update-duration", data))

    @socketio.on('copy', namespace=namespace)
    def handle_copy(data):
        pixels.send_cmd(("copy", data))

    @socketio.on('delete-frame', namespace=namespace)
    def handle_delete(data):
        pixels.send_cmd(("delete-frame", data))

    @socketio.on('add-frame', namespace=namespace)
    def handle_add(data):
        pixels.send_cmd(("add-frame", data))

    @socketio.on('send', namespace=namespace)
    def handle_send(data):
        response = send_json("http://24.61.44.168:5000/animation", {
            "frames": pixels.get_state() 
        })

    @socketio.on('disconnect', namespace=namespace)
    def handle_disconnect():
        client_id = request.sid


def connect_socketio(socketio):
    namespace = "/frames"

    def on_change(frames):
        socketio.emit("frames", {"frames": frames}, broadcast=True, namespace=namespace)

    with PixelWrapper(on_change) as pixels:
        connect_namespace(socketio, namespace=namespace, pixels=pixels)

