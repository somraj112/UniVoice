# UniVoice

> A centralized digital platform for Rishihood University that streamlines the process of registering, tracking, and resolving complaints submitted by students and faculty.

---

## What is UniVoice?

UniVoice replaces the traditional, manual complaint process with a structured post-based system. Students and faculty submit complaints as **posts** (optionally anonymous), the community upvotes or downvotes them to surface the most valid issues, and admins track, assign, and resolve them — all in one place.

---

## Features

### For Students & Faculty
- Submit complaints as posts with title, description, category, priority, and tags
- Post anonymously if needed
- Upvote or downvote posts — each post gets a live **validity score**
- Comment on posts to add context or follow up
- Track the real-time status of your complaint (Open → In Review → In Progress → Resolved → Closed)
- View pinned announcements from administration

### For Admins
- Review all incoming posts across departments
- Assign complaints to specific staff members
- Change post status inline from the dashboard
- Pin important announcements for the entire university
- View statistics — total posts, posts by status, resolved this week

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| API Style | REST |

---

## Project Structure

```
UniVoice/
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.ts               # MongoDB connection
│       ├── models/
│       │   ├── User.ts             # Base user + discriminators
│       │   ├── Post.ts             # Post (complaint) schema
│       │   ├── Comment.ts          # Comment schema
│       │   ├── Announcement.ts     # Announcement schema
│       │   └── ValidityScore.ts    # Vote-based score per post
│       ├── services/
│       │   ├── AuthService.ts      # Register, login, JWT
│       │   ├── PostService.ts      # Post CRUD + voting
│       │   ├── CommentService.ts   # Comment CRUD
│       │   ├── AnnouncementService.ts
│       │   └── AdminService.ts     # Admin operations + stats
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── post.routes.ts
│       │   ├── comment.routes.ts
│       │   ├── announcement.routes.ts
│       │   └── admin.routes.ts
│       ├── middleware/
│       │   └── authMiddleware.ts   # verifyToken, requireRole
│       ├── app.ts                  # Express app setup
│       └── server.ts              # Entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── PostCard.tsx         # Single post with vote buttons
        │   ├── PostFeed.tsx         # Feed with filters + search
        │   ├── PostForm.tsx         # Create complaint form
        │   ├── PostDetail.tsx       # Full post view
        │   ├── CommentThread.tsx    # Comments section
        │   ├── AnnouncementBanner.tsx
        │   ├── AdminDashboard.tsx   # Stats + management view
        │   ├── PostTable.tsx        # Sortable admin post table
        │   ├── LoginForm.tsx
        │   └── RegisterForm.tsx
        ├── pages/
        │   ├── Home.tsx
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   ├── PostDetailPage.tsx
        │   └── AdminPage.tsx
        ├── types/
        │   └── index.ts            # Shared TypeScript interfaces
        └── App.tsx
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repository

```bash
git clone https://github.com/your-username/UniVoice.git
cd UniVoice
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET
npm run dev
```

Backend runs at `http://localhost:3000`

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/UniVoice
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user profile |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | Get all posts (supports `?category=&status=`) |
| GET | `/api/posts/:id` | Get single post with validity score |
| POST | `/api/posts` | Create a new post |
| PATCH | `/api/posts/:id` | Edit a post (author only) |
| PATCH | `/api/posts/:id/status` | Change post status |
| POST | `/api/posts/:id/upvote` | Upvote a post |
| POST | `/api/posts/:id/downvote` | Downvote a post |
| DELETE | `/api/posts/:id` | Delete a post |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/comments/:postId` | Get all comments on a post |
| POST | `/api/comments` | Add a comment |
| PATCH | `/api/comments/:id` | Edit a comment (author only) |
| DELETE | `/api/comments/:id` | Delete a comment |

### Announcements
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/announcements` | Get all announcements |
| POST | `/api/announcements` | Create announcement (admin/faculty) |
| PATCH | `/api/announcements/:id/pin` | Toggle pin status |
| DELETE | `/api/announcements/:id` | Delete announcement |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Get dashboard statistics |
| GET | `/api/admin/posts` | Get all posts with filters |
| PATCH | `/api/admin/:id/assign` | Assign post to staff |
| PATCH | `/api/admin/:id/status` | Change post status |
| DELETE | `/api/admin/:id` | Delete any post |

---

## Post Status Flow

```
OPEN → IN_REVIEW → IN_PROGRESS → RESOLVED → CLOSED
                ↘ REJECTED
```

A resolved post can be reopened by the author if the issue recurs.

---

## Data Models

### User (with role-based discriminators)
```
userId, name, email (college only), password (hashed),
role (student | faculty | admin), gender, department, yearOfStudy

Student:  + rollNumber, course
Faculty:  + employeeId, designation
Admin:    + adminLevel (department | university)
```

### Post (Complaint)
```
postId, userId (FK), assignedTo (FK), title, body (optional),
category, status, priority, tags[], upvotes, downvotes,
isAnonymous, createdAt, updatedAt
```

### Comment
```
commentId, complaintId (FK → Post), userId (FK),
body, isInternal, createdAt, updatedAt
```

### ValidityScore
```
scoreId, postId (FK, unique), score (0.0–1.0),
totalVotes, upvotes, downvotes, calculatedAt
```

### Announcement
```
announcementId, userId (FK), title, body,
isPinned, createdAt, updatedAt
```

---

## Design Principles

- **SOLID** — Single Responsibility across all files, Open/Closed for new roles and filters, Liskov Substitution in User hierarchy, Interface Segregation via focused DTOs, Dependency Inversion through service layer
- **OOP** — Inheritance (Student/Faculty/Admin extend User), Encapsulation (services hide DB logic), Polymorphism (toSafeJSON per subclass), Composition (AdminService composes PostService + AuthService)
- **Design Patterns** — Singleton (all services), Factory (AuthService.register), Facade (AdminService), Decorator (authMiddleware), Strategy (PostFeed filters), Template Method (toSafeJSON)

---

## Team

| Member | Role | Key Files |
|---|---|---|
| **Somraj** | Project Lead + Authentication | Auth + User Models | User.ts, AuthService.ts, authMiddleware.ts, LoginForm, RegisterForm |
| **Krishna** | Posts | Post.ts, ValidityScore.ts, PostService.ts, post.routes.ts, App.tsx |
| **Himani** | Comments + Announcements | Comment.ts, Announcement.ts, CommentService.ts, CommentThread |
| **Vriha** | Frontend UI | PostCard, PostFeed, PostForm, PostDetail, App.css |
| **Neeraj** | Admin + Database | AdminService.ts, db.ts, AdminDashboard, PostTable |

---

## Diagrams

All UML, ER, sequence, activity, state machine, component, and deployment diagrams are available in `/images/`.

---

## License

This project was built as a capstone project at Rishihood University. For academic use only.