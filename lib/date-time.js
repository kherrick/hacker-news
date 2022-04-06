const pad = (n) => (n < 10 ? "0" + n : n);
const getYear = (dateTime) => Number(dateTime.slice(0, 4));
const getMonth = (dateTime) => Number(dateTime.slice(5, 7));
const getDay = (dateTime) => Number(dateTime.slice(8, 10));
const getDate = (dateTime) =>
  (dateTime ? new Date(dateTime.slice(0, 10)) : new Date())
    .toISOString()
    .split("T")[0];

const getDateString = (currentDate, dayChange = 0) => {
  const date = new Date(currentDate);
  date.setDate(date.getDate() + dayChange);
  const dateString = date.toISOString();

  return `${getYear(dateString)}-${pad(getMonth(dateString))}-${pad(
    getDay(dateString)
  )} @ 23:59:59`;
};

export const getNextDateTime = (currentDate, dayChange = 0) =>
  getDateString(getDate(currentDate), dayChange);
