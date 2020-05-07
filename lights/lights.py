import serial
from queue import Queue
from threading import Thread
import time

possible_device_ids = [
    '/dev/tty.usbmodemfa141',
    '/dev/tty.usbmodemfd131'
]


def _frame_to_bytes(frame):
    rs = ""
    gs = ""
    bs = ""
    value = ""
    for bar in frame:
        for pixel in bar:
            r = pixel[1:3]
            rs += r
            g =pixel[3:5]
            gs += g
            b = pixel[5:7]
            bs += b

    value = rs + gs + bs
    return bytes.fromhex("ff" + value)

def _start_lights(command_handler):
    q = Queue()
    last_frame = [None]

    success = False
    failures = []
    for device_id in possible_device_ids:
        try:
            ser = serial.Serial(device_id, baudrate=250000, timeout=0, stopbits=serial.STOPBITS_TWO)
            time.sleep(2)
            success = True
            break
        except Exception as e:
            failures.append(e)
            pass
    if not success:
        for failure in failures:
            print(failure)
    assert success

    def write_frame(frame):
        ser.write(_frame_to_bytes(frame))
        last_frame[0] = frame

    def _communicate():
        while True:
            cmd = q.get()
            command_handler(cmd, write_frame)
            ser.reset_input_buffer()
            q.task_done()

    t = Thread(target=_communicate)
    t.daemon = True
    t.start()

    return (q, last_frame, ser)


def _send_cmd(token, cmd):
    q, _, _ = token
    q.put(cmd)


def _stop_lights(token):
    q, _, _ = token
    q.join()


def _get_status(token):
    q, last_frame[0], _ = token
    return (q.qsize(), last_frame)


class Lights:
    def __init__(self, command_handler):
        self._command_handler = command_handler
        self._token = None

    def open():
        self._token = _start_lights(self._command_handler)

    def close():
        _stop_lights(self._token)

    def __enter__(self):
        self.open()
        return self

    def __exit__(self, *exc):
        self.close()

    def send_cmd(self, cmd):
        if not self._token:
            raise Exception("Lights are not open")
        _send_cmd(self._token, cmd)

    def get_state(self):
        if not self._token:
            raise Exception("Lights are not open")

        (q_size, last_frame) = _get_status(self._token)
        return {
            "q_size": q_size,
            "last_frame": last_frame
        }
