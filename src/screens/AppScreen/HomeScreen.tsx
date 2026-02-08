import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, StatusBar, RefreshControl } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { viewOrders, acceptOrder } from '../../redux/slices/orderSlice';
import OrderCard from '../../components/OrderCard';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../redux/store';
import { ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../../constants/color';
import OTPModal from '../../components/OTPModal';

const Tab = createMaterialTopTabNavigator();

const OrderScreen = ({ onApprove, onCancel }: { onApprove: (id: string) => void, onCancel: (id: string) => void }) => {
    // Access Redux State for orders
    const { newOrders, loading } = useSelector((state: RootState) => state.order);
    const dispatch = useDispatch<AppDispatch>();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await dispatch(viewOrders());
        setRefreshing(false);
    }, [dispatch]);





    if (loading && newOrders.length === 0) {
        return (
            <View style={[styles.tabContent, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.tabContent}>
            <FlatList
                data={newOrders}
                keyExtractor={(item) => item.order_id || item.id}
                renderItem={({ item }) => {
                    // Extract details from items array
                    const details = item.items?.map((s: any) => `${s.itemname}`).join(', ') || item.itemname || 'Order Details';
                    const price = item.total_amt || '0';

                    return (
                        <OrderCard
                            orderId={`#${item.order_id}`}
                            price={`₹${price}`}
                            details={details}
                            status={item.order_status}
                            date={item.date || item.booking_date}
                            customerName={item.items?.[0]?.vendor_name || 'Customer'}
                            address={item.address || 'Address not available'}
                            showActions={true}
                            onApprove={() => onApprove?.(item.order_id)}
                        // onCancel={() => onCancel?.(item.order_id)}
                        />
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No new orders found</Text>
                    </View>
                }
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            />
        </View>
    );
};

const ApprovedScreen = ({ onMarkDelivered }: { onMarkDelivered: (id: string) => void }) => {
    const { ongoingOrders, loading } = useSelector((state: RootState) => state.order);
    const dispatch = useDispatch<AppDispatch>();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await dispatch(viewOrders());
        setRefreshing(false);
    }, [dispatch]);
    // User request logic: show approved/ongoing in this tab

    return (
        <View style={styles.tabContent}>
            {loading && ongoingOrders.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={ongoingOrders}
                    keyExtractor={(item) => item.booking_no || item.order_id}
                    renderItem={({ item }) => {
                        const details = item.items?.map((s: any) => `${s.itemname}`).join(', ') || item.itemname || 'Order Details';
                        const price = item.total_amt || '0';
                        return (
                            <OrderCard
                                orderId={`#${item.order_id}`}
                                price={`₹${price}`}
                                details={details}
                                status={item.order_status}
                                date={item.date || item.booking_date}
                                customerName={item.items?.[0]?.vendor_name || 'Customer'}
                                address={item.address || 'Address not available'}
                                showActions={false}
                                onDelivered={() => onMarkDelivered?.(item.order_id)}
                            />
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No approved orders</Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                />
            )}
        </View>
    );
};

const CancelledScreen = () => {
    const { completedOrders, loading } = useSelector((state: RootState) => state.order);
    const dispatch = useDispatch<AppDispatch>();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await dispatch(viewOrders());
        setRefreshing(false);
    }, [dispatch]);
    return (
        <View style={styles.tabContent}>
            {loading && completedOrders.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={completedOrders}
                    keyExtractor={(item) => item.booking_no || item.order_id}
                    renderItem={({ item }) => {
                        const details = item.items?.map((s: any) => `${s.itemname}`).join(', ') || item.itemname || 'Order Details';
                        const price = item.total_amt || '0';
                        return (
                            <OrderCard
                                orderId={`#${item.order_id}`}
                                price={`₹${price}`}
                                details={details}
                                status={item.order_status}
                                showActions={false}
                                date={item.date || item.booking_date} // Pass date if OrderCard supports it
                                customerName={item.items?.[0]?.vendor_name || 'Customer'}
                                address={item.address || 'Address not available'}
                            />
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No cancelled orders</Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                />
            )}
        </View>
    );
};

const HomeScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<any>();
    const { profile, loading } = useSelector((state: RootState) => state.user);

    // OTP Modal State
    const [otpModalVisible, setOtpModalVisible] = React.useState(false);
    const [selectedOrder, setSelectedOrder] = React.useState<{ id: string, status: string, message: string } | null>(null);

    React.useEffect(() => {
        dispatch(viewOrders());
    }, [dispatch]);

    // Hoisted Status Update Logic
    const handleStatusUpdate = async (id: string, status: string, otp: string, successMessage: string) => {
        try {
            const formData = {
                order_id: id,
                status: status,
                otp: otp
            };
            // Note: acceptOrder might need to accept otp in its payload type if strict, 
            // but formData is likely any or has otp. Check orderSlice if issues arise.
            const resultAction = await dispatch(acceptOrder(formData));

            if (acceptOrder.fulfilled.match(resultAction)) {
                // Check if the API request itself was successful (e.g., correct status code)
                // BUT the backend Logic returned failure (e.g., wrong OTP)
                const payload = resultAction.payload as any;
                if (payload.status === true || payload.success === 'true') {
                    Alert.alert("Success", successMessage);
                    dispatch(viewOrders()); // Refresh orders
                    setOtpModalVisible(false);
                    setSelectedOrder(null);
                } else {
                    // Handle failure response: { "success": "false", "extraData": "Wrong Otp " }
                    const errorMessage = payload.extraData || payload.message || "Failed to update order status";
                    Alert.alert("Error", errorMessage);
                }
            } else {
                if (resultAction.payload) {
                    Alert.alert("Error", String(resultAction.payload));
                } else {
                    Alert.alert("Error", "Failed to update order status");
                }
            }
        } catch (error) {
            console.error("Error updating order:", error);
            Alert.alert("Error", "An unexpected error occurred");
        }
    };

    const initiateAction = (id: string, status: string, message: string) => {
        if (status === '0') {
            // Confirm cancellation without OTP
            Alert.alert(
                "Cancel Order",
                "Are you sure you want to cancel this order?",
                [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: () => handleStatusUpdate(id, status, '', message) }
                ]
            );
        } else {
            // Require OTP for Approve (2) and Deliver (5)
            setSelectedOrder({ id, status, message });
            setOtpModalVisible(true);
        }
    };

    const onApprove = (id: string) => {
        initiateAction(id, '2', "Order accepted successfully!");
    };

    const onCancel = (id: string) => {
        initiateAction(id, '0', "Order cancelled successfully!");
    };

    const onMarkDelivered = (id: string) => {
        initiateAction(id, '5', "Order marked as Delivered!");
    };

    const onOtpSubmit = (otp: string) => {
        if (selectedOrder) {
            handleStatusUpdate(selectedOrder.id, selectedOrder.status, otp, selectedOrder.message);
        }
    };


    const handleLogout = () => {
        dispatch(logoutUser() as any); // Type assertion if needed or update AppDispatch usage
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.profileSection} onPress={() => navigation.navigate('Profile')}>
                    <Image
                        source={{ uri: profile?.driver_pic || 'https://avatar.iran.liara.run/public' }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.welcomeLabel}>Welcome Back,</Text>
                        <Text style={styles.welcomeText}>{profile?.name || 'User'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.tabContainer}>
                <Tab.Navigator
                    screenOptions={{
                        tabBarLabelStyle: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
                        tabBarIndicatorStyle: { backgroundColor: COLORS.primary, height: 3, borderRadius: 3 },
                        tabBarActiveTintColor: COLORS.primary,
                        tabBarInactiveTintColor: COLORS.gray,
                        tabBarStyle: {
                            elevation: 0,
                            shadowOpacity: 0,
                            backgroundColor: 'transparent',
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee'
                        },
                        tabBarPressColor: 'transparent',
                        tabBarAndroidRipple: { borderless: true, color: 'transparent' }
                    }}
                >
                    <Tab.Screen name="New Order">
                        {() => <OrderScreen onApprove={onApprove} onCancel={onCancel} />}
                    </Tab.Screen>
                    <Tab.Screen name="Ongoing">
                        {() => <ApprovedScreen onMarkDelivered={onMarkDelivered} />}
                    </Tab.Screen>
                    <Tab.Screen name="History" component={CancelledScreen} />
                </Tab.Navigator>
            </View>

            <OTPModal
                visible={otpModalVisible}
                onClose={() => setOtpModalVisible(false)}
                onSubmit={onOtpSubmit}
                loading={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    welcomeLabel: {
        fontSize: 12,
        color: COLORS.gray,
        fontWeight: '500',
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    logoutButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#fff0f5', // Light pinkish background
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ffe0eb',
    },
    logoutText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    tabContainer: {
        flex: 1,
        marginTop: 10,
    },
    tabContent: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});

export default HomeScreen;
