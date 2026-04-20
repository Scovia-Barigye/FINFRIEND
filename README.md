# FinFriend – Financial Literacy Platform

FinFriend is a dedicated financial literacy platform designed specifically for Ugandan university students. It aims to empower students with the knowledge and tools necessary to manage their finances effectively, plan for the future, and achieve financial independence.

## Core Features

- **Learning Modules**: Interactive courses covering essential topics such as budgeting, saving, debt management, and investing.
- **Financial Tools**: A suite of tools including budget planners and financial calculators to help students track and manage their money.
- **Community Forum**: A platform for students to engage in discussions, share experiences, and seek advice on various financial topics.
- **Expert Blog**: Regularly updated insights and tips from financial experts tailored to the needs of university students.
- **Gamified Experience**: Earn badges and climb the leaderboard as you progress through learning modules and engage with the community.
- **Personalized Dashboard**: A central hub to track your learning progress, view achievements, and access your favorite tools.

---

# Setup Instructions

Follow the steps below to run FinFriend locally on your laptop.

---

## Prerequisites

Make sure the following tools are installed before you begin:

| Tool              | Minimum Version               | Download                         |
| ----------------- | ----------------------------- | -------------------------------- |
| **Node.js** | v18+                          | https://nodejs.org               |
| **npm**     | v9+*(bundled with Node.js)* | —                               |
| **MySQL**   | v8.0+                         | https://dev.mysql.com/downloads/ |
| **Git**     | Any recent version            | https://git-scm.com              |

---

## macOS Setup

1. **Install Homebrew** *(if not already installed)*:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. **Install Node.js:**

   ```bash
   brew install node
   ```
3. **Install MySQL:**

   ```bash
   brew install mysql
   brew services start mysql
   mysql_secure_installation
   ```
4. **Clone the repository:**

   ```bash
   git clone https://github.com/<your-username>/finfriend.git
   cd finfriend
   ```
5. **Install project dependencies:**

   ```bash
   npm install
   ```
6. **Create the environment file:**

   ```bash
   touch .env
   ```

   Open `.env` and add:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_root_password
   DB_NAME=finfriend
   JWT_SECRET=replace_with_a_long_random_string
   JWT_EXPIRES_IN=7d
   ```
7. **Set up the database:**

   ```bash
   npm run db:init
   npm run db:seed
   ```
8. **Start the app:**

   ```bash
   npm run dev
   ```

   Open your browser at **http://localhost:3000**

---

## Linux (Ubuntu / Debian) Setup

1. **Install Node.js:**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. **Install MySQL:**

   ```bash
   sudo apt update
   sudo apt install mysql-server -y
   sudo systemctl start mysql
   sudo systemctl enable mysql
   sudo mysql_secure_installation
   ```
3. **Allow password-based root login** *(if prompted during db:init)*:

   ```bash
   sudo mysql
   ```

   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
   FLUSH PRIVILEGES;
   EXIT;
   ```
4. **Clone the repository:**

   ```bash
   git clone https://github.com/<your-username>/finfriend.git
   cd finfriend
   ```
5. **Install project dependencies:**

   ```bash
   npm install
   ```
6. **Create the environment file:**

   ```bash
   nano .env
   ```

   PORTAdd the following (save with `Ctrl+O`, exit with `Ctrl+X`):

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_root_password
   DB_NAME=finfriend
   JWT_SECRET=replace_with_a_long_random_string
   JWT_EXPIRES_IN=7d
   ```
7. **Set up the database:**

   ```bash
   npm run db:init
   npm run db:seed
   ```
8. **Start the app:**

   ```bash
   npm run dev
   ```

   Open your browser at **http://localhost:3000**

---

## Windows Setup

1. **Install Node.js:**
   Download and run the Windows installer (`.msi`) from https://nodejs.org. Make sure to check *"Add to PATH"* during installation.
2. **Install MySQL:**
   Download **MySQL Installer** from https://dev.mysql.com/downloads/installer/ and follow the setup wizard. Note the root password you set.
3. **Install Git:**
   Download from https://git-scm.com and install with the default options.
4. **Open a terminal:**
   Use **Command Prompt**, **PowerShell**, or **Git Bash** (recommended).
5. **Clone the repository:**

   ```bash
   git clone https://github.com/<your-username>/finfriend.git
   cd finfriend
   ```
6. **Install project dependencies:**

   ```bash
   npm install
   ```

   > If `nodemon` is not recognised, install it globally:
   >
   > ```bash
   > npm install -g nodemon
   > ```
   >
7. **Create the environment file:**
   In the `finfriend` folder, create a new file called `.env` (use Notepad or any text editor) and add:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_root_password
   DB_NAME=finfriend
   JWT_SECRET=replace_with_a_long_random_string
   JWT_EXPIRES_IN=7d
   ```
8. **Set up the database:**

   ```bash
   npm run db:init
   npm run db:seed
   ```
9. **Start the app:**

   ```bash
   npm run dev
   ```

   Open your browser at **http://localhost:3000**

---

> **⚠️ Important:** Never commit your `.env` file to GitHub. It contains sensitive credentials and should always be listed in `.gitignore`.
