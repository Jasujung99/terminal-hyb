// 전역 변수
let ws = null;
let username = '';
let currentRoom = null;
let focusTimer = null;
let focusStartTime = null;
let focusDuration = 0;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    showLoginModal();
});

// 로그인 및 연결
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

async function connect() {
    username = document.getElementById('usernameInput').value.trim();
    if (!username) {
        showLoginError('사용자 이름을 입력하세요.');
        return;
    }
    
    // Live Server 환경 감지 (포트 5500은 Live Server 기본 포트)
    const isLiveServer = location.port === '5500' || location.protocol === 'file:';
    const isCodespace = location.hostname.includes('github.dev') || location.hostname.includes('codespaces');
    
    if (isLiveServer) {
        // 데모 모드로 실행
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        addMainCliOutput('[데모 모드] 서버 연결 없이 UI만 테스트합니다.', 'info');
        addMainCliOutput('실제 기능을 사용하려면 하이브리드 서버를 실행하세요.', 'info');
        enableDemoMode();
        return;
    }
    
    try {
        // Codespace 환경에서는 동적으로 WebSocket URL 생성
        const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = location.hostname === 'localhost' ? 'localhost:8766' : `${location.hostname.replace('-8000', '-8766')}`;
        const wsUrl = `${wsProtocol}//${wsHost}`;
        
        console.log('WebSocket URL:', wsUrl);
        ws = new WebSocket(wsUrl);
        
        ws.onopen = function() {
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('mainApp').style.display = 'flex';
            addMainCliOutput('시스템에 연결되었습니다.', 'success');
            updateRoomList();
        };
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };
        
        ws.onclose = function() {
            addMainCliOutput('연결이 끊어졌습니다.', 'error');
            setTimeout(() => {
                addMainCliOutput('서버 연결이 끊어졌습니다. 페이지를 새로고침하세요.', 'error');
            }, 1000);
        };
        
        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            addMainCliOutput('연결 오류가 발생했습니다.', 'error');
        };
        
    } catch (error) {
        showLoginError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
        console.error('Connection error:', error);
    }
}

// 로그인 에러 표시
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// 데모 모드 기능
function enableDemoMode() {
    // 데모용 방 목록 업데이트
    addMainCliOutput('데모 모드에서 사용할 수 있는 명령어:', 'info');
    addMainCliOutput('  join study-room - 데모 방 입장', 'info');
    addMainCliOutput('  help - 도움말', 'info');
    
    // 데모용 joinRoom 함수 오버라이드
    window.originalJoinRoom = joinRoom;
    window.joinRoom = function(roomName) {
        currentRoom = roomName;
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('roomApp').style.display = 'flex';
        document.getElementById('roomTitle').textContent = roomName + ' (데모)';
        
        document.getElementById('chatMessages').innerHTML = '';
        addChatMessage(`[데모] ${roomName} 방에 입장했습니다.`, 'system');
        addChatMessage('[데모] 실제 채팅은 서버 연결 후 가능합니다.', 'system');
        
        // 데모용 참가자 목록 업데이트
        const participantsList = document.getElementById('participantsList');
        participantsList.innerHTML = `
            <div class="participant-item">
                <span class="participant-status">●</span>
                <span>${username} (나)</span>
            </div>
            <div class="participant-item">
                <span class="participant-status">●</span>
                <span>Demo User</span>
            </div>
        `;
        
        addMainCliOutput(`[데모] ${roomName} 방에 입장했습니다.`, 'success');
    };
}

// WebSocket 메시지 처리
function handleWebSocketMessage(data) {
    if (data.type === 'message') {
        addChatMessage(`[${data.user}]: ${data.text}`, 'user');
    } else if (data.type === 'status') {
        if (data.message.includes('joined')) {
            addChatMessage(`* ${data.message}`, 'join');
            updateParticipantsList();
        } else if (data.message.includes('left')) {
            addChatMessage(`* ${data.message}`, 'leave');
            updateParticipantsList();
        } else {
            addChatMessage(`* ${data.message}`, 'system');
        }
    }
}

