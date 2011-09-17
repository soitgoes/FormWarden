var fieldsEntered = {};

(function($) {
    $.fn.validation = function() {
        var args = Array.prototype.slice.call(arguments);

        if (args.length === 2 && args[0] === 'valid') {
            $(this).data('valid', args[1]);
            return;
        } else if (args.length === 2 && args[0] === 'invalid') {
            $(this).data('invalid', args[1]);
            return;
        }

        var validationForm = this;

        var processErrors = function(result, fieldsEntered) {
                var fieldName, parent, field, validationSummary = $(".validation_summary", validationForm);
                var holder = "p,div"
                validationSummary.html("");
                $("[name]", validationForm).parent().removeClass("invalid");
                $(".star").remove();

                for (fieldName in result.fields) {
                    field = result.fields[fieldName];

                    if (Object.prototype.hasOwnProperty.call(fieldsEntered, fieldName) && field.valid === false) {
                        var curField = $("[name=" + fieldName + "]", validationForm);
                        parent = curField.parent();
                        //parent.append("<strong class='star'>*</strong>");
                        curField.attr("title", result.fields[fieldName].error.replace("*", ""));
                        parent.addClass("invalid");
                        validationSummary.append("<li>" + result.fields[fieldName].error.replace("*", "") + "</li>");
                    }

                }
            }

        var processVisibility = function(results) {
                var fieldname;

                for (fieldname in results.fields) {
                    var item = $("[name=" + fieldname + "]");
                    if (results.fields[fieldname].visible) {
                        item.parent('p, div, label').show();
                        item.removeAttr('disabled');
                    } else {
                        item.parent('p, div, label').hide();
                        item.attr('disabled', 'disabled');
                    }
                }
            }

        var log = function(message) {
                if (console && console.log) {
                    console.log(message);
                }
            };

        var options = arguments[0] ? jQuery.extend({
            enableBlur: true
        }, arguments[0]) : {};

        if (this[0].tagName !== "FORM") {
            alert("must be a form element");
            return;
        }

        options.validators = options.validators || {};
        options.processErrors = options.processErrors ? options.processErrors : processErrors;
        options.processVisibility = options.processVisibility ? options.processVisibility : processVisibility;
        var getForm = function() {
                var form = {};

                $("[name]", validationForm).each(function(index, item) {
                    var val = $(this).val();
                    var name = item.name;
                    var els;

                    if (item.type == "radio") {
                        if ($("[name='" + name + "']:checked").length === 0) {
                            val = "";
                        }
                    }

                    if (item.type == "checkbox") {
                        els = $("[name=" + name + "]:checked");
                        if (els.length === 0) {
                            val = "";
                        } else {
                            val = els.map(function() {
                                return this.value;
                            }).toArray();
                        }
                    }

                    if (item.type == "select-multiple") {
                        els = $("[name=" + name + "] option:selected");
                        if (els.length === 0) {
                            val = "";
                        } else {
                            val = els.map(function() {
                                return this.value;
                            }).toArray();
                        }
                    }

                    form[item.name] = val;
                });

                return form;
            };

        var validate = function(e) {
                //get all the field value pairs
                var form = getForm();
                var results = validateForm(form, options, fieldsEntered);
                options.processErrors(results, fieldsEntered);
                options.processVisibility(results);

                return results.validForm;
            };

        $(this).submit(function(e) {
            fieldsEntered = getForm();
            if (!validate()) {
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
        });

        if (options.enableBlur) {
            var updateFunction = function() {
                    fieldsEntered[this.name] = true;
                    return validate();
                };

            $("select[name]", validationForm).change(updateFunction);
            $("select multiple[name]", validationForm).change(updateFunction);
            $("[type='radio'][name]", validationForm).change(updateFunction);
            $("[type='checkbox'][name]", validationForm).change(updateFunction);
            $("[name]", validationForm).blur(updateFunction);
        }
        fieldsEntered = {};
        validate();
    };
})(jQuery);