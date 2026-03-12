# College Club Management System (CCMS) - Beginner's Guide

This guide will help you run the project from scratch.

## Prerequisites
Before you begin, make sure you have these installed:
1.  **Node.js**: [Download here](https://nodejs.org/) (Install the "LTS" version).
2.  **MongoDB Community Server**: [Download here](https://www.mongodb.com/try/download/community) (Run the installer and click "Next" until finished).

## Step-by-Step Setup

### Step 1: Start the Backend (Server)
This handles the database and API.

1.  Open your terminal (Command Prompt or PowerShell).
2.  Navigate to the project folder:
    ```bash
    cd c:\Users\acer\.gemini\antigravity\playground\rapid-meteor
    ```
3.  Go into the server folder:
    ```bash
    cd server
    ```
4.  Install the required tools:
    ```bash
    npm install
    ```
5.  Start the server:
    ```bash
    npm run dev
    ```
    > **Success Message:** You should see: `Server running on port 5000` and `MongoDB Connected`.
    > **Keep this terminal window OPEN.**

### Step 2: Start the Frontend (Client)
This runs the website interface.

1.  Open a **NEW** terminal window (do not close the first one).
2.  Navigate to the project folder again:
    ```bash
    cd c:\Users\acer\.gemini\antigravity\playground\rapid-meteor
    ```
3.  Go into the client folder:
    ```bash
    cd client
    ```
4.  Install the required tools:
    ```bash
    npm install
    ```
5.  Start the website:
    ```bash
    npm run dev
    ```
    > **Success Message:** You will see a URL like `http://localhost:5173`.

### Step 3: View the App
1.  Open your web browser (Chrome, Edge, etc.).
2.  Type `http://localhost:5173` in the address bar.
3.  You should now see the Login Page!

## Default Users (To Test)
Since the database is empty, you can:
1.  Click **"Create a new account"** on the login page.
2.  Register as a **Student** or **Admin**.

## Troubleshooting
-   **"npm is not recognized"**: Restart your computer after installing Node.js.
-   **"MongoDB connection error"**: Search for "Services" in Windows Start Menu, find "MongoDB Server", right-click and select "Start".
-   **Styles look broken**: Stop the client (Ctrl+C) and run `npm run dev` again.
