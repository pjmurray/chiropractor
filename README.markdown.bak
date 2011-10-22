# Chiropractor.js

### Error Handling made easier for Backbone.js
====================

Chiropractor aims to aleviate the pains of handling different error status codes.

Usage
---------------------

Chiropractor is based on the concept that in general there is generic behaviour for different error codes.

For example, you may want to display a page not found for a 404, a server error page for a 500 etc.

It still, however, recognises that certain server calls will require specific behaviour and as such allows you to define
these handlers at the time the server call is made (i.e. model.save())

##Generic handlers
---------------------

To get started, include the file and then somewhere in your application:

```javascript
chriopractor.init(
  <default_error_handler>,
  <array_of_codes_to_handle>,
  <object_of_generic_error_handlers>
);
```

e.g.

```javascript
chiropractor.init(
    500,
    [404, 420, 500],
    {
      404: function (model, resp, options) {
        //Do Something
      },
      500: function (model, resp, options) {
        //Do Something else
      }
    }
);
```

##Initializing your Models & Collections
---------------------

Somewhere, just call:

```javascript
chiropractor.use(model);
```

It is my opinion that this should be done in the View, however this can be done in the model too.
Please see known issue below.

##Specific Handlers
---------------------

Now, when you make a server call, you can pass an the different behaviours you require, depending on the status code.

For example:

```javascript
model.save({}, {
  success: function () {
    //Do standard success callback
  },
  420: function () {
    //Do something specific
  }
});
```

Specific handlers (i.e. those declared at the point of the server call) will be called instead of
any default behaviour declared in the chiropractor.init.

###Pre & Post Hooks
---------------------

If you still require specific behaviour for that model/collection, but you want to use the default behaviour
declared in the chiropractor.init, you have the option to pass in pre/post hooks.

Prehooks are defined as follows:

```javascript
model.save({}, {
  pre_hook: function () {
    //Do something before a generic handler
  }
});
```

And post_hooks are either:

```javascript
model.save({}, {
  post_hook: function () {
    //Do something after a generic handler
  }
});
```

or:

```javascript
model.save({}, {
  error: function () {
    //Do something before a generic handler
  }
});
```

Note: dont try both. Currently Error will take precendance. Pre & Post hooks will not be called for specific handlers


Currently Supported Methods
---------------------

Models

* save
* fetch

Collections

* fetch
* create (will automatically crate chiropractor models)


Known Issues
---------------------

Any model told to use chiropractor will always use chiropractor from then on. This means that
even if chiropractor.use(model) is called in a view, it will still be a chiropractor model if passed
into other views.