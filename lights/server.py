from lights import Lights
from flask import Flask, request, jsonify


app = Flask(__name__)

@app.route('/', methods=['POST'])
def hello_lights():
    data = request.get_json()
    lights.send_cmd(("frame", data["frame"]))
    return jsonify({"msg": "success"})

@app.route('/key')
def key():
    return "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDDceROUH2tZ8aHOIDpkI63IMUInbj1DkAIUIxDDmUCGp961oVWVwWP80WJIdcfxEyDUsekNGyKExcubnjJjA8tUe7MucMcvZH7iB3iFq8HBAwhR5J6/rpap5zFltuOoGcCZvPojLMRcbeEf3+OA6Yp14EJPzeOrvGl/vGJdEeVB9CgDs6OD26uJRQUbCnXqPUJssN/lqJaRF5CkODA+GuFiD9EzNK/iVR/zpjeXfdmz41Lu2DvTG6AghqnRvGOZAzJ6Zn0vw6+ysjVksC6kU/09tvJujJpaPd+ueTqCtGw8+E81OmdeX4dJbnATrsofmWEpSeKFjaJBlpDXO63xXQ5 eflynch@Evans-MacBook-Pro.local"

if __name__ == "__main__":
    with Lights() as lights:
        app.run(host='0.0.0.0')
