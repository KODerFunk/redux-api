"use strict";

import pathvarsToKey from "./pathvarsToKey";

/* eslint no-case-declarations: 0 */
/**
 * Reducer contructor
 * @param  {Object}   initialState default initial state
 * @param  {Object}   actions      actions map
 * @param  {Function} transformer  transformer function
 * @param  {Function} reducer      custom reducer function
 * @return {Function}              reducer function
 */
export default function reducerFn(initialState, actions={}, reducer, cached) {
  const { actionFetch, actionSuccess, actionFail, actionReset } = actions;
  function entryReducer(state = initialState, action) {
    switch (action.type) {
      case actionFetch:
        return {
          ...state,
          loading: true,
          error: null,
          syncing: !!action.syncing
        };
      case actionSuccess:
        return {
          ...state,
          loading: false,
          sync: true,
          syncing: false,
          error: null,
          data: action.data
        };
      case actionFail:
        return {
          ...state,
          loading: false,
          error: action.error,
          syncing: false
        };
      case actionReset:
        const { mutation } = action;
        return (mutation === "sync") ?
          { ...state, sync: false } :
          { ...initialState };
      default:
        return reducer ? reducer(state, action) : state;
    }
  }

  if (cached) {
    return function (state = {}, action) {
      if (Object.values(actions).indexOf(action.type) === -1) {
        return reducer ? reducer(state, action) : state;
      }
      const { pathvars } = action.request || {};
      // console.log('>> action >>', action);
      const branchKey = pathvarsToKey(pathvars);
      const branchState = state[branchKey];
      let updatedBranch = {};
      updatedBranch[branchKey] = entryReducer(branchState, action);
      return {
        ...state,
        ...updatedBranch
      };
    };
  }
  return entryReducer;
}
