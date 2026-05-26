# 🏢 NEEPCO Guest House Booking System

A premium, secure, and modern web application designed to streamline the reservation and management of NEEPCO guest houses for officers and administrators. Built with a robust Python/Flask backend and a lightning-fast React/Vite frontend.

---

## 🌟 Key Features

### 👤 For Officers (Users)
- **Interactive Guest House Catalog**: Explore available guest houses with details on location, capacity, rooms, and premium amenities.
- **Seamless Date Picking**: Interactive, smart date ranges preventing duplicate or double bookings.
- **My Bookings Dashboard**: Track the status of booking requests (Pending, Approved, Rejected, Cancelled) in real time.
- **Instant Filters & Search**: Search by location or capacity to find the perfect stay.

### 🔑 For Administrators (Admins)
- **Centralized Admin Dashboard**: Single-pane interface containing quick metrics on bookings and pending approvals.
- **One-Click Approvals**: Review pending booking requests and approve or reject them instantly.
- **Master Bookings Registry**: A comprehensive list of all historical bookings across all guest houses, searchable and sortable.

### 🛡️ Core Infrastructure & Security
- **Role-Based JWT Authentication**: Secure access separation for Users and Admins using JSON Web Tokens.
- **Bi-directional Data Sync**: Automatically syncs raw transactions between CSV files (`data/bookings.csv` and `data/users.csv`) and a high-performance SQLite database (`instance/bookings.db`) utilizing Pandas.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Routing**: React Router DOM (v7)
- **Styling**: TailwindCSS & Custom CSS (Harmonious glassmorphic UI)
- **Icons & UI Utilities**: date-fns (Date manipulation), react-datepicker
- **HTTP Client**: Axios (configured with interceptors for JWT injection)

### Backend
- **Framework**: Python 3.13 / Flask
- **Authentication**: Flask-JWT-Extended
- **CORS Management**: Flask-CORS
- **Environment Config**: python-dotenv
- **Data Engineering**: Pandas & NumPy (handling CSV database synchronization and query processing)
- **Database**: SQLite (local storage)

---

## 📂 Repository Structure

```
GuestHouse/
├── backend/
│   ├── app/
│   │   ├── __init__.py      # App factory and initialization
│   │   ├── auth.py          # Auth blueprint & JWT generation
│   │   ├── routes.py        # API routing & resource logic
│   │   ├── services.py      # Core data services and CSV/SQLite synchronization
│   │   └── utils.py         # Validation and general helpers
│   ├── data/
│   │   ├── bookings.csv     # Persistent CSV booking registry
│   │   ├── guesthouses.csv  # Guest house listings
│   │   └── users.csv        # Pre-configured user/admin registry
│   ├── instance/
│   │   └── bookings.db      # High-performance SQLite database
│   ├── .env                 # Backend environment secrets
│   ├── run.py               # Main entry point (port 5001)
│   └── venv/                # Python virtual environment
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── assets/          # Static images
│   │   ├── components/      # UI components (Admin/User/Shared)
│   │   │   ├── Admin/       # Admin Dashboards & Tables
│   │   │   ├── Auth/        # LoginPage component
│   │   │   ├── Shared/      # Navbar & Protected routes
│   │   │   └── User/        # Booking modal & Guest house lists
│   │   ├── context/         # Authentication Context providers
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx          # Route configurations
│   │   └── main.jsx         # App entry point
│   ├── .env                 # Frontend environment variables
│   ├── package.json         # Dependencies & scripts
│   ├── tailwind.config.js   # Tailwind configurations
│   └── vite.config.js       # Vite build setup
└── README.md                # Premium documentation (this file)
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have the following installed on your machine:
* **Python 3.10+**
* **Node.js 18+** & **npm**

---

### 1. Backend Installation & Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate the pre-configured Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```
3. Confirm environment variables inside `.env`:
   ```ini
   FLASK_APP=run.py
   FLASK_ENV=development
   JWT_SECRET_KEY=your-super-secret-and-long-key
   ```
4. Start the Flask server:
   ```bash
   python run.py
   ```
   *The backend will boot on **[http://localhost:5001](http://localhost:5001)***.

---

### 2. Frontend Installation & Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Verify your backend API endpoint in `.env`:
   ```ini
   VITE_API_BASE_URL=http://localhost:5001/api
   ```
4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on **[http://localhost:5173](http://localhost:5173)***.

---

## 🔌 API Endpoints Reference

### 🔐 Authentication
* `POST /api/login` - Authenticates user & returns JWT access token and user role payload.

### 🏢 Guest Houses
* `GET /api/guesthouses` - Returns lists of all available guest houses along with details.

### 📅 Bookings
* `GET /api/bookings/my` - Retrieves the active authenticated user's personal booking requests.
* `POST /api/bookings` - Initiates a guest house booking request.
* `GET /api/bookings` - *(Admin Only)* Returns all guest house bookings in the registry.
* `POST /api/bookings/<booking_id>/approve` - *(Admin Only)* Approves a booking request.
* `POST /api/bookings/<booking_id>/reject` - *(Admin Only)* Rejects a booking request.
* `POST /api/bookings/<booking_id>/cancel` - Cancels an existing booking.

---

## 🧪 Pre-configured Accounts

Use these pre-seeded accounts in `backend/data/users.csv` to explore the system:

| Username | Password | Role |
|---|---|---|
| `neepco_admin` | `rootadmin` | **Admin** |
| `Deepankar` | `papa123` | **Admin** |
| `Anubhav123` | `securepass` | **User** |
| `testuser` | `testpass` | **User** |
