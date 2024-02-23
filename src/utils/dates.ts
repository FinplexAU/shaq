export const dateString = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth().toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
