import json
from difflib import SequenceMatcher

import requests
from django.conf import settings
from django.db import IntegrityError, transaction
from django.db.models import Count, F, Q, Avg
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from notifications.utils import create_admin_notification
from payments.models import Payment
from accounts.permissions import IsAdmin, IsAdminOrReceptionist
from doctors.models import Doctor, Department, TimeSlot
from patients.models import PatientProfile

from .models import Appointment, AISymptomReport
from .serializers import AppointmentSerializer, AdminAppointmentSerializer


DISEASE_CATALOG = [
    ("diabetes", ("diabetes", "diabetes mellitus", "diabetic"), "Endocrinologist", "Metabolic health"),
    ("thyroid disorder", ("thyroid", "hypothyroidism", "hyperthyroidism"), "Endocrinologist", "Metabolic health"),
    ("hypertension", ("high blood pressure", "blood pressure"), "Cardiologist", "Heart health"),
    ("asthma", ("asthma",), "Pulmonologist", "Respiratory health"),
    ("pneumonia", ("pneumonia",), "Pulmonologist", "Respiratory health"),
    ("bronchitis", ("bronchitis",), "Pulmonologist", "Respiratory health"),
    ("tuberculosis", ("tuberculosis", "tb"), "Pulmonologist", "Respiratory health"),
    ("fever", ("fever", "jor", "জ্বর"), "General Physician", "General Medicine"),
    ("influenza", ("influenza", "flu"), "General Physician", "General Medicine"),
    ("common cold", ("common cold", "cold", "sordi", "সর্দি"), "General Physician", "General Medicine"),
    ("sinusitis", ("sinusitis", "sinus infection"), "ENT Specialist", "Ear, nose and throat"),
    ("tonsillitis", ("tonsillitis",), "ENT Specialist", "Ear, nose and throat"),
    ("pharyngitis", ("pharyngitis", "sore throat"), "ENT Specialist", "Ear, nose and throat"),
    ("dengue", ("dengue",), "General Physician", "Infectious disease"),
    ("malaria", ("malaria",), "General Physician", "Infectious disease"),
    ("covid-19", ("covid", "coronavirus"), "General Physician", "Infectious disease"),
    ("migraine", ("migraine",), "Neurologist", "Neurological health"),
    ("epilepsy", ("epilepsy", "seizure disorder"), "Neurologist", "Neurological health"),
    ("vertigo", ("vertigo",), "Neurologist", "Neurological health"),
    ("stroke", ("stroke",), "Neurologist", "Neurological health"),
    ("parkinson's disease", ("parkinson",), "Neurologist", "Neurological health"),
    ("eczema", ("eczema",), "Dermatologist", "Skin health"),
    ("psoriasis", ("psoriasis",), "Dermatologist", "Skin health"),
    ("acne", ("acne",), "Dermatologist", "Skin health"),
    ("dermatitis", ("dermatitis",), "Dermatologist", "Skin health"),
    ("urticaria", ("urticaria", "hives"), "Dermatologist", "Skin health"),
    ("gastritis", ("gastritis",), "Gastroenterologist", "Digestive health"),
    ("acid reflux", ("acid reflux", "gerd"), "Gastroenterologist", "Digestive health"),
    ("ulcerative colitis", ("ulcerative colitis",), "Gastroenterologist", "Digestive health"),
    ("irritable bowel syndrome", ("irritable bowel", "ibs"), "Gastroenterologist", "Digestive health"),
    ("hepatitis", ("hepatitis",), "Gastroenterologist", "Digestive health"),
    ("appendicitis", ("appendicitis",), "General Surgeon", "Digestive health"),
    ("gallstones", ("gallstones", "gallstone"), "Gastroenterologist", "Digestive health"),
    ("constipation", ("constipation",), "Gastroenterologist", "Digestive health"),
    ("kidney stone", ("kidney stone", "renal stone"), "Urologist", "Urinary health"),
    ("urinary tract infection", ("urinary tract infection", "uti"), "Urologist", "Urinary health"),
    ("benign prostate enlargement", ("prostate enlargement", "bph"), "Urologist", "Urinary health"),
    ("arthritis", ("arthritis",), "Orthopedic Surgeon", "Bones and joints"),
    ("osteoporosis", ("osteoporosis",), "Orthopedic Surgeon", "Bones and joints"),
    ("slipped disc", ("slipped disc", "herniated disc"), "Orthopedic Surgeon", "Bones and joints"),
    ("dental caries", ("dental caries", "cavity", "cavities"), "Dentist", "Dental health"),
    ("gingivitis", ("gingivitis",), "Dentist", "Dental health"),
    ("periodontitis", ("periodontitis",), "Dentist", "Dental health"),
    ("conjunctivitis", ("conjunctivitis", "pink eye"), "Ophthalmologist", "Eye health"),
    ("cataract", ("cataract",), "Ophthalmologist", "Eye health"),
    ("glaucoma", ("glaucoma",), "Ophthalmologist", "Eye health"),
    ("endometriosis", ("endometriosis",), "Gynecologist", "Women's health"),
    ("polycystic ovary syndrome", ("polycystic ovary", "pcos"), "Gynecologist", "Women's health"),
    ("urinary pregnancy concern", ("pregnancy",), "Gynecologist", "Women's health"),
    ("anemia", ("anemia",), "Hematologist", "Blood health"),
    ("headache", ("headache",), "Neurologist", "Neurological health"),
    ("low back pain", ("low back pain",), "Orthopedic Surgeon", "Bones and joints"),
    ("anxiety disorder", ("anxiety",), "Psychiatrist", "Mental wellbeing"),
    ("depression", ("depression",), "Psychiatrist", "Mental wellbeing"),
]

