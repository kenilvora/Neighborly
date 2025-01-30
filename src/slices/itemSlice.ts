import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  hasMore: true,
  page: 1,
};

const itemSlice = createSlice({
  name: "item",
  initialState: initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
});

export const { setIsLoading, setHasMore, setPage } = itemSlice.actions;

export default itemSlice.reducer;
