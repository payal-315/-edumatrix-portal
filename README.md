# EduMatrix - Student Portal

A comprehensive student management system for tracking academic performance, extracurricular activities, and personal information.

## Features

- User Authentication (Login/Signup)
- Academic Information Management
- Extracurricular Activities Tracking
- Personal Details Management
- Refer a Friend & Share functionality
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

## Installation

1. **Clone the repository**
   
```
bash
   git clone <repository-url>
   cd dbms
   
```

2. **Backend Setup**
   
```
bash
   cd backend
   npm install
   
```

3. **Configure Database**
   - Create a MySQL database named `student_portal`
   - Copy `.env.example` to `.env` and update with your database credentials:
     
```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=student_portal
     PORT=3000
     
```

4. **Set up the database tables**
   Run the SQL commands from `backend/setup.sql` in your MySQL database

5. **Start the server**
   
```
bash
   npm start
   
```

6. **Open the application**
   - Backend runs at: http://localhost:3000
   - Open `login/index.html` in your browser

## Project Structure

```
├── backend/
│   ├── db.js           # Database connection
│   ├── server.js       # Express server
│   ├── setup.sql       # Database schema
│   └── package.json
├── login/              # Frontend pages
│   ├── index.html      # Login page
│   ├── dashboard.html  # Main dashboard
│   ├── academic.html   # Academic info
│   ├── extracurricular.html
│   └── personal.html
├── .gitignore
└── README.md
```

## Deployment to GitHub

1. Create a `.env` file in the `backend/` folder with your credentials (this is already in .gitignore)
2. The repository is ready to be pushed to GitHub
3. Your confidential database credentials are protected

## Usage

1. Open the login page
2. Sign up with your details
3. Login with your credentials
4. Navigate between Academic, Extracurricular, and Personal sections
5. Use the semester selector to view different semesters
6. Share the website using the Refer a Friend feature

## License

MIT License
