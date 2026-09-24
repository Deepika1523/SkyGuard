"""
Synthetic Weather Baseline Generator
Produces realistic AWS time-series with diurnal temperature & humidity cycles and pressure dynamics.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_base_weather(station_id, start_time, num_hours=72, freq_minutes=15, base_temp=28.0, base_humidity=65.0, base_pressure=1012.0, seed=42):
    """
    Generates realistic baseline weather data for a given station.
    Diurnal cycle: Max temp around 14:00, Min temp around 05:00.
    Humidity moves inversely with temperature.
    Pressure has small smooth atmospheric tides.
    """
    np.random.seed(seed + hash(station_id) % 1000)
    num_steps = int((num_hours * 60) / freq_minutes)
    
    timestamps = [start_time + timedelta(minutes=i * freq_minutes) for i in range(num_steps)]
    
    hours = np.array([t.hour + t.minute / 60.0 for t in timestamps])
    
    # Diurnal temperature cycle: peak around 14:00 (14), min around 05:00 (5)
    # Sinusoidal wave shifted so peak is at hour 14
    temp_diurnal = 7.0 * np.sin((hours - 8.0) * (2 * np.pi / 24.0))
    temp_noise = np.random.normal(0, 0.4, num_steps)
    temperatures = base_temp + temp_diurnal + temp_noise
    
    # Humidity: Inversely related to temperature (cold night -> high RH, hot afternoon -> low RH)
    humidity_diurnal = -20.0 * np.sin((hours - 8.0) * (2 * np.pi / 24.0))
    humidity_noise = np.random.normal(0, 1.2, num_steps)
    humidities = np.clip(base_humidity + humidity_diurnal + humidity_noise, 15.0, 99.0)
    
    # Pressure: Semidiurnal atmospheric tide + subtle smooth drift
    pressure_tide = 1.5 * np.cos(hours * (4 * np.pi / 24.0))
    pressure_noise = np.random.normal(0, 0.3, num_steps)
    pressures = base_pressure + pressure_tide + pressure_noise
    
    df = pd.DataFrame({
        'station_id': station_id,
        'timestamp': timestamps,
        'temperature': np.round(temperatures, 2),
        'humidity': np.round(humidities, 2),
        'pressure': np.round(pressures, 2),
        'fault_ground_truth': 'NORMAL',
        'fault_parameter': 'NONE'
    })
    
    return df
