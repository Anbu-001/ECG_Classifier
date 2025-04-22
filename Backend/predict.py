import os
from datetime import datetime
from io import BytesIO

import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications import ResNet50
import google.generativeai as genai
from fpdf import FPDF
from werkzeug.utils import secure_filename

# ─── Configuration ──────────────────────────────────────────────────────────────

# Flask setup
app = Flask(__name__)
CORS(app)  # enable CORS for all routes
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Gemini API
genai.configure(api_key="AIzaSyCc7orrlpozTChPcGL98_WX_3og6Q3XooE")
gemini = genai.GenerativeModel("models/gemini-1.5-flash-latest")

# ECG Keras model
ECG_MODEL_PATH = "C:\\Users\\TEST\\Desktop\\ECG_WebApp\\Backend\\ecg_lstm_model.h5"
ecg_model = tf.keras.models.load_model(ECG_MODEL_PATH, compile=False)
ecg_model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

# ResNet50 feature extractor
IMAGE_SIZE = (224, 224)
base_model = ResNet50(weights="imagenet", include_top=False, input_shape=(*IMAGE_SIZE, 3))
base_model.trainable = False

# Class labels
CLASS_NAMES = ["arrhythmia", "hmi", "mi", "normal"]

# ─── Helper Functions ────────────────────────────────────────────────────────────

def preprocess_image(path: str) -> np.ndarray:
    """Load image, resize, normalize, extract features via ResNet50."""
    img = load_img(path, target_size=IMAGE_SIZE)
    arr = img_to_array(img) / 255.0
    arr = np.expand_dims(arr, 0)
    feats = base_model.predict(arr, verbose=0)
    return feats.reshape(1, -1, feats.shape[-1])

def llm_chat(prompt: str) -> str:
    """Query Gemini for a text response."""
    return gemini.generate_content(prompt).text

def get_llm_recommendation(label: str,name:str,age: str,gender: str) -> str:
    """Build and send a structured prompt to Gemini."""
    prompt = f"""
    You are a medical assistant generating part of an official ECG diagnostic report for a real patient.

    Patient Details:
    - Name: {name}
    - Age: {age}
    - Gender: {gender}

    Diagnosis: {label}

    Please provide the following sections using real content only (do not use placeholders or generic templates):

    1. **Condition Summary**: A concise, informative definition of the condition.
    2. **Key Symptoms**: A bullet list of common symptoms typically observed in patients with this condition.
    3. **Causes and Risk Factors**: A bullet list explaining the likely causes and contributing factors.
    4. **Recommended Actions**: Clinical advice for the next steps (tests, referrals, medications).
    5. **Lifestyle Advice**: Preventive or supportive lifestyle tips to manage or reduce the severity of the condition.
    - Tailor this advice to the patient's age. 
    - If the patient is young (under 30), suggest age-appropriate preventive care, habits, or early interventions.
    - If the patient is elderly (over 60), include advice on managing comorbidities, mobility, diet, and regular monitoring.

    Use a clear, professional tone. Do not use placeholders like "[Patient Name]" or "[Date]". This is a real diagnostic report intended for the above patient.
    """


    return llm_chat(prompt)

def generate_pdf(patient: dict, result: dict, img_path: str) -> BytesIO:
    """
    Create a structured ECG report PDF using only:
      - patient (name, age, gender)
      - result (label, confidence, recommendation)
      - ECG image
    """
    pdf = FPDF()
    pdf.add_page()

    # Title and Timestamp
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "ECG Diagnostic Report", ln=True, align="C")
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 6, datetime.now().strftime("%d %b %Y, %H:%M:%S"), ln=True, align="C")
    pdf.ln(5)

    # Patient Information
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 8, "Patient Information", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.cell(50, 6, "Name:", border=0)
    pdf.cell(0, 6, sanitize_text(patient.get("name", "")), ln=True)
    pdf.cell(50, 6, "Age / Gender:", border=0)
    pdf.cell(0, 6, f"{sanitize_text(patient.get('age',''))} / {sanitize_text(patient.get('gender',''))}", ln=True)
    pdf.ln(5)

    # Diagnosis
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 8, "Diagnosis", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.cell(50, 6, "Condition:", border=0)
    pdf.cell(0, 6, sanitize_text(result.get("label","")).upper(), ln=True)
    pdf.cell(50, 6, "Confidence:", border=0)
    pdf.cell(0, 6, f"{result.get('confidence',0):.1f}%", ln=True)
    pdf.ln(5)

    # Clinical Notes & Recommendations
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 8, "Clinical Notes & Recommendations", ln=True)
    pdf.set_font("Arial", "", 12)
    for line in result.get("recommendation", "").split("\n"):
        if line.strip():
            pdf.multi_cell(0, 6, sanitize_text(line))
    pdf.ln(5)

    # ECG Image on new page
    if os.path.exists(img_path):
        pdf.add_page()
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "ECG Image", ln=True, align="C")
        pdf.ln(5)
        usable_w = pdf.w - pdf.l_margin - pdf.r_margin
        pdf.image(img_path, x=pdf.l_margin, y=pdf.get_y(), w=usable_w)
        pdf.ln(5)

    # Footer Disclaimer
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_y(-30)
    pdf.set_font("Arial", "I", 9)
    pdf.multi_cell(
        0, 5,
        "Note: This ECG report was generated with AI-assisted tools. "
        "Please consult a licensed cardiologist for interpretation and clinical decisions."
    )

    # Export PDF to BytesIO
    pdf_bytes = pdf.output(dest="S").encode("latin-1")
    buffer = BytesIO(pdf_bytes)
    buffer.seek(0)
    return buffer

# ─── Flask Routes ────────────────────────────────────────────────────────────────
def sanitize_text(text):
    """Convert non-latin1 characters to closest equivalents or remove them."""
    return text.encode('latin-1', 'replace').decode('latin-1')
@app.route("/",methods=["GET"])
def home():
    return "Backend Working Properly...!"
@app.route("/predict", methods=["POST"])
def predict():
    # 1) Validate input
    if "image" not in request.files:
        return jsonify({"error": "Missing `image` field"}), 400

    image = request.files["image"]
    name  = request.form.get("name")
    age   = request.form.get("age")
    gender= request.form.get("gender")

    if not all([name, age, gender]):
        return jsonify({"error": "Missing patient info (name, age, gender)"}), 400

    # 2) Save upload
    filename   = secure_filename(image.filename)
    save_path  = os.path.join(UPLOAD_FOLDER, filename)
    image.save(save_path)

    try:
        # 3) Model inference
        feats = preprocess_image(save_path)
        preds = ecg_model.predict(feats, verbose=0)
        idx   = int(np.argmax(preds))
        label = CLASS_NAMES[idx]
        conf  = float(np.max(preds)) * 100

        # 4) LLM recommendation
        rec  = get_llm_recommendation(label,name,age,gender)

        # 5) Generate PDF with sanitized inputs
        patient = {
            "name": sanitize_text(name),
            "age": sanitize_text(age),
            "gender": sanitize_text(gender)
        }
        result = {
            "label": sanitize_text(label),
            "confidence": conf,
            "recommendation": sanitize_text(rec)
        }
        pdf_io = generate_pdf(patient, result, save_path)

        # 6) Return PDF
        return send_file(
            pdf_io,
            download_name=f"ECG_Report_{name.replace(' ', '_')}.pdf",
            mimetype="application/pdf",
            as_attachment=True
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Run ────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