// 탭 전환
function switchTab(tabName) {
    // 네비게이션 아이템 업데이트
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 탭 컨텐츠 업데이트
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

// 메인 CLI 입력 처리
function handleMainCliInput(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const command = input.value.trim();
        input.value = '';
        
        if (command) {
            processMainCommand(command);
        }
    }
}

function processMainCommand(command) {
    addMainCliOutput(`> ${command}`, 'info');
    
    const parts = command.split(' ');
    const cmd = parts[0];
    
    switch (cmd) {
        case 'join':
            if (parts[1]) {
                joinRoom(parts[1]);
            } else {
                addMainCliOutput('사용법: join <방이름>', 'error');
            }
            break;
            
        case 'create-room':
            if (parts[1]) {
                createRoom(parts[1]);
            } else {
                addMainCliOutput('사용법: create-room <방이름>', 'error');
            }
            break;
            
        case 'list-rooms':
            listRooms();
            break;
            
        case 'help':
            showMainHelp();
            break;
            
        default:
            addMainCliOutput(`알 수 없는 명령어: ${cmd}`, 'error');
            addMainCliOutput('help를 입력하여 사용 가능한 명령어를 확인하세요.', 'info');
    }
}

function showMainHelp() {
    const helpText = [
        '사용 가능한 명령어:',
        '  join <방이름> - 방에 입장',
        '  create-room <방이름> - 새 방 생성',
        '  list-rooms - 방 목록 표시',
        '  help - 도움말 표시'
    ];
    helpText.forEach(line => addMainCliOutput(line, 'info'));
}

// 방 관리
function joinRoom(roomName) {
    if (!ws) {
        addMainCliOutput('서버에 연결되지 않았습니다.', 'error');
        return;
    }
    
    currentRoom = roomName;
    ws.send(JSON.stringify({
        type: 'join',
        room: roomName,
        username: username
    }));
    
    // UI를 방 화면으로 전환
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('roomApp').style.display = 'flex';
    document.getElementById('roomTitle').textContent = roomName;
    
    // 채팅 영역 초기화
    document.getElementById('chatMessages').innerHTML = '';
    addChatMessage(`${roomName} 방에 입장했습니다.`, 'system');
    
    addMainCliOutput(`${roomName} 방에 입장했습니다.`, 'success');
}

function leaveRoom() {
    if (currentRoom) {
        // 타이머 정지
        if (focusTimer) {
            clearInterval(focusTimer);
            focusTimer = null;
        }
        
        currentRoom = null;
        document.getElementById('roomApp').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        
        addMainCliOutput('방에서 나왔습니다.', 'info');
    }
}

function createRoom(roomName) {
    addMainCliOutput(`"${roomName}" 방을 생성했습니다.`, 'success');
    updateRoomList();
    // 실제로는 서버에 방 생성 요청을 보내야 합니다
}

function listRooms() {
    addMainCliOutput('방 목록:', 'info');
    addMainCliOutput('  study-room (0명) - React 프로젝트', 'info');
    addMainCliOutput('  code-lab (0명) - 알고리즘 스터디', 'info');
    addMainCliOutput('  reading (0명) - 독서모임', 'info');
}

function updateRoomList() {
    // 실제로는 서버에서 방 목록을 가져와야 합니다
    // 지금은 정적 목록을 유지합니다
}

// 방 내부 CLI 처리
function handleRoomCliInput(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const command = input.value.trim();
        input.value = '';
        
        if (command) {
            processRoomCommand(command);
        }
    }
}

function processRoomCommand(command) {
    addRoomCliOutput(`> ${command}`, 'info');
    
    const parts = command.split(' ');
    const cmd = parts[0];
    
    switch (cmd) {
        case 'focus':
            handleFocusCommand(command);
            break;
            
        case 'break':
            handleBreakCommand();
            break;
            
        case 'status':
            showFocusStatus();
            break;
            
        case 'goal':
            if (parts.slice(1).length > 0) {
                setGoal(parts.slice(1).join(' '));
            } else {
                addRoomCliOutput('사용법: goal <목표 설명>', 'error');
            }
            break;
            
        case 'help':
            showRoomHelp();
            break;
            
        default:
            addRoomCliOutput(`알 수 없는 명령어: ${cmd}`, 'error');
            addRoomCliOutput('help를 입력하여 사용 가능한 명령어를 확인하세요.', 'info');
    }
}

