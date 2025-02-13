import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type LoadingKeys = "getAllItems" | "addItem";

const initialState = {
  searchQuery: "",
  isLoading: {
    getAllItems: false,
    addItem: false,
  },
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
    setIsLoading: (
      state,
      action: PayloadAction<{ key: LoadingKeys; value: boolean }>
    ) => {
      state.isLoading[action.payload.key] = action.payload.value;
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
