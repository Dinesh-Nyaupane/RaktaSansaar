# Rakta Sansaar

**Rakta Sansaar** is a geolocation-based Blood Donation Management System developed as a college project. It aims to facilitate timely and efficient blood donation by connecting donors and recipients based on their blood group compatibility and geographical proximity.

---

## Overview

Blood donation is a critical healthcare need, and finding the right donor quickly can save lives. Rakta Sansaar leverages modern web technologies and geolocation algorithms to streamline this process. The system allows users to register as donors or recipients, provides real-time matching based on location, and manages user data securely.

---

## Features

- **User Registration & Authentication:**  
  Secure signup and login for donors and recipients, ensuring privacy and data security.

- **Geolocation-Based Matching:**  
  Uses the **Haversine formula** to calculate the distance between users based on their latitude and longitude. The **K-Nearest Neighbors (KNN) algorithm** ranks potential donors by proximity, helping recipients find the closest matches quickly.

- **Blood Group Management:**  
  Matches donors and recipients by compatible blood types to ensure safe and effective transfusions.

- **Responsive Frontend:**  
  Developed with **React.js** and **Tailwind CSS**, the frontend provides a clean, intuitive, and mobile-friendly user experience.

- **RESTful Backend APIs:**  
  Built with **Node.js** and **Express.js**, the backend handles user management, data storage, and complex matching logic. Data is stored in **MongoDB** for flexible and scalable document management.

---

## Technology Stack

| Layer          | Technology           |
|----------------|----------------------|
| Frontend       | React.js, Tailwind CSS |
| Backend        | Node.js, Express.js   |
| Database       | MongoDB               |
| Geolocation    | Haversine formula, KNN algorithm |

---

## How It Works

1. **User Registration:**  
   Users sign up by providing personal information, blood group, and location coordinates (latitude and longitude).

2. **Data Storage:**  
   All user data is securely stored in MongoDB collections.

3. **Matching Process:**  
   When a recipient requests blood, the system:
   - Uses the Haversine formula to calculate distances between the recipient and all registered donors.
   - Applies the KNN algorithm to find the closest donors with compatible blood types.
   - Returns a ranked list of potential donors based on proximity.

4. **Frontend Interaction:**  
   The React frontend fetches matching results via RESTful APIs and displays them in a user-friendly dashboard, allowing recipients to contact donors easily.

---

## My Contributions

- Developed responsive frontend components with **React.js** and **Tailwind CSS** to ensure accessibility and smooth user interactions across devices.
- Designed and implemented RESTful APIs using **Node.js** and **Express.js** to handle all backend operations including user authentication, data management, and donor matching.
- Integrated geolocation-based matching using the **Haversine formula** combined with the **KNN algorithm** for accurate and efficient proximity searches.
- Ensured seamless communication between frontend and backend to provide real-time matching and updates.

---

## Future Enhancements

- Integration of notification systems (email/SMS) to alert donors and recipients.
- Advanced filtering options such as donor availability and health status.
- Mobile app version for wider accessibility.

---

## Installation & Usage

*(You can add detailed instructions here if you want to share this project with others.)*

---

## License

*(Specify your license if applicable.)*

---

Thank you for checking out **Rakta Sansaar**!  
Contributions and feedback are welcome.

