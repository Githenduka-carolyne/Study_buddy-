import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { setupWebSocket } from './websocket.js';

const app = express();
const server = createServer(app);

// Set up WebSocket
setupWebSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/groups', (await import('./routes/groups.route.js')).default);
// Add other routes as needed

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
