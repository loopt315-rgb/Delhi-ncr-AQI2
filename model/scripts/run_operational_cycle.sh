#!/usr/bin/env bash
# ==============================================================================
# run_operational_cycle.sh
# Automated 72-Hour Coupled Forecasting Cycle for Delhi-NCR
# Cadence: Daily at 03:45 UTC (09:15 IST)
# ==============================================================================

set -euo pipefail

CYCLE_DATE=$(date -u +%Y%m%d)
CYCLE_HOUR="00"
RUN_DIR="${HOME}/wrf_system/runs/${CYCLE_DATE}_${CYCLE_HOUR}"
mkdir -p "${RUN_DIR}"

echo "[$(date -u)] === STEP 1: Ingesting GFS & Satellite Telemetry ==="
python3 /data_pipeline/download_gfs.py --date "${CYCLE_DATE}" --cycle "${CYCLE_HOUR}" --forecast-hours 72 --output-dir "${RUN_DIR}/gfs"
python3 /data_pipeline/download_firms.py --output-dir "${RUN_DIR}/firms"
python3 /data_pipeline/qc_pipeline.py --output-dir "${RUN_DIR}/qc_obs"

echo "[$(date -u)] === STEP 2: Pre-Processing Emissions ==="
python3 /emissions/process_emissions.py \
    --firms-dir "${RUN_DIR}/firms" \
    --output-dir "${RUN_DIR}/emissions" \
    --start-date "${CYCLE_DATE}"

echo "[$(date -u)] === STEP 3: Executing WPS (ungrib & metgrid) ==="
cd "${RUN_DIR}"
# Link WPS binaries and tables
ln -sf ${HOME}/wrf_system/build/WPS-4.4/ungrib.exe .
ln -sf ${HOME}/wrf_system/build/WPS-4.4/metgrid.exe .
ln -sf ${HOME}/wrf_system/build/WPS-4.4/ungrib/Variable_Tables/Vtable.GFS Vtable
cp /model/config/namelist.wps ./namelist.wps

./ungrib.exe > ungrib.log 2>&1
./metgrid.exe > metgrid.log 2>&1

echo "[$(date -u)] === STEP 4: Initializing Real Atmosphere (real.exe) ==="
ln -sf ${HOME}/wrf_system/build/WRF-4.4.2/main/real.exe .
ln -sf ${HOME}/wrf_system/build/WRF-4.4.2/main/wrf.exe .
cp /model/config/namelist.input ./namelist.input

mpirun -np 16 ./real.exe > real.log 2>&1

echo "[$(date -u)] === STEP 5: Executing Coupled WRF-Chem Integration ==="
# Launch 64-core parallel integration for 72-hour forecast
mpirun -np "${NUM_CORES:-64}" ./wrf.exe > wrfchem.log 2>&1

echo "[$(date -u)] === STEP 6: Extracting Surface NetCDF Slices & Inversion Sounding ==="
python3 /postprocessing/extract_wrf_slices.py \
    --wrf-output "${RUN_DIR}/wrfout_d03_${CYCLE_DATE}_00:00:00" \
    --output-dir "${RUN_DIR}/postprocessed"

echo "[$(date -u)] === STEP 7: Machine Learning Bias Correction ==="
python3 /bias_correction/ml_residual_corrector.py \
    --model-input "${RUN_DIR}/postprocessed/surface_forecast.parquet" \
    --obs-input "${RUN_DIR}/qc_obs/validated_cpcb_stations.parquet" \
    --output "${RUN_DIR}/postprocessed/calibrated_72h_forecast.json"

echo "[$(date -u)] === STEP 8: Publishing Output to Operational Database & Redis ==="
curl -X POST "http://localhost:3000/api/pipeline/publish" \
     -H "Content-Type: application/json" \
     -d @"${RUN_DIR}/postprocessed/calibrated_72h_forecast.json"

echo "[$(date -u)] === Operational Cycle Completed Successfully ==="
