import os
import copy

from gevent.queue import JoinableQueue, Empty
from gevent import sleep
from gevent import Greenlet

def _handle_cmd(frames, cmd):
    (name, args) = cmd

    if name == "update-pixel":
        frame_index = args["frame_index"]
        bar_index = args["bar_index"]
        pixel_index = args["pixel_index"]
        color = args["color"]
        frames[frame_index]["pixels"][bar_index][pixel_index] = color

    elif name == "copy":
        frame_index_a = args["frame_index_a"]
        frame_index_b = args["frame_index_b"]
        new_frame_b = copy.deepcopy(frames[frame_index_a])
        frames[frame_index_b] = new_frame_b

    elif name == "update-duration":
        frame_index = args["frame_index"]
        duration = args["duration"]
        frames[frame_index]["duration"] = duration

    elif name == "add-frame":
        frames.append({
            "pixels": [
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
            ],
            "duration": 0.33
        })

    elif name == "delete-frame":
        frame_index = args["frame_index"]
        if frame_index < len(frames):
            del frames[frame_index]

def _start_wrap(callback):
    q = JoinableQueue()
    frames = [
        {
            "pixels": [
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
                ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
            ],
            "duration": 0.33
        }
    ]

    def _communicate(q, frames):
        while True:
            try:
                cmd = q.get_nowait()
            except Empty:
                sleep(0.01)
                continue
            _handle_cmd(frames, cmd)
            callback(frames)
            q.task_done()

    g = Greenlet.spawn(_communicate, q, frames)
    return (q, frames)


def _send_cmd(token, cmd):
    (q, _) = token
    q.put(cmd)

def _stop_wrap(token):
    (q, _) = token
    q.join()


class PixelWrapper:
    def __init__(self, callback):
        self._token = None
        self._callback = callback

    def open(self):
        self._token = _start_wrap(self._callback)

    def close(self):
        _stop_wrap(self._token);

    def __enter__(self):
        self.open()
        return self

    def __exit__(self, *args):
        self.close()

    def send_cmd(self, cmd):
        if not self._token:
            raise Exception("PixelWrapper is not open")
        _send_cmd(self._token, cmd)

    def get_state(self):
        (_, frames) = self._token
        return copy.deepcopy(frames)

