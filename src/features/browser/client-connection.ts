enum ConnectionStatus {CLOSED, CLOSING, OPENING, OPEN};
const url = 'ws://' + window.location.host;
let connectionStatus = ConnectionStatus.CLOSED;
let socket: WebSocket;
let connectionTimer: NodeJS.Timeout;

interface ReceiveCommands {
    [command: string]: { command: string; receive: (data: unknown) => void };
} 
const receiveCommands: ReceiveCommands = {};

interface onOpenCommands {
   [command: string]: { command: string; data?: unknown };
} 
const onOpenCommands: onOpenCommands = {}; 

export function registerReceiveCommand(command: string, receive: (data: unknown) => void){
    receiveCommands [command] = { command, receive }; 
}
export function registerOnOpenCommand(command: string, data?: unknown){
    onOpenCommands[command] = { command, data }; 
}
export function init() {
    setConnectionStatus(false);
    initWebsocket();
}
export function sendCommand(command: string, data?: unknown){
    const message = {command, data};
    socket.send(JSON.stringify(message))
}
export function isConnected(): boolean {
    return connectionStatus === ConnectionStatus.OPEN && socket && socket.readyState === socket.OPEN;
}
export function setConnectionStatus(switchOn: boolean) {
    const status = document.getElementById('connection');
    const live = isConnected() && switchOn;
    if (status && live) {
        status.innerHTML = ' (live)';
    } else if (status && isConnected()) {
        status.innerHTML = ' (Connected)';
    } else if (status) {
        status.innerHTML = ' (Disconnected)';
    }
}
function initWebsocket() {
    connectionStatus = ConnectionStatus.OPENING;
    socket = new WebSocket(url);
    socket.onopen = function() {
        connectionStatus = ConnectionStatus.OPEN;
        for (const command in onOpenCommands) {
            sendCommand(command, onOpenCommands[command].data)
        }
        setConnectionStatus(true);
    };
    socket.onmessage = function(event) {
        const msg = JSON.parse(event.data);
        receiveCommands[msg.command].receive(msg.data);
    };
    socket.onclose = function () {
        connectionStatus = ConnectionStatus.CLOSED;
        setConnectionStatus(false);
    };
    socket.onerror = function() {
        connectionStatus = ConnectionStatus.CLOSING;
        setConnectionStatus(false);
    };
    clearTimeout(connectionTimer);
    connectionTimer = setInterval(KeepAlive, 5000);
} 
function KeepAlive() {
    if (socket.readyState === socket.CLOSED) {
        setConnectionStatus(false);
        initWebsocket();
    }
}

