import { Request, Response } from "express";
import express from "express";
import { auth } from "../middleware/authMiddleware";
import {
  createTask,
  getTasksByUserId,
  getAllTasks,
} from "../controllers/taskService";
import { Task } from "../db_models/tasks"; // Import Task interface

interface RequestWithUser extends Request {
  user?: any;
}

const router = express.Router();

router.post("/", auth, async (req: RequestWithUser, res: Response) => {
  try {
    let { endpoint, delay, method } = req.query;
    if (!endpoint) {
      return res.status(400).json({ error: "Please Enter valid Endpoint" });
    }
    if (!method) {
      method = "GET";
    }
    const { id: userId } = req.user;

    // Ensure delay is parsed as number
    const parsedDelay = parseInt(delay as string, 10);

    // Create a task object
    const task: Task = {
      endpoint: endpoint as string,
      data: "Hello",
      delay: parsedDelay || 0,
      method: method as string,
      userId: userId as number,
      status: "queued",
    };
    const createdTask = await createTask(task);
    res.status(201).json(createdTask);
  } catch (error) {
    console.error("POST /tasks error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/user", auth, async (req: RequestWithUser, res: Response) => {
  try {
    const { id: userId } = req.user;

    // Get tasks by user ID
    const tasks = await getTasksByUserId(userId);

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/", auth, async (req: Request, res: Response) => {
  try {
    // Get all tasks
    const tasks = await getAllTasks();

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
