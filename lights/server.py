import time

from flask import Flask, request, jsonify

from lights import Lights


app = Flask(__name__)

@app.route('/frame', methods=['POST'])
def q_frame():
    data = request.get_json()
    lights.send_cmd(("frame", data))
    return jsonify(lights.get_state())


@app.route('/animation', methods=['POST'])
def q_animation():
    data = request.get_json()
    lights.send_cmd(("animation", data))
    return jsonify(lights.get_state())


@app.route('/frame', methods=['GET'])
def get_frame():
    return jsonify(lights.get_state())


def command_handler(cmd, write_frame):
    (name, payload) = cmd
    if cmd == "frame":
        write_frame(payload["frame"])
    elif cmd == "animation":
        spf = payload["spf"]
        for frame in payload["frames"]:
            write_frame(frame)
            time.sleep(spf)


if __name__ == "__main__":
    with Lights(command_handler) as lights:
        app.run(host='0.0.0.0')
