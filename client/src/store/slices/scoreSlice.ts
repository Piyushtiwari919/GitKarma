import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface ScoreState {
  userData: unknown;
  repos: unknown[];
  finalScore: number | null;
  status: Status;
}

const initialState: ScoreState = {
  userData: null,
  repos: [],
  finalScore: null,
  status: "idle",
};

const scoreSlice = createSlice({
  name: "score",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<unknown>) => {
      state.userData = action.payload;
    },
    setRepos: (state, action: PayloadAction<unknown[]>) => {
      state.repos = action.payload;
    },
    setFinalScore: (state, action: PayloadAction<number | null>) => {
      state.finalScore = action.payload;
    },
    setStatus: (state, action: PayloadAction<Status>) => {
      state.status = action.payload;
    },
  },
});

export const { setUserData, setRepos, setFinalScore, setStatus } =
  scoreSlice.actions;

export default scoreSlice.reducer;
