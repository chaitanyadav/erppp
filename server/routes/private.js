import { Router } from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import path from "path";
import jwt from "jsonwebtoken";

const isLogin = async (req, res, next) => {
    // Get the token from the cookie
    const token = req.cookies.token;

    // If there is no token, the user is not logged in
    if (!token) {
        return res.status(401).json({ message: "User not logged in" });
    }

    // Verify the token
    try {
        const decoded = jwt.verify(token, "This is chaitanya's secret!");
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Invalid token" });
    }
}

const router = Router();

// Get all the users
const getAllUsers = async (req, res) => {
    // Check if the user exists
    const filePath = path.join(process.cwd(), "users.json");

    const data = fs.readFileSync(filePath);
    const users = JSON.parse(data).users;

    // Return the user
    res.status(200).json({
        users
    });
}

export default router;