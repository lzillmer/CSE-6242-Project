import os 

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="EMS Simulation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")

BOROUGH_FILES = {
    "Bronx":         "BRONX_regression_matrix.csv",
    "Brooklyn":      "BROOKLYN_regression_matrix.csv",
    "Manhattan":     "MANHATTAN_regression_matrix.csv",
    "Queens":        "QUEENS_regression_matrix.csv",
    "Staten Island": "RICHMOND___STATEN_ISLAND_regression_matrix.csv",
}

SEVERITY_OUTCOMES = ["CRITICAL", "SERIOUS", "LOW_ACUITY"]
VOLUME_PREDICTORS = ["CRITICAL_VOL", "SERIOUS_VOL", "LOW_ACUITY_VOL"]

ACUITY_MAP = {
    "All":     SEVERITY_OUTCOMES, 
    "Group 1": ["CRITICAL"],  
    "Group 2": ["SERIOUS"],  
    "Group 3": ["LOW_ACUITY"],
}

class SimulationRequest(BaseModel):
    borough: str = "All Boroughs"
    acuity: str = "All"

def load_borough(csv_path: str) -> dict:
    df = pd.read_csv(csv_path, index_col=0)

    result = {}
    for severity in SEVERITY_OUTCOMES:
        coef_col = f"{severity}_RESP_90TH_Coef"
        base_col = f"{severity}_RESP_90TH_Baseline"
        pval_col = f"{severity}_RESP_90TH_P_Value"

        baseline = df[base_col].iloc[0]

        result[severity] = {
            "baseline": baseline,
            "coefs":    {vol: df.loc[vol, coef_col] for vol in VOLUME_PREDICTORS},
            "p_values": {vol: df.loc[vol, pval_col] for vol in VOLUME_PREDICTORS},
        }

    return result

BOROUGH_DATA: dict = {}
for borough, fname in BOROUGH_FILES.items():
    path = os.path.join(DATA_DIR, fname)
    if os.path.exists(path):
        BOROUGH_DATA[borough] = load_borough(path)
    else:
        print(f"[WARNING] Missing data file: {path}")


def simulate_borough(borough: str, critical_vol: float, serious_vol: float, low_acuity_vol: float) -> dict:
    data = BOROUGH_DATA[borough]
    volumes = {
        "CRITICAL_VOL":   critical_vol,
        "SERIOUS_VOL":    serious_vol,
        "LOW_ACUITY_VOL": low_acuity_vol
    }

    results = {}

    for severity in SEVERITY_OUTCOMES:
        baseline = data[severity]["baseline"]
        coefs = data[severity]["coefs"]
        predicted = baseline + sum(coefs[vol] * volumes[vol] for vol in VOLUME_PREDICTORS)

        results[severity] = {
            "baseline_sec": round(baseline, 2),
            "predicted_sec": round(predicted, 2),
            "delta_sec": round(predicted - baseline, 2),
            "baseline_min": round(baseline  / 60, 2),
            "predicted_min": round(predicted / 60, 2),
            "delta_min": round((predicted - baseline) / 60, 2),
            "p_values": {vol: round(data[severity]["p_values"][vol], 6) for vol in VOLUME_PREDICTORS},
        }

        return results
