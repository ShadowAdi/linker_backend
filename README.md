# Linker Backend

The backend for Linker is a RESTful API built using **Express**, **Prisma**, and **JWT-based authentication**. It manages users, links, and securely authenticates each request.

## ⚙️ Stack Used

- **Express.js**
- **PostgreSQL** (via Neon)
- **Prisma ORM**
- **JWT** for authentication
- **Cheerio** to fetch & parse metadata from URLs
- **Axios** for internal link scraping
- **Dotenv**, **CORS**, **Winston & Error Middleware**, **Bcrypt**

## 📚 API Endpoints

### 🧑‍💼 `/api/user`
| Method | Route     | Description           |
|--------|-----------|-----------------------|
| POST   | `/`       | Register user         |
| POST   | `/login`  | Login user (JWT)      |
| GET    | `/me`     | Get logged-in user    |

### 🔗 `/api/links`
| Method | Route        | Description                  |
|--------|--------------|------------------------------|
| GET    | `/`          | Get all user links (auth)    |
| POST   | `/`          | Create a new link (auth)     |
| GET    | `/:linkId`   | Get single link detail       |

## 🔐 Auth Middleware

- All `/links/*` and `/user/me` routes require a valid Bearer token
- JWT is parsed to get the user from DB
- Token stored on frontend using `localStorage`


## 🏗️ Prisma Models

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  Links     Links[]
}

model Links {
  id        String   @id @default(uuid())
  url       String
  title     String
  imageUrl  String?
  domain    String
  summary   String?
  tags      String[] @default([])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
}

```

Fields like summary and tags are planned for future use with Gemini AI integration.


## 🚀 Getting Started (GitHub Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/ShadowAdi/linker_backend.git
cd linker_backend

You’ll need Node.js, PostgreSQL (Neon), and Prisma CLI installed globally.

2. Install Dependencies

npm install

3. Setup Environment Variables

Create a .env file in the backend root:

PORT=3000
DATABASE_URL=your-neon-postgresql-url
JWT_SECRET=your-very-secure-secret

4. Generate Prisma Client

npx prisma generate

5. Run Migrations

npx prisma migrate dev --name init

6. Start the Server

npm run dev

API will be live at: http://localhost:3000/api


💡 Tech Highlights

Clean error handling with CustomErrorHandler

Logging with logger.js

Metadata scraping via Cheerio and Axios

Modular routes for user and links

Secure CORS setup for frontend at localhost:5173

