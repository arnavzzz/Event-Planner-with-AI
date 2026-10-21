# 🎪 AI/ML Integration - Event Planner

This directory contains the machine learning pipelines, trained models, datasets, and Jupyter notebooks for the **Event Management & Operations Platform**.

Specifically, it powers the **Vendor Recommendation & Budget Allocation Engine** used in the **"Create Event"** tab.

---

## 📁 Directory Structure

```text
aiml-integration/
├── data/
│   ├── vendors.csv                  # Vendor catalog with pricing, capacities & tiers
│   └── vendors.json                 # Structured JSON vendor database
├── models/
│   ├── budget_allocator_pipeline.joblib   # Trained Multi-Output ML Budget Regressor
│   ├── vendor_catalog.joblib              # Serialized vendor dataset
│   └── vendor_recommender_engine.joblib   # Unified end-to-end recommender engine
├── notebook/
│   └── vendor_recommendation_model.ipynb  # Primary executed Jupyter Notebook
├── notebooks/
│   └── vendor_recommendation_model.ipynb  # Mirror copy for convenience
├── requirements.txt                 # Python dependencies
└── main.py                          # Integration entrypoint
```

---

## 🧠 Model Architecture & Methodology

### 1. Inputs (from Create Event tab)
- **`eventType`**: `Wedding`, `Birthday`, `Corporate`, `Conference`, `Festival`, `Other`
- **`clientBudget`**: Total budget available (e.g., $5,000 to $150,000+)
- **`guestCount`**: Number of people attending (e.g., 25 to 1,500+ guests)

### 2. Multi-Output Regressor (Category Budget Allocation)
Trained using `RandomForestRegressor` with `StandardScaler` and `OneHotEncoder` to predict the optimal budget allocation across 7 core vendor categories:
1. **Venue**
2. **Catering**
3. **Photography & Videography**
4. **Decor & Floral**
5. **Audio / Visual & Lighting**
6. **Entertainment / DJ**
7. **Staffing & Security**

**Budget Integrity Layer**: Employs proportional sum-normalization to guarantee $\sum_{i=1}^7 \text{Budget}_i = \text{client\_budget}$ with zero dollar drift.

### 3. Dynamic Cost & Capacity Evaluation
For every candidate vendor $v$ in category $c$:
$$\text{Estimated Cost}(v) = \text{base\_fee}_v + (\text{per\_person\_rate}_v \times \text{guest\_count})$$
Feasibility is strictly verified:
$$\text{min\_capacity}_v \le \text{guest\_count} \le \text{max\_capacity}_v \quad \text{and} \quad \text{eventType} \in \text{supported\_types}_v$$

### 4. Combinatorial Optimization (Bundle Selector)
Solves a bounded knapsack/matching optimization across categories to produce 3 curated packages:
- 🌟 **AI Balanced Recommendation**: Maximizes overall match score within budget.
- 💰 **Budget Saver**: Lowest total cost while maintaining capacity and quality ($\ge 4.2$ stars).
- 👑 **Premium Experience**: Maximizes ratings and luxury tier within budget.

---

## 🚀 Running the Notebook

1. **Activate the Virtual Environment**:
   ```powershell
   .\aiml-integration\.venv\Scripts\Activate.ps1
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r aiml-integration/requirements.txt
   ```

3. **Launch Jupyter**:
   ```bash
   jupyter notebook aiml-integration/notebook/vendor_recommendation_model.ipynb
   ```

---

## 🔌 FastAPI Integration Example (`backend/main.py`)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib

app = FastAPI(title="Event Planner AI Services")

# Load pre-trained engine
recommender = joblib.load("aiml-integration/models/vendor_recommender_engine.joblib")

class EventRecommendationRequest(BaseModel):
    event_type: str
    client_budget: float
    guest_count: int

@app.post("/api/ai/recommend-vendors")
def recommend_vendors(payload: EventRecommendationRequest):
    try:
        recommendations = recommender.recommend(
            event_type=payload.event_type,
            client_budget=payload.client_budget,
            guest_count=payload.guest_count
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```
