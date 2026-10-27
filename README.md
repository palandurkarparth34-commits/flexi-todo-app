# TaskMaster

Full-stack task management application with a Node.js/Express backend, MongoDB persistence, and a React/Vite/Tailwind CSS frontend.

---

## Tech Stack

### Backend
- Runtime: Node.js (ES Modules)
- Framework: Express 4
- Database: MongoDB with Mongoose ODM
- Authentication: JSON Web Tokens (jsonwebtoken) and bcryptjs
- Security: Helmet, CORS, and express-rate-limit
- Logging: Morgan

### Frontend
- Framework: React 18
- Build Tool: Vite 6
- Styling: Tailwind CSS
- Icons: Lucide React
- HTTP Client: Axios

---

## Features

### Authentication and Authorization
- User registration and login with email and password.
- Password hashing with salted bcrypt before saving to MongoDB.
- Bearer token authentication via JWT.
- Automatic password field exclusion from queries (`select: false`).
- Resource authorization ensuring users can only read, update, or delete their own tasks.
- Rate limiting on authentication routes to mitigate brute-force attacks.

### Todo Management
- Full CRUD operations: Create, Read, Update, Delete tasks.
- Toggle task status (pending/completed) with immediate UI update.
- Priority levels: Low, Medium, High.
- Due date tracking with automatic overdue calculation.
- Tagging support per task.
- Multi-field filtering: search query, completion status, priority, and tags.
- Sorting options: creation date, due date, priority, and title.
- Pagination support for high-volume task lists.
- Bulk clear completed tasks.
- Aggregated dashboard statistics (total tasks, completed, pending, high priority).

---

## Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection and lifecycle events
│   │   ├── controllers/
│   │   │   ├── authController.js     # User authentication controllers
│   │   │   └── todoController.js     # Task CRUD and aggregation controllers
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification middleware
│   │   │   ├── errorMiddleware.js    # Global 404 and error handlers
│   │   │   └── rateLimiter.js        # Endpoint rate limiters
│   │   ├── models/
│   │   │   ├── User.js               # User schema and hooks
│   │   │   └── Todo.js               # Todo schema and compound indexes
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth route definitions
│   │   │   └── todoRoutes.js         # /api/todos route definitions
│   │   ├── utils/
│   │   │   ├── apiResponse.js        # Standardized JSON response envelope
│   │   │   └── generateToken.js      # JWT signing utility
│   │   ├── server.js                 # Express app configuration
│   │   └── testIntegration.js        # Automated integration test suite
│   ├── .env                          # Backend environment variables
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js        # Axios instance with request/response interceptors
│   │   │   ├── authApi.js            # Authentication API calls
│   │   │   └── todoApi.js            # Todo API calls
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx        # Reusable button component
│   │   │   │   ├── Input.jsx         # Form input component
│   │   │   │   ├── Modal.jsx         # Accessible modal dialog
│   │   │   │   └── Badge.jsx         # Priority and status badges
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx        # Navigation header
│   │   │   └── todo/
│   │   │       ├── TodoStats.jsx     # Metrics overview cards
│   │   │       ├── TodoFilters.jsx   # Search and filter bar
│   │   │       ├── TodoItem.jsx      # Task item component
│   │   │       ├── TodoFormModal.jsx # Add / Edit modal dialog
│   │   │       └── EmptyState.jsx    # Empty list placeholder
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Global authentication provider
│   │   │   └── ToastContext.jsx      # Global toast notification provider
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env
│   └── package.json
│
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- MongoDB (running locally on port 27017 or a MongoDB Atlas connection string)

### 1. Environment Configuration

#### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/todo-app
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

#### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=/api
```

*(Note: In development, Vite automatically proxies `/api` requests to `http://localhost:5000` as configured in `frontend/vite.config.js`.)*

### 2. Dependency Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Running the Application

Open two terminal windows:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```
The backend server runs on `http://localhost:5000`.

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```
The frontend dev server runs on `http://localhost:5173`. Open this URL in your browser.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Authenticate user & issue JWT | No |
| GET | `/auth/me` | Fetch logged-in user profile | Yes (Bearer token) |
| PUT | `/auth/profile` | Update profile / change password | Yes (Bearer token) |

#### Registration Request Example
`POST /api/auth/register`
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123"
}
```

#### Standard Success Response
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "67be8429712a4b8e21938b81",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "createdAt": "2026-10-27T15:45:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Todo Endpoints

All todo routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/todos` | Get paginated todos with filters and sort |
| GET | `/todos/stats` | Get overview metrics (total, pending, completed, etc.) |
| GET | `/todos/:id` | Get single todo by ID |
| POST | `/todos` | Create a new todo |
| PUT | `/todos/:id` | Update an existing todo |
| PATCH | `/todos/:id/toggle` | Toggle completion status |
| DELETE | `/todos/:id` | Delete a todo |
| DELETE | `/todos/bulk/completed` | Delete all completed todos for current user |

#### Query Parameters for `GET /api/todos`:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `completed`: Filter by status (`true` or `false`)
- `priority`: Filter by priority (`low`, `medium`, `high`)
- `tag`: Filter by tag string
- `search`: Case-insensitive text search matching title and description
- `sortBy`: Field to sort by (`createdAt`, `dueDate`, `priority`, `title`)
- `order`: Sort direction (`asc` or `desc`)

#### Create Todo Request Example
`POST /api/todos`
```json
{
  "title": "Set up production monitoring",
  "description": "Configure health checks and error alerts",
  "priority": "high",
  "dueDate": "2026-11-01T00:00:00.000Z",
  "tags": ["infrastructure", "ops"]
}
```

---

## Database Indexes

The `Todo` collection defines compound indexes to ensure queries remain performant as collection size grows:
- `{ user: 1, completed: 1 }`
- `{ user: 1, priority: 1 }`
- `{ user: 1, dueDate: 1 }`
- `{ user: 1, createdAt: -1 }`

---

## Testing

An automated integration test script is included in the backend:
```bash
cd backend
npm test
```
The test verifies:
1. Health check endpoint (`GET /api/health`).
2. User registration and JWT issuance.
3. User login and token validation.
4. Protected profile retrieval (`GET /api/auth/me`).
5. Task creation with priority, due date, and tags.
6. Paginated retrieval and filtering.
7. Task aggregation metrics (`GET /api/todos/stats`).
8. Completion status toggling.
9. Task updates.
10. Task deletion and database cleanup.

---

## Production Build

### Frontend
```bash
cd frontend
npm run build
```
Generates production-ready HTML, CSS, and minified JS bundles in `frontend/dist/`.

### Backend
```bash
cd backend
npm start
```
Starts the Node.js production server without file watcher overhead.
