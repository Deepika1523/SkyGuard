from django.db import models
from django.utils import timezone

class Station(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active / Operational'),
        ('WARNING', 'Warning / Degraded Sensors'),
        ('CRITICAL', 'Critical / Multiple Sensor Faults'),
        ('OFFLINE', 'Offline / Comm Failure'),
    ]

    station_id = models.CharField(max_length=50, primary_key=True, help_text="Unique Station Identifier (e.g. AWS-IND-0101)")
    name = models.CharField(max_length=150, help_text="Station display name")
    latitude = models.FloatField(help_text="Latitude in decimal degrees")
    longitude = models.FloatField(help_text="Longitude in decimal degrees")
    elevation = models.FloatField(default=0.0, help_text="Elevation above sea level in meters")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    installation_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['station_id']

    def __str__(self):
        return f"{self.station_id} - {self.name} ({self.status})"


class SensorReading(models.Model):
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='readings')
    timestamp = models.DateTimeField(db_index=True)
    
    # Raw observed telemetry
    temperature = models.FloatField(null=True, blank=True, help_text="Temperature in °C")
    humidity = models.FloatField(null=True, blank=True, help_text="Relative Humidity in %")
    pressure = models.FloatField(null=True, blank=True, help_text="Atmospheric Pressure in hPa")
    
    # Data Recovery & Imputation (preserves original raw value alongside imputed values)
    is_imputed = models.BooleanField(default=False, help_text="True if any value was recovered/imputed")
    imputed_temperature = models.FloatField(null=True, blank=True, help_text="Recovered temperature if raw was missing/corrupted")
    imputed_humidity = models.FloatField(null=True, blank=True, help_text="Recovered humidity if raw was missing/corrupted")
    imputed_pressure = models.FloatField(null=True, blank=True, help_text="Recovered pressure if raw was missing/corrupted")
    imputation_confidence = models.FloatField(null=True, blank=True, help_text="Confidence score of recovery algorithm (0.0 - 1.0)")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['station', '-timestamp']),
        ]

    def __str__(self):
        return f"[{self.station.station_id}] {self.timestamp.strftime('%Y-%m-%d %H:%M')} | T:{self.temperature}°C H:{self.humidity}% P:{self.pressure}hPa"


class Anomaly(models.Model):
    CLASSIFICATION_CHOICES = [
        ('NORMAL', 'Normal Weather Pattern'),
        ('GENUINE_WEATHER_EVENT', 'Genuine Extreme Weather Event'),
        ('SENSOR_FAULT', 'Sensor Hardware / Calibration Fault'),
        ('DATA_ISSUE', 'Data Transmission / Corrupted Packet'),
    ]

    FAULT_TYPE_CHOICES = [
        ('NONE', 'None / Normal'),
        ('SPIKE', 'Spike / Sudden Jump'),
        ('DROP', 'Drop / Sudden Dip'),
        ('FROZEN', 'Frozen / Flatline Sensor'),
        ('DRIFT', 'Sensor Drift / Monotonic Bias'),
        ('MISSING_DATA', 'Missing Data / Null Gap'),
        ('COMMUNICATION_FAILURE', 'Communication Failure'),
        ('CORRUPTED_DATA', 'Corrupted Data Packet'),
        ('CALIBRATION_ISSUE', 'Out of Calibration Range'),
    ]

    SEVERITY_CHOICES = [
        ('LOW', 'Low Severity'),
        ('MEDIUM', 'Medium Severity'),
        ('HIGH', 'High Severity'),
        ('CRITICAL', 'Critical Severity'),
    ]

    PARAMETER_CHOICES = [
        ('TEMPERATURE', 'Temperature Sensor'),
        ('HUMIDITY', 'Humidity Sensor'),
        ('PRESSURE', 'Pressure Sensor'),
        ('MULTIVARIATE', 'Multivariate Thermodynamic Consistency'),
        ('SPATIAL', 'Spatial Consensus Divergence'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='anomalies')
    reading = models.ForeignKey(SensorReading, on_delete=models.CASCADE, related_name='anomalies')
    parameter = models.CharField(max_length=20, choices=PARAMETER_CHOICES)
    classification = models.CharField(max_length=30, choices=CLASSIFICATION_CHOICES, default='NORMAL')
    fault_type = models.CharField(max_length=30, choices=FAULT_TYPE_CHOICES, default='NONE')
    severity = models.CharField(max_length=15, choices=SEVERITY_CHOICES, default='LOW')
    
    anomaly_score = models.FloatField(default=0.0, help_text="Normalized anomaly score (0.0 to 1.0)")
    confidence = models.FloatField(default=0.0, help_text="Confidence of decision engine (0.0 to 1.0)")
    
    explanation = models.TextField(help_text="Human-readable explainable AI diagnostic explanation")
    recommended_action = models.TextField(blank=True, help_text="Actionable maintenance/operational advice")
    
    detected_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-detected_at']
        verbose_name_plural = "Anomalies"

    def __str__(self):
        return f"{self.station.station_id} | {self.parameter} | {self.classification} ({self.fault_type}) [{self.severity}]"


class SensorHealth(models.Model):
    SENSOR_TYPES = [
        ('TEMPERATURE', 'Temperature Sensor'),
        ('HUMIDITY', 'Humidity Sensor'),
        ('PRESSURE', 'Pressure Sensor'),
    ]

    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='health_metrics')
    sensor_type = models.CharField(max_length=20, choices=SENSOR_TYPES)
    
    health_score = models.FloatField(default=100.0, help_text="Health score percentage (0.0% - 100.0%)")
    drift_score = models.FloatField(default=0.0, help_text="Accumulative drift bias metric")
    failure_count = models.IntegerField(default=0, help_text="Count of detected sensor faults in past window")
    missing_count = models.IntegerField(default=0, help_text="Count of missing/null values in past window")
    
    last_checked = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('station', 'sensor_type')
        ordering = ['station', 'sensor_type']
        verbose_name_plural = "Sensor Health Metrics"

    def __str__(self):
        return f"{self.station.station_id} - {self.sensor_type}: {self.health_score:.1f}% Health"


class Alert(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active Alert'),
        ('ACKNOWLEDGED', 'Acknowledged by Operator'),
        ('RESOLVED', 'Resolved'),
    ]

    anomaly = models.OneToOneField(Anomaly, on_delete=models.CASCADE, related_name='alert')
    severity = models.CharField(max_length=15, choices=Anomaly.SEVERITY_CHOICES)
    message = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Alert [{self.severity}] - {self.anomaly.station.station_id} ({self.status})"


class OperatorFeedback(models.Model):
    DECISION_CHOICES = [
        ('CONFIRMED_FAULT', 'Confirmed Sensor Fault'),
        ('CONFIRMED_WEATHER', 'Confirmed Genuine Extreme Weather'),
        ('REJECTED', 'False Alarm / Incorrect Classification'),
    ]

    anomaly = models.ForeignKey(Anomaly, on_delete=models.CASCADE, related_name='feedbacks')
    decision = models.CharField(max_length=25, choices=DECISION_CHOICES)
    comment = models.TextField(blank=True)
    operator_name = models.CharField(max_length=100, default='Duty Meteorologist')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback for Anomaly #{self.anomaly.id}: {self.decision}"
