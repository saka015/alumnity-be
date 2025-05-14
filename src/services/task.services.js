const { Task } = require("../models/task.model");
const { NotFoundError } = require("../utils/AppErrror");

const postCreateTask = async(userId, taskData) => {
    if (!userId || !taskData) {
        throw new NotFoundError("User ID and task data are required.");
    }

    const newTask = new Task({
        userId,
        ...taskData,
    });

    await newTask.save();
    return newTask;
};

const getMyTasks = async(userId) => {
    if (!userId) {
        throw new NotFoundError("User ID is required.");
    }

    const myTasks = await Task.find({ userId });

    return myTasks;
};

module.exports = { postCreateTask, getMyTasks };