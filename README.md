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

Due to file size, the dataset is not stored in this repository.

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
3. Download dataset and save it as data/raw/EMS_Incident_Dispatch_Data.csv, alternatively skip to step 6 to skip data processing and use saved output files
4. Open and run notebooks/parquet_processing.ipynb
5. Replace output files in ems-app/data/src/data with output files produced from parquet_processing
6. Download v24.15.0 of node.js from https://nodejs.org/en/download
7. Navigate to ems-app folder
   ```bash
   cd .\CSE-6242-Project\ems-app\
   ```
8. Install node.js dependencies
   ```bash
   npm install
   ```
9. If missing, install additional dependencies d3 and d3-tip for node.js
   ```bash
   npm install d3
   npm install d3-tip
   ```
10. Launch the app and navigate to http://localhost:5173/ to view
      ```bash
   npm run dev
   ```
