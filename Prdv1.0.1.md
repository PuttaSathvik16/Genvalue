# Product Requirements Document (PRD)

# GenValue Academy LMS & Management Platform

**Version:** 2.0
**Document Type:** Product Requirements Document (PRD)
**Product Category:** Learning Management System (LMS) + Marketing Website + Admin Platform
**Status:** Planning Phase

---

# 1. Executive Summary

GenValue Academy is evolving from a static marketing website into a full-featured Learning Management System (LMS) designed to deliver practical AI education through structured, instructor-led courses.

The platform will support the complete learning lifecycle—from student registration and enrollment to course completion, assessments, certification, and alumni engagement—while providing administrators and instructors with comprehensive tools to manage content, learners, and operations.

Although the initial launch focuses on a single flagship course, **AI Tools Mastery**, the platform will be architected as a scalable multi-course SaaS solution capable of supporting future programs without significant architectural changes.

---

# 2. Product Vision

Create an end-to-end AI learning platform that enables students to learn, practice, and earn certifications while empowering administrators to manage the entire academy through an intuitive web interface.

The platform should eliminate the need for direct database interaction by providing complete management capabilities through dedicated dashboards.

---

# 3. Product Goals

## Primary Goals

* Deliver structured online learning experiences
* Support self-paced and instructor-guided courses
* Track learner progress
* Conduct quizzes and assessments
* Manage assignment submissions
* Generate verifiable certificates
* Provide detailed learning analytics
* Enable complete academy administration

---

## Business Goals

* Launch and manage multiple AI courses
* Increase student engagement and completion rates
* Reduce manual administrative work
* Support future monetization
* Build a scalable education platform

---

# 4. Target Users

| User Type           | Description                             |
| ------------------- | --------------------------------------- |
| Visitor             | Browses marketing website               |
| Student             | Learns courses and earns certificates   |
| Instructor          | Creates and manages educational content |
| Admin               | Manages academy operations              |
| Super Administrator | Controls the entire platform            |

---

# 5. Product Scope

## Included in Version 2

* Marketing Website
* Authentication System
* Student Portal
* Instructor Portal
* Admin Dashboard
* Course Management
* Lesson Management
* Quiz Engine
* Assignment System
* Certificate Generation
* Notifications
* Analytics
* CMS
* Audit Logs

---

# 6. Technology Stack

## Frontend

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS v4
* Framer Motion
* React Hook Form
* Zod
* TanStack Query
* Zustand
* shadcn/ui

---

## Backend

* Next.js Route Handlers
* Server Actions
* REST APIs

---

## Database

* CockroachDB
* Prisma ORM

Local Development

```bash
docker run \
--name cockroach \
-p 26257:26257 \
-p 8080:8080 \
cockroachdb/cockroach:v25.1 \
start-single-node \
--insecure
```

---

## Authentication

* Auth.js (NextAuth)
* Email & Password
* Email Verification
* Password Reset
* Google OAuth (Future)

---

## Storage

### Initial

```
/public/uploads
```

### Future

Cloudflare R2

---

# 7. User Roles & Permissions

```
SUPER ADMIN
        │
        ▼
     ADMIN
        │
        ▼
   INSTRUCTOR
        │
        ▼
     STUDENT
        │
        ▼
     VISITOR
```

---

## Visitor

### Permissions

* Browse website
* View syllabus
* View pricing
* Contact academy
* Read blogs
* View FAQs

Cannot

* Access lessons
* Download premium content

---

## Student

Can

* Register
* Login
* Enroll
* Watch lessons
* Download resources
* Attempt quizzes
* Submit assignments
* Track progress
* Receive certificates
* Update profile

---

## Instructor

Can

* Create courses
* Create modules
* Upload lessons
* Upload videos
* Manage quizzes
* Manage assignments
* Grade submissions
* View analytics

---

## Admin

Can manage

* Students
* Courses
* Payments
* Certificates
* Analytics
* CMS
* Notifications

---

## Super Administrator

Has unrestricted access including

* Admin management
* Role management
* Permission management
* Database settings
* Storage
* Email templates
* Audit logs
* Platform settings
* Maintenance mode
* Feature flags

