
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
      var mesg = isInvalidField(form, key, field, validationOptions.validators);
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