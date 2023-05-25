import express from 'express';
import * as db from '../db/requests.js';

const router = express.Router();

router.get('/fileData/:code', async (req, res) => {
  try {
    const info = await db.fileData(req.params.code);
    res.send(JSON.stringify(info));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

router.get('/fileDownload/:name', async (req, res) => {
  try {
    await db.deleteFile(req.params.name);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

export default router;
