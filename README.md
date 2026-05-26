## 📋 Project Overview

The **NEEPCO Guest House Booking System** is an enterprise-grade digital solution designed for the North Eastern Electric Power Corporation (NEEPCO). The system replaces manual, paper-based, or fragmented booking procedures with a unified, high-performance, and responsive digital platform.

### 💡 The Operational Challenge & Solution
NEEPCO manages multiple guest houses across diverse geographical locations to accommodate officers traveling on duty or personal leave. Coordinating room availability, capacity, and approval hierarchies manually can lead to scheduling conflicts (double bookings) and administrative overhead. 

This application resolves these challenges by providing:
1. **Real-time Availability Tracking**: Instant access to guest house capacities, room status, and active reservations.
2. **Automated Approval Workflow**: Booking requests submitted by officers are securely queued for administrator review with clear audit status.
3. **Fail-safe Synchronization**: A dual-layer data architecture that combines the accessibility of plain CSV files (ideal for quick manual checks and reports) with the relational query power of SQLite.

### 🔄 Dual-Layer Data Sync Engine
To ensure high reliability and low latency, the system utilizes a unique synchronization model managed by the backend:
* **Write Path**: Bookings are processed and validated, written to the SQLite database (`instance/bookings.db`) for transaction safety, and then instantly flushed to `data/bookings.csv` for human-readable persistence.
* **Read Path**: The Flask server queries SQLite directly, delivering fast, indexed response times to the React frontend.
* **Startup Reconciliation**: On server boot, the application performs an automated initialization that parses the CSV registries, synchronizes any manual CSV edits, and updates the SQLite database seamlessly.

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
