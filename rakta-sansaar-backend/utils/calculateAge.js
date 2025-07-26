const moment = require('moment');

/**
 * Calculates the age based on the provided date of birth.
 * @param {Date} dob - The date of birth of the user.
 * @returns {number} - The calculated age in years (with decimals for more precision).
 */
function calculateAge(dob) {
  const birthDate = moment(dob); // Parse the provided DOB
  const today = moment(); // Current date
  const years = today.diff(birthDate, 'years'); // Get the years difference
  const months = today.diff(birthDate, 'months') % 12; // Get the remaining months
  const days = today.diff(birthDate, 'days') % 30; // Get the remaining days
  const decimalAge = years + (months / 12) + (days / 365); // Calculate decimal age
  
  return parseFloat(decimalAge.toFixed(2)); // Return the age with 2 decimal points
}

module.exports = calculateAge;
