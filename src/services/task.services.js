const { Task } = require("../models/task.model");
const { NotFoundError } = require("../utils/AppErrror");

const postCreateTask = async(userId, taskData) => {
    if (!userId || !taskData) {
        throw new NotFoundError("User ID and task data are required.");
    }

    const newTask = new Task({
        ...taskData,
        createdBy: userId,
    });

    await newTask.save();
    return newTask;
};

const getMyTasks = async(userId, searchTerm = "", page = 1, limit = 10) => {
    if (!userId) {
        throw new NotFoundError("User ID is required.");
    }

    const query = { createdBy: userId };
    if (searchTerm) {
        query.title = { $regex: searchTerm, $options: "i" };
    }

    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit);
    const skip = (page - 1) * limit;

    const tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        tasks,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalTasks,
            itemsPerPage: limit,
        },
    };
};

module.exports = { postCreateTask, getMyTasks };