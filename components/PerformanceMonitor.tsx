import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PerformanceMetrics {
    dashboardLoadTime: number;
    apiResponseTime: number;
    navigationTime: number;
    memoryUsage: number;
}

interface PerformanceMonitorProps {
    isVisible?: boolean;
    onToggle?: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
    isVisible = false,
    onToggle
}) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        dashboardLoadTime: 0,
        apiResponseTime: 0,
        navigationTime: 0,
        memoryUsage: 0,
    });

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Listen for performance events
        const handlePerformanceEvent = (event: any) => {
            if (event.type === 'DASHBOARD_LOAD') {
                setMetrics(prev => ({ ...prev, dashboardLoadTime: event.duration }));
            } else if (event.type === 'API_RESPONSE') {
                setMetrics(prev => ({ ...prev, apiResponseTime: event.duration }));
            } else if (event.type === 'NAVIGATION') {
                setMetrics(prev => ({ ...prev, navigationTime: event.duration }));
            }
        };

        // Add event listener
        document?.addEventListener?.('performance', handlePerformanceEvent);

        return () => {
            document?.removeEventListener?.('performance', handlePerformanceEvent);
        };
    }, []);

    const getPerformanceColor = (value: number, threshold: number) => {
        if (value <= threshold) return '#10B981'; // Green
        if (value <= threshold * 1.5) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    };

    const getPerformanceStatus = (value: number, threshold: number) => {
        if (value <= threshold) return 'Tốt';
        if (value <= threshold * 1.5) return 'Chấp nhận được';
        return 'Chậm';
    };

    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
            >
                <MaterialCommunityIcons
                    name="speedometer"
                    size={20}
                    color="#FD7622"
                />
                <Text style={styles.headerText}>Performance Monitor</Text>
                <MaterialCommunityIcons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#6B7280"
                />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.content}>
                    {/* Dashboard Load Time */}
                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Dashboard Load:</Text>
                        <View style={styles.metricValue}>
                            <Text style={[
                                styles.metricText,
                                { color: getPerformanceColor(metrics.dashboardLoadTime, 2000) }
                            ]}>
                                {metrics.dashboardLoadTime}ms
                            </Text>
                            <Text style={styles.metricStatus}>
                                {getPerformanceStatus(metrics.dashboardLoadTime, 2000)}
                            </Text>
                        </View>
                    </View>

                    {/* API Response Time */}
                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>API Response:</Text>
                        <View style={styles.metricValue}>
                            <Text style={[
                                styles.metricText,
                                { color: getPerformanceColor(metrics.apiResponseTime, 1000) }
                            ]}>
                                {metrics.apiResponseTime}ms
                            </Text>
                            <Text style={styles.metricStatus}>
                                {getPerformanceStatus(metrics.apiResponseTime, 1000)}
                            </Text>
                        </View>
                    </View>

                    {/* Navigation Time */}
                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Navigation:</Text>
                        <View style={styles.metricValue}>
                            <Text style={[
                                styles.metricText,
                                { color: getPerformanceColor(metrics.navigationTime, 500) }
                            ]}>
                                {metrics.navigationTime}ms
                            </Text>
                            <Text style={styles.metricStatus}>
                                {getPerformanceStatus(metrics.navigationTime, 500)}
                            </Text>
                        </View>
                    </View>

                    {/* Performance Tips */}
                    <View style={styles.tipsContainer}>
                        <Text style={styles.tipsTitle}>💡 Tối ưu hóa:</Text>
                        <Text style={styles.tipText}>• Dashboard: Sử dụng cache và parallel loading</Text>
                        <Text style={styles.tipText}>• API: Giảm timeout và thêm retry logic</Text>
                        <Text style={styles.tipText}>• Navigation: Sử dụng skeleton loading</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
        minWidth: 280,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        gap: 8,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 12,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    metricValue: {
        alignItems: 'flex-end',
        gap: 4,
    },
    metricText: {
        fontSize: 16,
        fontWeight: '600',
    },
    metricStatus: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    tipsContainer: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
});

export default PerformanceMonitor;
