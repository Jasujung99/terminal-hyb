import argparse
from datetime import datetime

ROOMS = {
    "study": {
        "name": "독서실",
        "users": 12,
        "description": "조용한 독서 공간"
    },
    "coding": {
        "name": "코딩룸",
        "users": 8,
        "description": "키보드 소리 환영"
    },
    "meditation": {
        "name": "명상실",
        "users": 3,
        "description": "완전한 고요"
    }
}


def list_rooms():
    print("[방 목록]")
    for key, info in ROOMS.items():
        print(f"{info['name']} ({info['users']}) - {info['description']}")


def join_room(room, goal, timer):
    if room not in ROOMS:
        print(f"존재하지 않는 방: {room}")
        return
    info = ROOMS[room]
    print(f"'{info['name']}'에 입장합니다. 목표: {goal}, 타이머: {timer}분")


def show_theme():
    hour = datetime.now().hour
    if 6 <= hour < 12:
        theme = "밝은 테마"
    elif 12 <= hour < 18:
        theme = "표준 테마"
    else:
        theme = "다크 테마"
    print(f"현재 테마: {theme}")


def main():
    parser = argparse.ArgumentParser(description="QuietCoWork CLI")
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("list-rooms")

    join_parser = subparsers.add_parser("join")
    join_parser.add_argument("room")
    join_parser.add_argument("--goal", default="", help="현재 작업 목표")
    join_parser.add_argument("--timer", type=int, default=60, help="분 단위 타이머")

    subparsers.add_parser("theme")

    args = parser.parse_args()

    if args.command == "list-rooms":
        list_rooms()
    elif args.command == "join":
        join_room(args.room, args.goal, args.timer)
    elif args.command == "theme":
        show_theme()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