---

# 8. Functional Modules

---

# Module 1 — Marketing Website

### Purpose

Promote courses and convert visitors into enrolled students.

### Pages

* Home
* About
* Courses
* AI Tools Mastery
* Syllabus
* Instructor
* Pricing
* FAQ
* Blog
* Contact
* Privacy Policy
* Terms
* Refund Policy

---

# Module 2 — Authentication

### Features

* Registration
* Login
* Logout
* Email Verification
* Forgot Password
* Reset Password
* Remember Me
* Session Management

---

# Module 3 — Student Dashboard

## Dashboard Widgets

* Current Course
* Learning Progress
* Upcoming Assignment
* Upcoming Quiz
* Certificates
* Announcements
* Recent Activity

---

## Sidebar

* Dashboard
* My Learning
* Assignments
* Quizzes
* Downloads
* Certificates
* Profile
* Settings
* Support

---

# Module 4 — Course Management

Hierarchy

```
Course

↓

Modules

↓

Lessons

↓

Resources

↓

Quiz

↓

Assignment

↓

Certificate
```

---

## Course Fields

* Title
* Slug
* Description
* Thumbnail
* Instructor
* Duration
* Difficulty
* Language
* Category
* Price
* Discount
* Status
* Published Date

---

# Module 5 — Lesson Management

Each lesson includes

* Title
* Description
* Video
* PDF
* Resources
* Estimated Time
* Completion Status
* Student Notes
* Bookmarks
* Comments

---

## Lesson Types

* Video
* Reading
* PDF
* External Link
* Live Session

---

# Module 6 — Video Player

Features

* Resume Playback
* Auto Next
* Playback Speed
* Subtitles
* Quality Selection
* Notes
* Bookmarks
* Picture-in-Picture
* Fullscreen

---

# Module 7 — Progress Tracking

Track

* Lessons Completed
* Videos Watched
* Assignments Submitted
* Quiz Scores
* Course Completion
* Remaining Time
* Last Activity

---

## Completion Formula

```
Video Progress

+

Quiz Performance

+

Assignment Completion

=

Overall Course Progress
```

---

# Module 8 — Assignment System

Each Assignment

* Title
* Description
* Deadline
* Submission
* Status
* Grade
* Feedback

---

Student Submission Types

* PDF
* ZIP
* Images
* Text
* External Link

---

Instructor Features

* Review
* Comments
* Marks
* Approve
* Reject

---

# Module 9 — Quiz Engine

Supported Questions

* MCQ
* Multiple Answer
* True / False
* Fill in the Blank
* Short Answer
* Code Snippet
* Image-Based Questions

---

Quiz Features

* Shuffle Questions
* Negative Marking
* Timer
* Attempt Limits
* Auto Evaluation
* Manual Review
* Pass Percentage

---

# Module 10 — Weekly Assessments

Aligned with the AI Tools Mastery syllabus.

Structure

```
Week 1

Lesson

Quiz

Assignment

↓

Week 2

...

↓

Week 12
```

Each module concludes with a mini assessment.

---

# Module 11 — Final Assessment

Students complete

* Multi-tool Capstone Project
* Presentation Upload
* Peer Review (Future)
* Instructor Evaluation

Completion unlocks certification.

---

# Module 12 — Certificates

Features

* PDF Generation
* Unique Certificate ID
* QR Verification
* Download
* LinkedIn Sharing

---

# Module 13 — Student Profile

Profile Includes

* Avatar
* Bio
* Skills
* Social Links
* Certificates
* Achievements
* Badges

---

# Module 14 — Discussion System

Each lesson supports

* Questions
* Replies
* Instructor Responses
* Pinned Answers

---

# Module 15 — Notifications

Channels

* Email
* Dashboard

Events

* Enrollment
* Assignment Reminder
* Quiz Reminder
* Course Released
* Certificate Ready

---

# Module 16 — Admin Dashboard

Overview

* Revenue
* Students
* Courses
* Certificates
* Assignments
* Quiz Statistics
* Recent Activity

Charts

* Daily Users
* Weekly Enrollments
* Completion Rate
* Assignment Submission
* Quiz Performance

