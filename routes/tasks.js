const express = require('express');
const router = express.Router();
const { Task } = require('../db/models');
const { check, validationResult } = require('express-validator');

const asyncHandler = (handler) => {
    return (req, res, next) => handler(req, res, next).catch(next);
}

const validateTask = [
    check('name')
        .exists({ checkFalsy: true })
        .withMessage('Task name can\'t be empty.'),
    check('name')
      .isLength({ max: 255 })
      .withMessage('Task name can\'t be longer than 255 characters.')
];

const handleValidateionErrors = (req, res, next) => {
    const validationErrors = validationResult(req);
    // If the validation errors are not empty,
    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((error) => error.msg);
        // Generate a new 400 Bad request Error object
        // and invoke the next function passing in err
        // to pass control to the global error handler
        const err = Error('Bad request.');
        err.status = 400;
        err.title = 'Bad request.';
        err.errors = errors;
        return next(err);
    }

    next();
}

const taskNotFoundError = (id) => {
    const error = Error(`Task with id of ${id} could not be found.`);
    err.title = 'Task not found';
    err.status = 404;
    return err;
}

router.get('/', asyncHandler(async (req, res) => {
    const tasks = await Task.findAll();
    res.json({ tasks });
}));

router.get('/:id(\\d+)', asyncHandler(async (req, res, next) => {
    const taskId = parsInt(req.params.id, 10);
    const task = await Task.findByPk(taskId);

    if (task) {
    res.json({ task });
    } else {
        next(taskNotFoundError(taskId));
    }
}));

router.put('/:id(\\d+)', validateTask, handleValidateionErrors, asyncHandler(async (req, res, next) => {
    const taskId = parsInt(req.params.id, 10);
    const task = await Task.findByPk(taskId);

    if (task) {
        await task.update({ name: req.body.name });
        res.json({ task });
    } else {
        next(taskNotFoundError(taskId));
    }
}));

router.post('/', validateTask, handleValidateionErrors, asyncHandler(async (req, res) => {
    const { name } = req.body;
    const task = await Task.create({ name });
    res.status(201).json({ task });
}));

module.exports = router;
