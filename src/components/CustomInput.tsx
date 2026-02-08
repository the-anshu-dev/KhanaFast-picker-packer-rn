import React, { useState, ReactNode } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../constants/color';

interface CustomInputProps extends TextInputProps {
    icon?: ReactNode;
    errorText?: string;
    validationRegex?: RegExp;
    error?: string | null;
}

const CustomInput: React.FC<CustomInputProps> = ({
    icon,
    errorText,
    validationRegex,
    error: externalError,
    style,
    value,
    onChangeText,
    onBlur,
    onFocus,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);

    const error = externalError || internalError;

    const handleFocus = (e: any) => {
        setIsFocused(true);
        setInternalError(null);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (validationRegex && value) {
            if (!validationRegex.test(value)) {
                setInternalError(errorText || 'Invalid input');
            } else {
                setInternalError(null);
            }
        }
        if (onBlur) onBlur(e);
    };

    const handleChangeText = (text: string) => {
        if (internalError) setInternalError(null);
        if (onChangeText) onChangeText(text);
    };

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    !!error && styles.inputContainerError,
                    style,
                ]}
            >
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholderTextColor={COLORS.gray}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // marginBottom: 16,
    },


    inputContainer: {

        flexDirection: 'row',
        alignItems: 'center',
        height: scale(40),
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: scale(8),
        paddingHorizontal: scale(10),
        backgroundColor: '#f9f9f9',
    },
    inputContainerFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    inputContainerError: {
        borderColor: COLORS.red,
    },
    iconContainer: {
        marginRight: scale(2),
    },
    input: {
        flex: 1,
        fontSize: scale(14),
        color: COLORS.black,
        height: '100%',
    },
    errorText: {
        color: 'red',
        fontSize: scale(12),
        marginTop: scale(4),
        marginLeft: scale(4),
    },
});

export default CustomInput;
