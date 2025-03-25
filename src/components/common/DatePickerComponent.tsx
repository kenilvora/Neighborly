import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

export default function DatePickerComponent({
  date,
  setDate,
  label,
  minDate,
}: {
  date: Dayjs;
  setDate: (date: Dayjs) => void;
  label: string;
  minDate?: Dayjs;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DatePicker"]}>
        <DatePicker
          defaultValue={dayjs("2025-02-10")}
          value={date}
          onChange={(newValue) => setDate(newValue!)}
          className="w-full"
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              sx: {
                paddingY: 0,
                "& .MuiInputBase-input": {
                  paddingY: "10.3px",
                },
              },
              required: true,
            },
          }}
          showDaysOutsideCurrentMonth={true}
          label={label}
          minDate={minDate}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
