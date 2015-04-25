'use strict';
let _ = require('lodash');
let createStatement = require('../statement');

module.exports = function create(target, properties) {
  return createStatement(_.merge({ id: target.id.toString() }, properties || {}));
};