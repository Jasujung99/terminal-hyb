import asyncio
import json
import websockets
from websockets.server import WebSocketServerProtocol

class Room:
    def __init__(self):
        self.clients = set()

    async def broadcast(self, message: str):
        if self.clients:
            await asyncio.gather(*(client.send(message) for client in self.clients))

class QuietCoworkServer:
    def __init__(self):
        self.rooms = {}

    def get_room(self, room_name: str) -> Room:
        if room_name not in self.rooms:
            self.rooms[room_name] = Room()
        return self.rooms[room_name]

    async def handler(self, websocket: WebSocketServerProtocol):
        room = None
        username = "anonymous"
        try:
            async for message in websocket:
                data = json.loads(message)
                if data.get("type") == "join":
                    room = self.get_room(data["room"])
                    username = data.get("username", "anonymous")
                    room.clients.add(websocket)
                    await room.broadcast(json.dumps({"type": "status", "message": f"{username} joined {data['room']}"}))
                elif data.get("type") == "message" and room:
                    await room.broadcast(json.dumps({"type": "message", "user": username, "text": data["text"]}))
        finally:
            if room and websocket in room.clients:
                room.clients.remove(websocket)
                await room.broadcast(json.dumps({"type": "status", "message": f"{username} left"}))

async def main(host: str = "localhost", port: int = 8765):
    server = QuietCoworkServer()
    async with websockets.serve(server.handler, host, port):
        print(f"Server started on {host}:{port}")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
