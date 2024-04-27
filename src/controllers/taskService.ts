import { Task } from "../db_models/tasks";
import { pool } from "./dbService";
import axios, { Method } from "axios";

export const createTask = async (task: Task): Promise<Task> => {
  const client = await pool.connect();
  try {
    const { endpoint, data, delay, method, userId } = task;
    const result = (await client.query({
      text: `INSERT INTO tasks (endpoint, data, delay, method, status, user_id) 
               VALUES ($1, $2, $3, $4, 'queued', $5) 
               RETURNING *`,
      values: [endpoint, JSON.stringify(data), delay, method, userId],
    })) as { rows: Task[] };

    const taskId = result.rows[0].id;
    setTimeout(async () => {
      try {
        const updatedTaskResult = (await client.query({
          text: `SELECT * FROM tasks WHERE id = $1`,
          values: [taskId],
        })) as { rows: Task[] };
        const updatedTask = updatedTaskResult.rows[0];
        if (updatedTask) {
          await sendRequest(
            updatedTask.endpoint,
            updatedTask.data,
            method as Method
          );
          await client.query({
            text: `UPDATE tasks SET status = 'complete' WHERE id = $1`,
            values: [taskId],
          });
          console.log(`Request sent to ${updatedTask.endpoint} successfully.`);
        }
      } catch (error) {
        console.error(
          `Error sending request to endpoint:`,
          (error as Error).message
        );
        await client.query({
          text: `UPDATE tasks SET status = 'failed' WHERE id = $1`,
          values: [taskId],
        });
      }
    }, delay);

    return result.rows[0];
  } finally {
    client.release();
  }
};

export const getTasksByUserId = async (userId: number): Promise<Task[]> => {
  const client = await pool.connect();
  try {
    const result = (await client.query({
      text: `SELECT * FROM tasks WHERE user_id = $1`,
      values: [userId],
    })) as { rows: Task[] };
    return result.rows;
  } finally {
    client.release();
  }
};

async function sendRequest(endpoint: string, data: any, method: Method) {
  try {
    const response = await axios({
      method: method,
      url: endpoint,
      data: data,
    });
    console.log(`Response from ${endpoint}:`, response.data);
  } catch (error) {
    throw new Error(
      `Error sending request to ${endpoint}: ${(error as Error).message}`
    );
  }
}
