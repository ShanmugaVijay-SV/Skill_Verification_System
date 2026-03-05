# Skill Verification System - API Endpoints Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Endpoints (`/auth`)

### 1. Student Registration
**POST** `/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
**Response (201)**
```json
{
  "status": "success",
  "message": "Student registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### 2. Student Login
**POST** `/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (200)**
```json
{
  "status": "success",
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### 3. Admin Login
**POST** `/auth/admin/login`
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

---

## 🎯 Domain Endpoints (`/domains`)

### 1. Get All Domains (Public)
**GET** `/domains`
**Response (200)**
```json
{
  "status": "success",
  "message": "Domains fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Java",
      "description": "Java Programming Language",
      "question_count": 25
    }
  ]
}
```

### 2. Get Single Domain
**GET** `/domains/:id`

### 3. Create Domain (Admin Only)
**POST** `/domains` ⭐ Requires Authentication + Admin Role
```json
{
  "name": "Python",
  "description": "Python Programming Language"
}
```
**Response (201)**
```json
{
  "status": "success",
  "message": "Domain created successfully",
  "data": {
    "id": 2,
    "name": "Python",
    "description": "Python Programming Language"
  }
}
```

### 4. Update Domain (Admin Only)
**PUT** `/domains/:id` ⭐ Requires Authentication + Admin Role
```json
{
  "name": "Python 3",
  "description": "Python 3 Programming"
}
```

### 5. Delete Domain (Admin Only)
**DELETE** `/domains/:id` ⭐ Requires Authentication + Admin Role
*Note: Cannot delete domain if it has questions*

---

## ❓ Question Endpoints (`/questions`)

### 1. Get Questions for Assessment (Student)
**GET** `/questions/:domainId` ⭐ Requires Authentication
- Returns 30 random questions without correct answers
- Checks cooldown period before allowing access
**Response (200)**
```json
{
  "status": "success",
  "message": "Questions fetched successfully",
  "data": [
    {
      "id": 1,
      "question_text": "What is Java?",
      "option_a": "Programming Language",
      "option_b": "Island",
      "option_c": "Coffee",
      "option_d": "Database"
    }
  ]
}
```

### 2. Add Question (Admin Only)
**POST** `/questions/add` ⭐ Requires Authentication + Admin Role
```json
{
  "domain_id": 1,
  "question_text": "What is Java?",
  "option_a": "Programming Language",
  "option_b": "Island",
  "option_c": "Coffee",
  "option_d": "Database",
  "correct_answer": "a"
}
```

### 3. Get Questions by Domain (Admin - with pagination)
**GET** `/questions/admin/:domainId?page=1&limit=20` ⭐ Requires Authentication + Admin Role
- Shows all questions with correct answers visible
- Supports pagination

### 4. Get Single Question (Admin)
**GET** `/questions/admin/detail/:id` ⭐ Requires Authentication + Admin Role

### 5. Update Question (Admin Only)
**PUT** `/questions/:id` ⭐ Requires Authentication + Admin Role
```json
{
  "domain_id": 1,
  "question_text": "Updated Question",
  "option_a": "Option A",
  "option_b": "Option B",
  "option_c": "Option C",
  "option_d": "Option D",
  "correct_answer": "b"
}
```

### 6. Delete Question (Admin Only)
**DELETE** `/questions/:id` ⭐ Requires Authentication + Admin Role

---

## 📝 Assessment Endpoints (`/assessment`)

### 1. Check Cooldown Status
**GET** `/assessment/cooldown/:domainId` ⭐ Requires Authentication
**Response (200) - Can Attempt**
```json
{
  "status": "success",
  "message": "No previous attempts",
  "canAttempt": true
}
```
**Response (200) - Cooldown Active**
```json
{
  "status": "error",
  "message": "Cooldown period active",
  "canAttempt": false,
  "nextAttemptDate": "2024-03-10T15:30:00.000Z",
  "hoursRemaining": "45.50"
}
```

### 2. Submit Assessment
**POST** `/assessment/submit` ⭐ Requires Authentication
```json
{
  "domainId": 1,
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "a"
    },
    {
      "questionId": 2,
      "selectedAnswer": "b"
    }
  ]
}
```
**Response (200)**
```json
{
  "status": "success",
  "message": "Assessment submitted successfully",
  "data": {
    "score": 18,
    "total": 30,
    "percentage": "60.00",
    "result": "Pass",
    "level": "Beginner",
    "certificate": "/certificates/certificate_1_1709994600000.pdf"
  }
}
```

### 3. Get My Results
**GET** `/assessment/my-results` ⭐ Requires Authentication
**Response (200)**
```json
{
  "status": "success",
  "message": "Results fetched successfully",
  "data": [
    {
      "domain": "Java",
      "score": 18,
      "total": 30,
      "percentage": "60.00",
      "result": "Pass",
      "level": "Beginner",
      "attemptDate": "2024-03-04T10:30:00.000Z"
    }
  ]
}
```

### 4. Get Leaderboard
**GET** `/assessment/leaderboard/:domainId` ⭐ Requires Authentication
**Response (200)**
```json
{
  "status": "success",
  "message": "Leaderboard fetched successfully",
  "data": [
    {
      "student_name": "John Doe",
      "percentage": 90.50
    },
    {
      "student_name": "Jane Smith",
      "percentage": 85.00
    }
  ]
}
```

---

## 📊 Admin Reporting Endpoints (`/admin`)

### 1. Get Dashboard Statistics
**GET** `/admin/stats` ⭐ Requires Authentication + Admin Role
**Response (200)**
```json
{
  "status": "success",
  "message": "Dashboard stats fetched successfully",
  "data": {
    "totalStudents": 25,
    "totalAssessments": 120,
    "totalDomains": 5,
    "averageScore": "65.50"
  }
}
```

### 2. Get All Students
**GET** `/admin/students` ⭐ Requires Authentication + Admin Role
**Response (200)**
```json
{
  "status": "success",
  "message": "Students fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "total_attempts": 5,
      "avg_score": 72.50
    }
  ]
}
```

### 3. Get Reports by Domain
**GET** `/admin/reports/domains` ⭐ Requires Authentication + Admin Role
**Response (200)**
```json
{
  "status": "success",
  "message": "Reports fetched successfully",
  "data": [
    {
      "id": 1,
      "domain_name": "Java",
      "total_attempts": 45,
      "avg_score": 68.75,
      "unique_students": 20,
      "pass_count": 35,
      "fail_count": 10
    }
  ]
}
```

### 4. Get Student Results
**GET** `/admin/students/:studentId/results` ⭐ Requires Authentication + Admin Role
**Response (200)**
```json
{
  "status": "success",
  "message": "Student results fetched successfully",
  "data": [
    {
      "id": 1,
      "domain_name": "Java",
      "score": 18,
      "total_questions": 30,
      "percentage": 60.00,
      "attempt_date": "2024-03-04T10:30:00.000Z"
    }
  ]
}
```

---

## 🔒 Authentication Header
All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

## 📈 Scoring System
- **Score Calculation**: (Correct Answers / Total Questions) × 100
- **Pass/Fail**: Pass ≥ 40%, Fail < 40%
- **Skill Levels**:
  - 40-59%: Beginner
  - 60-79%: Intermediate
  - 80-100%: Expert
  
## ⏱️ Cooldown Period
- **Duration**: 72 hours (3 days)
- **Application**: Per domain per student
- Prevents re-attempting the same domain within 72 hours

## 📜 Certificate Generation
- **Eligibility**: Score ≥ 40%
- **Format**: PDF
- **Contents**: Student name, domain, score, percentage, level, date
- **Location**: `/certificates/` folder

---

## ✅ Input Validation

### Email Format
- Must be valid email (xxx@yyy.zzz)

### Password Requirements
- Minimum 6 characters
- Confirmation must match

### Domain
- Name: 2-100 characters
- Description: Max 500 characters

### Questions
- Valid options (a, b, c, d)
- All four options required
- Correct answer must be a, b, c, or d

---

## 🚀 Response Format

All API responses follow this format:

**Success (2xx)**
```json
{
  "status": "success",
  "message": "Description of what succeeded",
  "data": { /* the actual data */ }
}
```

**Error (4xx/5xx)**
```json
{
  "status": "error",
  "message": "Description of error",
  "errors": [ /* validation errors if applicable */ ]
}
```

---

## Version
- **API Version**: 1.0
- **Last Updated**: March 2024
