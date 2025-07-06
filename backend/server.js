import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Import all route files
import adminRoute from "./routes/api/adminRoute.js"; // Corrected path based on your provided file
import authRoute from "./routes/api/authRoute.js"; // Corrected path based on your provided file
import cartRoute from "./routes/cartRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import regionRoute from "./routes/regionRoute.js"; // Corrected path based on your provided file
import orderRoute from "./routes/orderRoute.js";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/api/userRoute.js"; // Corrected path based on your provided file
import dashboardRouter from "./routes/dashboardRoute.js";
import reviewRoute from "./routes/reviewRoute.js";


const app = express();
const port = process.env.PORT || 4000;

// Connect to Database and Cloudinary
connectDB().catch((err) => {
  console.error("Database connection failed", err);
  process.exit(1);
});
connectCloudinary();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Handle form-data
app.use(bodyParser.json());
// app.use(cors());
app.use(morgan("dev"));

const allowedOrigins = [
  'http://localhost:3000', // Port default React/Vite
  'http://localhost:5173', // Port default Vite
  'https://9adf-110-138-92-3.ngrok-free.app', // URL ngrok frontend Vite Anda (HARUS YANG AKTIF SAAT INI)

  // Tambahkan URL ngrok frontend Anda yang lain jika ada
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Izinkan permintaan tanpa origin (misal Postman)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Penting jika Anda menggunakan cookie atau sesi
}));

// API Endpoints
// Note: Some of your route files are inside 'routes/api', so the base path should reflect that.
app.use("/api/admin", adminRoute);
app.use("/api/auth", authRoute); // For admin login as per your authRoute
app.use("/api/cart", cartRoute);
app.use("/api/categories", categoryRoute); // As defined in categoryRoute.js comments
app.use("/api/order", orderRoute); // As defined in orderRoute.js comments
app.use("/api/product", productRoute); // As defined in productRoute.js comments
app.use("/api/user", userRoute);
app.use('/api/wilayah', regionRoute); 
app.use('/api/dashboard', dashboardRouter); 
app.use('/api/reviews', reviewRoute); 

// Root Route
app.get("/", (req, res) => {
  res.send("API successfully connected");
});


// Start Server
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));