from django.contrib import admin
from .models import Station, SensorReading, Anomaly, SensorHealth, Alert, OperatorFeedback

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('station_id', 'name', 'latitude', 'longitude', 'status', 'installation_date')
    list_filter = ('status',)
    search_fields = ('station_id', 'name')

@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ('id', 'station', 'timestamp', 'temperature', 'humidity', 'pressure', 'is_imputed')
    list_filter = ('is_imputed', 'station')
    search_fields = ('station__station_id', 'station__name')
    date_hierarchy = 'timestamp'

@admin.register(Anomaly)
class AnomalyAdmin(admin.ModelAdmin):
    list_display = ('id', 'station', 'parameter', 'classification', 'fault_type', 'severity', 'confidence', 'detected_at')
    list_filter = ('classification', 'fault_type', 'severity', 'parameter', 'station')
    search_fields = ('station__station_id', 'explanation')
    date_hierarchy = 'detected_at'

@admin.register(SensorHealth)
class SensorHealthAdmin(admin.ModelAdmin):
    list_display = ('station', 'sensor_type', 'health_score', 'drift_score', 'failure_count', 'missing_count', 'last_checked')
    list_filter = ('sensor_type', 'station')

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'anomaly', 'severity', 'status', 'created_at')
    list_filter = ('severity', 'status')

@admin.register(OperatorFeedback)
class OperatorFeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'anomaly', 'decision', 'operator_name', 'created_at')
    list_filter = ('decision',)
