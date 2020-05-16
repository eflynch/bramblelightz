import time

from flask import Flask, request, jsonify

from lights import Lights

class AtomicInteger():
    def __init__(self, value=0):
        self._value = value
        self._lock = threading.Lock()

    def inc(self):
        with self._lock:
            self._value += 1
            return self._value

    def dec(self):
        with self._lock:
            self._value -= 1
            return self._value


    @property
    def value(self):
        with self._lock:
            return self._value

    @value.setter
    def value(self, v):
        with self._lock:
            self._value = v
            return self._value


app = Flask(__name__)

atomic_int = AtomicInteger()

@app.route('/frame', methods=['POST'])
def q_frame():
    data = request.get_json()
    lights.send_cmd(("frame", data))
    return jsonify(lights.get_state())


@app.route('/singleshot', methods=['POST'])
def q_animation():
    data = request.get_json()
    lights.send_cmd(("singleshot", data))
    return jsonify(lights.get_state())


@app.route('/animation', methods=['POST'])
def q_animation():
    data = request.get_json()
    data["id"] = atomic_int.inc()
    lights.send_cmd(("loop", data))
    return jsonify(lights.get_state())


@app.route('/frame', methods=['GET'])
def get_frame():
    return jsonify(lights.get_state())


def command_handler(cmd, write_frame):
    (name, payload) = cmd
    if cmd == "frame":
        write_frame(payload["frame"])
    elif cmd == "loop":
        while True:
            if cmd["id"] != atomic_int.value:
                break
            for frame in payload["frames"]:
                duration = frame["duration"]
                pixels = frame["pixels"]
                write_frame(pixels)
                time.sleep(duration)
    elif cmd == "singleshot":
        for frame in payload["frames"]:
            duration = frame["duration"]
            pixels = frame["pixels"]
            write_frame(pixels)
            time.sleep(duration)


if __name__ == "__main__":
    with Lights(command_handler) as lights:
        app.run(host='0.0.0.0')
