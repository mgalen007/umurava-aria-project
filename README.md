# ARIA - AI-Powered Recruitment Platform

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

**ARIA** (Automated Recruitment Intelligence Assistant) is a modern, AI-powered recruitment platform designed to streamline the hiring process. It leverages Google's Gemini AI to enhance candidate screening, job matching, and recruitment workflows.

**Live Demo:** [https://umurava-aria-project.vercel.app](https://umurava-aria-project.vercel.app)

## 🎯 Features

- **AI-Powered Candidate Screening** - Intelligent candidate evaluation using Google Gemini AI
- **Job Management** - Create, manage, and organize job postings
- **Candidate Database** - Comprehensive candidate profile management
- **Real-time Notifications** - Stay updated with recruitment activities
- **Session Management** - Track recruitment sessions and interviews
- **File Processing** - Support for CSV, Excel, and PDF file uploads
- **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- **Responsive UI** - Modern, mobile-friendly interface built with React and Next.js

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.2.4
- **Language:** TypeScript 5
- **UI Components:** React 18
- **Charting:** Recharts 2.12.7
- **Icons:** Lucide React 0.378.0
- **Styling:** CSS

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.2.1
- **Language:** TypeScript 6.0.2
- **Database:** MongoDB 9.4.1
- **Authentication:** JWT + bcryptjs
- **AI Integration:** Google Generative AI
- **Security:** Helmet, CORS
- **File Processing:** Multer, ExcelJS, PDF-Parse, PapaParse

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (local or remote instance)
- **Google Generative AI API Key** (get it from [Google AI Studio](https://aistudio.google.com))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/chaste-ganza/umurava-aria-project.git
cd umurava-aria-project
```

### 2. Server Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory using the provided example:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ARIA
MONGO_MAX_POOL_SIZE=20
MONGO_MIN_POOL_SIZE=2
MONGO_SERVER_SELECTION_TIMEOUT_MS=5000
MONGO_SOCKET_TIMEOUT_MS=45000
JWT_SECRET=your_secret_jwt_key_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
GEMINI_API_KEY=your_google_api_key_here
AI_REQUEST_TIMEOUT_MS=45000
AI_MAX_RETRIES=2
AI_RETRY_BASE_DELAY_MS=1500
CORS_ORIGIN=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

### 3. Client Setup

In a new terminal, navigate to the client directory and install dependencies:

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📦 Available Scripts

### Server

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm run migrate:candidate-email-index  # Database migration script
```

### Client

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Candidates
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Create a new candidate
- `GET /api/candidates/:id` - Get candidate details
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Sessions
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:id` - Get session details

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification

### Health Check
- `GET /health` - API health status

## 🗄️ Database Schema

The application uses MongoDB with the following main collections:
- **Users** - Authentication and user profiles
- **Jobs** - Job postings and descriptions
- **Candidates** - Candidate profiles and information
- **Sessions** - Interview/recruitment sessions
- **Notifications** - User notifications

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **CORS Protection** - Cross-Origin Resource Sharing configured
- **Helmet** - HTTP security headers
- **Input Validation** - Zod schema validation on requests
- **Error Handling** - Centralized error handling middleware

## 📝 Project Structure

```
umurava-aria-project/
├── client/                 # Next.js frontend application
│   ├── app/               # App directory (Next.js 13+)
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   ├── public/            # Static assets
│   ├── package.json
│   └── tsconfig.json
├── server/                # Express.js backend application
│   ├── src/
│   │   ├── features/      # Feature modules (auth, jobs, candidates, etc.)
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # MongoDB schemas
│   │   ├── app.ts         # Express app setup
│   │   └── server.ts      # Server entry point
│   ├── dist/              # Compiled JavaScript (generated)
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## 🚢 Deployment

### Prerequisites for Deployment
- Production MongoDB instance
- Google Generative AI API key
- Environment variables configured
- Node.js runtime (v18+)

### Build for Production

**Server:**
```bash
cd server
npm run build
npm start
```

**Client:**
```bash
cd client
npm run build
npm start
```

### Docker Deployment (Recommended)

Create a `Dockerfile` for containerized deployment:

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/dist ./dist
CMD ["node", "dist/server.js"]
```

### Environment Variables for Production

Update your production `.env` file:

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_api_key
CORS_ORIGIN=https://yourdomain.com
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check remote connection string
- Verify `MONGODB_URI` in `.env`
- Check firewall rules for MongoDB port (27017)

### API Not Connecting
- Verify `CORS_ORIGIN` matches your frontend URL
- Check `PORT` in `.env` (default: 4000)
- Ensure backend server is running: `npm run dev` in server directory

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Delete build cache: `rm -rf .next` (client) or `rm -rf dist` (server)
- Check Node.js version: `node --version` (should be v18+)

## 📄 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` \| `production` |
| `MONGODB_URI` | Database connection | `mongodb://localhost:27017/ARIA` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `GEMINI_API_KEY` | Google AI API key | `AIzaSy...` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `AI_REQUEST_TIMEOUT_MS` | AI request timeout | `45000` |
| `AI_MAX_RETRIES` | Max AI request retries | `2` |

## 📚 Documentation

For more detailed information:
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Google Generative AI API](https://ai.google.dev/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub Issues](https://github.com/chaste-ganza/umurava-aria-project/issues)
- Contact the development team

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Authors

- **Chaste** (@chaste-ganza) - Project Lead
- **SanoAngella** (@SanoAngella) - Frontend Developer
- **RUGWIRO Mike Galen** (@mgalen007) - Backend Developer

## 🙏 Acknowledgments

- [Google Generative AI](https://ai.google.dev/) for AI capabilities
- [Next.js](https://nextjs.org/) for the modern frontend framework
- [Express.js](https://expressjs.com/) for the robust backend framework
- [MongoDB](https://www.mongodb.com/) for the flexible database

---

**Last Updated:** April 25, 2026  
**Version:** 0.1.0 (Alpha)

⭐ If you find this project helpful, please consider giving it a star!
