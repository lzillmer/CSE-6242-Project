CSE6242 Team 171 Final Project: Impact of Demand Pressure on EMS Response Time

DESCRIPTION:
Emergency medical services (EMS) are designed to respond rapidly to life-threatening
emergencies, but high volumes of lower-acuity calls can strain system capacity. In
dense urban environments like New York City, this congestion may delay response times
for critical emergencies such as cardiac arrest, stroke, and severe trauma.

This project analyzes how demand pressure (call volume), particularly from low-acuity
calls, impacts response times for high-priority EMS incidents. We develop statistical
models and an interactive tool to simulate how redirecting non-urgent calls could
improve emergency response times and reduce disparities across neighborhoods.

The package is broken down into two parts:
- An interactive Jupyter Notebook using Python that inputs the EMS dispatch data from a
  `.csv` file called `EMS_Incident_Dispatch_Data.csv`, parses and cleans the dataset,
  and then runs the necessary analysis for our modelling, outputting the results into
  `.csv` files that our web package uses.
- A npm-managed, JavaScript application that deploys a webpage that visualizes the
  results of our analysis. The user can filter the modelling towards a specific
  geographic area or call severity. The tool displays summary visuals to help the user
  understand the response time patterns for those groups as well as the geographic
  disparity in repsonse time for those selections. In addition, the user can
  simulate and visualize the effect of call diversion for each severity group.

INSTALLATION:
Setup and installation of the pacakge is fairly easy and broken out into the following
sequence of steps:

Environment Setup:
1. In package directory, confirm the the following contents are correctly installed
  and setup:
  - `notebooks/`: directory containing `parquet_processing.ipynb`
  - `ems-app/`: directory containing files necessary to run webpage
  - `requirements.txt`: a file use to install python dependencies
  - `data/`: an empty directory that will be referenced by the notebook for dataset
  - `figs/`: an empty directory that wil be used by the notebook to store created
    figures.
2. Ensure the following are installed within your environment:
  - latest version of python and pip
  - latest version of node.js
3. Install python dependencies via `pip install -r requirements.txt`
4. Install npm dependencies: 
  - `cd` into `ems-app`
  - run `npm install` 

Downloading Dataset:
1. Download the EMS Incident Dispatch Data from the NYC OpenData website (this step may
  take a while):
  https://data.cityofnewyork.us/Public-Safety/EMS-Incident-Dispatch-Data/76xm-jjuj
2. Save the dataset in the `data/` directory as `EMS_Incident_Dispatch_Data.csv` 


EXECUTION:
The necessary output files from the analysis for our tool has already been run and
placed within the appropriate location for our webpage tool. To recreate the analysis
and the resulting files, run the following steps:

Running Dataset Analysis:
1. In the package directory, run `jupyter notebook`. Navigate to `notebooks/` and open
  `parquet_processing.ipynb`.
2. Run the notebook. You should see several figures saved to `figs/` as well as
  multiple `.parquet` and `.csv` files saved to the `data/`.
3. Copy the created `correlation_matrix.csv` and *_visualization_data.csv` files,
  currently in `data/`, to `ems-app/src/data/`, replacing existing files.

To run the webpage tool, run the following steps:

Running Webpage Tool :
1. `cd` into `ems-app/` and run `npm run dev`.
2. Navigate to http://localhost:5173/ to view.

The steps for a sample demo/use of the tool is provided below:
Sample Demo:
1. In the top left, navigate to the `Borough` menu and select `Staten Island` to
  filter the tool's simulation and visualization to Staten Island.
2. On the left side, choose `GROUP 1` from the `Severity Level` block to filter the
  tool's simulation and visualization to the most critical calls.
3. Note, the call response time in the simulation matches for the baseline,
  volume-scaled estimate, and post-diversion estimate are the same - 598 seconds.
4. Increase the call volume for the simulation by increasing the `Call Volume
  Adjustment`slider to 150%. Note the baseline remains the same while the 
  volume-scaled estimate and post-diversion estimate have increased to 680 seconds.
5. Increase the call diversion sliders in `Diversion Rate by Group` to 25% for Group 2
  and 50% for Group 3. Note how the baseline and the volume-scaled estimate stayed the
  same while the post-diversion estimate has decreased.
6. Note in the `Diversion Contribution to Response Time Reduction` how many calls
  from each group have been diverted under this "diversion polciy" and how many
  seconds have been reduced as a result.
7. Expand the simulation and analysis to show the impact of this diversion on all
  call severities. Select `ALL` under the `Severity Level` Block. The summary analysis
  in the bottom right expands to show the impact of all incoming call severities on
  all response times. Note the resulting simulation and visualization displays a much
  more dramatic impact of call diversion on response times.
8. Expand the simulation and analysis to show the impact of this diversion on all
  of the boroughs. In the `Borough` menu, select `All Boroughs`. The summary geographic
  visualizaiton show the disparities in the baseline response time across the boroughs.
  Note the resulting simulation and visualization shows that this diversion impacts
  some boroughs more than others, bringing repsonse times in all the boroughs closer
  together.
  


