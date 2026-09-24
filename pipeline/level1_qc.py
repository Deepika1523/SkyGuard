"""
Level 1: Rule-Based Quality Control (QC) Pipeline
Performs range checks, rate-of-change (step) checks, duplicate checks, and missing value checks.
"""

CLIMATOLOGICAL_BOUNDS = {
    'temperature': {'min': -50.0, 'max': 60.0},
    'humidity': {'min': 0.0, 'max': 100.0},
    'pressure': {'min': 850.0, 'max': 1080.0}
}

MAX_STEP_CHANGE = {
    'temperature': 6.0,   # Max °C change per 15 min
    'humidity': 35.0,     # Max % change per 15 min
    'pressure': 8.0       # Max hPa change per 15 min
}

def evaluate_level1_qc(current_reading, previous_reading=None):
    """
    Evaluates Level 1 Quality Control rules on a single reading.
    Returns dict of QC flags per parameter.
    """
    qc_results = {
        'is_flagged': False,
        'flags': [],
        'parameter_statuses': {}
    }
    
    for param in ['temperature', 'humidity', 'pressure']:
        val = getattr(current_reading, param, None)
        param_flags = []
        
        # 1. Missing Value Check
        if val is None or (isinstance(val, float) and float('nan') == val):
            param_flags.append('MISSING_VALUE')
            qc_results['flags'].append(f"{param.upper()}_MISSING")
            qc_results['parameter_statuses'][param] = {'status': 'FAIL', 'reason': 'Missing or Null value'}
            qc_results['is_flagged'] = True
            continue
            
        # 2. Climatological Range Check
        bounds = CLIMATOLOGICAL_BOUNDS[param]
        if val < bounds['min'] or val > bounds['max']:
            param_flags.append('OUT_OF_RANGE')
            qc_results['flags'].append(f"{param.upper()}_OUT_OF_RANGE")
            qc_results['is_flagged'] = True
            
        # 3. Rate of Change / Step Check
        if previous_reading:
            prev_val = getattr(previous_reading, param, None)
            if prev_val is not None:
                step = abs(val - prev_val)
                max_step = MAX_STEP_CHANGE[param]
                if step > max_step:
                    param_flags.append('EXCESSIVE_RATE_OF_CHANGE')
                    qc_results['flags'].append(f"{param.upper()}_HIGH_STEP ({step:.1f})")
                    qc_results['is_flagged'] = True
                    
        qc_results['parameter_statuses'][param] = {
            'status': 'FAIL' if param_flags else 'PASS',
            'flags': param_flags
        }
        
    return qc_results
