# Waste Classification Application

This is a web application built with Express.js and TensorFlow.js that classifies waste based on images uploaded by users. The application utilizes a pre-trained Teachable Machine model to perform image classification and determine the type of waste (e.g., Metal, Glass, E-waste, Paper, Plastic) based on the uploaded image.

## Features

- User Sign Up and Sign In: Users can sign up for an account or sign in using their credentials.
- Image Classification: The application allows users to upload images of waste items for classification.
- Prediction Processing: The predicted waste type is processed to determine the most probable category.
- MongoDB Integration: User data and waste classification records are stored in a MongoDB database.
- Cookie-based User Tracking: The application uses cookies to track user sessions and manage user-specific actions.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ziyad188/E-dtox


Prerequisites

Node.js and npm installed on your system.
Libraries and Tools Used

Express.js: Web framework for building the application's server.
EJS: Templating engine for rendering dynamic HTML content.
TensorFlow.js (tfjs-node): Library for running machine learning models on Node.js.
Multer: Middleware for handling file uploads.
Mongoose: MongoDB object modeling for Node.js.
Node-fetch: Fetch API implementation for Node.js.
Canvas: Library for generating images on the server-side.
License

This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments

The Teachable Machine model used in this application was obtained from teachablemachine.withgoogle.com.

Please note that in this file, the repository URL is updated to `https://github.com/ziyad188/E-dtox.git`, and the `LICENSE` information states that the project is licensed under the MIT License. Remember to replace `your_mongodb_connection_string` with the actual MongoDB connection string you are using in the `.env` file.

