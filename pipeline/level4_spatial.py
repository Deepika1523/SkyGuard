"""
Level 4: Spatial Consensus Engine
Evaluates spatial correlation and divergence across neighboring AWS (Automatic Weather Stations).
Uses Haversine distance and Inverse Distance Weighting (IDW) spatial prediction.
"""
import math
import numpy as np

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates great-circle distance between two points in kilometers."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def evaluate_level4_spatial(target_station_id, station_coords_map, current_readings_map, power=2.0):
    """
    Evaluates spatial consensus for a target station against network neighbors.
    
    station_coords_map: dict of {station_id: (lat, lon)}
    current_readings_map: dict of {station_id: {'temperature': float, 'humidity': float, 'pressure': float}}
    """
    results = {
        'is_flagged': False,
        'spatial_consensus_confirmed': True,
        'neighbors_count': 0,
        'divergences': {},
        'expected_values': {}
    }
    
    if target_station_id not in station_coords_map or target_station_id not in current_readings_map:
        return results

    target_lat, target_lon = station_coords_map[target_station_id]
    target_vals = current_readings_map[target_station_id]

    # Find distances to all other active stations
    neighbors = []
    for st_id, (lat, lon) in station_coords_map.items():
        if st_id == target_station_id:
            continue
        if st_id in current_readings_map:
            dist = haversine_distance(target_lat, target_lon, lat, lon)
            if dist > 0:
                neighbors.append((st_id, dist, current_readings_map[st_id]))

    results['neighbors_count'] = len(neighbors)
    if len(neighbors) == 0:
        return results

    # IDW spatial interpolation per parameter
    for param in ['temperature', 'humidity', 'pressure']:
        target_val = target_vals.get(param)
        if target_val is None or np.isnan(target_val):
            continue

        weighted_sum = 0.0
        weight_total = 0.0

        for st_id, dist, n_vals in neighbors:
            val = n_vals.get(param)
            if val is not None and not np.isnan(val):
                w = 1.0 / (dist ** power)
                weighted_sum += w * val
                weight_total += w

        if weight_total > 0:
            expected_val = weighted_sum / weight_total
            diff = abs(target_val - expected_val)
            results['expected_values'][param] = round(expected_val, 2)
            
            # Thresholds for spatial divergence
            thresholds = {'temperature': 4.0, 'humidity': 25.0, 'pressure': 5.0}
            thresh = thresholds.get(param, 5.0)

            if diff > thresh:
                results['is_flagged'] = True
                results['spatial_consensus_confirmed'] = False
                results['divergences'][param] = {
                    'actual': round(target_val, 2),
                    'expected': round(expected_val, 2),
                    'difference': round(diff, 2),
                    'threshold': thresh
                }

    return results
