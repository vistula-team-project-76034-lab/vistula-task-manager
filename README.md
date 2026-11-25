# Vistula Task Manager

A simple Task Manager web application created for the **Team Project – IT** course at Vistula University.
It lets you display, add, edit, complete/uncomplete and delete tasks. All data is stored in a
Supabase (PostgreSQL) database and accessed through the automatically generated Supabase REST API.

## Student

- **Student ID:** 76034
- **GitHub account:** vistula-team-project-76034-lab

## Links

- **Live application:** https://vistula-team-project-76034-lab.github.io/vistula-task-manager/
- **Repository:** https://github.com/vistula-team-project-76034-lab/vistula-task-manager
- **Contributor page:** https://vistula-team-project-76034-lab.github.io/vistula-task-manager/contribution.html
- **Contributor JSON:** https://vistula-team-project-76034-lab.github.io/vistula-task-manager/contribution.json

## Pull Requests (team collaboration)

- **Pull Request I created in my partner's repository:** PR_LINK_OUTGOING
- **Pull Request I received and merged into my repository:** PR_LINK_INCOMING

## Technologies

- HTML, CSS, JavaScript (no framework)
- Supabase (PostgreSQL) + Supabase REST API (`fetch()`)
- GitHub Pages hosting

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main Task Manager page |
| `app.js` | Application logic (CRUD via Supabase REST API) |
| `style.css` | Styling |
| `config.json` | Public Supabase configuration (URL, publishable key, table name) |
| `contribution.html` | Contributor page – added by my partner via Pull Request |
| `contribution.json` | Contributor student ID – added by my partner via Pull Request |

## REST API operations used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks?select=*` | Get all tasks |
| GET | `/tasks?id=eq.{id}&select=*` | Get a task by ID |
| POST | `/tasks` | Create a task |
| PUT | `/tasks?id=eq.{id}` | Save a complete task (edit / toggle status) |
| DELETE | `/tasks?id=eq.{id}` | Delete a task |

Only the public Supabase **publishable** key is included in this repository. The database contains test data only.
