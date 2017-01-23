"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PubSub = function () {
  function PubSub() {
    _classCallCheck(this, PubSub);

    this.container = [];
  }

  _createClass(PubSub, [{
    key: "push",
    value: function push(cb) {
      cb instanceof Function && this.container.push(cb);
    }
  }, {
    key: "resolve",
    value: function resolve(data) {
      this.container.forEach(function (cb) {
        return cb(null, data);
      });
      this.container = [];
    }
  }, {
    key: "reject",
    value: function reject(err) {
      this.container.forEach(function (cb) {
        return cb(err);
      });
      this.container = [];
    }
  }]);

  return PubSub;
}();

exports.default = PubSub;
module.exports = exports["default"];