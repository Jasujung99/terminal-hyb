import asyncio
import json
import websockets
import sys
import contextlib
import os
from datetime import datetime

class Colors:
    """터미널 색상 코드"""
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    # 색상
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    
    # 배경색
    BG_BLACK = '\033[40m'
    BG_GREEN = '\033[42m'
    BG_BLUE = '\033[44m'

class SimulSyncCLI:
    def __init__(self, username: str, uri: str):
        self.username = username
        self.uri = uri
        self.ws = None
        self.current_room = None
        self.participants = []
        self.chat_history = []
        self.rooms_list = {}
        self.connected = False
        self.current_goal = None
        self.focus_start_time = None
        self.focus_duration = 0
        
    def clear_screen(self):
        """화면 클리어"""
        os.system('clear' if os.name == 'posix' else 'cls')
        
    def print_header(self):
        """ASCII 헤더 출력"""
        header = f"""
{Colors.CYAN}{Colors.BOLD}
╔══════════════════════════════════════════════════════════════════════════╗
║                                동시접속                                  ║
║                         하이브리드 협업 프로그램                         ║
╚══════════════════════════════════════════════════════════════════════════╝
{Colors.RESET}
{Colors.GREEN}접속자: {Colors.BOLD}{self.username}{Colors.RESET}
{Colors.BLUE}현재 방: {Colors.BOLD}{self.current_room or "없음"}{Colors.RESET}
{Colors.YELLOW}상태: {Colors.BOLD}{"연결됨" if self.connected else "연결 안됨"}{Colors.RESET}
"""
        print(header)
        
    def print_main_menu(self):
        """메인 메뉴 출력"""
        menu = f"""
{Colors.MAGENTA}{Colors.BOLD}┌─ 메인 메뉴 ─────────────────────────────────────────────────────────────┐{Colors.RESET}
{Colors.MAGENTA}│{Colors.RESET} {Colors.GREEN}참여 "방이름"{Colors.RESET}        - 방에 참여
{Colors.MAGENTA}│{Colors.RESET} {Colors.GREEN}생성 "방이름"{Colors.RESET}        - 새 방 생성  
{Colors.MAGENTA}│{Colors.RESET} {Colors.GREEN}상태{Colors.RESET}                - 현재 상태 확인
{Colors.MAGENTA}│{Colors.RESET} {Colors.GREEN}도움말{Colors.RESET}              - 도움말
{Colors.MAGENTA}│{Colors.RESET} {Colors.GREEN}종료{Colors.RESET}                - 종료
{Colors.MAGENTA}└─────────────────────────────────────────────────────────────────────────┘{Colors.RESET}
"""
        print(menu)
        
    def print_room_interface(self):
        """방 내부 인터페이스 출력"""
        if not self.current_room:
            return
            
        interface = f"{Colors.CYAN}{Colors.BOLD}┌─ {self.current_room} 방 ─────────────────────────────────────────────────┐{Colors.RESET}
{Colors.CYAN}│{Colors.RESET} 참가자 ({len(self.participants)}명): {Colors.GREEN}{', '.join(self.participants)}{Colors.RESET}
{Colors.CYAN}└─────────────────────────────────────────────────────────────────────────┘{Colors.RESET}

