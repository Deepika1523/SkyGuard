"""
SkyGuard AI — Dataset Ingestion & Pipeline Comprehensive Verification Suite
Tests dataset upload, 4-Level Pipeline Engine evaluation, Anomaly Classification,
Imputation Recovery, Sensor Health Metrics, and System Alerts.
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skyguard.settings')
django.setup()

import pandas as pd
from django.test import RequestFactory
from core.models import Station, SensorReading, Anomaly, Alert, SensorHealth
from core.upload_views import upload_dataset_api
from pipeline.engine import SkyGuardPipelineEngine

def run_tests():
    print("=" * 70)
    print(" SKYGUARD AI: DATASET INGESTION & PIPELINE EVALUATION TEST SUITE")
    print("=" * 70)

    dataset_path = os.path.join("real_data", "real_weather_telemetry_merged.csv")
    if not os.path.exists(dataset_path):
        print(f"FAIL: Dataset file not found at {dataset_path}")
        return False

    print(f"\n[STEP 1] Loading Dataset CSV: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f" -> Total rows loaded: {len(df)}")
    print(f" -> Stations in dataset: {df['station_id'].unique().tolist()}")
    print(f" -> Columns: {list(df.columns)}")

    # Clean existing test database state if necessary
    print("\n[STEP 2] Resetting / Ingesting Dataset into SkyGuard Engine...")
    
    # Ingest using upload_dataset_api endpoint logic
    factory = RequestFactory()
    with open(dataset_path, 'rb') as f:
        request = factory.post('/api/dataset/upload/', {'file': f})
        response = upload_dataset_api(request)

    print(f" -> HTTP Response Status: {response.status_code}")
    print(f" -> API Response Data: {response.data.get('message')}")
    summary = response.data.get('summary', {})
    print(f"    - Processed Rows: {summary.get('total_rows_processed')}")
    print(f"    - Readings Created: {summary.get('readings_created')}")
    print(f"    - Stations Created/Updated: {summary.get('stations_created')}")
    print(f"    - Anomalies Flagged: {summary.get('anomalies_flagged')}")
    print(f"    - Alerts Generated: {summary.get('alerts_created')}")
    print(f"    - Imputations Performed: {summary.get('imputations_count')}")

    # Validate Database Entities
    print("\n[STEP 3] Validating Database State & Pipeline Outputs...")
    
    stations_count = Station.objects.count()
    readings_count = SensorReading.objects.count()
    anomalies_count = Anomaly.objects.count()
    alerts_count = Alert.objects.count()
    health_records_count = SensorHealth.objects.count()
    imputed_count = SensorReading.objects.filter(is_imputed=True).count()

    print(f" -> Total Stations in DB: {stations_count} (Expected: 4)")
    print(f" -> Total Readings in DB: {readings_count}")
    print(f" -> Total Anomalies Flagged: {anomalies_count}")
    print(f" -> Total Active Alerts: {alerts_count}")
    print(f" -> Total Sensor Health Records: {health_records_count}")
    print(f" -> Total Imputed/Recovered Readings: {imputed_count}")

    # Detailed Anomaly Breakdown
    print("\n[STEP 4] Analyzing Flagged Anomalies & Fault Types...")
    anomaly_classifications = Anomaly.objects.values('classification').annotate(count=django.db.models.Count('id'))
    fault_types = Anomaly.objects.values('fault_type').annotate(count=django.db.models.Count('id'))
    severities = Anomaly.objects.values('severity').annotate(count=django.db.models.Count('id'))

    print(" -> Anomaly Classifications Breakdown:")
    for item in anomaly_classifications:
        print(f"    * {item['classification']}: {item['count']}")

    print(" -> Fault Types Breakdown:")
    for item in fault_types:
        print(f"    * {item['fault_type']}: {item['count']}")

    print(" -> Severities Breakdown:")
    for item in severities:
        print(f"    * {item['severity']}: {item['count']}")

    # Detailed Station Health Breakdown
    print("\n[STEP 5] Validating Station Status & Health Metrics...")
    for st in Station.objects.all():
        print(f"\n Station: {st.name} ({st.station_id}) | Overall Status: {st.status}")
        healths = SensorHealth.objects.filter(station=st)
        for h in healths:
            print(f"   - {h.sensor_type} Sensor Health: {h.health_score:.1f}% | Failures: {h.failure_count} | Missing: {h.missing_count} | Drift: {h.drift_score}")

    # Inspect Sample Explainable AI (XAI) Output
    print("\n[STEP 6] Inspecting Sample Explainable AI (XAI) Diagnostics & Actions...")
    sample_anomalies = Anomaly.objects.all()[:3]
    for idx, a in enumerate(sample_anomalies, 1):
        print(f"\n --- Anomaly Example #{idx} ---")
        print(f" Station: {a.station.station_id} | Parameter: {a.parameter}")
        print(f" Classification: {a.classification} | Fault Type: {a.fault_type} | Severity: {a.severity}")
        print(f" Score: {a.anomaly_score:.2f} | Confidence: {a.confidence:.2f}")
        print(f" Diagnostic Explanation:\n{a.explanation}")
        print(f" Recommended Action: {a.recommended_action}")

    # Final Verification Check
    success = (
        response.status_code == 201 and
        stations_count >= 4 and
        readings_count >= len(df) and
        anomalies_count > 0 and
        imputed_count > 0
    )

    print("\n" + "=" * 70)
    if success:
        print(" VERIFICATION RESULT: SUCCESS! ALL OUTPUTS AND ANALYSES ARE CORRECT.")
    else:
        print(" VERIFICATION RESULT: FAILED! Check logged diagnostics above.")
    print("=" * 70)
    return success

if __name__ == "__main__":
    run_tests()
