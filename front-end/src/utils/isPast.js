function isPast(dateTimeString) {
    const now = new Date();
  
    // Parse the date string manually
    const [datePart, timePart] = dateTimeString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
  
    // Create a date object in local time
    const dateToCheck = new Date(year, month - 1, day, hour, minute);
  
    console.log('Input string:', dateTimeString);
    console.log('Now (Local):', now.toString());
    console.log('Date to check (Local):', dateToCheck.toString());
    console.log('Is past?', dateToCheck < now);
  
    return dateToCheck < now;
  }
  

  
  module.exports = isPast ;
  