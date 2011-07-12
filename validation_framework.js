var fieldsEntered = {};
var isValidField = function (form, key, fieldOptions, validators){
   var value = form[key];
   
   for (var i = 0; i < fieldOptions.length; i++)
   {
    var validation = fieldOptions[i];

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
//if server side don't bother suppling fieldsEntered
var validateForm= function(form, validationOptions, fieldsEntered){

	var errors = {};
  var hasErrors = false;
	for (var key in validationOptions.fields){
    if (fieldsEntered === undefined || fieldsEntered[key] !== undefined){
      var result = isValidField(form, key, validationOptions.fields[key], validationOptions.validators);
      if (result){
        errors[key] =  result;  
        hasErrors = true;
      }  
    }		
	}
  return hasErrors ? errors : null;	
}

$(function(){	
	$.fn.validation = function() {
    var validationForm = this;

    var processErrors = function(errors){
      var validationSummary = $(".validation_summary",validationForm);     
      validationSummary.html("");
      $("[name]",validationForm).parents("p").removeClass("invalid");
      $("span.star").remove();
      for(var fieldname in errors){
        var parent = $("[name=" + fieldname + "]",validationForm).parents("p:first");
        parent.append("<span class='star'>*</span>");
        parent.addClass("invalid");

        // var field = $("[name=" + fieldname + "]",validationForm);
        // field.after("<span class='star'>*</span>");
        // field.parents("p:first").addClass("invalid");
        validationSummary.append("<li>"+ errors[fieldname]+"</li>");
      }     
    }

	  var log =  function (message){
		if (console && console.log){
			console.log(message);
		}
	  };
	  var options = arguments[0] ? jQuery.extend({enableBlur:true},arguments[0]) : {};
	  if (this[0].tagName !=="FORM"){
	  	alert("must be a form element");
	  }
	  var validators = {
      required: function(value){        
        return value.length || value !== "";
      },
		  email: function(value){return value.match(/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i);},
		  ssn: function(value){return value.match(/\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b/);},
      date: function(value){return value.match(/(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)[0-9]{2}/);},
      iso8601: function(value){return value.match(/^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/);}
      };
	  options.validators = options.validators ? jQuery.extend(validators, options.validators) : validators;
    options.processErrors = options.processErrors ? options.processErrors : processErrors;
	  var getForm = function(){
      var form = {};
      $("[name]",validationForm).not("[disabled]").filter(":visible").each(function(index, item){
        var val = $(this).val();
        var name = item.name;

        if(item.type == "radio")
        {
          if($("[name='"+name+"']:checked").length === 0) {
            val = "";
          }
        }

        if(item.type == "checkbox")
        {          
          var els = $("[name="+name+"]:checked");
          if(els.length === 0) {
            val = "";
          }else{
            val= els.map(function(){return this.value;}).toArray();
          }
        }

        if(item.type == "select-multiple")
        {          
          var els = $("[name="+name+"] option:selected");
          if(els.length === 0) {
            val = "";
          }else{
            val= els.map(function(){return this.value;}).toArray();
          }
        }

        form[item.name] = val;
      });
      return form;
    };

    var validate = function(e){
			//get all the field value pairs
      var form = getForm();
			var errors = validateForm(form, options, fieldsEntered);
      options.processErrors(errors);    
      if (errors){
        
        return false;
			}
      return true;
		};
		$(this).submit(function(){
      fieldsEntered  = getForm();
      return validate();
    });
		if (options.enableBlur){
      var updateFunction = function(){       
        fieldsEntered[this.name]= true;
        return validate();
      };

      $("select[name]", validationForm).change(updateFunction);
      $("select multiple[name]", validationForm).change(updateFunction);
      $("[type='radio'][name]", validationForm).change(updateFunction);
      $("[type='checkbox'][name]", validationForm).change(updateFunction);
			$("[name]", validationForm).blur(updateFunction);	       
		}		
	};	
});
