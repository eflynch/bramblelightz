from lights import Lights
from flask import Flask, request, jsonify


app = Flask(__name__)

@app.route('/', methods=['POST'])
def hello_lights():
    data = request.get_json()
    lights.send_cmd(("frame", data["frame"]))
    return jsonify({"msg": "success"})


if __name__ == "__main__":
    with Lights() as lights:
        app.run(host='0.0.0.0')
