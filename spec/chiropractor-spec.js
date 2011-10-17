describe("Chiropractor", function () {

  function serverCall(subject, status) {
    var ajaxCall = spyOn(jQuery, 'ajax');

    subject();

    var params = ajaxCall.mostRecentCall.args[0];
    params.error({status: status.toString()});
  }

  describe("models", function () {
    var model, view, errorCallback;

    describe("when things happen in order", function () {

      beforeEach(function () {
        errorCallback = jasmine.createSpy('generic 500 error');
        chiropractor.init(500, [500], {500: errorCallback});
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

      describe("default generic behaviour", function () {
        var genericCallback;
        it("should always get called", function () {
          genericCallback = jasmine.createSpy('generic post error function');

          serverCall(function () {
            model.save({}, {error: genericCallback});
          }, 500);

          expect(genericCallback).toHaveBeenCalled();
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
        chiropractor.init(500, [500], {500: errorCallback});
        serverCall(function () {
          model.save();
        }, 500);
        expect(errorCallback).toHaveBeenCalled();
      });
    });
  });

  describe("collections", function () {
    var collection;
    beforeEach(function () {
      errorCallback = jasmine.createSpy('500 error');
      chiropractor.init(500, [500], {500: errorCallback});
      var Collection = Backbone.Collection.extend({
        initialize: function () {
          chiropractor.use(this);
        },
        url: function () {
          return "test"
        }
      });
      collection = new Collection();
    });


    it("should default to 500", function () {
      serverCall(function () {
        collection.fetch();
      }, 501);
      expect(errorCallback).toHaveBeenCalled();
    });


    it("should work with create when not passed an existing backbone model", function () {
      serverCall(function () {
        collection.create({});
      }, 501);
      expect(errorCallback).toHaveBeenCalled();
    });

  });
});