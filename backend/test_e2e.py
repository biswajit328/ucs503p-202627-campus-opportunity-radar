import requests

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("--- 1. Organizer setup ---")
    org_email = "phase11_org1@example.com"
    try:
        res = requests.post(f"{BASE_URL}/auth/register", json={"email": org_email, "password": "password123"}, timeout=10)
        print("Org register:", res.status_code)
    except Exception as e:
        print("Org register exception:", e)

    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": org_email, "password": "password123"}, timeout=10)
        org_token = res.json()["access_token"]
        org_headers = {"Authorization": f"Bearer {org_token}"}

        # Become an organizer by creating an organization
        res = requests.post(f"{BASE_URL}/organizations", json={"name": "Phase 8 Org"}, headers=org_headers, timeout=10)
        print("Create organization:", res.status_code)

        opp_payload = {
            "title": "React and Python Internship 4",
            "description": "Full stack internship",
            "category": "INTERNSHIP",
            "organizer": "Phase 8 Org",
            "deadline": "2027-12-31T00:00:00Z",
            "mode": "ONLINE",
            "registration_url": "https://hack.com",
            "eligibility": {
                "eligible_branches": ["Computer Science"],
                "eligible_semesters": [6]
            },
            "skills": ["React", "Python"]
        }
        res = requests.post(f"{BASE_URL}/opportunities", json=opp_payload, headers=org_headers, timeout=10)
        print("Org creating opp:", res.status_code)
    except Exception as e:
        print("Org flow exception:", e)

    print("--- 2. Student Flow ---")
    email = "phase11_user1@example.com"
    try:
        requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": "password123", "role": "STUDENT"}, timeout=10)
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": "password123"}, timeout=10)
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        profile_payload = {
            "name": "Phase 8 Student 2",
            "branch": "Computer Science",
            "semester": 6,
            "year": 3,
            "preferred_mode": "REMOTE",
            "skills": ["Python", "React"],
            "interests": ["Web Development"]
        }
        res = requests.post(f"{BASE_URL}/users/me/profile", json=profile_payload, headers=headers, timeout=10)
        print("Create Profile:", res.status_code)

        res = requests.get(f"{BASE_URL}/recommendations?limit=5", headers=headers, timeout=10)
        print("Recommendations:", res.status_code)
        recs = res.json()
        print(f"Got {len(recs)} recommendations")

        if recs:
            opp_id = recs[0]["opportunity"]["id"]
            res = requests.post(f"{BASE_URL}/opportunities/{opp_id}/bookmark", headers=headers, timeout=10)
            print("Save Opp:", res.status_code)

            res = requests.post(f"{BASE_URL}/opportunities/{opp_id}/bookmark", headers=headers, timeout=10)
            print("Save Opp Duplicate:", res.status_code)

            res = requests.delete(f"{BASE_URL}/opportunities/{opp_id}/bookmark", headers=headers, timeout=10)
            print("Unsave Opp:", res.status_code)

            res = requests.post(f"{BASE_URL}/applications", json={"opportunity_id": opp_id}, headers=headers, timeout=10)
            print("Apply Opp:", res.status_code)

            res = requests.post(f"{BASE_URL}/applications", json={"opportunity_id": opp_id}, headers=headers, timeout=10)
            print("Duplicate Apply Opp:", res.status_code)
    except Exception as e:
        print("Student flow exception:", e)

if __name__ == "__main__":
    run_tests()
