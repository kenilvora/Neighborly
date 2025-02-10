const options = {
  year: "numeric" as "numeric",
  month: "short" as "short",
  day: "2-digit" as "2-digit",
};

export const DateFormatter = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", options).format(date);
};
