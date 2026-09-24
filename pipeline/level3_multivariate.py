"""
Level 3: Multivariate Physical Consistency Engine
Evaluates thermodynamic physical laws between Temperature, Humidity, and Pressure.
"""

def evaluate_level3_multivariate(current_reading, previous_reading=None):
    """
    Evaluates physical consistency across all 3 parameters.
    Returns dictionary indicating whether parameter shifts obey thermodynamic laws.
    """
    results = {
        'is_physically_consistent': True,
        'thermodynamic_score': 1.0,
        'violations': []
    }
    
    if not previous_reading:
        return results

    curr_t = current_reading.temperature
    prev_t = previous_reading.temperature
    curr_h = current_reading.humidity
    prev_h = previous_reading.humidity
    curr_p = current_reading.pressure
    prev_p = previous_reading.pressure

    if None in [curr_t, prev_t, curr_h, prev_h, curr_p, prev_p]:
        return results

    delta_t = curr_t - prev_t
    delta_h = curr_h - prev_h
    delta_p = curr_p - prev_p

    # Rule 1: Temperature-Humidity Inverse Thermodynamic Principle
    # Sharp temp rise (+4°C in 15 mins) MUST cause relative humidity to drop unless saturated/fog
    if delta_t > 4.0:
        if delta_h > 2.0:
            results['is_physically_consistent'] = False
            results['thermodynamic_score'] -= 0.4
            results['violations'].append(f"Physical Violation: Temp rose +{delta_t:.1f}°C while Humidity rose +{delta_h:.1f}% (violates inverse relation)")
        elif abs(delta_h) < 0.2:
            results['is_physically_consistent'] = False
            results['thermodynamic_score'] -= 0.3
            results['violations'].append(f"Physical Violation: Temp rose +{delta_t:.1f}°C but Humidity remained static (0 change)")

    # Rule 2: Extreme single-parameter jump with zero response in associated sensors
    if abs(delta_t) > 12.0 and abs(delta_h) < 0.5 and abs(delta_p) < 0.2:
        results['is_physically_consistent'] = False
        results['thermodynamic_score'] -= 0.6
        results['violations'].append(f"Isolated Parameter Jump: Temp changed {delta_t:+.1f}°C with 0 reaction from Humidity/Pressure")

    results['thermodynamic_score'] = max(0.0, min(1.0, round(results['thermodynamic_score'], 2)))
    return results
