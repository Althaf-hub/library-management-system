<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d255d47d-8df0-4da2-8de5-bab9bc835588" /># 📚 Library Management System

A full-stack web application to manage books, members, and issue/return transactions, built with the **MERN stack**.

🔗 **Live demo:** [https://library-management-system-psi-lime.vercel.app](https://library-management-system-psi-lime.vercel.app)  
> The backend runs on a free server. If the first load is slow, it is waking up (about 30 seconds).

---

## ✨ Features

- **Dashboard** with total books, members, issued, returned, overdue and available copies
- **Books:** add, delete, search (title, author, ISBN) and pagination
- **Members:** add, view and delete
- **Issue / Return:** issue a book to a member for a set number of days, return it later
- **Overdue tracking** with automatic **fine calculation** (₹5 per late day, configurable)
- **Race-condition-safe issuing:** stock check and decrement happen in one atomic MongoDB update, so the last copy can never be issued twice
- **Validation and error handling** with proper HTTP status codes (400, 404, 409)
- Seed script with demo data

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose |
| Security / tooling | Helmet, CORS, dotenv, Morgan |
| Hosting | Vercel (frontend), Render (backend) |

---

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/books` | List books (`?search=&page=&limit=&category=`) |
| POST | `/api/books` | Add a book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book (blocked if issued) |
| GET | `/api/members` | List members |
| POST | `/api/members` | Add a member |
| PUT | `/api/members/:id` | Update a member |
| DELETE | `/api/members/:id` | Delete a member (blocked if books issued) |
| POST | `/api/transactions/issue` | Issue a book |
| PUT | `/api/transactions/:id/return` | Return a book, calculate fine |
| GET | `/api/transactions` | List transactions (`?status=issued|returned`, `?overdue=true`) |
| GET | `/api/transactions/dashboard/stats` | Dashboard statistics |

---

## 🖥️ Run Locally

**Requirements:** Node.js 20+, a MongoDB Atlas account (or local MongoDB)

```bash
git clone https://github.com/Althaf-hub/library-management-system.git
cd library-management-system
