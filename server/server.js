const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", async (req, res) => {

    try {

        await db.query("SELECT 1");

        res.send("Daily Bloom backend + MySQL connected 🌷");

    } catch (error) {

        console.error("Database connection failed:", error);

        res.status(500).send("Database connection failed");
    }

});


// =====================================================
// CREATE USER
// =====================================================

app.post("/api/users", async (req, res) => {

    try {

        const { name } = req.body;

        if (!name || name.trim() === "") {

            return res.status(400).json({
                message: "Name is required"
            });

        }

        const cleanName = name.trim();

        const [result] = await db.query(
            "INSERT INTO users (name) VALUES (?)",
            [cleanName]
        );

        res.status(201).json({

            message: "User created successfully",

            userId: result.insertId,

            name: cleanName

        });

    } catch (error) {

        console.error("Error creating user:", error);

        res.status(500).json({
            message: "Failed to create user"
        });

    }

});


// =====================================================
// GET USER
// =====================================================

app.get("/api/users/:id", async (req, res) => {

    try {

        const userId = req.params.id;

        const [users] = await db.query(
            "SELECT id, name FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.json(users[0]);

    } catch (error) {

        console.error("Error fetching user:", error);

        res.status(500).json({
            message: "Failed to fetch user"
        });

    }

});


// =====================================================
// CREATE TASK
// =====================================================

app.post("/api/tasks", async (req, res) => {

    try {

        const {
            user_id,
            task_text,
            task_date
        } = req.body;

        if (!user_id || !task_text || !task_date) {

            return res.status(400).json({
                message: "user_id, task_text and task_date are required"
            });

        }

        const [result] = await db.query(

            `INSERT INTO tasks
            (user_id, task_text, completed, task_date)
            VALUES (?, ?, 0, ?)`,
            
            [
                user_id,
                task_text.trim(),
                task_date
            ]

        );

        res.status(201).json({

            message: "Task created successfully",

            taskId: result.insertId,

            task_text: task_text.trim(),

            task_date: task_date

        });

    } catch (error) {

        console.error("Error creating task:", error);

        res.status(500).json({
            message: "Failed to create task"
        });

    }

});


// =====================================================
// GET TASKS BY DATE
// =====================================================

app.get("/api/tasks", async (req, res) => {

    try {

        const userId = req.query.user_id;
        const date = req.query.date;

        if (!userId) {

            return res.status(400).json({
                message: "user_id is required"
            });

        }

        let query;
        let values;

        if (date) {

            query = `
                SELECT
                    id,
                    user_id,
                    task_text,
                    completed,
                    task_date
                FROM tasks
                WHERE user_id = ?
                AND task_date = ?
                ORDER BY id DESC
            `;

            values = [userId, date];

        } else {

            query = `
                SELECT
                    id,
                    user_id,
                    task_text,
                    completed,
                    task_date
                FROM tasks
                WHERE user_id = ?
                ORDER BY task_date DESC, id DESC
            `;

            values = [userId];

        }

        const [tasks] = await db.query(query, values);

        res.json(tasks);

    } catch (error) {

        console.error("Error fetching tasks:", error);

        res.status(500).json({
            message: "Failed to fetch tasks"
        });

    }

});


// =====================================================
// UPDATE TASK
// =====================================================

app.patch("/api/tasks/:id", async (req, res) => {

    try {

        const taskId = req.params.id;

        const { completed } = req.body;

        await db.query(

            "UPDATE tasks SET completed = ? WHERE id = ?",

            [
                completed ? 1 : 0,
                taskId
            ]

        );

        res.json({
            message: "Task updated successfully"
        });

    } catch (error) {

        console.error("Error updating task:", error);

        res.status(500).json({
            message: "Failed to update task"
        });

    }

});


// =====================================================
// DELETE TASK
// =====================================================

app.delete("/api/tasks/:id", async (req, res) => {

    try {

        const taskId = req.params.id;

        await db.query(
            "DELETE FROM tasks WHERE id = ?",
            [taskId]
        );

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {

        console.error("Error deleting task:", error);

        res.status(500).json({
            message: "Failed to delete task"
        });

    }

});


// =====================================================
// CREATE GOAL
// =====================================================

app.post("/api/goals", async (req, res) => {

    try {

        const {
            user_id,
            goal_text
        } = req.body;

        if (!user_id || !goal_text) {

            return res.status(400).json({
                message: "user_id and goal_text are required"
            });

        }

        const [result] = await db.query(

            `INSERT INTO goals
            (user_id, goal_text, completed)
            VALUES (?, ?, 0)`,

            [
                user_id,
                goal_text.trim()
            ]

        );

        res.status(201).json({

            message: "Goal created successfully",

            goalId: result.insertId,

            goal_text: goal_text.trim()

        });

    } catch (error) {

        console.error("Error creating goal:", error);

        res.status(500).json({
            message: "Failed to create goal"
        });

    }

});


// =====================================================
// GET GOALS
// =====================================================

app.get("/api/goals", async (req, res) => {

    try {

        const userId = req.query.user_id;

        if (!userId) {

            return res.status(400).json({
                message: "user_id is required"
            });

        }

        const [goals] = await db.query(

            `SELECT
                id,
                goal_text,
                completed
             FROM goals
             WHERE user_id = ?
             ORDER BY id DESC`,

            [userId]

        );

        res.json(goals);

    } catch (error) {

        console.error("Error fetching goals:", error);

        res.status(500).json({
            message: "Failed to fetch goals"
        });

    }

});


// =====================================================
// UPDATE GOAL
// =====================================================

app.patch("/api/goals/:id", async (req, res) => {

    try {

        const goalId = req.params.id;

        const { completed } = req.body;

        await db.query(

            "UPDATE goals SET completed = ? WHERE id = ?",

            [
                completed ? 1 : 0,
                goalId
            ]

        );

        res.json({
            message: "Goal updated successfully"
        });

    } catch (error) {

        console.error("Error updating goal:", error);

        res.status(500).json({
            message: "Failed to update goal"
        });

    }

});


// =====================================================
// DELETE GOAL
// =====================================================

app.delete("/api/goals/:id", async (req, res) => {

    try {

        const goalId = req.params.id;

        await db.query(
            "DELETE FROM goals WHERE id = ?",
            [goalId]
        );

        res.json({
            message: "Goal deleted successfully"
        });

    } catch (error) {

        console.error("Error deleting goal:", error);

        res.status(500).json({
            message: "Failed to delete goal"
        });

    }

});


// =====================================================
// SAVE HABIT
// =====================================================

app.post("/api/habits", async (req, res) => {

    try {

        const {
            user_id,
            habit_name,
            completed,
            habit_date
        } = req.body;

        if (!user_id || !habit_name || !habit_date) {

            return res.status(400).json({
                message: "user_id, habit_name and habit_date are required"
            });

        }

        await db.query(

            `INSERT INTO habits
            (user_id, habit_name, completed, habit_date)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            completed = VALUES(completed)`,

            [
                user_id,
                habit_name,
                completed ? 1 : 0,
                habit_date
            ]

        );

        res.json({
            message: "Habit saved successfully"
        });

    } catch (error) {

        console.error("Error saving habit:", error);

        res.status(500).json({
            message: "Failed to save habit"
        });

    }

});


// =====================================================
// GET HABITS
// =====================================================

app.get("/api/habits", async (req, res) => {

    try {

        const userId = req.query.user_id;
        const date = req.query.date;

        if (!userId || !date) {

            return res.status(400).json({
                message: "user_id and date are required"
            });

        }

        const [habits] = await db.query(

            `SELECT
                habit_name,
                completed
             FROM habits
             WHERE user_id = ?
             AND habit_date = ?`,

            [
                userId,
                date
            ]

        );

        res.json(habits);

    } catch (error) {

        console.error("Error fetching habits:", error);

        res.status(500).json({
            message: "Failed to fetch habits"
        });

    }

});


// =====================================================
// SAVE JOURNAL
// =====================================================

app.post("/api/journal", async (req, res) => {

    try {

        const {
            user_id,
            mood,
            journal_text,
            journal_date
        } = req.body;

        if (!user_id || !journal_date) {

            return res.status(400).json({
                message: "user_id and journal_date are required"
            });

        }

        await db.query(

            `INSERT INTO journals
            (user_id, mood, journal_text, journal_date)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            mood = VALUES(mood),
            journal_text = VALUES(journal_text)`,

            [
                user_id,
                mood || null,
                journal_text || "",
                journal_date
            ]

        );

        res.json({
            message: "Journal saved successfully"
        });

    } catch (error) {

        console.error("Error saving journal:", error);

        res.status(500).json({
            message: "Failed to save journal"
        });

    }

});


// =====================================================
// GET JOURNAL
// =====================================================

app.get("/api/journal", async (req, res) => {

    try {

        const userId = req.query.user_id;
        const date = req.query.date;

        if (!userId || !date) {

            return res.status(400).json({
                message: "user_id and date are required"
            });

        }

        const [journals] = await db.query(

            `SELECT
                mood,
                journal_text,
                journal_date
             FROM journals
             WHERE user_id = ?
             AND journal_date = ?`,

            [
                userId,
                date
            ]

        );

        if (journals.length === 0) {

            return res.json(null);

        }

        res.json(journals[0]);

    } catch (error) {

        console.error("Error fetching journal:", error);

        res.status(500).json({
            message: "Failed to fetch journal"
        });

    }

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Daily Bloom server running on http://localhost:${PORT}`
    );

});