// Utility to compute YYYY-MM-DD for America/Los_Angeles (Pacific Time)
// Works in both server and client environments

export function getPacificDateString(baseDate = new Date()) {
  // Convert the provided date to Pacific Time by rendering to a localized string
  // and then constructing a Date from that string (which uses local time fields)
  const pacificLocal = new Date(
    baseDate.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );

  const year = pacificLocal.getFullYear();
  const month = String(pacificLocal.getMonth() + 1).padStart(2, "0");
  const day = String(pacificLocal.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


