import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../constants/color';
import { showImagePickerOptions } from '../utils/imagePicker';

interface CustomImagePickerProps {
    image: any;
    onImageSelected: (image: any) => void;
    placeholderImage?: any;
    label?: string;
    error?: string | null;
}

const CustomImagePicker: React.FC<CustomImagePickerProps> = ({
    image,
    onImageSelected,
    placeholderImage,
    label,
    error,
}) => {
    const handleRemoveImage = () => {
        onImageSelected(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity onPress={() => showImagePickerOptions(onImageSelected)} style={styles.pickerContainer}>
                {image ? (
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
                        <TouchableOpacity style={styles.deleteButton} onPress={handleRemoveImage}>
                            <Icon name="close" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.placeholderWrapper}>
                        {placeholderImage ? (
                            <Image source={placeholderImage} style={styles.placeholderImage} />
                        ) : (
                            <Icon name="camera-alt" size={40} color={COLORS.gray} />
                        )}
                        <Text style={styles.placeholderText}>{label || 'Tap to upload'}</Text>
                    </View>
                )}
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        fontSize: scale(12),
        color: COLORS.black,
        marginBottom: 5,
    },
    pickerContainer: {
        width: '100%',
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        height: scale(120),
        borderRadius: scale(8),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.input_border,
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderWrapper: {
        width: '100%',
        height: scale(120),
        borderRadius: scale(8),
        backgroundColor: COLORS.input_bg,
        borderWidth: 1,
        borderColor: COLORS.input_border,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    placeholderImage: {
        width: scale(50),
        height: scale(50),
        resizeMode: 'contain',
        marginBottom: 5,
    },
    placeholderText: {
        fontSize: scale(12),
        color: COLORS.gray,
        marginTop: 5,
        textAlign: 'center',
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.red,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    errorText: {
        color: COLORS.red,
        fontSize: scale(10),
        marginTop: 5,
    },
});

export default CustomImagePicker;
