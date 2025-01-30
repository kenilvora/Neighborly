import Select from "react-select";

interface CustomDropdownProps {
  data: any;
  label: string;
  fn: any;
  value: string;
  name: string;
}

const CustomDropdown = ({
  data,
  label,
  fn,
  value,
  name,
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
      className="w-[290px] max-w-[290px]"
    />
  );
};

export default CustomDropdown;
