import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

export const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_KEY,
      api_secret: process.env.CLOUD_SECRET,
    });
  } catch (err) {
    console.log(err);
  }
};
