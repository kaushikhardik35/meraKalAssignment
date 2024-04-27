"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const taskService_1 = require("../services/taskService");
const router = express_1.default.Router();
router.post("/", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const { endpoint, delay, method } = req.query;
        const { id: userId } = req.user;
        // Ensure delay is parsed as number
        const parsedDelay = parseInt(delay, 10);
        // Create a task object
        const task = {
            endpoint: endpoint,
            data: "Hello",
            delay: parsedDelay,
            method: method,
            userId: userId,
            status: "queued",
        };
        // Call the createTask function
        const createdTask = await (0, taskService_1.createTask)(task);
        res.status(201).json(createdTask);
    }
    catch (error) {
        console.error("POST /tasks error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});
router.get("/user", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        const { id: userId } = req.user;
        // Get tasks by user ID
        const tasks = await (0, taskService_1.getTasksByUserId)(userId);
        res.json(tasks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
router.get("/", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        // Get all tasks
        const tasks = await (0, taskService_1.getAllTasks)();
        res.json(tasks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.default = router;
