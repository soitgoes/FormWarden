
var nativeForEach = Array.prototype.forEach;
var slice         = Array.prototype.slice;

/* Taken from Underscore.js */

// Establish the object that gets returned to break out of a loop iteration.
var breaker = {};

var each = function(obj, iterator, context) {
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
var extend = function(obj) {
  each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (source[prop] !== void 0) obj[prop] = source[prop];
    }
  });
  return obj;
};
/* End Taken from Underscore.js */

var defaultValidators = {
  required: function(value){        
    return value.length || value !== "";
  },
  email: function(value){return value.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i);},
  ssn: function(value){return value.match(/\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b/);},
  date: function(value){return value.match(/(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)[0-9]{2}/);},
  iso8601: function(value){return value.match(/^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/);}
};

var isInvalidField = function (form, key, fieldOptions, validators){
   if (!fieldOptions){
     return true;
   }
   var value = form[key];
   var checkVisibility  = fieldOptions.push ? false : true; //if there is 
      //if there is not a visibility function or it is true then execute the validation
   var validations = checkVisibility  ? fieldOptions.validations : fieldOptions;
   for (var i = 0; i < validations.length; i++)
   {
    var validation = validations[i];
    if (validation.isValid.test){ //regex
      var pattern = validation.isValid;
      if (!pattern.test(value)){
        return validation.message || key + " is invalid"; 
      }
     }else if (typeof validation.isValid == "function" ){
      if (!validation.isValid(value, form)){
        return validation.message || key + " is invalid";
      }   
     }else{
        var validFx = validators[validation.isValid];
        if (validFx){
          if (!validFx(value, form)){
            return validation.message || key + " is invalid";
          }
        }else{
          alert("Validation Function not found: " + validation.isValid)
        }
     }
   }
   return "";
}
var isVisibleField = function(form, fieldOptions){
  if (fieldOptions && fieldOptions.isVisible && typeof fieldOptions.isVisible == "function" && !fieldOptions.isVisible(form)){
     return false;
  }
  return true;
}
//if server side don't bother suppling fieldsEntered
var validateForm= function(form, validationOptions){
  var fields = {};
  var validForm = true;
  for (var key in form){
    if (validationOptions.fields[key]){     
      var field =  validationOptions.fields[key];
      var visible = isVisibleField(form, field);
      var mesg = isInvalidField(form, key, field, extend(defaultValidators, validationOptions.validators));
      var valid = (!visible) || (visible && mesg === "");
      validForm &= valid;
      var result ={visible: visible, error: mesg, valid: !!valid};
      if (result){
        fields[key] =  result;  
      }  
    }else{
      fields[key] = {visible: true, error:"", valid:true};
    }   
  }
  return {fields:fields, validForm:!!validForm};  
}