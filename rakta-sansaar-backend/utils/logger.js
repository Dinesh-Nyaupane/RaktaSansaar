const fs = require('fs');
const path = require('path');

// Define log file location
const logFilePath = path.join(__dirname, 'logs', 'app.log');

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath));
}

// Log function to log messages to a file
function log(message, level = 'info') {
  const logMessage = `${new Date().toISOString()} - ${level.toUpperCase()}: ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
}

module.exports = log;
