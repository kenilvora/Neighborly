import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
};

const itemSlice = createSlice({
  name: "item",
  initialState: initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setIsLoading } = itemSlice.actions;

export default itemSlice.reducer;
