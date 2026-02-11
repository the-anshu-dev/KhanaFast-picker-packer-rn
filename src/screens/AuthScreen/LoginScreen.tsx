import React, { useState } from 'react';
import CustomInput from '../../components/CustomInput';
import {
    View,
    Text,
    // TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IMAGE } from '../../constants/image';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomDropdown from '../../components/CustomDropdown';
import { roleOptions } from '../../constants/data';

const LoginScreen = () => {
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [role, setRole] = useState('');
    const [roleError, setRoleError] = useState<string | null>(null);
    const navigation = useNavigation<any>();
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.auth);



    const handleSendOtp = async () => {
        let valid = true;
        if (phone.length < 10) {
            setPhoneError('Please enter a valid phone number');
            valid = false;
        }
        if (!role) {
            setRoleError('Please select a role');
            valid = false;
        }

        if (!valid) return;

        try {
            const selectedRole = roleOptions.find(opt => opt.value === role);
            const resultAction = await dispatch(loginUser({
                phone_number: String(phone),
                role_id: selectedRole?.role_id
            }));
            const result = resultAction.payload as any;

            if (loginUser.fulfilled.match(resultAction)) {
                if (result.success === 'true' || result.success === true) {
                    console.log('OTP Sent:', result);
                    navigation.navigate('Otp', { phone, role, role_id: selectedRole?.role_id });
                } else {
                    Alert.alert('Login Failed', result.message || result.extraData || 'Verification failed');
                }
            } else {
                if (resultAction.payload) {
                    Alert.alert('Error', resultAction.payload as string);
                } else {
                    Alert.alert('Error', resultAction.error.message || 'Something went wrong');
                }
            }
        } catch (error) {
            console.error('Login Error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <Image source={IMAGE.LOGO} style={styles.logo} />
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>Enter your phone number to continue</Text>
                </View>

                <View style={styles.form}>
                    <CustomDropdown
                        data={roleOptions}
                        value={role}
                        onSelect={(value) => {
                            setRole(value);
                            setRoleError(null);
                        }}
                        placeholder="Select Role"
                        icon={<Icon name="person" size={24} color={COLORS.gray} />}
                        error={roleError}
                    />

                    <CustomInput
                        placeholder="Phone Number"
                        value={phone}
                        icon={<Icon name="phone" size={24} color={COLORS.gray} />}
                        onChangeText={(text) => {
                            setPhone(text);
                            if (phoneError) setPhoneError(null);
                        }}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        maxLength={10}
                        validationRegex={/^\d{10}$/}
                        errorText="Invalid phone number"
                        error={phoneError}
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSendOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Send OTP</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        // flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logo: {
        width: scale(170),
        height: scale(170),
        marginTop: scale(100),
        alignSelf: 'center',
    },
    header: {
        marginBottom: scale(15),
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        // marginTop: 8,
    },
    form: {
        gap: 16,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        height: 50,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: COLORS.primary_v2,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;
