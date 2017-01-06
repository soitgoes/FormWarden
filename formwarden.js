(function (definition) {

  // This file will function properly as a <script> tag, or a module
  // using CommonJS and NodeJS or RequireJS module formats.  In
  // Common/Node/RequireJS, the module exports the Q API and when
  // executed as a simple <script>, it creates a Q global instead.

  // RequireJS
  if (typeof define === "function") {
    define(definition);
    // CommonJS
  } else if (typeof exports === "object") {
    definition(require, exports);
    // <script>
  } else {
    definition(void 0, fw = {});
  }

})(function (serverSideRequire, exports) {

  var path = !serverSideRequire ? null : serverSideRequire('path'),
    fs = !serverSideRequire ? null : serverSideRequire('fs');

  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var nativeForEach = Array.prototype.forEach;
  var slice = Array.prototype.slice;

  /* Taken from Underscore.js */

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  var each = function (obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Extend a given object with all the properties in passed-in object(s).
  var extend = function (obj) {
    each(slice.call(arguments, 1), function (source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };
  /* End Taken from Underscore.js */

  var defaultValidators = {
    required: function (value) {
      if (value === undefined || value === null) {
        return true;
      }
      return value.length || value !== "";
    },
    email: function (value) {
      if (value) {
        return value.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i);
      }
      return true;
    },
    ssn: function (value) {
      if (value) {
        return value.match(/\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b/);
      }
      return true;
    },
    date: function(value){
     if(value){
        if (moment){
          return moment(value).isValid()
        }
        return value.match(/(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)[0-9]{2}/);
     }
    },
    iso8601: function (value) {
      if (value) {
        return value.match(/^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/);
      }
      return true;
    },
    maxLength: function (value, form, validation) {
      if (value) {
        return value.length <= validation.length;
      }
      return true;
    },
    minLength: function (value, form, validation) {
      if (value) {
        return value.length >= validation.length;
      }
      return true;
    }
  };

  var isInvalidField = function (form, key, fieldOptions, validators, conventionBased) {
    if (!fieldOptions) {
      return true;
    }
    var value = form[key];
    var checkVisibility = fieldOptions.push ? false : true;
    // If there is not a visibility function or it is true then execute the validation.
    var validations = checkVisibility ? fieldOptions.validations : fieldOptions;

    var serverSide = typeof window === 'undefined';

    for (var i = 0; i < validations.length; i++) {
      var validation = validations[i];

      if (serverSide && validation.clientOnly) continue;

      if (typeof validation.isValid == "function") {
        if (!validation.isValid(value, form)) {
          return validation.message || key + " is invalid";
        }
      }else{
        if (validation.isValid.test) { // regex
          var pattern = validation.isValid;
          if (!pattern.test(value)) {
            return validation.message || key + " is invalid";
          }
        } else {
          var validFx = validators[validation.isValid];
          if (validFx) {
            if (!validFx(value, form, validation)) {
              if (validation.invalid) {
                validation.invalid();
              }
              return validation.message || key + " is invalid";
            } else {
              if (validation.valid) {
                validation.valid();
              }
            }
          } else {
            console.log("Validation Function not found: " + validation.isValid)
          }
        }
      }
    }
    return "";
  }
  var isVisibleField = function (form, fieldOptions) {
    if (fieldOptions && fieldOptions.isVisible && typeof fieldOptions.isVisible == "function" && !fieldOptions.isVisible(form)) {
      return false;
    }
    return true;
  }
  // If server side don't bother supplying fieldsEntered.
  exports.validateForm = function (form, validationOptions) {
    var fields = {};
    var validForm = true;
    var validators = extend(defaultValidators, validationOptions.validators || {});

    each(validationOptions.fields, function (val, key) {
      var visible = isVisibleField(form, val),
        mesg = isInvalidField(form, key, val, validators, validationOptions.conventionBased),
        valid = (!visible) || (visible && mesg === ""),
        result;

      validForm &= valid;

      result = {
        visible: visible,
        error: mesg,
        valid: !!valid
      };

      if (result) {
        fields[key] = result;
      }
    });

    each(form, function (val, key) {
      // Form fields that have no validators are visible and valid
      if (validationOptions.conventionBased) {
        // Loop through all of the validators if any of them partial match then execute them and return.
        if (val != "") {
          for (var vkey in validators) {
            if (key.indexOf(vkey) > -1) {
              var valid = !!validators[vkey](val, form);
              var mesg = valid ? "" : validators[vkey].message || key + " is invalid";
              fields[key] = {
                visible: true,
                error: mesg,
                valid: valid
              };
              validForm &= valid;
            }
          }
        }
      }
      if (!hasOwnProperty.call(fields, key)) {
        fields[key] = {
          visible: true,
          error: "",
          valid: true
        };
      }
    });

    return {
      fields: fields,
      validForm: !!validForm
    };
  }

  exports.getFormWardenScriptContents = function () {
    if (!path || !fs) {
      console.log('This is not supported as a client side function.')
      return;
    }
    var formWardenFilePath = path.join(__dirname, 'formwarden.js');
    return fs.readFileSync(formWardenFilePath, 'utf8')
  }

  exports.getJqueryFormWardenScriptContents = function () {
    if (!path || !fs) {
      console.log('This is not supported as a client side function.')
      return;
    }
    var jqueryFormWardenFilePath = path.join(__dirname, 'jquery.formwarden.js');
    return fs.readFileSync(jqueryFormWardenFilePath, 'utf8')
  }

});
