# Vote Guard

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Animation-Framer_Motion-black?style=flat&logo=framer)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat)

**Vote Guard** is a secure electronic voting system prototype designed to ensure voter eligibility and data integrity. This repository contains the **Frontend** application, providing a modern, responsive user interface for voters to register, authenticate, and cast their votes securely.

The system interacts with the [Vote Guard Server](https://github.com/mouniksai/vote-guard-server) (Backend) to handle data persistence and business logic.

---

##  Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### User Authentication & Security
* **Secure Login & Registration:** Seamless onboarding flows.
* **Multi-Factor Authentication (MFA):** Enhanced security via Email & Mobile OTP integration.
* **Identity Verification:** Real-time validation of Citizen IDs against a simulated Government Registry.

### Voter Dashboard
* **Personalized Hub:** A dedicated space for voters to view their status.
* **Election Tracking:** View details for upcoming, active, and past elections.

### Voting Interface
* **Secure Casting:** robust mechanism to ensure votes are cast anonymously and securely.
* **Candidate Insights:** Detailed display of candidate profiles and manifestos to inform voters.

### Modern UI/UX
* **Responsive Design:** Built with **Tailwind CSS** for a flawless experience on mobile, tablet, and desktop.
* **Smooth Interactions:** Fluid animations and transitions powered by **Framer Motion**.

---

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 | React framework with App Router |
| **Library** | React 18 | UI component library |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Animations** | Framer Motion | Production-ready animation library |
| **Icons** | Lucide React | Beautiful & consistent icon pack |

---

## Project Structure

```
vote-guard/
├── app/                  # Next.js App Router pages and layouts
│   ├── login/            # Authentication pages
│   ├── dashboard/        # Voter dashboard (Protected routes)
│   ├── admin/            # Admin interface
│   ├── layout.js         # Root layout
│   └── page.js           # Entry point (Landing page)
├── components/           # Reusable UI components
├── public/               # Static assets (images, fonts)
├── styles/               # Global styles (globals.css)
├── middleware.js         # Edge middleware for route protection
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Project dependencies and scripts

```
## Getting Started
**Prerequisites**

    Node.js (v18 or higher recommended)

    npm or yarn package manager

**Installation**

  Clone the repository:
    
  git clone [https://github.com/mouniksai/vote-guard.git](https://github.com/mouniksai/vote-guard.git)
  ```
    cd vote-guard
   ```
  Install dependencies:
   ```
    npm install
    # or
    yarn install
   ```

## Configuration

Create a .env.local file in the root directory to configure your environment variables.
```
  # URL of the Vote Guard Backend Server
  NEXT_PUBLIC_API_URL=http://localhost:5001/api
```
    Note: Ensure your backend server is running on the specified port before starting the frontend.

## Running the Application

Development Mode:
```
npm run dev
```
Open http://localhost:3000 with your browser to see the result.

Production Build:
```
npm run build
npm start
```

## Contributing

We welcome contributions! Please follow these steps:

  Fork the repository.

  Create a new feature branch:
   ```
    git checkout -b feature/YourFeature
  ```
  Commit your changes:
  ```
    git commit -m 'Add some feature'
  ```
  Push to the branch:
  ```
    git push origin feature/YourFeature
  ```
  Open a Pull Request.

## License

This project is licensed under the ISC License.
