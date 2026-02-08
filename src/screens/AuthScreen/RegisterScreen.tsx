import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomImagePicker from '../../components/CustomImagePicker';
import { COLORS } from '../../constants/color';
import { IMAGE } from '../../constants/image';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, setAuthenticated } from '../../redux/slices/authSlice';
import { viewProfile } from '../../redux/slices/userSlice';
import { AppDispatch, RootState } from '../../redux/store';

const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.auth);

    // Form Fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [driverPic, setDriverPic] = useState<any>(null);
    const [aadharPic, setAadharPic] = useState<any>(null);
    const [panPic, setPanPic] = useState<any>(null);
    const [dlPic, setDlPic] = useState<any>(null);

    // New Fields
    const [aadharNo, setAadharNo] = useState('');
    const [panNo, setPanNo] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [bankAccNo, setBankAccNo] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [upiId, setUpiId] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [drivingLicenceNo, setDrivingLicenceNo] = useState('');
    const [deliveryArea, setDeliveryArea] = useState('');

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (route.params?.phone) {
            setPhone(route.params.phone);
        }
        if (route.params?.missingFields) {
            setErrors(route.params.missingFields);
        }
    }, [route.params]);

    const validate = () => {
        const newErrors: any = {};
        if (!firstName) newErrors.name = 'Name is required'; // Map to name for consistency? Or just local
        if (!email) newErrors.email_id = 'Email is required';
        if (!phone) newErrors.phone_no = 'Phone is required';

        if (!aadharNo) newErrors.aadhar_no = 'Aadhar Number is required';
        if (!panNo) newErrors.pan_no = 'PAN Number is required';
        if (!address) newErrors.address = 'Address is required';
        if (!emergencyContact) newErrors.emergency_contact = 'Emergency Contact is required';
        if (!bankAccNo) newErrors.bank_acc_no = 'Bank Acc No is required';
        if (!ifsc) newErrors.ifsc = 'IFSC is required';
        if (!upiId) newErrors.upi_id = 'UPI ID is required';
        if (!vehicleType) newErrors.vehicle_type = 'Vehicle Type is required';
        if (!vehicleNo) newErrors.vehicle_no = 'Vehicle No is required';
        if (!drivingLicenceNo) newErrors.driving_licence_no = 'Driving Licence No is required';
        if (!deliveryArea) newErrors.delivery_area = 'Delivery Area is required';


        if (!driverPic) newErrors.driver_pic = 'Profile Picture is required';
        if (!aadharPic) newErrors.aadhar_pic = 'Aadhar Card Image is required';
        if (!panPic) newErrors.pan_pic = 'PAN Card Image is required';
        if (!dlPic) newErrors.dl_pic = 'Driving Licence Image is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) {
            // Alert.alert("Validation Error", "Please fill all required fields correctly.");
            return;
        }

        const payload = {
            name: `${firstName} ${lastName}`.trim(),
            email_id: email, // Mapped to email_id
            phone_no: phone,
            aadhar_no: aadharNo,
            pan_no: panNo,
            address: address,
            emergency_contact: emergencyContact,
            bank_acc_no: bankAccNo,
            ifsc: ifsc,
            upi_id: upiId,
            vehicle_type: vehicleType,
            vehicle_no: vehicleNo,
            driving_licence_no: drivingLicenceNo,
            delivery_area: deliveryArea,
            driver_pic: driverPic,
            "aadhar_pic[]": aadharPic,
            pan_pic: panPic,
            dl_pic: dlPic
        };

        try {
            const resultAction = await dispatch(registerUser(payload));
            if (registerUser.fulfilled.match(resultAction)) {
                const result = resultAction.payload as any;
                if (result.status === true || result.success === 'true') {
                    // Save token if returned
                    if (result.token) {
                        await AsyncStorage.setItem('user_token', result.token);
                    }

                    // Auto-login: Fetch Profile
                    const profileAction = await dispatch(viewProfile());
                    if (viewProfile.fulfilled.match(profileAction)) {
                        const profileRes = profileAction.payload as any;
                        if ((profileRes.status === true || profileRes.success === 'true' || profileRes.success === true) && profileRes.extraData) {
                            dispatch(setAuthenticated(true)); // Explicitly set auth state
                            // Navigation to Home/Tab
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Tab' }],
                            });
                        } else {
                            Alert.alert("Success", "Registration successful. Please login.");
                            navigation.navigate('Login');
                        }
                    } else {
                        Alert.alert("Success", "Registration successful. Please login.");
                        navigation.navigate('Login');
                    }
                } else {
                    // If backend returns failures in extraData similar to profile check
                    if (result.extraData && typeof result.extraData === 'object') {
                        console.log('Registration Errors:', result.extraData);
                        setErrors(result.extraData);
                        // Alert.alert("Registration Failed", "Please fix errors highlighted.");
                    } else {
                        Alert.alert("Registration Failed", result.message || result.extraData || "Unknown error");
                    }
                }
            } else {
                Alert.alert("Error", resultAction.payload as string || "Registration failed");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Something went wrong during registration");
        }
    };

    const renderInput = (label: string, value: string, setValue: (t: string) => void, placeholder: string, errorKey?: string, keyboardType: any = 'default', editable: boolean = true, iconName?: string) => {
        return (
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{label}</Text>
                <CustomInput
                    placeholder={placeholder}
                    value={value}
                    icon={iconName ? <Icon name={iconName} size={20} color={COLORS.gray} /> : undefined}
                    onChangeText={(text) => {
                        setValue(text);
                        if (errorKey && errors[errorKey]) {
                            setErrors({ ...errors, [errorKey]: null });
                        }
                    }}
                    keyboardType={keyboardType}
                    editable={editable}
                    error={errorKey ? errors[errorKey] : null}
                // errorText is handled by 'error' prop now for external errors
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.title}>Complete Profile</Text>

                    {/* Basic Info */}
                    {renderInput("First Name", firstName, setFirstName, "First Name", "name", "default", true, "person")}
                    {renderInput("Last Name", lastName, setLastName, "Last Name", undefined, "default", true, "person-outline")}
                    {/* Note: Backend error key is 'name', associating it with first name visual for now */}

                    {renderInput("Email", email, setEmail, "Email Address", "email_id", "email-address", true, "email")}
                    {renderInput("Phone Number", phone, setPhone, "Phone Number", "phone_no", "phone-pad", !route.params?.phone, "phone")}

                    {/* New Fields */}
                    {renderInput("Aadhar Number", aadharNo, setAadharNo, "Enter Aadhar Number", "aadhar_no", "numeric", true, "credit-card")}
                    {renderInput("PAN Number", panNo, setPanNo, "Enter PAN Number", "pan_no", "default", true, "branding-watermark")}
                    {renderInput("Address", address, setAddress, "Enter Address", "address", "default", true, "location-on")}
                    {renderInput("Emergency Contact", emergencyContact, setEmergencyContact, "Emergency Contact Number", "emergency_contact", "phone-pad", true, "contact-phone")}

                    {renderInput("Bank Account No", bankAccNo, setBankAccNo, "Enter Bank Account No", "bank_acc_no", "numeric", true, "account-balance")}
                    {renderInput("IFSC Code", ifsc, setIfsc, "Enter IFSC Code", "ifsc", "default", true, "account-balance-wallet")}
                    {renderInput("UPI ID", upiId, setUpiId, "Enter UPI ID", "upi_id", "default", true, "payment")}

                    {renderInput("Vehicle Type", vehicleType, setVehicleType, "e.g. 2 Wheeler", "vehicle_type", "default", true, "motorcycle")}
                    {renderInput("Vehicle Number", vehicleNo, setVehicleNo, "Enter Vehicle info", "vehicle_no", "default", true, "pin")}
                    {renderInput("Driving Licence", drivingLicenceNo, setDrivingLicenceNo, "Enter DL Number", "driving_licence_no", "default", true, "directions-car")}
                    {renderInput("Delivery Area", deliveryArea, setDeliveryArea, "Enter Delivery Area", "delivery_area", "default", true, "map")}

                    <CustomImagePicker
                        image={aadharPic}
                        onImageSelected={setAadharPic}
                        placeholderImage={IMAGE.LOGO}
                        label="Aadhar Card"
                        error={errors.aadhar_pic}
                    />

                    <CustomImagePicker
                        image={panPic}
                        onImageSelected={setPanPic}
                        placeholderImage={IMAGE.LOGO}
                        label="PAN Card"
                        error={errors.pan_pic}
                    />

                    <CustomImagePicker
                        image={dlPic}
                        onImageSelected={setDlPic}
                        placeholderImage={IMAGE.LOGO}
                        label="Driving Licence"
                        error={errors.dl_pic}
                    />

                    <CustomImagePicker
                        image={driverPic}
                        onImageSelected={setDriverPic}
                        placeholderImage={IMAGE.LOGO}
                        label="Profile Picture"
                        error={errors.driver_pic}
                    />
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Register & Login</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 50,
    },
    logo: {
        width: scale(100),
        height: scale(100),
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: COLORS.black,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: scale(8),
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#444',
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: COLORS.primary_v2,
    },
});

export default RegisterScreen;
