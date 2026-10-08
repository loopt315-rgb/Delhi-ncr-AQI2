#!/usr/bin/env python3
"""
download_gfs.py
Automated Ingestion of NOAA NCEP Global Forecast System (GFS) 0.25 Degree Data
Source: NOAA NOMADS Operational Archive
"""

import os
import sys
import argparse
import datetime
import urllib.request
import urllib.error

NOAA_NOMADS_BASE = "https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod"

def download_gfs_cycle(date_str: str, cycle: str, forecast_hours: int, output_dir: str):
    """
    Downloads GFS 0.25 degree isobaric GRIB2 files for 0 to forecast_hours at 3-hour intervals.
    URL Format:
    https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/gfs.YYYYMMDD/HH/atmos/gfs.tHHz.pgrb2.0p25.fFFF
    """
    os.makedirs(output_dir, exist_ok=True)
    cycle_str = f"{int(cycle):02d}"
    print(f"[GFS Downloader] Starting download for Date: {date_str}, Cycle: {cycle_str}Z, Horizon: {forecast_hours}h")

    downloaded_files = []
    failed_files = []

    # 3-hourly boundary conditions are standard for WPS metgrid/real
    for f_hour in range(0, forecast_hours + 1, 3):
        f_hour_str = f"{f_hour:03d}"
        filename = f"gfs.t{cycle_str}z.pgrb2.0p25.f{f_hour_str}"
        url = f"{NOAA_NOMADS_BASE}/gfs.{date_str}/{cycle_str}/atmos/{filename}"
        dest_path = os.path.join(output_dir, filename)

        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 10_000_000:
            print(f"[GFS Downloader] Already cached: {filename} ({os.path.getsize(dest_path) // 1024 // 1024} MB)")
            downloaded_files.append(dest_path)
            continue

        print(f"[GFS Downloader] Fetching {url} -> {dest_path}...")
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "AirSense-NCR-Coupled-Forecasting/1.0 (Atmospheric Science Research)"}
            )
            with urllib.request.urlopen(req, timeout=60) as response, open(dest_path, "wb") as out_file:
                # Stream write
                chunk_size = 1024 * 1024
                while True:
                    chunk = response.read(chunk_size)
                    if not chunk:
                        break
                    out_file.write(chunk)
            print(f"[GFS Downloader] Finished: {filename} ({os.path.getsize(dest_path) // 1024 // 1024} MB)")
            downloaded_files.append(dest_path)
        except urllib.error.HTTPError as e:
            print(f"[GFS Downloader] HTTP Error {e.code} for {filename}: {e.reason}")
            failed_files.append((filename, str(e)))
        except Exception as e:
            print(f"[GFS Downloader] Connection error for {filename}: {e}")
            failed_files.append((filename, str(e)))

    print(f"\n[GFS Downloader] Summary: {len(downloaded_files)} files retrieved, {len(failed_files)} failures.")
    return downloaded_files

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download NOAA GFS 0.25 GRIB2 forecast data.")
    parser.add_argument("--date", default=datetime.datetime.utcnow().strftime("%Y%m%d"), help="Cycle date in YYYYMMDD")
    parser.add_argument("--cycle", default="00", help="Cycle hour (00, 06, 12, 18)")
    parser.add_argument("--forecast-hours", type=int, default=72, help="Forecast horizon in hours")
    parser.add_argument("--output-dir", default="./gfs_data", help="Output directory for GRIB2 files")
    args = parser.parse_args()

    download_gfs_cycle(args.date, args.cycle, args.forecast_hours, args.output_dir)
