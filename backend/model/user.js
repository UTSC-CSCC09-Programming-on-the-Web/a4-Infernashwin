// Model for users
import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";

/**
 * User model definition
 * @typedef {Object} User
 * @property {number} id - Unique identifier for the user
 * @property {string} username - Username of the user
 * @property {string} password - Password of the user
 * @property {Date} createdAt - Timestamp of when the user was created
 * @property {Date} updatedAt - Timestamp of when the user was last updated
 */

export const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true, // Token can be null if not set
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    tableName: "users", // Optional: specify a custom table name
  }
);
