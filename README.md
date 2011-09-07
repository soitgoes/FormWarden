# Features

Currently Form Warden does all these things.

* Decoupled form validation from the UI library
* Allows easy overriding of processErrors
* Regex support
* Work in all browsers >IE6, FF, Chrome, Safari

# Example

Add your script references

    <script src="jquery-1.6.1.min.js" type="text/javascript"></script>
    <script src="jquery.formwarden.min.js" type="text/javascript"></script>

Place an additional script tag just inside of the close body tag.

    <script>
        $(function(){
         var validationOptions= 
            {
              fields:{

                "email":[{isValid:"required", message:"Email is required"},
                          {isValid:"email", message:"Email must be valid"}],

                "firstName":[{isValid: "required", message: "First Name is required"},
                              {isValid:function(value, form){ return value.length < 25; }, message:"First Name must be less than 25 characters"}],
              }
            };
        $("form").validation(validationOptions);
      });
    </script>

For more advanced examples, such as defining your own validator or overriding the processErrors behavor check out validation_only.html and validation_and_visibility.html.

# The MIT License (MIT)
Copyright (c) 2011 Whiteboard-IT, LCC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.