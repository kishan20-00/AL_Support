import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase Admin SDK
cred = credentials.Certificate("key.json")  # Replace with your JSON file path
firebase_admin.initialize_app(cred)
db = firestore.client()

# Folder containing study plans
study_plans_folder = "plans/plans"  # Replace with your folder path

# Function to parse the text file into a dictionary
def parse_study_plan(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        lines = file.readlines()
    
    study_plan = {}
    current_day = None

    for line in lines:
        line = line.strip()
        if not line:
            continue  # Skip empty lines

        if line.endswith(":"):  # Detecting days (e.g., "Monday:")
            current_day = line[:-1]
            study_plan[current_day] = []
        else:
            if current_day:
                study_plan[current_day].append(line)

    return study_plan

# Function to check if a document exists
def document_exists(plan_id):
    doc_ref = db.collection("Plans_study").document(plan_id)
    doc = doc_ref.get()
    return doc.exists

# Iterate through all 24 study plan files
for file_name in os.listdir(study_plans_folder):
    if file_name.endswith(".txt"):
        plan_id = file_name.split(".")[0]  # Extracting ID from file name (e.g., "1" from "1.txt")
        file_path = os.path.join(study_plans_folder, file_name)
        
        # Parse study plan
        study_plan_data = parse_study_plan(file_path)
        
        # Check if the document already exists
        if document_exists(plan_id):
            print(f"Plan {plan_id} already exists. Skipping upload.")
        else:
            # Upload to Firestore
            db.collection("Plans_study").document(plan_id).set(study_plan_data)
            print(f"Uploaded {file_name} successfully!")

print("Process complete.")
