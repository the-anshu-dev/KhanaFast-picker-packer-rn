import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigation from './authNavigation';
import AppNavigation from './appNavigation';
import SplashScreen from '../screens/CommonScreen/SplashScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { checkAuthState } from '../redux/slices/authSlice';

const Stack = createNativeStackNavigator();

const NavigationContent = () => {
    const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(checkAuthState());
    }, [dispatch]);

    if (!isInitialized) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            <SafeAreaView style={{ flex: 1 }}>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {isAuthenticated ? (
                        <Stack.Screen name="App" component={AppNavigation} />
                    ) : (
                        <Stack.Screen name="Auth" component={AuthNavigation} />
                    )}
                </Stack.Navigator>
            </SafeAreaView>
        </NavigationContainer>
    );
};

const MainNavigation = () => {
    return (
        <NavigationContent />
    );
};

export default MainNavigation;
