import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { IMAGE } from '../../constants/image';
import { scale } from 'react-native-size-matters';

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Image source={IMAGE.LOGO} style={styles.logo} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    logo: {
        width: scale(150),
        height: scale(150),
        // marginTop: scale(100),
        alignSelf: 'center',
    },
});

export default SplashScreen;
