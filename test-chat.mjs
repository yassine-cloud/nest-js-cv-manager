import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.error('\n❌ Usage: node test-chat.mjs YOUR_JWT_TOKEN\n');
  process.exit(1);
}

console.log('\n🚀 Connecting to chat...\n');

const socket = io(`${BASE_URL}/chat`, {
  auth: { token: TOKEN },
  transports: ['websocket'],
});

let roomId = null;
let messageId = null;

socket.on('connect', () => {
  console.log('✅ TEST 1 PASSED - Connected to WebSocket server');
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

socket.on('connected', (data) => {
  console.log('✅ TEST 2 PASSED - Auth works:', data.message);
  console.log('\n⏳ Joining room...');
  socket.emit('join_room', { roomName: 'general' });
});

socket.on('online_users', (users) => {
  console.log('✅ TEST 3 PASSED - Online users received:', users.map(u => u.username).join(', '));
});

socket.on('room_joined', (data) => {
  roomId = data.room.id;
  console.log('✅ TEST 4 PASSED - Joined room:', data.room.name);
  console.log('\n⏳ Sending message...');
  socket.emit('send_message', { roomId, content: 'Hello from test script!' });
});

socket.on('new_message', (msg) => {
  messageId = msg.id;
  console.log('✅ TEST 5 PASSED - Message sent and received:', msg.content);
  console.log('\n⏳ Sending reaction...');
  socket.emit('react', { messageId, emoji: '👍', roomId });
});

socket.on('reaction_updated', (data) => {
  console.log('✅ TEST 6 PASSED - Reaction toggled, removed:', data.removed);
  console.log('\n⏳ Sending typing indicator...');
  socket.emit('typing', { roomId, isTyping: true });
  setTimeout(() => {
    console.log('✅ TEST 7 PASSED - Typing indicator sent');
    console.log('\n⏳ Deleting message...');
    socket.emit('delete_message', { messageId, roomId });
  }, 500);
});

socket.on('message_deleted', (data) => {
  console.log('✅ TEST 8 PASSED - Message deleted:', data.messageId);
  console.log('\n🎉 ALL TESTS PASSED - WebSocket chat is working perfectly!\n');
  socket.disconnect();
  process.exit(0);
});

setTimeout(() => {
  console.error('\n❌ TIMEOUT - Something is not responding. Check your server.');
  process.exit(1);
}, 10000);