SYMPTOM_CONDITION_RULES = [
    ("heart disease", ("heart", "cardiology", "cardiac", "buk betha", "বুক ব্যথা", "chest pain", "chest pressure", "heart pain", "palpitations", "irregular heartbeat", "shortness of breath", "breathlessness"), "Cardiologist", "Cardiology"),
    ("common cold", ("cold", "runny nose", "blocked nose", "sneezing", "nasal congestion", "cold symptoms"), "General Physician", "Respiratory health"),
    ("influenza", ("high fever", "body ache", "body pain", "fever and cough", "flu symptoms"), "General Physician", "Infectious disease"),
    ("respiratory infection", ("cough", "kashi", "কাশি", "persistent cough", "dry cough", "wet cough", "cough with phlegm", "sore throat", "difficulty breathing"), "General Physician", "General Medicine"),
    ("diabetes", ("frequent urination", "excessive thirst", "increased thirst", "high blood sugar", "blood sugar is high", "blurred vision and thirst"), "Endocrinologist", "Metabolic health"),
    ("neurological disorder", ("neurology", "neurological problem", "nerve problem"), "Neurologist", "Neurological health"),
    ("migraine", ("matha betha", "মাথা ব্যথা", "one sided headache", "one-sided headache", "throbbing headache", "headache with nausea", "light sensitivity", "severe headache"), "Neurologist", "Neurological health"),
    ("gastritis", ("burning stomach", "stomach burning", "upper abdominal pain", "stomach pain after eating", "indigestion and pain"), "Gastroenterologist", "Digestive health"),
    ("stomach pain", ("stomach pain", "abdominal pain", "pet betha", "পেট ব্যথা"), "Gastroenterologist", "Digestive health"),
    ("urinary tract infection", ("burning while urinating", "burning urination", "painful urination", "frequent urination with burning", "blood in urine"), "Urologist", "Urinary health"),
    ("dental caries", ("tooth pain", "toothache", "sensitive tooth", "hole in tooth", "swollen gum", "bleeding gums"), "Dentist", "Dental health"),
    ("eczema", ("itchy red patches", "dry itchy skin", "red itchy rash", "scaly skin", "skin rash that itches"), "Dermatologist", "Skin health"),
    ("skin rash", ("skin rash", "rash on skin", "skin allergy", "চামড়ায় র‍্যাশ"), "Dermatologist", "Skin health"),
    ("arthritis", ("joint pain and stiffness", "swollen joints", "knee pain and stiffness", "painful swollen joints", "morning joint stiffness"), "Orthopedic Surgeon", "Bones and joints"),
    ("conjunctivitis", ("red itchy eye", "red eyes with discharge", "eye discharge", "painful red eye"), "Ophthalmologist", "Eye health"),
    ("anxiety disorder", ("panic attacks", "constant worry", "anxiety and fear", "racing thoughts", "anxious all the time"), "Psychiatrist", "Mental wellbeing"),
]

SPECIALIST_PROFILE_ALIASES = {
    "generalphysician": ("medicine", "generalmedicine", "medicinespecialist", "internalmedicine"),
    "cardiologist": ("cardiology", "cardiac", "interventionalcardiologist"),
    "neurologist": ("neurology",),
    "orthopedicsurgeon": ("orthopedics", "orthopedic"),
    "gastroenterologist": ("gastroenterology", "gastro"),
    "dermatologist": ("dermatology",),
    "dentist": ("dental", "dentalsurgeon"),
    "ophthalmologist": ("ophthalmology",),
    "urologist": ("urology",),
    "gynecologist": ("gynecology", "obstetrics", "gynecologistandobstetrician"),
    "entspecialist": ("ent", "otolaryngology"),
    "pulmonologist": ("pulmonology", "respiratorymedicine", "medicine"),
    "endocrinologist": ("endocrinology", "medicine"),
    "psychiatrist": ("psychiatry", "mentalhealth"),
    "hematologist": ("hematology", "medicine"),
    "generalsurgeon": ("generalsurgery", "surgery"),
}


def normalize_disease_text(value):
    return " ".join("".join(character for character in word.lower() if character.isalnum()) for word in str(value).split()).strip()


def fuzzy_alias_match(text, aliases):
    tokens = text.split()
    for token in tokens:
        if len(token) < 5:
            continue
        for alias in aliases:
            normalized_alias = normalize_disease_text(alias)
            if len(normalized_alias.split()) != 1 or len(normalized_alias) < 5:
                continue
            if SequenceMatcher(None, token, normalized_alias).ratio() >= 0.76:
                return True
    return False


def find_department_request(value):
    normalized_input = normalize_disease_text(value)
    if not normalized_input:
        return None
    departments = Department.objects.filter(is_active=True).only("name")
    for department in departments:
        normalized_name = normalize_disease_text(department.name)
        if normalized_name == normalized_input or normalized_name in normalized_input:
            return department.name
        if fuzzy_alias_match(normalized_input, [normalized_name]):
            return department.name
    return None


def find_catalog_disease(value):
    text = normalize_disease_text(value)
    tokens = text.split()
    stop_words = {"a", "an", "and", "are", "for", "have", "i", "in", "is", "it", "my", "of", "on", "the", "to", "with"}
    for disease, aliases, specialist, category in DISEASE_CATALOG:
        for alias in aliases:
            normalized_alias = normalize_disease_text(alias)
            if normalized_alias in tokens or (len(normalized_alias) > 3 and normalized_alias in text):
                return disease, specialist, category
            if any(2 <= len(token) <= 4 and token not in stop_words and normalized_alias.startswith(token) for token in tokens):
                return disease, specialist, category
            if fuzzy_alias_match(text, [normalized_alias]):
                return disease, specialist, category
    compact_text = " ".join(text.split())
    for disease, signals, specialist, category in SYMPTOM_CONDITION_RULES:
        if any(normalize_disease_text(signal) in compact_text for signal in signals):
            return disease, specialist, category
    return None


def find_catalog_diseases(value):
    text = normalize_disease_text(value)
    tokens = text.split()
    stop_words = {"a", "an", "and", "are", "for", "have", "i", "in", "is", "it", "my", "of", "on", "the", "to", "with"}
    matches = []
    for disease, aliases, specialist, category in DISEASE_CATALOG:
        for alias in aliases:
            normalized_alias = normalize_disease_text(alias)
            exact_match = normalized_alias in tokens or (len(normalized_alias) > 3 and normalized_alias in text)
            prefix_match = any(2 <= len(token) <= 4 and token not in stop_words and normalized_alias.startswith(token) for token in tokens)
            if exact_match or prefix_match:
                matches.append((disease, specialist, category))
                break
            if fuzzy_alias_match(text, [normalized_alias]):
                matches.append((disease, specialist, category))
                break
    for disease, signals, specialist, category in SYMPTOM_CONDITION_RULES:
        if any(normalize_disease_text(signal) in text for signal in signals):
            matches.append((disease, specialist, category))
    unique = {}
    for match in matches:
        unique[match[0]] = match
    return list(unique.values())


