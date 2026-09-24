"""
SkyGuard AI — Dataset Ingestion API View
Allows uploading CSV / JSON weather telemetry datasets directly through the website or REST API.
Each row is ingested, auto-links or auto-creates Stations, creates SensorReadings,
and executes the 4-Level SkyGuard AI Pipeline Engine for anomaly detection and data recovery.
"""

import io
import csv
import pandas as pd
from datetime import datetime
from django.utils import timezone
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from core.models import Station, SensorReading, Anomaly, Alert, SensorHealth
from pipeline.engine import SkyGuardPipelineEngine


SAMPLE_CSV_CONTENT = """station_id,timestamp,temperature,humidity,pressure,station_name,latitude,longitude,elevation
AWS-DEL-01,2026-09-18T10:00:00Z,28.5,62.0,1012.3,Safdarjung Observatory,28.5822,77.2064,216.0
AWS-DEL-01,2026-09-18T10:15:00Z,47.0,61.5,1012.1,Safdarjung Observatory,28.5822,77.2064,216.0
AWS-DEL-02,2026-09-18T10:00:00Z,27.8,65.0,1011.8,Palam Airport Station,28.5665,77.1031,224.0
AWS-DEL-02,2026-09-18T10:15:00Z,28.0,,1011.9,Palam Airport Station,28.5665,77.1031,224.0
AWS-DEL-03,2026-09-18T10:00:00Z,29.1,58.0,1010.5,Delhi Ridge Station,28.6750,77.2200,230.0
"""


@api_view(['GET'])
def download_sample_csv(request):
    """Returns a downloadable sample CSV file for users to format their custom dataset."""
    response = HttpResponse(SAMPLE_CSV_CONTENT.strip(), content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="skyguard_sample_weather_dataset.csv"'
    return response


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def upload_dataset_api(request):
    """
    Ingests a CSV or JSON weather telemetry dataset.
    Processes each reading through SkyGuard AI 4-Level Pipeline Engine.
    """
    if 'file' in request.FILES:
        uploaded_file = request.FILES['file']
        filename = uploaded_file.name.lower()

        try:
            if filename.endswith('.json'):
                df = pd.read_json(uploaded_file)
            else:  # default CSV
                df = pd.read_csv(uploaded_file)
        except Exception as e:
            return Response(
                {'error': f"Failed to parse uploaded file: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
    elif isinstance(request.data, list):
        df = pd.DataFrame(request.data)
    elif 'readings' in request.data:
        df = pd.DataFrame(request.data['readings'])
    else:
        return Response(
            {'error': "No file uploaded or data array provided. Please upload a CSV or JSON file under key 'file'."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if df.empty:
        return Response({'error': "Uploaded dataset is empty."}, status=status.HTTP_400_BAD_REQUEST)

    # Standardize column names (lowercase & stripped)
    df.columns = [str(c).strip().lower() for c in df.columns]

    if 'station' in df.columns and 'station_id' not in df.columns:
        df.rename(columns={'station': 'station_id'}, inplace=True)

    # Required column checks
    required_cols = {'station_id', 'temperature'}
    if not required_cols.issubset(set(df.columns)):
        missing = required_cols - set(df.columns)
        return Response(
            {'error': f"Missing required columns in CSV: {', '.join(missing)}. Download sample template for guidance."},
            status=status.HTTP_400_BAD_REQUEST
        )

    engine = SkyGuardPipelineEngine()

    total_rows = len(df)
    readings_created = 0
    anomalies_flagged = 0
    alerts_created = 0
    imputations_count = 0
    stations_created = 0

    processed_details = []

    for idx, row in df.iterrows():
        st_id = str(row['station_id']).strip()
        
        # Check or create Station
        st_name = str(row.get('station_name', f"AWS Station {st_id}")).strip()
        lat = float(row['latitude']) if 'latitude' in row and pd.notna(row['latitude']) else 28.6139
        lon = float(row['longitude']) if 'longitude' in row and pd.notna(row['longitude']) else 77.2090
        elev = float(row['elevation']) if 'elevation' in row and pd.notna(row['elevation']) else 210.0

        station, created = Station.objects.get_or_create(
            station_id=st_id,
            defaults={
                'name': st_name if st_name and st_name != 'nan' else f"AWS Station {st_id}",
                'latitude': lat,
                'longitude': lon,
                'elevation': elev,
                'status': 'ACTIVE'
            }
        )
        if created:
            stations_created += 1

        # Parse Timestamp
        ts_raw = row.get('timestamp', None)
        if pd.notna(ts_raw):
            try:
                ts = pd.to_datetime(ts_raw).to_pydatetime()
                if timezone.is_naive(ts):
                    ts = timezone.make_aware(ts)
            except Exception:
                ts = timezone.now()
        else:
            ts = timezone.now()

        # Parse sensor metrics
        temp = float(row['temperature']) if pd.notna(row.get('temperature')) else None
        hum = float(row['humidity']) if pd.notna(row.get('humidity')) else None
        press = float(row['pressure']) if pd.notna(row.get('pressure')) else None

        # Create SensorReading
        reading = SensorReading.objects.create(
            station=station,
            timestamp=ts,
            temperature=temp,
            humidity=hum,
            pressure=press
        )
        readings_created += 1

        # Process via Pipeline Engine
        res = engine.process_reading(reading)

        if res['imputation']['is_imputed']:
            imputations_count += 1

        if res['anomaly']:
            anomalies_flagged += 1
            if res['severity'] in ['HIGH', 'CRITICAL']:
                alerts_created += 1

        processed_details.append({
            'row': idx + 1,
            'station_id': st_id,
            'reading_id': reading.id,
            'classification': res['classification'],
            'fault_type': res['fault_type'],
            'severity': res['severity'],
            'is_imputed': res['imputation']['is_imputed']
        })

    return Response({
        'message': f"Dataset uploaded and processed successfully!",
        'summary': {
            'total_rows_processed': total_rows,
            'readings_created': readings_created,
            'stations_created': stations_created,
            'anomalies_flagged': anomalies_flagged,
            'alerts_created': alerts_created,
            'imputations_count': imputations_count
        },
        'preview': processed_details[:20]  # First 20 items preview
    }, status=status.HTTP_201_CREATED)
