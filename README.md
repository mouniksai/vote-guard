# Vote Guard

Vote Guard is a secure electronic voting system prototype designed to ensure voter eligibility and data integrity. It utilizes a hybrid database architecture, leveraging PostgreSQL for immutable government citizen registries and MongoDB for flexible user authentication.

## Features

- **Citizen Verification**: Verifies user identity against a simulated Government Node (PostgreSQL).
- **Hybrid Database System**:
  - **PostgreSQL**: Stores sensitive citizen data (Government Registry).
  - **MongoDB**: Handles user accounts and application-specific data.
- **Secure Authentication**:
  - Password hashing using `bcryptjs`.
  - Prevents duplicate registration for the same Citizen ID.
- **Modern Frontend**: Built with Next.js and styled with Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Databases**: PostgreSQL, MongoDB

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL installed and running
- MongoDB installed and running

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vote-guard
   ```

2. **Install dependencies:**
   ```bash
   # Install root dependencies (Next.js)
   npm install

   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

### Database Setup

#### 1. PostgreSQL (Government Node)
Create a database (e.g., `vote_guard`) and a table named `citizens`:

```sql
CREATE TABLE citizens (
    citizen_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    mobile VARCHAR(20)
);

-- Insert dummy data for testing
INSERT INTO citizens (citizen_id, full_name, email, mobile) VALUES ('CIT-12345', 'Alice Smith', 'alice@example.com', '555-0199');
```

#### 2. MongoDB
Ensure your MongoDB instance is running. The application will automatically create the `users` collection upon the first successful registration.

### Running the Application

To start the development environment (Frontend + Backend):

```bash
npm run dev
```

> **Note**: Ensure your `package.json` is configured to run both the Next.js app (port 3000) and the Express server (port 5000) concurrently.

## 📡 API Endpoints

The Express server runs on port `5000`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/verify-citizen` | Checks if a Citizen ID exists in the Government Registry (Postgres). |
| `POST` | `/api/register` | Registers a new user in MongoDB if the Citizen ID is valid and not taken. |
| `POST` | `/api/login` | Authenticates a user and retrieves linked citizen details from Postgres. |
