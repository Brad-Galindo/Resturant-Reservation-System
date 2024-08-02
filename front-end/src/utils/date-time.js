const dateFormat = /\d\d\d\d-\d\d-\d\d/;
const timeFormat = /\d\d:\d\d/;

/**
 * Formats a Date object as YYYY-MM-DD.
 *
 * This function is *not* exported because the UI should generally avoid working directly with Date instance.
 * You may export this function if you need it.
 *
 * @param date
 *  an instance of a date object
 * @returns {string}
 *  the specified Date formatted as YYYY-MM-DD
 */
function asDateString(date) {
  return `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${date.getDate().toString(10).padStart(2, "0")}`;
}


/**
 * Checks if the given date is a Tuesday.
 * @param dateString
 *  a date string in YYYY-MM-DD format
 * @returns {boolean}
 *  true if the date is a Tuesday, false otherwise
 */
export function isTuesday(dateString) {
  const date = new Date(dateString);
  return date.getUTCDay() === 2; // 0 is Sunday, 1 is Monday, 2 Tuesday, etc.
}


/**
 * Checks if the given date is in the past.
 * @param dateString
 *  a date string in YYYY-MM-DD format
 * @returns {boolean}
 *  true if the date is in the past, false otherwise
 */
export function isPast(dateTimeString) {
  const now = new Date();

  // Convert 'now' to UTC
  const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() 6000);
  
  // Parse the date string manually
  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
  
  // Create a date object in local time
  const dateToCheck = new Date(Date.UTC(year, month - 1, day, hour, minute));

  console.log('Input string:', dateTimeString);
  console.log('Now (UTC):', now.toUTCString());
  console.log('Date to check (Local):', dateToCheck.toUTCString());
  console.log('Is past?', dateToCheck <= now);
  
  return dateToCheck <= now;
}












/**
 * Format a date string in ISO-8601 format (which is what is returned from PostgreSQL) as YYYY-MM-DD.
 * @param dateString
 *  ISO-8601 date string
 * @returns {*}
 *  the specified date string formatted as YYYY-MM-DD
 */
export function formatAsDate(dateString) {
  return dateString.match(dateFormat)[0];
}

/**
 * Format a time string in HH:MM:SS format (which is what is returned from PostgreSQL) as HH:MM.
 * @param timeString
 *  HH:MM:SS time string
 * @returns {*}
 *  the specified time string formatted as YHH:MM.
 */
export function formatAsTime(timeString) {
  return timeString.match(timeFormat)[0];
}

/**
 * Today's date as YYYY-MM-DD.
 * @returns {*}
 *  the today's date formatted as YYYY-MM-DD
 */
export function today() {
  return asDateString(new Date());
}

/**
 * Subtracts one day to the specified date and return it in as YYYY-MM-DD.
 * @param currentDate
 *  a date string in YYYY-MM-DD format (this is also ISO-8601 format)
 * @returns {*}
 *  the date one day prior to currentDate, formatted as YYYY-MM-DD
 */
export function previous(currentDate) {
  let [ year, month, day ] = currentDate.split("-");
  month -= 1;
  const date = new Date(year, month, day);
  date.setMonth(date.getMonth());
  date.setDate(date.getDate() - 1);
  return asDateString(date);
}

/**
 * Adds one day to the specified date and return it in as YYYY-MM-DD.
 * @param currentDate
 *  a date string in YYYY-MM-DD format (this is also ISO-8601 format)
 * @returns {*}
 *  the date one day after currentDate, formatted as YYYY-MM-DD
 */
export function next(currentDate) {
  let [ year, month, day ] = currentDate.split("-");
  month -= 1;
  const date = new Date(year, month, day);
  date.setMonth(date.getMonth());
  date.setDate(date.getDate() + 1);
  return asDateString(date);
}
