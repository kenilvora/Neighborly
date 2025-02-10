import Select from "react-select";

interface CustomDropdownProps {
  data: any;
  label: string;
  fn: any;
  value: string;
  name: string;
  required?: boolean;
}

const CustomDropdown = ({
  data,
  label,
  fn,
  value,
  name,
  required = false,
}: CustomDropdownProps) => {
  const customStyles = {
    control: (base: any) => ({
      ...base,
      padding: "3px", // Padding inside the control (selected value area)
      cursor: "pointer",
    }),
    menu: (base: any) => ({
      ...base,
      padding: "6px", // Padding inside the dropdown menu
      zIndex: 10,
    }),
    option: (base: any) => ({
      ...base,
      padding: "12px 12px", // Padding for each option
      cursor: "pointer",
    }),
  };

  interface Option {
    value: string;
    label: string;
  }

  return (
    <Select
      value={data.find((option: Option) => option.value === value) || null}
      name={label}
      options={data}
      placeholder={`${label}`}
      styles={customStyles}
      onChange={(selectedOption: any) =>
        fn((prev: any) => ({
          ...prev,
          [name]: selectedOption.value || "",
        }))
      }
      required={required}
      className="w-full"
    />
  );
};

export default CustomDropdown;
