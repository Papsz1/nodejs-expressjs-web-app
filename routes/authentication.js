import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as db from '../db/requests.js';
import { secret } from '../config.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  console.log('LOGIIIIN');
  const jelszoAux = await db.userLogin(req);
  try {
    const stat = await bcrypt.compare(req.fields.loginPassword, jelszoAux[0].userPassword);
    if (!stat) {
      console.log('yes');
    } else {
      const userName = req.fields.loginName;
      const felhasznaloRang = jelszoAux[0].userRank;
      const token = await jwt.sign({ name: userName, rank: felhasznaloRang }, secret);
      res.cookie('auth', token, { httpOnly: true, sameSite: 'strict' });
      await res.status(200).header('authorization', token);
      console.log('no');
    }
  } catch (err) {
    console.log(err);
  }
  res.redirect('/home');
});

router.get('/loginPage', async (req, res) => {
  res.render('loginPage');
});

router.get('/home', async (req, res) => {
  let errorMessage = '';
  const listOfClasses = await db.listClasses();
  try {
    res.render('guestPage', { listOfClasses, errorMessage });
  } catch (err) {
    errorMessage = 'The classes could not be listed';
    res.render('guestPage', { listOfClasses, errorMessage });
  }
});

router.post('/logout', async (req, res) => {
  res.clearCookie('auth');
  res.redirect('/home');
});

router.get('/style.css', async (req, res) => {
  res.sendFile(`${process.cwd()}/static/style.css`);
});

export default router;
