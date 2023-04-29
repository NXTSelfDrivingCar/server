import socketio
import base64
import io
import cv2
from imageio import imread
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

class WebSocket:
    def __init__(self):
        self.sio = socketio.Client()

        self.sio.on("message", self.onMessage)

        self.sio.on("stream", self.onStream)

        self.index = 0
        

    def connect(self, host, port) -> bool:
        try:
            self.sio.connect('http://' + host + ':' + str(port))
            return True
        except:
            print("Error connecting to server")
            return False
    
    async def onConnect(self):
        print("My sid is: ", self.sio.sid)

    def joinRoom(self, room, token):
        self.sio.emit("joinRoom", {"room" : "ai", "token" : token})
        return self

    def disconnect(self):
        self.sio.disconnect()
        return self

    def emit(self, event, data):
        self.sio.emit(event, data)
        return self
    
    def onMessage(self, data):
        print(data)
        return self
    
    def onStream(self, data):
        

        # reconstruct image as an numpy array
        img64 = base64.b64decode(data)

        image = Image.open(io.BytesIO(img64))
        image_np = np.array(image)

        # show image
        res = cv2.resize(image_np, dsize=(320, 240), interpolation=cv2.INTER_NEAREST)
        res2 = cv2.cvtColor(res, cv2.COLOR_BGR2RGB)
        cv2.imwrite("stream/image" + self.index + ".jpg", res2)
        self.index += 1

        return self