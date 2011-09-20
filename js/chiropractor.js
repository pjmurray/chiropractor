var chiropractor = (function () {


  var genericHandler, defaultStatus;


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
    options = options ? options : {};
      var handlerCallbacks = (options.error) ? _(options.error).defaults(genericHandler) : genericHandler;
      options.error = function (model, resp, options) {
        if (handlerCallbacks[resp.status] === undefined) {
          handlerCallbacks[defaultStatus](model, resp, options);
        } else {
          handlerCallbacks[resp.status](model, resp, options);
        }
      };
    return options;
  };


  return {
    init: function (defaults, defaultCode) {
      defaultStatus = defaultCode;
      genericHandler = defaults;
    },

    use: function (model) {
      var save = model.save;
      model.save = function (attrs, options) {
        var opts = buildOptions(options);
        save.call(model,attrs, opts);
      };
      var fetch = model.fetch;
      model.fetch = function (options) {
        fetch.call(model, buildOptions(options));
      }
    }
  }
})();