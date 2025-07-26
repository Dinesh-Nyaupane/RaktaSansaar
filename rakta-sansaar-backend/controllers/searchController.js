const express = require('express');
const User = require('../models/User');
const getCompatibleBloodTypes = require('../utils/bloodTypeCompatibility');
const haversine = require('../utils/haversine');  // Import the Haversine function
const router = express.Router();

router.post('/', async (req, res) => {
  const { latitude, longitude, bloodType, maxDistance = 50, count = 10 } = req.body;

  // Normalize blood type to uppercase to handle case mismatches
  const normalizedBloodType = bloodType.toUpperCase();

  // Parse numeric values
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const maxDist = parseFloat(maxDistance);
  const cnt = parseInt(count);

  // Validate input data
  const errors = [];
  if (isNaN(lat)) errors.push('Invalid latitude');
  if (isNaN(lon)) errors.push('Invalid longitude');
  if (isNaN(maxDist)) errors.push('Invalid maxDistance');
  if (isNaN(cnt)) errors.push('Invalid count');
  if (!bloodType) errors.push('bloodType is required');

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  try {
    // Validate blood type
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    if (!validBloodTypes.includes(normalizedBloodType)) {
      return res.status(400).json({ message: 'Invalid blood type' });
    }

    // Get compatible blood types
    const compatibleBloodTypes = getCompatibleBloodTypes(normalizedBloodType);

    // Log for debugging
    console.log('Requested Blood Type:', normalizedBloodType);
    console.log('Compatible Blood Types:', compatibleBloodTypes);

    // Get all donors (you can add pagination here if needed)
    const donors = await User.find({
      bloodType: { $in: compatibleBloodTypes },
      role: 'donor',
      verified: true,
    });

    // Log to check the found donors
    console.log('Donors Found:', donors);

    // Calculate distance using Haversine formula
    const validDonors = donors
      .map((donor) => {
        const donorLat = donor.location.coordinates[1];  // latitude
        const donorLon = donor.location.coordinates[0];  // longitude
        const distance = haversine(lat, lon, donorLat, donorLon);

        // Attach the calculated distance to the donor object
        return { ...donor.toObject(), distance };
      })
      .filter((donor) => donor.distance <= maxDist)  // Filter by max distance
      .slice(0, cnt);  // Limit to the requested number of donors

    // Return the donors with the appropriate distance
    res.status(200).json({
      count: validDonors.length,
      maxDistance: maxDist,
      donors: validDonors.map((donor) => ({
        ...donor,
        distance: donor.distance.toFixed(2) + ' km', // Convert distance to km
      })),
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : null,
    });
  }
});

module.exports = router;
