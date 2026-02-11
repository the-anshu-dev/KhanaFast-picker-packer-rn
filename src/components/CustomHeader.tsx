import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface CustomHeaderProps {
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    rightComponent?: React.ReactNode;
    backgroundColor?: string;
    titleColor?: string;
    backButtonColor?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
    title,
    showBackButton = true,
    onBackPress,
    rightComponent,
    backgroundColor = '#fff',
    titleColor = '#333',
    backButtonColor = '#007AFF',
}) => {
    const navigation = useNavigation();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigation.goBack();
        }
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
            <View style={[styles.header, { backgroundColor }]}>
                {showBackButton ? (
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: backButtonColor }]}>← Back</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholder} />
                )}

                <Text style={[styles.headerTitle, { color: titleColor }]}>{title}</Text>

                {rightComponent ? (
                    <View style={styles.rightComponent}>{rightComponent}</View>
                ) : (
                    <View style={styles.placeholder} />
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
        minWidth: 70,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },
    rightComponent: {
        minWidth: 70,
        alignItems: 'flex-end',
    },
    placeholder: {
        minWidth: 70,
    },
});

export default CustomHeader;
