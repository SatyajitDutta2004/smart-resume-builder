# Smart ResumeBuilder

A full-stack AI-powered resume builder with ATS (Applicant Tracking System) optimization, machine learning analysis, and intelligent resume suggestions.

**Version 2.0** - Now with Python AI backend for advanced resume analysis!

---

## 🚀 Features

### Resume Building

- ✅ Create professional, ATS-friendly resumes
- ✅ Multiple resume templates
- ✅ Real-time preview and editing
- ✅ Export to PDF, DOCX, and PNG formats
- ✅ QR code generation for sharing

### AI-Powered Analysis

- 🤖 **Resume Analysis**: Get ATS compatibility score (0-100%)
- 📊 **Keyword Extraction**: Extract and match keywords from job descriptions
- ✨ **AI Suggestions**: Get smart suggestions to improve your resume
- 🔍 **Section Optimization**: AI-powered recommendations for each resume section
- 📈 **Job Matching**: Match your resume against specific job descriptions

### Smart Features

- 💾 Version history and resume management
- 🎨 Dark/Light theme support
- 🔐 Secure authentication with JWT
- 📱 Responsive design (mobile, tablet, desktop)
- 🎯 Placement-ready with AI/ML optimizations

---

## 🛠️ Tech Stack

### Frontend

- React 18
- Vite (fast bundler)
- React Router (navigation)
- CSS3 (responsive design)

### Backend

- Node.js & Express (REST API)
- MongoDB (database)
- JWT (authentication)
- bcryptjs (password hashing)

### AI/ML Backend

- Python 3.11
- FastAPI (async API)
- NLTK (natural language processing)
- scikit-learn (machine learning)

### DevOps

- Docker & Docker Compose

---

## 📌 Essential requirements

- **Node.js** v18+ and **npm** for the frontend and backend
- **Python** 3.10+ and **pip** for the AI backend
- **MongoDB** running locally or in Docker
- `server/.env` created from `server/.env.example`
- `ai-backend/.env` created from `ai-backend/.env.example`
- Dependencies installed in each service:
  - `cd server && npm install`
  - `cd client && npm install`
  - `cd ai-backend && pip install -r requirements.txt`
- NLTK data downloaded for the Python AI backend:
  - `python -m nltk.downloader punkt stopwords`
- Optional but recommended: Docker and Docker Compose for full-stack deployment

---

## ✅ What works now

- Frontend React app structure is present and buildable with Vite
- Node/Express backend is configured with auth and resume APIs
- Python FastAPI AI backend is ready for resume analysis endpoints
- Docker Compose is included for full-stack deployment
- `.env.example` files are available for required env settings

## 🎯 What to add to make this project stronger for interviews

- polished multi-template resume builder UI with responsive design
- export options for PDF, DOCX, and shareable links
- saved resume versions, profile/dashboard, and history management
- stronger AI analysis using embeddings or transformer models
- robust input validation, error handling, and secure auth flows
- Docker Compose end-to-end setup and production-ready environment configs
- unit and integration tests for backend and AI logic
- README documentation with architecture notes, setup, and demo screenshots

---

## �📋 Prerequisites

- **Node.js** v18+
- **Python** 3.10+
- **MongoDB**
- **Docker & Docker Compose** (optional)

---

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd project_1
npm run install-all
```

### 2. Configure Environment Variables

**Server** - Create `server/.env`:

```
PORT=4001
HOST=127.0.0.1
MONGODB_URI=mongodb://localhost:27017/smart_resumebuilder
JWT_SECRET=your_super_secret_key_here_change_in_production
NODE_ENV=development
AI_BACKEND_URL=http://127.0.0.1:8000
```

### 3. Start Services

**Terminal 1 - MongoDB**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Terminal 2 - Python AI Backend**

```bash
cd ai-backend
python main.py
```

**Terminal 3 - Node Backend**

```bash
cd server
npm run dev
```

**Terminal 4 - React Frontend**

```bash
cd client
npm run dev
```

### 4. Access

- Frontend: http://localhost:5173
- Node API: http://localhost:4001
- Python AI: http://localhost:8000

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

---

## 📖 API Endpoints

### AI Backend

```
POST /api/analyze-resume    - Analyze resume ATS score
POST /api/extract-keywords  - Extract keywords
POST /api/optimize-section  - Get section suggestions
POST /api/ats-score         - Get ATS score
```

---

## 🤖 Using AI Features

```javascript
import { analyzeResume, extractKeywords, optimizeSection } from "./api.js";

// Analyze resume
const feedback = await analyzeResume(resumeContent, jobDescription);
console.log(feedback.atsScore); // 0-100%
console.log(feedback.suggestions); // Array of suggestions

// Extract keywords
const keywords = await extractKeywords(resumeContent, jobDescription);

