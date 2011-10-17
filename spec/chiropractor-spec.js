describe("Chiropractor", function () {

  function serverCall(subject, status) {
    var ajaxCall = spyOn(jQuery, 'ajax');

    subject();

    var params = ajaxCall.mostRecentCall.args[0];
    params.error({status: status.toString()});
  }

  describe("when initialized with chiro.use", function () {
    describe("models", function () {
      var model, view, errorCallback, differentErrorCallback;

      describe("when things happen in order", function () {

        beforeEach(function () {
          errorCallback = jasmine.createSpy('generic 500 error');
          differentErrorCallback = jasmine.createSpy('generic 404 error');
          chiropractor.init(
              500, //default status code
              [404, 420, 500], //all accepted codes
              {
                500: errorCallback, //generic error handling functions
                404: differentErrorCallback
              }
          );
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
          it("should default to what it is initialized with", function () {
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
          it("should work with any status code", function () {

            serverCall(function () {
              model.save();
            }, 404);
            expect(differentErrorCallback).toHaveBeenCalled();

          });
        });

        describe("specific behaviour", function () {
          var specificCallback;
          it("should override the defaults", function () {
            specificCallback = jasmine.createSpy('specific 500 error');
            serverCall(function () {
              model.save({}, {500: specificCallback});
            }, 500);

            expect(specificCallback).toHaveBeenCalled();
          });

          it("should call the right function", function () {
            specificCallback = jasmine.createSpy('specific 420 error');
            serverCall(function () {
              model.save({}, {
                500: function () {
                },
                420: specificCallback
              });
            }, 420);

            expect(specificCallback).toHaveBeenCalled();
          });


        });

        describe("generic behaviour hooks", function () {


          describe("post hook", function () {
            var post_hook;

            beforeEach(function () {
              post_hook = jasmine.createSpy('generic post error function');
            });

            it("should get called when defined as error", function () {
              serverCall(function () {
                model.save({}, {error: post_hook});
              }, 500);

              expect(post_hook).toHaveBeenCalled();
            });

            it("should get called when defined as post_error", function () {
              serverCall(function () {
                model.save({}, {post_error: post_hook});
              }, 500);

              expect(post_hook).toHaveBeenCalled();
            });

            it("should get called before the generic handler", function () {
              var someVariable;
              chiropractor.init(
                  500, [500], { 500: function () {
                    someVariable = 2;
                  }
                  });
              serverCall(function () {
                model.save({}, {post_error: function () {
                  someVariable = someVariable + 1;
                } });
              }, 500);
              expect(someVariable).toEqual(3);

            });

            it("should not get called when a specific handler is called", function () {
              serverCall(function () {
                model.save({}, {420: function () {
                }, post_error: post_hook});
              }, 420);

              expect(post_hook).not.toHaveBeenCalled();
            });

          });

          describe("pre hook", function () {
            it("should get called when defined as pre_error", function () {
              var pre_hook = jasmine.createSpy('generic post error function');

              serverCall(function () {
                model.save({}, {pre_error: pre_hook});
              }, 500);

              expect(pre_hook).toHaveBeenCalled();
            });
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

});