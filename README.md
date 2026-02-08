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

```bash
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
