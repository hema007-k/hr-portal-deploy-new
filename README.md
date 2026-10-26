# HR Portal - Django (Attendance, Employees, Projects)

Bright sky/ocean theme (water blue + orange, with an optional Dark mode button in the sidebar) web app (Django + Bootstrap 5 + CSS + JS) with a **Tkinter desktop launcher**
and a **REST API** ready for a future **Flutter** (iOS / Android) app.

## Screens (from the wireframe)
| Login type | Pages |
|---|---|
| Individual user | Home: department card, Present/Absent + **In Time / Out Time**, monthly attendance, **daily in/out history (today, yesterday, last 30 days)**, in-progress projects |
| HR / Admin | **Click any employee name** for full details (profile, today in/out, monthly attendance, projects, 30-day history; Back returns to the table). Home: employee table with **today's in/out time per employee** + Organization Snapshot + quick actions, **Employee** (add / edit / delete / search), **Project** (add / edit / delete, assign employees, status) |

Same header (company name + logo) on every page.

## v5 additions
Separate **Employee login** (`/login/`) and **Admin / HR login** (`/admin-login/`), unique employee codes, designations with permissions, leave credit + leave requests,
monthly / yearly filters, office vs field days, project completion % and project working days that subtract employee leave, `python manage.py check_db`.
See `RUN_GUIDE.md` (section 11) for the full list.

## Demo logins (created on first run)
| Role | Username | Password |
|---|---|---|
| Super Admin | `admin` | `admin123` |
| HR | `hr` | `hr12345` |
| Employee | `arun` / `priya` / `vijay` | `arun123` / `priya123` / `vijay123` |

Change these before using it for real.

## Quick start (VS Code)
1. Unzip, open the `hr_portal` folder in VS Code (needs Python 3.10+; Tkinter is included with the normal Python installer).
2. Open the VS Code terminal and run:

**Windows**
```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run_desktop.py
```
(or just double-click `run.bat`)

**Mac / Linux**
```
./run.sh
```

`run_desktop.py` opens a small Tkinter window. It prepares the database, starts the server and
opens `http://127.0.0.1:8000/` in your browser. Use its buttons to Open / Stop the server.

### Without Tkinter (plain Django)
```
python manage.py makemigrations portal
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```
Run tests: `python manage.py test`

> The pages load Bootstrap from a CDN, so the first run needs internet access.

## Company name & logo
- Name: set `COMPANY_NAME` in `.env` (copy `.env.example` to `.env`).
- Logo: replace `static/img/logo.jpg` (keep the same file name). Login page photos: `static/img/bg-building1.jpg`, `bg-building2.jpg`.

## SQLite now -> PostgreSQL later
SQLite is the default (`db.sqlite3`). To switch, no code change is needed:
1. `pip install -r requirements-postgres.txt`
2. Create the database in PostgreSQL (`CREATE DATABASE hr_portal;`)
3. In `.env` set:
```
DB_ENGINE=postgres
DB_NAME=hr_portal
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=127.0.0.1
DB_PORT=5432
```
4. `python manage.py migrate` then `python manage.py seed_demo`

(To move existing SQLite data: `python manage.py dumpdata --exclude contenttypes --exclude auth.permission > data.json`, switch DB, `migrate`, then `loaddata data.json`.)

## REST API for Flutter (iOS + Android)
Token authentication. All under `/api/`.

| Method | URL | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/login/` | all | body `{"username","password"}` -> `{"token"}` |
| GET | `/api/me/` | all | profile + role |
| GET | `/api/dashboard/` | all | home screen data (today status, month summary, in-progress projects) |
| POST | `/api/attendance/clock-in/` | employee | In time |
| POST | `/api/attendance/clock-out/` | employee | Out time |
| GET | `/api/attendance/me/` | employee | this month's records + summary |
| GET/POST/PUT/DELETE | `/api/employees/` | HR/Admin | employee CRUD |
| GET/POST/PUT/DELETE | `/api/projects/` | read: all (own projects for employees), write: HR/Admin | projects |
| GET/POST... | `/api/departments/`, `/api/teams/` | read: all, write: HR/Admin | lookups |

Send the header `Authorization: Token <token>` on every request after login.
Android emulator reaches your PC at `http://10.0.2.2:8000`; iOS simulator uses `http://127.0.0.1:8000`.
For real phones run `python manage.py runserver 0.0.0.0:8000` and use your PC's LAN IP.

Flutter example:
```dart
final res = await http.post(Uri.parse('$base/api/auth/login/'),
    body: {'username': u, 'password': p});
final token = jsonDecode(res.body)['token'];
final dash = await http.get(Uri.parse('$base/api/dashboard/'),
    headers: {'Authorization': 'Token $token'});
```

## Project structure
```
hr_portal/
  manage.py
  run_desktop.py        <- Tkinter launcher
  run.bat / run.sh      <- one-click setup + launch
  requirements.txt  requirements-postgres.txt  .env.example
  config/               <- settings (SQLite/PostgreSQL switch), urls
  portal/
    models.py           <- Department, Team, Employee, Attendance, Project
    services.py         <- shared logic (clock in/out, monthly summary, roles)
    views.py forms.py urls.py        <- website
    api.py serializers.py api_urls.py <- REST API (Flutter)
    management/commands/seed_demo.py
    templates/portal/   <- HTML (Bootstrap)
    tests.py
  static/ css/app.css  js/app.js  img/logo.jpg + bg-building*.jpg
```

## Production notes
Set `DJANGO_DEBUG=0`, a strong `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, run `collectstatic`,
and serve with gunicorn/nginx.

---

## Added: PostgreSQL SQL files + Flutter app support

### `db/` folder (PostgreSQL)
| File | Purpose |
|---|---|
| `db/01_create_database.sql` | `CREATE DATABASE hr_portal` (+ optional app user) |
| `db/02_schema_postgres.sql` | All tables as plain SQL (reference / manual setup) |
| `db/03_useful_queries.sql` | Ready-made queries: today present/absent, monthly count, hours, projects... |

Recommended way to create the tables is still `python manage.py migrate`
(`portal/migrations/0001_initial.py` is now included, so it works on a fresh PostgreSQL database).
Full step-by-step: see `GUIDE.md` in the zip root.

### New API endpoints (used by the Flutter admin screens)
| Method | URL | Who | Purpose |
|---|---|---|---|
| GET | `/api/attendance/today/` | HR/Admin | today's in/out of every active employee |
| GET | `/api/employees/<id>/attendance/` | HR/Admin | one employee: month summary + last 30 days |

### Flutter app
Lives in `../hr_portal_app` (Android + iOS from one code base). See its README.
