describe("Chiropractor", function () {


  describe("handler", function () {
    var model, view, errorCallback;

    function serverCall(subject, status) {
      var ajaxCall = spyOn(jQuery, 'ajax');

      subject();

      var params = ajaxCall.mostRecentCall.args[0];
      params.error({status: status.toString()});
    }

    describe("when things happen in order", function () {
      beforeEach(function () {
        errorCallback = jasmine.createSpy('500 error');
        chiropractor.init(500, [], {500: errorCallback});
        var Model = Backbone.Model.extend({
          initialize: function () {
          },
          url: function () {
            return "test"
          }
        });
        var View = Backbone.View.extend({
          initialize: function () {
            chiropractor.use(model);
          }
        });
        model = new Model();
        view = new View({model: model})
      });

      describe("default behaviour", function () {
        it("should default to 500", function () {
          serverCall(function () {
            model.save();
          }, 501);
          expect(errorCallback).toHaveBeenCalled();
        });
      });

      describe("generic behaviour", function () {
        it("should perform the provided behaviour", function () {

          serverCall(function () {
            model.save();
          }, 500);
          expect(errorCallback).toHaveBeenCalled();

        });
      });

//
      describe("specific behaviour", function () {
        var specificCallback;
        it("should override the defaults", function () {
          specificCallback = jasmine.createSpy('specific 500 error');
//
          serverCall(function () {
            model.save({}, {500: specificCallback});
          }, 500);

          expect(specificCallback).toHaveBeenCalled();
        });
      });
//    });
//
//    describe("default generic behaviour", function () {
//      var genericCallback;
//      it("should always get called", function () {
//        genericCallback = jasmine.createSpy('specific 500 error');
//
//        serverCall(function () {
//          model.save({}, {error: genericCallback});
//        }, 500);
//
//        expect(genericCallback).toHaveBeenCalled();
//      });
//    });
//
//    describe("when the init happens after the use call", function () {
//      it("should still work", function () {
//        errorCallback = jasmine.createSpy('500 error');
//
//        var Model = Backbone.Model.extend({
//          initialize: function () {
//            chiropractor.use(this);
//          },
//          url: function () {
//            return "test"
//          }
//        });
//        model = new Model();
//        chiropractor.init({500: errorCallback}, 500);
//        serverCall(function () {
//          model.save();
//        }, 500);
//        expect(errorCallback).toHaveBeenCalled();
//      });
//    });
//
//    describe("it should work with collections", function () {
//      var collection;
//      beforeEach(function () {
//        errorCallback = jasmine.createSpy('500 error');
//        chiropractor.init({500: errorCallback}, 500);
//        var Collection = Backbone.Collection.extend({
//          initialize: function () {
//            chiropractor.use(this);
//          },
//          url: function () {
//            return "test"
//          }
//        });
//        collection = new Collection();
//      });
//
//      describe("default behaviour", function () {
//
//        it("should default to 500", function () {
//          serverCall(function () {
//            collection.fetch();
//          }, 501);
//          expect(errorCallback).toHaveBeenCalled();
//        });
//
//
//        it("should work with create", function () {
//          serverCall(function () {
//            collection.create();
//          }, 501);
//          expect(errorCallback).toHaveBeenCalled();
//        })
//      });
//
//
//    });
////
////
////    describe("generic callback", function () {
////      var otherErrorCallback;
////
////      beforeEach(function () {
////        otherErrorCallback = jasmine.createSpy('unexpected error callback');
////      });
////      it("should get called on generic error handling", function () {
////        REA.helpers.errorHelper.handler({}, otherErrorCallback)({}, {status: 500});
////        expect(otherErrorCallback).toHaveBeenCalled();
////
////      });
////
////      it("should not called on specific error handling", function () {
////        REA.helpers.errorHelper.handler({500: function () {
////        }}, otherErrorCallback)({}, {status: 500});
////        expect(otherErrorCallback).not.toHaveBeenCalled();
////      });
    });
  });
});