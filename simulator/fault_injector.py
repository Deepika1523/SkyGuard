"""
Synthetic Fault & Extreme Weather Injector
Injects labeled anomalies: Spikes, Frozen sensors, Monotonic Drift, Missing gaps, and Genuine Extreme Weather Events.
"""
import numpy as np
import pandas as pd

def inject_spike(df, param='temperature', index=30, magnitude=18.0):
    """Injects a sudden single-reading jump/spike."""
    df_copy = df.copy()
    if index < len(df_copy):
        df_copy.loc[index, param] = round(df_copy.loc[index, param] + magnitude, 2)
        df_copy.loc[index, 'fault_ground_truth'] = 'SENSOR_FAULT'
        df_copy.loc[index, 'fault_parameter'] = param.upper()
        df_copy.loc[index, 'fault_type'] = 'SPIKE'
    return df_copy

def inject_frozen(df, param='temperature', start_idx=45, length=12):
    """Injects a frozen (flatline) sensor repeating exact value."""
    df_copy = df.copy()
    end_idx = min(start_idx + length, len(df_copy))
    freeze_val = df_copy.loc[start_idx, param]
    
    for i in range(start_idx, end_idx):
        df_copy.loc[i, param] = freeze_val
        df_copy.loc[i, 'fault_ground_truth'] = 'SENSOR_FAULT'
        df_copy.loc[i, 'fault_parameter'] = param.upper()
        df_copy.loc[i, 'fault_type'] = 'FROZEN'
        
    return df_copy

def inject_drift(df, param='temperature', start_idx=60, length=24, slope=0.25):
    """Injects slow monotonic drift bias over time."""
    df_copy = df.copy()
    end_idx = min(start_idx + length, len(df_copy))
    
    for step, i in enumerate(range(start_idx, end_idx)):
        drift_bias = (step + 1) * slope
        df_copy.loc[i, param] = round(df_copy.loc[i, param] + drift_bias, 2)
        df_copy.loc[i, 'fault_ground_truth'] = 'SENSOR_FAULT'
        df_copy.loc[i, 'fault_parameter'] = param.upper()
        df_copy.loc[i, 'fault_type'] = 'DRIFT'
        
    return df_copy

def inject_missing(df, param='temperature', start_idx=100, length=8):
    """Injects NaN / missing values representing telemetry dropout."""
    df_copy = df.copy()
    end_idx = min(start_idx + length, len(df_copy))
    
    for i in range(start_idx, end_idx):
        df_copy.loc[i, param] = np.nan
        df_copy.loc[i, 'fault_ground_truth'] = 'DATA_ISSUE'
        df_copy.loc[i, 'fault_parameter'] = param.upper()
        df_copy.loc[i, 'fault_type'] = 'MISSING_DATA'
        
    return df_copy

def inject_genuine_weather_event(station_dfs, start_idx=150, duration=16, temp_boost=9.5, pressure_drop=4.2):
    """
    Injects a correlated Genuine Extreme Weather Event (e.g. Heatwave / Severe Storm) across ALL stations simultaneously.
    - Temperature rises sharply across ALL stations
    - Relative Humidity drops naturally in thermodynamic equilibrium
    - Pressure drops consistently across the region
    This tests that SkyGuard AI correctly classifies this as GENUINE_WEATHER_EVENT and NOT a sensor fault!
    """
    updated_dfs = []
    for df in station_dfs:
        df_copy = df.copy()
        end_idx = min(start_idx + duration, len(df_copy))
        
        for step, i in enumerate(range(start_idx, end_idx)):
            # Smooth heatwave envelope curve
            factor = np.sin((step / float(duration)) * np.pi)
            
            # Thermodynamic correlation across parameters
            t_boost = temp_boost * factor
            p_drop = pressure_drop * factor
            rh_drop = t_boost * 1.8 # humidity drops proportionally
            
            df_copy.loc[i, 'temperature'] = round(df_copy.loc[i, 'temperature'] + t_boost, 2)
            df_copy.loc[i, 'humidity'] = max(10.0, round(df_copy.loc[i, 'humidity'] - rh_drop, 2))
            df_copy.loc[i, 'pressure'] = round(df_copy.loc[i, 'pressure'] - p_drop, 2)
            
            df_copy.loc[i, 'fault_ground_truth'] = 'GENUINE_WEATHER_EVENT'
            df_copy.loc[i, 'fault_parameter'] = 'MULTIVARIATE'
            df_copy.loc[i, 'fault_type'] = 'HEATWAVE'
            
        updated_dfs.append(df_copy)
        
    return updated_dfs
