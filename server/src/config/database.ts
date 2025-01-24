import mongoose from "mongoose";
import { config } from "dotenv";

config();

export default async function dbConnect() {
  await mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
      console.log("Connected to database");
    })
    .catch((error) => {
      console.log("Error connecting to database", error);
    });
}
