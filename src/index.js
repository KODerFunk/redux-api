"use strict";

/* eslint no-void: 0 */

import libUrl from "url";
import reducerFn from "./reducerFn";
import actionFn from "./actionFn";
import transformers from "./transformers";
import async from "./async";
import pathvarsToKey from "./pathvarsToKey";

/**
 * Default configuration for each endpoint
 * @type {Object}
 */
const defaultEndpointConfig = {
  transformer: transformers.object
};

const PREFIX = "@@redux-api";
/**
 * Entry api point
 * @param {Object} config Rest api configuration
 * @param {Object} baseConfig baseConfig settings for Rest api
 * @param {Function} fetch Adapter for rest requests
 * @param {Boolean} isServer false by default (fif you want to use it for isomorphic apps)
 * @return {actions, reducers}        { actions, reducers}
 * @example ```js
 *   const api = reduxApi({
 *     test: "/plain/url",
 *     testItem: "/plain/url/:id",
 *     testModify: {
 *       url: "/plain/url/:endpoint",

 *       transformer: (data)=> !data ?
 *          { title: "", message: "" } :
 *          { title: data.title, message: data.message },
 *       options: {
 *         method: "post"
 *         headers: {
 *           "Accept": "application/json",
 *           "Content-Type": "application/json"
 *         }
 *       }
 *     }
 *   });
 *   // register reducers
 *
 *   // call actions
 *   dispatch(api.actions.test());
 *   dispatch(api.actions.testItem({id: 1}));
 *   dispatch(api.actions.testModify({endpoint: "upload-1"}, {
 *     body: JSON.stringify({title: "Hello", message: "World"})
 *   }));
 * ```
 */

export default function reduxApi(config, baseConfig) {
  config || (config = {});

  const fetchHolder = {
    fetch: null,
    server: false,
    rootUrl: null,
    middlewareParser: null,
    options: {},
    responseHandler: null
  };

  const cfg = {
    use(key, value) {
      if (key === "rootUrl") {
        value && (fetchHolder[key] = libUrl.parse(value));
      } else {
        fetchHolder[key] = value;
      }

      return this;
    },
    init(fetch, isServer=false, rootUrl) {
      /* eslint no-console: 0 */
      console.warn("Deprecated method, use `use` method");
      this.use("fetch", fetch);
      this.use("server", isServer);
      this.use("rootUrl", rootUrl);
      return this;
    },
    cachedState: {},
    createInitialState: {},
    actions: {},
    reducers: {},
    events: {}
  };
  function fnConfigCallback(memo, value, key) {
    const opts = typeof value === "object" ?
      { ...defaultEndpointConfig, reducerName: key, ...value } :
      { ...defaultEndpointConfig, reducerName: key, url: value };

    if (opts.broadcast !== (void 0)) {
      /* eslint no-console: 0 */
      console.warn("Deprecated `broadcast` option. you shoud use `events`" +
      "to catch redux-api events (see https://github.com/lexich/redux-api/blob/master/DOCS.md#Events)");
    }

    const {
      url, urlOptions, options, transformer, broadcast, crud,
      reducerName, prefetch, postfetch, validation, helpers,
    } = opts;

    const prefix = (baseConfig && baseConfig.prefix) || "";

    const ACTIONS = {
      actionFetch: `${PREFIX}@${prefix}${reducerName}`,
      actionSuccess: `${PREFIX}@${prefix}${reducerName}_success`,
      actionFail: `${PREFIX}@${prefix}${reducerName}_fail`,
      actionReset: `${PREFIX}@${prefix}${reducerName}_delete`
    };

    const meta = {
      urlOptions,
      fetch: opts.fetch ? opts.fetch : function(...args) {
        return fetchHolder.fetch.apply(this, args);
      },
      holder: fetchHolder,
      broadcast,
      virtual: !!opts.virtual,
      cached: !!opts.cached,
      reducerName,
      actions: memo.actions,
      prefetch,
      postfetch,
      validation,
      helpers,
      transformer,
      prefix,
      crud
    };

    memo.actions[key] = actionFn(url, key, options, ACTIONS, meta);

    if (!meta.virtual && !memo.reducers[reducerName]) {
      const createInitialState = () => ({
        sync: false,
        syncing: false,
        loading: false,
        data: transformer()
      });
      memo.createInitialState[reducerName] = createInitialState;
      if (opts.cached) {
        memo.cachedState[reducerName] = (entryState, pathvars) => {
          return entryState[pathvarsToKey(pathvars)];
        };
      }
      const initialState = createInitialState();
      const reducer = opts.reducer ? opts.reducer.bind(memo) : null;
      memo.reducers[reducerName] = reducerFn(initialState, ACTIONS, reducer, opts.cached);
    }
    memo.events[reducerName] = ACTIONS;
    return memo;
  }

  return Object.keys(config).reduce(
    (memo, key) => fnConfigCallback(memo, config[key], key), cfg);
}

reduxApi.transformers = transformers;
reduxApi.async = async;
