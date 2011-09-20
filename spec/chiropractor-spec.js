describe("Chiropractor", function () {


  describe("handler", function () {
    var model, errorCallback;

    function serverCall(subject, status) {
      var ajaxCall = spyOn(jQuery, 'ajax');

      subject();

      var params = ajaxCall.mostRecentCall.args[0];
      params.error(model, {status: status.toString()});
    }

    describe("when things happen in order", function () {
      beforeEach(function () {
        errorCallback = jasmine.createSpy('500 error');
        chiropractor.init({500: errorCallback}, 500);
        var Model = Backbone.Model.extend({
          initialize: function () {
            chiropractor.use(this);
          },
          url: function () {
            return "test"
          }
        });
        model = new Model();
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


      describe("specific behaviour", function () {
        var specificCallback;
        it("should override the defaults", function () {
          specificCallback = jasmine.createSpy('specific 500 error');

          serverCall(function () {
            model.save({}, {error: {500: specificCallback}});
          }, 500);

          expect(specificCallback).toHaveBeenCalled();
        });
      });
    });
    describe("when the init happens after the use call", function () {
      it("should still work", function () {
        errorCallback = jasmine.createSpy('500 error');

        var Model = Backbone.Model.extend({
          initialize: function () {
            chiropractor.use(this);
          },
          url: function () {
            return "test"
          }
        });
        model = new Model();
        chiropractor.init({500: errorCallback}, 500);
        serverCall(function () {
          model.save();
        }, 500);
        expect(errorCallback).toHaveBeenCalled();
      });
    });
//
//
//    describe("generic callback", function () {
//      var otherErrorCallback;
//
//      beforeEach(function () {
//        otherErrorCallback = jasmine.createSpy('unexpected error callback');
//      });
//      it("should get called on generic error handling", function () {
//        REA.helpers.errorHelper.handler({}, otherErrorCallback)({}, {status: 500});
//        expect(otherErrorCallback).toHaveBeenCalled();
//
//      });
//
//      it("should not called on specific error handling", function () {
//        REA.helpers.errorHelper.handler({500: function () {
//        }}, otherErrorCallback)({}, {status: 500});
//        expect(otherErrorCallback).not.toHaveBeenCalled();
//      });
//    });
  });
});