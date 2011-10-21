describe("Chiropractor", function () {

      function getParams(subject) {
        var ajaxCall = spyOn(jQuery, 'ajax');

        subject();

        return ajaxCall.mostRecentCall.args[0];
      }

      function serverCall(subject, status) {
        var params = getParams(subject);
        params.error({status: status.toString()});
      }

      function expectChiroBehaviour(subject, modelModification) {

        var aGeneric = 404;
        var theDefault = 500;
        var specific = 420;
        var notInValids = 501;

        return function () {
          describe("models", function () {
            var model, defaultHandler, genericHandler, opts;

            describe("save", function () {
              var method;
              beforeEach(function () {
                defaultHandler = jasmine.createSpy('generic 500 error');
                genericHandler = jasmine.createSpy('generic 404 error');
                var generics = {};
                generics[theDefault] = defaultHandler;
                generics[aGeneric] = genericHandler;
                subject(
                    theDefault, //default status code
                    [aGeneric, specific, theDefault], //all accepted codes
                    generics
                );
                var Model = Backbone.Model.extend({
                  url: function () {
                    return "test"
                  }
                });
                model = new Model();
                modelModification(model);
                method = model.save;
                opts = {};
              });


              function runMethodForErrorCode(code) {

                serverCall(function () {
                  method.call(model, {}, opts)
                }, code);
              }

              describe("default handler", function () {

                describe('when the status is not in validCodes', function () {
                  it("should be called", function () {
                    runMethodForErrorCode(notInValids);
                    expect(defaultHandler).toHaveBeenCalled();
                  });
                });

                describe('when there is no specific or generic handler for the status', function () {
                  it("should be called", function () {
                    runMethodForErrorCode(specific);
                    expect(defaultHandler).toHaveBeenCalled();
                  });
                });
              });

              describe("generic handlers", function () {
                it("should perform the provided behaviour", function () {
                  runMethodForErrorCode(theDefault);
                  expect(defaultHandler).toHaveBeenCalled();
                });

                it("should work with any status code", function () {
                  runMethodForErrorCode(aGeneric);
                  expect(genericHandler).toHaveBeenCalled();
                });
              });

              describe("specific handlers", function () {
                var specificHandler;
                beforeEach(function () {
                  specificHandler = jasmine.createSpy('specific error');
                });

                it("should override a generic handler", function () {
                  opts[aGeneric] = specificHandler;
                  runMethodForErrorCode(aGeneric);
                  expect(specificHandler).toHaveBeenCalled();
                });

                it("should override the default handler", function () {
                  opts[theDefault] = specificHandler;
                  runMethodForErrorCode(notInValids);
                  expect(specificHandler).toHaveBeenCalled();
                });
              });

              describe("hooks", function () {

                describe("post hook", function () {
                  var postHook;

                  beforeEach(function () {
                    postHook = jasmine.createSpy('generic post error function');
                    opts['post_error'] = postHook;
                  });

                  it("should get called", function () {
                    runMethodForErrorCode(theDefault);
                    expect(postHook).toHaveBeenCalled();
                  });

                  it("should get called before the generic handler", function () {
                    var someVariable;
                    var generics = {};
                    generics[theDefault] = function () {
                      someVariable = 2;
                    }
                    subject(theDefault, [theDefault], generics);
                    opts['post_error'] = function () {
                      someVariable = someVariable + 1;
                    };
                    runMethodForErrorCode(theDefault);
                    expect(someVariable).toEqual(3);

                  });

                  it("should not get called when a specific handler is called", function () {
                    opts[specific] = function () {};
                    runMethodForErrorCode(specific);
                    expect(postHook).not.toHaveBeenCalled();
                  });

                });

                describe("pre hook", function () {
                  var preHook;

                  beforeEach(function () {
                    preHook = jasmine.createSpy('generic pre error function');
                    opts['pre_error'] = preHook;
                  });


                  it("should get called when defined as pre_error", function () {
                    runMethodForErrorCode(theDefault);
                    expect(preHook).toHaveBeenCalled();
                  });

                  it("should get called after the generic handler", function () {
                    var someVariable;
                    var generics = {};
                    generics[theDefault] = function () {
                      someVariable = someVariable + 2;
                    };
                    subject(theDefault, [theDefault], generics);
                    opts['pre_error'] = function () {
                      someVariable = 1;
                    };
                    runMethodForErrorCode(theDefault);
                    expect(someVariable).toEqual(3);

                  });

                  it("should not get called when a specific handler is called", function () {
                    opts[specific] = function () {};
                    runMethodForErrorCode(specific);
                    expect(preHook).not.toHaveBeenCalled();
                  });
                });
              });

              describe('error', function () {
              var errorHandler;

              beforeEach(function () {
                errorHandler = jasmine.createSpy('error handler');
                opts['error'] = errorHandler;
              });

              it('should not run the preHook', function () {

              });

              it('should not run the postHook', function () {

              });

              it("should be run instead of the default", function () {
                runMethodForErrorCode(theDefault);
                expect(errorHandler).toHaveBeenCalled();
                expect(defaultHandler).not.toHaveBeenCalled();
              });

              it("should be run instead of a generic", function () {
                runMethodForErrorCode(aGeneric);
                expect(errorHandler).toHaveBeenCalled();
                expect(genericHandler).not.toHaveBeenCalled();
              });

              it("should be run instead of a specifc", function () {
                var specificHandler = jasmine.createSpy('specifc error function');
                  opts[specific] = specificHandler;
                runMethodForErrorCode(specific);

                expect(errorHandler).toHaveBeenCalled();
                expect(specificHandler).not.toHaveBeenCalled();
              });
            });

            });


//
            describe("when the init happens after the use call", function () {
              it("should still work", function () {
                defaultHandler = jasmine.createSpy('error');

                var Model = Backbone.Model.extend({
                  url: function () {
                    return "test"
                  }
                });
                model = new Model();
                modelModification(model);
                chiropractor.each(500, [500], {500: defaultHandler});
                serverCall(function () {
                  model.save();
                }, 500);
                expect(defaultHandler).toHaveBeenCalled();
              });
            });

          });

          describe("collections", function () {
            var collection;
            beforeEach(function () {
              errorCallback = jasmine.createSpy('500 error');
              chiropractor.each(500, [500], {500: errorCallback});
              var Collection = Backbone.Collection.extend({
                url: function () {
                  return "test"
                }
              });
              collection = new Collection();
              modelModification(collection);
            });


            it("should default to 500", function () {
              serverCall(function () {
                collection.fetch()
              }, notInValids);
              expect(errorCallback).toHaveBeenCalled();
            });


            it("should work with create when not passed an existing backbone model", function () {
              serverCall(function () {
                collection.create({});
              }, notInValids);
              expect(errorCallback).toHaveBeenCalled();
            });

          });
        }
      }

      describe("#all", expectChiroBehaviour(chiropractor.all, function () {
      }));

      describe("#each", function () {
        describe('with #use', expectChiroBehaviour(chiropractor.each, function (object) {
          chiropractor.use(object);
        }));

        describe('without anything', function () {
          describe('model#save', function () {
            it("should be unchanged", function () {
              chiropractor.each(500, [], {});
              var model = new Backbone.Model({});
              expect(model.save).toEqual(Backbone.Model.prototype.save);
            });
          });
        })


      });

      describe('oneOff', function () {
        describe('with #each', function () {
          it("should return the error handler", function () {

          })
        });
      });


    }

)
    ;
//
//function test (fn) {
//  return function () {
//  it("should work", function () {
//  expect(fn()).toEqual(7)
//    });
//    }
//}

//describe("testing", test(function () {
//  return 7
//}))