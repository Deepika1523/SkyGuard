/**
 * SkyGuard AI — Shared Badge & Status Mapping Utility
 */
const SkyGuardBadges = (function() {

    const classificationMap = {
        'NORMAL': {
            label: 'Normal Weather',
            color: '#10b981',
            class: 'sg-badge-normal',
            icon: 'fa-solid fa-circle-check'
        },
        'GENUINE_WEATHER_EVENT': {
            label: 'Genuine Weather Event',
            color: '#3b82f6',
            class: 'sg-badge-weather',
            icon: 'fa-solid fa-cloud-bolt'
        },
        'SENSOR_FAULT': {
            label: 'Sensor Fault',
            color: '#f97316',
            class: 'sg-badge-fault',
            icon: 'fa-solid fa-triangle-exclamation'
        },
        'DATA_ISSUE': {
            label: 'Data Transmission Issue',
            color: '#a855f7',
            class: 'sg-badge-data',
            icon: 'fa-solid fa-wifi'
        }
    };

    const severityMap = {
        'LOW': {
            label: 'Low',
            color: '#10b981',
            class: 'sg-badge-healthy',
            icon: 'fa-solid fa-circle-info'
        },
        'MEDIUM': {
            label: 'Medium',
            color: '#f59e0b',
            class: 'sg-badge-warning',
            icon: 'fa-solid fa-circle-exclamation'
        },
        'HIGH': {
            label: 'High',
            color: '#ef4444',
            class: 'sg-badge-critical',
            icon: 'fa-solid fa-triangle-exclamation'
        },
        'CRITICAL': {
            label: 'Critical',
            color: '#dc2626',
            class: 'sg-badge-critical',
            icon: 'fa-solid fa-radiation'
        }
    };

    const stationStatusMap = {
        'ACTIVE': {
            label: 'Active',
            color: '#10b981',
            class: 'sg-badge-active',
            icon: 'fa-solid fa-tower-cell'
        },
        'WARNING': {
            label: 'Warning',
            color: '#f59e0b',
            class: 'sg-badge-warning',
            icon: 'fa-solid fa-triangle-exclamation'
        },
        'CRITICAL': {
            label: 'Critical',
            color: '#ef4444',
            class: 'sg-badge-critical',
            icon: 'fa-solid fa-skull-crossbones'
        },
        'OFFLINE': {
            label: 'Offline',
            color: '#64748b',
            class: 'sg-badge-offline',
            icon: 'fa-solid fa-power-off'
        }
    };

    const alertStatusMap = {
        'ACTIVE': {
            label: 'Open',
            color: '#ef4444',
            class: 'sg-badge-critical',
            icon: 'fa-solid fa-bell'
        },
        'ACKNOWLEDGED': {
            label: 'Acknowledged',
            color: '#f59e0b',
            class: 'sg-badge-warning',
            icon: 'fa-solid fa-eye'
        },
        'RESOLVED': {
            label: 'Resolved',
            color: '#10b981',
            class: 'sg-badge-healthy',
            icon: 'fa-solid fa-check-double'
        }
    };

    function renderBadge(config) {
        if (!config) return '<span class="sg-badge sg-badge-offline">Unknown</span>';
        return `<span class="sg-badge ${config.class}"><i class="${config.icon}"></i> ${config.label}</span>`;
    }

    return {
        getClassification: function(type) {
            return classificationMap[type] || { label: type, color: '#64748b', class: 'sg-badge-offline', icon: 'fa-solid fa-question' };
        },
        renderClassification: function(type) {
            return renderBadge(this.getClassification(type));
        },

        getSeverity: function(sev) {
            return severityMap[sev] || { label: sev, color: '#64748b', class: 'sg-badge-offline', icon: 'fa-solid fa-question' };
        },
        renderSeverity: function(sev) {
            return renderBadge(this.getSeverity(sev));
        },

        getStationStatus: function(status) {
            return stationStatusMap[status] || { label: status, color: '#64748b', class: 'sg-badge-offline', icon: 'fa-solid fa-question' };
        },
        renderStationStatus: function(status) {
            return renderBadge(this.getStationStatus(status));
        },

        getAlertStatus: function(status) {
            return alertStatusMap[status] || { label: status, color: '#64748b', class: 'sg-badge-offline', icon: 'fa-solid fa-question' };
        },
        renderAlertStatus: function(status) {
            return renderBadge(this.getAlertStatus(status));
        }
    };
})();
