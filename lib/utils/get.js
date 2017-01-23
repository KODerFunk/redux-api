"use strict";

/* eslint no-void: 0 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (obj) {
  for (var _len = arguments.length, path = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    path[_key - 1] = arguments[_key];
  }

  return path.reduce(function (memo, name) {
    return isEmpty(name) ? memo : memo && memo[name];
  }, obj);
};

function isEmpty(name) {
  return name === "" || name === null || name === void 0;
}

module.exports = exports["default"];