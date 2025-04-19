document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const dateDisplay = document.getElementById('dateDisplay');
  const timeDisplay = document.getElementById('timeDisplay');

  // ⏱️ Real-time date & time
  function updateDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    dateDisplay.textContent = `Date: ${date}`;
    timeDisplay.textContent = `Time: ${time}`;
  }
  setInterval(updateDateTime, 1000);
  updateDateTime();

  // 🎯 Motivational messages
  const motivationalMessages = {
    completed: [
      "Great job! Another task crushed! 💪",
      "You're on fire! 🔥 Keep up the momentum!",
      "Success is built on small victories like this one. ✅",
      "Done and dusted! Keep it going!",
      "Every step counts. You're doing amazing! 🌟"
    ],
    deleted: [
      "Don't worry! Every day is a fresh start. 🌱",
      "It's okay to let go. You'll come back stronger! 💡",
      "Progress isn't always linear. You got this! 🚀",
      "Be kind to yourself. Start again with confidence. ❤️",
      "Reset. Refocus. Restart. 🔁"
    ]
  };

  function getRandomMessage(type) {
    const msgs = motivationalMessages[type];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  function showPopup(message, type) {
    const popup = document.getElementById('popupMessage');
    popup.textContent = message;
    popup.className = `popup show ${type}`;

    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => {
        popup.classList.add('hidden');
      }, 500);
    }, 3000);
    popup.classList.remove('hidden');
  }

  // ✅ Add new task
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
      const timestamp = new Date();
      addTask(taskText, timestamp);
      taskInput.value = '';
    }
  });

  // ✅ Add task to list
  function addTask(text, createdAt) {
    const li = document.createElement('li');
    li.dataset.createdAt = createdAt.getTime();

    const content = document.createElement('div');
    content.className = 'task-content';

    const textDiv = document.createElement('div');
    textDiv.className = 'task-text';

    const readableDate = createdAt.toLocaleDateString();
    const readableTime = createdAt.toLocaleTimeString();

    const timeInfo = document.createElement('div');
    timeInfo.className = 'task-time';
    timeInfo.textContent = `Added on: ${readableDate} at ${readableTime}`;

    textDiv.innerHTML = `<strong>${text}</strong>`;
    textDiv.appendChild(timeInfo);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✖';
    deleteBtn.className = 'delete-btn';

    content.appendChild(textDiv);
    content.appendChild(deleteBtn);
    li.appendChild(content);
    taskList.appendChild(li);
  }

  // ✅ Complete or Delete task
  taskList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    if (e.target.classList.contains('delete-btn')) {
      showPopup(getRandomMessage('deleted'), 'error');
      li.remove();
    } else {
      if (!li.classList.contains('completed')) {
        const createdAt = parseInt(li.dataset.createdAt);
        const completedAt = Date.now();
        const timeTakenMs = completedAt - createdAt;
        const duration = formatDuration(timeTakenMs);

        const timeInfo = li.querySelector('.task-time');
        timeInfo.textContent += ` | Completed in: ${duration}`;

        showPopup(getRandomMessage('completed'), 'success');
      }

      li.classList.toggle('completed');
    }
  });

  // ⏱️ Format duration
  function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) {
      return `${mins} min${mins > 1 ? 's' : ''} ${secs} sec${secs !== 1 ? 's' : ''}`;
    }
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  }
});
