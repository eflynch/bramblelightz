import os
import json

from flask import Flask
from flask_socketio import SocketIO

from reactstub import reactstub

from api import api
from socketapi import connect_socketio

app = Flask(__name__)
app.register_blueprint(api, url_prefix="/api")

socketio = SocketIO(app)

if os.path.exists('/etc/config.json'):
    with open('/etc/config.json') as config_file:
        config = json.load(config_file)

    app.config['SECRET_KEY'] = config.get('SECRET_KEY')
else:
    print("Warning, running without a secret")


@app.route("/", methods=['GET'])
def index():
    return reactstub("Roasty Pixels", ["app/css/styles.css"], ["app/main.js"], bootstrap=json.dumps({}))


connect_socketio(socketio)

if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0')
