var chiropractor = (function () {


  var genericHandlers, defaultStatus;
  var allCodes;
  var unloading;

  var setVariables = function (args) {
    defaultStatus = args[0];
    allCodes = args[1];
    genericHandlers = args[2];
  };

  var apply = function (object) {
    _(['save', 'destroy', 'fetch']).each(function (method) {
      wrapError(object, method);
    });
  };

  var wrapError = function (object, method) {
    if (object[method]) {
      var clone;
      clone = object[method];
      object[method] = function (attrs, options) {
        var opts = buildOptions(options);
        var args = {
          'save': [attrs, opts],
          'fetch': [opts],
          'destroy': [opts]
        };
        clone.apply(this, args[method]);
      };
    }
  };

   var buildOptions = function (options) {
    if (options !== undefined) {
      var override = options.error;
      var postHook = options['post_error'];
      var preHook = options['pre_error'];
    } else {
      options = {}
    }
     if (override) {
       return options
     }

    var specificHandler = {};

    _(allCodes).each(function (code) {
      if (options[code] !== undefined) {
        specificHandler[code] = options[code];
      }
    });

    var wrappedGenericHandlers = {};
    _(_(genericHandlers).keys()).each(function (code) {
      wrappedGenericHandlers[code] = function (model, resp, options) {
        if (preHook) {
          preHook(model, resp, options);
        }
        genericHandlers[code](model, resp, options);
        if (postHook) {
          postHook(model, resp, options);
        }

      }
    });

    var handlerCallbacks = _(specificHandler).defaults(wrappedGenericHandlers);
    options.error = function (model, resp, options) {
      //For both no server connection and cancelled ajax request, the response will be the same. To handle this declare
//      A function for zero status similar to:
      var status = parseInt(resp.status);

      if (handlerCallbacks[status] === undefined || (status == 0 && !unloading)) {
          handlerCallbacks[defaultStatus](model, resp, options);

      } else if (status !== 0) {
        handlerCallbacks[status](model, resp, options);
      }
    };
    return options;
  };

  var bindUnloadNuance = function () {
    $(window).live('beforeunload', function () {
      unloading = true;
    })
  };

  return {
    all: function () {
      setVariables(arguments);
      apply(Backbone.Model.prototype);
      apply(Backbone.Collection.prototype);
      bindUnloadNuance();
    },

    each: function () {
      setVariables(arguments);
      bindUnloadNuance();
    },

    use: function (object) {
      apply(object);
    },

    explicit: function () {

    }
  }
})();