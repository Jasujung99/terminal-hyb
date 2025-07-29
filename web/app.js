// 전역 변수
let ws = null;
let username = '';
let currentRoom = null;
let focusTimer = null;
let focusStartTime = null;
let focusDuration = 0;
let focusMode = {
    active: false,
    type: null,
    startTime: null,
    duration: 0,
    timer: null
};

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Initialize application
function initApp() {
    setupNavigation();
    setupGUIFeatures();
    showLoginModal();
}

// Setup all GUI features
function setupGUIFeatures() {
    setupWorkspaces();
    setupFocusMode();
    setupSettings();
}

// Workspaces functionality
function setupWorkspaces() {
    // Search functionality
    const searchInput = document.getElementById('roomSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Searching for:', searchTerm);
        });
    }
    
    // Create room button
    const createBtn = document.getElementById('createRoomBtn');
    const createForm = document.getElementById('createRoomForm');
    
    if (createBtn && createForm) {
        createBtn.addEventListener('click', () => {
            const isVisible = createForm.style.display !== 'none';
            createForm.style.display = isVisible ? 'none' : 'block';
            createBtn.textContent = isVisible ? '+ 새 방 만들기' : '취소';
        });
    }
    
    // Create room form submission
    const submitBtn = document.getElementById('submitCreateRoom');
    const cancelBtn = document.getElementById('cancelCreateRoom');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const roomName = document.getElementById('newRoomName').value.trim();
            const topic = document.getElementById('roomTopic').value.trim();
            const timer = document.getElementById('roomTimer').value;
            
            if (!roomName) {
                alert('방 이름을 입력해주세요.');
                return;
            }
            
            createRoomWithOptions(roomName, topic, timer);
            
            // Reset form
            document.getElementById('newRoomName').value = '';
            document.getElementById('roomTopic').value = '';
            document.getElementById('roomTimer').value = '없음';
            createForm.style.display = 'none';
            createBtn.textContent = '+ 새 방 만들기';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            createForm.style.display = 'none';
            createBtn.textContent = '+ 새 방 만들기';
        });
    }
}

// Focus Mode functionality
function setupFocusMode() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const startFocusBtn = document.getElementById('startFocus');
    
    // Mode selection
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Start focus session
    if (startFocusBtn) {
        startFocusBtn.addEventListener('click', () => {
            const activeMode = document.querySelector('.mode-btn.active');
            const duration = document.getElementById('focusDuration').value;
            const unit = document.getElementById('focusUnit').value;
            
            if (!activeMode) {
                alert('포커스 모드를 선택해주세요.');
                return;
            }
            
            if (!duration || duration <= 0) {
                alert('유효한 시간을 입력해주세요.');
                return;
            }
            
            startFocusSession(activeMode.dataset.mode, duration, unit);
        });
    }
    
    // Focus control buttons
    const pauseBtn = document.getElementById('pauseFocus');
    const stopBtn = document.getElementById('stopFocus');
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseFocusSession);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopFocusSession);
    }
}

// Settings functionality
function setupSettings() {
    const themeSelect = document.getElementById('themeSelect');
    const languageSelect = document.getElementById('languageSelect');
    const soundCheck = document.getElementById('soundNotifications');
    const desktopCheck = document.getElementById('desktopNotifications');
    const vibrationCheck = document.getElementById('vibrationNotifications');
    
    // Load saved settings
    loadSettings();
    
    // Theme change
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            changeTheme(e.target.value);
        });
    }
    
    // Language change
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    
    // Notification settings
    [soundCheck, desktopCheck, vibrationCheck].forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', saveSettings);
        }
    });
}

// Workspaces functionality
function setupWorkspaces() {
    // Search functionality
    const searchInput = document.getElementById('roomSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Searching for:', searchTerm);
        });
    }
    
    // Create room button
    const createBtn = document.getElementById('createRoomBtn');
    const createForm = document.getElementById('createRoomForm');
    
    if (createBtn && createForm) {
        createBtn.addEventListener('click', () => {
            const isVisible = createForm.style.display !== 'none';
            createForm.style.display = isVisible ? 'none' : 'block';
            createBtn.textContent = isVisible ? '+ 새 방 만들기' : '취소';
        });
    }
    
    // Create room form submission
    const submitBtn = document.getElementById('submitCreateRoom');
    const cancelBtn = document.getElementById('cancelCreateRoom');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const roomName = document.getElementById('newRoomName').value.trim();
            const topic = document.getElementById('roomTopic').value.trim();
            const timer = document.getElementById('roomTimer').value;
            
            if (!roomName) {
                alert('방 이름을 입력해주세요.');
                return;
            }
            
            createRoomWithOptions(roomName, topic, timer);
            
            // Reset form
            document.getElementById('newRoomName').value = '';
            document.getElementById('roomTopic').value = '';
            document.getElementById('roomTimer').value = '없음';
            createForm.style.display = 'none';
            createBtn.textContent = '+ 새 방 만들기';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            createForm.style.display = 'none';
            createBtn.textContent = '+ 새 방 만들기';
        });
    }
}

