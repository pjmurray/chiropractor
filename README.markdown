Chiropractor.js
====================

Error Handling made easier for Backbone.js
---------------------

Chiropractor aims to aleviate the pains of handling different error status codes.

### Usage
====================

Generic handlers
---------------------

To get started, include the file and then somewhere in your application:

`chriopractor.init(<default_error_handler>, <array_of_codes_to_handle>, <object_of_generic_error_handlers>)`

For example:

`chiropractor.init(
    500,
    [404, 420, 500],
    {
      404: function (model, resp, options) {
        //Do Something
      },
      500: function (model, resp, options) {
        //Do Something else
      }
    }`

Initializing your Models & Collections
---------------------

Somewhere, just call:

`chiropractor.use(model)`

It is my opinion that this should be done in the View, however this can be done in the model too.
Please see known issue below.

Specific Handlers
---------------------

Now, when you make a server call, you can pass an the different behaviours you require, depending on the status code.

For example:

`
model.save({}, {
  success: function () {
    //Do standard success callback
  },
  420: function () {
    //Do something specific
  }
});
`

Specific handlers (i.e. those declared at the point of the server call) will be called instead of
any default behaviour declared in the chiropractor.init.

Pre & Post Hooks
---------------------

If you still require specific behaviour for that model/collection, but you want to use the default behaviour
declared in the initalize, you have the option to pass in pre/post hooks

Prehooks are defined as follows:

`
model.save({}, {
  pre_hook: function () {
    //Do something before a generic handler
  }
});
`

And post_hooks are either:

`
model.save({}, {
  post_hook: function () {
    //Do something before a generic handler
  }
});
`


`
model.save({}, {
  error: function () {
    //Do something before a generic handler
  }
});
`

Note: dont try both. Currently Error will take precendance. Pre & Post hooks will not be called for specific handlers


Currently Supported Methods
---------------------

Known Issues
---------------------

Any model told to use chiropractor will always use chiropractor from then on. This means that
even if chiropractor.use(model) is called in a view, it will still be a chiropractor model if passed
into other views.