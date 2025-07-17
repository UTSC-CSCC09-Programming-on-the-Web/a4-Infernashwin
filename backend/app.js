// app.js

import express from "express";

export const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("static"));

import bodyParser from "body-parser";

import { sequelize } from "./datasource.js";
import { commentRouter } from "./router/comment_router.js";
import { photoRouter } from "./router/photo_router.js";
import { userRouter } from "./router/user_router.js";
import { galleryRouter } from "./router/gallery_router.js";

// Initialize the database connections
try {
  await sequelize.authenticate();
  // Automatically detect all of your defined models and create (or modify) the tables for you.
  // This is not recommended for production-use, but that is a topic for a later time!
  await sequelize.sync({ alter: { drop: false } });
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

// Use the routers
app.use("/users", userRouter);
app.use("/photos", photoRouter);
app.use("/comments", commentRouter);
app.use("/gallery", galleryRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
