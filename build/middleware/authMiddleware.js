"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbService_1 = require("../services/dbService"); // Import your database pool
const authMiddleware = async (req, res, next) => {
    let token = req.headers["authorization"];
    if (!token)
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    try {
        token = token.substring(7);
        console.log(token);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const { id: userId } = decoded;
        // Check if user exists
        const client = await dbService_1.pool.connect();
        console.log("CLIENT");
        try {
            const result = await client.query(`SELECT * FROM users WHERE id = $1`, [
                userId,
            ]);
            let user = result.rows[0];
            console.log("RESULT");
            // If user doesn't exist, create one
            if (!user) {
                await client.query(`INSERT INTO users (id, username) VALUES ($1, $2)`, [
                    userId,
                    decoded.username,
                ]);
                console.log("CREATION");
                // Fetch the newly created user
                user = {
                    id: userId,
                    username: decoded.username,
                };
            }
            // Attach user to request object
            req.user = user;
            next();
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        res.status(400).json({ message: "Invalid token.", error });
    }
};
exports.authMiddleware = authMiddleware;
