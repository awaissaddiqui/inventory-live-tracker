# 📦 Inventory Management System with Live Stock Updates

A scalable real-time inventory backend system using **Express.js**, **Socket.IO**, **Redis**, **Sequelize (PostgreSQL)**, and **Docker**, built for small-to-medium businesses to manage stock efficiently across multiple locations.

---

## 🚀 Features

- 📡 **Live stock updates** across multiple branches (Socket.IO)
- ⚡ **Fast data access** using Redis caching and Pub/Sub
- 🛠️ **Robust REST API** with Sequelize and PostgreSQL
- 🐳 **Dockerized environment** for consistent deployment
- 🔄 **CI/CD pipeline** for automated testing and deployments
- 🔐 User Roles: Admin, Branch Manager, Staff

---

## 🧱 Tech Stack

| Layer        | Technology        |
|--------------|-------------------|
| Backend      | Node.js + Express |
| Real-Time    | Socket.IO         |
| Database     | PostgreSQL + Sequelize |
| Caching / PubSub | Redis         |
| DevOps       | Docker + GitHub Actions (CI/CD) |
| Auth         | JWT / Passport (optional) |

---

## 🏗️ Folder Structure

📁 inventory-system/

├── 📁 src/

│ ├── 📁 controllers/

│ ├── 📁 routes/
│ ├── 📁 models/
│ ├── 📁 services/
│ ├── 📁 sockets/
│ ├── 📄 app.js
├── 📁 config/
│ ├── 📄 database.js
│ ├── 📄 redis.js
├── 📄 docker-compose.yml
├── 📄 Dockerfile
├── 📄 .env
├── 📄 README.md


---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/inventory-system.git
cd inventory-system
```
### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

```bash
PORT=""
DATABASE=""
```


# 👨‍💻 Author

### Awais Saddiqui
