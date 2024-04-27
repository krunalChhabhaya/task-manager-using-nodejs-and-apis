let editedTaskId = null;

async function initEmployeeDropdown() {
    const employeeDropdown = document.getElementById('employee-list');

    try {
        const response = await fetch('/getEmployees');
        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }

        const employees = await response.json();
        employees.forEach((employee) => {
            const option = document.createElement('option');
            option.value = employee._id;
            option.textContent = employee.name;
            employeeDropdown.appendChild(option);
        });

        if (employees.length === 0) {
            const messageContainer = document.createElement('div');
            messageContainer.className = 'text-danger alert-danger';
            messageContainer.textContent = 'Please Enter an Employee from';

            const link = document.createElement('a');
            link.className = 'text-danger';
            link.href = 'employee';
            link.innerHTML = '<strong> Add Employee Page</strong>';

            messageContainer.appendChild(link);
            employeeDropdown.insertAdjacentElement('afterend', messageContainer);
        }
    } catch (error) {
        console.error('Error fetching employees:', error);
    }
}

function formatDate(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = new Date(date).toLocaleDateString('en-US', options);
    return formattedDate;
}

async function initTasks() {
    const taskTable = document.getElementById('task-table');
    taskTable.innerHTML = `
        <thead>
            <tr>
                <th scope="col">Select</th>
                <th scope="col">Task Description</th>
                <th scope="col">Employee</th>
                <th scope="col">Priority</th>
                <th scope="col">Status</th>
                <th scope="col">Deadline</th>
                <th scope="col">Actions</th>
            </tr>
        </thead>
        <tbody id="task-list"></tbody>
    `;

    const taskList = document.getElementById('task-list');

    try {
        const response = await fetch('/getTasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();

        tasks.forEach(task => {
            if (task.status !== 'Completed') {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" data-task-id="${task._id}"></td>
                    <td>${task.description}</td>
                    <td>${task.employee.name}</td>
                    <td>${task.priority}</td>
                    <td>${task.status}</td>
                    <td>${formatDate(task.deadline)}</td>
                    <td>
                        <button class="edit-button btn btn-warning" data-task-id="${task._id}">Edit</button>
                        <button class="delete-button btn btn-danger" data-task-id="${task._id}">Delete</button>
                    </td>
                `;
                taskList.appendChild(row);
            }
        });

        taskTable.addEventListener('click', async (event) => {
            if (event.target.classList.contains('edit-button')) {
                const taskId = event.target.getAttribute('data-task-id');

                try {
                    const response = await fetch(`/getTask/${taskId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch task');
                    }
                    editedTaskId = taskId;
                    const taskToEdit = await response.json();

                    document.getElementById('task-description').value = taskToEdit.description;

                    const employeeDropdown = document.getElementById('employee-list');
                    employeeDropdown.value = taskToEdit.employee._id;

                    document.getElementById('priority').value = taskToEdit.priority;
                    document.getElementById('status').value = taskToEdit.status;
                    document.getElementById('deadline').value = formatDate(taskToEdit.deadline);

                    document.getElementById('add-task-btn').textContent = 'Update';
                    document.getElementById('add-task-btn').style.margin = '0 auto';

                    event.target.style.display = 'none';
                } catch (error) {
                    console.error('Error fetching task for edit:', error);
                }
            }
        });

        taskTable.addEventListener('click', async (event) => {
            if (event.target.classList.contains('delete-button')) {
                const taskId = event.target.getAttribute('data-task-id');

                try {
                    const response = await fetch(`/deleteTask/${taskId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        throw new Error('Error deleting task');
                    }
                    initTasks();
                } catch (error) {
                    console.error('Error deleting task:', error);
                }
            }
        });

        taskTable.addEventListener('change', async (event) => {
            if (event.target.type === 'checkbox') {
                const taskId = event.target.getAttribute('data-task-id');

                try {
                    const response = await fetch(`/updateTaskStatus/${taskId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: 'Completed' })
                    });

                    if (!response.ok) {
                        throw new Error('Error updating task status');
                    }
                    initTasks();
                } catch (error) {
                    console.error('Error updating task status:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

function setMinDate() {
    const deadlineInput = document.getElementById('deadline');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`;
    deadlineInput.setAttribute('min', minDate);
}

setMinDate();

async function addTask(task) {
    try {
        const response = await fetch('/addTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error('Error adding task');
        }
        initTasks();
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

function filterAndDisplayTasks(query) {
    const taskRows = document.querySelectorAll('#task-list tr');
    query = query.toLowerCase().trim();

    taskRows.forEach(row => {
        let rowMatches = false;

        row.querySelectorAll('td').forEach(cell => {
            const cellText = cell.textContent.toLowerCase();

            if (cellText.includes(query)) {
                rowMatches = true;
            }
        });

        if (rowMatches) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', () => {
    const searchQuery = searchInput.value.trim();
    filterAndDisplayTasks(searchQuery);
});

const taskForm = document.getElementById('task-form');
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = document.getElementById('task-description').value.trim();
    const employee = document.getElementById('employee-list').value;
    const priority = document.getElementById('priority').value;
    const status = document.getElementById('status').value;
    const deadline = document.getElementById('deadline').value;

    if (editedTaskId) {
        const updatedTask = {
            description,
            employee,
            priority,
            status,
            deadline
        };

        try {
            const response = await fetch(`/updateTask/${editedTaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedTask)
            });

            if (!response.ok) {
                throw new Error('Error updating task');
            }

            editedTaskId = null;

            initTasks();

            document.getElementById('add-task-btn').textContent = 'Add Task';
            document.getElementById('add-task-btn').style.display = 'block';
            document.getElementById('add-task-btn').style.margin = '0 auto';
        } catch (error) {
            console.error('Error updating task:', error);
        }
    } else {
        const newTask = {
            description,
            employee,
            priority,
            status,
            deadline
        };

        try {
            const response = await fetch('/addTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });

            if (!response.ok) {
                throw new Error('Error adding task');
            }
            initTasks();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    taskForm.reset();
});

initEmployeeDropdown();
initTasks();