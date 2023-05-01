import socketio
import numpy as np

from controller import Controller
from streamProcessing import StreamProcessor

from config import load_config_from_file

class WebSocket:
    def __init__(self):
        self.sio = socketio.Client()

        self.controller = Controller(self.sio)

        self.sio.on("message", self.onMessage)

        self.sio.on("stream", self.onStream)

        self.index = 0
        self.limit = 3

    def connect(self, host, port) -> bool:
        try:
            self.sio.connect('http://' + host + ':' + str(port))
            return True
        except:
            print("Error connecting to server")
            return False

    def setNeuralNetwork(self):
        print('loading models')
        models = load_config_from_file('./networks/NN-98.npy')
        self.perceptron = models['perceptron']
        self.cnn = models['cnn']
        print(self.cnn)

    async def onConnect(self):
        print("My sid is: ", self.sio.sid)

    def joinRoom(self, room, token):
        self.sio.emit("joinRoom", {"room" : room, "token" : token})
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

        if self.index == self.limit:

            image = StreamProcessor.processStream(data)

            #print("Got image")

            imgPrepared = self.cnn.prepare_data([image], 1)
            res = self.perceptron.FeedForwardFlex(np.array([imgPrepared[0]]).T)

            #print("Got answer")
            a = res[-1]
            val = np.where(a == np.max(a), 1, 0)
            val = val.flatten()

            self.controller.emitControl(val)

            self.index = 0
        else:
            self.index += 1

        return self