---

# Module 17 — Student Management

Features

* Search
* Filter
* Suspend
* Activate
* Delete
* Enroll
* Remove
* Export CSV

---

# Module 18 — Instructor Management

Features

* Create Instructor
* Assign Courses
* Permissions
* Analytics

---

# Module 19 — CMS

Editable Sections

* Home
* About
* Testimonials
* Pricing
* FAQ
* Contact
* Navbar
* Footer

---

# Module 20 — Email System

Templates

* Welcome
* Enrollment Confirmation
* Password Reset
* Assignment Submitted
* Quiz Results
* Certificate Ready

---

# Module 21 — Payments (Future)

* Razorpay
* Stripe
* Coupons
* GST
* Invoices

---

# Module 22 — Analytics

Metrics

* Active Students
* Revenue
* Completion Rate
* Most Viewed Lessons
* Quiz Average
* Pending Assignments
* Student Retention

---

# Module 23 — Audit Logs

Track every system action

* User
* Timestamp
* IP Address
* Action
* Previous Value
* Updated Value

---

# 9. Student Learning Journey

```text
Visitor

↓

Register

↓

Email Verification

↓

Login

↓

Enroll in Course

↓

Dashboard

↓

Week 1

↓

Lessons

↓

Quiz

↓

Assignment

↓

Week Completed

↓

...

↓

Week 12

↓

Capstone Project

↓

Instructor Evaluation

↓

Certificate Generated

↓

Alumni Community
```

---

# 10. Core Database Entities

```text
users
roles
permissions

courses
course_modules
lessons
lesson_resources

enrollments
student_progress

quizzes
quiz_questions
quiz_attempts

assignments
assignment_submissions

certificates

notifications
announcements

discussions
discussion_replies

payments

audit_logs

system_settings
```

---

# 11. Non-Functional Requirements

### Performance

* Initial page load < 2 seconds
* Dashboard interactions < 500 ms
* Lazy-loaded course content
* Optimized media delivery

### Security

* Role-Based Access Control (RBAC)
* Password hashing
* CSRF/XSS protection
* Input validation with Zod
* Secure session management
* Audit logging

### Scalability

* Multi-course architecture
* Reusable content models
* Modular services
* Horizontal scaling support
* Cloud storage migration ready

### Reliability

* Daily database backups (future)
* Error logging
* Health monitoring
* Graceful failure handling

---

# 12. Version Roadmap

## Version 1 (Current)

* Marketing Website
* Course Information
* SEO Optimization
* Contact Form

---

## Version 2 (Current Expansion)

* Authentication
* Student LMS
* Instructor Panel
* Admin Dashboard
* Super Admin Console
* Course Management
* Lesson Management
* Quiz Engine
* Assignment Workflow
* Progress Tracking
* Certificates
* Notifications
* CMS
* Analytics
* Audit Logs

---

## Version 3

* Payment Gateway
* Coupons
* Referral Program
* Live Classes
* Discussion Forums
* AI Learning Assistant
* Mobile Application (React Native)

---

## Version 4

* Multi-course Marketplace
* Organization/Bulk Enrollments
* Team Dashboards
* AI Recommendation Engine
* AI Resume & Portfolio Generator
* Placement Tracking
* Public Certificate Verification Portal
* Zoom Integration
* Google Meet Integration
* Slack Integration
* Discord Integration

---

# 13. Architecture Recommendation

GenValue Academy should be developed as a **production-grade, multi-tenant-ready SaaS platform** from the outset, even though the initial release includes only a single course ("AI Tools Mastery"). The platform's architecture should treat courses, modules, lessons, quizzes, assignments, certificates, and progress tracking as reusable domain entities rather than embedding logic specific to one curriculum.

By modeling the existing 12-week AI Tools Mastery syllabus as configurable course data instead of hardcoded functionality, the platform will be able to support future AI, software development, design, business, and professional certification programs without requiring structural changes. This approach minimizes technical debt, enables rapid course expansion, and provides a robust foundation for future features such as organization-based enrollments, instructor marketplaces, AI-powered recommendations, and enterprise learning offerings.
