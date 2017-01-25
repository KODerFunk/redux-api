"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducerFn;

var _pathvarsToKey = require("./pathvarsToKey");

var _pathvarsToKey2 = _interopRequireDefault(_pathvarsToKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-case-declarations: 0 */
/**
 * Reducer contructor
 * @param  {Object}   initialState default initial state
 * @param  {Object}   actions      actions map
 * @param  {Function} transformer  transformer function
 * @param  {Function} reducer      custom reducer function
 * @return {Function}              reducer function
 */
function reducerFn(initialState) {
  var actions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var reducer = arguments[2];
  var cached = arguments[3];
  var actionFetch = actions.actionFetch,
      actionSuccess = actions.actionSuccess,
      actionFail = actions.actionFail,
      actionReset = actions.actionReset;

  function entryReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
      case actionFetch:
        return _extends({}, state, {
          loading: true,
          error: null,
          syncing: !!action.syncing
        });
      case actionSuccess:
        return _extends({}, state, {
          loading: false,
          sync: true,
          syncing: false,
          error: null,
          data: action.data
        });
      case actionFail:
        return _extends({}, state, {
          loading: false,
          error: action.error,
          syncing: false
        });
      case actionReset:
        var mutation = action.mutation;

        return mutation === "sync" ? _extends({}, state, { sync: false }) : _extends({}, initialState);
      default:
        return reducer ? reducer(state, action) : state;
    }
  }

  if (cached) {
    return function () {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var action = arguments[1];

      if (Object.values(actions).indexOf(action.type) === -1) {
        return reducer ? reducer(state, action) : state;
      }

      var _ref = action.request || {},
          pathvars = _ref.pathvars;
      // console.log('>> action >>', action);


      var branchKey = (0, _pathvarsToKey2.default)(pathvars);
      var branchState = state[branchKey];
      var updatedBranch = {};
      updatedBranch[branchKey] = entryReducer(branchState, action);
      return _extends({}, state, updatedBranch);
    };
  }
  return entryReducer;
}
module.exports = exports["default"];