def fallback_symptom_analysis(symptoms, duration, severity):
    disease_matches = find_catalog_diseases(symptoms)
    if disease_matches:
        disease, specialist, category = disease_matches[0]
        return {
            "category": category,
            "possible_conditions": [match[0] for match in disease_matches],
            "specialist": specialist,
            "keywords": [specialist.lower()],
            "matched_specialists": list(dict.fromkeys(match[1] for match in disease_matches)),
            "recommendation_allowed": True,
            "guidance": "This is a possible condition, not a diagnosis. Consult the recommended specialist for examination and testing.",
        }
    text = symptoms.lower()
    matches = [
        ("neurological", ["headache", "migraine", "dizziness", "numb", "seizure", "neurology", "memory"], "Neurologist", ["migraine", "tension headache", "vertigo"], ["neuro"]),
        ("heart and breathing", ["chest", "heart", "palpitation", "breathless", "breathing"], "Cardiologist", ["asthma", "arrhythmia", "heart-related concern"], ["cardio", "heart"]),
        ("skin and allergy", ["itch", "rash", "acne", "skin", "eczema", "allergy"], "Dermatologist", ["contact dermatitis", "eczema", "allergic reaction"], ["dermat", "skin"]),
        ("digestive health", ["stomach", "diarrhea", "vomit", "acid", "constipation", "abdomen"], "Gastroenterologist", ["gastritis", "acid reflux", "gastroenteritis"], ["gastro", "medicine"]),
        ("women's health", ["period", "pregnan", "pelvic", "pregnancy", "women"], "Gynecologist", ["menstrual disorder", "pelvic infection", "pregnancy-related concern"], ["gynec", "obstetric"]),
        ("bones and muscles", ["joint", "bone", "back pain", "knee", "fracture", "muscle"], "Orthopedic Surgeon", ["muscle strain", "arthritis", "back-related concern"], ["ortho"]),
        ("dental health", ["tooth", "teeth", "gum", "cavity", "dental", "jaw"], "Dentist", ["dental caries", "gum disease", "dental infection"], ["dental"]),
        ("eye health", ["eye", "vision", "blurry", "red eye", "vision loss"], "Ophthalmologist", ["conjunctivitis", "refractive error", "eye irritation"], ["ophthalm", "eye"]),
        ("urinary health", ["urine", "urinary", "kidney", "burning urination"], "Urologist", ["urinary tract infection", "kidney stone", "urinary irritation"], ["urolog", "kidney"]),
        ("general medicine", ["fever", "cough", "cold", "flu", "sore throat", "infection"], "General Physician", ["viral infection", "influenza", "upper respiratory infection"], ["medicine", "general"]),
    ]
    category, terms, specialist, conditions, keywords = next(
        (item for item in matches if any(term in text for term in item[1])),
        ("", [], "", [], []),
    )
    emergency = any(signal in text for signal in ["chest pain", "difficulty breathing", "unconscious", "severe bleeding", "stroke"])
    urgency = "High" if emergency or severity == "Severe" else "Medium" if severity == "Moderate" or duration in {"More than 1 week", "More than 1 month"} else "Low"
    guidance = "Seek emergency care immediately for these warning signs." if emergency else "This is a preliminary possibility, not a diagnosis. Consult a qualified doctor for examination and testing."
    return {
        "category": category.title(),
        "possible_conditions": conditions,
        "specialist": specialist,
        "keywords": keywords,
        "recommendation_allowed": bool(specialist and conditions),
        "urgency": urgency,
        "guidance": guidance,
    }


def rank_recommended_doctors(specialists, department_name=""):
    normalized_specialists = [
        "".join(character for character in specialist.lower() if character.isalpha())
        for specialist in specialists
    ]
    if not normalized_specialists:
        return []
    doctors = (
        Doctor.objects.filter(
            user__is_active=True,
            user__role="doctor",
            approval_status="approved",
            is_available=True,
            **({"department__name__iexact": department_name} if department_name else {}),
        )
        .select_related("user", "department")
        .annotate(
            rating_average=Avg("ratings__rating"),
            active_schedule_count=Count("schedules", filter=Q(schedules__is_active=True), distinct=True),
            available_slot_count=Count(
                "schedules__slots",
                filter=Q(
                    schedules__is_active=True,
                    schedules__slots__is_active=True,
                    schedules__slots__booked_count__lt=F("schedules__slots__max_patient"),
                ),
                distinct=True,
            ),
        )
    )
    ranked = []
    for doctor in doctors:
        if not doctor.specialization and not doctor.department:
            continue
        profile = "".join(
            character for character in f"{doctor.specialization} {doctor.department.name if doctor.department else ''}".lower()
            if character.isalpha()
        )
        match_score = 0
        for prefix in normalized_specialists:
            aliases = SPECIALIST_PROFILE_ALIASES.get(prefix, ())
            alias_scores = [len(alias) + 10 for alias in aliases if alias in profile]
            if alias_scores:
                match_score = max(match_score, *alias_scores)
            elif prefix in profile or profile in prefix:
                match_score = max(match_score, len(prefix))
        if not match_score:
            continue
        doctor_name = doctor.user.get_full_name().strip() or doctor.user.username
        ranked.append({
            "id": doctor.id,
            "doctor_name": f"Dr. {doctor_name}" if not doctor_name.lower().startswith("dr.") else doctor_name,
            "specialization": doctor.specialization,
            "department_name": doctor.department.name if doctor.department else "",
            "average_rating": round(float(doctor.rating_average or 0), 1),
            "rating_count": doctor.ratings.count(),
            "available_slot_count": doctor.available_slot_count,
            "active_schedule_count": doctor.active_schedule_count,
            "experience": doctor.experience,
            "consultation_fee": str(doctor.consultation_fee),
            "match_score": match_score,
        })
    return sorted(
        ranked,
        key=lambda doctor: (
            doctor["match_score"],
            doctor["available_slot_count"] > 0,
            doctor["average_rating"],
            doctor["rating_count"],
            doctor["experience"],
        ),
        reverse=True,
    )[:5]


