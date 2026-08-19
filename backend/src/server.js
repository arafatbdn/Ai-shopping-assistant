import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/db.js';

dotenv.config();

const port = Number(process.env.PORT) || 5000;

const start = async () => {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
};

start();
