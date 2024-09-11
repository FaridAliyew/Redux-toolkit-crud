import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const apiKey = process.env.REACT_APP_KEY;
const baseUrl = process.env.REACT_APP_BASE_URL;

export const createItem = createAsyncThunk(
  "items/createItem",
  async (newItem, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        baseUrl,
        newItem,
        {
          headers: {
            apiKey: apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}?select=*`, {
        headers: {
          apiKey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateItem = createAsyncThunk(
  "items/updateItem",
  async (data, { rejectWithValue }) => {
    const { id, text } = data;
    try {
      const response = await axios.patch(
        `${baseUrl}?id=eq.${id}`,
        {
          item: text,
        },
        {
          headers: {
            apiKey: apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ------- Check ------
export const toggleComplete = createAsyncThunk(
  "items/toggleComplete",
  async (data, { rejectWithValue }) => {
    const { id, completed } = data;
    try {
      await axios.patch(
        `${baseUrl}?id=eq.${id}`,
        { completed: completed }, // Bu sütunu yeniləyirik
        {
          headers: {
            apiKey: apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      return { id, completed }; // Yalnız boolean dəyər qaytarırıq
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const deleteItem = createAsyncThunk(
  "items/deleteItem",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${baseUrl}?id=eq.${id}`, {
        headers: {
          apiKey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAllItems = createAsyncThunk(
  "items/deleteAllItems",
  async (_, { rejectWithValue }) => {
    try {
      // Bütün to-doları seçmək və silmək üçün neq istifadə edin
      await axios.delete(`${baseUrl}?completed=neq.true`, {
        headers: {
          apiKey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);




const initialState = {
  items: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(createItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(updateItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteAllItems.fulfilled, (state) => {
        state.items = []; 
      })
      .addCase(deleteAllItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default itemsSlice.reducer;
