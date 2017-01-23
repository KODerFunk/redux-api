"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CRUD = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = actionFn;

var _fastApply = require("fast-apply");

var _fastApply2 = _interopRequireDefault(_fastApply);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _urlTransform = require("./urlTransform");

var _urlTransform2 = _interopRequireDefault(_urlTransform);

var _pathvarsToKey = require("./pathvarsToKey");

var _pathvarsToKey2 = _interopRequireDefault(_pathvarsToKey);

var _merge = require("./utils/merge");

var _merge2 = _interopRequireDefault(_merge);

var _get = require("./utils/get");

var _get2 = _interopRequireDefault(_get);

var _fetchResolver = require("./fetchResolver");

var _fetchResolver2 = _interopRequireDefault(_fetchResolver);

var _PubSub = require("./PubSub");

var _PubSub2 = _interopRequireDefault(_PubSub);

var _createHolder = require("./createHolder");

var _createHolder2 = _interopRequireDefault(_createHolder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function none() {}

function extractArgs(args) {
  var pathvars = void 0;
  var params = {};
  var callback = void 0;
  if (args[0] instanceof Function) {
    callback = args[0];
  } else if (args[1] instanceof Function) {
    pathvars = args[0];
    callback = args[1];
  } else {
    pathvars = args[0];
    params = args[1];
    callback = args[2] || none;
  }
  return [pathvars, params, callback];
}

function helperCrudFunction(name) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _extractArgs = extractArgs(args),
        _extractArgs2 = _slicedToArray(_extractArgs, 3),
        pathvars = _extractArgs2[0],
        params = _extractArgs2[1],
        cb = _extractArgs2[2];

    return [pathvars, _extends({}, params, { method: name.toUpperCase() }), cb];
  };
}

function defaultMiddlewareArgsParser(dispatch, getState) {
  return { dispatch: dispatch, getState: getState };
}

var CRUD = exports.CRUD = ["get", "post", "put", "delete", "patch"].reduce(function (memo, name) {
  memo[name] = helperCrudFunction(name);
  return memo;
}, {});

/**
 * Constructor for create action
 * @param  {String} url          endpoint's url
 * @param  {String} name         action name
 * @param  {Object} options      action configuration
 * @param  {Object} ACTIONS      map of actions
 * @param  {[type]} fetchAdapter adapter for fetching data
 * @return {Function+Object}     action function object
 */
