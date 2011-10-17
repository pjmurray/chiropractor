var chiropractor = (function () {


  var genericHandlers, defaultStatus;
  var allCodes;
  var unloading;


  var buildOptions = function (options) {

    if (options !== undefined) {
      var postHook = options.error || options['post_hook'];
      var preHook = options['pre_hook'];
    } else {
      options = {}
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
        console.log(handlerCallbacks)
        handlerCallbacks[defaultStatus](model, resp, options);

      } else if (status !== 0) {
        handlerCallbacks[status](model, resp, options);
      }
    };
    return options;
  };


  return {
    init: function (defaultCode, codes, defaults) {
      allCodes = codes;
      defaultStatus = defaultCode;
      genericHandlers = defaults;

      $(window).live('beforeunload', function () {
        unloading = true;
      })
    },

    use: function (object) {
      var save = object.save;
      if (save) {
        object.save = function (attrs, options) {
          var opts = buildOptions(options);
          save.call(object, attrs, opts);
        };
      }
      var fetch = object.fetch;
      object.fetch = function (options) {
        fetch.call(object, buildOptions(options));
      };

      var prepareModel = object._prepareModel;
      if(prepareModel) {
        object._prepareModel = function (model, options) {
          var newModel = prepareModel.call(object, model, options);
          chiropractor.use(newModel);
          return newModel;
        }
      }
    }
  }
})();