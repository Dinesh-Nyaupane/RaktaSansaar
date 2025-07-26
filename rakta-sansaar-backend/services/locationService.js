const haversine = require('../utils/haversine');

// Function to calculate the distance between two geographical points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  return haversine(lat1, lon1, lat2, lon2); // Use the haversine formula to calculate distance
};

module.exports = { calculateDistance };
