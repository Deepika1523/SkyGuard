from django.urls import path
from .dashboard_views import (
    main_homepage_view,
    dashboard_index_view,
    stations_list_view,
    station_detail_view,
    anomalies_list_view,
    alerts_list_view,
    analytics_view,
    reports_view,
    about_view,
    upload_dataset_view
)

urlpatterns = [
    path('', main_homepage_view, name='dashboard-home'),
    path('dashboard/', dashboard_index_view, name='dashboard-app'),
    path('stations/', stations_list_view, name='stations-list'),
    path('stations/<str:station_id>/', station_detail_view, name='station-detail'),
    path('anomalies/', anomalies_list_view, name='anomalies-list'),
    path('alerts/', alerts_list_view, name='alerts-list'),
    path('analytics/', analytics_view, name='analytics'),
    path('reports/', reports_view, name='reports'),
    path('upload/', upload_dataset_view, name='upload-dataset'),
    path('about/', about_view, name='about'),
]

