"""
Evaluates the recommendation engine against a hand-labeled dataset
(scripts/eval_data/labels.csv), comparing:
  - PERSONALIZED: ranked by the real weighted scoring engine (app.recommendation.scoring)
  - BASELINE: ranked by deadline only, no personalization — the "basic
    non-personalized opportunity list" spec Section 22 asks to compare against

Metrics: Precision@K and NDCG@K, per spec Section 22.

Usage (from backend/, venv active):
    python scripts/evaluate_recommendations.py
"""
import csv
import math
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.models.opportunity import Opportunity
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.recommendation.scoring import score_opportunity

LABELS_PATH = Path(__file__).resolve().parent / "eval_data" / "labels.csv"
K = 3
RELEVANT_THRESHOLD = 2  # relevance >= 2 ("relevant" or "highly relevant") counts for Precision@K


def load_labels() -> dict[str, dict[str, int]]:
    labels: dict[str, dict[str, int]] = {}
    with open(LABELS_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            labels.setdefault(row["student_email"], {})[row["opportunity_title"]] = int(row["relevance"])
    return labels


def precision_at_k(ranked_titles: list[str], labels: dict[str, int], k: int) -> float:
    top_k = ranked_titles[:k]
    if not top_k:
        return 0.0
    relevant = sum(1 for t in top_k if labels.get(t, 0) >= RELEVANT_THRESHOLD)
    return relevant / len(top_k)


def dcg_at_k(ranked_titles: list[str], labels: dict[str, int], k: int) -> float:
    total = 0.0
    for i, title in enumerate(ranked_titles[:k], start=1):
        rel = labels.get(title, 0)
        total += (2**rel - 1) / math.log2(i + 1)
    return total


def ndcg_at_k(ranked_titles: list[str], labels: dict[str, int], k: int) -> float:
    dcg = dcg_at_k(ranked_titles, labels, k)
    ideal_order = sorted(labels.keys(), key=lambda t: labels[t], reverse=True)
    idcg = dcg_at_k(ideal_order, labels, k)
    return dcg / idcg if idcg else 0.0


def run_evaluation():
    labels_by_student = load_labels()
    db = SessionLocal()

    p_precisions, p_ndcgs, b_precisions, b_ndcgs = [], [], [], []

    header = f"{'Student':<24}{'P@' + str(K) + ' (pers)':<16}{'NDCG@' + str(K) + ' (pers)':<18}{'P@' + str(K) + ' (base)':<16}{'NDCG@' + str(K) + ' (base)'}"
    print(header)
    print("-" * len(header))

    try:
        for student_email, opp_labels in labels_by_student.items():
            user = db.query(User).filter(User.email == student_email).first()
            if not user:
                print(f"  WARNING: user not found: {student_email}")
                continue
            profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
            if not profile:
                print(f"  WARNING: no profile: {student_email}")
                continue

            opportunities = db.query(Opportunity).filter(Opportunity.title.in_(opp_labels.keys())).all()
            if len(opportunities) != len(opp_labels):
                missing = set(opp_labels.keys()) - {o.title for o in opportunities}
                print(f"  WARNING: missing opportunities for {student_email}: {missing}")

            scored = [(o.title, score_opportunity(profile, o).total_score) for o in opportunities]
            personalized_ranking = [t for t, _ in sorted(scored, key=lambda x: x[1], reverse=True)]
            baseline_ranking = [o.title for o in sorted(opportunities, key=lambda o: o.deadline)]

            p_prec = precision_at_k(personalized_ranking, opp_labels, K)
            p_ndcg = ndcg_at_k(personalized_ranking, opp_labels, K)
            b_prec = precision_at_k(baseline_ranking, opp_labels, K)
            b_ndcg = ndcg_at_k(baseline_ranking, opp_labels, K)

            p_precisions.append(p_prec)
            p_ndcgs.append(p_ndcg)
            b_precisions.append(b_prec)
            b_ndcgs.append(b_ndcg)

            print(f"{student_email.split('@')[0]:<24}{p_prec:<16.2f}{p_ndcg:<18.2f}{b_prec:<16.2f}{b_ndcg:.2f}")

        def avg(values):
            return sum(values) / len(values) if values else 0.0

        print("-" * len(header))
        print(f"{'AVERAGE':<24}{avg(p_precisions):<16.2f}{avg(p_ndcgs):<18.2f}{avg(b_precisions):<16.2f}{avg(b_ndcgs):.2f}")
        print()
        print("Personalized vs baseline (positive = personalization wins):")
        print(f"  Precision@{K} delta: {avg(p_precisions) - avg(b_precisions):+.2f}")
        print(f"  NDCG@{K} delta:      {avg(p_ndcgs) - avg(b_ndcgs):+.2f}")
    finally:
        db.close()


if __name__ == "__main__":
    run_evaluation()