import ImagePicker from 'react-native-image-crop-picker';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

export const pickImage = async (isCamera: boolean = false) => {
    try {
        let image;

        if (isCamera) {
            // Check Camera Permission on Android
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Camera permission is required to take photos');
                    return null;
                }
            }

            image = await ImagePicker.openCamera({
                width: 400,
                height: 400,
                cropping: true,
                mediaType: 'photo',
                includeBase64: false,
                compressImageQuality: 0.8
            });
        } else {
            // Gallery
            // Check Storage Permission on Android < 13 (SDK 33)
            // For SDK 33+, READ_MEDIA_IMAGES is handled automatically or by OS picker usually
            if (Platform.OS === 'android' && Platform.Version < 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Gallery permission is required to select photos');
                    return null;
                }
            }

            image = await ImagePicker.openPicker({
                width: 400,
                height: 400,
                cropping: true,
                mediaType: 'photo',
                includeBase64: false,
                compressImageQuality: 0.8
            });
        }

        if (image) {
            return {
                uri: image.path,
                type: image.mime,
                name: image.filename || `profile_${Date.now()}.jpg`,
            };
        }
    } catch (error: any) {
        if (error.message !== 'User cancelled image selection') {
            console.log('ImagePicker Error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    }
    return null;
};

export const showImagePickerOptions = (onImagePicked: (image: any) => void) => {
    Alert.alert(
        'Select Profile Picture',
        'Choose an option',
        [
            {
                text: 'Camera',
                onPress: async () => {
                    const img = await pickImage(true);
                    if (img) onImagePicked(img);
                },
            },
            {
                text: 'Gallery',
                onPress: async () => {
                    const img = await pickImage(false);
                    if (img) onImagePicked(img);
                },
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ],
        { cancelable: true }
    );
};
