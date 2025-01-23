import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/database";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import ratingAndReviewRoutes from "./routes/ratingAndReviews";
import categoryRoutes from "./routes/categoryRoutes";
import disputeRoutes from "./routes/disputeRoutes";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { cloudinaryConnect } from "./config/cloudinary";

config();
cloudinaryConnect();
dbConnect();

const app = express();

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

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/item", itemRoutes);
app.use("/api/v1/ratingAndReview", ratingAndReviewRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/dispute", disputeRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
