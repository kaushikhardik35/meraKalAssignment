"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTasks = exports.getTasksByUserId = exports.createTask = void 0;
const dbService_1 = require("./dbService");
const createTask = async (task) => {
    const client = await dbService_1.pool.connect();
    try {
        const { endpoint, data, delay, method, userId } = task;
        // Insert task into the database
        const result = await client.query(`INSERT INTO tasks (endpoint, data, delay, method, status, user_id) 
       VALUES ($1, $2, $3, $4, 'queued', $5) 
       RETURNING *`, [endpoint, JSON.stringify(data), delay, method, userId]);
        // Extract the task ID and execute the task after the specified delay
        const taskId = result.rows[0].id;
        setTimeout(async () => {
            // Update task status to 'complete' before executing
            await client.query(`UPDATE tasks SET status = 'complete' WHERE id = $1`, [
                taskId,
            ]);
            // Execute the task (e.g., send request to the endpoint)
            // Put your task execution logic here
        }, delay);
        // Return the created task
        return result.rows[0];
    }
    finally {
        client.release();
    }
};
exports.createTask = createTask;
const getTasksByUserId = async (userId) => {
    const client = await dbService_1.pool.connect();
    try {
        const result = await client.query(`SELECT * FROM tasks WHERE user_id = $1`, [userId]);
        return result.rows;
    }
    finally {
        client.release();
    }
};
exports.getTasksByUserId = getTasksByUserId;
const getAllTasks = async () => {
    const client = await dbService_1.pool.connect();
    try {
        const result = await client.query(`SELECT * FROM tasks`);
        return result.rows;
    }
    finally {
        client.release();
    }
};
exports.getAllTasks = getAllTasks;
