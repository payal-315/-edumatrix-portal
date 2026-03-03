-- Database Setup for Student Portal
-- Run this file to create the required tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS student_portal;
USE student_portal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personal Info table
CREATE TABLE IF NOT EXISTS personal_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100),
    dob DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    email VARCHAR(100),
    phone VARCHAR(20),
    alt_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip VARCHAR(20),
    father_name VARCHAR(100),
    father_phone VARCHAR(20),
    father_alt_phone VARCHAR(20),
    mother_name VARCHAR(100),
    mother_phone VARCHAR(20),
    mother_alt_phone VARCHAR(20),
    nationality VARCHAR(50),
    aadhar VARCHAR(20),
    guardian_name VARCHAR(100),
    guardian_relation VARCHAR(50),
    guardian_phone VARCHAR(20),
    UNIQUE(user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Academic Info table (with dynamic subject columns)
CREATE TABLE IF NOT EXISTS academic_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    usn VARCHAR(20),
    name VARCHAR(100),
    department VARCHAR(100),
    semester INT,
    sub1 DECIMAL(5,2),
    sub2 DECIMAL(5,2),
    sub3 DECIMAL(5,2),
    sub4 DECIMAL(5,2),
    sub5 DECIMAL(5,2),
    sub6 DECIMAL(5,2),
    sub7 DECIMAL(5,2),
    sub8 DECIMAL(5,2),
    sub9 DECIMAL(5,2),
    sgpa DECIMAL(4,2),
    cgpa DECIMAL(4,2),
    total_classes INT,
    attended_classes INT,
    attendance DECIMAL(5,2),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, semester)
);

-- Hackathons table
CREATE TABLE IF NOT EXISTS hackathons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role VARCHAR(100),
    technologies TEXT,
    project TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(200),
    type VARCHAR(100),
    award VARCHAR(100),
    date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Awards table
CREATE TABLE IF NOT EXISTS awards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(200),
    organization VARCHAR(100),
    date DATE,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(200),
    organization VARCHAR(100),
    date DATE,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_sgpa DECIMAL(4,2),
    goal_attendance DECIMAL(5,2),
    goal_study_hours INT,
    goal_books INT,
    goal_hackathons INT,
    goal_certificates INT,
    goal_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);

-- Display success message
SELECT 'Database tables created successfully!' AS status;
