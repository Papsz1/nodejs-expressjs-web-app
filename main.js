import express from 'express';
import path from 'path';
import eformidable from 'express-formidable';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { existsSync, mkdirSync } from 'fs';
import errorMiddleware from './middleware/error.js';
import requestRoutes from './routes/requests.js';
import { createTable } from './db/requests.js';
import apiRouter from './api/router.js';
import { checkJWT, validateJWT } from './middleware/auth.js';
import authRoutes from './routes/authentication.js';

const app = express();

app.use(express.static(path.join(process.cwd(), 'static')));
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
const uploadDir = path.join(process.cwd(), 'uploadDir');

app.use(eformidable({
  encoding: 'utf-8',
  multiples: true,
  uploadDir,
}));

app.use(morgan('tiny'));
app.use(cookieParser());

app.use('/home', checkJWT);
app.use('/home', validateJWT);

app.use('/auth', authRoutes);

app.use('/api', apiRouter);
app.use('/home', requestRoutes);
app.use('/', checkJWT);
app.use('/', validateJWT);
app.use('/', requestRoutes);

app.use(errorMiddleware);

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

createTable().then(() => {
  app.listen(1081, () => { console.log('Server started http://localhost:1081/ ...'); });
});
