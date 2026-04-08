import io
import PyPDF2
import docx

def extract_text_from_file_bytes(file_bytes, filename):
    """Extracts text directly from memory (bytes) to avoid saving to disk."""
    text = ""
    file_stream = io.BytesIO(file_bytes)
    
    if filename.endswith('.pdf'):
        reader = PyPDF2.PdfReader(file_stream)
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted: text += extracted + "\n"
            
    elif filename.endswith('.docx'):
        doc = docx.Document(file_stream)
        text = "\n".join([para.text for para in doc.paragraphs])
        
    return text