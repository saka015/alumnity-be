const { postCreateTask, getMyTasks } = require("../services/task.services");

const createTask = async(req, res) => {
    try {
        const userId = req.user.id;
        const taskData = req.body;
        const newTask = await postCreateTask(userId, taskData);
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

module.exports = { createTask, fetchMyTasks };