import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes";

dotenv.config();

const app = express();

app.use(bodyParser.json());

// Routes
app.use("/tasks", taskRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Live on port ${PORT}`);
});
