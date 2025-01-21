import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";

type Options = {
  folder: string;
  height?: number;
  quality?: number;
  resource_type?: "auto" | "image" | "raw" | "video";
};

export const uploadFileToCloudinary = async (
  file: UploadedFile,
  folder: string,
  height?: number,
  quality?: number
) => {
  try {
    const options = { folder } as Options;

    if (height) {
      options.height = height;
    }

    if (quality) {
      options.quality = quality;
    }

    options.resource_type = "auto";

    const res = await cloudinary.uploader.upload(file.tempFilePath, options);

    return res;
  } catch (err) {
    throw new Error("Error uploading file to Cloudinary");
  }
};