function actionFn(url, name, options) {
  var ACTIONS = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var meta = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var actionFetch = ACTIONS.actionFetch,
      actionSuccess = ACTIONS.actionSuccess,
      actionFail = ACTIONS.actionFail,
      actionReset = ACTIONS.actionReset;

  var pubsub = new _PubSub2.default();
  var requestHolder = (0, _createHolder2.default)();
  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} getState    helper meta function
  */
  var request = function request(pathvars, params) {
    var getState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : none;

    var responseHandler = meta && meta.holder && meta.holder.responseHandler;
    var resultUrlT = (0, _urlTransform2.default)(url, pathvars, meta.urlOptions);
    var rootUrl = meta.holder ? meta.holder.rootUrl : null;
    var urlT = resultUrlT;
    if (rootUrl) {
      var urlObject = _url2.default.parse(urlT);
      if (!urlObject.host) {
        var urlPath = (rootUrl.path ? rootUrl.path.replace(/\/$/, "") : "") + "/" + (urlObject.path ? urlObject.path.replace(/^\//, "") : "");
        urlT = rootUrl.protocol + "//" + rootUrl.host + urlPath;
      }
    }
    var globalOptions = !meta.holder ? {} : meta.holder.options instanceof Function ? meta.holder.options(urlT, params, getState) : meta.holder.options;
    var baseOptions = options instanceof Function ? options(urlT, params, getState) : options;
    var opts = (0, _merge2.default)({}, globalOptions, baseOptions, params);
    var response = meta.fetch(urlT, opts);
    var result = !meta.validation ? response : response.then(function (data) {
      return new Promise(function (resolve, reject) {
        return meta.validation(data, function (err) {
          return err ? reject(err) : resolve(data);
        });
      });
    });
    if (responseHandler) {
      if (result && result.then) {
        result.then(function (data) {
          return responseHandler(null, data);
        }, function (err) {
          return responseHandler(err);
        });
      } else {
        responseHandler(result);
      }
    }
    result && result.catch && result.catch(none);
    return result;
  };

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} callback)   callback execute after end request
   */
  function fn() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var _extractArgs3 = extractArgs(args),
        _extractArgs4 = _slicedToArray(_extractArgs3, 3),
        pathvars = _extractArgs4[0],
        params = _extractArgs4[1],
        callback = _extractArgs4[2];

    var syncing = params ? !!params.syncing : false;
    params && delete params.syncing;
    pubsub.push(callback);
    return function () {
      var middlewareParser = meta.holder && meta.holder.middlewareParser || defaultMiddlewareArgsParser;

      var _middlewareParser = middlewareParser.apply(undefined, arguments),
          dispatch = _middlewareParser.dispatch,
          getState = _middlewareParser.getState;

      var reducerName = meta.reducerName,
          prefix = meta.prefix;

      var state = getState();
      var isLoading = (0, _get2.default)(state, prefix, reducerName, "loading");
      if (isLoading) {
        return;
      }
      var requestOptions = { pathvars: pathvars, params: params };
      var prevData = (0, _get2.default)(state, prefix, reducerName, "data");
      dispatch({ type: actionFetch, syncing: syncing, request: requestOptions });
      var fetchResolverOpts = {
        dispatch: dispatch,
        getState: getState,
        requestOptions: requestOptions,
        actions: meta.actions,
        prefetch: meta.prefetch
      };
      var result = new Promise(function (done, fail) {
        (0, _fetchResolver2.default)(0, fetchResolverOpts, function (err) {
          if (err) {
            pubsub.reject(err);
            return fail(err);
          }
          new Promise(function (resolve, reject) {
            requestHolder.set({
              resolve: resolve,
              reject: reject,
              promise: request(pathvars, params, getState).then(resolve, reject)
            });
          }).then(function (d) {
            requestHolder.pop();
            var data = meta.transformer(d, prevData, {
              type: actionSuccess, request: requestOptions
            });
            dispatch({
              data: data,
              origData: d,
              type: actionSuccess,
              syncing: false,
              request: requestOptions
            });
            if (meta.broadcast) {
              meta.broadcast.forEach(function (type) {
                dispatch({ type: type, data: data, origData: d, request: requestOptions });
              });
            }
            if (meta.postfetch) {
              meta.postfetch.forEach(function (postfetch) {
                postfetch instanceof Function && postfetch({
                  data: data, getState: getState, dispatch: dispatch, actions: meta.actions, request: requestOptions
                });
              });
            }
            pubsub.resolve(data);
            done(data);
          }, function (error) {
            dispatch({ type: actionFail, syncing: false, error: error, request: requestOptions });
            pubsub.reject(error);
            fail(error);
          });
        });
      });
      result.catch(none);
      return result;
    };
  }

  /*
    Pure rest request
   */
  fn.request = request;

  /**
   * Reset store to initial state
   */
  fn.reset = function (mutation) {
    var defer = requestHolder.pop();
    defer && defer.reject(new Error("Application abort request"));
    return mutation === "sync" ? { type: actionReset, mutation: mutation } : { type: actionReset };
  };

  /**
   * Sync store with server. In server mode works as usual method.
   * If data have already synced, data would not fetch after call this method.
   * @param  {Object} pathvars    path vars for url
   * @param  {Object} params      fetch params
   * @param  {Function} callback) callback execute after end request
   */
  fn.sync = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var _extractArgs5 = extractArgs(args),
        _extractArgs6 = _slicedToArray(_extractArgs5, 3),
        pathvars = _extractArgs6[0],
        params = _extractArgs6[1],
        callback = _extractArgs6[2];

    var isServer = meta.holder ? meta.holder.server : false;
    return function (dispatch, getState) {
      var state = getState();
      var store = meta.cached ? state[name] && state[name][(0, _pathvarsToKey2.default)(pathvars)] : state[name];
      if (!isServer && store && store.sync) {
        callback(null, store.data);
        return;
      }
      var modifyParams = _extends({}, params, { syncing: true });
      return fn(pathvars, modifyParams, callback)(dispatch, getState);
    };
  };

  var helpers = meta.helpers || {};
  if (meta.crud) {
    helpers = _extends({}, CRUD, helpers);
  }
  var fnHelperCallback = function fnHelperCallback(memo, func, helpername) {
    if (memo[helpername]) {
      throw new Error("Helper name: \"" + helpername + "\" for endpoint \"" + name + "\" has been already reserved");
    }

    var _ref = func instanceof Function ? { call: func } : func,
        sync = _ref.sync,
        call = _ref.call;

    memo[helpername] = function () {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return function (dispatch, getState) {
        var index = args.length - 1;
        var callbackFn = args[index] instanceof Function ? args[index] : none;
        var helpersResult = (0, _fastApply2.default)(call, { getState: getState, dispatch: dispatch, actions: meta.actions }, args);
        var result = new Promise(function (resolve, reject) {
          var callback = function callback(err, data) {
            err ? reject(err) : resolve(data);
            callbackFn(err, data);
          };
          // If helper alias using async functionality
          if (helpersResult instanceof Function) {
            helpersResult(function (error) {
              var newArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

              if (error) {
                callback(error);
              } else {
                (0, _fastApply2.default)(sync ? fn.sync : fn, null, newArgs.concat(callback))(dispatch, getState);
              }
            });
          } else {
            // if helper alias is synchronous
            (0, _fastApply2.default)(sync ? fn.sync : fn, null, helpersResult.concat(callback))(dispatch, getState);
          }
        });
        result.catch(none);
        return result;
      };
    };
    return memo;
  };

  return Object.keys(helpers).reduce(function (memo, key) {
    return fnHelperCallback(memo, helpers[key], key, helpers);
  }, fn);
}