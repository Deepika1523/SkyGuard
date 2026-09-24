from django.shortcuts import render, get_object_or_404
from .models import Station, SensorReading, Anomaly, SensorHealth, Alert, OperatorFeedback
from django.db.models import Avg, Count

def main_homepage_view(request):
    """Renders the main marketing homepage landing page."""
    return render(request, 'index.html')

def dashboard_index_view(request):
    """Renders the enterprise monitoring command center dashboard."""
    stations = Station.objects.all()
    active_alerts = Alert.objects.filter(status='ACTIVE').select_related('anomaly', 'anomaly__station')[:10]
    recent_anomalies = Anomaly.objects.all().select_related('station', 'reading')[:15]
    health_metrics = SensorHealth.objects.all().select_related('station')

    total_stations = stations.count()
    active_count = stations.filter(status='ACTIVE').count()
    warning_count = stations.filter(status='WARNING').count()
    critical_count = stations.filter(status='CRITICAL').count()

    avg_health = health_metrics.aggregate(Avg('health_score'))['health_score__avg'] or 100.0

    context = {
        'stations': stations,
        'active_alerts': active_alerts,
        'recent_anomalies': recent_anomalies,
        'health_metrics': health_metrics,
        'stats': {
            'total': total_stations,
            'active': active_count,
            'warning': warning_count,
            'critical': critical_count,
            'avg_health': round(avg_health, 1),
            'alert_count': active_alerts.count()
        }
    }
    return render(request, 'monitoring/dashboard.html', context)


def stations_list_view(request):
    stations = list(Station.objects.all())
    for st in stations:
        avg = SensorHealth.objects.filter(station=st).aggregate(Avg('health_score'))['health_score__avg']
        st.health_score = round(avg, 1) if avg is not None else 100.0

    context = {
        'stations': stations,
    }
    return render(request, 'monitoring/stations.html', context)


def station_detail_view(request, station_id):
    station = get_object_or_404(Station, station_id=station_id)
    health_metrics = SensorHealth.objects.filter(station=station)
    recent_anomalies = Anomaly.objects.filter(station=station).order_by('-detected_at')[:20]
    
    avg_health = health_metrics.aggregate(Avg('health_score'))['health_score__avg'] or 100.0

    context = {
        'station': station,
        'health_metrics': health_metrics,
        'avg_health': round(avg_health, 1),
        'recent_anomalies': recent_anomalies
    }
    return render(request, 'monitoring/station_detail.html', context)


def anomalies_list_view(request):
    stations = Station.objects.all()
    context = {
        'stations': stations
    }
    return render(request, 'monitoring/anomalies.html', context)


def alerts_list_view(request):
    alerts = Alert.objects.all().select_related('anomaly', 'anomaly__station')
    context = {
        'alerts': alerts
    }
    return render(request, 'monitoring/alerts.html', context)


def analytics_view(request):
    return render(request, 'monitoring/analytics.html')


def reports_view(request):
    stations = Station.objects.all()
    context = {
        'stations': stations
    }
    return render(request, 'monitoring/reports.html', context)


def about_view(request):
    return render(request, 'monitoring/about.html')


def upload_dataset_view(request):
    return render(request, 'monitoring/upload_dataset.html')