class SymptomAnalysisView(APIView):
    """Analyze symptoms with Gemini without exposing the provider key."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        symptoms = str(request.data.get("symptoms", "")).strip()
        duration = str(request.data.get("duration", "")).strip()
        severity = str(request.data.get("severity", "")).strip()
        if len(symptoms) < 3:
            return Response({"detail": "Please describe your symptoms in more detail."}, status=status.HTTP_400_BAD_REQUEST)
        department_request = find_department_request(symptoms)
        prompt = f"""You are a cautious clinical symptom-triage assistant. Analyze the patient's symptoms and return JSON only.
This is not a diagnosis. Recommend the most relevant doctor specialty based on the symptom pattern, and list likely conditions as possibilities only.
Patient symptoms: {symptoms}
Duration: {duration}
Self-reported severity: {severity}

Return exactly this JSON shape:
{{
  "category": "short health category",
  "possible_conditions": ["condition possibility 1", "condition possibility 2"],
  "specialist": "one doctor specialty",
  "keywords": ["specialty matching keyword"],
  "urgency": "Low or Medium or High",
  "guidance": "clear next step and safety advice"
}}
Use High for emergency warning signs such as chest pain, severe breathing difficulty, stroke signs, unconsciousness, or severe bleeding. Do not prescribe medicine or claim certainty."""
        analysis = None
        provider = "Gemini"
        if settings.GEMINI_API_KEY:
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"
            try:
                response = requests.post(
                    endpoint,
                    params={"key": settings.GEMINI_API_KEY},
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
                    },
                    timeout=25,
                )
                response.raise_for_status()
                response_data = response.json()
                text = response_data["candidates"][0]["content"]["parts"][0]["text"]
                analysis = json.loads(text.strip().removeprefix("```json").removesuffix("```").strip())
            except (requests.RequestException, KeyError, IndexError, TypeError, json.JSONDecodeError):
                analysis = None
        if analysis is None:
            analysis = fallback_symptom_analysis(symptoms, duration, severity)
            provider = "Clinical fallback"

        input_disease_matches = find_catalog_diseases(symptoms)
        if department_request:
            analysis["possible_conditions"] = [department_request]
            analysis["matched_specialists"] = [department_request]
            analysis["specialist"] = department_request
            analysis["category"] = department_request
            analysis["recommendation_allowed"] = True
        elif input_disease_matches:
            analysis["possible_conditions"] = [match[0] for match in input_disease_matches]
            analysis["matched_specialists"] = list(dict.fromkeys(match[1] for match in input_disease_matches))
            analysis["specialist"] = analysis["matched_specialists"][0]
            analysis["category"] = input_disease_matches[0][2]
            analysis["recommendation_allowed"] = True
        else:
            analysis["possible_conditions"] = []
            analysis["specialist"] = ""
            analysis["matched_specialists"] = []
            analysis["recommendation_allowed"] = False

        urgency = str(analysis.get("urgency", "Medium")).title()
        if urgency not in {"Low", "Medium", "High"}:
            urgency = "Medium"
        conditions = analysis.get("possible_conditions", [])
        keywords = analysis.get("keywords", [])
        if not isinstance(conditions, list):
            conditions = [str(conditions)] if conditions else []
        if not isinstance(keywords, list):
            keywords = [str(keywords)] if keywords else []
        specialist = str(analysis.get("specialist", "")).strip()
        category = str(analysis.get("category", "")).strip()
        matched_specialists = [str(item).strip() for item in analysis.get("matched_specialists", []) if str(item).strip()]
        if specialist and specialist not in matched_specialists:
            matched_specialists.insert(0, specialist)
        recommendation_allowed = bool(analysis.get("recommendation_allowed", conditions and matched_specialists))
        match_prefixes = []
        for matched_specialist in matched_specialists:
            normalized_prefix_source = "".join(character for character in matched_specialist.lower() if character.isalpha())
            match_prefixes.extend(normalized_prefix_source[:length] for length in (2, 3, 4) if len(normalized_prefix_source) >= length)
        match_prefixes = list(dict.fromkeys(match_prefixes))
        emergency_signals = ("chest pain", "severe breathing difficulty", "difficulty breathing", "unconscious", "unconsciousness", "severe bleeding", "stroke", "stroke-like", "suicidal")
        urgent_warning = any(signal in symptoms.lower() for signal in emergency_signals)
        generic_pain = any(token in symptoms.lower().split() for token in ("pain", "betha", "ব্যথা")) and not any(
            location in symptoms.lower() for location in ("head", "chest", "stomach", "back", "joint", "মাথা", "বুক", "পেট", "পিঠ")
        )
        follow_up_question = (
            "Where do you feel the pain: head, chest, stomach, back, joint, or another area?"
            if generic_pain else ""
            if recommendation_allowed else "No clear symptom or medical concern was detected. Please describe your health problem, for example: fever, headache, chest pain, cough, or stomach pain."
        )
        confidence = 0.95 if department_request else 0.9 if input_disease_matches else 0.0
        analysis_method = "local-rule-based" if (department_request or input_disease_matches) else "local-rule-based-no-match"
        recommended_doctors = rank_recommended_doctors(matched_specialists, department_request) if recommendation_allowed else []
        return Response({
            "category": category or "Unclassified symptoms",
            "possibleConditions": [str(item) for item in conditions[:5]],
            "specialist": specialist,
            "matchedSpecialists": matched_specialists,
            "keywords": [str(item).lower() for item in keywords[:8]],
            "matchPrefixes": match_prefixes,
            "recommendationAllowed": recommendation_allowed,
            "isMedicalInput": recommendation_allowed or bool(generic_pain),
            "confidence": confidence,
            "recommendedDepartment": department_request or category,
            "detectedSymptoms": [str(item) for item in conditions[:5]],
            "urgentWarning": urgent_warning,
            "followUpQuestion": follow_up_question,
            "recommendedDoctors": recommended_doctors,
            "urgency": urgency,
            "guidance": str(analysis.get("guidance", "Consult a qualified doctor for an in-person assessment.")),
            "symptoms": symptoms,
            "duration": duration,
            "severity": severity,
            "aiProvider": provider,
            "analysisMethod": analysis_method,
        })


# ==========================================================
# Helper Functions
# ==========================================================

def get_patient_profile(user):
    """
    Return PatientProfile for the logged-in patient.
    """

    if not user or not user.is_authenticated:
        raise ValidationError({
            "detail": "Authentication is required."
        })

    if getattr(user, "role", None) != "patient":
        raise ValidationError({
            "detail": "Only patients can perform this action."
        })

    try:
        return user.patient_profile

    except PatientProfile.DoesNotExist:
        raise ValidationError({
            "patient": (
                "Patient profile not found. "
                "Please complete your registration first."
            )
        })


def refund_appointment_payments(appointment):
    """Refund an unreimbursed paid transaction exactly once on cancellation."""
    from payments.models import Payment

    for payment in Payment.objects.select_for_update().filter(
        appointment=appointment,
        payment_status="Paid",
        refunded_amount__isnull=True,
    ):
        refund_amount = (payment.amount * Decimal("0.80")).quantize(Decimal("0.01"))
        retained_amount = (payment.amount - refund_amount).quantize(Decimal("0.01"))
        payment.payment_status = "Refunded"
        payment.refunded_amount = refund_amount
        payment.refund_retained_amount = retained_amount
        payment.is_refundable = False
        payment.save(update_fields=[
            "payment_status",
            "refunded_amount",
            "refund_retained_amount",
            "is_refundable",
            "updated_at",
        ])
        Notification.objects.create(
            user=payment.patient.user,
            notification_type="Payment",
            title="Appointment payment refunded",
            message=(
                f"BDT {refund_amount} from transaction "
                f"{payment.transaction_id} has been refunded."
            ),
        )


def get_doctor_name(doctor):
    """
    Return doctor display name.
    """

    full_name = doctor.user.get_full_name().strip()

    if full_name:
        return f"Dr. {full_name}"

    return f"Dr. {doctor.user.username}"


def create_appointment_notification(
    *,
    user,
    title,
    message,
):
    """
    Create appointment notification.
    """

    Notification.objects.create(
        user=user,
        notification_type="Appointment",
        title=title,
        message=message,
        is_read=False,
    )


class AdminAppointmentListView(generics.ListAPIView):

    serializer_class = AdminAppointmentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = None

    def get_queryset(self):
        queryset = Appointment.objects.all()
        if self.request.query_params.get("history") != "true":
            queryset = queryset.filter(status__in=["Pending", "Confirmed"])
        appointment_date = self.request.query_params.get("date")
        if appointment_date:
            queryset = queryset.filter(appointment_date=appointment_date)
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            queryset = queryset.filter(appointment_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(appointment_date__lte=date_to)
        return queryset.select_related(
            "patient__user",
            "family_member",
            "doctor__user",
            "doctor__department",
            "slot",
        ).prefetch_related("payments").order_by(
            "-appointment_date", "-created_at",
        )


class AdminAppointmentStatusView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        next_status = request.data.get("status")
        valid_statuses = dict(Appointment.STATUS_CHOICES)

        if next_status not in valid_statuses:
            return Response(
                {"detail": "Invalid appointment status."},
                status=status.HTTP_400_BAD_REQUEST,
            )


        appointment.status = next_status
        appointment.save(update_fields=["status", "updated_at"])

        return Response(
            {"id": appointment.id, "status": appointment.status},
            status=status.HTTP_200_OK,
        )


class ReceptionistAppointmentListView(generics.ListAPIView):
    serializer_class = AdminAppointmentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReceptionist]
    pagination_class = None

    def get_queryset(self):
        # Match the admin running-appointments view: only active bookings
        # belong in the receptionist operational queue.
        queryset = Appointment.objects.filter(
            status__in=["Pending", "Confirmed"]
        )
        appointment_date = self.request.query_params.get("date")
        if appointment_date:
            queryset = queryset.filter(appointment_date=appointment_date)
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(booking_number__icontains=search)
                | Q(patient__user__first_name__icontains=search)
                | Q(patient__user__last_name__icontains=search)
                | Q(patient__user__phone__icontains=search)
                | Q(doctor__user__first_name__icontains=search)
                | Q(doctor__user__last_name__icontains=search)
            )
        return queryset.select_related(
            "patient__user", "family_member", "doctor__user", "doctor__department", "slot"
        ).prefetch_related("payments").order_by("appointment_date", "slot__slot_time", "id")


class ReceptionistAppointmentStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrReceptionist]

    def patch(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        next_status = request.data.get("status")
        if next_status not in {"Pending", "Confirmed", "Completed", "Cancelled"}:
            return Response({"detail": "Invalid receptionist appointment status."}, status=status.HTTP_400_BAD_REQUEST)
        appointment.status = next_status
        appointment.save(update_fields=["status", "updated_at"])
        return Response({"id": appointment.id, "status": appointment.status}, status=status.HTTP_200_OK)


class AdminAppointmentDeleteView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        booking_number = appointment.booking_number
        appointment.delete()
        return Response(
            {"detail": f"Appointment {booking_number} was deleted."},
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Book Appointment
#
# POST:
# /api/appointments/book/
# ==========================================================

class BookAppointmentView(
    generics.CreateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def perform_create(self, serializer):

        # ==================================================
        # Get logged-in patient
        # ==================================================

        patient = get_patient_profile(
            self.request.user
        )

        # ==================================================
        # Atomic Transaction
        # ==================================================

        with transaction.atomic():

            # Lock the patient row so simultaneous bookings for different
            # doctors cannot bypass the overlap check.
            patient = (
                PatientProfile.objects
                .select_for_update()
                .get(pk=patient.pk)
            )

            appointment_date = serializer.validated_data.get(
                "appointment_date"
            )

            selected_slot = serializer.validated_data.get(
                "slot"
            )

            if appointment_date and selected_slot:

                has_conflicting_appointment = (
                    Appointment.objects
                    .filter(
                        patient=patient,
                        appointment_date=appointment_date,
                        slot__slot_time=selected_slot.slot_time,
                        status__in=["Pending", "Confirmed"],
                    )
                    .exists()
                )

                if has_conflicting_appointment:
                    raise ValidationError({
                        "appointment_date": (
                            "You already have an active appointment "
                            "at this date and time. Please choose "
                            "another time."
                        ),
                    })

            # ==================================================
            # Get and lock selected TimeSlot
            # ==================================================

            if not selected_slot:
                raise ValidationError({
                    "slot": "A valid time slot is required."
                })

            slot = (
                TimeSlot.objects
                .select_for_update()
                .select_related(
                    "schedule",
                    "schedule__doctor",
                )
                .get(
                    id=selected_slot.id
                )
            )

            # ==================================================
            # Slot Active Check
            # ==================================================

            if not slot.is_active:

                raise ValidationError({
                    "slot":
                    "This time slot is currently unavailable."
                })

            # ==================================================
            # Schedule Active Check
            # ==================================================

            if not slot.schedule.is_active:

                raise ValidationError({
                    "slot":
                    "Doctor schedule is currently inactive."
                })

            # ==================================================
            # Doctor Validation
            # ==================================================

            selected_doctor = serializer.validated_data.get(
                "doctor"
            )

            if selected_doctor:

                if (
                    slot.schedule.doctor_id
                    !=
                    selected_doctor.id
                ):

                    raise ValidationError({
                        "slot":
                        (
                            "This time slot does not belong "
                            "to the selected doctor."
                        )
                    })

            # ==================================================
            # Slot Capacity Check
            # ==================================================

            if (
                slot.max_patient
                and
                slot.booked_count >= slot.max_patient
            ):

                raise ValidationError({
                    "slot":
                    "This time slot is already full."
                })

            # ==================================================
            # Create Appointment
            # ==================================================

            try:
                with transaction.atomic():
                    appointment = serializer.save(
                        patient=patient,
                        status="Pending",
                    )
            except IntegrityError as exc:
                if (
                    "unique_patient_doctor_slot" in str(exc)
                    or "appointments_appointment.patient_id" in str(exc)
                ):
                    raise ValidationError({
                        "appointment_date": (
                            "You already have this appointment booked. "
                            "Please choose another time."
                        ),
                    }) from exc
                raise

            # ==================================================
            # Doctor Name
            # ==================================================

            doctor_name = get_doctor_name(
                appointment.doctor
            )

            # ==================================================
            # Appointment Target Name
            # ==================================================

            if appointment.family_member:

                target_name = (
                    appointment.family_member.name
                )

            else:

                target_name = (
                    patient.user.get_full_name().strip()
                    or
                    patient.user.username
                )

            # ==================================================
            # Create Notification
            # ==================================================

            create_appointment_notification(

                user=self.request.user,

                title="Appointment Booked Successfully",

                message=(
                    f"Appointment "
                    f"{appointment.booking_number} "
                    f"for {target_name} with "
                    f"{doctor_name} has been booked successfully. "
                    f"Your appointment is currently pending."
                ),
            )

            create_appointment_notification(

                user=appointment.doctor.user,

                title="New Appointment",

                message=(
                    f"{target_name} booked an appointment for "
                    f"{appointment.appointment_date} at "
                    f"{appointment.slot.slot_time.strftime('%I:%M %p')}."
                ),
            )

            create_admin_notification(
                notification_type="Appointment",
                title="New appointment booked",
                message=(
                    f"{target_name} booked appointment "
                    f"{appointment.booking_number} with {doctor_name}."
                ),
            )


# ==========================================================
# Patient Appointment List
#
# GET:
# /api/appointments/patient/
# ==========================================================

class PatientAppointmentListView(
    generics.ListAPIView
):

    serializer_class = AppointmentSerializer

    # The frontend paginates this history locally after applying its own
    # search and status filters, so the patient endpoint must return the
    # complete appointment history.
    pagination_class = None

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        try:

            patient = get_patient_profile(
                self.request.user
            )

        except ValidationError:

            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                patient=patient,
            )
            .select_related(
                "patient",
                "patient__user",
                "family_member",
                "doctor",
                "doctor__user",
                "doctor__department",
                "slot",
                "slot__schedule",
            )
            .order_by(
                "-appointment_date",
                "-created_at",
            )
        )


# ==========================================================
# Patient Appointment Details
#
# GET:
# /api/appointments/<id>/
# ==========================================================

class AppointmentDetailView(
    generics.RetrieveAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    lookup_url_kwarg = "id"

    def get_queryset(self):

        try:

            patient = get_patient_profile(
                self.request.user
            )

        except ValidationError:

            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                patient=patient,
            )
            .select_related(
                "patient",
                "patient__user",
                "family_member",
                "doctor",
                "doctor__user",
                "doctor__department",
                "slot",
                "slot__schedule",
            )
        )


# ==========================================================
# Cancel Appointment
#
# PATCH:
# /api/appointments/<id>/cancel/
# ==========================================================

class CancelAppointmentView(
    generics.UpdateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    lookup_url_kwarg = "id"

    def get_queryset(self):

        try:

            patient = get_patient_profile(
                self.request.user
            )

        except ValidationError:

            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                patient=patient
            )
            .select_related(
                "doctor",
                "doctor__user",
                "family_member",
                "slot",
            )
        )

    def patch(
        self,
        request,
        *args,
        **kwargs
    ):

        appointment = self.get_object()

        if appointment.status not in [
            "Pending",
            "Confirmed",
            "Rejected",
        ]:

            return Response(
                {
                    "detail": (
                        "Only pending or confirmed "
                        "appointments can be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        paid_payments = appointment.payments.filter(
            payment_status__in=["Paid", "Partially Paid"],
        )
        if paid_payments.exists():
            return Response(
                {
                    "detail": (
                        "Please submit a refund request and wait for approval "
                        "before cancelling a paid appointment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            was_rejected = appointment.status == "Rejected"

            # Lock appointment row again
            appointment = (
                Appointment.objects
                .select_for_update()
                .select_related(
                    "doctor",
                    "doctor__user",
                    "patient",
                    "patient__user",
                    "slot",
                )
                .get(
                    id=appointment.id
                )
            )

            # Lock slot
            slot = None

            if appointment.slot_id:

                slot = (
                    TimeSlot.objects
                    .select_for_update()
                    .filter(
                        id=appointment.slot_id
                    )
                    .first()
                )

            # Cancel appointment
            appointment.status = "Cancelled"

            appointment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            refund_appointment_payments(appointment)

            # Release slot capacity
            if not was_rejected and slot and slot.booked_count > 0:

                slot.booked_count -= 1

                slot.save(
                    update_fields=[
                        "booked_count",
                    ]
                )

            doctor_name = get_doctor_name(
                appointment.doctor
            )

            create_appointment_notification(

                user=request.user,

                title="Appointment Cancelled",

                message=(
                    f"Your appointment "
                    f"{appointment.booking_number} "
                    f"with {doctor_name} "
                    f"has been cancelled successfully."
                ),
            )

            target_name = (
                appointment.family_member.name
                if appointment.family_member
                else appointment.patient.user.get_full_name().strip()
                or appointment.patient.user.username
            )

            create_appointment_notification(

                user=appointment.doctor.user,

                title="Appointment Cancelled",

                message=(
                    f"{target_name} cancelled the appointment on "
                    f"{appointment.appointment_date} at "
                    f"{appointment.slot.slot_time.strftime('%I:%M %p')}."
                ),
            )

        return Response(
            {
                "message":
                    "Appointment cancelled successfully.",

                "appointment":
                    AppointmentSerializer(
                        appointment,
                        context={
                            "request": request
                        }
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Doctor Appointment List
#
# GET:
# /api/appointments/doctor/
# ==========================================================

class DoctorAppointmentListView(
    generics.ListAPIView
):

    serializer_class = AppointmentSerializer

    pagination_class = None

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":
            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):
            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                doctor=user.doctor_profile
            )
            .exclude(
                payments__payment_status="Refunded"
            )
            .select_related(
                "patient",
                "patient__user",
                "family_member",
                "doctor",
                "doctor__user",
                "doctor__department",
                "slot",
                "slot__schedule",
            )
            .order_by(
                "appointment_date",
                "slot__slot_time",
            )
        )


# ==========================================================
# Doctor Appointment Details
#
# GET:
# /api/appointments/doctor/<id>/
# ==========================================================

class DoctorAppointmentDetailView(
    generics.RetrieveAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":
            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):
            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                doctor=user.doctor_profile
            )
            .exclude(
                payments__payment_status="Refunded"
            )
            .select_related(
                "patient",
                "patient__user",
                "family_member",
                "doctor",
                "doctor__user",
                "doctor__department",
                "slot",
                "slot__schedule",
            )
        )


# ==========================================================
# Doctor Confirm Appointment
#
# PATCH:
# /api/appointments/doctor/<id>/confirm/
# ==========================================================

class DoctorConfirmAppointmentView(
    generics.UpdateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":
            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):
            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                doctor=user.doctor_profile
            )
            .select_related(
                "patient",
                "patient__user",
                "doctor",
                "doctor__user",
                "family_member",
                "slot",
            )
        )

    def patch(
        self,
        request,
        *args,
        **kwargs
    ):

        appointment = self.get_object()

        if appointment.status != "Pending":

            return Response(
                {
                    "detail":
                    "Only pending appointments can be confirmed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = "Confirmed"

        appointment.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        doctor_name = get_doctor_name(
            appointment.doctor
        )

        create_appointment_notification(

            user=appointment.patient.user,

            title="Appointment Confirmed",

            message=(
                f"Your appointment "
                f"{appointment.booking_number} "
                f"with {doctor_name} "
                f"has been confirmed."
            ),
        )

        return Response(
            {
                "message":
                    "Appointment confirmed successfully.",

                "appointment":
                    AppointmentSerializer(
                        appointment,
                        context={
                            "request": request
                        }
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Doctor Reject Appointment
#
# PATCH:
# /api/appointments/doctor/<id>/reject/
# ==========================================================

class DoctorRejectAppointmentView(
    generics.UpdateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":
            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):
            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                doctor=user.doctor_profile
            )
            .select_related(
                "patient",
                "patient__user",
                "doctor",
                "doctor__user",
                "family_member",
                "slot",
            )
        )

    def patch(
        self,
        request,
        *args,
        **kwargs
    ):

        appointment = self.get_object()

        if appointment.status != "Pending":

            return Response(
                {
                    "detail":
                    "Only pending appointments can be rejected."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        rejection_reason = str(request.data.get("rejection_reason", "")).strip()

        if not rejection_reason:
            return Response(
                {"rejection_reason": "A rejection reason is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(rejection_reason) > 1000:
            return Response(
                {"rejection_reason": "The rejection reason is too long."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            appointment = (
                Appointment.objects
                .select_for_update()
                .select_related(
                    "doctor",
                    "doctor__user",
                    "patient",
                    "patient__user",
                    "slot",
                )
                .get(
                    id=appointment.id
                )
            )

            slot = None

            if appointment.slot_id:

                slot = (
                    TimeSlot.objects
                    .select_for_update()
                    .filter(
                        id=appointment.slot_id
                    )
                    .first()
                )

            appointment.status = "Rejected"
            appointment.rejection_reason = rejection_reason

            appointment.save(
                update_fields=[
                    "status",
                    "rejection_reason",
                    "updated_at",
                ]
            )

            refund_appointment_payments(appointment)

            # Release booked slot
            if slot and slot.booked_count > 0:

                slot.booked_count = max(
                    slot.booked_count - 1,
                    0,
                )

                slot.save(
                    update_fields=[
                        "booked_count",
                    ]
                )

            doctor_name = get_doctor_name(
                appointment.doctor
            )

            create_appointment_notification(

                user=appointment.patient.user,

                title="Appointment Rejected",

                message=(
                    f"Your appointment "
                    f"{appointment.booking_number} "
                    f"with {doctor_name} has been rejected. "
                    f"Reason: {rejection_reason}"
                ),
            )

        return Response(
            {
                "message":
                    "Appointment rejected successfully.",

                "appointment":
                    AppointmentSerializer(
                        appointment,
                        context={
                            "request": request
                        }
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Doctor Complete Appointment
#
# PATCH:
# /api/appointments/doctor/<id>/complete/
# ==========================================================

class DoctorCompleteAppointmentView(
    generics.UpdateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":
            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):
            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                doctor=user.doctor_profile
            )
            .select_related(
                "patient",
                "patient__user",
                "doctor",
                "doctor__user",
                "family_member",
                "slot",
            )
        )

    def patch(
        self,
        request,
        *args,
        **kwargs
    ):

        appointment = self.get_object()

        if appointment.status != "Confirmed":

            return Response(
                {
                    "detail":
                    "Only confirmed appointments can be completed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = "Completed"

        appointment.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        doctor_name = get_doctor_name(
            appointment.doctor
        )

        create_appointment_notification(

            user=appointment.patient.user,

            title="Appointment Completed",

            message=(
                f"Your appointment "
                f"{appointment.booking_number} "
                f"with {doctor_name} "
                f"has been completed."
            ),
        )

        return Response(
            {
                "message":
                    "Appointment completed successfully.",

                "appointment":
                    AppointmentSerializer(
                        appointment,
                        context={
                            "request": request
                        }
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


class AppointmentAIReportView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        appointment = get_object_or_404(
            Appointment.objects.select_related("doctor", "patient"),
            id=id,
        )
        if appointment.patient.user_id != request.user.id:
            return Response(
                {"detail": "Only the patient can share this report."},
                status=status.HTTP_403_FORBIDDEN,
            )

        allowed = {
            "ai_category",
            "ai_urgency",
            "ai_specialist",
            "ai_guidance",
            "symptoms",
        }
        values = {
            key: request.data.get(key, "")
            for key in allowed
            if key in request.data
        }
        values["ai_report_shared"] = True
        for key, value in values.items():
            setattr(appointment, key, value)
        appointment.save(update_fields=[*values.keys(), "updated_at"])
        return Response(AppointmentSerializer(appointment).data)


class SharedAISymptomReportView(APIView):

    permission_classes = [IsAuthenticated]

    def _data(self, report):
        doctor_name = report.doctor.user.get_full_name().strip() or report.doctor.user.username
        return {
            "id": report.id,
            "patient_id": report.patient_id,
            "patient_name": report.patient.user.get_full_name().strip() or report.patient.user.username,
            "doctor": report.doctor_id,
            "doctor_name": f"Dr. {doctor_name}",
            "symptoms": report.symptoms,
            "duration": report.duration,
            "severity": report.severity,
            "ai_category": report.ai_category,
            "possible_conditions": report.possible_conditions,
            "ai_urgency": report.ai_urgency,
            "ai_specialist": report.ai_specialist,
            "ai_guidance": report.ai_guidance,
            "doctor_assessment": report.doctor_assessment,
            "consultation_fee": str(report.consultation_fee),
            "payment_status": report.payment_status,
            "payment_transaction_id": report.payment_transaction_id,
            "paid_at": report.paid_at,
            "created_at": report.created_at,
            "updated_at": report.updated_at,
        }

    def get(self, request):
        if getattr(request.user, "role", None) == "doctor" and hasattr(request.user, "doctor_profile"):
            reports = AISymptomReport.objects.filter(
                doctor=request.user.doctor_profile,
                payment_status="Paid",
            ).select_related("patient__user", "doctor")
        elif hasattr(request.user, "patient_profile"):
            reports = AISymptomReport.objects.filter(patient=request.user.patient_profile).select_related("patient__user", "doctor")
        else:
            reports = AISymptomReport.objects.none()
        return Response([self._data(report) for report in reports])

    def post(self, request):
        if getattr(request.user, "role", None) != "patient":
            return Response(
                {"detail": "Only patient accounts can share symptom reports."},
                status=status.HTTP_403_FORBIDDEN,
            )
        patient = getattr(request.user, "patient_profile", None)
        doctor_id = request.data.get("doctor")
        doctor = get_object_or_404(Doctor, id=doctor_id, is_available=True, approval_status="approved")
        if patient is None:
            return Response({"detail": "Only patients can share symptom reports."}, status=status.HTTP_403_FORBIDDEN)

        if request.data.get("payment_confirmed") is not True:
            return Response(
                {
                    "detail": "A BDT 100 consultation payment is required before sharing this report.",
                    "consultation_fee": 100,
                    "payment_required": True,
                },
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )

        specialist = str(request.data.get("ai_specialist", "")).strip().lower()
        doctor_profile = (
            f"{doctor.specialization or ''} "
            f"{doctor.department.name if doctor.department else ''}"
        ).lower()
        requested_keywords = request.data.get("keywords", [])
        if not isinstance(requested_keywords, list):
            requested_keywords = []
        specialist_terms = [
            str(term).strip().lower()
            for term in [*requested_keywords, specialist]
            if len(str(term).strip()) > 3
        ]
        if specialist_terms and not any(
            term in doctor_profile
            for term in specialist_terms
        ):
            return Response(
                {"doctor": "You can only share this report with a recommended doctor."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        transaction_id = f"AI-{timezone.now().strftime('%Y%m%d%H%M%S%f')}"
        with transaction.atomic():
            report = AISymptomReport.objects.create(
                patient=patient,
                doctor=doctor,
                symptoms=request.data.get("symptoms", ""),
                duration=request.data.get("duration", ""),
                severity=request.data.get("severity", ""),
                ai_category=request.data.get("ai_category", ""),
                possible_conditions=request.data.get("possible_conditions", ""),
                ai_urgency=request.data.get("ai_urgency", ""),
                ai_specialist=request.data.get("ai_specialist", ""),
                ai_guidance=request.data.get("ai_guidance", ""),
                consultation_fee=100,
                payment_status="Paid",
                payment_transaction_id=transaction_id,
                paid_at=timezone.now(),
            )
            Payment.objects.create(
                ai_symptom_report=report,
                patient=patient,
                amount=100,
                payment_mode="Full",
                payment_method=request.data.get("payment_method", "Card"),
                transaction_id=transaction_id,
                payment_status="Paid",
            )
        Notification.objects.create(
            user=doctor.user,
            notification_type="Report",
            title="New AI symptom report shared",
            message=(
                f"{patient.user.get_full_name().strip() or patient.user.username} "
                "shared an AI symptom report with you."
            ),
            is_read=False,
        )
        return Response(self._data(report), status=status.HTTP_201_CREATED)

    def patch(self, request, id):
        if getattr(request.user, "role", None) != "doctor" or not hasattr(request.user, "doctor_profile"):
            return Response({"detail": "Only doctors can assess reports."}, status=status.HTTP_403_FORBIDDEN)
        report = get_object_or_404(AISymptomReport, id=id, doctor=request.user.doctor_profile)
        assessment = str(request.data.get("doctor_assessment", report.doctor_assessment)).strip()
        assessment_changed = assessment != report.doctor_assessment
        report.doctor_assessment = assessment
        report.save(update_fields=["doctor_assessment", "updated_at"])
        if assessment_changed and assessment:
            doctor_name = request.user.get_full_name().strip() or request.user.username
            Notification.objects.create(
                user=report.patient.user,
                notification_type="Report",
                title="Doctor reviewed your AI symptom report",
                message=(
                    f"Dr. {doctor_name} added an assessment to your symptom report. "
                    "Open AI Symptom Checker to view it."
                ),
            )
        return Response(self._data(report))