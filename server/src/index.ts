import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/database";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import ratingAndReviewRoutes from "./routes/ratingAndReviewsRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import disputeRoutes from "./routes/disputeRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { cloudinaryConnect } from "./config/cloudinary";
import { WebSocket, WebSocketServer } from "ws";
import clients from "./connections";

config();
cloudinaryConnect();
dbConnect();

const app = express();

let httpServer;

app.use(express.json());

app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

interface SocketWithUID extends WebSocket {
  userId?: string;
}

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/item", itemRoutes);
app.use("/api/v1/ratingAndReview", ratingAndReviewRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/dispute", disputeRoutes);
app.use("/api/v1/transaction", transactionRoutes);

async function startServer() {
  try {
    httpServer = app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });

    const wss = new WebSocketServer({ server: httpServer });

    wss.on("connection", function connection(socket: SocketWithUID) {
      socket.on("error", console.error);

      socket.send("Connected to WebSocket Server");

      socket.on("message", function message(data: string, isBinary: boolean) {
        const parsedData = JSON.parse(data);

        if (parsedData.type && parsedData.type === "payment_notification") {
          socket.userId = parsedData.userId;
          clients.set(parsedData.userId, socket);

          socket.send("Subscribed to payment notifications");
        }
      });

      socket.on("close", function close() {
        if (socket.userId) {
          clients.delete(socket.userId);
        }
      });
    });

    app.get("/", (req, res) => {
      res.json("Server is Healthy and Running");
    });
  } catch (error) {
    console.log(error);
  }
}

startServer();
