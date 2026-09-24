from rest_framework import serializers
from .models import Station, SensorReading, Anomaly, SensorHealth, Alert, OperatorFeedback

class StationSerializer(serializers.ModelSerializer):
    readings_count = serializers.IntegerField(source='readings.count', read_only=True)
    anomalies_count = serializers.IntegerField(source='anomalies.count', read_only=True)

    class Meta:
        model = Station
        fields = '__all__'

class SensorReadingSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_id_str = serializers.CharField(source='station.station_id', read_only=True)

    class Meta:
        model = SensorReading
        fields = '__all__'

class AnomalySerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    reading_timestamp = serializers.DateTimeField(source='reading.timestamp', read_only=True)

    class Meta:
        model = Anomaly
        fields = '__all__'

class SensorHealthSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)

    class Meta:
        model = SensorHealth
        fields = '__all__'

class AlertSerializer(serializers.ModelSerializer):
    station_id = serializers.CharField(source='anomaly.station.station_id', read_only=True)
    station_name = serializers.CharField(source='anomaly.station.name', read_only=True)
    fault_type = serializers.CharField(source='anomaly.fault_type', read_only=True)
    classification = serializers.CharField(source='anomaly.classification', read_only=True)

    class Meta:
        model = Alert
        fields = '__all__'

class OperatorFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatorFeedback
        fields = '__all__'
