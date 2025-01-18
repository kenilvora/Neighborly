import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/database";
import cors from "cors";
import userRoutes from "./routes/userRoutes";

config();
// dbConnect();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/v1/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
