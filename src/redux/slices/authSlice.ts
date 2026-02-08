import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { https } from '../../api/https';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    isInitialized: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isInitialized: false,
};

export const checkAuthState = createAsyncThunk(
    'view_delivery_boy_profile',
    async (_, { rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem('user_token');
            const userDataStr = await AsyncStorage.getItem('user_data');

            if (token) {
                // Validate token by calling profile API
                try {
                    const response = await https.get<any>('/view_delivery_boy_profile');
                    // Check for success (support both formats as seen in other slices)
                    if (response.status === true || response.success === 'true') {
                        console.log("Token validated successfully via profile view", response);
                        // Return stored user data or updated profile data if available
                        const apiUser = response.extraData?.delivery_boy_profile || response.extraData?.profile || response.data || response.extraData;
                        return { token, user: apiUser || (userDataStr ? JSON.parse(userDataStr) : null) };
                    } else {
                        throw new Error('Token validation failed');
                    }
                } catch (apiError: any) {
                    console.error("Token validation error details:", JSON.stringify(apiError), apiError.message, apiError);
                    // If API fails (e.g. 401), we should consider this a logout
                    // We throw here to go to rejected case
                    throw new Error('Session expired or invalid: ' + (apiError.message || JSON.stringify(apiError)));
                }
            } else {
                return rejectWithValue('No session found');
            }
        } catch (error: any) {
            // Ensure we clean up if validation failed
            await AsyncStorage.removeItem('user_token');
            await AsyncStorage.removeItem('user_data');
            return rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'users/login',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await https.post('users/login', data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'users/verify-otp',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await https.post('users/verify-otp', data, { isJSON: true });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'users',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await https.post('/users', data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await AsyncStorage.removeItem('user_token');
            await AsyncStorage.removeItem('user_data');
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },
        // Keeping synchronous logout for state clear, but using thunk for async storage clear
        resetAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder) => {
        // Check Auth State
        builder.addCase(checkAuthState.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(checkAuthState.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.isInitialized = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
        });
        builder.addCase(checkAuthState.rejected, (state) => {
            state.loading = false;
            state.isInitialized = true;
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
        });

        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Adjust based on actual API response structure
            if (action.payload.success === 'true' || action.payload.success === true) {
                state.isAuthenticated = false; // Typically requires OTP? logic dependent on flow
                // Assuming login triggers OTP flow, not direct auth
            } else {
                state.error = action.payload.message || action.payload.extraData;
            }
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Verify OTP
        builder.addCase(verifyOtp.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(verifyOtp.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            if (action.payload.status || action.payload.success === 'true' || action.payload.success === true) {
                // state.isAuthenticated = true; // Wait for profile check
                state.user = action.payload.data || { ...action.payload }; // user_id in payload based on user request example
                state.token = action.payload.token;

                // Save to storage
                AsyncStorage.setItem('user_token', action.payload.token);
                // Saving entire payload or specific user data. 
                // Based on user request json: { success, extraData, user_status, user_id, token }
                const userDataToSave = {
                    user_id: action.payload.user_id,
                    user_status: action.payload.user_status
                };
                AsyncStorage.setItem('user_data', JSON.stringify(userDataToSave));

            } else {
                state.error = action.payload.message || action.payload.extraData;
            }
        });
        builder.addCase(verifyOtp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Handle registration success
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        });
    },
});

export const { resetAuth, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
