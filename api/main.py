from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import io

app = FastAPI()

# Allow React to communicate with this Python API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze-cv")
async def analyze_cv(file: UploadFile = File(...)):
    """Receives the PDF from React, analyzes it locally, and returns JSON."""
    try:
        file_bytes = await file.read()
        filename = file.filename
        
        # Read the PDF text
        text = ""
        if filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(file_bytes))
            text = "".join([page.extract_text() for page in reader.pages]).lower()
        else:
            text = str(file_bytes).lower()

        # Run Analysis Logic
        warnings = []
        passed = 0

        if "education" not in text and "university" not in text:
            warnings.append("Critical Issue: No 'Education' section detected.")
        else: passed += 1

        if "experience" not in text and "employment" not in text:
            warnings.append("Critical Issue: No 'Experience' section detected.")
        else: passed += 1

        if "summary" not in text and "objective" not in text:
            warnings.append("Formatting Warning: Missing Professional Summary.")
        else: passed += 1

        if "skill" not in text and "technologies" not in text:
            warnings.append("ATS Warning: No dedicated 'Skills' list detected.")
        else: passed += 1

        if len(text) < 500:
            warnings.append("Content Warning: Your resume is extremely short.")

        score = max(100 - (len(warnings) * 15), 20)
        
        # Return the data to the React frontend
        return {
            "status": "success",
            "score": score, 
            "warnings": warnings, 
            "passed": passed
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Vercel requires the app to be accessible at the module level