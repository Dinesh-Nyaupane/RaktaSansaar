const express = require('express');
const User = require('../models/User'); // Import the User model
const bloodTypeCompatibility = require('../utils/bloodTypeCompatibility'); // Import the bloodTypeCompatibility function
const router = express.Router();

// /search route to find compatible blood donors within a given range
router.post('/', async (req, res) => {
  const { latitude, longitude, bloodType, maxDistance = 50, k = 10 } = req.body; // Default maxDistance to 50 km, k to 10

  // Validate input data
  if (
    !latitude || !longitude || !bloodType ||
    typeof latitude !== 'number' || typeof longitude !== 'number' ||
    typeof maxDistance !== 'number' || typeof k !== 'number' ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || maxDistance <= 0 || k <= 0
  ) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    // Check if bloodType is valid
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    if (!validBloodTypes.includes(bloodType)) {
      return res.status(400).json({ message: 'Invalid blood type' });
    }

    // Get compatible blood types based on the recipient's blood type using the imported function
    const compatibleBloodTypes = bloodTypeCompatibility(bloodType);

    // Use MongoDB's $geoNear to find donors
    const donors = await User.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          maxDistance: maxDistance * 1000, // Convert km to meters
          query: { bloodType: { $in: compatibleBloodTypes } },
          spherical: true,
        },
      },
      { $limit: k }, // Limit to top k results
    ]);

    // Send response with the filtered donors
    res.status(200).json({ donors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