// Focus Mode functionality
function setupFocusMode() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const startFocusBtn = document.getElementById('startFocus');
    
    // Mode selection
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Start focus session
    if (startFocusBtn) {
        startFocusBtn.addEventListener('click', () => {
            const activeMode = document.querySelector('.mode-btn.active');
            const duration = document.getElementById('focusDuration').value;
            const unit = document.getElementById('focusUnit').value;
            
            if (!activeMode) {
                alert('포커스 모드를 선택해주세요.');
                return;
            }
            
            if (!duration || duration <= 0) {
                alert('유효한 시간을 입력해주세요.');
                return;
            }
            
            startFocusSession(activeMode.dataset.mode, duration, unit);
        });
    }
    
    // Focus control buttons
    const pauseBtn = document.getElementById('pauseFocus');
    const stopBtn = document.getElementById('stopFocus');
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseFocusSession);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopFocusSession);
    }
}

// Settings functionality  
function setupSettings() {
    const themeSelect = document.getElementById('themeSelect');
    const languageSelect = document.getElementById('languageSelect');
    const soundCheck = document.getElementById('soundNotifications');
    const desktopCheck = document.getElementById('desktopNotifications');
    const vibrationCheck = document.getElementById('vibrationNotifications');
    
    // Load saved settings
    loadSettings();
    
    // Theme change
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            changeTheme(e.target.value);
        });
    }
    
    // Language change
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    
    // Notification settings
    [soundCheck, desktopCheck, vibrationCheck].forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', saveSettings);
        }
    });
}

// Focus Mode functions
function startFocusSession(mode, duration, unit) {
    const minutes = unit === 'hours' ? duration * 60 : duration;
    
    focusMode = {
        active: true,
        type: mode,
        startTime: new Date(),
        duration: minutes,
        timer: null
    };
    
    // Update UI
    const statusDiv = document.getElementById('focusStatus');
    const timerDiv = document.getElementById('focusTimer');
    
    if (statusDiv) {
        statusDiv.style.display = 'block';
        const currentModeSpan = document.getElementById('currentMode');
        if (currentModeSpan) {
            currentModeSpan.textContent = getFocusModeText(mode);
        }
    }
    
    if (timerDiv) {
        timerDiv.style.display = 'none';
    }
    
    // Start countdown
    updateFocusTimer();
    focusMode.timer = setInterval(updateFocusTimer, 1000);
    
    addMainCliOutput(`${getFocusModeText(mode)} 시작! (${duration}${unit === 'hours' ? '시간' : '분'})`, 'success');
}

function pauseFocusSession() {
    if (focusMode.timer) {
        clearInterval(focusMode.timer);
        focusMode.timer = null;
        const pauseBtn = document.getElementById('pauseFocus');
        if (pauseBtn) pauseBtn.textContent = '재시작';
        addMainCliOutput('포커스 모드가 일시정지되었습니다.', 'info');
    } else {
        focusMode.timer = setInterval(updateFocusTimer, 1000);
        const pauseBtn = document.getElementById('pauseFocus');
        if (pauseBtn) pauseBtn.textContent = '일시정지';
        addMainCliOutput('포커스 모드가 재시작되었습니다.', 'info');
    }
}

function stopFocusSession() {
    if (focusMode.timer) {
        clearInterval(focusMode.timer);
    }
    
    focusMode = {
        active: false,
        type: null,
        startTime: null,
        duration: 0,
        timer: null
    };
    
    const statusDiv = document.getElementById('focusStatus');
    const timerDiv = document.getElementById('focusTimer');
    
    if (statusDiv) statusDiv.style.display = 'none';
    if (timerDiv) timerDiv.style.display = 'block';
    
    const pauseBtn = document.getElementById('pauseFocus');
    if (pauseBtn) pauseBtn.textContent = '일시정지';
    
    addMainCliOutput('포커스 모드가 종료되었습니다.', 'info');
}

