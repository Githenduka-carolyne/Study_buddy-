import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

export const socket = io(SOCKET_URL, {
  autoConnect: false
});

export const connectSocket = (userId) => {
  socket.connect();
  socket.emit("join_room", { userId }); // Join the group room
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const emitMessage = (groupId, messageData) => {
  socket.emit("send_message", { groupId, messageData }); // Emit message to the group
};

export const emitTyping = (groupId, isTyping) => {
  socket.emit('typing', { groupId, isTyping });
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${SOCKET_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};
