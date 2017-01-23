'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pathvarsToKey;
function pathvarsToKey(pathvars) {
  var key = pathvars ? Object.keys(pathvars).sort(function (a, b) {
    return a > b;
  }).filter(function (key) {
    return pathvars[key];
  }).map(function (key) {
    return key + '_' + pathvars[key];
  }).join('_') : '';
  return key || 'default';
}
module.exports = exports['default'];