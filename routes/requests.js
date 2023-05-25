import express from 'express';
import bcrypt from 'bcrypt';
import * as db from '../db/requests.js';

const router = express.Router();

router.get('/style.css', async (req, res) => {
  res.sendFile(`${process.cwd()}/static/style.css`);
});

router.get(['/'], async (req, res) => {
  console.log('Root:', res.locals);
  let errorMessage = '';
  const listClasses = await db.listClasses();
  try {
    res.render('classes', { listClasses, errorMessage });
  } catch (err) {
    errorMessage = 'The classes could not be listed';
    res.render('classes', { listClasses, errorMessage });
  }
});

router.get('/requests', async (req, res) => {
  let requestInfo = await db.listRequests();
  if (!requestInfo) {
    requestInfo = null;
  }
  console.log(requestInfo);
  res.render('requests', { requestInfo });
});
router.post('/createRequest', async (req, res) => {
  try {
    await db.insertRequest(req.fields.requestContent, res.locals.name);
    console.log(res.locals.name);
  } catch (err) {
    console.log(err);
  }
  res.render('requests');
});

router.post('/insertClass', async (req, res)  =>  {
  let errorMessage = '';
  let listClasses = await db.listClasses();
  try {
    await db.insertClass(req);
    listClasses = await db.listClasses();
    res.render('classes', { listClasses, errorMessage });
  } catch (err) {
    errorMessage = err;
    res.render('classes', { listClasses, errorMessage });
  }
});
router.post('/listClass', async (req, res)  =>  {
  try {
    const classDetails = await db.classDetails(req);
    const classData = await db.classData(req);
    const { code } = req.fields;
    const errorMessage = '';
    res.render('listClasses', {
      classDetails, classData, code, errorMessage,
    });
  } catch (err) {
    const classDetails = null;
    const classData = null;
    const { code } = null;
    const errorMessage = 'Error listing class';
    res.render('listClasses', {
      classDetails, classData, code, errorMessage,
    });
  }
});

router.post('/upload', async (req, res)  =>  {
  let classDetails = await db.classDetails(req);
  let classData = await db.classData(req);
  let { code } = req.fields;
  try {
    await db.insertFile(req);
    classDetails = await db.classDetails(req);
    classData = await db.classData(req);
    code = req.fields.code;
    const errorMessage = 'Succesful upload';
    res.render('listClasses', {
      classDetails, classData, code, errorMessage,
    });
  } catch (err) {
    console.log(err);
    const errorMessage = 'Error uploading';
    res.render('listClasses', {
      classDetails, classData, code, errorMessage,
    });
  }
});

router.post('/download', async (req, res) => {
  try {
    console.log('Download:', req.fields.fileName);
    res.download(req.fields.fileName);
  } catch (err) {
    res.status(500).render('error', { message: `Failed download: ${err.message}` });
  }
});

router.get('/user', async (req, res) => {
  try {
    const errorMessage = '';
    res.render('userPage', { errorMessage });
  } catch (err) {
    const errorMessage = 'Unsuccesful registration. The id might already be used.';
    res.render('userPage', { errorMessage });
  }
});

router.get('/classInsert', async (req, res)  =>  {
  res.render('insertClass');
});

router.post('/register', async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.fields.registerPassword, salt);
  const response = await db.userRegister(req, password);
  if (response === -1) {
    console.log('Unsuccesful register');
  } else {
    console.log('Succesful register');
  }
  res.render('registerPage');
});

router.post('/logout', async (req, res) => {
  res.clearCookie('auth');
  res.redirect('/home');
});

router.get('/registerPage', async (req, res) => {
  res.render('registerPage');
});

router.post('/classDelete', async (req, res)  =>  {
  console.log(req.fields);
  try {
    await db.deleteClass(req.fields.classDeletionID);
    res.redirect('/home');
  } catch (err) {
    console.log(err);
  }
});

router.get('/teacherMaintenance', async (req, res)  =>  {
  try {
    const listClasses = await db.listClasses();
    const teacherInfo = await db.teacherInfo();
    res.render('teacherMaintenance', { listClasses, teacherInfo });
  } catch (err) {
    console.log(err);
  }
});

router.get('/timetable', async (req, res)  =>  {
  try {
    const listClasses = await db.listClasses();
    res.render('insertTimetable', { listClasses });
  } catch (err) {
    console.log(err);
  }
});

router.post('/assign', async (req, res)  =>  {
  console.log('------------Teacher assignment--------------------');
  console.log(req.fields);
  try {
    await db.classOwner(req.fields.classID, req.fields.userID);
    res.redirect('/home/teacherMaintenance');
  } catch (err) {
    console.log(err);
  }
});

router.post('/timetableInsert', async (req, res)  =>  {
  console.log('------------Timetable insert--------------------');
  console.log(req.fields);
  try {
    await db.insertTimeTable(
      req.fields.classID,
      req.fields.dayID,
      req.fields.startHour,
      req.fields.endHour,
    );
    res.redirect('/home/timetable');
  } catch (err) {
    console.log(err);
  }
});

router.get('/listTimetable', async (req, res)  =>  {
  try {
    const timetableInfo = await db.listTimeTable();
    console.log(timetableInfo);
    res.render('listTimetable', { timetableInfo });
  } catch (err) {
    console.log(err);
  }
});

router.get('/ownClasses', async (req, res)  =>  {
  let errorMessage = '';
  const listClasses = await db.userOwnClasses(res.locals.name);
  console.log(listClasses);
  try {
    res.render('classes', { listClasses, errorMessage });
  } catch (err) {
    errorMessage = 'The classes could not be listed';
    res.render('classes', { listClasses, errorMessage });
  }
});

router.get('/ownTimeTable', async (req, res)  =>  {
  try {
    const timetableInfo = await db.userOwnTimeTable(res.locals.name);
    console.log(timetableInfo);
    res.render('listTimetable', { timetableInfo });
  } catch (err) {
    console.log(err);
  }
});

export default router;
