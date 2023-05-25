import dbConnection from './connection.js';

export const createTable = async () => {
  try {
    await dbConnection.executeQuery(
      `CREATE TABLE IF NOT EXISTS Classes (
      classID int NOT NULL,
      ClassName varchar(50),
      ClassYear int,
      ClassLectureHours int,
      ClassSeminarHours int,
      ClassLabHours int,
      classOwner varchar(200),
      classSyllabus varchar(1000),
      PRIMARY KEY (classID)
      );`,
    );
    await dbConnection.executeQuery(
      `CREATE TABLE IF NOT EXISTS Files (
      FileID int NOT NULL AUTO_INCREMENT,
      fileName varchar(200),
      classID int,
      PRIMARY KEY (FileID),
      FOREIGN KEY (classID) REFERENCES Classes(classID)
      );`,
    );
    await dbConnection.executeQuery(
      `CREATE TABLE IF NOT EXISTS Users (
      userID int NOT NULL AUTO_INCREMENT,
      userName varchar(200),
      userFullName varchar(200),
      userPassword varchar(200),
      userRank int,
      PRIMARY KEY (userID)
      );`,
    );
    await dbConnection.executeQuery(
      `CREATE TABLE IF NOT EXISTS Timetables (
      timetableID int NOT NULL AUTO_INCREMENT,
      HourName varchar(200),
      timetableHourID int,
      hourDay int,
      hourStart int,
      HourEnd int,
      PRIMARY KEY (timetableID)
      );`,
    );
    await dbConnection.executeQuery(
      `CREATE TABLE IF NOT EXISTS TeacherReqs (
      requestID int NOT NULL AUTO_INCREMENT,
      requestTeacher varchar(200),
      requestContent varchar(1000),
      PRIMARY KEY (requestID)
      );`,
    );
    try {
      await dbConnection.executeQuery(
        `INSERT INTO Users (userID, userName, userFullName, userPassword, userRank) 
      VALUES (1, 'admin', 'admin', '$2b$10$U/2ZHZA2Cl1uwha2tipSqeBdwOvpne.5fEyleCn0mQBoBXF9sBV/m', 1);`,
      );
    } catch (err) {
      // it means the admin user has already been created
    }
    console.log('Table created successfully');
  } catch (err) {
    console.error(`Create table error: ${err}`);
    process.exit(1);
  }
};

export const listClasses = () => {
  const query = 'SELECT * FROM Classes';
  return dbConnection.executeQuery(query);
};

export async function classData(req) {
  const results = await dbConnection.executeQuery('SELECT * FROM Classes WHERE Classes.classID = (?)', [req.fields.code]);
  return results;
}

export async function classDetails(req) {
  return dbConnection.executeQuery('SELECT * FROM Classes JOIN Files ON Files.classID = Classes.classID WHERE Classes.classID = (?)', [req.fields.code]);
}

export async function insertFile(req) {
  return dbConnection.executeQuery('INSERT INTO Files (fileName, classID) VALUES (?, ?)', [req.files.file.path.toString(), req.fields.code]);
}

export async function insertClass(req) {
  await dbConnection.executeQuery(
    'INSERT INTO Classes VALUES (?,?,?,?,?,?,?, (?))',
    [req.fields.uniqueCode, req.fields.uniqueName.toString(), req.fields.year,
      req.fields.courseHours, req.fields.seminarHours, req.fields.labHours,
      req.fields.owner, req.fields.syllabus],
  );
}

export async function fileData(fileCode) {
  return dbConnection.executeQuery('SELECT Files.fileName FROM Classes JOIN Files ON Files.classID = Classes.classID WHERE Classes.classID = (?)', [fileCode]);
}

export async function deleteFile(filename) {
  try {
    await dbConnection.executeQuery('DELETE FROM Files WHERE (SELECT SUBSTRING_INDEX(Files.fileName, \'/\', -1)) = (?)', [filename.toString()]);
  } catch (err) {
    console.log(err);
  }
}

export async function userLogin(req) {
  try {
    return dbConnection.executeQuery('SELECT * FROM Users WHERE Users.userName = (?)', [req.fields.loginName.toString()]);
  } catch (err) {
    return -1;
  }
}

export async function userRegister(req, password) {
  try {
    await dbConnection.executeQuery('INSERT INTO Users (userName, userFullName, userPassword, userRank) VALUES (?, ?, ?, ?)', [req.fields.registerName.toString(), req.fields.fullName, password, req.fields.rank]);
    return 0;
  } catch (err) {
    console.log(err);
    return -1;
  }
}

export async function deleteClass(classID) {
  try {
    await dbConnection.executeQuery('DELETE FROM Files WHERE Files.classID = (?)', [classID]);
    await dbConnection.executeQuery('DELETE FROM Classes WHERE Classes.classID = (?)', [classID]);
  } catch (err) {
    console.log(err);
  }
}

export async function teacherInfo() {
  try {
    return await dbConnection.executeQuery('SELECT * FROM Users');
  } catch (err) {
    console.log(err);
    return -1;
  }
}

export async function classOwner(classID, username) {
  try {
    await dbConnection.executeQuery('UPDATE Classes SET classOwner = (?) WHERE Classes.classID = (?)', [username, classID]);
  } catch (err) {
    console.log(err);
  }
}

export async function insertTimeTable(classID, dayID, startHour, endHour) {
  try {
    await dbConnection.executeQuery('DELETE FROM Timetables WHERE timetableHourID = (?)', [classID]);
    await dbConnection.executeQuery('INSERT INTO Timetables (timetableHourID, hourDay, hourStart, HourEnd) VALUES (?, ?, ?, ?)', [classID, dayID, startHour, endHour]);
    await dbConnection.executeQuery('UPDATE Timetables SET Timetables.HourName = (SELECT Classes.ClassName FROM Classes WHERE Classes.classID = (?)) WHERE Timetables.timetableHourID = (?)', [classID, classID]);
  } catch (err) {
    console.log(err);
  }
}

export async function listTimeTable() {
  try {
    return dbConnection.executeQuery('SELECT * From Timetables ORDER BY hourStart ASC');
  } catch (err) {
    console.log(err);
    return -1;
  }
}

export async function userOwnClasses(teacherID) {
  try {
    return dbConnection.executeQuery('SELECT * From Classes WHERE Classes.classOwner = (?)', [teacherID]);
  } catch (err) {
    console.log(err);
    return -1;
  }
}

export async function userOwnTimeTable(teacherName) {
  try {
    return dbConnection.executeQuery('SELECT * From Timetables JOIN Classes ON Timetables.timetableHourID = Classes.classID WHERE Classes.classOwner = (?) ORDER BY hourStart ASC', [teacherName]);
  } catch (err) {
    console.log(err);
    return -1;
  }
}

export async function insertRequest(content, teacherName) {
  try {
    await dbConnection.executeQuery('INSERT INTO TeacherReqs (requestTeacher,  requestContent) VALUES (?, ?)', [teacherName.toString(), content.toString()]);
  } catch (err) {
    console.log(err);
  }
}

export async function listRequests() {
  try {
    return await dbConnection.executeQuery('SELECT * FROM TeacherReqs');
  } catch (err) {
    console.log(err);
    return -1;
  }
}
