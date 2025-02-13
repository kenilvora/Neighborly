import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { FaCloudUploadAlt } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

const DropZone = ({
  setImages,
  isSubmit,
}: {
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  isSubmit?: boolean;
}) => {
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("Accepted Files Length : ", acceptedFiles.length);
      console.log("Preview Images Length : ", previewImages.length);

      if (acceptedFiles.length + previewImages.length > 5) {
        toast.error("You can only upload 5 images at a time");
        return;
      }
      console.log(acceptedFiles);
      if (acceptedFiles.length > 0) {
        setImages((prev) => [...prev, ...acceptedFiles]);
        const images = acceptedFiles.map((file) => URL.createObjectURL(file));

        setPreviewImages((prev) => [...prev, ...images]);
      } else {
        toast.error("Please upload a valid image file");
      }
    },
    [previewImages, setImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
  });

  const removePreviewImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (isSubmit) {
      setPreviewImages([]);
    }
  }, [isSubmit]);

  return (
    <>
      <div
        {...getRootProps()}
        className={`w-full border-2 shadow-md py-3 flex min-h-[200px] text-center justify-center items-center rounded-lg cursor-pointer
            ${isDragActive ? "border-blue-500" : "border-neutral-300"}
          `}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-xl text-neutral-500">Drop the files here ...</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FaCloudUploadAlt className="text-[80px] text-neutral-500" />
            <p className="text-xl text-neutral-500">
              Drag 'n' drop some files here, or click to select files
            </p>
          </div>
        )}
      </div>

      {previewImages && previewImages.length > 0 && (
        <div className="flex items-center mt-2 gap-2 flex-wrap justify-between">
          {previewImages.map((img, i: number) => (
            <div
              className="flex items-center justify-center hover:bg-neutral-100 hover:scale-110 cursor-pointer gap-1 min-w-[160px] relative w-1/6 p-3 rounded-md aspect-square transition-all duration-300 ease-in-out"
              key={i}
            >
              <img
                src={img}
                alt={`Preview Image ${i + 1}`}
                className="object-cover rounded-md"
              />
              <RxCross2
                className="hover:cursor-pointer absolute top-0 right-0 text-2xl text-neutral-900 font-extrabold"
                onClick={(e) => removePreviewImage(e, i)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DropZone;
