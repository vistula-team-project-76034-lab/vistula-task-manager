// Task Manager – plain JavaScript + Supabase REST API (PostgREST)
// Configuration (URL, publishable key, table name) is loaded from config.json.

let config = null;     // { supabaseUrl, supabasePublishableKey, tableName }
let editingId = null;  // id of the task being edited, or null when adding

const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descriptionInput = document.getElementById('task-description');
const submitButton = document.getElementById('task-submit');
const cancelButton = document.getElementById('task-cancel');
const formHeading = document.getElementById('form-heading');
const taskList = document.getElementById('task-list');
const statusMessage = document.getElementById('status-message');

// ---------- helpers ----------

function showStatus(text, type) {
  statusMessage.textContent = text;
  statusMessage.className = type || '';
}

function apiUrl(query) {
  const base = config.supabaseUrl.replace(/\/+$/, '');
  return base + '/rest/v1/' + config.tableName + (query || '');
}

// Sends a request to the Supabase REST API and returns parsed JSON (or null).
// Throws an Error with a readable message if the request fails.
async function api(method, query, body) {
  const options = {
    method: method,
    headers: {
      // Publishable keys (sb_publishable_...) go in the apikey header only.
      'apikey': config.supabasePublishableKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(apiUrl(query), options);
  } catch (networkError) {
    throw new Error('Network error – could not reach Supabase. Check your internet connection and supabaseUrl in config.json.');
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = text; }
  }

  if (!response.ok) {
    const details = data && data.message ? data.message : (typeof data === 'string' ? data : '');
    throw new Error('Server error ' + response.status + (details ? ': ' + details : ''));
  }
  return data;
}

// ---------- CRUD operations ----------

// GET /tasks?select=*
function getAllTasks() {
  return api('GET', '?select=*&order=id.asc');
}

// GET /tasks?id=eq.1&select=*
async function getTaskById(id) {
  const rows = await api('GET', '?id=eq.' + encodeURIComponent(id) + '&select=*');
  return rows && rows.length ? rows[0] : null;
}

// POST /tasks
function createTask(title, description) {
  return api('POST', '', { title: title, description: description, completed: false });
}

// PUT /tasks?id=eq.1  – sends the complete record (id, title, description, completed)
function saveTask(task) {
  return api('PUT', '?id=eq.' + encodeURIComponent(task.id), {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed
  });
}

// DELETE /tasks?id=eq.1
function deleteTask(id) {
  return api('DELETE', '?id=eq.' + encodeURIComponent(id));
}

// ---------- rendering ----------

function renderTasks(tasks) {
  taskList.innerHTML = '';

  if (!tasks || tasks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No tasks yet. Add your first task above.';
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach(function (task) {
    const item = document.createElement('div');
    item.className = 'task-item' + (task.completed ? ' done' : '');
    item.dataset.id = task.id;

    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.title;

    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = task.description || '';

    const status = document.createElement('p');
    status.className = 'task-status';
    status.textContent = task.completed ? 'Completed' : 'Not completed';

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'toggle-task';
    toggleBtn.textContent = task.completed ? 'Mark incomplete' : 'Mark complete';
    toggleBtn.addEventListener('click', function () { onToggle(task.id); });

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-task';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () { onEdit(task.id); });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-task';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function () { onDelete(task.id); });

    actions.append(toggleBtn, editBtn, deleteBtn);
    item.append(title, description, status, actions);
    taskList.appendChild(item);
  });
}

async function loadTasks() {
  try {
    const tasks = await getAllTasks();
    renderTasks(tasks);
  } catch (error) {
    showStatus('Could not load tasks. ' + error.message, 'error');
  }
}

// ---------- form: add / edit ----------

function resetForm() {
  editingId = null;
  form.reset();
  submitButton.textContent = 'Add task';
  formHeading.textContent = 'Add a new task';
  cancelButton.hidden = true;
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  if (!title) {
    showStatus('Task title is required.', 'error');
    return;
  }

  submitButton.disabled = true;
  try {
    if (editingId === null) {
      await createTask(title, description);
      showStatus('Task added.', 'success');
    } else {
      const current = await getTaskById(editingId);
      if (!current) throw new Error('This task no longer exists.');
      await saveTask({ id: current.id, title: title, description: description, completed: current.completed });
      showStatus('Task updated.', 'success');
    }
    resetForm();
    await loadTasks();
  } catch (error) {
    showStatus('Could not save the task. ' + error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
});

cancelButton.addEventListener('click', function () {
  resetForm();
  showStatus('', '');
});

// ---------- task buttons ----------

async function onEdit(id) {
  try {
    const task = await getTaskById(id);
    if (!task) throw new Error('This task no longer exists.');
    editingId = task.id;
    titleInput.value = task.title;
    descriptionInput.value = task.description || '';
    submitButton.textContent = 'Save changes';
    formHeading.textContent = 'Edit task #' + task.id;
    cancelButton.hidden = false;
    titleInput.focus();
    showStatus('Editing task #' + task.id + '.', '');
  } catch (error) {
    showStatus('Could not open the task for editing. ' + error.message, 'error');
  }
}

async function onToggle(id) {
  try {
    const task = await getTaskById(id);
    if (!task) throw new Error('This task no longer exists.');
    task.completed = !task.completed;
    await saveTask(task);
    showStatus(task.completed ? 'Task marked as completed.' : 'Task marked as incomplete.', 'success');
    await loadTasks();
  } catch (error) {
    showStatus('Could not change the task status. ' + error.message, 'error');
  }
}

async function onDelete(id) {
  try {
    await deleteTask(id);
    if (editingId === id) resetForm();
    showStatus('Task deleted.', 'success');
    await loadTasks();
  } catch (error) {
    showStatus('Could not delete the task. ' + error.message, 'error');
  }
}

// ---------- start ----------

async function init() {
  try {
    const response = await fetch('config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    config = await response.json();
  } catch (error) {
    showStatus('Could not load config.json. ' + error.message, 'error');
    return;
  }

  if (!config.supabaseUrl || !config.supabasePublishableKey || !config.tableName ||
      config.supabaseUrl.indexOf('YOUR_PROJECT_ID') !== -1) {
    showStatus('config.json is not filled in yet: set supabaseUrl and supabasePublishableKey.', 'error');
    return;
  }

  await loadTasks();
}

init();
