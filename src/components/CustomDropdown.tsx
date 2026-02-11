import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Option {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    data: any[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    error?: string | null;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    data,
    value,
    onSelect,
    placeholder = 'Select an option',
    icon,
    error,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const toggleDropdown = () => {
        setIsVisible(!isVisible);
    };

    const handleSelect = (item: Option) => {
        onSelect(item.value);
        setIsVisible(false);
    };

    const selectedLabel = data.find((item) => item.value === value)?.label;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.dropdownButton,
                    isVisible && styles.dropdownButtonActive,
                    !!error && styles.dropdownButtonError,
                ]}
                onPress={toggleDropdown}
                onLayout={(event) => {
                    const { x, y, width, height } = event.nativeEvent.layout;
                    // Note: Absolute positioning for modal might need global coordinates,
                    // but for a simple full-screen overlay modal (common in RN), we just need to render the list.
                    // For a more advanced sticky dropdown, we'd need measureInWindow.
                    // Here we will use a simple modal with a centered or bottom sheet style 
                    // or a positioned overlay if possible. Let's stick to a simple list below the input for now
                    // if not using a Modal, or a centered Modal for better UX.
                    // Let's use a Modal for overlay behavior.
                }}
            >
                <View style={styles.contentRow}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[styles.selectedText, !selectedLabel && styles.placeholderText]}>
                        {selectedLabel || placeholder}
                    </Text>
                </View>
                <Icon
                    name={isVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color={COLORS.gray}
                />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.dropdownList}>
                            <FlatList
                                data={data}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.optionItem,
                                            item.value === value && styles.optionItemSelected,
                                        ]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                item.value === value && styles.optionTextSelected,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        {item.value === value && (
                                            <Icon name="check" size={20} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // marginBottom: 16,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: scale(40),
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: scale(8),
        paddingHorizontal: scale(10),
        backgroundColor: '#f9f9f9',
    },
    dropdownButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    dropdownButtonError: {
        borderColor: COLORS.red,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: scale(8),
    },
    selectedText: {
        fontSize: scale(14),
        color: COLORS.black,
    },
    placeholderText: {
        color: COLORS.gray,
    },
    errorText: {
        color: 'red',
        fontSize: scale(12),
        marginTop: scale(4),
        marginLeft: scale(4),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: scale(24),
    },
    dropdownList: {
        backgroundColor: 'white',
        borderRadius: scale(8),
        paddingVertical: scale(5),
        maxHeight: scale(200),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(15),
        paddingVertical: scale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionItemSelected: {
        backgroundColor: '#f0f9ff',
    },
    optionText: {
        fontSize: scale(14),
        color: '#333',
    },
    optionTextSelected: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default CustomDropdown;
