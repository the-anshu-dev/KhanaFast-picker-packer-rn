import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../../redux/slices/authSlice';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    // Getting profile data from user slice (or auth slice if that's where we store it initially?)
    // In OtpScreen we dispatched viewProfile which updates user.profile in userSlice.
    const { profile, loading } = useSelector((state: RootState) => state.user);
    const { user: authUser } = useSelector((state: RootState) => state.auth);

    console.log("ProfileScreen rendering with profile:", profile);
    // console.log("ProfileScreen rendering with authUser:", authUser); 
    // Fallback to authUser if profile is generic, but view_servicemen_profile response is in user.profile
    // Based on user request json structure: { success: "true", extraData: { profile: { ... } } }
    // userSlice.ts: if (action.payload.status) state.profile = action.payload.data;
    // Wait, the user JSON provided has "extraData.profile". Let's check how I handled it in userSlice?
    // In userSlice check: if (action.payload.status) state.profile = action.payload.data; 
    // This might be wrong if the API returns { success: "true", extraData: { profile: ... } }
    // I should probably double check the userSlice implementation or assume it maps correctly.
    // The previous analysis of userSlice showed:
    // builder.addCase(viewProfile.fulfilled, (state, action: PayloadAction<any>) => {
    //      if (action.payload.status) { state.profile = action.payload.data; } ...
    // })
    // The user request JSON says: {"success": "true", "extraData": { "profile": ... } }
    // AND the checkAuthState in authSlice handles logic too.
    // Let's assume for now that state.profile holds the profile object `name`, `phone`, etc.
    // If state.profile is null, we might show a loader or empty state.

    // Actually, looking at the JSON provided: `extraData: { profile: { ... } }`
    // If the API returns exactly that, then `action.payload.data` might be undefined if the key is `extraData`?
    // Let's optimistically use `profile` variable which I'll derived.

    // userSlice now normalizes the profile data
    const userData = profile || {};

    console.log("ProfileScreen rendering with userData:", userData);

    const handleLogout = () => {
        dispatch(logoutUser() as any);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: userData.driver_pic || 'https://avatar.iran.liara.run/public' }}
                            style={styles.avatar}
                        />
                        <View style={[styles.statusBadge, { backgroundColor: userData.status === '1' ? '#4CAF50' : '#ccc' }]} />
                    </View>
                    <Text style={styles.name}>{userData.name || 'User Name'}</Text>
                    <Text style={styles.service}>{userData.delivery_area || 'Delivery Area'}</Text>
                </View>

                {/* Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Phone</Text>
                        <Text style={styles.value}>{userData.phone_no || 'N/A'}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{userData.email_id || 'N/A'}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Emergency Contact</Text>
                        <Text style={styles.value}>{userData.emergency_contact || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle & License</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Vehicle Type</Text>
                        <Text style={styles.value}>{userData.vehicle_type || 'N/A'}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Vehicle No</Text>
                        <Text style={styles.value}>{userData.vehicle_no || 'N/A'}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Driving Licence</Text>
                        <Text style={styles.value}>{userData.driving_licence_no || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documents & Bank</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Aadhar No</Text>
                        <Text style={styles.value}>{userData.aadhar_no || 'N/A'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>PAN No</Text>
                        <Text style={styles.value}>{userData.pan_no || 'N/A'}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Bank Acc</Text>
                        <Text style={styles.value}>{userData.bank_acc_no || 'N/A'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>IFSC</Text>
                        <Text style={styles.value}>{userData.ifsc || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Address</Text>
                        <Text style={styles.value}>{userData.address || 'N/A'}</Text>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        // paddingVertical: 12,
        // backgroundColor: '#fff',
        // borderBottomWidth: 1,
        // borderBottomColor: '#eee',
    },
    backButton: {
        // padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    content: {
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e1e1e1',
    },
    statusBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    service: {
        fontSize: 16,
        color: '#666',
        backgroundColor: '#e8f0fe',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        overflow: 'hidden',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: {
        fontSize: 14,
        color: '#888',
        flex: 1,
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 4,
    },
    logoutButton: {
        backgroundColor: '#ffebee',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    logoutButtonText: {
        color: '#d32f2f',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
