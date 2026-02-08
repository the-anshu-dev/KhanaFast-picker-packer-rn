import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { https } from '../../api/https';

interface OrderState {
    orders: any[];
    newOrders: any[];
    ongoingOrders: any[];
    completedOrders: any[];
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: [],
    newOrders: [],
    ongoingOrders: [],
    completedOrders: [],
    loading: false,
    error: null,
};

export const viewOrders = createAsyncThunk(
    'delivery_boy_view_order',
    async (_, { rejectWithValue }) => {
        try {
            const response = await https.get('/delivery_boy_view_order');
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const acceptOrder = createAsyncThunk(
    'delivery_boy_change_order_status_by_order_id',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await https.post('/delivery_boy_change_order_status_by_order_id', data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const makePayment = createAsyncThunk(
    'orders/makePayment',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await https.post('/make_payment_by_booking_id', data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // View Orders
        builder.addCase(viewOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(viewOrders.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            if (action.payload.status === true || action.payload.success === 'true') {
                const data = action.payload.extraData || action.payload.data;
                state.newOrders = data.neworder || [];
                state.ongoingOrders = data.ongoing_orders || [];
                state.completedOrders = data.history || [];
                // Flatten all orders into main 'orders' array for fallback or general use
                state.orders = [...state.newOrders, ...state.ongoingOrders, ...state.completedOrders];
            } else {
                state.error = action.payload.message || action.payload.extraData;
            }
        });
        builder.addCase(viewOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Accept Order
        builder.addCase(acceptOrder.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(acceptOrder.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Handle success
        });
        builder.addCase(acceptOrder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Make Payment
        builder.addCase(makePayment.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(makePayment.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Handle success
        });
        builder.addCase(makePayment.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export default orderSlice.reducer;
