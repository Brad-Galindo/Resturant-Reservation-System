function isPast(dateTimeString) {
  const now = new Date();

  // Parse the date string manually and treat it as UTC
  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];

  // Create a date object in UTC
  const dateToCheck = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Get the current time in UTC
  const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));

  console.log('Input string (UTC):', dateTimeString);
  console.log('Now (UTC):', nowUtc.toISOString());
  console.log('Date to check (UTC):', dateToCheck.toISOString());
  console.log('Is past?', dateToCheck < nowUtc);

  return dateToCheck < nowUtc;
}

module.exports = isPast;
