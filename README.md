# Tic Tac Toe MERN Application

A full-stack Tic Tac Toe application built using the MERN stack. The project supports both single-player mode with an AI opponent and multiplayer mode, along with dynamic grid sizes and score tracking.

---

## Overview

This application provides an interactive and responsive Tic Tac Toe experience. It includes an AI opponent powered by the Minimax algorithm, real-time score updates, and a modern user interface.

---

## Features

* Single-player mode with AI (Minimax algorithm)
* Multiplayer (two-player) mode
* Dynamic grid sizes (e.g., 3x3, 5x5)
* Score tracking system
* Responsive and modern UI
* Smooth animations using Framer Motion

---

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* React Router DOM
* Framer Motion

### Backend

* Node.js
* Express.js
* MongoDB with Mongoose

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/tanayaaa123/tic-tac-toe-mern.git
cd tic-tac-toe-mern
```

---

### 2. Backend Setup

```bash
cd backend
npm install
node server.js
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the `backend` directory and add:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

---

## Project Structure

```
tic-tac-toe-mern/
│
├── backend/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── index.html
```

---

## Usage

1. Start the backend server.
2. Start the frontend development server.
3. Open the application in your browser.
4. Choose a game mode and grid size.
5. Play the game against another player or the AI.

---

## Future Enhancements

* Online multiplayer using WebSockets (Socket.io)
* User authentication
* Persistent game history
* Mobile optimization

---

## Author

Tanaya Ambekar

---

## License

This project is for educational and personal use.
