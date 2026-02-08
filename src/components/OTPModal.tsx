import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { COLORS } from '../constants/color';
import { scale } from 'react-native-size-matters';

interface OTPModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (otp: string) => void;
    loading?: boolean;
    title?: string;
    message?: string;
}

const OTPModal = ({ visible, onClose, onSubmit, loading = false, title = "Verification Required", message = "Please ask the customer for the 4-digit OTP to proceed." }: OTPModalProps) => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleSubmit = () => {
        const otpString = otp.join('');
        if (otpString.length === 4) {
            onSubmit(otpString);
            setOtp(['', '', '', '']); // Reset after submit
        }
    };

    const handleClose = () => {
        setOtp(['', '', '', '']);
        onClose();
    };

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.inputContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref: any) => inputs.current[index] = ref}
                                style={[styles.input, digit ? styles.inputFilled : null]}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                editable={!loading}
                                textAlign="center"
                                placeholder="•"
                                placeholderTextColor={COLORS.gray}
                            />
                        ))}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.submitButton, otp.some(d => d === '') && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={loading || otp.some(d => d === '')}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitText}>Verify</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: scale(14),
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 10,
    },
    input: {
        width: scale(50),
        height: scale(50),
        borderWidth: 1.5,
        borderColor: COLORS.input_border,
        backgroundColor: COLORS.input_bg,
        borderRadius: 12,
        fontSize: scale(24),
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
    },
    inputFilled: {
        borderColor: COLORS.primary,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#eee',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
    },
    disabledButton: {
        opacity: 0.6,
    },
    cancelText: {
        color: COLORS.gray,
        fontWeight: '600',
        fontSize: scale(14),
    },
    submitText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: scale(14),
    },
});

export default OTPModal;
