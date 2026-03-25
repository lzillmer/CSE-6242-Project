# CSE-6242-Project

# Impact of Demand Pressure on EMS Response Time

---

## Overview

Emergency medical services (EMS) are designed to respond rapidly to life-threatening emergencies, but high volumes of lower-acuity calls can strain system capacity. In dense urban environments like New York City, this congestion may delay response times for critical emergencies such as cardiac arrest, stroke, and severe trauma.

This project analyzes how demand pressure (call volume), particularly from low-acuity calls, impacts response times for high-priority EMS incidents. We develop statistical models and an interactive tool to simulate how redirecting non-urgent calls could improve emergency response times and reduce disparities across neighborhoods.

---

## Data

- NYC EMS dispatch data (publicly available):
https://data.cityofnewyork.us/Public-Safety/EMS-Incident-Dispatch-Data/76xm-jjuj
- Socioeconomic and geographic data for neighborhood-level analysis

Due to file size, the dataset is not stored in this repository.

### How to access
1. Download the dataset from the NYC Open Data portal
2. Save it in

---

## Methods

- Data cleaning and preprocessing of EMS dispatch records  
- Exploratory data analysis to understand call patterns and response times  
- Statistical modeling to estimate the relationship between call volume and response delay  
- Scenario simulation to model the impact of redirecting low-acuity calls  
- Interactive visualization/dashboard for user-driven exploration  

---

## How to run

1. Clone this repository:
   ```bash
   git clone https://github.com/lzillmer/CSE-6242-Project.git
   cd CSE-6242-Project
   ```
2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```
3. Download dataset and save it as
   ```bash
   data/raw/EMS_Incident_Dispatch_Data.csv
   ```
4. Open and run notebooks/preprocessing.ipynb (this will generate data/preprocessed/ems_cleaned.csv)
5. Open and run notebooks/analysis_and_modeling.ipynb
