const { Task } = require("../models/task.model");
const { NotFoundError } = require("../utils/AppErrror");

const postCreateTask = async(userId, userName, taskData) => {
    if (!userId || !taskData) {
        throw new NotFoundError("User ID and task data are required.");
    }


    const newTask = new Task({
        ...taskData,
        createdBy: userId,
        createdUsername: userName
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


const getAllTasks = async(userId, searchTerm = "", page = 1, limit = 10) => {
    if (!userId) {
        throw new NotFoundError("User ID is required.");
    }

    const query = {
        createdBy: { $ne: userId }
    };

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

const getTaskById = async(id) => {
    const task = await Task.findById(id).populate('applicants.user', 'username name email');;
    if (!task) {
        throw new NotFoundError("Task not found");
    }
    return task;
};


const applyToTask = async(taskId, userId, { title, email, description }) => {
    const task = await Task.findById(taskId).populate('applicants.user', 'username name');
    if (!task) {
        throw new Error('Task not found');
    }

    const alreadyApplied = task.applicants.some(
        (app) => app.user.toString() === userId.toString()
    );

    if (alreadyApplied) {
        throw new Error('Already applied');
    }

    task.applicants.push({
        user: userId,
        email,
        title,
        description,
    });

    await task.save();

    return { message: 'Application submitted successfully' };
};





module.exports = { postCreateTask, getMyTasks, getAllTasks, getTaskById, applyToTask };