const { Task } = require("../models/task.model");
const { postCreateTask, getMyTasks, getAllTasks, getTaskById, applyToTask } = require("../services/task.services");

const createTask = async(req, res) => {
    try {
        const userId = req.user.id;
        const userName = req.user.username;

        const taskData = req.body;
        const newTask = await postCreateTask(userId, userName, taskData);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const fetchMyTasks = async(req, res) => {
    try {
        const userId = req.user.id;
        const { search = "", page = 1, limit = 10 } = req.query;
        const myTasks = await getMyTasks(
            userId,
            search,
            parseInt(page),
            parseInt(limit)
        );
        res.status(200).json(myTasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(400).json({ message: error.message });
    }
};

const fetchAllTasks = async(req, res) => {

    try {
        const userId = req.user.id;
        const { search = "", page = 1, limit = 10 } = req.query;
        const allTasks = await getAllTasks(
            userId,
            search,
            parseInt(page),
            parseInt(limit)
        );
        res.status(200).json(allTasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(400).json({ message: error.message });
    }


}


const fetchTaskById = async(req, res) => {
    try {
        const { id } = req.params;
        const task = await getTaskById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


const applyToTaskById = async(req, res, next) => {
    try {
        const taskId = req.params.taskId;
        const userId = req.user._id;
        const { title, email, description } = req.body;

        const result = await applyToTask(taskId, userId, {
            title,
            email,
            description,
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in applyToTaskController:', error.message);
        res.status(400).json({ message: error.message });
    }
};


module.exports = { createTask, fetchMyTasks, fetchAllTasks, fetchTaskById, applyToTaskById };