function updateFocusTimer() {
    if (!focusMode.active) return;
    
    const now = new Date();
    const elapsed = Math.floor((now - focusMode.startTime) / 1000 / 60); // minutes
    const remaining = focusMode.duration - elapsed;
    
    if (remaining <= 0) {
        stopFocusSession();
        addMainCliOutput('포커스 세션이 완료되었습니다! 수고하셨습니다.', 'success');
        return;
    }
    
    const hours = Math.floor(remaining / 60);
    const minutes = remaining % 60;
    const timeText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
    
    const timeElement = document.getElementById('timeRemaining');
    if (timeElement) {
        timeElement.textContent = timeText;
    }
}

function getFocusModeText(mode) {
    const modes = {
        'deep': '깊은 집중',
        'social': '소셜 협업',
        'light': '라이트 포커스'
    };
    return modes[mode] || mode;
}

// Settings functions
function loadSettings() {
    const settings = localStorage.getItem('terminalHybridSettings');
    if (settings) {
        const parsed = JSON.parse(settings);
        
        if (parsed.theme && document.getElementById('themeSelect')) {
            document.getElementById('themeSelect').value = parsed.theme;
            changeTheme(parsed.theme);
        }
        
        if (parsed.language && document.getElementById('languageSelect')) {
            document.getElementById('languageSelect').value = parsed.language;
        }
        
        if (parsed.notifications) {
            const checkboxes = ['soundNotifications', 'desktopNotifications', 'vibrationNotifications'];
            checkboxes.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox && parsed.notifications[id] !== undefined) {
                    checkbox.checked = parsed.notifications[id];
                }
            });
        }
    }
}

function saveSettings() {
    const settings = {
        theme: document.getElementById('themeSelect')?.value || 'dark',
        language: document.getElementById('languageSelect')?.value || 'ko',
        notifications: {
            soundNotifications: document.getElementById('soundNotifications')?.checked || false,
            desktopNotifications: document.getElementById('desktopNotifications')?.checked || false,
            vibrationNotifications: document.getElementById('vibrationNotifications')?.checked || false
        }
    };
    
    localStorage.setItem('terminalHybridSettings', JSON.stringify(settings));
}

function changeTheme(theme) {
    document.body.className = theme + '-theme';
    saveSettings();
}

function changeLanguage(language) {
    console.log('Language changed to:', language);
    saveSettings();
}

// Room creation with options
function createRoomWithOptions(roomName, topic, timer) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
            type: 'create_room',
            room: roomName,
            topic: topic || '',
            timer: timer !== '없음' ? timer : null
        };
        ws.send(JSON.stringify(message));
        addMainCliOutput(`방 "${roomName}" 생성 요청을 보냈습니다.`, 'success');
    } else {
        addMainCliOutput('서버에 연결되어 있지 않습니다. 데모 모드에서 GUI 기능을 테스트해보세요.', 'info');
        // 데모 모드에서도 방 생성 시뮬레이션
        createRoom(roomName);
    }
}

// 로그인 및 연결
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

// Focus Mode functions
function startFocusSession(mode, duration, unit) {
    const minutes = unit === 'hours' ? duration * 60 : duration;
    
    focusMode = {
        active: true,
        type: mode,
        startTime: new Date(),
        duration: minutes,
        timer: null
    };
    
    // Update UI
    const statusDiv = document.getElementById('focusStatus');
    const timerDiv = document.getElementById('focusTimer');
    
    if (statusDiv) {
        statusDiv.style.display = 'block';
        document.getElementById('currentMode').textContent = getFocusModeText(mode);
    }
    
    if (timerDiv) {
        timerDiv.style.display = 'none';
    }
    
    // Start countdown
    updateFocusTimer();
    focusMode.timer = setInterval(updateFocusTimer, 1000);
    
    addMainCliOutput(`${getFocusModeText(mode)} 시작! (${duration}${unit === 'hours' ? '시간' : '분'})`, 'info');
}

function pauseFocusSession() {
    if (focusMode.timer) {
        clearInterval(focusMode.timer);
        focusMode.timer = null;
        document.getElementById('pauseFocus').textContent = '재시작';
        addMainCliOutput('포커스 모드가 일시정지되었습니다.', 'info');
    } else {
        focusMode.timer = setInterval(updateFocusTimer, 1000);
        document.getElementById('pauseFocus').textContent = '일시정지';
        addMainCliOutput('포커스 모드가 재시작되었습니다.', 'info');
    }
}

