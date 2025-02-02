import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchQuery: "",
  isLoading: false,
  hasMore: true,
  page: 1,
};

const itemSlice = createSlice({
  name: "item",
  initialState: initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
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

export const { setIsLoading, setHasMore, setPage, setSearchQuery } =
  itemSlice.actions;

export default itemSlice.reducer;
