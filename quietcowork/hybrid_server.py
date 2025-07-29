import asyncio
import json
import websockets
from websockets.server import WebSocketServerProtocol
import http.server
import socketserver
import threading
import os
from pathlib import Path

class Room:
    def __init__(self):
        self.clients = set()
        self.participants = {}  # websocket -> username mapping

    async def broadcast(self, message: str, exclude=None):
        if self.clients:
            targets = self.clients - {exclude} if exclude else self.clients
            if targets:
                await asyncio.gather(*(client.send(message) for client in targets), return_exceptions=True)

    def add_participant(self, websocket, username):
        self.clients.add(websocket)
        self.participants[websocket] = username

    def remove_participant(self, websocket):
        self.clients.discard(websocket)
        if websocket in self.participants:
            username = self.participants.pop(websocket)
            return username
        return None

    def get_participant_count(self):
        return len(self.clients)

    def get_participants(self):
        return list(self.participants.values())

class QuietCoworkServer:
    def __init__(self):
        self.rooms = {}

    def get_room(self, room_name: str) -> Room:
        if room_name not in self.rooms:
            self.rooms[room_name] = Room()
        return self.rooms[room_name]

    def get_room_list(self):
        """방 목록과 각 방의 참가자 수를 반환"""
        room_info = {}
        for room_name, room in self.rooms.items():
            room_info[room_name] = {
                'name': room_name,
                'participants': room.get_participant_count(),
                'participant_list': room.get_participants()
            }
        return room_info

    async def handler(self, websocket: WebSocketServerProtocol):
        room = None
        username = "anonymous"
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data.get("type") == "join":
                        # 이전 방에서 나가기
                        if room:
                            old_username = room.remove_participant(websocket)
                            if old_username:
                                await room.broadcast(json.dumps({
                                    "type": "status", 
                                    "message": f"{old_username} left"
                                }))
                        
                        # 새 방에 입장
                        room_name = data["room"]
                        room = self.get_room(room_name)
                        username = data.get("username", "anonymous")
                        
                        room.add_participant(websocket, username)
                        
                        # 입장 알림 브로드캐스트
                        await room.broadcast(json.dumps({
                            "type": "status", 
                            "message": f"{username} joined {room_name}"
                        }), exclude=websocket)
                        
                        # 현재 사용자에게 성공 메시지
                        await websocket.send(json.dumps({
                            "type": "status",
                            "message": f"Successfully joined {room_name}"
                        }))
                        
                    elif data.get("type") == "message" and room:
                        # 채팅 메시지 브로드캐스트
                        await room.broadcast(json.dumps({
                            "type": "message", 
                            "user": username, 
                            "text": data["text"]
                        }))
                        
                    elif data.get("type") == "get_rooms":
                        # 방 목록 요청
                        room_list = self.get_room_list()
                        await websocket.send(json.dumps({
                            "type": "room_list",
                            "rooms": room_list
                        }))
                        
                except json.JSONDecodeError:
                    print(f"Invalid JSON received: {message}")
                except Exception as e:
                    print(f"Error processing message: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Connection error: {e}")
        finally:
            # 연결 종료 시 정리
            if room and websocket in room.clients:
                username = room.remove_participant(websocket)
                if username:
                    await room.broadcast(json.dumps({
                        "type": "status", 
                        "message": f"{username} left"
                    }))

class StaticFileHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent.parent / "web"), **kwargs)
    
    def end_headers(self):
        # CORS 헤더 추가
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def serve_static_files():
    """웹 파일을 서빙하는 HTTP 서버"""
    try:
        with socketserver.TCPServer(("", 8000), StaticFileHandler) as httpd:
            print("HTTP 서버가 http://localhost:8000 에서 실행 중...")
            httpd.serve_forever()
    except Exception as e:
        print(f"HTTP 서버 오류: {e}")

async def main(host: str = "localhost", port: int = 8766):
    server = QuietCoworkServer()
    
    # HTTP 서버를 별도 스레드에서 실행
    http_thread = threading.Thread(target=serve_static_files, daemon=True)
    http_thread.start()
    
    print(f"웹소켓 서버가 ws://{host}:{port} 에서 실행 중...")
    print(f"웹 인터페이스: http://localhost:8000")
    print(f"CLI 클라이언트: python quietcowork/client.py <username> ws://{host}:{port}")
    
    async with websockets.serve(server.handler, host, port):
        await asyncio.Future()  # 무한 대기

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n서버를 종료합니다...")
