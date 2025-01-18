import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/database";

config();
dbConnect();

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
