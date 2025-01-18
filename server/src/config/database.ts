import mongoose from "mongoose";

export default async function () {
  await mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => {
      console.log("Connected to database");
    })
    .catch((error) => {
      console.log("Error connecting to database", error);
    });
}