{Colors.YELLOW}{Colors.BOLD}┌─ 최근 채팅 ─────────────────────────────────────────────────────────────┐{Colors.RESET}"
        print(interface)
        # 최근 채팅 5개만 표시
        recent_chats = self.chat_history[-5:] if len(self.chat_history) > 5 else self.chat_history
        for chat in recent_chats:
            print(f"{Colors.YELLOW}│{Colors.RESET} {chat}")
            
        print(f"{Colors.YELLOW}└─────────────────────────────────────────────────────────────────────────┘{Colors.RESET}")
        
        # 방 내부 명령어
        room_commands = f"""
{Colors.BLUE}{Colors.BOLD}┌─ 방 명령어 ─────────────────────────────────────────────────────────────┐{Colors.RESET}
{Colors.BLUE}│{Colors.RESET} {Colors.GREEN}집중 --목표="목표" --시간=90{Colors.RESET}  - 집중 모드 시작
{Colors.BLUE}│{Colors.RESET} {Colors.GREEN}휴식{Colors.RESET}                          - 휴식/집중 모드 종료
{Colors.BLUE}│{Colors.RESET} {Colors.GREEN}목표 "목표"{Colors.RESET}                   - 목표 설정
{Colors.BLUE}│{Colors.RESET} {Colors.GREEN}상태{Colors.RESET}                          - 집중 상태 확인
{Colors.BLUE}│{Colors.RESET} {Colors.GREEN}참가자{Colors.RESET}                        - 참가자 목록
{Colors.BLUE}│{Colors.RESET} {Colors.GREEN}나가기{Colors.RESET}                        - 방 나가기
{Colors.BLUE}│{Colors.RESET} {Colors.GREEN}"메시지"{Colors.RESET}                      - 채팅 보내기
{Colors.BLUE}└─────────────────────────────────────────────────────────────────────────┘{Colors.RESET}
"""
        print(room_commands)
        
    def print_rooms_list(self):
        """방 목록 출력"""
        rooms_display = f"{Colors.MAGENTA}{Colors.BOLD}┌─ 방 목록 ───────────────────────────────────────────────────────────────┐{Colors.RESET}"
        print(rooms_display)
        if not self.rooms_list:
            print(f"{Colors.MAGENTA}│{Colors.RESET} {Colors.DIM}사용 가능한 방이 없습니다.{Colors.RESET}")
            print(f"{Colors.MAGENTA}│{Colors.RESET} {Colors.GREEN}/create <방이름>{Colors.RESET}으로 새 방을 만드세요!")
        else:
            for room_name, info in self.rooms_list.items():
                participants_count = info.get('participants', 0)
                status_icon = f"{Colors.GREEN}●{Colors.RESET}" if participants_count > 0 else f"{Colors.DIM}○{Colors.RESET}"
                print(f"{Colors.MAGENTA}│{Colors.RESET} {status_icon} {Colors.BOLD}{room_name}{Colors.RESET} ({participants_count}명)")
                
        print(f"{Colors.MAGENTA}└─────────────────────────────────────────────────────────────────────────┘{Colors.RESET}")
        
    def print_status(self):
        """현재 상태 출력"""
        focus_status = ""
        if self.focus_start_time:
            elapsed_minutes = int((datetime.now().timestamp() - self.focus_start_time) / 60)
            remaining_minutes = max(0, self.focus_duration - elapsed_minutes)
            focus_status = f"\n{Colors.CYAN}│{Colors.RESET} 집중 모드: {Colors.GREEN}진행 중{Colors.RESET} (목표: {self.current_goal})"
            focus_status += f"\n{Colors.CYAN}│{Colors.RESET} 진행 시간: {elapsed_minutes}분 / 남은 시간: {remaining_minutes}분"
        else:
            focus_status = f"\n{Colors.CYAN}│{Colors.RESET} 집중 모드: {Colors.DIM}비활성{Colors.RESET}"
            
        status = f"""
{Colors.CYAN}{Colors.BOLD}┌─ 시스템 상태 ───────────────────────────────────────────────────────────┐{Colors.RESET}
{Colors.CYAN}│{Colors.RESET} 사용자: {Colors.BOLD}{self.username}{Colors.RESET}
{Colors.CYAN}│{Colors.RESET} 서버: {Colors.BOLD}{self.uri}{Colors.RESET}
{Colors.CYAN}│{Colors.RESET} 연결: {Colors.GREEN if self.connected else Colors.RED}{'✓ 연결됨' if self.connected else '✗ 연결 안됨'}{Colors.RESET}
{Colors.CYAN}│{Colors.RESET} 현재 방: {Colors.BOLD}{self.current_room or "없음"}{Colors.RESET}
{Colors.CYAN}│{Colors.RESET} 방 참가자: {len(self.participants)}명{focus_status}
{Colors.CYAN}│{Colors.RESET} 시간: {Colors.BOLD}{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}
{Colors.CYAN}└─────────────────────────────────────────────────────────────────────────┘{Colors.RESET}
"""
        print(status)
        
    def add_chat_message(self, message: str, msg_type: str = "chat"):
        """채팅 메시지 추가"""
        timestamp = datetime.now().strftime('%H:%M')
        
        if msg_type == "join":
            formatted_msg = f"{Colors.GREEN}[{timestamp}] ✓ {message}{Colors.RESET}"
        elif msg_type == "leave":
            formatted_msg = f"{Colors.RED}[{timestamp}] ✗ {message}{Colors.RESET}"
        elif msg_type == "system":
            formatted_msg = f"{Colors.YELLOW}[{timestamp}] ⚙ {message}{Colors.RESET}"
        else:
            formatted_msg = f"{Colors.WHITE}[{timestamp}] {message}{Colors.RESET}"
            
        self.chat_history.append(formatted_msg)
        
        # 채팅 기록 제한 (최대 50개)
        if len(self.chat_history) > 50:
            self.chat_history = self.chat_history[-50:]
            
    def update_display(self):
        """화면 업데이트"""
        self.clear_screen()
        self.print_header()
        
        if self.current_room:
            self.print_room_interface()
        else:
            # 메인 화면에서는 방 목록을 먼저 표시
            self.print_rooms_list()
            self.print_main_menu()
            
    async def user_input(self, prompt: str = f"{Colors.GREEN}> {Colors.RESET}") -> str:
        """사용자 입력 받기"""
        return await asyncio.get_event_loop().run_in_executor(None, lambda: input(prompt))

    async def receiver(self):
        """웹소켓 메시지 수신"""
        async for message in self.ws:
            try:
                data = json.loads(message)
                
                if data.get("type") == "message":
                    user = data.get("user", "Unknown")
                    text = data.get("text", "")
                    self.add_chat_message(f"{user}: {text}")
                    
                elif data.get("type") == "status":
                    status_msg = data.get("message", "")
                    if "joined" in status_msg:
                        self.add_chat_message(status_msg, "join")
                        # 참가자 목록 업데이트 (더 정확한 파싱)
                        if " joined " in status_msg and not status_msg.startswith("Successfully"):
                            user = status_msg.split(" joined ")[0]
                            if user not in self.participants and user != self.username:
                                self.participants.append(user)
                    elif "left" in status_msg:
                        self.add_chat_message(status_msg, "leave")
                        # 참가자 목록에서 제거
                        if " left" in status_msg:
                            user = status_msg.split(" left")[0]
                            if user in self.participants:
                                self.participants.remove(user)
                    else:
                        self.add_chat_message(status_msg, "system")
                        
                elif data.get("type") == "room_list":
                    self.rooms_list = data.get("rooms", {})
                    # 메인 화면일 때만 안내 메시지 출력 (방 목록은 update_display에서 자동 표시)
                    if not self.current_room:
                        print(f"\n{Colors.GREEN}✓ 방 목록이 업데이트되었습니다!{Colors.RESET}")
                        if not self.rooms_list:
                            print(f"{Colors.YELLOW}팁: '생성 <방이름>'으로 새 방을 만들어보세요!{Colors.RESET}")
                        else:
                            print(f"{Colors.YELLOW}팁: '참여 <방이름>'으로 방에 입장하거나 '도움말'로 사용법을 확인하세요.{Colors.RESET}")
                    
                elif data.get("type") == "participants":
                    # 서버에서 정확한 참가자 목록 받기
                    participants = data.get("participants", [])
                    # 빈 문자열이나 None 값 제거
                    self.participants = [p for p in participants if p and p.strip()]
                    # 자신이 목록에 없으면 추가
                    if self.username not in self.participants:
                        self.participants.append(self.username)
                    
                # 화면 업데이트
                self.update_display()
                    
            except json.JSONDecodeError:
                self.add_chat_message(f"잘못된 메시지 형식: {message}", "system")
                
    def validate_room_name(self, room_name: str) -> bool:
        """방 이름 검증"""
        # 방 목록에서 해당 방이 존재하는지 확인
        # 현재는 간단한 검증만 수행 (실제로는 서버에서 방 목록을 받아와야 함)
        if not room_name or not room_name.strip():
            return False
        
        # 방 이름에 특수문자가 포함되어 있으면 검증 실패
        invalid_chars = ['<', '>', '~', '!', '@', '#', '$', '%', '^', '&', '*']
        if any(char in room_name for char in invalid_chars):
            return False
            
        return True
                
    async def process_command(self, command: str):
        """명령어 처리"""
        if not command:
            return
            
        # 한국어 명령어 처리
        if command in ["참여", "상태", "도움말", "종료", "참가자", "나가기", "휴식"] or \
           command.startswith(("참여 ", "생성 ", "목표 ", "집중 ")):
            
            if command.startswith("참여 "):
                room_name = command[3:].strip()
                if room_name:
                    # 올바른 방 이름 검증
                    if self.validate_room_name(room_name):
                        await self.join_room(room_name)
                    else:
                        print(f"{Colors.RED}해당 방은 존재하지 않습니다: {room_name}{Colors.RESET}")
                        print(f"{Colors.DIM}(Room does not exist: {room_name}){Colors.RESET}")
                else:
                    print(f"{Colors.RED}사용법: 참여 \"방이름\"{Colors.RESET}")
                    print(f"{Colors.DIM}(Usage: 참여 \"room-name\"){Colors.RESET}")
                    
            elif command.startswith("생성 "):
                room_name = command[3:].strip()
                if room_name:
                    await self.create_room(room_name)
                else:
                    print(f"{Colors.RED}사용법: 생성 \"방이름\"{Colors.RESET}")
                    print(f"{Colors.DIM}(Usage: 생성 \"room-name\"){Colors.RESET}")
                
            elif command == "상태":
                if self.current_room:
                    self.show_focus_status()
                else:
                    self.print_status()
                
            elif command == "참가자":
                self.show_participants()
                
            elif command == "나가기":
                await self.leave_room()
                
            elif command.startswith("집중 ") and self.current_room:
                await self.handle_focus_command_korean(command)
                
            elif command == "휴식" and self.current_room:
                await self.handle_break_command()
                
            elif command.startswith("목표 ") and self.current_room:
                goal = command[3:].strip()
                if goal:
                    self.set_goal(goal)
                else:
                    print(f"{Colors.RED}사용법: 목표 \"목표 설명\"{Colors.RESET}")
                    print(f"{Colors.DIM}(Usage: 목표 \"goal description\"){Colors.RESET}")
                    
            elif command == "도움말":
                self.show_help()
                
            elif command == "종료":
                return False
                
        elif command.startswith("/"):
            # 기존 영문 명령어도 지원 (하위 호환성)
            await self.process_english_command(command)
            
        else:
            # 채팅 메시지
            if self.current_room:
                await self.send_message(command)
            else:
                print(f"{Colors.RED}방에 참여한 후 채팅할 수 있습니다. '참여 \"방이름\"'{Colors.RESET}")
                print(f"{Colors.DIM}(Join a room first to chat. '참여 \"room-name\"') ){Colors.RESET}")
                
        return True
        
    async def process_english_command(self, command: str):
        """기존 영문 명령어 처리 (하위 호환성)"""
        parts = command.split()
        cmd = parts[0][1:]  # / 제거
        
        if cmd == "join" and len(parts) > 1:
            room_name = parts[1]
            await self.join_room(room_name)
            
        elif cmd == "create" and len(parts) > 1:
            room_name = parts[1]
            await self.create_room(room_name)
            
        elif cmd == "rooms":
            await self.list_rooms()
            
        elif cmd == "status":
            if self.current_room:
                self.show_focus_status()
            else:
                self.print_status()
            
        elif cmd == "participants":
            self.show_participants()
            
        elif cmd == "leave":
            await self.leave_room()
            
        elif cmd == "focus" and self.current_room:
            await self.handle_focus_command(command)
            
        elif cmd == "break" and self.current_room:
            await self.handle_break_command()
            
        elif cmd == "goal" and self.current_room:
            if len(parts) > 1:
                goal = " ".join(parts[1:])
                self.set_goal(goal)
            else:
                print(f"{Colors.RED}사용법: /goal <목표 설명>{Colors.RESET}")
                
        elif cmd == "help":
            self.show_help()
            
        elif cmd == "exit":
            return False
            
        else:
            print(f"{Colors.RED}알 수 없는 명령어: {command}{Colors.RESET}")
            
    async def handle_focus_command_korean(self, command: str):
        """한국어 집중 모드 명령어 처리"""
        import re
        
        # --목표="목표" --시간=90 형태의 명령어 파싱
        goal_match = re.search(r'--목표[=\s]+["\']([^"\']+)["\']', command)
        timer_match = re.search(r'--시간[=\s]+(\d+)', command)
        
        goal = goal_match.group(1) if goal_match else "집중 모드"
        timer_minutes = int(timer_match.group(1)) if timer_match else 25
        
        self.current_goal = goal
        self.focus_start_time = datetime.now().timestamp()
        self.focus_duration = timer_minutes
        
        print(f"{Colors.GREEN}🎯 집중 모드 시작!{Colors.RESET}")
        print(f"   목표: {Colors.BOLD}{goal}{Colors.RESET}")
        print(f"   시간: {Colors.BOLD}{timer_minutes}분{Colors.RESET}")
        print(f"   시작: {Colors.BOLD}{datetime.now().strftime('%H:%M')}{Colors.RESET}")
        
        # 방의 다른 사람들에게 알림
        await self.send_message(f"🎯 집중 모드를 시작했습니다: {goal} ({timer_minutes}분)")
        
    async def join_room(self, room_name: str):
        """방 참여"""
        self.current_room = room_name
        self.participants = []  # 초기화 후 서버에서 정확한 목록 받기
        await self.ws.send(json.dumps({
            "type": "join",
            "room": room_name,
            "username": self.username
        }))
        self.add_chat_message(f"{room_name} 방에 참여했습니다.", "system")
        
        # 잠시 후 참가자 목록 요청
        await asyncio.sleep(0.1)
        if not self.participants or self.username not in self.participants:
            self.participants = [self.username]  # 최소한 자신은 포함
        self.update_display()
        
    async def leave_room(self):
        """방 나가기"""
        if self.current_room:
            self.current_room = None
            self.participants = []
            self.add_chat_message("방에서 나왔습니다.", "system")
            self.update_display()
            
    async def create_room(self, room_name: str):
        """방 생성"""
        # 실제로는 서버에 방 생성 요청을 보내야 합니다
        print(f"{Colors.GREEN}방 '{room_name}'을 생성했습니다.{Colors.RESET}")
        await asyncio.sleep(1)
        await self.join_room(room_name)
        
    async def list_rooms(self):
        """방 목록 요청"""
        await self.ws.send(json.dumps({"type": "get_rooms"}))
        await asyncio.sleep(0.5)  # 응답 대기
        self.print_rooms_list()
        
    async def send_message(self, message: str):
        """메시지 전송"""
        await self.ws.send(json.dumps({
            "type": "message",
            "text": message
        }))
        
    def show_participants(self):
        """참가자 목록 표시"""
        print(f"\n{Colors.CYAN}{Colors.BOLD}현재 참가자 ({len(self.participants)}명):{Colors.RESET}")
        for i, participant in enumerate(self.participants, 1):
            icon = "👤" if participant == self.username else "👥"
            print(f"  {i}. {icon} {participant}")
        print()
        
    def show_help(self):
        """도움말 표시"""
        if self.current_room:
            help_text = f"""
{Colors.YELLOW}{Colors.BOLD}방 내부 도움말{Colors.RESET}

{Colors.GREEN}집중 모드 명령어:{Colors.RESET}
  집중 --목표="목표" --시간=90     - 집중 모드 시작 (기본 25분)
  휴식                            - 휴식/집중 모드 종료
  목표 "목표 설명"                - 목표만 설정
  상태                            - 집중 상태 확인

{Colors.GREEN}방 관리 명령어:{Colors.RESET}
  참가자        - 참가자 목록
  나가기        - 방 나가기

{Colors.GREEN}채팅:{Colors.RESET}
  "메시지"      - 채팅 메시지 보내기

{Colors.BLUE}집중 모드 사용 예시:{Colors.RESET}
  집중 --목표="React 공부" --시간=60
  집중 --목표="논문 작성"           (기본 25분)
  목표 "새로운 목표 설정"
  상태                             (진행 상황 확인)
  휴식                             (휴식)

{Colors.DIM}※ 기존 영문 명령어(/focus, /break 등)도 계속 사용 가능합니다.{Colors.RESET}
"""
        else:
            help_text = f"""
{Colors.YELLOW}{Colors.BOLD}메인 도움말{Colors.RESET}

{Colors.GREEN}메인 명령어:{Colors.RESET}
  참여 "방이름"    - 방에 참여
  생성 "방이름"    - 새 방 생성
  상태             - 시스템 상태 확인
  도움말           - 이 도움말
  종료             - 프로그램 종료

{Colors.BLUE}사용 예시:{Colors.RESET}
  참여 "스터디룸"           (방 참여)
  생성 "내방"               (새 방 생성)

{Colors.BLUE}팁:{Colors.RESET}
  - 명령어는 한국어로 입력하세요
  - 방 이름에는 공백을 사용할 수 있습니다
  - 방 목록은 메인 화면에 자동으로 표시됩니다
  - Ctrl+C로 언제든 종료할 수 있습니다

{Colors.DIM}※ 기존 영문 명령어(/join, /create 등)도 계속 사용 가능합니다.{Colors.RESET}
"""
        print(help_text)
        
    async def handle_focus_command(self, command: str):
        """집중 모드 명령어 처리"""
        import re
        
        # --goal="목표" --timer=90 형태의 명령어 파싱
        goal_match = re.search(r'--goal[=\s]+["\']([^"\']+)["\']', command)
        timer_match = re.search(r'--timer[=\s]+(\d+)', command)
        
        goal = goal_match.group(1) if goal_match else "집중 모드"
        timer_minutes = int(timer_match.group(1)) if timer_match else 25
        
        self.current_goal = goal
        self.focus_start_time = datetime.now().timestamp()
        self.focus_duration = timer_minutes
        
        print(f"{Colors.GREEN}🎯 집중 모드 시작!{Colors.RESET}")
        print(f"   목표: {Colors.BOLD}{goal}{Colors.RESET}")
        print(f"   시간: {Colors.BOLD}{timer_minutes}분{Colors.RESET}")
        print(f"   시작: {Colors.BOLD}{datetime.now().strftime('%H:%M')}{Colors.RESET}")
        
        # 방의 다른 사람들에게 알림
        await self.send_message(f"🎯 집중 모드를 시작했습니다: {goal} ({timer_minutes}분)")
        
    async def handle_break_command(self):
        """휴식/집중 모드 종료"""
        if self.focus_start_time:
            elapsed_time = int((datetime.now().timestamp() - self.focus_start_time) / 60)
            print(f"{Colors.YELLOW}☕ 휴식 시간!{Colors.RESET}")
            print(f"   집중 시간: {Colors.BOLD}{elapsed_time}분{Colors.RESET}")
            print(f"   목표: {Colors.BOLD}{self.current_goal}{Colors.RESET}")
            
            # 방의 다른 사람들에게 알림
            await self.send_message(f"☕ 휴식을 시작했습니다 ({elapsed_time}분 집중)")
            
            self.focus_start_time = None
            self.current_goal = None
            self.focus_duration = 0
        else:
            print(f"{Colors.RED}진행 중인 집중 세션이 없습니다.{Colors.RESET}")
            
    def set_goal(self, goal: str):
        """목표 설정"""
        self.current_goal = goal
        print(f"{Colors.GREEN}목표가 설정되었습니다: {Colors.BOLD}{goal}{Colors.RESET}")
        
    def show_focus_status(self):
        """집중 상태 표시"""
        if self.focus_start_time:
            elapsed_minutes = int((datetime.now().timestamp() - self.focus_start_time) / 60)
            remaining_minutes = max(0, self.focus_duration - elapsed_minutes)
            
            print(f"\n{Colors.CYAN}{Colors.BOLD}집중 모드 상태:{Colors.RESET}")
            print(f"  목표: {Colors.BOLD}{self.current_goal}{Colors.RESET}")
            print(f"  경과 시간: {Colors.GREEN}{elapsed_minutes}분{Colors.RESET}")
            print(f"  남은 시간: {Colors.YELLOW}{remaining_minutes}분{Colors.RESET}")
            print(f"  시작 시간: {Colors.BOLD}{datetime.fromtimestamp(self.focus_start_time).strftime('%H:%M')}{Colors.RESET}")
            
            if remaining_minutes <= 0:
                print(f"  {Colors.GREEN}🎉 목표 시간을 달성했습니다!{Colors.RESET}")
        else:
            print(f"{Colors.DIM}진행 중인 집중 세션이 없습니다.{Colors.RESET}")
        print()
        
    async def run(self):
        """메인 실행 루프"""
        try:
            async with websockets.connect(self.uri) as ws:
                self.ws = ws
                self.connected = True
                
                # 초기 화면 표시
                self.update_display()
                print(f"{Colors.GREEN}서버에 연결되었습니다!{Colors.RESET}")
                
                # 연결 즉시 방 목록 요청
                await ws.send(json.dumps({"type": "get_rooms"}))
                print(f"{Colors.CYAN}현재 방 목록을 가져오는 중...{Colors.RESET}")
                
                # 수신 태스크 시작
                recv_task = asyncio.create_task(self.receiver())
                
                try:
                    while True:
                        command = await self.user_input()
                        if not await self.process_command(command):
                            break
                            
                finally:
                    recv_task.cancel()
                    with contextlib.suppress(asyncio.CancelledError):
                        await recv_task
                        
        except Exception as e:
            print(f"{Colors.RED}연결 오류: {e}{Colors.RESET}")
            self.connected = False

async def main():
    if len(sys.argv) < 2:
        print("사용법: python enhanced_client.py <사용자이름> [ws://서버주소:포트]")
        sys.exit(1)
        
    username = sys.argv[1]
    uri = sys.argv[2] if len(sys.argv) > 2 else "ws://localhost:8766"
    
    cli = SimulSyncCLI(username, uri)
    await cli.run()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}프로그램을 종료합니다...{Colors.RESET}")
    except Exception as e:
        print(f"\n{Colors.RED}오류 발생: {e}{Colors.RESET}")
