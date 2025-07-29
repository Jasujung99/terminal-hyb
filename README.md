# 동시접속(Quiet Co-Work) 데모

간단한 웹소켓 기반의 CLI 하이브리드 협업 앱 예제입니다.

## 구성
- `quietcowork/server.py` : 방과 사용자 관리를 하는 웹소켓 서버
- `quietcowork/client.py` : CLI 기반 클라이언트

## 실행 방법
1. 의존성 설치
   ```bash
   pip install websockets
   ```
2. 서버 실행
   ```bash
   python quietcowork/server.py
   ```
3. 클라이언트 실행
   ```bash
   python quietcowork/client.py <사용자이름> [ws://서버주소:포트]
   ```
   실행 후 `/join ROOM` 명령으로 방에 입장하고 메시지를 입력하면 됩니다.

## 기능
- 실시간 채팅 및 입장/퇴장 알림
- 여러 방 지원

이 코드는 버전3 목업을 기반으로 하며, 버전4 제안 사항 중 서버-클라이언트 구조와 기본 CLI 기능을 포함합니다.
