// Retrieve and display employee names from the database
async function displayEmployeeNames() {
    const employeeList = document.getElementById('employee-list');
    employeeList.innerHTML = '';

    try {
        const response = await fetch('/getEmployees');
        if (response.ok) {
            const employees = await response.json();
            employees.forEach((employee) => {
                const li = document.createElement('li');
                li.className =
                    'list-group-item d-flex justify-content-between align-items-center fs-5 w-50 mx-auto';

                const span = document.createElement('span');
                span.textContent = employee.name;

                const buttonGroup = document.createElement('div');

                const editButton = document.createElement('button');
                editButton.className = 'edit-button btn btn-warning mx-3';
                editButton.textContent = 'Edit';

                editButton.addEventListener('click', () => editEmployeeName(li, employee._id, employee.name));

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button btn btn-danger';
                deleteButton.textContent = 'Delete';

                deleteButton.addEventListener('click', () => deleteEmployee(employee._id));

                const confirmButton = document.createElement('button');
                confirmButton.className = 'confirm-edit-employee btn btn-success d-none';
                confirmButton.textContent = 'Confirm';

                const newNameInput = document.createElement('input');
                newNameInput.type = 'text';
                newNameInput.className = 'form-control d-none';

                buttonGroup.appendChild(editButton);
                buttonGroup.appendChild(deleteButton);

                li.appendChild(span);
                li.appendChild(buttonGroup);

                employeeList.appendChild(li);
            });
        } else {
            console.error('Error retrieving employees');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to make the employee name editable
function editEmployeeName(li, employeeId, currentName) {
    const employeeNameElement = li.querySelector('span');

    const newNameInput = document.createElement('input');
    newNameInput.type = 'text';
    newNameInput.className = 'form-control';
    newNameInput.value = currentName;

    const confirmEditButton = document.createElement('button');
    confirmEditButton.className = 'confirm-edit-employee mx-3 btn btn-success';
    confirmEditButton.textContent = 'Confirm';

    const editEmployeeDiv = document.createElement('div');
    editEmployeeDiv.className = 'edit-employee w-100 d-flex justify-content-between align-items-center';
    editEmployeeDiv.appendChild(newNameInput);
    editEmployeeDiv.appendChild(confirmEditButton);

    li.replaceChild(editEmployeeDiv, employeeNameElement);

    const confirmButton = li.querySelector('.confirm-edit-employee');
    confirmButton.classList.remove('d-none');

    const editButton = li.querySelector('.edit-button');
    editButton.classList.add('d-none');

    const deleteButton = li.querySelector('.delete-button');
    deleteButton.classList.add('d-none');

    newNameInput.focus();

    confirmEditButton.addEventListener('click', async () => {
        const newName = newNameInput.value.trim();
        if (newName) {
            try {
                const response = await fetch(`/editEmployee/${employeeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: newName }),
                });

                if (response.ok) {
                    displayEmployeeNames();
                } else {
                    console.error('Error editing employee');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });
}

async function deleteEmployee(employeeId) {
    if (confirm('Are you sure you want to delete this employee? If there are any tasks related to this employee exists then it will get deleted')) {
        try {
            const response = await fetch(`/deleteEmployee/${employeeId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                displayEmployeeNames();
            } else {
                console.error('Error deleting employee');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

const employeeForm = document.getElementById('employee-form');
employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    if (name) {
        try {
            const response = await fetch('/addEmployee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                window.location.href = '/employee';
            } else {
                console.error('Error adding employee');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        nameInput.value = '';
    }
});

displayEmployeeNames();