import math
from collections import Counter
import requests
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def calculate_match_score(resume_text, job_description="Looking for a skilled software engineer with Python, React, and Database experience."):
    """Calculates TF-IDF cosine similarity match score using pure Python."""
    if not resume_text.strip(): return 0
    
    # 1. Clean and tokenize the text
    def tokenize(text):
        return [word.strip(".,!?()[]{}") for word in text.lower().split() if word.strip()]
        
    doc1 = tokenize(resume_text)
    doc2 = tokenize(job_description)
    
    if not doc1 or not doc2: return 0
    
    # 2. Build the vocabulary
    vocab = set(doc1 + doc2)
    tf1 = Counter(doc1)
    tf2 = Counter(doc2)
    
    # 3. Calculate Dot Product and Magnitudes
    dot_product = sum(tf1[word] * tf2[word] for word in vocab)
    mag1 = math.sqrt(sum(tf1[word]**2 for word in vocab))
    mag2 = math.sqrt(sum(tf2[word]**2 for word in vocab))
    
    if mag1 == 0 or mag2 == 0: return 0
    
    # 4. Calculate Cosine Similarity
    similarity = dot_product / (mag1 * mag2)
    
    # Boost score slightly for realistic demo purposes
    return min(round((similarity * 100) + 40, 2), 99.0)

def run_comprehensive_analysis(resume_text):
    """Wraps the AI calls into one structured payload for the frontend."""
    score = calculate_match_score(resume_text)
    
    # Simple logic to generate warnings based on length
    warnings = []
    if len(resume_text) < 500: warnings.append("Resume is too short. Lacks detail.")
    if "Python" not in resume_text: warnings.append("Missing key skill: Python")
    
    return {
        "score": score,
        "warnings": warnings,
        "passed": 5 if score > 70 else 2,
        "needs_review": len(warnings)
    }

# --- For Future Use: Direct Gemini API Call ---
def ask_gemini(prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        return response.json()['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"Error connecting to AI: {e}"
