import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { https } from '../../api/https';
import { checkAuthState } from './authSlice';

interface UserState {
    profile: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    profile: null,
    loading: false,
    error: null,
};

export const viewProfile = createAsyncThunk(
    'user/viewProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await https.get('/view_delivery_boy_profile');
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'update_servicemen_profile',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await https.post('/update_servicemen_profile', data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // View Profile
        builder.addCase(viewProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(viewProfile.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Check for status (boolean) or success (string 'true')
            if (action.payload.status === true || action.payload.success === 'true') {
                const data = action.payload.extraData;
                state.profile = data?.delivery_boy_profile || data?.profile || data;
            } else {
                state.error = action.payload.message || action.payload.extraData;
            }
        });
        builder.addCase(viewProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Update Profile
        builder.addCase(updateProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Optionally update profile in state with returned data
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Sync with Auth Check
        builder.addCase(checkAuthState.fulfilled, (state, action: PayloadAction<any>) => {
            // action.payload.user from checkAuthState is the profile object
            if (action.payload.user) {
                state.profile = action.payload.user;
            }
        });
    },
});

export default userSlice.reducer;
