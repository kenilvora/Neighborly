import { FieldError, UseFormRegister } from "react-hook-form";
import { IconType } from "react-icons";

interface CustomInputProps {
  icon: IconType;
  type: "text" | "password" | "email" | "number";
  placeholder: string;
  register: UseFormRegister<any>;
  errors?: FieldError;
  name: string;
  id: string;
  required?: boolean;
  fullWidth?: boolean;
  tooltip?: string;
}

const CustomInput = ({
  icon: Icon,
  type,
  placeholder,
  register,
  errors,
  name,
  id,
  required = true,
  fullWidth = false,
  tooltip,
}: CustomInputProps) => {
  return (
    <div
      className={`flex relative flex-col gap-1
        ${fullWidth ? "w-full" : "w-[50%] max-[800px]:w-full"}
    `}
    >
      <div className="absolute text-lg top-[13px] left-3 text-neutral-500">
        <Icon />
      </div>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] outline-blue-500 pl-9"
        autoComplete="on"
        {...register(name, { required: required })}
        required={required}
      />
      {tooltip && (
        <div className="absolute -top-6 translate-y-1/2 right-2 text-xs bg-red-400 text-white px-4 py-1 rounded-full animate-pulse">
          {tooltip}
        </div>
      )}
      {errors && (
        <span className="text-neutral-800 text-sm font-medium opacity-70">
          Please enter your {name}
        </span>
      )}
    </div>
  );
};

export default CustomInput;
