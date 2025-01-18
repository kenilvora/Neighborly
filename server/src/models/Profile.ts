import mongoose from "mongoose";

interface IProfile extends mongoose.Document {
  profileImage: string;
  borrowItems: mongoose.Schema.Types.ObjectId[];
  lendItems: mongoose.Schema.Types.ObjectId[];
  upiId: string;
  upiIdVerified: boolean;
  accountBalance: number;
}

const profileSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      required: true,
      trim: true,
    },
    borrowItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    lendItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    upiId: {
      type: String,
      required: true,
      trim: true,
    },
    upiIdVerified: {
      type: Boolean,
      required: true,
    },
    accountBalance: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProfile>("Profile", profileSchema);
