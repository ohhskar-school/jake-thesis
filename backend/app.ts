import express from "express";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import type { Request } from "express";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const apiRouter = express.Router();
const port = process.env.PORT;

app.use(express.json());

// Store all rooms in a map. Keyed by a UUID. Each item in the boolean array
// represents one user. If the boolean is true, then it means that the user has
// already preloaded the video
const ROOMS = new Map<string, boolean[]>();

// Join a room
apiRouter.post("/join", (req: Request<{}, {}, { roomUUID: string | null }>, res) => {
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
  const uuid = uuidv4();

  // Create a new room in the map
  ROOMS.set(uuid, [false]);

  // Send UUID and order to client
  res.status(201).json({ roomUUID: uuid, order: 0 });
});

apiRouter.post("/end", (req: Request<{}, {}, { roomUUID: string }>, res) => {
  const roomUUID = req.body.roomUUID;

  if (!roomUUID) {
    return res.sendStatus(401);
  }

  ROOMS.delete(roomUUID);
});

app.use("/api", apiRouter);

io.on("connection", (socket) => {
  socket.on("create", ({ roomUUID }: { roomUUID: string }) => {
    socket.join(roomUUID);
  });

  socket.on("complete-preload", ({ roomUUID, order: orderString }: { roomUUID: string; order: string }) => {
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
app.use(express.static(path.join(__dirname, "../../frontend/out")));

app.get("/play", (req, res) => {
  res.sendFile(path.join(__dirname + "/../../frontend/out/play.html"));
});

app.get("/join", (req, res) => {
  res.sendFile(path.join(__dirname + "/../../frontend/out/join.html"));
});

// AFTER defining routes: Anything that doesn't match what's above, send back index.html; (the beginning slash ('/') in the string is important!)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/../../frontend/out/index.html"));
});

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
