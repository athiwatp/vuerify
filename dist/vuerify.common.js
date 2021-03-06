'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var objectAssign = _interopDefault(require('object-assign'));

var RULES = {
  email: {
    test: /.+@.+\..+/,
    message: '邮箱格式错误'
  },
  required: {
    test: /\S+$/,
    message: '必填项'
  },
  url: {
    test: /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[:?\d]*)\S*$/,
    message: 'URL 格式错误'
  }
}

/**
 * check value type
 * @param  {String}  type
 * @param  {*}  val
 * @return {Boolean}
 */
function is (type, val) {
  return Object.prototype.toString.call(val) === ("[object " + type + "]")
}

var Vue

function check (rule, field, value, isArray) {
  var this$1 = this;

  if (Array.isArray(rule)) {
    return rule.map(function (item) { return check.call(this$1, item, field, value, true); }
      ).indexOf(false) === -1
  }

  var $rules = this.$vuerify.$rules
  var $errors = this.$vuerify.$errors
  var regex = is('String', rule)
    ? $rules[rule]
    : (is('String', rule.test) ? $rules[rule.test] : rule)

  if (!regex || !regex.test) {
    console.warn('[vuerify] rule does not exist: ' + (rule.test || rule))
    return
  }
  regex.message = rule.message || regex.message

  var valid = is('Function', regex.test)
    ? regex.test.call(this, value)
    : regex.test.test(value)

  if (!isArray) {
    var oldError = $errors[field]

    if (valid) {
      Vue.delete($errors, field)
    } else if (!oldError) {
      $errors[field] = regex.message
    }
  } else {
    var error = $errors[field] || []
    var oldError$1 = error.indexOf(regex.message)

    if (valid) {
      oldError$1 > -1 && error.splice(oldError$1, 1)
      if (!error.length) { Vue.delete($errors, field) }
    } else if (oldError$1 < 0) {
      error.push(regex.message)
      Vue.set($errors, field, error)
    }
  }

  var hasError = Boolean(Object.keys($errors).length)

  this.$vuerify.valid = !hasError
  this.$vuerify.invalid = hasError

  return valid
}

function init () {
  var this$1 = this;

  var rules = this.$options.vuerify

  /* istanbul ignore next */
  if (!rules) { return }

  this.$vuerify = new Vuerify(this)
  Object.keys(rules).forEach(function (field) { return this$1.$watch(field, function (value) { return check.call(this$1, rules[field], field, value); }); }
  )
}

var Vuerify = function (_vm) {
  this.vm = _vm
}

Vuerify.prototype.check = function (fields) {
  var vm = this.vm
  var rules = vm.$options.vuerify

  fields = fields || Object.keys(rules)

  return fields.map(function (field) { return check.call(vm, rules[field], field, vm._data[field]); }
  ).indexOf(false) === -1
}

Vuerify.prototype.clear = function () {
  this.$errors = {}
  return this
}

var vuerifyInit = function (_Vue, opts) {
  Vue = _Vue
  Vuerify.prototype.$rules = objectAssign({}, RULES, opts)
  Vue.util.defineReactive(Vuerify.prototype, '$errors', {})
  Vue.util.defineReactive(Vuerify.prototype, 'invalid', true)
  Vue.util.defineReactive(Vuerify.prototype, 'valid', false)
  Vue.mixin({ created: init })
}

function install (Vue, opts) {
  vuerifyInit(Vue, opts)
}

/* istanbul ignore next */
if (typeof window !== 'undefined' && window.Vue) {
  if (!install.installed) { install(window.Vue) }
}

module.exports = install;
