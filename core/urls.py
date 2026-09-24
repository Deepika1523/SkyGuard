from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StationViewSet, SensorReadingViewSet, AnomalyViewSet,
    SensorHealthViewSet, AlertViewSet, OperatorFeedbackViewSet,
    dashboard_stats_api, inject_simulator_fault_api,
    analytics_metrics_api, anomaly_summary_api, send_contact_email_api
)

from .upload_views import upload_dataset_api, download_sample_csv

router = DefaultRouter()
router.register(r'stations', StationViewSet, basename='station')
router.register(r'readings', SensorReadingViewSet, basename='reading')
router.register(r'anomalies', AnomalyViewSet, basename='anomaly')
router.register(r'health', SensorHealthViewSet, basename='sensorhealth')
router.register(r'sensor-health', SensorHealthViewSet, basename='sensorhealth-alias')
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'feedback', OperatorFeedbackViewSet, basename='operatorfeedback')

urlpatterns = [
    path('dataset/upload/', upload_dataset_api, name='api-dataset-upload'),
    path('dataset/sample/', download_sample_csv, name='api-dataset-sample'),
    path('anomalies/summary/', anomaly_summary_api, name='api-anomaly-summary'),
    path('metrics/', analytics_metrics_api, name='api-metrics'),
    path('dashboard/stats/', dashboard_stats_api, name='api-dashboard-stats'),
    path('simulator/inject/', inject_simulator_fault_api, name='api-simulator-inject'),
    path('contact/', send_contact_email_api, name='api-contact-submit'),
    path('', include(router.urls)),
]


