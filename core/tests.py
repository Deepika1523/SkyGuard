from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
import pandas as pd
import numpy as np

from core.models import Station, SensorReading, Anomaly, SensorHealth, Alert, OperatorFeedback
from pipeline.level1_qc import evaluate_level1_qc
from pipeline.level2_ml import evaluate_level2_ml
from pipeline.level3_multivariate import evaluate_level3_multivariate
from pipeline.level4_spatial import evaluate_level4_spatial
from pipeline.imputer import impute_sensor_reading
from pipeline.engine import SkyGuardPipelineEngine

class SkyGuardPipelineTests(TestCase):
    def setUp(self):
        self.station1 = Station.objects.create(
            station_id='AWS-TEST-01', name='Test Station 1',
            latitude=28.58, longitude=77.20, elevation=200.0, status='ACTIVE'
        )
        self.station2 = Station.objects.create(
            station_id='AWS-TEST-02', name='Test Station 2',
            latitude=28.56, longitude=77.10, elevation=220.0, status='ACTIVE'
        )
        self.now = timezone.now()

    def test_level1_qc_out_of_range(self):
        reading = SensorReading(station=self.station1, timestamp=self.now, temperature=85.0, humidity=50.0, pressure=1013.0)
        res = evaluate_level1_qc(reading)
        self.assertTrue(res['is_flagged'])
        self.assertIn('TEMPERATURE_OUT_OF_RANGE', res['flags'])

    def test_level1_qc_missing_value(self):
        reading = SensorReading(station=self.station1, timestamp=self.now, temperature=None, humidity=50.0, pressure=1013.0)
        res = evaluate_level1_qc(reading)
        self.assertTrue(res['is_flagged'])
        self.assertIn('TEMPERATURE_MISSING', res['flags'])

    def test_level2_ml_frozen_sensor(self):
        data = {'temperature': [25.0]*10, 'humidity': [60.0]*10, 'pressure': [1012.0]*10}
        df = pd.DataFrame(data)
        res = evaluate_level2_ml(df)
        self.assertTrue(res['is_flagged'])
        self.assertIn('temperature', res['frozen_params'])

    def test_level3_multivariate_physical_violation(self):
        prev = SensorReading(station=self.station1, timestamp=self.now - timedelta(minutes=15), temperature=25.0, humidity=65.0, pressure=1012.0)
        curr = SensorReading(station=self.station1, timestamp=self.now, temperature=30.0, humidity=75.0, pressure=1012.0) # Temp rose +5, humidity rose +10 (violates inverse relation)
        res = evaluate_level3_multivariate(curr, prev)
        self.assertFalse(res['is_physically_consistent'])
        self.assertGreater(len(res['violations']), 0)

    def test_level4_spatial_divergence(self):
        coords_map = {'AWS-TEST-01': (28.58, 77.20), 'AWS-TEST-02': (28.56, 77.10)}
        readings_map = {
            'AWS-TEST-01': {'temperature': 42.0, 'humidity': 20.0, 'pressure': 1012.0},
            'AWS-TEST-02': {'temperature': 28.0, 'humidity': 60.0, 'pressure': 1012.0}
        }
        res = evaluate_level4_spatial('AWS-TEST-01', coords_map, readings_map)
        self.assertTrue(res['is_flagged'])
        self.assertFalse(res['spatial_consensus_confirmed'])

    def test_imputer_data_recovery(self):
        reading = SensorReading(station=self.station1, timestamp=self.now, temperature=None, humidity=60.0, pressure=1012.0)
        coords_map = {'AWS-TEST-01': (28.58, 77.20), 'AWS-TEST-02': (28.56, 77.10)}
        readings_map = {'AWS-TEST-02': {'temperature': 26.5, 'humidity': 60.0, 'pressure': 1012.0}}
        
        res = impute_sensor_reading(reading, station_coords_map=coords_map, current_readings_map=readings_map)
        self.assertTrue(res['is_imputed'])
        self.assertAlmostEqual(res['imputed_temperature'], 26.5, delta=0.5)

    def test_master_pipeline_engine(self):
        reading = SensorReading.objects.create(
            station=self.station1, timestamp=self.now, temperature=78.0, humidity=60.0, pressure=1012.0
        )
        engine = SkyGuardPipelineEngine()
        res = engine.process_reading(reading)
        self.assertIn(res['classification'], ['SENSOR_FAULT', 'GENUINE_WEATHER_EVENT', 'DATA_ISSUE'])


class SkyGuardAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.station = Station.objects.create(
            station_id='AWS-API-01', name='API Test Station',
            latitude=28.58, longitude=77.20, elevation=200.0, status='ACTIVE'
        )

    def test_stations_api_list(self):
        response = self.client.get('/api/stations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_dashboard_stats_api(self):
        response = self.client.get('/api/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_stations', response.data)

    def test_simulator_inject_api(self):
        response = self.client.post('/api/simulator/inject/', {
            'station_id': 'AWS-API-01',
            'fault_type': 'SPIKE',
            'parameter': 'temperature'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('classification', response.data)
