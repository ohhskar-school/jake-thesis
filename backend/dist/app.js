"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const ROOMS = new Map();
app.get("/join", (req, res) => {
    res.json({ uuid: "test", order: "1" });
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
// Serve static files from NextJS
app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend/out")));
// AFTER defining routes: Anything that doesn't match what's above, send back index.html; (the beginning slash ('/') in the string is important!)
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname + "/../../frontend/out/index.html"));
});
