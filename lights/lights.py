import serial
from queue import Queue, Empty
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
    # value = value[2:] + value[:2]
    return bytes.fromhex("ff" + value)

def _handle_command(ser, cmd):
    (cmd_name, payload) = cmd
    if cmd_name == "bytes":
        ser.write(bytes.fromhex("ff" + payload))
    elif cmd_name == "frame":
        ser.write(_frame_to_bytes(payload))

def _start_lights():
    q = Queue()

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


    def _communicate():
        while True:
            try:
                cmd = q.get()
                ser.reset_input_buffer()
                _handle_command(ser, cmd)
                ser.reset_input_buffer()
                q.task_done()
            except Empty:
                pass

    t = Thread(target=_communicate)
    t.daemon = True
    t.start()

    return (q, ser)


def _send_cmd(token, cmd):
    q, ser = token
    q.put(cmd)


def _stop_lights(token):
    q, ser = token
    q.join()


class Lights:
    def __enter__(self):
        self._token = _start_lights()
        return self

    def __exit__(self, *exc):
        _stop_lights(self._token)

    def send_cmd(self, cmd):
        _send_cmd(self._token, cmd)

