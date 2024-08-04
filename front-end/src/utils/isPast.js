function isPast(dateTimeString) {

  // Get the current time in UTC
  const now = new Date();

  // Parse the input date string
  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];

  // Create a date object in local
  const dateToCheck = new Date(year, month - 1, day, hour, minute);


  return dateToCheck < now;
}

module.exports = isPast;

