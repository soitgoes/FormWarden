var fieldsEntered = {};

(function ($) {
  $.fn.validation = function () {
    var args = Array.prototype.slice.call(arguments);

    if (args.length === 2 && args[0] === 'valid') {
      $(this).data('valid', args[1]);
      return;
    } else if (args.length === 2 && args[0] === 'invalid') {
      $(this).data('invalid', args[1]);
      return;
    }

    // This function converts functions which are in string form to function objects.
    // In essence, it deserializes a function.
    function funcDefine(args) {
      // Examine the validateion options.
      var validationOptions = args[0];
      for (var k in validationOptions.fields) {
        var factors = validationOptions.fields[k];
        // Try to find 'isValid' fields which are strings starting with a prefix of 'FUNCTION:'.
        factors.forEach(function (optionObj) {
          if (typeof optionObj.isValid === 'string' && optionObj.isValid.substring(0,9) === "FUNCTION:") {
            // Found one! Replace the string form with an actual function object.
            eval("optionObj.isValid = "+optionObj.isValid.substring(9));
          }
        });
      }
      // Return args after any/all chnages.
      return args;
    }
    // Invoke the above function.
    args = funcDefine(args);

    var log = function (message) {
      if (console && console.log) {
        console.log(message);
      }
    };

    var options = arguments[0] ? jQuery.extend({
      enableBlur: true,
      invalidClass: "invalid"
    }, arguments[0]) : {};

    var validationForm = this;

    var processErrors = function (result, fieldsEntered, submission) {
      var fieldName,
        parent,
        field,
        holder = "p,div",
        validationSummary = options.validationSummary ? $(options.validationSummary) : $(".validation_summary");

      validationSummary.html("");
      $("[name]", validationForm).parent().removeClass(options.invalidClass);
      $(".star").remove();

      for (fieldName in result.fields) {
        field = result.fields[fieldName];

         if ((submission || fieldsEntered && Object.prototype.hasOwnProperty.call(fieldsEntered, fieldName)) && field.valid === false) {
          var curField = $("[name='" + fieldName + "']", validationForm);
          parent = curField.parent();
          //parent.append("<strong class='star'>*</strong>");
          curField.attr("title", result.fields[fieldName].error.replace("*", ""));
          parent.addClass(options.invalidClass);
          validationSummary.append("<li>" + result.fields[fieldName].error.replace("*", "") + "</li>");
        }

      }
    }

    var processVisibility = function (results) {
      var fieldname;

      for (fieldname in results.fields) {
        var item = $("[name='" + fieldname + "']");
        if (results.fields[fieldname].visible) {
          item.parent('p, div, label').show();
          item.removeAttr('disabled');
        } else {
          item.parent('p, div, label').hide();
          item.attr('disabled', 'disabled');
        }
      }
    }


    if (this[0].tagName !== "FORM") {
      console.error("FormsWarden:: Selector must be a form element");
      return;
    }

    options.validators = options.validators || {};
    options.processErrors = options.processErrors ? options.processErrors : processErrors;
    options.processVisibility = options.processVisibility ? options.processVisibility : processVisibility;
    var getForm = function () {
      var form = {};

      $("[name]", validationForm).each(function (index, item) {
        var val = $(this).val();
        var name = item.name;
        var els;

        if (item.type == "radio") {
          if (!item.checked) {
            if (form[item.name]) {
              val = form[item.name];
            }else{
              val = "";
            }
          }else{
            val = $(this).val();
          }
        }

        if (item.type == "checkbox") {
          els = $("[name='" + name + "']:checked");
          if (els.length === 0) {
            val = "";
          } else {
            val = els.map(function () {
              return this.value;
            }).toArray();
          }
        }
        if (item.type == "select-multiple") {
          els = $("[name='" + name + "'] option:selected");
          if (els.length === 0) {
            val = "";
          } else {
            val = els.map(function () {
              return this.value;
            }).toArray();
          }
        }
        if (item.type == "select-one") {
          els = $("[name='" + name + "'] option:selected");
          if (els.length === 0) {
            val = "";
          } else {
            val = els.map(function () {
              return this.value;
            }).toArray()[0];
          }
        }
        if (val !== undefined){
          if (form[item.name] && val && !val.push) {
            if (form[item.name].push && val) {
              form[item.name].push(val);
            } else if (val){
              form[item.name] = [val];
            }
          }else{
            form[item.name] = val;
          }
        }
      });

      return form;
    };

    var validate = function (submission, e) {
      //get all the field value pairs
      var form = getForm();
      if (options.before) {
        options.before(form);
      }
      var results = fw.validateForm(form, options, fieldsEntered);

      options.processErrors(results, fieldsEntered, submission);
      options.processVisibility(results);
      if (options.after) {
        options.after(results.validForm, results, submission, e);
      }

      return results.validForm;
    };

    $(this).submit(function (e) {
      fieldsEntered = getForm();
      if (!validate(true, e)) {
        e.preventDefault();
        e.stopPropagation();

        if (typeof $(this).data('invalid') === 'function') {
          $(this).data('invalid')(e);
        }

        return false;
      }
      if (typeof $(this).data('valid') === 'function') {
        $(this).data('valid')(e);
      }
      if (options.beforeSubmit) {
        var result = options.beforeSubmit();
        if (result !== undefined && !result) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });

    if (options.enableBlur) {
      var updateFunction = function (e) {
        fieldsEntered[this.name] = true;
        return validate(false, e);
      };

      $("select[name]", validationForm).change(updateFunction);
      $("select multiple[name]", validationForm).change(updateFunction);
      $("[type='radio'][name]", validationForm).change(updateFunction);
      $("[type='checkbox'][name]", validationForm).click(function () {
        if (this.checked) {
          $(this).attr('checked', 'checked');
        } else {
          $(this).removeAttr('checked')
        }
        updateFunction();
      });
      $("[name]", validationForm).blur(function(){
        setTimeout(updateFunction.bind(this),300); //in order to accomodate date picker weirdness
      });
    }
    fieldsEntered = {};
  };
})(jQuery);
