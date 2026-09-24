"""
Data Recovery & Imputation Engine
Imputes missing, corrupted, or rejected sensor readings using hybrid Spatial-Temporal Interpolation.
Combines Inverse Distance Weighting (IDW) spatial consensus with temporal exponential moving average.
"""
import numpy as np
from .level4_spatial import haversine_distance

def impute_sensor_reading(target_reading, history_readings=None, station_coords_map=None, current_readings_map=None):
    """
    Recovers missing or corrupted telemetry values.
    
    target_reading: SensorReading instance or dict
    history_readings: list of recent SensorReading instances for target station
    station_coords_map: dict {station_id: (lat, lon)}
    current_readings_map: dict {station_id: {'temperature': val, ...}}
    """
    res = {
        'is_imputed': False,
        'imputed_temperature': getattr(target_reading, 'temperature', None),
        'imputed_humidity': getattr(target_reading, 'humidity', None),
        'imputed_pressure': getattr(target_reading, 'pressure', None),
        'imputation_confidence': 1.0,
        'methods_used': []
    }

    raw_temp = getattr(target_reading, 'temperature', None)
    raw_hum = getattr(target_reading, 'humidity', None)
    raw_press = getattr(target_reading, 'pressure', None)
    st_id = target_reading.station.station_id if hasattr(target_reading, 'station') else getattr(target_reading, 'station_id', None)

    params_to_impute = []
    if raw_temp is None or (isinstance(raw_temp, float) and np.isnan(raw_temp)):
        params_to_impute.append('temperature')
    if raw_hum is None or (isinstance(raw_hum, float) and np.isnan(raw_hum)):
        params_to_impute.append('humidity')
    if raw_press is None or (isinstance(raw_press, float) and np.isnan(raw_press)):
        params_to_impute.append('pressure')

    if not params_to_impute:
        return res

    res['is_imputed'] = True
    confidence_factors = []

    for param in params_to_impute:
        spatial_val = None
        spatial_weight_sum = 0.0

        # 1. Spatial Consensus (IDW)
        if st_id and station_coords_map and current_readings_map and st_id in station_coords_map:
            t_lat, t_lon = station_coords_map[st_id]
            w_sum = 0.0
            val_sum = 0.0

            for other_id, (o_lat, o_lon) in station_coords_map.items():
                if other_id == st_id or other_id not in current_readings_map:
                    continue
                o_val = current_readings_map[other_id].get(param)
                if o_val is not None and not np.isnan(o_val):
                    d = haversine_distance(t_lat, t_lon, o_lat, o_lon)
                    if d > 0:
                        w = 1.0 / (d ** 2)
                        val_sum += w * o_val
                        w_sum += w

            if w_sum > 0:
                spatial_val = val_sum / w_sum
                spatial_weight_sum = w_sum

        # 2. Temporal Moving Average / Last Known Value
        temporal_val = None
        if history_readings and len(history_readings) > 0:
            def get_val(r, p):
                return r.get(p) if isinstance(r, dict) else getattr(r, p, None)
            valid_hist = [get_val(r, param) for r in history_readings if get_val(r, param) is not None and not np.isnan(get_val(r, param))]
            if valid_hist:
                # Weighted average favoring recent readings
                weights = np.exp(np.linspace(-1, 0, len(valid_hist)))
                weights /= weights.sum()
                temporal_val = float(np.sum(np.array(valid_hist) * weights))

        # Combine spatial and temporal
        if spatial_val is not None and temporal_val is not None:
            imputed = 0.65 * spatial_val + 0.35 * temporal_val
            conf = 0.92
            res['methods_used'].append(f"{param}: Spatial-Temporal Hybrid")
        elif spatial_val is not None:
            imputed = spatial_val
            conf = 0.88
            res['methods_used'].append(f"{param}: Spatial IDW Interpolation")
        elif temporal_val is not None:
            imputed = temporal_val
            conf = 0.78
            res['methods_used'].append(f"{param}: Temporal Exponential Weighting")
        else:
            # Fallback default values
            defaults = {'temperature': 25.0, 'humidity': 60.0, 'pressure': 1013.25}
            imputed = defaults.get(param, 0.0)
            conf = 0.40
            res['methods_used'].append(f"{param}: Climatological Fallback")

        if param == 'temperature':
            res['imputed_temperature'] = round(imputed, 2)
        elif param == 'humidity':
            res['imputed_humidity'] = round(min(100.0, max(0.0, imputed)), 2)
        elif param == 'pressure':
            res['imputed_pressure'] = round(imputed, 2)

        confidence_factors.append(conf)

    res['imputation_confidence'] = round(float(np.mean(confidence_factors)), 2)
    return res
