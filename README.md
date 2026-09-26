# 🏥 Doctor Appointment & Smart Healthcare System

### Full-Stack Web-Based Healthcare Management Platform

A full-stack healthcare management platform designed to centralize doctor discovery, appointment scheduling, diagnostic services, online payments, medical reports, prescriptions, notifications, ratings, and symptom-based healthcare guidance in a single web application.

The system provides separate role-based workflows for **Patients, Doctors, Receptionists, and Administrators**, with RESTful API communication between the React frontend and Django backend.

> ⚠️ **Disclaimer:** The symptom guidance feature provides preliminary informational assistance only. It is not a medical diagnosis and should not replace professional medical advice.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Objectives](#-objectives)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [System Architecture](#-system-architecture)
- [Core Workflows](#-core-workflows)
- [Appointment Management](#-appointment-management)
- [Payment Integration](#-payment-integration)
- [Refund Management](#-refund-management)
- [AI-Assisted Symptom Guidance](#-ai-assisted-symptom-guidance)
- [Doctor Recommendation](#-doctor-recommendation)
- [Diagnostic Services](#-diagnostic-services)
- [Medical Reports & Prescriptions](#-medical-reports--prescriptions)
- [Authentication & Authorization](#-authentication--authorization)
- [Concurrency & Data Integrity](#-concurrency--data-integrity)
- [Notifications & Ratings](#-notifications--ratings)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [API Communication](#-api-communication)
- [Testing](#-testing)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Security Considerations](#-security-considerations)
- [Limitations](#-limitations)
- [Future Improvements](#-future-improvements)
- [Project Highlights](#-project-highlights)
- [Author](#-author)

---

# 📖 Overview

The **Doctor Appointment & Smart Healthcare System** is a web-based platform that organizes multiple healthcare-related services into a centralized application.

The primary goal is to simplify the process of finding suitable doctors, checking availability, scheduling appointments, managing healthcare records, making payments, and accessing preliminary symptom guidance.

Instead of handling appointments, diagnostics, payments, reports, and prescriptions through separate workflows, the platform brings these services together under role-based access control.

### Core Modules

```text
                    Healthcare Platform
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   Appointment          Diagnostics        Payments
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
       Medical Reports  Prescriptions  Notifications
             │
             ▼
       AI-Assisted Symptom Guidance

🎯 Objectives

The main objectives of the system are:

Provide a centralized healthcare management platform.
Allow patients to search and select doctors based on specialization and availability.
Support appointment scheduling and status management.
Provide diagnostic test booking.
Integrate online payment processing.
Support eligible refund workflows.
Centralize medical reports and prescriptions.
Provide notifications and doctor ratings.
Provide symptom-based preliminary guidance.
Recommend relevant medical specialties and doctors.
Protect system resources using authentication and role-based authorization.
Maintain data consistency during appointment booking and related operations.
✨ Key Features
👤 Patient Features
Registration and login
JWT authentication
Profile management
Family member management
Doctor search
Department and specialization filtering
Doctor profile viewing
Doctor availability and time slots
Appointment booking
Appointment history
Appointment cancellation
Appointment status tracking
Online payment
Payment history
Eligible refund requests
Diagnostic test search
Diagnostic test booking
Medical reports
Prescription viewing
Notifications
Doctor ratings
Health tips
AI-assisted symptom guidance
Recommended doctors
Account settings
👨‍⚕️ Doctor Features
Doctor registration
Doctor approval workflow
Professional profile management
Schedule management
Availability management
Time-slot generation
Appointment request management
Appointment confirmation
Appointment rejection
Appointment completion
Patient information
Prescription management
Medical report management
Notifications
Dashboard and analytics
Account settings

Only approved and active doctors are allowed to provide appointment services.

🛡️ Administrator Features
Admin authentication
Dashboard and analytics
Patient management
Doctor management
Doctor registration approval
Doctor rejection with reason
Appointment monitoring
Diagnostic category management
Diagnostic test management
Payment monitoring
Refund-related monitoring
System activity monitoring
Role-restricted administrative operations
🧑‍💼 Receptionist Features

The system also supports receptionist-level workflows for healthcare operations and appointment-related management according to assigned permissions.

👥 User Roles

The system follows role-based access control.

                    Authentication
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Patient         Doctor       Receptionist
          │              │              │
          └──────────────┼──────────────┘
                         │
                       Admin

Each role receives access to the features relevant to that role.

🏗️ System Architecture

The application follows a frontend-backend architecture.

┌──────────────────────────────────────────────┐
│                 React Frontend               │
│                                              │
│ Pages │ Components │ Context │ Services │ UI │
└──────────────────────┬───────────────────────┘
                       │
                    REST API
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Django REST Framework            │
│                                              │
│ Views │ Serializers │ Models │ Permissions  │
│ Services │ Business Logic │ Validation       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
                 PostgreSQL DB
                       │
        ┌──────────────┼───────────────┐
        │              │               │
        ▼              ▼               ▼
   SSLCommerz      Gemini API      File/Reports

🔄 Core Workflows
Doctor Search & Appointment
Patient
   ↓
Doctor Search
   ↓
Filter by Department / Specialization
   ↓
View Doctor Profile
   ↓
Check Availability
   ↓
Select Time Slot
   ↓
Book Appointment
   ↓
Payment (if applicable)
   ↓
Appointment Status

Appointment Lifecycle

Pending
   │
   ├──────► Confirmed
   │           │
   │           ▼
   │       Completed
   │
   ├──────► Rejected
   │
   └──────► Cancelled

The system maintains appointment states throughout the appointment lifecycle.

📅 Appointment Management

Patients can:

Search doctors
View doctor schedules
View available slots
Select an appointment time
Create appointments
Track appointment status
Cancel eligible appointments

Doctors can:

View appointment requests
Confirm appointments
Reject appointments
Provide rejection reasons
Complete appointments

The backend validates appointment-related conditions before creating or modifying records.

💳 Payment Integration

The project supports SSLCommerz payment integration.

Payment Flow

Patient
   ↓
PaymentPage.jsx
   ↓
Payment API
   ↓
SSLCommerzCreateView
   ↓
create_session()
   ↓
SSLCommerz Gateway
   ↓
Payment
   ↓
Callback
   ↓
SSLCommerzCallbackView
   ↓
Transaction Validation
   ↓
Payment Status Update
The application handles:

Payment creation
Payment sessions
Gateway redirection
Callback handling
Transaction validation
Payment status
Payment history

The project also contains an application-level payment flow for supported payment modes.

💰 Refund Management

The platform includes an eligible refund request workflow.

Refund Flow

Paid Appointment
       ↓
Refund Request
       ↓
Pending
       ↓
Approval
       ↓
Refund Calculation
       ↓
Payment = Refunded
       ↓
Appointment = Cancelled

The current refund policy retains 20% of the payment amount and calculates 80% as refundable.

Conceptually:
Refund Amount = Payment Amount × 80%
Retained Amount = Payment Amount × 20%

The refund implementation represents an application-level refund workflow and status management.

🤖 AI-Assisted Symptom Guidance

The project includes an AI-assisted symptom analysis feature.

Technology
Gemini API
Backend prompt-based analysis
Rule-based fallback
User Input

The patient provides:

Symptoms
Duration
Severity
Processing Flow
Patient Symptoms
       ↓
SymptomChecker.jsx
       ↓
REST API
       ↓
SymptomAnalysisView
       ↓
Gemini API
       │
       ├── Successful
       │       ↓
       │    AI Analysis
       │
       └── Unavailable
               ↓
       Rule-Based Fallback
               ↓
       Specialty Matching
               ↓
       Doctor Recommendation
🧠 Rule-Based Fallback

The system does not depend entirely on Gemini.

If Gemini analysis is unavailable, a local fallback mechanism is used.

Examples of symptom categories include:
Neurological
      ↓
Headache / Migraine / Dizziness

Cardiovascular & Breathing
      ↓
Chest / Heart / Breathing-related symptoms

Skin & Allergy
      ↓
Itching / Rash / Acne / Skin symptoms

Digestive
      ↓
Stomach / Diarrhea / Vomiting

🚨 Emergency Signal Detection

The symptom analysis also checks predefined emergency signals.

Examples include:

Chest pain
Severe breathing difficulty
Difficulty breathing
Unconsciousness
Severe bleeding
Stroke-related signals
Suicidal signals

When a relevant emergency signal is detected, the system can mark the result with an urgent warning.

The system provides preliminary guidance only and does not perform medical diagnosis.

👨‍⚕️ Doctor Recommendation

After symptom analysis, the platform can recommend relevant doctors.

The ranking considers factors such as:

Specialty match
Department
Doctor rating
Rating count
Experience
Available appointment slots

The system calculates a match score and ranks suitable doctors.

The current implementation returns the top matching recommendations.

🧪 Diagnostic Services

The platform includes a diagnostic test management module.

Patient
Browse diagnostic categories
Search tests
Filter tests
View test details
Book diagnostic tests
Make applicable payments
Access related reports
Admin
Manage diagnostic categories
Manage diagnostic tests
Monitor diagnostic bookings
📄 Medical Reports & Prescriptions

The system supports centralized medical information management.

Medical reports can contain information such as:

Clinical history
Symptoms
Vital information
Diagnostic test results
Doctor advice
Follow-up information
Prescription information
Report files

Doctors can create and manage relevant patient reports and prescriptions.

Patients can access their available healthcare records through their dashboard.

🔔 Notifications

The platform provides notification workflows for healthcare-related activities.

Examples include:

Appointment updates
Booking events
Doctor actions
Payment-related updates
System notifications
⭐ Doctor Ratings

Patients can provide ratings for eligible doctors.

Rating information can also contribute to doctor recommendation and ranking.

The recommendation logic considers:
Specialty Match
      +
Availability
      +
Rating
      +
Rating Count
      +
Experience

🔐 Authentication & Authorization

The backend uses:

Django REST Framework
JWT authentication
Role-based authorization
Protected API endpoints
Server-side validation

Authentication controls access to protected resources while authorization determines which operations are available to each role.

🔒 Data Integrity & Concurrency Control

Appointment booking is a critical part of the system because multiple users may attempt to interact with appointment-related resources.

The backend uses Django database transactions:
transaction.atomic()
and row-level locking:
select_for_update()
These mechanisms are used around critical booking operations to maintain database consistency and reduce conflicting concurrent updates.

🧩 Backend Architecture

The backend is organized into separate Django applications.
backend/
│
├── accounts/
├── appointments/
├── doctors/
├── patients/
├── diagnostics/
├── payments/
├── reports/
├── notifications/
├── dashboard/
└── config/

Main Responsibilities
| App             | Responsibility                             |
| --------------- | ------------------------------------------ |
| `accounts`      | Users, authentication and roles            |
| `appointments`  | Appointment workflows and symptom analysis |
| `doctors`       | Doctor profiles and schedules              |
| `patients`      | Patient-related operations                 |
| `diagnostics`   | Diagnostic tests and bookings              |
| `payments`      | Payments and refunds                       |
| `reports`       | Medical reports and prescriptions          |
| `notifications` | Notifications                              |
| `dashboard`     | Dashboard data and analytics               |
| `config`        | Django configuration                       |


💻 Frontend Architecture

The frontend is developed with React and Vite.

frontend/
└── src/
    ├── components/
    ├── pages/
    ├── services/
    ├── api/
    ├── context/
    ├── routes/
    └── ...

Main Frontend Responsibilities
User interface
Navigation
Role-based pages
Form handling
API communication
Authentication state
Appointment interfaces
Payment interfaces
AI symptom interface
Dashboard interfaces
🔌 API Communication

The frontend communicates with the Django backend through REST APIs.

A typical feature follows:

React Page
    ↓
Service / API Layer
    ↓
Django URL
    ↓
View
    ↓
Serializer
    ↓
Model
    ↓
PostgreSQL

For example, appointment booking follows the general structure:
BookAppointment.jsx
        ↓
appointmentService.js
        ↓
Django Appointment API
        ↓
BookAppointmentView
        ↓
AppointmentSerializer
        ↓
Appointment Model
        ↓
Database

This separation helps keep frontend presentation and backend business logic organized.

🗄️ Database Design

The system uses a relational database architecture.

Important entities include:

User
 │
 ├── Patient
 │
 ├── Doctor
 │
 ├── Receptionist
 │
 └── Admin

Patient
 │
 ├── Appointment
 ├── Payment
 ├── Diagnostic Booking
 ├── Medical Report
 └── Notification

Doctor
 │
 ├── Schedule
 ├── Time Slots
 ├── Appointments
 ├── Prescriptions
 └── Reports

Appointment
 │
 └── Payment

Diagnostic Test
 │
 └── Diagnostic Booking

🧪 Testing

The project includes functional test scenarios covering major modules.

Examples include:

| Test                     | Status |
| ------------------------ | ------ |
| Registration validation  | Pass   |
| Login                    | Pass   |
| Role authorization       | Pass   |
| Doctor approval          | Pass   |
| Doctor search            | Pass   |
| Schedule generation      | Pass   |
| Appointment booking      | Pass   |
| Appointment validation   | Pass   |
| Appointment confirmation | Pass   |
| Appointment rejection    | Pass   |
| Appointment cancellation | Pass   |
| Diagnostic booking       | Pass   |
| Payment processing       | Pass   |
| Payment validation       | Pass   |
| Refund request           | Pass   |
| Medical report creation  | Pass   |
| Notification generation  | Pass   |
| Doctor rating            | Pass   |
| Symptom guidance         | Pass   |
| Dashboard                | Pass   |
| Logout                   | Pass   |

The project documentation notes that comprehensive automated testing across every module is still an area for further improvement.

🛠️ Technology Stack
Frontend
React
Vite
JavaScript
React Router
Axios
Bootstrap
React Icons
SweetAlert2
Backend
Python
Django
Django REST Framework
Django ORM
JWT Authentication
Django Filters
Database
PostgreSQL
External Services
SSLCommerz Payment Gateway
Google Gemini API
Development Tools
Git
GitHub
VS Code
Postman

📁 Project Structure

DoctorAppointment/
│
├── backend/
│   ├── accounts/
│   ├── appointments/
│   ├── doctors/
│   ├── patients/
│   ├── diagnostics/
│   ├── payments/
│   ├── reports/
│   ├── notifications/
│   ├── dashboard/
│   └── config/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── api/
│       ├── context/
│       └── ...
│
├── manage.py
├── requirements.txt
└── README.md

🚀 Installation & Setup
Prerequisites

Make sure the following are installed:

Python 3.x
Node.js
npm
PostgreSQL
Git
1. Clone Repository
git clone https://github.com/YOUR_USERNAME/DoctorAppointment.git
cd DoctorAppointment

⚙️ Backend Setup

Navigate to the backend/project directory:
cd backend
Create a virtual environment:

python -m venv venv
Windows
venv\Scripts\activate
macOS / Linux
source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run database migrations:

python manage.py migrate

Start the development server:

python manage.py runserver
💻 Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the Vite development server:

npm run dev
🔑 Environment Configuration

Sensitive credentials should be stored in environment variables.

Example:

SECRET_KEY=your_secret_key
DEBUG=True

DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

GEMINI_API_KEY=your_gemini_api_key

SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password

Never commit real API keys, passwords, secret keys, or .env files to a public repository.

🔐 Security Considerations

The system includes several security-oriented mechanisms:

JWT-based authentication
Role-based authorization
Protected API endpoints
Server-side validation
Database transactions
Environment-based secret configuration
Payment transaction validation

For production deployment, additional hardening is required, including secure production settings, comprehensive automated testing, stronger file validation, secure medical document storage, monitoring, and deployment configuration.

⚠️ Current Limitations

The current implementation has several known limitations:

AI Guidance

The symptom guidance system provides preliminary assistance and is not intended to provide medical diagnosis.

Production Scalability

Additional performance optimization and load testing would be required before handling a large number of concurrent users.

Mobile Application

The current implementation is web-based; dedicated Android/iOS applications are not included.

Third-Party Services

Payment and AI features depend partly on external service availability.

Medical File Security

Further improvements to file validation and secure medical document storage would be appropriate for production deployment.

Automated Testing

Comprehensive automated test coverage across all modules is not yet implemented.

Healthcare Integration

Integration with external hospital or healthcare information systems is outside the current project scope.

🔮 Future Improvements

Potential future enhancements include:

📱 Dedicated Android/iOS applications
💬 Secure doctor-patient chat
🎥 Online video consultation
📧 Email and SMS notifications
⏰ Automated appointment reminders
📊 Advanced healthcare analytics
🤖 Improved symptom analysis
🧠 More advanced doctor recommendation
🔐 Enhanced medical document security
🧪 Comprehensive automated testing
🚀 Production deployment and performance optimization
🏥 Integration with external healthcare information systems
📌 Project Highlights

This project demonstrates practical experience in:

Full-Stack Development
        │
        ├── React + Vite
        ├── Django REST Framework
        └── PostgreSQL

Backend Engineering
        │
        ├── REST APIs
        ├── JWT Authentication
        ├── Role-Based Authorization
        ├── Database Transactions
        └── Data Validation

Healthcare Workflows
        │
        ├── Doctor Search
        ├── Appointment Management
        ├── Diagnostics
        ├── Medical Reports
        └── Prescriptions

External Integrations
        │
        ├── SSLCommerz
        └── Gemini API

Intelligent Features
        │
        ├── Symptom Analysis
        ├── Emergency Signal Detection
        └── Doctor Recommendation

🧠 Key Engineering Concepts

Some of the important engineering concepts demonstrated by the project are:

RESTful API architecture
Frontend/backend separation
Role-based access control
JWT authentication
Relational database design
Transaction management
Row-level locking
Payment gateway integration
External API integration
Fallback logic
Server-side validation
Modular application structure
Healthcare workflow management
📚 Development Approach

The project followed an Incremental Process Model, where major system modules were developed and integrated progressively.

The approach supported:

Modular development
Progressive integration
Continuous testing
Early error detection
Flexible development
👨‍💻 Author

Md. Kawser Talukder

Machine Learning & Backend Engineer

GitHub: https://github.com/YOUR_USERNAME
Project: DoctorAppointment
