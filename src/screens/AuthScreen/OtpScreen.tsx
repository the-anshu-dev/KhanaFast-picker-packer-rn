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
    const { phone, role_id } = route.params || {};
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
            const resultAction = await dispatch(verifyOtp({ phone_number: phone, otp: otpCode, role_id }));
            const result = resultAction.payload as any;

            if (verifyOtp.fulfilled.match(resultAction)) {
                if (result.success === true || result.success === 'true') {
                    console.log('OTP Verified, User Data:', result.data);
                    // Navigation should ideally be handled by the MainNavigation observing 'isAuthenticated'
                    // specific for this app flow:
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Tab' }],
                    });
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
