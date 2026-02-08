import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type OrderCardProps = {
    orderId: string;
    price: string;
    details: string;
    status: string;
    date?: string;
    address?: string;
    customerName?: string;
    showActions?: boolean;
    onApprove?: () => void;
    onCancel?: () => void;
    onDelivered?: () => void;
};

const OrderCard = ({
    orderId,
    price,
    details,
    status,
    date,
    address,
    customerName,
    showActions = false,
    onApprove,
    onCancel,
    onDelivered,
}: OrderCardProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.orderId}>Order ID: {orderId}</Text>
                <View style={[styles.statusBadge, getStatusStyle(status)]}>
                    <Text style={[styles.statusText, getStatusTextStyle(status)]}>{status}</Text>
                </View>
            </View>

            <View style={styles.body}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>{date || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Customer:</Text>
                    <Text style={styles.value}>{customerName || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value} numberOfLines={2}>{address || 'N/A'}</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Services:</Text>
                <Text style={styles.details}>
                    {details}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.price}>{price}</Text>
                </View>
            </View>

            {showActions && (
                <View style={styles.footer}>
                    {/* <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={onApprove}>
                        <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            )}
            {onDelivered && (
                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.button, styles.approveButton, { backgroundColor: '#4caf50' }]} onPress={onDelivered}>
                        <Text style={styles.approveButtonText}>Mark as Delivered</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return { backgroundColor: '#fff3e0' };
        case 'cancelled':
            return { backgroundColor: '#ffebee' };
        case 'approved':
            return { backgroundColor: '#e8f5e9' };
        default:
            return { backgroundColor: '#f5f5f5' };
    }
};

const getStatusTextStyle = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return { color: '#ff9800' };
        case 'cancelled':
            return { color: '#d32f2f' };
        case 'approved':
            return { color: '#388e3c' };
        default:
            return { color: '#666' };
    }
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#eee',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    body: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        color: '#888',
        width: 80,
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    details: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approveButton: {
        backgroundColor: '#007AFF',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d32f2f',
    },
    approveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    cancelButtonText: {
        color: '#d32f2f',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default OrderCard;
