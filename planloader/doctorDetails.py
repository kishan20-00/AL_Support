import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate("key.json")
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

def load_doctor_details():
    # Generate doctor IDs (even numbers up to 40)
    doctor_ids = list(range(2, 41, 2))

    # Sample data for doctors
    doctor_specialities = [
        "Counselling", "Stress Management", "Family Therapy", "Mental Health",
        "Psychoanalysis", "Behavioral Therapy", "Relationship Counselling",
        "Crisis Intervention", "Addiction Recovery", "Cognitive Therapy"
    ]
    doctor_names = [
        "Dr. Alice Johnson", "Dr. Bob Smith", "Dr. Carol Taylor",
        "Dr. David Lee", "Dr. Eva White", "Dr. Frank Brown",
        "Dr. Grace Adams", "Dr. Henry Clark", "Dr. Irene Davis",
        "Dr. Jack Evans", "Dr. Karen Green", "Dr. Liam Young",
        "Dr. Mia Hall", "Dr. Noah King", "Dr. Olivia Moore",
        "Dr. Paul Wright", "Dr. Quinn Scott", "Dr. Ruby Martinez",
        "Dr. Samuel Lewis", "Dr. Tina Walker"
    ]
    doctor_numbers = [
        "9876543201", "9876543202", "9876543203", "9876543204",
        "9876543205", "9876543206", "9876543207", "9876543208",
        "9876543209", "9876543210", "9876543211", "9876543212",
        "9876543213", "9876543214", "9876543215", "9876543216",
        "9876543217", "9876543218", "9876543219", "9876543220"
    ]

    # Ensure we have enough data for all IDs
    assert len(doctor_ids) <= len(doctor_names), "Not enough sample doctor names."
    assert len(doctor_ids) <= len(doctor_numbers), "Not enough sample doctor numbers."

    # Create and upload doctor details
    for idx, doc_id in enumerate(doctor_ids):
        doctor_data = {
            "id": doc_id,
            "name": doctor_names[idx],
            "number": doctor_numbers[idx],
            "speciality": doctor_specialities[idx % len(doctor_specialities)]
        }
        
        # Upload to Firestore
        db.collection("doctor_details").document(str(doc_id)).set(doctor_data)
        print(f"Uploaded details for Doctor ID: {doc_id}")

if __name__ == "__main__":
    load_doctor_details()
    print("All doctor details have been uploaded successfully!")