function handleFocusCommand(command) {
    // focus --goal="목표" --timer=90 형태의 명령어 파싱
    const goalMatch = command.match(/--goal[=\s]+["']([^"']+)["']/);
    const timerMatch = command.match(/--timer[=\s]+(\d+)/);
    
    const goal = goalMatch ? goalMatch[1] : '집중 모드';
    const duration = timerMatch ? parseInt(timerMatch[1]) : 25; // 기본 25분
    
    setGoal(goal);
    startFocusTimer(duration);
    
    addRoomCliOutput(`집중 모드 시작: ${goal} (${duration}분)`, 'success');
}

function handleBreakCommand() {
    if (focusTimer) {
        clearInterval(focusTimer);
        focusTimer = null;
        document.getElementById('timerDisplay').textContent = '⏱️ --:--';
        addRoomCliOutput('휴식 시간입니다.', 'info');
    } else {
        addRoomCliOutput('진행 중인 타이머가 없습니다.', 'error');
    }
}

function showFocusStatus() {
    if (focusTimer) {
        const elapsed = Math.floor((Date.now() - focusStartTime) / 1000 / 60);
        const remaining = Math.max(0, focusDuration - elapsed);
        addRoomCliOutput(`집중 시간: ${elapsed}분 경과, ${remaining}분 남음`, 'info');
    } else {
        addRoomCliOutput('진행 중인 집중 세션이 없습니다.', 'info');
    }
}

function setGoal(goal) {
    document.getElementById('roomGoal').textContent = goal;
}

function showRoomHelp() {
    const helpText = [
        '방 내부 명령어:',
        '  focus --goal="목표" --timer=90 - 집중 모드 시작',
        '  break - 휴식 시간',
        '  status - 현재 상태 확인',
        '  goal <목표> - 목표 설정',
        '  help - 도움말 표시'
    ];
    helpText.forEach(line => addRoomCliOutput(line, 'info'));
}

// 타이머 관리
function startFocusTimer(minutes) {
    if (focusTimer) {
        clearInterval(focusTimer);
    }
    
    focusStartTime = Date.now();
    focusDuration = minutes;
    let timeLeft = minutes * 60; // 초 단위
    
    focusTimer = setInterval(() => {
        timeLeft--;
        
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        const display = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = display;
        
        if (timeLeft <= 0) {
            clearInterval(focusTimer);
            focusTimer = null;
            document.getElementById('timerDisplay').textContent = '⏱️ 완료!';
            addRoomCliOutput('집중 시간이 완료되었습니다! 🎉', 'success');
        }
    }, 1000);
}

// 채팅 관리
function handleChatInput(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const message = input.value.trim();
        input.value = '';
        
        if (message && ws && currentRoom) {
            ws.send(JSON.stringify({
                type: 'message',
                text: message
            }));
        }
    }
}

function addChatMessage(message, type = 'user') {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 참가자 관리
function updateParticipantsList() {
    // 실제로는 서버에서 참가자 목록을 받아와야 합니다
    const participantsList = document.getElementById('participantsList');
    // 예시 데이터
    participantsList.innerHTML = `
        <div class="participant-item">
            <span class="participant-status">●</span>
            <span>${username}</span>
        </div>
    `;
}

// CLI 출력 헬퍼
function addMainCliOutput(text, type = 'info') {
    const output = document.getElementById('mainCliOutput');
    const div = document.createElement('div');
    div.className = `cli-${type}`;
    div.textContent = text;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
    
    // 너무 많은 출력이 쌓이지 않도록 제한
    if (output.children.length > 50) {
        output.removeChild(output.firstChild);
    }
}

function addRoomCliOutput(text, type = 'info') {
    const output = document.getElementById('roomCliOutput');
    const div = document.createElement('div');
    div.className = `cli-${type}`;
    div.textContent = text;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
    
    // 너무 많은 출력이 쌓이지 않도록 제한
    if (output.children.length > 50) {
        output.removeChild(output.firstChild);
    }
}
