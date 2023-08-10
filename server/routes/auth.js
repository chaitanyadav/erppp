import { Router } from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import path from "path";
import jwt from "jsonwebtoken";

const router = Router();

/*

User Schema
{
    "id": "string",
    "name": "string",
    "username": "string",
    "password": "string", // Hashed
}

This will be stored in a JSON file

*/

// Register
const register = async (req, res) => {
    // Get the data from the request
    const { name, username, password } = req.body;

    const filePath = path.join(process.cwd(), "users.json");

    // Check if the user already exists
    const data = fs.readFileSync(filePath);
    const users = JSON.parse(data).users;

    const user = users.find((user) => user.username === username);

    if (user) {
        return res.status(400).json({ message: "User already exists", success: false});
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user object
    const newUser = {
        id: uuidv4(),
        name,
        username,
        password: hashedPassword,
    };

    // Add the user to the database
    users.push(newUser);

    fs.writeFileSync(filePath, JSON.stringify({ users }));

    // Return the user
    res.status(201).json({
        message: "User created successfully",
        success: true,
    });
}

        

// Login
const login = async (req, res) => {
    // Get the data from the request
    const { username, password } = req.body;

    // Check if the user exists
    const filePath = path.join(process.cwd(), "users.json");

    const data = fs.readFileSync(filePath);
    const users = JSON.parse(data).users;

    const user = users.find((user) => user.username === username);

    if (!user) {
        return res.status(400).json({ message: "User does not exist", success: false });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    // Generate a token
    const token = jwt.sign({ id: user.id }, "This is chaitanya's secret!", { expiresIn: "1h" });

    // Set the cookie in the response HttpOnly: true, because we don't want the cookie to be accessed by the client side code
    res.cookie("token", token, {
        httpOnly: true,
        // secure: true, // This should be true in production but for development, it can be false
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    }
    );
    

    // Return the user
    res.status(200).json({
        message: "User logged in successfully",
        success: true,
    });
}

// Logout
const logout = async (req, res) => {
    // Clear the cookie
    res.clearCookie("token");

    // Return the user
    res.status(200).json({
        message: "User logged out successfully",
    });
}

// To check if the user is logged in
const verify = async (req, res) => {
    // Get the token from the cookie
    const parsedCookies = req.cookies;

    const token = req.cookies.token;

    // If there is no token, the user is not logged in
    if (!token) {
        return res.status(401).json({ message: "User not logged in", success: false });
    }

    // Verify the token
    try {
        const decoded = jwt.verify(token, "This is chaitanya's secret!");
        req.userId = decoded.id;
        res.status(200).json({ message: "User logged in", success: true });
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Invalid token", success: false });
    }
}


// Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify", verify);

export default router;