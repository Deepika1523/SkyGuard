"""
SkyGuard AI Master Pipeline Engine
Integrates Level 1 (QC), Level 2 (ML), Level 3 (Multivariate Physics), Level 4 (Spatial Consensus),
Data Imputation, XAI Explanation Generation, Health Score Updating, and Alert Dispatching.
"""
import pandas as pd
import numpy as np
from django.db import models
from django.utils import timezone

from .level1_qc import evaluate_level1_qc
from .level2_ml import evaluate_level2_ml
from .level3_multivariate import evaluate_level3_multivariate
from .level4_spatial import evaluate_level4_spatial
from .imputer import impute_sensor_reading
from core.models import Anomaly, SensorHealth, Alert, Station, SensorReading

class SkyGuardPipelineEngine:
    def __init__(self, station_coords_map=None):
        """
        station_coords_map: dict of {station_id: (lat, lon)}
        """
        self.station_coords_map = station_coords_map or {}

    def _build_coords_map(self):
        if not self.station_coords_map:
            stations = Station.objects.all()
            self.station_coords_map = {st.station_id: (st.latitude, st.longitude) for st in stations}

    def process_reading(self, reading, previous_reading=None, history_df=None, current_readings_map=None, history_readings_list=None):
        """
        Processes a single SensorReading through the entire 4-Level AI pipeline.
        Saves resulting Anomaly, SensorHealth updates, Imputed values, and Alerts to DB.
        """
        self._build_coords_map()
        station = reading.station

        # Fetch history readings if not passed
        if history_df is None:
            recent_readings = SensorReading.objects.filter(station=station).order_by('-timestamp')[:30]
            readings_list = list(reversed(recent_readings))
            data = [{
                'timestamp': r.timestamp,
                'temperature': r.temperature,
                'humidity': r.humidity,
                'pressure': r.pressure
            } for r in readings_list]
            history_df = pd.DataFrame(data)

        if previous_reading is None:
            prev_qs = SensorReading.objects.filter(station=station, timestamp__lt=reading.timestamp).order_by('-timestamp')
            previous_reading = prev_qs.first()

        if current_readings_map is None:
            latest_readings = {}
            for st in Station.objects.all():
                lr = SensorReading.objects.filter(station=st).order_by('-timestamp').first()
                if lr:
                    latest_readings[st.station_id] = {
                        'temperature': lr.temperature,
                        'humidity': lr.humidity,
                        'pressure': lr.pressure
                    }
            current_readings_map = latest_readings

        # --- LEVEL 1: Rule-Based QC ---
        l1_res = evaluate_level1_qc(reading, previous_reading)

        # --- LEVEL 2: Machine Learning ---
        l2_res = evaluate_level2_ml(history_df)

        # --- LEVEL 3: Multivariate Thermodynamics ---
        l3_res = evaluate_level3_multivariate(reading, previous_reading)

        # --- LEVEL 4: Spatial Consensus ---
        l4_res = evaluate_level4_spatial(station.station_id, self.station_coords_map, current_readings_map)

        # --- DATA RECOVERY & IMPUTATION ---
        if history_readings_list is None:
            if history_df is not None:
                history_readings_list = history_df.to_dict('records')
            else:
                history_readings_list = list(SensorReading.objects.filter(station=station).order_by('-timestamp')[:15])

        imp_res = impute_sensor_reading(reading, history_readings_list, self.station_coords_map, current_readings_map)

        if imp_res['is_imputed']:
            reading.is_imputed = True
            reading.imputed_temperature = imp_res['imputed_temperature']
            reading.imputed_humidity = imp_res['imputed_humidity']
            reading.imputed_pressure = imp_res['imputed_pressure']
            reading.imputation_confidence = imp_res['imputation_confidence']
            reading.save()

        # --- SYNTHESIS & CLASSIFICATION ---
        classification, fault_type, severity, parameter, anomaly_score, confidence = self._synthesize_anomaly(
            l1_res, l2_res, l3_res, l4_res, reading
        )

        explanation, action = self._generate_xai_explanation(
            classification, fault_type, severity, parameter, l1_res, l2_res, l3_res, l4_res, reading
        )

        # Record Anomaly if flagged
        anomaly_obj = None
        if classification != 'NORMAL':
            anomaly_obj = Anomaly.objects.create(
                station=station,
                reading=reading,
                parameter=parameter,
                classification=classification,
                fault_type=fault_type,
                severity=severity,
                anomaly_score=anomaly_score,
                confidence=confidence,
                explanation=explanation,
                recommended_action=action,
                detected_at=reading.timestamp
            )

            # Create Alert if HIGH or CRITICAL
            if severity in ['HIGH', 'CRITICAL']:
                Alert.objects.get_or_create(
                    anomaly=anomaly_obj,
                    defaults={
                        'severity': severity,
                        'message': f"[{severity}] {station.name} ({station.station_id}): {classification} - {fault_type}. {explanation[:120]}...",
                        'status': 'ACTIVE'
                    }
                )

        # Update Sensor Health Matrices
        self._update_sensor_health(station, reading, classification, fault_type, l2_res)

        return {
            'anomaly': anomaly_obj,
            'l1': l1_res,
            'l2': l2_res,
            'l3': l3_res,
            'l4': l4_res,
            'imputation': imp_res,
            'classification': classification,
            'fault_type': fault_type,
            'severity': severity
        }

    def _synthesize_anomaly(self, l1, l2, l3, l4, reading):
        is_missing = 'TEMPERATURE_MISSING' in l1['flags'] or 'HUMIDITY_MISSING' in l1['flags'] or 'PRESSURE_MISSING' in l1['flags']
        
        # Priority 1: Missing Data
        if is_missing:
            return 'DATA_ISSUE', 'MISSING_DATA', 'MEDIUM', 'MULTIVARIATE', 0.65, 0.95

        # Priority 2: Frozen / Flatline Sensor
        if len(l2.get('frozen_params', [])) > 0:
            param = l2['frozen_params'][0].upper()
            return 'SENSOR_FAULT', 'FROZEN', 'HIGH', param, 0.88, 0.96

        # Priority 3: Monotonic Drift
        drifting_params = [p for p, info in l2.get('drift_params', {}).items() if info.get('is_drifting')]
        if drifting_params:
            param = drifting_params[0].upper()
            return 'SENSOR_FAULT', 'DRIFT', 'MEDIUM', param, 0.75, 0.90

        # Priority 4: Spike or Out of Range
        out_of_range_flags = [f for f in l1['flags'] if 'OUT_OF_RANGE' in f]
        high_step_flags = [f for f in l1['flags'] if 'HIGH_STEP' in f]

        if out_of_range_flags or high_step_flags:
            param = 'TEMPERATURE'
            if any('HUMIDITY' in f for f in l1['flags']):
                param = 'HUMIDITY'
            elif any('PRESSURE' in f for f in l1['flags']):
                param = 'PRESSURE'

            # Distinguish genuine weather event vs sensor spike using Level 4 Spatial & Level 3 Physics
            if l4.get('spatial_consensus_confirmed', True) and l3.get('is_physically_consistent', True):
                return 'GENUINE_WEATHER_EVENT', 'EXTREME_EVENT', 'HIGH', param, 0.82, 0.88
            else:
                return 'SENSOR_FAULT', 'SPIKE', 'HIGH', param, 0.90, 0.92

        # Priority 5: Level 3 Physical Consistency Violation
        if not l3.get('is_physically_consistent', True):
            if l4.get('spatial_consensus_confirmed', True):
                return 'GENUINE_WEATHER_EVENT', 'HEATWAVE', 'HIGH', 'MULTIVARIATE', 0.85, 0.89
            else:
                return 'SENSOR_FAULT', 'CALIBRATION_ISSUE', 'HIGH', 'MULTIVARIATE', 0.87, 0.91

        # Priority 6: ML Isolation Forest Outlier
        if l2.get('point_anomaly', False):
            if l4.get('spatial_consensus_confirmed', True):
                return 'GENUINE_WEATHER_EVENT', 'WEATHER_SQUALL', 'MEDIUM', 'MULTIVARIATE', 0.70, 0.80
            else:
                return 'SENSOR_FAULT', 'CORRUPTED_DATA', 'MEDIUM', 'MULTIVARIATE', 0.72, 0.82

        return 'NORMAL', 'NONE', 'LOW', 'TEMPERATURE', 0.0, 0.99

    def _generate_xai_explanation(self, classification, fault_type, severity, parameter, l1, l2, l3, l4, reading):
        if classification == 'NORMAL':
            return "All telemetry parameters (Temperature, Humidity, Pressure) obey climatological bounds, rate-of-change limits, thermodynamic inverse relationships, and spatial consensus.", "No action required. Sensor operates within normal nominal thresholds."

        parts = [f"**Classification**: {classification} ({fault_type}) [Severity: {severity}]"]
        
        # L1 details
        if l1['flags']:
            parts.append(f"- **Level 1 QC**: Flagged rules: {', '.join(l1['flags'])}")
        
        # L2 details
        if l2.get('isolation_forest_score', 0) > 0.4:
            parts.append(f"- **Level 2 ML**: Isolation Forest Anomaly Score: {l2['isolation_forest_score']:.2f}")
        if l2.get('frozen_params'):
            parts.append(f"- **Level 2 ML**: Frozen flatline sensor detected on {', '.join(l2['frozen_params'])}")
        if l2.get('drift_params'):
            for p, info in l2['drift_params'].items():
                if info.get('is_drifting'):
                    parts.append(f"- **Level 2 ML**: Monotonic drift detected on {p} (slope: {info['slope']}, R²: {info['r_squared']})")

        # L3 details
        if l3.get('violations'):
            parts.append(f"- **Level 3 Physics**: {'; '.join(l3['violations'])}")

        # L4 details
        if not l4.get('spatial_consensus_confirmed', True):
            divs = l4.get('divergences', {})
            div_strs = [f"{p}: actual {d['actual']} vs expected {d['expected']} (diff: {d['difference']})" for p, d in divs.items()]
            parts.append(f"- **Level 4 Spatial**: Divergence from regional AWS consensus: {'; '.join(div_strs)}")
        elif l4.get('neighbors_count', 0) > 0:
            parts.append(f"- **Level 4 Spatial**: Spatial consensus confirmed across {l4['neighbors_count']} neighboring AWS stations.")

        explanation = "\n".join(parts)

        # Recommended action mapping
        actions = {
            'SPIKE': "Dispatch technician to inspect thermistor/transducer grounding and eliminate electrical noise.",
            'FROZEN': "Sensor flatline detected. Power cycle AWS data logger and inspect transducer wiring.",
            'DRIFT': "Monotonic calibration drift detected. Schedule recalibration against secondary reference standard.",
            'MISSING_DATA': "Telemetry packet loss detected. Check AWS solar cell, battery voltage, and GPRS/GSM antenna module.",
            'HEATWAVE': "Genuine regional extreme heat event confirmed across spatial AWS network. Issue meteorological heat warning.",
            'EXTREME_EVENT': "Genuine severe weather event confirmed by spatial consensus and thermodynamic alignment. Flag in IMD forecast bulletin.",
            'CALIBRATION_ISSUE': "Sensor out of calibration balance. Replace analog humidity/pressure sensor board.",
            'CORRUPTED_DATA': "Data packet corruption detected. Inspect RS485 serial communication cable."
        }

        action = actions.get(fault_type, "Inspect AWS station hardware and cross-verify readings against satellite telemetry.")
        return explanation, action

    def _update_sensor_health(self, station, reading, classification, fault_type, l2):
        for s_type in ['TEMPERATURE', 'HUMIDITY', 'PRESSURE']:
            health, _ = SensorHealth.objects.get_or_create(
                station_id=station.station_id,
                sensor_type=s_type,
                defaults={'health_score': 100.0}
            )
            
            param_lower = s_type.lower()
            val = getattr(reading, param_lower, None)

            if val is None or (isinstance(val, float) and np.isnan(val)):
                health.missing_count += 1
                health.health_score = max(0.0, health.health_score - 3.0)
            elif classification == 'SENSOR_FAULT' and fault_type in ['SPIKE', 'FROZEN', 'CORRUPTED_DATA']:
                health.failure_count += 1
                health.health_score = max(0.0, health.health_score - 8.0)
            elif classification == 'SENSOR_FAULT' and fault_type == 'DRIFT':
                drift_info = l2.get('drift_params', {}).get(param_lower, {})
                slope = abs(drift_info.get('slope', 0.1))
                health.drift_score = round(health.drift_score + slope, 2)
                health.health_score = max(0.0, health.health_score - 2.5)
            else:
                # Gradual natural recovery over time if healthy
                health.health_score = min(100.0, health.health_score + 0.5)

            health.last_checked = reading.timestamp
            health.save()

        # Update station overall status based on lowest sensor health
        min_health = SensorHealth.objects.filter(station=station).aggregate(models.Min('health_score'))['health_score__min'] or 100.0
        if min_health < 40.0:
            station.status = 'CRITICAL'
        elif min_health < 75.0:
            station.status = 'WARNING'
        else:
            station.status = 'ACTIVE'
        station.save()
