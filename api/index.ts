import { app } from '../server/index';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Server } from 'http';
import { createServer } from 'http';

let server: Server;

export default (req: VercelRequest, res: VercelResponse) => {
  if (!server) {
    server = createServer(app);
  }
  server.emit('request', req, res);
}; 