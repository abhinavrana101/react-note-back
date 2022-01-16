const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const Dbase = require("./Classes/Dbase");
const db = new Dbase();
const cors = require("cors");

const APP_PORT = 3001;
const APP_HOST = "localhost";
const DB_HOST = "localhost";
const DB_PORT = 3307;
const DB_USER = "root";
const DB_PASS = "root";
const DB_NAME = "notes";
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});
// Routes
app.get("/getAllFolders", async (req, res) => {
  const result = await db.fetchAll(`SELECT * FROM folder`);
  return res.json({ data: result });
});
app.get("/addFolder", async (req, res) => {
  const folder_name = req.query.folder_name;
  await db.prepareInsert({ folder_name });
  const result = await db.insert("folder");
  if (result) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

app.get("/updateFolder", async (req, res) => {
  const folder_name = req.query.folder_name;
  const id = req.query.id;
  await db.prepareUpdate({ folder_name }, { id });
  const result = await db.update("folder");
  if (result) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

app.get("/deleteFolder", async (req, res) => {
  const id = req.query.id;
  const result = await db.query(`DELETE FROM folder WHERE id = ${id}`);
  if (result) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

app.get("/getAllNotesByFolder", async (req, res) => {
  const folder_id = req.query.id;
  const result = await db.fetchAll(
    `SELECT * FROM notes WHERE folder_id =${folder_id}`
  );
  return res.json({ data: result });
});

app.post("/addNote", async (req, res) => {
  const data = req.body.newNote;
  await db.prepareInsert({
    folder_id: data.folder_id,
    content: data.content,
    time: data.time,
  });
  const result = await db.insert("notes");
  if (result) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

app.get("/deleteNote", async (req, res) => {
  const id = req.query.id;
  const result = await db.query(`DELETE FROM notes WHERE id = ${id}`);
  if (result) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

app.post("/updateNote", async (req, res) => {
  const data = req.body.note;
  await db.prepareUpdate({ id:data.id,content:data.content,time:data.time}, { id:data.id });
  const result = await db.update("notes");
  if (result) {
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

app.listen(APP_PORT, APP_HOST, () => {
  console.log(`server is running at http://${APP_HOST}:${APP_PORT}`);
});
