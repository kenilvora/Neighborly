const MoneyFormatter = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(amount);
};

export default MoneyFormatter;
