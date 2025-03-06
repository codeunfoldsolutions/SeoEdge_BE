export default function getFormattedDateTime(date: Date | string | undefined) {
  const formattedDate = Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    minute: "numeric",
    hour: "numeric",
  }).format(new Date(date!));

  return formattedDate;
}