// Optimize section
const suggestions = await optimizeSection(
  "experience",
  content,
  jobDescription,
);
```

---

## 🔧 Troubleshooting

### Blank Page?

1. Open DevTools (F12) and check console for errors
2. Hard refresh: Ctrl+F5
3. Clear cache: Ctrl+Shift+Delete
4. Check if servers are running
5. Verify MongoDB is running

### MongoDB Connection Error

```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 mongo:latest
```

### Python AI Backend Issues

```bash
cd ai-backend
pip install -r requirements.txt
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
python main.py
```

### CORS Errors

- Ensure backend is on port 4001
- Ensure AI backend is on port 8000
- Check vite.config.js proxy settings

---

## 💡 Development Commands

```bash
npm run dev          # Start all services
npm run dev:web      # Start only frontend + node backend
npm run dev:ai       # Start only AI backend
npm run build        # Build for production
npm run docker:build # Build Docker images
npm run docker:up    # Start Docker containers
```

---

## 📁 Project Structure

```
project_1/
├── client/              # React frontend
├── server/              # Node.js backend
├── ai-backend/          # Python AI/ML backend
├── docker-compose.yml   # Docker configuration
└── README.md            # This file
```

---

## 🎓 Perfect For

- ✅ Full-stack placements (MERN stack)
- ✅ AI/ML placements (Python NLP)
- ✅ Portfolio projects
- ✅ Learning purposes
- ✅ Interview preparation

---

## 🔐 Production Checklist

- [ ] Change JWT_SECRET
- [ ] Use HTTPS
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Configure CORS properly
- [ ] Use environment variables
- [ ] Set NODE_ENV=production
- [ ] Add request logging
- [ ] Setup error monitoring

---

## 📞 Support

Check the troubleshooting section or review browser console for errors.

---

## 📄 License

MIT - Open source and free to use

---

## 🎉 Open The Project

After starting, open in your browser:

**Main App**: [http://localhost:5173](http://localhost:5173)

**Demo Mode**: [http://localhost:5173/builder?demo=true](http://localhost:5173/builder?demo=true)

**Node API**: [http://127.0.0.1:4001/api](http://127.0.0.1:4001/api)

**Python AI API**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

Happy coding! 🚀

- Resume sharing: copy link to clipboard and email sharing with generated templates.
- Version history: save multiple resume versions with easy restore and auto-backup functionality.
- Docker Compose setup with MongoDB, backend API, and frontend app.

## Current Resume Capabilities

- Supported resume sections: personal details, professional summary, experience, skills, projects, education, certifications, internship, achievements, languages, GitHub, LinkedIn, and portfolio.
- Template options: Classic, Modern, Clean, Simple Professional, Modern Developer, Creative Portfolio, Minimal Resume.
- Live preview updates automatically as you type.
- Smart skill recommendation and ATS score insight available.
- Download resume in PDF, DOCX formats or print directly.
- Share via link copy or email.
- Track multiple versions of your resume.

## Planned / Missing Features

- Drag-and-drop section reordering (framework ready).
- Full theme customization: advanced color picker, font selection, layout style management.
- Portfolio website generator (one-click resume to website).
- Admin dashboard with analytics.
- Template management interface.
- Job matching system.
- Interview question generator as standalone feature.
- Voice input resume builder.
- Google Gemini API support.
- Tailwind CSS, Redux Toolkit, and Framer Motion frontend optimization.

## Tech Stack

- Frontend: React 18, Vite, React Router, React Icons, QRCode, docx, file-saver, html2canvas, jsPDF
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Auth: JWT and bcrypt
- Export: html2canvas, jsPDF, docx, file-saver
- QR Code: qrcode.react
- Dev tooling: concurrently, nodemon, Docker Compose

## Run Locally

Install dependencies:

```bash
npm run install-all
```

Create `server/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ai_resume_builder
JWT_SECRET=replace_with_a_strong_secret
PORT=4001
HOST=127.0.0.1
OPENAI_API_KEY=
```

Start the full project:

```bash
npm run dev
```

Open:

[http://localhost:5173](http://localhost:5173)

## Production Build

```bash
npm run build
```

The production frontend files are generated in `client/dist`.

## Docker Run

```bash
docker compose up --build
```

Then open:

[http://localhost:8080](http://localhost:8080)

## API Summary

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/resume`
- `POST /api/resume`
- `PUT /api/resume/:id`
- `DELETE /api/resume/:id`
- `POST /api/resume/suggestions`
- `POST /api/resume/skills`
- `POST /api/resume/ai-content`
- `POST /api/resume/chat`
- `POST /api/resume/analyze-job`
- `POST /api/resume/ats`
- `GET /api/resume/analysis`
- `POST /api/resume/analysis`
- `GET /api/resume/analysis/stats`
- `GET /api/resume/analysis/:id`
- `DELETE /api/resume/analysis/:id`
- `PATCH /api/resume/analysis/:id/restore`

## Smoke Test

With the server running:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke_test.ps1
```

## Notes

- `OPENAI_API_KEY` is optional. Without it, the backend returns polished fallback content so the app still works.
- Keep `JWT_SECRET` private and strong in production.
- The frontend calls `VITE_API_HOST` when provided, otherwise it defaults to `http://localhost:4000/api`.
- The frontend calls `VITE_API_HOST` when provided, otherwise it defaults to `/api`. In local Vite development, `/api` is proxied to `http://127.0.0.1:4001`.
