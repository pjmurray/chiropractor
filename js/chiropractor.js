var chiropractor = (function () {


  var genericHandler, defaultStatus;
  var allCodes;
  var unloading;

//  var errorCallbacks = {};
//  _(_(standardErrorHandlers).keys()).each(function (status) {
//    errorCallbacks[status] = function (model, resp, options) {
//      standardErrorHandlers[status](model, resp, options);
//      if (genericCallback) {
//        genericCallback(model, resp, options);
//      }
//    };
//  });


  var buildOptions = function (options) {

    if (options !== undefined) {
      var postHook = options.error || options['post_hook'];
      var preHook = options['pre_hook'];
    } else {
      options = {}
    }

    var specificHandler = {};

    _(allCodes).each(function (code) {
      specificHandler[code] = function () {
        if (preHook) {
          preHook();
        }
        options[code]();
        if (postHook) {
          postHook();
        }
      };
    });

    var handlerCallbacks = _(specificHandler).defaults(genericHandler);
    options.error = function (model, resp, options) {
      //For both no server connection and cancelled ajax request, the response will be the same. To handle this declare
//      A function for zero status similar to:
       var status = parseInt(resp.status);

      if (handlerCallbacks[status] === undefined || (status == 0 && !unloading)) {
        handlerCallbacks[defaultStatus](model, resp, options);

      } else if (status !== 0) {
        debugger
        handlerCallbacks[status](model, resp, options);
      }
    };
    console.log(handlerCallbacks)
    return options;
  };


  return {
    init: function (defaultCode, codes, defaults) {
      allCodes = codes;
      defaultStatus = defaultCode;
      genericHandler = defaults;

      $(window).live('beforeunload', function () {
        unloading = true;
      })
    },

    use: function (model) {
//      var view = this;
//      for (var name in view) {
//        if (view.hasOwnProperty(name)) {
//          view[name] = function () {
//            var _chiro = view.cid;
//          }
//        }
//      }

//      model._chiro = this.cid;
      var save = model.save;
      if (save) {
        model.save = function (attrs, options) {
          var opts = buildOptions(options);
          save.call(model, attrs, opts);
        };
      }
      var fetch = model.fetch;
      model.fetch = function (options) {
        fetch.call(model, buildOptions(options));
      }
    }
  }
})();