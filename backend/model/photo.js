// Model for photos
// Photo has a id, author, title, url, and date

import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./user.js";

/** * Photo model definition
 * @typedef {Object} Photo
 * @property {number} id - Unique identifier for the photo
 * @property {string} title - Title of the photo
 * @property {number} userId - Foreign key referencing the user who uploaded the photo
 * @property {string} imageMetadata - Metadata of the photo (e.g., file path)
 * @property {Date} createdAt - Timestamp of when the photo was created
 * @property {Date} updatedAt - Timestamp of when the photo was last updated
 */

export const Photo = sequelize.define(
  "photo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageMetadata: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    tableName: "photos", // Explicitly set the table name
  }
);

// Photo has a single user
Photo.belongsTo(User, { foreignKey: "userId" });
// User has many photos
User.hasMany(Photo, { foreignKey: "userId" });
