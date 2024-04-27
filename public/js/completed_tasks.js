function formatDate(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = new Date(date).toLocaleDateString('en-US', options);
    return formattedDate;
}

async function displayCompletedTasks() {
    const completedTaskTable = document.getElementById('completed-task-table');
    completedTaskTable.innerHTML = `
        <thead>
            <tr>
                <th scope="col">Task Description</th>
                <th scope="col">Employee</th>
                <th scope="col">Priority</th>
                <th scope="col">Status</th>
                <th scope="col">Deadline</th>
            </tr>
        </thead>
        <tbody id="completed-task-list"></tbody>
    `;

    const completedTaskList = document.getElementById('completed-task-list');

    try {
        const response = await fetch('/getTasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();
        const completedTasks = tasks.filter(task => task.status === 'Completed');

        completedTasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.description}</td>
                <td>${task.employee.name}</td>
                <td>${task.priority}</td>
                <td>${task.status}</td>
                <td>${formatDate(task.deadline)}</td>
            `;
            completedTaskList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching and displaying completed tasks:', error);
    }
}

displayCompletedTasks();