function stopFocusSession() {
    if (focusMode.timer) {
        clearInterval(focusMode.timer);
    }
    
    focusMode = {
        active: false,
        type: null,
        startTime: null,
        duration: 0,
        timer: null
    };
    
    const statusDiv = document.getElementById('focusStatus');
    const timerDiv = document.getElementById('focusTimer');
    
    if (statusDiv) statusDiv.style.display = 'none';
    if (timerDiv) timerDiv.style.display = 'block';
    
    const pauseBtn = document.getElementById('pauseFocus');
    if (pauseBtn) pauseBtn.textContent = '일시정지';
    
    addMainCliOutput('포커스 모드가 종료되었습니다.', 'info');
}

function updateFocusTimer() {
    if (!focusMode.active) return;
    
    const now = new Date();
    const elapsed = Math.floor((now - focusMode.startTime) / 1000 / 60); // minutes
    const remaining = focusMode.duration - elapsed;
    
    if (remaining <= 0) {
        stopFocusSession();
        addMainCliOutput('포커스 세션이 완료되었습니다! 수고하셨습니다.', 'success');
        return;
    }
    
    const hours = Math.floor(remaining / 60);
    const minutes = remaining % 60;
    const timeText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
    
    const timeElement = document.getElementById('timeRemaining');
    if (timeElement) {
        timeElement.textContent = timeText;
    }
}

function getFocusModeText(mode) {
    const modes = {
        'deep': '깊은 집중',
        'social': '소셜 협업',
        'light': '라이트 포커스'
    };
    return modes[mode] || mode;
}

// Settings functions
function loadSettings() {
    const settings = localStorage.getItem('terminalHybridSettings');
    if (settings) {
        const parsed = JSON.parse(settings);
        
        if (parsed.theme && document.getElementById('themeSelect')) {
            document.getElementById('themeSelect').value = parsed.theme;
            changeTheme(parsed.theme);
        }
        
        if (parsed.language && document.getElementById('languageSelect')) {
            document.getElementById('languageSelect').value = parsed.language;
        }
        
        if (parsed.notifications) {
            const checkboxes = ['soundNotifications', 'desktopNotifications', 'vibrationNotifications'];
            checkboxes.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox && parsed.notifications[id] !== undefined) {
                    checkbox.checked = parsed.notifications[id];
                }
            });
        }
    }
}

function saveSettings() {
    const settings = {
        theme: document.getElementById('themeSelect')?.value || 'dark',
        language: document.getElementById('languageSelect')?.value || 'ko',
        notifications: {
            soundNotifications: document.getElementById('soundNotifications')?.checked || false,
            desktopNotifications: document.getElementById('desktopNotifications')?.checked || false,
            vibrationNotifications: document.getElementById('vibrationNotifications')?.checked || false
        }
    };
    
    localStorage.setItem('terminalHybridSettings', JSON.stringify(settings));
}

function changeTheme(theme) {
    document.body.className = theme + '-theme';
    saveSettings();
}

function changeLanguage(language) {
    console.log('Language changed to:', language);
    saveSettings();
}

// Room creation with options
function createRoomWithOptions(roomName, topic, timer) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
            type: 'create_room',
            room: roomName,
            topic: topic || '',
            timer: timer !== '없음' ? timer : null
        };
        ws.send(JSON.stringify(message));
        addMainCliOutput(`방 "${roomName}" 생성 요청을 보냈습니다.`, 'info');
    } else {
        addMainCliOutput('서버에 연결되어 있지 않습니다.', 'error');
    }
}

