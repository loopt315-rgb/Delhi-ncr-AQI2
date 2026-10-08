#!/usr/bin/env python3
"""
test_pipeline.py
Automated End-to-End Test & Verification Suite for Stage A Data Pipeline
Runs:
1. NASA FIRMS Fire ingestion
2. CPCB 4-stage Observation QC
3. Anthropogenic & Fire Emission processing
4. WRF-Chem slice extraction & Boundary Layer Trapping diagnostics
5. LightGBM Residual Bias Correction & Validation Metrics
"""

import os
import sys
import subprocess

def run_step(cmd_list, step_name):
    print(f"\n==========================================")
    print(f"--> RUNNING STEP: {step_name}")
    print(f"Command: {' '.join(cmd_list)}")
    print(f"==========================================")
    res = subprocess.run(cmd_list, capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print("STDERR:", res.stderr)
    if res.returncode != 0:
        print(f"FAILED with exit code {res.returncode}")
        sys.exit(res.returncode)
    print(f"--> PASSED: {step_name}")

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_dir = os.path.join(base_dir, "test_run_artifacts")
    os.makedirs(test_dir, exist_ok=True)

    # 1. Test FIRMS Fire Ingestion
    run_step([
        sys.executable, os.path.join(base_dir, "data_pipeline", "download_firms.py"),
        "--output-dir", f"{test_dir}/firms"
    ], "NASA FIRMS Fire Ingestion")

    # 2. Test 4-Stage QC Pipeline
    run_step([
        sys.executable, os.path.join(base_dir, "data_pipeline", "qc_pipeline.py"),
        "--output-dir", f"{test_dir}/qc_obs"
    ], "4-Stage Observation Quality Control Pipeline")

    # 3. Test Emission Ingestion & Diurnal Modulation
    run_step([
        sys.executable, os.path.join(base_dir, "emissions", "process_emissions.py"),
        "--firms-dir", f"{test_dir}/firms",
        "--output-dir", f"{test_dir}/emissions"
    ], "Emission Ingestion & Freitas Plume Rise")

    # 4. Test WRF Post-Processing & Inversion Sounding
    run_step([
        sys.executable, os.path.join(base_dir, "postprocessing", "extract_wrf_slices.py"),
        "--output-dir", f"{test_dir}/postprocessed"
    ], "WRF Surface Slices & Pollution-Trapping Extraction")

    # 5. Test ML Residual Bias Correction & Metric Computation
    run_step([
        sys.executable, os.path.join(base_dir, "bias_correction", "ml_residual_corrector.py"),
        "--model-input", f"{test_dir}/postprocessed/surface_forecast.json",
        "--obs-input", f"{test_dir}/qc_obs/validated_cpcb_stations.json",
        "--output", f"{test_dir}/postprocessed/calibrated_72h_forecast.json"
    ], "ML Residual Bias Correction & Validation Engine")

    print("\n==========================================")
    print("ALL STAGE A PIPELINE MODULES VERIFIED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    main()
