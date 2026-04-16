# 🚀 TestGen AI : Smart TestCases Genrator and SRS Validato (STCG)

## 📌 Project Title

**TestGen AI : Smart TestCases Genrator and SRS Validator **

---

## 📖 Description

The Automated Test Case Generator is an AI-based web application designed to automatically generate structured and meaningful test cases from Software Requirement Specifications (SRS).

This system reduces manual effort in software testing by analyzing input requirements, validating them, and generating test cases using AI models. It improves efficiency, accuracy, and productivity in the testing process.

Users can:

* Enter SRS requirements
* Validate requirement quality
* Generate AI-based test cases
* View and download test cases

---

## 👨‍💻 Group Members

* Pranav Jadhav
* Gunvant Jadhav
* Hitika Mali
* Manas Bhairao

---

## 🛠️ Tech Stack

### Frontend:

* React.js
* HTML, CSS, JavaScript

### Backend:

* FastAPI (Python)

### Database:

* MongoDB

### AI Integration:

* Together AI / Gemini API

### Tools:

* VS Code
* Postman
* MongoDB Compass

---

## 📂 Project Structure

```
STCG/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── routes/
│   │   └── gemini_service.py
│   │
│   └── requirements.txt
│
├── .env
└── README.md




## ⚙️ Installation Steps

### 1️⃣ Clone the Repository


git clone https://github.com/your-username/stcg-project.git
cd stcg-project




### 2️⃣ Setup Frontend


cd frontend
npm install
npm run dev




### 3️⃣ Setup Backend

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

### 4️⃣ Setup Environment Variables

Create a `.env` file inside backend folder:

```
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=stcg_db
OPENAI_API_KEY=your_api_key_here
```

---

### 5️⃣ Run the Project

* Frontend → http://localhost:5173
* Backend → http://127.0.0.1:8000

