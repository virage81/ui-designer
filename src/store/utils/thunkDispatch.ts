import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import type { RootState } from "..";
import { useDispatch } from "react-redux";

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

export const useThunkDispatch = () => useDispatch<AppDispatch>();
