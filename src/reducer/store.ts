import { combineReducers } from "redux";

import userReducer from "../slices/userSlice";
import itemReducer from "../slices/itemSlice";

const rootReducer = combineReducers({
  user: userReducer,
  item: itemReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
