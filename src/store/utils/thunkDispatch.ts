import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import type { RootState } from "..";
import { useDispatch } from "react-redux";

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

/**
 * Тут более специфичный вид dispatch с чёткой типизацией;
 * TypeScript не понимает, что dispatch может принимать thunk‑экшены,
 * по умолчанию он возвращает Dispatch<AnyAction>, который
 * "знает" только про обычные экшены и не "видит" thunk‑и
 * и другие асинхронные экшены.
 */
export const useThunkDispatch = () => useDispatch<AppDispatch>();
