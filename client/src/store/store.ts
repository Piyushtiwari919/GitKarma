import { configureStore } from "@reduxjs/toolkit";
import scoreReducer from "./slices/scoreSlice.js";

const appStore = configureStore({
  reducer: {
    score: scoreReducer,
  },
});

export default appStore;
