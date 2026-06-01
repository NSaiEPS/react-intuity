/**
 * Pre-typed Redux hooks for this application.
 *
 * Import `useDispatch` and `useSelector` from here instead of `react-redux`
 * so every call site gets the correct `AppDispatch` type (which includes the
 * redux-thunk middleware signature) without needing an explicit type argument.
 *
 * React-Redux v9 provides the `.withTypes<T>()` factory for exactly this use case:
 * https://react-redux.js.org/using-react-redux/usage-with-typescript#define-typed-hooks
 */

import { useDispatch as _useDispatch, useSelector as _useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/store';

/** Typed dispatch hook — returns `AppDispatch` (includes thunk middleware). */
export const useDispatch = _useDispatch.withTypes<AppDispatch>();

/** Typed selector hook — state is `RootState`. */
export const useSelector = _useSelector.withTypes<RootState>();

// Re-export anything else components might need from react-redux:
export { useStore } from 'react-redux';
