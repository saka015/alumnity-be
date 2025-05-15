require("dotenv").config();
const { server } = require("./app");
const connectDB = require("./config/db");

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});