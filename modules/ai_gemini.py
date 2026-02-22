import os
import json
import google.generativeai as genai


def get_resume_files():
    """Get all resume files from the resumes folder"""
    resumes = []
    resume_dir = "resumes"

    if os.path.exists(resume_dir):
        for root, dirs, files in os.walk(resume_dir):
            for file in files:
                if file.lower().endswith((".pdf", ".doc", ".docx")):
                    full_path = os.path.join(root, file)
                    relative_path = os.path.relpath(full_path, ".")
                    resumes.append(relative_path.replace("\\", "/"))

    return resumes


def find_best_cv(job_title, job_description, resume_files):
    """
    Use Gemini to find the best CV for the job
    Returns the best resume path and a score
    """
    try:
        from config.secrets import llm_api_key, llm_model

        if not llm_api_key:
            print("[AI CV Matching] No API key configured")
            return resume_files[0] if resume_files else ""

        genai.configure(api_key=llm_api_key)
        model = genai.GenerativeModel(llm_model)

        prompt = f"""Based on the job title and description, select the best CV from the list below.

Job Title: {job_title}

Job Description (first 1000 chars): {job_description[:1000]}

Available CVs:
{chr(10).join(resume_files)}

Return ONLY the filename of the best CV (e.g., "resumes/finance-manager.pdf").
If none seem relevant, return the first CV in the list.
Keep it short - just one line with the filename."""

        response = model.generate_content(prompt)

        best_cv = response.text.strip()

        # Verify the file exists
        if best_cv in resume_files:
            return best_cv
        else:
            # Try to find a partial match
            for cv in resume_files:
                if best_cv.lower() in cv.lower() or cv.lower() in best_cv.lower():
                    return cv

            # Default to first resume
            return resume_files[0] if resume_files else ""

    except Exception as e:
        print(f"[AI CV Matching Error] {e}")
        # Fallback: simple keyword matching
        job_text = (job_title + " " + job_description).lower()

        best_match = None
        best_score = 0

        for cv in resume_files:
            cv_name = cv.lower()
            score = 0

            keywords = [
                "finance",
                "accounting",
                "data",
                "software",
                "developer",
                "manager",
                "analyst",
                "engineer",
                "marketing",
                "sales",
            ]

            for keyword in keywords:
                if keyword in cv_name and keyword in job_text:
                    score += 1

            if score > best_score:
                best_score = score
                best_match = cv

        return best_match if best_match else (resume_files[0] if resume_files else "")


def generate_ai_response(prompt, context=""):
    """
    Use Gemini to generate a response for a question
    """
    try:
        from config.secrets import llm_api_key, llm_model

        if not llm_api_key:
            print("[AI Response] No API key configured")
            return ""

        genai.configure(api_key=llm_api_key)
        model = genai.GenerativeModel(llm_model)

        full_prompt = f"""{context}

Question: {prompt}

Provide a brief, professional answer (1-2 sentences max)."""

        response = model.generate_content(full_prompt)

        return response.text.strip()

    except Exception as e:
        print(f"[AI Response Error] {e}")
        return ""


def analyze_job_with_ai(job_title, job_description, company_name):
    """
    Use Gemini to analyze a job and extract key information
    Returns dict with insights
    """
    try:
        from config.secrets import llm_api_key, llm_model

        if not llm_api_key:
            print("[AI Job Analysis] No API key configured")
            return {
                "required_skills": [],
                "experience_level": "mid",
                "key_responsibilities": [],
                "fit_score": 5,
            }

        genai.configure(api_key=llm_api_key)
        model = genai.GenerativeModel(llm_model)

        prompt = f"""Analyze this job posting and provide insights:

Job Title: {job_title}
Company: {company_name}
Description: {job_description[:1500]}

Return a JSON with:
- "required_skills": list of key skills
- "experience_level": entry/mid/senior/executive
- "key_responsibilities": list of main duties
- "fit_score": how well this matches a general candidate (1-10)

Return ONLY valid JSON, no other text."""

        response = model.generate_content(prompt)

        # Parse JSON response
        try:
            result = json.loads(response.text)
            return result
        except:
            return {
                "required_skills": [],
                "experience_level": "mid",
                "key_responsibilities": [],
                "fit_score": 5,
            }

    except Exception as e:
        print(f"[AI Job Analysis Error] {e}")
        return {
            "required_skills": [],
            "experience_level": "mid",
            "key_responsibilities": [],
            "fit_score": 5,
        }
