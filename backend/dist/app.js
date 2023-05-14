"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const apiRouter = express_1.default.Router();
const port = process.env.PORT;
app.use(express_1.default.json());
// Store all rooms in a map. Keyed by a UUID. Each item in the boolean array
// represents one user. If the boolean is true, then it means that the user has
// already preloaded the video
const ROOMS = new Map();
// Join a room
apiRouter.post("/join", (req, res) => {
    const roomUUID = req.body.roomUUID;
    // If roomUUID was set, this is a request to join an already existing room
    if (roomUUID) {
        // Get current members of the room
        const room = ROOMS.get(roomUUID);
        // If room does not exist, send error
        if (!room) {
            return res.sendStatus(404);
        }
        // Get order of newly joined user. This is the current length of the
        // members.
        const order = room.length;
        const newRoom = [...room, false];
        // Add member to room
        ROOMS.set(roomUUID, newRoom);
        // Send UUID and order to client
        return res.status(201).json({ roomUUID: roomUUID, order });
    }
    // If no roomUUID was sent, this is a request to create a new room
    // Generate UUID
    const uuid = (0, uuid_1.v4)();
    // Create a new room in the map
    ROOMS.set(uuid, [false]);
    // Send UUID and order to client
    res.status(201).json({ roomUUID: uuid, order: 0 });
});
apiRouter.post("/end", (req, res) => {
    const roomUUID = req.body.roomUUID;
    if (!roomUUID) {
        return res.sendStatus(401);
    }
    ROOMS.delete(roomUUID);
});
app.use("/api", apiRouter);
io.on("connection", (socket) => {
    socket.on("create", ({ roomUUID }) => {
        socket.join(roomUUID);
    });
    socket.on("complete-preload", ({ roomUUID, order: orderString }) => {
        const order = Number(orderString);
        if (!roomUUID || order === undefined || order === null) {
            socket.emit("complete-preload-error", { error: "Incomplete parameters" });
            return;
        }
        const room = ROOMS.get(roomUUID);
        if (!room) {
            socket.emit("complete-preload-error", { error: "Room not found" });
            return;
        }
        const newRoom = [...room];
        newRoom[order] = true;
        // Set new room
        ROOMS.set(roomUUID, newRoom);
        if (newRoom.length >= 3 && !newRoom.some((memberHasLoaded) => !memberHasLoaded)) {
            io.to(roomUUID).emit("start-video");
        }
    });
});
// Serve static files from NextJS
app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend/out")));
app.get("/play", (req, res) => {
    res.sendFile(path_1.default.join(__dirname + "/../../frontend/out/play.html"));
});
app.get("/join", (req, res) => {
    res.sendFile(path_1.default.join(__dirname + "/../../frontend/out/join.html"));
});
// AFTER defining routes: Anything that doesn't match what's above, send back index.html; (the beginning slash ('/') in the string is important!)
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname + "/../../frontend/out/index.html"));
});
server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
