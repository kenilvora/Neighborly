import mongoose from "mongoose";

interface ITag extends mongoose.Document {
  name: string;
  itemCount: number;
  items: mongoose.Schema.Types.ObjectId[];
}

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    itemCount: {
      type: Number,
      required: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITag>("Tag", tagSchema);
