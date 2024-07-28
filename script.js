document.addEventListener('DOMContentLoaded', function () {
    loadReminders();
    setInterval(checkReminders, 60000); // Check reminders every minute
});

document.getElementById('reminderForm').addEventListener('submit', function (e) {
    e.preventDefault();
    addReminder();
});

document.getElementById('editForm').addEventListener('submit', function (e) {
    e.preventDefault();
    updateEditedReminder();
});

function openModal() {
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function openEditModal(reminderElement) {
    const reminder = JSON.parse(reminderElement.getAttribute('data-reminder'));
    document.getElementById('editName').value = reminder.name;
    document.getElementById('editDescription').value = reminder.description;
    document.getElementById('editDueDate').value = reminder.dueDate;
    document.getElementById('editDueTime').value = reminder.dueTime;
    document.getElementById('editModal').style.display = 'flex';
    document.getElementById('editForm').onsubmit = function (e) {
        e.preventDefault();
        updateReminder(reminderElement, reminder);
        closeEditModal();
    };
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function openDeleteModal(reminderElement) {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.style.display = 'flex';

    document.getElementById('confirmDelete').onclick = function () {
        removeReminder(reminderElement);
        deleteModal.style.display = 'none';
    };

    document.getElementById('cancelDelete').onclick = function () {
        deleteModal.style.display = 'none';
    };
}

function addReminder() {
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('dueDate').value;
    const dueTime = document.getElementById('dueTime').value;

    const reminder = {
        id: Date.now(),
        name,
        description,
        dueDate,
        dueTime,
        complete: false,
        notified: false
    };

    saveReminder(reminder);
    renderReminder(reminder);
    updateNoRemindersMessage();

    closeModal();
    document.getElementById('reminderForm').reset();
}

function saveReminder(reminder) {
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders.push(reminder);
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

function loadReminders() {
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders.forEach(renderReminder);
    updateNoRemindersMessage();
}

function renderReminder(reminder) {
    const incompleteContent = document.getElementById('incompleteContent');
    const completeContent = document.getElementById('completeContent');

    const reminderElement = document.createElement('div');
    reminderElement.className = 'reminder';
    reminderElement.setAttribute('data-reminder', JSON.stringify(reminder));
    if (reminder.complete) {
        reminderElement.classList.add('complete');
    }

    const reminderInfo = document.createElement('div');
    reminderInfo.className = 'reminder-info';
    reminderInfo.innerHTML = `<strong>${reminder.name}</strong><br>${reminder.description}<br>${reminder.dueDate} ${reminder.dueTime}`;

    const checkButton = document.createElement('div');
    checkButton.className = 'check-button';
    checkButton.innerHTML = '<span>&#10003;</span>';
    checkButton.addEventListener('click', function () {
        reminderElement.classList.toggle('complete');
        reminder.complete = !reminder.complete;
        updateReminderInStorage(reminder);
        if (reminder.complete) {
            checkButton.style.backgroundColor = '#4caf50';
            checkButton.style.borderColor = '#4caf50';
            completeContent.appendChild(reminderElement);
        } else {
            checkButton.style.backgroundColor = '#fff';
            checkButton.style.borderColor = '#ccc';
            incompleteContent.appendChild(reminderElement);
        }
        updateNoRemindersMessage();
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = '&#128465;';
    deleteButton.addEventListener('click', function () {
        openDeleteModal(reminderElement);
    });

    const gearButton = document.createElement('div');
    gearButton.className = 'gear-button';
    gearButton.addEventListener('click', function () {
        openEditModal(reminderElement);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.appendChild(checkButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(gearButton);

    reminderElement.appendChild(reminderInfo);
    reminderElement.appendChild(buttonContainer);

    if (reminder.complete) {
        completeContent.appendChild(reminderElement);
    } else {
        incompleteContent.appendChild(reminderElement);
    }
}

function updateReminder(reminderElement, originalReminder) {
    const name = document.getElementById('editName').value;
    const description = document.getElementById('editDescription').value;
    const dueDate = document.getElementById('editDueDate').value;
    const dueTime = document.getElementById('editDueTime').value;

    originalReminder.name = name;
    originalReminder.description = description;
    originalReminder.dueDate = dueDate;
    originalReminder.dueTime = dueTime;

    updateReminderInStorage(originalReminder);

    const reminderInfo = reminderElement.querySelector('.reminder-info');
    reminderInfo.innerHTML = `<strong>${originalReminder.name}</strong><br>${originalReminder.description}<br>${originalReminder.dueDate} ${originalReminder.dueTime}`;
}

function updateReminderInStorage(updatedReminder) {
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders = reminders.map(reminder => reminder.id === updatedReminder.id ? updatedReminder : reminder);
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

function removeReminder(reminderElement) {
    const reminder = JSON.parse(reminderElement.getAttribute('data-reminder'));
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders = reminders.filter(r => r.id !== reminder.id);
    localStorage.setItem('reminders', JSON.stringify(reminders));

    reminderElement.parentNode.removeChild(reminderElement);
    updateNoRemindersMessage();
}

function checkReminders() {
    const now = new Date();
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders.forEach(reminder => {
        if (!reminder.notified) {
            const dueDateTime = new Date(`${reminder.dueDate}T${reminder.dueTime}`);
            if (now >= dueDateTime) {
                alert(`Reminder: ${reminder.name} is due!`);
                reminder.notified = true;
                updateReminderInStorage(reminder);
            }
        }
    });
}

function updateNoRemindersMessage() {
    const incompleteReminders = document.querySelectorAll('#incompleteContent .reminder');
    const completeReminders = document.querySelectorAll('#completeContent .reminder');
    
    const noIncompleteReminders = document.getElementById('noIncompleteReminders');
    const noCompleteReminders = document.getElementById('noCompleteReminders');
    
    noIncompleteReminders.style.display = incompleteReminders.length ? 'none' : 'block';
    noCompleteReminders.style.display = completeReminders.length ? 'none' : 'block';
}
