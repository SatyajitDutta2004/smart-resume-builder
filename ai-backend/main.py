from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
from dotenv import load_dotenv
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re

load_dotenv()

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

app = FastAPI(
    title="Smart ResumeBuilder AI Backend",
    description="AI-powered resume analysis and optimization",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ResumeRequest(BaseModel):
    content: str
    jobDescription: str = ""

class ResumeFeedback(BaseModel):
    atsScore: float
    keywordMatches: List[str]
    missingKeywords: List[str]
    suggestions: List[str]
    strengthAreas: List[str]
    improvementAreas: List[str]

class OptimizationRequest(BaseModel):
    section: str
    content: str
    jobDescription: str = ""

class OptimizationResponse(BaseModel):
    optimizedContent: str
    suggestions: List[str]

# Utility functions
def clean_text(text: str) -> str:
    """Clean and normalize text"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text

def extract_keywords(text: str) -> List[str]:
    """Extract important keywords from text"""
    stop_words = set(stopwords.words('english'))
    words = word_tokenize(clean_text(text))
    keywords = [w for w in words if w not in stop_words and len(w) > 3]
    return list(set(keywords))

def calculate_ats_score(resume: str, job_desc: str = "") -> Dict:
    """Calculate ATS compatibility score"""
    resume_clean = clean_text(resume)
    job_desc_clean = clean_text(job_desc) if job_desc else ""
    
    resume_keywords = set(extract_keywords(resume))
    job_keywords = set(extract_keywords(job_desc)) if job_desc else set()
    
    # ATS checks
    checks = {
        'has_email': bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', resume)),
        'has_phone': bool(re.search(r'\b\d{10}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', resume)),
        'has_links': bool(re.search(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', resume)),
        'has_sections': len(re.findall(r'(experience|education|skills|projects)', resume_clean)) >= 2,
        'formatted_simple': '\t' not in resume and len(resume.split('\n')) > 3
    }
    
    score = sum(checks.values()) * 20
    
    # Keyword matching bonus
    if job_keywords:
        matched = len(resume_keywords & job_keywords)
        keyword_score = (matched / len(job_keywords)) * 30
        score += keyword_score
    
    return {
        'score': min(100, score),
        'checks': checks,
        'matched_keywords': list(resume_keywords & job_keywords) if job_keywords else [],
        'missing_keywords': list(job_keywords - resume_keywords) if job_keywords else []
    }

def generate_suggestions(resume: str, job_desc: str = "") -> List[str]:
    """Generate improvement suggestions"""
    suggestions = []
    
    if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', resume):
        suggestions.append("Add your email address")
    
    if not re.search(r'\b\d{10}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', resume):
        suggestions.append("Include a phone number")
    
    if len(resume) < 300:
        suggestions.append("Resume seems too short. Add more details about your experience and skills")
    
    if len(resume) > 2000:
        suggestions.append("Resume is quite long. Consider condensing to 1 page")
    
    sections = re.findall(r'(experience|education|skills|projects|achievements)', resume.lower())
    if 'experience' not in sections:
        suggestions.append("Add a professional experience section")
    if 'skills' not in sections:
        suggestions.append("Add a skills section")
    if 'education' not in sections:
        suggestions.append("Add an education section")
    
    job_keywords = extract_keywords(job_desc) if job_desc else []
    resume_keywords = set(extract_keywords(resume))
    missing = [k for k in job_keywords if k not in resume_keywords]
    if missing[:3]:
        suggestions.append(f"Try incorporating these job keywords: {', '.join(missing[:3])}")
    
    return suggestions[:5]

# API Endpoints
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "AI Backend Running", "service": "Smart ResumeBuilder AI"}

@app.post("/api/analyze-resume", response_model=ResumeFeedback)
async def analyze_resume(request: ResumeRequest):
    """Analyze resume for ATS compatibility and provide feedback"""
    try:
        ats_result = calculate_ats_score(request.content, request.jobDescription)
        suggestions = generate_suggestions(request.content, request.jobDescription)
        
        # Categorize suggestions
        strength_areas = []
        improvement_areas = []
        
        if ats_result['checks']['has_email']:
            strength_areas.append("Contact information included")
        if ats_result['checks']['has_sections']:
            strength_areas.append("Well-organized with clear sections")
        if ats_result['checks']['formatted_simple']:
            strength_areas.append("Simple, ATS-friendly formatting")
        
        if not ats_result['checks']['has_links']:
            improvement_areas.append("Consider adding LinkedIn profile or portfolio link")
        if len(request.content) < 500:
            improvement_areas.append("Add more detailed descriptions of your roles")
        
        return ResumeFeedback(
            atsScore=ats_result['score'],
            keywordMatches=ats_result['matched_keywords'][:10],
            missingKeywords=ats_result['missing_keywords'][:10],
            suggestions=suggestions,
            strengthAreas=strength_areas,
            improvementAreas=improvement_areas
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/extract-keywords")
async def extract_keywords_endpoint(request: ResumeRequest):
    """Extract important keywords from resume"""
    try:
        keywords = extract_keywords(request.content)
        job_keywords = extract_keywords(request.jobDescription) if request.jobDescription else []
        
        return {
            "resumeKeywords": keywords[:20],
            "jobKeywords": job_keywords[:20],
            "matchedKeywords": [k for k in keywords if k in job_keywords],
            "totalMatches": len([k for k in keywords if k in job_keywords])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/optimize-section", response_model=OptimizationResponse)
async def optimize_section(request: OptimizationRequest):
    """Provide suggestions to optimize a specific resume section"""
    try:
        suggestions = []
        
        if request.section.lower() == "experience":
            if not re.search(r'(led|managed|developed|designed|implemented)', request.content, re.I):
                suggestions.append("Use action verbs like 'Led', 'Managed', 'Developed', 'Designed'")
            if not re.search(r'\d+%|\d+\s*(million|k|thousand)', request.content):
                suggestions.append("Add quantifiable metrics to show impact")
        
        elif request.section.lower() == "skills":
            skill_count = len(request.content.split(','))
            if skill_count < 5:
                suggestions.append("Add more relevant skills")
            suggestions.append("Group skills by category (Technical, Professional, Languages)")
        
        elif request.section.lower() == "education":
            if not re.search(r'(gpa|honors|distinction)', request.content, re.I):
                suggestions.append("Include relevant achievements or honors if applicable")
        
        
        if request.jobDescription:
            job_keywords = extract_keywords(request.jobDescription)
            section_keywords = extract_keywords(request.content)
            missing = [k for k in job_keywords if k not in section_keywords]
            if missing:
                suggestions.append(f"Try incorporating: {', '.join(missing[:3])}")
        
        return OptimizationResponse(
            optimizedContent=request.content,
            suggestions=suggestions[:5]
            

        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/ats-score")
async def get_ats_score(request: ResumeRequest):
    """Get ATS compatibility score"""
    try:
        result = calculate_ats_score(request.content, request.jobDescription)
        return {
            "score": result['score'],
            "checks": result['checks'],
            "feedback": f"Your resume has an ATS compatibility score of {result['score']:.1f}%"

        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("AI_BACKEND_HOST", "0.0.0.0"),
        port=int(os.getenv("AI_BACKEND_PORT", 8000)),
    )
