const express = require('express')
const app = express()
const path = require('path')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const mongoUrl = "mongodb+srv://krunalchhabhaya7803:TaskManager@taskmanager.rzaw7vn.mongodb.net/"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

const Employee = require('./models/employeeModel');
const Task = require('./models/taskModel');

app.listen(3000, () => {
    console.log("App listening on port 3000")
})

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'))
})
app.get('/employee', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'employee.html'))
})
app.get('/completed', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'completed.html'))
})

app.get('/getEmployees', async (req, res) => {
    try {
        const employees = await Employee.find({}, 'name');
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/addEmployee', async (req, res) => {
    const { name } = req.body;
    try {
        const newEmployee = await Employee.create({ name });
        res.status(201).json(newEmployee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/editEmployee/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(id, { name }, { new: true });

        if (!updatedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.status(200).json(updatedEmployee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/deleteEmployee/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEmployee = await Employee.findByIdAndDelete(id);

        if (!deletedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/addTask', async (req, res) => {
    const { description, employee, priority, status, deadline } = req.body;
    try {
        const newTask = await Task.create({ description, employee, priority, status, deadline });
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/getTasks', async (req, res) => {
    try {
        const tasks = await Task.find().populate('employee', 'name'); // Fetch all tasks and populate the 'employee' field with 'name'
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/getTask/:id', async (req, res) => {
    const taskId = req.params.id;

    try {
        const task = await Task.findById(taskId).populate('employee', 'name'); // Assuming 'employee' is the field referencing the Employee model

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/deleteTask/:id', async (req, res) => {
    const taskId = req.params.id;

    try {
        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/updateTask/:id', async (req, res) => {
    const taskId = req.params.id;
    const { description, employee, priority, status, deadline } = req.body;

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { description, employee, priority, status, deadline },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/updateTaskStatus/:id', async (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
