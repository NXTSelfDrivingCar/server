from websocket import create_connection

ws = create_connection("ws://localhost:5000")

# print("Sending 'Hello, World'...")
# ws.send("Hello, World")

# print("Receiving...")
# result =  ws.recv()

# print ("Received '%s'" % result)
# ws.close()
