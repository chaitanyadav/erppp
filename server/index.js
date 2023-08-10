// All imports
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import privateRoutes from "./routes/private.js";
import logger from "morgan";
import cookieParser from "cookie-parser";


// Configurations
dotenv.config();
const app = express();

// White list
const whiteList = ["http://localhost:3000"];
const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true); // No error
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};


app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(cookieParser());


// Middlewares
app.use(bodyParser.json());

// Server is listening
app.listen(8080, () => {
    console.log("Server running on port 8080");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/private", privateRoutes)