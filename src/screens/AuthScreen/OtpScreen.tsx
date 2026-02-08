import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, NativeSyntheticEvent, TextInputKeyPressEventData, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, setAuthenticated } from '../../redux/slices/authSlice';
import { viewProfile } from '../../redux/slices/userSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import { IMAGE } from '../../constants/image';
import { scale } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/color';

const OtpScreen = () => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { phone } = route.params || {};
    const { loading } = useSelector((state: RootState) => state.auth);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text.slice(-1);
        setOtp(newOtp);

        if (text && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 4) {
            Alert.alert('Error', 'Please enter a valid 4-digit OTP.');
            return;
        }

        if (!phone) {
            Alert.alert('Error', 'Phone number not found.');
            return;
        }

        try {
            const resultAction = await dispatch(verifyOtp({ phone: phone, otp: otpCode }));
            const result = resultAction.payload as any;

            if (verifyOtp.fulfilled.match(resultAction)) {
                // Check for both boolean true or string 'true' to be safe, assuming similar API structure
                if (result.status === true || result.status === 'true') {

                    if (result.token) {
                        try {
                            await AsyncStorage.setItem('user_token', result.token);
                            // Fetch user profile immediately after login
                            const profileAction = await dispatch(viewProfile());

                            console.log("Profile Action ==========>", profileAction)

                            if (viewProfile.fulfilled.match(profileAction)) {
                                const payload = profileAction.payload as any;
                                // Check if profile data contains extra object (implies registered)
                                if ((payload.status === true || payload.success === 'true' || payload.success === true) && payload.extraData) {
                                    console.log('Profile loaded successfully with extraData');
                                    dispatch(setAuthenticated(true));
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'Tab' }],
                                    });
                                } else {
                                    // Profile fetch logic failed (e.g. user not found or validation errors)
                                    console.log('Profile fetch failed, redirecting to Register', payload);
                                    navigation.navigate('Register', { phone, missingFields: payload.extraData });
                                }
                            } else {
                                // Profile fetch rejected (network or server error)
                                console.log('Profile fetch rejected (likely API error), redirecting to Register');
                                navigation.navigate('Register', { phone });
                            }
                        } catch (e) {
                            console.error("Failed to save token or fetch profile", e);
                            navigation.navigate('Register', { phone });
                        }
                    }

                    // Need to update auth state? AuthSlice handles state update on fulfilled.
                    // Assuming 'Home' is the authenticated screen or Main Stack
                    // Resetting navigation stack might be better but navigate is fine for now
                    // Check where we should navigate. Usually App or Home.
                    // The user previously mentioned "Home".
                    // For now I will navigate to 'App' or whatever the main stack is called, or leave it to state listener.
                    // BUT, simplistic approach:
                    // The authSlice sets isAuthenticated = true.
                    // If there is an Application wrapper checking isAuthenticated, it might auto-navigate.
                    // If not, we manually navigate.
                    // I'll assume we need to navigate to 'Main' or 'Home'.
                    // Let's check navigation structure in a moment?
                    // For now, I'll log success.
                    console.log('OTP Verified:', result);
                } else {
                    Alert.alert('Verification Failed', result.message || result.extraData || 'Invalid OTP');
                }
            } else {
                Alert.alert('Error', resultAction.payload as string || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.subContainer}>
                <Image source={IMAGE.LOGO} style={styles.logo} />
                <Text style={styles.title}>Verification Code</Text>
                <Text style={styles.subtitle}>Please enter the 4-digit code sent to {phone}</Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            style={styles.input}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            ref={(ref: any) => (inputs.current[index] = ref)}
                            autoFocus={index === 0}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    subContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: scale(150),
        height: scale(150),
        marginTop: scale(50),
        alignSelf: 'center',
        marginBottom: scale(20)
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
        paddingHorizontal: 10,
    },
    input: {
        width: 55,
        height: 60,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        color: COLORS.primary,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
    },
    button: {
        marginTop: 40,
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        paddingHorizontal: 80,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: COLORS.primary_v2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OtpScreen;
