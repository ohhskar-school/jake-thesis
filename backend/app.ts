 import express from "express";

 import dotenv from "dotenv";
 import path from "path";

 dotenv.config();

 const app = express();
 const port = process.env.PORT;

const ROOMS = new Map();

 app.get("/join", (req, res) => {
   res.json({ uuid: "test", order: "1" });
 });

 app.listen(port, () => {
   console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
 });

 // Serve static files from NextJS
 app.use(express.static(path.join(__dirname, "../../frontend/out")));

 // AFTER defining routes: Anything that doesn't match what's above, send back index.html; (the beginning slash ('/') in the string is important!)
 app.get("*", (req, res) => {
   res.sendFile(path.join(__dirname + "/../../frontend/out/index.html"));
 });
