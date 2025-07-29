import asyncio
import json
import websockets
import sys
import contextlib

async def user_input(prompt: str = "> ") -> str:
    return await asyncio.get_event_loop().run_in_executor(None, lambda: input(prompt))

async def receiver(ws):
    async for message in ws:
        data = json.loads(message)
        if data.get("type") == "message":
            print(f"[{data['user']}]: {data['text']}")
        elif data.get("type") == "status":
            print(f"* {data['message']}")

def print_help():
    print("Commands:")
    print("  /join ROOM - join a room")
    print("  /exit - exit")
    print("  /help - show this help")
    print("Type anything else to send message")

async def main(uri: str, username: str):
    async with websockets.connect(uri) as ws:
        print_help()
        room = None
        recv_task = asyncio.create_task(receiver(ws))
        try:
            while True:
                msg = await user_input()
                if msg.startswith("/join "):
                    room = msg.split(maxsplit=1)[1]
                    await ws.send(json.dumps({"type": "join", "room": room, "username": username}))
                elif msg == "/exit":
                    break
                elif msg == "/help":
                    print_help()
                else:
                    if not room:
                        print("Join a room first using /join ROOM")
                    else:
                        await ws.send(json.dumps({"type": "message", "text": msg}))
        finally:
            recv_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await recv_task

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python client.py USERNAME [ws://host:port]")
        sys.exit(1)
    username = sys.argv[1]
    uri = sys.argv[2] if len(sys.argv) > 2 else "ws://localhost:8765"
    asyncio.run(main(uri, username))