async function connect() {
    username = document.getElementById('usernameInput').value.trim();
    if (!username) {
        showLoginError('사용자 이름을 입력하세요.');
        return;
    }
    
    // Codespace 환경 감지
    const isCodespace = location.hostname.includes('github.dev') || location.hostname.includes('codespaces');
    const isLiveServer = location.port === '5500' || location.protocol === 'file:';
    
    // Codespace에서는 항상 WebSocket 연결 시도
    if (isCodespace || !isLiveServer) {
        try {
            // Codespace 환경에서는 동적으로 WebSocket URL 생성
            const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsHost = location.hostname.replace('-8000', '-8766');
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
                    addMainCliOutput('서버 연결이 끊어졌습니다. 데모 모드로 전환합니다.', 'info');
                    enableDemoMode();
                }, 1000);
            };
            
            ws.onerror = function(error) {
                console.error('WebSocket error:', error);
                addMainCliOutput('연결 오류가 발생했습니다. 데모 모드로 전환합니다.', 'error');
                setTimeout(enableDemoMode, 1000);
            };
            
        } catch (error) {
            console.error('Connection error:', error);
            addMainCliOutput('서버 연결 실패. 데모 모드로 실행합니다.', 'info');
            enableDemoMode();
        }
    } else {
        // Live Server나 file:// 프로토콜에서는 데모 모드
        enableDemoMode();
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
    // UI 표시
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    
    // 데모용 방 목록 업데이트
    addMainCliOutput('[데모 모드] 서버 연결 없이 UI를 테스트합니다.', 'info');
    addMainCliOutput('GUI 메뉴의 모든 기능을 체험해보세요!', 'info');
    addMainCliOutput('사용할 수 있는 명령어:', 'info');
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

// GUI 함수들
function searchRooms() {
    const searchTerm = document.getElementById('roomSearch').value.toLowerCase();
    console.log('Searching for:', searchTerm);
    // TODO: 실제 검색 로직 구현
}

function toggleCreateRoom() {
    const form = document.getElementById('createRoomForm');
    const btn = event.target;
    const isVisible = form.style.display !== 'none';
    
    form.style.display = isVisible ? 'none' : 'block';
    btn.textContent = isVisible ? '+ 새 방 만들기' : '취소';
}

function createNewRoom() {
    const roomName = document.getElementById('newRoomName').value.trim();
    const topic = document.getElementById('newRoomTopic').value.trim();
    const timer = document.getElementById('newRoomTimer').value;
    
    if (!roomName) {
        alert('방 이름을 입력해주세요.');
        return;
    }
    
    // 폼 리셋
    document.getElementById('newRoomName').value = '';
    document.getElementById('newRoomTopic').value = '';
    document.getElementById('newRoomTimer').value = '25';
    document.getElementById('createRoomForm').style.display = 'none';
    
    // 방 생성
    if (ws && ws.readyState === WebSocket.OPEN) {
        // 실제 서버에 방 생성 요청
        ws.send(JSON.stringify({
            type: 'create_room',
            room: roomName,
            topic: topic,
            timer: timer
        }));
        addMainCliOutput(`방 "${roomName}" 생성 요청을 보냈습니다.`, 'info');
    } else {
        // 데모 모드
        addMainCliOutput(`[데모] 방 "${roomName}" 을 생성했습니다. (주제: ${topic || '없음'})`, 'success');
        createRoom(roomName);
    }
}

// Focus Mode GUI 함수들
function selectFocusMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    addMainCliOutput(`포커스 모드 선택: ${getFocusModeText(mode)}`, 'info');
}

function startFocusMode() {
    const activeMode = document.querySelector('.mode-btn.active');
    const goal = document.getElementById('focusGoal').value.trim();
    const time = document.getElementById('focusTime').value;
    
    if (!activeMode) {
        alert('포커스 모드를 선택해주세요.');
        return;
    }
    
    if (!goal) {
        alert('집중 목표를 입력해주세요.');
        return;
    }
    
    // 실제 포커스 세션 시작
    const mode = activeMode.onclick.toString().match(/'([^']+)'/)[1];
    startFocusSession(mode, parseInt(time), 'minutes');
    
    // UI 업데이트
    document.getElementById('focusStatus').style.display = 'block';
    document.getElementById('focusCurrentGoal').textContent = `목표: ${goal}`;
}

function pauseFocusMode() {
    pauseFocusSession();
}

function stopFocusMode() {
    stopFocusSession();
    document.getElementById('focusStatus').style.display = 'none';
    document.getElementById('focusGoal').value = '';
}

// Settings GUI 함수들
function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    changeTheme(theme);
}

function toggleLargeText() {
    const enabled = document.getElementById('largeText').checked;
    document.body.classList.toggle('large-text', enabled);
    addMainCliOutput(`큰 글씨 모드: ${enabled ? '활성화' : '비활성화'}`, 'info');
}

function toggleNotifications() {
    const enabled = document.getElementById('enableNotifications').checked;
    addMainCliOutput(`알림: ${enabled ? '활성화' : '비활성화'}`, 'info');
}

function toggleSounds() {
    const enabled = document.getElementById('enableSounds').checked;
    addMainCliOutput(`효과음: ${enabled ? '활성화' : '비활성화'}`, 'info');
}

function resetSettings() {
    if (confirm('모든 설정을 초기화하시겠습니까?')) {
        localStorage.removeItem('terminalHybridSettings');
        location.reload();
    }
}

function exportSettings() {
    const settings = localStorage.getItem('terminalHybridSettings');
    if (settings) {
        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'terminal-hybrid-settings.json';
        a.click();
        URL.revokeObjectURL(url);
        addMainCliOutput('설정을 내보냈습니다.', 'success');
    }
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
