import os

import psycopg2 as psql


def _connect():
    if os.getenv("FLASK_ENV") == "docker":
        return psql.connect(host="postgres",
                            dbname=os.getenv("POSTGRES_DB"),
                            user=os.getenv("POSTGRES_USER"),
                            password=os.getenv("POSTGRES_PASSWORD"),)
    else:
        return psql.connect("dbname=roasty")


class PixelsWrapper:
    def __init__(self, read_only=False):
        self.read_only = read_only
        self.conn = _connect()
        self.cursor = self.conn.cursor()

    def __enter__(self):
        self.conn.__enter__()
        self.cursor.__enter__()
        if self.read_only:
            query = "SELECT * FROM sessions"
        else:
            query = "SELECT * FROM sessions FOR UPDATE"
        self.cursor.execute(query)
        ret = self.cursor.fetchall()
        pixels = [["#000000"] * 8] * 6
        for row in ret:
            pixels[ret["barIndex"]][ret["pixelIndex"]] = ret["color"]

        return pixels

    def __exit__(self, *args):
        if not self.read_only:
            self.cursor.execute(
                "UPDATE pixels SET color=%(color)s WHERE name=%(name)s",
                {
                    'serialized': Session.serialize(self.session),
                    'roles': rolewrapper.serialize(self.roles),
                    'name': self.session_id
                })
            self.conn.commit()
        self.conn.__exit__(*args)
        self.cursor.__exit__(*args)
