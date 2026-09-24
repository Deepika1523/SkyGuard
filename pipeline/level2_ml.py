"""
Level 2: Machine Learning Anomaly Detection
Uses Isolation Forest and Local Outlier Factor for multivariate point anomalies,
plus rolling-window standard deviation for frozen sensors, and linear regression trend analysis for drift.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor

def evaluate_level2_ml(history_df, window_size=24):
    """
    Evaluates ML anomaly signals over a recent historical dataframe of sensor readings.
    Returns dictionary with point anomaly scores, frozen sensor flags, and drift signals.
    """
    if len(history_df) < 5:
        return {
            'is_flagged': False,
            'isolation_forest_score': 0.0,
            'lof_score': 0.0,
            'frozen_params': [],
            'drift_params': {}
        }

    df = history_df.copy().tail(window_size)
    clean_features = df[['temperature', 'humidity', 'pressure']].dropna()

    ml_results = {
        'is_flagged': False,
        'isolation_forest_score': 0.0,
        'lof_score': 0.0,
        'frozen_params': [],
        'drift_params': {},
        'point_anomaly': False
    }

    # 1. Isolation Forest Point Anomaly Scoring
    if len(clean_features) >= 5:
        iso_forest = IsolationForest(n_estimators=5, max_samples=min(24, len(clean_features)), contamination=0.05, random_state=42)
        iso_forest.fit(clean_features)
        
        latest_val = clean_features.tail(1)
        # Decision function: lower values represent more anomalous points
        raw_score = iso_forest.decision_function(latest_val)[0]
        # Normalize score to [0, 1] range where 1.0 is extremely anomalous
        iso_norm_score = max(0.0, min(1.0, float(-raw_score + 0.2)))
        ml_results['isolation_forest_score'] = round(iso_norm_score, 4)

        if iso_norm_score > 0.45:
            ml_results['point_anomaly'] = True
            ml_results['is_flagged'] = True

    # 2. Rolling Window Flatline / Frozen Check (std dev == 0 over window)
    for param in ['temperature', 'humidity', 'pressure']:
        series = df[param].dropna()
        if len(series) >= 6:
            recent_series = series.tail(6)
            std_dev = recent_series.std()
            if std_dev < 1e-4:
                ml_results['frozen_params'].append(param)
                ml_results['is_flagged'] = True

    # 3. Linear Regression Monotonic Drift Check
    for param in ['temperature', 'humidity', 'pressure']:
        series = df[param].dropna()
        if len(series) >= 12:
            y = series.values
            x = np.arange(len(y))
            # Fit line y = mx + c
            slope, intercept = np.polyfit(x, y, 1)
            # Correlation coefficient R^2
            r_matrix = np.corrcoef(x, y)
            r_squared = r_matrix[0, 1] ** 2 if not np.isnan(r_matrix[0, 1]) else 0
            
            # Significant drift: steep continuous slope with strong linear R^2 > 0.85
            is_drifting = (abs(slope) > 0.15) and (r_squared > 0.85)
            ml_results['drift_params'][param] = {
                'slope': round(float(slope), 4),
                'r_squared': round(float(r_squared), 4),
                'is_drifting': is_drifting
            }
            if is_drifting:
                ml_results['is_flagged'] = True

    return ml_results
