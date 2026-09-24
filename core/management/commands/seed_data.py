"""
Django Management Command: seed_data
Seeds 5 IMD AWS stations (Delhi/NCR region), generates 24 hours of telemetry with injected faults,
and processes data through the SkyGuard AI engine.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import pandas as pd
import numpy as np

from core.models import Station, SensorReading, Anomaly, SensorHealth, Alert, OperatorFeedback
from simulator.weather_generator import generate_base_weather
from simulator.fault_injector import (
    inject_spike, inject_frozen, inject_drift, inject_missing, inject_genuine_weather_event
)
from pipeline.engine import SkyGuardPipelineEngine

class Command(BaseCommand):
    help = "Seeds database with IMD AWS stations, synthetic weather telemetry, injected anomalies, and runs the SkyGuard AI detection engine."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting SkyGuard AI Data Seeding..."))

        with transaction.atomic():
            # Clear existing data
            OperatorFeedback.objects.all().delete()
            Alert.objects.all().delete()
            Anomaly.objects.all().delete()
            SensorHealth.objects.all().delete()
            SensorReading.objects.all().delete()
            Station.objects.all().delete()

            # 1. Create Stations
            stations_def = [
                {'id': 'AWS-DEL-01', 'name': 'Safdarjung Observatory', 'lat': 28.5822, 'lon': 77.2064, 'elev': 216.0},
                {'id': 'AWS-DEL-02', 'name': 'Palam Airport Station', 'lat': 28.5665, 'lon': 77.1031, 'elev': 224.0},
                {'id': 'AWS-DEL-03', 'name': 'Delhi Ridge Station', 'lat': 28.6750, 'lon': 77.2200, 'elev': 230.0},
                {'id': 'AWS-DEL-04', 'name': 'Ayanagar AWS Station', 'lat': 28.4817, 'lon': 77.1264, 'elev': 250.0},
                {'id': 'AWS-DEL-05', 'name': 'Noida Sector 62 AWS', 'lat': 28.6258, 'lon': 77.3690, 'elev': 200.0},
            ]

            station_objs = {}
            coords_map = {}
            for s in stations_def:
                st = Station.objects.create(
                    station_id=s['id'],
                    name=s['name'],
                    latitude=s['lat'],
                    longitude=s['lon'],
                    elevation=s['elev'],
                    status='ACTIVE'
                )
                station_objs[s['id']] = st
                coords_map[s['id']] = (s['lat'], s['lon'])

            # 2. Generate Base Weather (24 hours, 15-min intervals = 96 steps)
            start_time = timezone.now() - timedelta(hours=24)
            dfs = []
            for i, s in enumerate(stations_def):
                df = generate_base_weather(
                    station_id=s['id'],
                    start_time=start_time,
                    num_hours=24,
                    freq_minutes=15,
                    base_temp=27.5 + i * 0.4,
                    base_humidity=62.0 - i * 1.0,
                    base_pressure=1011.5 + i * 0.2,
                    seed=42 + i
                )
                dfs.append(df)

            # 3. Inject Representative Fault Scenarios
            # DEL-01: Spike on temperature at step 20
            dfs[0] = inject_spike(dfs[0], param='temperature', index=20, magnitude=19.5)
            # DEL-02: Frozen flatline on humidity starting at step 35
            dfs[1] = inject_frozen(dfs[1], param='humidity', start_idx=35, length=12)
            # DEL-03: Monotonic drift on pressure starting at step 50
            dfs[2] = inject_drift(dfs[2], param='pressure', start_idx=50, length=16, slope=0.35)
            # DEL-04: Missing gap on temperature starting at step 65
            dfs[3] = inject_missing(dfs[3], param='temperature', start_idx=65, length=8)
            # ALL Stations: Regional Genuine Heatwave at step 75
            dfs = inject_genuine_weather_event(dfs, start_idx=75, duration=12, temp_boost=9.2, pressure_drop=4.0)

            # 4. Save SensorReadings and run SkyGuard Pipeline Engine
            self.stdout.write("Processing telemetry through 4-Level AI Engine...")
            engine = SkyGuardPipelineEngine(station_coords_map=coords_map)
            total_readings = 0
            anomalies_detected = 0

            # We process step by step across all stations to maintain temporal correlation
            num_steps = len(dfs[0])
            for step_idx in range(num_steps):
                current_map = {}
                for i, st_def in enumerate(stations_def):
                    st_id = st_def['id']
                    st_obj = station_objs[st_id]
                    row = dfs[i].iloc[step_idx]

                    temp_val = None if pd.isna(row['temperature']) else float(row['temperature'])
                    hum_val = None if pd.isna(row['humidity']) else float(row['humidity'])
                    press_val = None if pd.isna(row['pressure']) else float(row['pressure'])

                    reading = SensorReading.objects.create(
                        station=st_obj,
                        timestamp=row['timestamp'],
                        temperature=temp_val,
                        humidity=hum_val,
                        pressure=press_val
                    )
                    total_readings += 1
                    current_map[st_id] = {'temperature': temp_val, 'humidity': hum_val, 'pressure': press_val}
                    hist_slice = dfs[i].iloc[max(0, step_idx - 24):step_idx + 1]

                    res = engine.process_reading(reading, history_df=hist_slice, current_readings_map=current_map)
                    if res['anomaly']:
                        anomalies_detected += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded database!\n"
            f"- Stations created: {len(station_objs)}\n"
            f"- Sensor readings created: {total_readings}\n"
            f"- Anomalies detected & logged: {anomalies_detected}\n"
            f"- Active Alerts created: {Alert.objects.filter(status='ACTIVE').count()}"
        ))
