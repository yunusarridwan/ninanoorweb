# Ninanoor Bakeshop: An E-commerce Platform for Baked Goods

This repository contains the full-stack implementation of "Ninanoor Bakeshop," a modern e-commerce application designed for selling various baked goods. The platform includes a user-facing storefront for Browse products, placing orders, and leaving reviews, as well as an administrative dashboard for managing products, categories, orders, users, and reviews.

## Table of Contents

1.  [Description](https://www.google.com/search?q=%23description)
2.  [Features](https://www.google.com/search?q=%23features)
3.  [Technologies Used](https://www.google.com/search?q=%23technologies-used)
4.  [Installation & Setup](https://www.google.com/search?q=%23installation--setup)
      * [Prerequisites](https://www.google.com/search?q=%23prerequisites)
      * [Backend Setup](https://www.google.com/search?q=%23backend-setup)
      * [Frontend Setup](https://www.google.com/search?q=%23frontend-setup)
5.  [Usage](https://www.google.com/search?q=%23usage)
      * [User Flow](https://www.google.com/search?q=%23user-flow)
      * [Admin Flow](https://www.google.com/search?q=%23admin-flow)
6.  [API Endpoints](https://www.google.com/search?q=%23api-endpoints)
7.  [Folder Structure](https://www.google.com/search?q=%23folder-structure)
8.  [Contributing](https://www.google.com/search?q=%23contributing)
9.  [License](https://www.google.com/search?q=%23license)
10. [Contact](https://www.google.com/search?q=%23contact)

## Description

Ninanoor Bakeshop is a robust e-commerce solution built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides a seamless shopping experience for customers and a comprehensive management interface for administrators. The application incorporates secure authentication, dynamic cart management, integrated payment gateway (Midtrans), and real-time shipping cost calculation.

## Features

### User-facing Frontend

  * **Product Catalog:** Browse a wide range of baked goods with detailed descriptions, images, and multiple size/price options.
  * **Search & Filter:** Easily find products using search functionality and filter by categories.
  * **Shopping Cart:** Add, update quantities, and remove items from the cart dynamically.
  * **Secure Checkout:** A guided checkout process with shipping information input, real-time shipping cost calculation, and integration with Midtrans Snap for various payment methods.
  * **Order History:** View past orders and their detailed status.
  * **Product Reviews:** Submit ratings and comments for purchased products, with review moderation by administrators.
  * **User Authentication:** Secure user registration, login, and password management (forgot/reset password).
  * **Responsive Design:** Optimized for a seamless experience across various devices.

### Admin Dashboard

  * **Dashboard Overview:** Get a quick summary of total products, categories, customers, and sales.
  * **Product Management:** Add, view, edit, and manage product details including names, descriptions, images, prices per size, and popularity status.
  * **Category Management:** Create, view, and update product categories with associated images.
  * **Order Management:** View all customer orders, track their status, and update order progression (e.g., "Diproses", "Dikirim", "Selesai").
  * **User Management:** View a list of registered customers with their order counts.
  * **Admin Management:** (Superadmin only) Add, view, and update other admin accounts.
  * **Review Moderation:** Approve or reject user reviews before they are publicly displayed on product pages.
  * **Invoice Management:** View all generated invoices and generate printable reports for specific periods.
  * **Theme Toggle:** Switch between light and dark modes for comfortable viewing.

## Technologies Used

### Frontend

  * **React.js:** A JavaScript library for building user interfaces.
  * **Vite:** A fast build tool for modern web projects.
  * **React Router DOM:** For declarative routing within the application.
  * **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
  * **Flowbite-React:** A component library based on Flowbite and Tailwind CSS for React.
  * **Axios:** A promise-based HTTP client for making API requests.
  * **React Icons:** A collection of popular SVG icons.
  * **React Simple Star Rating:** For interactive star rating components.
  * **Swiper:** A modern touch slider.
  * **Headless UI:** Unstyled, accessible UI components.
  * **Lodash:** A utility library providing helper functions.
  * **React Toastify:** For elegant toast notifications.

### Backend

  * **Node.js:** A JavaScript runtime environment.
  * **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
  * **MongoDB:** A NoSQL database for storing application data.
  * **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
  * **Cloudinary:** Cloud-based image and video management service for storing product and category images.
  * **JSON Web Tokens (JWT):** For secure user and admin authentication.
  * **Bcrypt.js:** For hashing and salting passwords securely.
  * **Nodemailer:** For sending automated emails, such as invoices.
  * **Midtrans:** A payment gateway for processing online payments (Snap API used).
  * **Axios:** For making HTTP requests to external APIs (e.g., Midtrans, regional data).
  * **Multer:** Node.js middleware for handling `multipart/form-data`, primarily used for file uploads.
  * **Moment.js:** A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
  * **Validator.js:** A library of string validators and sanitizers.
  * **Morgan:** HTTP request logger middleware for Node.js.

### Deployment

  * **Vercel:** Used for frontend and backend deployment.

## Installation & Setup

To get a local copy up and running, follow these simple steps.

### Prerequisites

  * Node.js (v18 or higher recommended)
  * npm (or yarn)
  * MongoDB Atlas account (or local MongoDB instance)
  * Cloudinary account
  * Midtrans account (for payment gateway integration)
  * RajaOngkir account (or a similar service for shipping cost calculation like `rajaongkir.komerce.id`)
  * Wilayah.id access (for Indonesian regional data, used in conjunction with shipping)

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://www.github.com/yunusarridwan/ninanoorweb.git
    cd ninanoorweb/backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the `backend` directory and add your environment variables:
    ```dotenv
    PORT=4000
    MONGODB_URI="YOUR_MONGODB_CONNECTION_STRING"
    JWT_SECRET="YOUR_JWT_SECRET_KEY"
    CLDN_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
    CLDN_API_KEY="YOUR_CLOUDINARY_API_KEY"
    CLDN_API_SECRET="YOUR_CLOUDINARY_API_SECRET"
    MIDTRANS_SERVER_KEY="YOUR_MIDTRANS_SERVER_KEY"
    MIDTRANS_CLIENT_KEY="YOUR_MIDTRANS_CLIENT_KEY"
    EMAIL_USER="YOUR_NODEMAILER_EMAIL"
    EMAIL_PASS="YOUR_NODEMAILER_APP_PASSWORD" # Use App Password for Gmail
    RAJAONGKIR_API_KEY="YOUR_RAJAONGKIR_API_KEY" # Used by rajaongkir.komerce.id
    RAJAONGKIR_KOMERCE_BASE_URL="https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost" # Or your chosen RajaOngkir API endpoint
    FRONTEND_URL="http://localhost:5173" # Or your deployed frontend URL
    ```
      * Replace placeholders with your actual credentials.
      * `MONGODB_URI`: Get this from your MongoDB Atlas dashboard.
      * `JWT_SECRET`: Generate a strong, random string.
      * `CLDN_*`: Get these from your Cloudinary dashboard.
      * `MIDTRANS_*`: Get these from your Midtrans dashboard. Use sandbox keys for development.
      * `EMAIL_USER` and `EMAIL_PASS`: For Nodemailer to send emails (e.g., invoice emails). If using Gmail, you'll need to generate an "App password" for security.
      * `RAJAONGKIR_API_KEY`: Obtain this from your chosen shipping API provider. The current implementation uses `rajaongkir.komerce.id` as a proxy.
4.  **Run the backend server:**
    ```bash
    npm run server
    # Or for production
    # npm start
    ```
    The server will run on `http://localhost:4000` (or your specified port).

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the `frontend` directory and add your environment variables:
    ```dotenv
    VITE_BACKEND_URL="http://localhost:4000" # Or your deployed backend URL
    ```
4.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:5173` (or another available port).

## Usage

### User Flow

1.  **Home Page:** View featured products, popular items, and customer testimonials.
2.  **Menu:** Browse all available baked goods, filter by category, search by name, and sort by price.
3.  **Product Detail:** View detailed information about a product, including multiple sizes, prices, and customer reviews. Add items to the cart.
4.  **Cart:** Review selected items, adjust quantities, and remove items.
5.  **Login/Register:** Create a new account or log in to an existing one to proceed with orders.
6.  **Place Order:** Provide shipping details, and the system will calculate shipping costs. Confirm the order to proceed to payment.
7.  **Payment:** Complete the payment using Midtrans Snap (various payment methods available).
8.  **Orders:** View a list of all your past orders, including their status (pending, confirmed, shipped, completed, cancelled) and payment status.
9.  **Order Detail:** See comprehensive details of a specific order, including shipping address, product list, and total amounts. You can also print the invoice from here.
10. **Review:** For completed orders, leave a rating and comment on purchased products.

### Admin Flow

1.  **Login:** Access the admin dashboard via `http://localhost:3000/login` (or your deployed admin URL). Use the credentials for the superadmin created during setup (or manually added to the `admins` collection).
      * **Default Superadmin (if not manually set):** An initial superadmin account should be managed directly in the MongoDB `admins` collection for the very first setup. Ensure `role: 'superadmin'`.
2.  **Dashboard:** Monitor key metrics like total products, categories, customers, and sales. View recent sales and order status distributions.
3.  **Product Management:**
      * Navigate to "Products" to view, add, or update products.
      * When adding/updating, provide details like name, description, category, image (uploaded via Cloudinary), sizes with their respective prices and weights, and set if it's a "Popular" product.
      * Set the product `Status` (Active/Non-active) to control visibility on the storefront.
4.  **Category Management:**
      * Navigate to "Categories" to view, add, or update categories.
      * Add category name, description, and an image (uploaded via Cloudinary).
5.  **Order Management:**
      * Go to "Orders" to see all customer orders.
      * Update the status of orders (e.g., from "Pembayaran Dikonfirmasi" to "Diproses", "Dikirim", "Selesai").
6.  **Customer Management:** View a list of all registered customers.
7.  **Admin Management:** (Accessible only by users with `superadmin` role)
      * Navigate to "Admins" to add new admin users (assign them `admin` or `superadmin` roles), or update existing admin details.
8.  **Review Management:**
      * Go to "Reviews" to moderate customer reviews. Reviews default to "pending" status.
      * Approve or reject reviews. Only approved reviews appear on the public product pages.
9.  **Invoice Management:** View all payment invoices. Filters are available to help generate reports.

## API Endpoints

The backend provides a comprehensive set of RESTful API endpoints. Here's a brief overview of some key routes:

  * **Authentication & User Management:**

      * `POST /api/user/register`
      * `POST /api/user/login`
      * `POST /api/user/forgot-password`
      * `POST /api/user/reset-password/:token`
      * `GET /api/user/all` (Admin/Superadmin)
      * `PUT /api/user/:id` (User's own profile or Superadmin)

  * **Admin Management:**

      * `POST /api/admin/admins` (Superadmin)
      * `GET /api/admin/admins` (Admin/Superadmin)
      * `PUT /api/admin/admins/:id` (Superadmin)

  * **Product Management:**

      * `POST /api/product` (Admin)
      * `GET /api/product` (Public)
      * `GET /api/product/:id` (Public)
      * `PUT /api/product/:id` (Admin)
      * `DELETE /api/product/:id` (Admin)

  * **Category Management:**

      * `POST /api/categories` (Admin)
      * `GET /api/categories` (Public)
      * `PUT /api/categories/:id` (Admin)
      * `DELETE /api/categories/:id` (Admin)

  * **Cart Management:**

      * `POST /api/cart/add` (Authenticated User)
      * `PUT /api/cart/update` (Authenticated User)
      * `DELETE /api/cart/remove` (Authenticated User)
      * `GET /api/cart/` (Authenticated User)

  * **Order Management:**

      * `POST /api/order/place` (Authenticated User)
      * `GET /api/order/me` (Authenticated User's orders)
      * `GET /api/order/all` (Admin)
      * `PATCH /api/order/:orderId/status` (Admin)
      * `GET /api/order/:orderId` (Authenticated User)
      * `GET /api/order/:orderId/details` (Admin)

  * **Payment & Invoice:**

      * `POST /api/order/midtrans/token` (Authenticated User)
      * `POST /api/order/midtrans/check-status` (Authenticated User, after payment redirect)
      * `POST /api/order/send-invoice-email/:orderId` (Admin/User)
      * `GET /api/order/invoices/all` (Admin)
      * `GET /api/order/invoice/by-order-detail/:orderDetailId` (Authenticated User/Admin)

  * **Review System:**

      * `POST /api/reviews` (Authenticated User)
      * `GET /api/reviews/product/:productId` (Public, for approved reviews)
      * `GET /api/reviews/user-specific` (Authenticated User's own reviews)
      * `GET /api/reviews/approved` (Public, for recent approved reviews)
      * `GET /api/reviews/admin` (Admin, all reviews)
      * `PUT /api/reviews/admin/:id/status` (Admin)
      * `DELETE /api/reviews/admin/:id` (Admin)

  * **Dashboard Specific APIs:**

      * `GET /api/dashboard/summary` (Admin)
      * `GET /api/dashboard/order/recent-sales` (Admin)
      * `GET /api/dashboard/order-status-counts` (Admin)
      * `GET /api/dashboard/total-categories` (Admin)

  * **Region & Shipping:**

      * `GET /api/wilayah/provinsi` (Public)
      * `GET /api/wilayah/kabupaten/:provinceId` (Public)
      * `GET /api/wilayah/kecamatan/:regencyId` (Public)
      * `GET /api/wilayah/kelurahan/:districtId` (Public)
      * `POST /api/wilayah/cek-ongkir` (Public)

## Folder Structure

```
ninanoorweb/
├── admin/                     # Admin Dashboard Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/        # Reusable React components (e.g., ProtectedRoute, SuperAdminProtectedRoute)
│   │   ├── contexts/          # React Contexts (e.g., ThemeContext)
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── layouts/           # Admin layout components (Header, Sidebar, Login)
│   │   ├── routes/            # Pages for each admin section (Admins, Categories, Customers, Dashboard, Invoices, Orders, Products, Reviews)
│   │   ├── utils/             # Utility functions (API client, auth helpers, formatters)
│   │   ├── App.jsx            # Main React app component
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/                   # Node.js Express Backend
│   ├── config/                # Database and Cloudinary configuration
│   ├── controllers/           # Business logic for API endpoints
│   ├── middleware/            # Custom Express middleware (e.g., auth, requireAdmin, multer)
│   ├── models/                # Mongoose schemas and models
│   ├── routes/                # API routes (divided by module, some nested in /api)
│   │   └── api/
│   ├── server.js              # Main server file
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
├── frontend/                  # User-facing Storefront Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Images, data (e.g., categories, footer links)
│   │   ├── components/        # Reusable React components (e.g., Header, Footer, Item, Navbar, CartTotal)
│   │   ├── context/           # React Context (ShopContextDef), Axios instance (api.js)
│   │   ├── pages/             # Main application pages (Home, Menu, Cart, Login, Orders, ProductDetail, ReviewForm, Contact, ForgotPassword, ResetPassword, NotFound)
│   │   ├── App.jsx            # Main React app component
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   └── vercel.json
└── .gitignore
```

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, please contact:

Yunus Arridwan - yunusarridwan@gmail.com
Project Link: [https://github.com/yunusarridwan/ninanoorweb](https://www.google.com/search?q=https://github.com/yunusarridwan/ninanoorweb)
