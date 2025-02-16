const options = {
  year: "numeric" as "numeric",
  month: "short" as "short",
  day: "2-digit" as "2-digit",
};

const options2 = {
  year: "numeric" as "numeric",
  month: "short" as "short",
  day: "2-digit" as "2-digit",
  hour: "2-digit" as "2-digit",
  minute: "2-digit" as "2-digit",
  hour12: true, // Ensures AM/PM format
};

export const DateFormatter = (date: Date, includeTime = false) => {
  if (includeTime) {
    return new Intl.DateTimeFormat("en-US", options2).format(date);
  } else {
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }
};
