
        // Data Management
        let tasks = JSON.parse(localStorage.getItem('taskmaster-tasks')) || [];
        let goals = JSON.parse(localStorage.getItem('taskmaster-goals')) || [];
        let taskIdCounter = parseInt(localStorage.getItem('taskmaster-task-counter')) || 1;
        let goalIdCounter = parseInt(localStorage.getItem('taskmaster-goal-counter')) || 1;

        // Save data to localStorage
        function saveData() {
            localStorage.setItem('taskmaster-tasks', JSON.stringify(tasks));
            localStorage.setItem('taskmaster-goals', JSON.stringify(goals));
            localStorage.setItem('taskmaster-task-counter', taskIdCounter.toString());
            localStorage.setItem('taskmaster-goal-counter', goalIdCounter.toString());
        }

        // Navigation
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
            
            document.getElementById(pageId).classList.add('active');
            event.target.classList.add('active');
            
            if (pageId === 'dashboard') updateDashboard();
            if (pageId === 'tasks') renderTasks();
            if (pageId === 'goals') renderGoals();
        }

        // Theme Management
        function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('taskmaster-theme', newTheme);
            
            document.querySelector('.theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }

        // Load saved theme
        function loadTheme() {
            const savedTheme = localStorage.getItem('taskmaster-theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.querySelector('.theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }

        // Task Management
        function addTask(title, description, deadline, priority, status) {
            const task = {
                id: taskIdCounter++,
                title,
                description,
                deadline,
                priority,
                status,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(task);
            saveData();
            return task;
        }

        function updateTaskStatus(taskId, newStatus) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.status = newStatus;
                saveData();
                updateDashboard();
                renderTasks();
            }
        }

        function deleteTask(taskId) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveData();
            updateDashboard();
            renderTasks();
        }

        function editTask(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                const newTitle = prompt('Edit task title:', task.title);
                const newDescription = prompt('Edit task description:', task.description);
                
                if (newTitle !== null) task.title = newTitle;
                if (newDescription !== null) task.description = newDescription;
                
                saveData();
                renderTasks();
            }
        }

        // Dashboard Updates
        function updateDashboard() {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const progressTasks = tasks.filter(t => t.status === 'progress').length;
            
            const overdueTasks = tasks.filter(t => {
                if (!t.deadline) return false;
                return new Date(t.deadline) < new Date() && t.status !== 'completed';
            }).length;

            document.getElementById('total-tasks').textContent = totalTasks;
            document.getElementById('completed-tasks').textContent = completedTasks;
            document.getElementById('progress-tasks').textContent = progressTasks;
            document.getElementById('overdue-tasks').textContent = overdueTasks;
        }

        // Task Rendering
        function renderTasks() {
            const todoList = document.getElementById('todo-list');
            const progressList = document.getElementById('progress-list');
            const completedList = document.getElementById('completed-list');

            todoList.innerHTML = '';
            progressList.innerHTML = '';
            completedList.innerHTML = '';

            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                
                if (task.status === 'todo') {
                    todoList.appendChild(taskElement);
                } else if (task.status === 'progress') {
                    progressList.appendChild(taskElement);
                } else if (task.status === 'completed') {
                    completedList.appendChild(taskElement);
                }
            });

            // Update column counts
            document.getElementById('todo-count').textContent = tasks.filter(t => t.status === 'todo').length;
            document.getElementById('progress-count').textContent = tasks.filter(t => t.status === 'progress').length;
            document.getElementById('completed-count').textContent = tasks.filter(t => t.status === 'completed').length;
        }

        function createTaskElement(task) {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.draggable = true;
            taskCard.dataset.taskId = task.id;

            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';

            taskCard.innerHTML = `
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    <span style="color: ${isOverdue ? 'var(--danger-color)' : 'var(--text-secondary)'}">
                        ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editTask(${task.id})">Edit</button>
                    <button class="btn btn-sm" style="background: var(--danger-color); color: white;" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;

            // Drag and drop events
            taskCard.addEventListener('dragstart', handleDragStart);
            taskCard.addEventListener('dragend', handleDragEnd);

            return taskCard;
        }

        // Drag and Drop
        let draggedTask = null;

        function handleDragStart(e) {
            draggedTask = this;
            this.classList.add('dragging');
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
            draggedTask = null;
        }

        // Add drop zones
        document.querySelectorAll('.task-list').forEach(list => {
            list.addEventListener('dragover', handleDragOver);
            list.addEventListener('drop', handleDrop);
        });

        function handleDragOver(e) {
            e.preventDefault();
            this.classList.add('drop-zone');
        }

        function handleDrop(e) {
            e.preventDefault();
            this.classList.remove('drop-zone');
            
            if (draggedTask) {
                const taskId = parseInt(draggedTask.dataset.taskId);
                const newStatus = this.id.replace('-list', '').replace('todo', 'todo').replace('progress', 'progress').replace('completed', 'completed');
                
                updateTaskStatus(taskId, newStatus);
            }
        }

        // Form Handling
        document.getElementById('task-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-description').value;
            const deadline = document.getElementById('task-deadline').value;
            const priority = document.getElementById('task-priority').value;
            const status = document.getElementById('task-status').value;

            addTask(title, description, deadline, priority, status);
            
            this.reset();
            showPage('tasks');
        });

        // Goals Management
        function addGoal() {
            const title = prompt('Enter goal title:');
            const target = prompt('Enter target (e.g., 5 for "Read 5 books"):');
            
            if (title && target) {
                const goal = {
                    id: goalIdCounter++,
                    title,
                    target: parseInt(target),
                    current: 0,
                    createdAt: new Date().toISOString()
                };
                
                goals.push(goal);
                saveData();
                renderGoals();
            }
        }

        function updateGoalProgress(goalId, increment) {
            const goal = goals.find(g => g.id === goalId);
            if (goal) {
                goal.current = Math.max(0, Math.min(goal.target, goal.current + increment));
                saveData();
                renderGoals();
            }
        }

        function deleteGoal(goalId) {
            goals = goals.filter(g => g.id !== goalId);
            saveData();
            renderGoals();
        }

        function renderGoals() {
            const goalsList = document.getElementById('goals-list');
            goalsList.innerHTML = '';

            goals.forEach(goal => {
                const percentage = Math.round((goal.current / goal.target) * 100);
                
                const goalCard = document.createElement('div');
                goalCard.className = 'goal-card';
                goalCard.innerHTML = `
                    <h3>${goal.title}</h3>
                    <p>Progress: ${goal.current} / ${goal.target} (${percentage}%)</p>
                    <div class="goal-progress">
                        <div class="goal-progress-bar" style="width: ${percentage}%"></div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-sm btn-primary" onclick="updateGoalProgress(${goal.id}, 1)">+1</button>
                        <button class="btn btn-sm btn-secondary" onclick="updateGoalProgress(${goal.id}, -1)">-1</button>
                        <button class="btn btn-sm" style="background: var(--danger-color); color: white;" onclick="deleteGoal(${goal.id})">Delete</button>
                    </div>
                `;
                
                goalsList.appendChild(goalCard);
            });
        }

        // Settings
        function clearAllData() {
            if (confirm('Are you sure you want to delete all tasks and goals? This cannot be undone.')) {
                tasks = [];
                goals = [];
                taskIdCounter = 1;
                goalIdCounter = 1;
                saveData();
                updateDashboard();
                renderTasks();
                renderGoals();
                alert('All data has been cleared successfully!');
            }
        }

        // Initialize the app
        function initApp() {
            loadTheme();
            updateDashboard();
            renderTasks();
            renderGoals();
            
            // Add sample data if no tasks exist
            if (tasks.length === 0) {
                addTask('Welcome to TaskMaster!', 'This is your first task. Try editing or moving it around.', '', 'medium', 'todo');
                addTask('Complete project documentation', 'Write comprehensive documentation for the new project features', '2025-06-15', 'high', 'progress');
                addTask('Review team feedback', 'Go through all team feedback and implement necessary changes', '2025-06-10', 'medium', 'todo');
                addTask('Setup development environment', 'Install and configure all necessary development tools', '', 'low', 'completed');
                
                updateDashboard();
                renderTasks();
            }
            
            // Add sample goals if no goals exist
            if (goals.length === 0) {
                goals.push({
                    id: goalIdCounter++,
                    title: 'Read 5 Books This Month',
                    target: 5,
                    current: 2,
                    createdAt: new Date().toISOString()
                });
                
                goals.push({
                    id: goalIdCounter++,
                    title: 'Complete 50 Tasks',
                    target: 50,
                    current: 12,
                    createdAt: new Date().toISOString()
                });
                
                goals.push({
                    id: goalIdCounter++,
                    title: 'Exercise 20 Days',
                    target: 20,
                    current: 8,
                    createdAt: new Date().toISOString()
                });
                
                saveData();
                renderGoals();
            }
        }

        // Additional drag and drop improvements
        document.addEventListener('DOMContentLoaded', function() {
            // Remove drop-zone class when dragging leaves
            document.querySelectorAll('.task-list').forEach(list => {
                list.addEventListener('dragleave', function(e) {
                    // Only remove if we're leaving the list entirely
                    if (!this.contains(e.relatedTarget)) {
                        this.classList.remove('drop-zone');
                    }
                });
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Alt + 1-6 for quick navigation
            if (e.altKey) {
                switch(e.key) {
                    case '1': showPage('home'); break;
                    case '2': showPage('dashboard'); break;
                    case '3': showPage('tasks'); break;
                    case '4': showPage('goals'); break;
                    case '5': showPage('add-task'); break;
                    case '6': showPage('settings'); break;
                }
            }
            
            // Ctrl/Cmd + N for new task
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                showPage('add-task');
                document.getElementById('task-title').focus();
            }
        });

        // Auto-save form data as user types
        const formInputs = ['task-title', 'task-description', 'task-deadline', 'task-priority', 'task-status'];
        formInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', function() {
                    const formData = {};
                    formInputs.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) formData[id] = el.value;
                    });
                    sessionStorage.setItem('taskmaster-draft', JSON.stringify(formData));
                });
            }
        });

        // Restore draft data
        function restoreDraft() {
            const draft = sessionStorage.getItem('taskmaster-draft');
            if (draft) {
                const formData = JSON.parse(draft);
                Object.keys(formData).forEach(inputId => {
                    const input = document.getElementById(inputId);
                    if (input && formData[inputId]) {
                        input.value = formData[inputId];
                    }
                });
            }
        }

        // Clear draft when form is submitted
        document.getElementById('task-form').addEventListener('submit', function() {
            sessionStorage.removeItem('taskmaster-draft');
        });

        // Task filtering and search
        function filterTasks(priority = null, status = null, searchTerm = '') {
            let filteredTasks = tasks;
            
            if (priority) {
                filteredTasks = filteredTasks.filter(task => task.priority === priority);
            }
            
            if (status) {
                filteredTasks = filteredTasks.filter(task => task.status === status);
            }
            
            if (searchTerm) {
                filteredTasks = filteredTasks.filter(task => 
                    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            return filteredTasks;
        }

        // Export/Import functionality
        function exportData() {
            const data = {
                tasks,
                goals,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `taskmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        }

        function importData(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.tasks && data.goals) {
                        if (confirm('This will replace all current data. Continue?')) {
                            tasks = data.tasks;
                            goals = data.goals;
                            saveData();
                            updateDashboard();
                            renderTasks();
                            renderGoals();
                            alert('Data imported successfully!');
                        }
                    }
                } catch (error) {
                    alert('Invalid file format!');
                }
            };
            reader.readAsText(file);
        }

        // Performance optimization - debounced updates
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Debounced dashboard update
        const debouncedUpdateDashboard = debounce(updateDashboard, 300);

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            initApp();
            restoreDraft();
            
            // Add subtle animations on page load
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });

        // Service Worker registration for offline functionality (if needed)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                // Service worker code would go here for offline functionality
                console.log('TaskMaster loaded successfully!');
            });
        }

        // Add some Easter eggs and tips
        const tips = [
            "💡 Tip: Use Alt + 1-6 to quickly navigate between pages!",
            "💡 Tip: Use Ctrl/Cmd + N to quickly add a new task!",
            "💡 Tip: Drag and drop tasks between columns to change their status!",
            "💡 Tip: Set deadlines to track overdue tasks on your dashboard!",
            "💡 Tip: Use the priority system to focus on what matters most!"
        ];

        function showRandomTip() {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            console.log(randomTip);
        }

        // Show a random tip every 30 seconds
        setInterval(showRandomTip, 30000);

    