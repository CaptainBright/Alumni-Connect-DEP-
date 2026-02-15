require('dotenv').config();
const app = require('./src/app');

// MacOS AirPlay Receiver uses port 5000, so we use 5001 to avoid conflicts
const PORT = process.env.PORT || 5001;

// Start Server (No MongoDB connection needed)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
