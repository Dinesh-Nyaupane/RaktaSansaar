// Blood type compatibility map
const bloodTypeCompatibility = {
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
};

// Function to get compatible blood types for a given blood type
function getCompatibleBloodTypes(bloodType) {
  return bloodTypeCompatibility[bloodType] || [];
}

module.exports = getCompatibleBloodTypes;
