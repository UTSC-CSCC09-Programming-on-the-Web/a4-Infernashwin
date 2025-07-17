// model for comments
// comment has id, imageId, author, content, date

import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Photo } from "./photo.js";
import { User } from "./user.js";

/**
 * Comment model definition
 * @typedef {Object} Comment
 * @property {number} id - Unique identifier for the comment
 * @property {number} imageId - Foreign key referencing the photo associated with the comment
 * @property {string} author - Author of the comment
 * @property {string} content - Content of the comment
 * @property {Date} createdAt - Timestamp of when the comment was created
 * @property {Date} updatedAt - Timestamp of when the comment was last updated
 */

export const Comment = sequelize.define(
  "comment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Photo, // Reference to the Photo model
        key: "id", // Foreign key in the Photo model
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    tableName: "comments", // Optional: specify a custom table name
  }
);

// Define the association
Comment.belongsTo(Photo);
Photo.hasMany(Comment);
