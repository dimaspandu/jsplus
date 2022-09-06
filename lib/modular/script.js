/**
 * @license JS+ (MODULAR) v1.0.0
 * jsplus/script.js
 *
 * Copyright (c) dimaspandu
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function (global) {
  "use strict";
  
  var DISTRIBUTOR_RECORD = {};
  var SCRIPT_INSTANCE = {};

  var redownloadPhase = 0;
  var maxExhausted = 99;

  function ScriptDistributionNetwork (registrySource)
  {
    var track = {
      "**": null,
      "&&": null
    };

    if (DISTRIBUTOR_RECORD[registrySource] === undefined)
    {
      var extension = registrySource.split(".").pop();

      DISTRIBUTOR_RECORD[registrySource] = {
        ["<>"]: null,
        [".*"]: extension,
        ["?@"]: false,
        ["?%"]: false
      };

      function openNetwork () {
        var distributorElement = document.createElement(extension === "css" ? "link" : "script");

        document.head.appendChild(distributorElement);
        
        DISTRIBUTOR_RECORD[registrySource]["<>"] = distributorElement;

        distributorElement.onload = function () {
          DISTRIBUTOR_RECORD[registrySource]["?@"] = true;
          DISTRIBUTOR_RECORD[registrySource]["?%"] = true;
        };

        distributorElement.onerror = function () {
          DISTRIBUTOR_RECORD[registrySource]["?@"] = false;
          DISTRIBUTOR_RECORD[registrySource]["?%"] = true;

          if (DISTRIBUTOR_RECORD[registrySource] !== undefined && redownloadPhase <= maxExhausted) {
            distributorElement.parentNode.removeChild(distributorElement);
            openNetwork();
            redownloadPhase++;
          }
        };

        if (extension === "js") {
          distributorElement.setAttribute("src", registrySource);
          distributorElement.setAttribute("type", "text/javascript");
        }

        if (extension === "css") {
          distributorElement.setAttribute("href", registrySource);
          distributorElement.setAttribute("rel", "stylesheet");
          distributorElement.setAttribute("type", "text/css");
        }
      }
      openNetwork();
    }

    var getCollectionOutput = function () {
      if (
        DISTRIBUTOR_RECORD[registrySource][".*"] === "js" &&
        track["**"] !== null &&
        track["&&"] !== null
      ) {
        return SCRIPT_INSTANCE[track["**"]].extract()[track["&&"]];
      }
    };

    this.__proto__.term = function (registryID, collectionAddress) {
      track["**"] = registryID;
      track["&&"] = collectionAddress;
      return this;
    };

    this.sync = function (x, y) {
      var parasite = Array.isArray(x) ? x : [];
      var callback = parasite.length === 0 && typeof x === "function" ? x : y;

      if (parasite.length > 0) {
        parasite.unshift(this);
          
        var queue = 0;
        var dependencyArguments = [];

        function synchronize () {
          if (queue < parasite.length) {
            if (typeof parasite[queue] === "object" && parasite[queue].sync !== undefined) {
              parasite[queue].sync(function (collection) {
                if (collection !== undefined) {
                  dependencyArguments.push(collection);
                }
                queue += 1;
                synchronize();
              });
            } else {
              console.warn("Uncaught ArgumentsTypeError: Unsync");
            }
          } else {
            callback.apply(null, dependencyArguments);
          }
        }
        synchronize();
      } else {
        if (DISTRIBUTOR_RECORD[registrySource]["?@"] && DISTRIBUTOR_RECORD[registrySource]["?%"]) {
          callback(getCollectionOutput());
        } else {
          DISTRIBUTOR_RECORD[registrySource]["<>"].addEventListener("load", function () {
            callback(getCollectionOutput());
          });
        }
      }

      return this;
    };

    Object.freeze(this);
  }

  function Script (factory)
  {
    var ID = null;
    var lazyAssignFactoryToID = null;
    var packageRequired = [];

    var collection = {};

    var distribution = function (x, y)
    {
      if (y !== undefined) {
        collection[x] = y;
      } else {
        if ((new RegExp("/<NETWORK>/")).test(x)) {
          var segment = x.split("/<NETWORK>/");
          if ((new RegExp("/<INTER>/")).test(segment[1])) {
            var segmentOfSegment = segment[1].split("/<INTER>/");
            return new ScriptDistributionNetwork(
              (new RegExp("\\.")).test(segment[0]) ? segment[0] : segment[0] + ".js"
            ).term(segmentOfSegment[0], segmentOfSegment[1]);
          } else {
            if (segment[1].length > 0) {
              return new ScriptDistributionNetwork(
                (new RegExp("\\.")).test(segment[0]) ? segment[0] : segment[0] + ".js"
              ).term(segment[1], segment[1]);
            } else {
              return new ScriptDistributionNetwork(
                (new RegExp("\\.")).test(segment[0]) ? segment[0] : segment[0] + ".js"
              );
            }
          }
        }

        if ((new RegExp("/<INTER>/")).test(x)) {
          var segment = x.split("/<INTER>/");
          if (SCRIPT_INSTANCE[segment[0]] !== undefined) {
            return SCRIPT_INSTANCE[segment[0]].extract()[segment[1]];
          } else {
            console.warn("Uncaught TrackError: Undistributed at [" + segment[0] + "]");
            return undefined;
          }
        }
        
        if (collection[x] !== undefined) {
          return collection[x];
        } else {
          if (SCRIPT_INSTANCE[x] !== undefined) {
            return SCRIPT_INSTANCE[x].extract()[x];
          } else {
            console.warn("Uncaught TrackError: Undistributed at [" + x + "]");
            return undefined;
          }
        }
      }
    };

    var assignFactoryToID = function (factory)
    {
      if (ID !== null) {
        collection[ID] = factory;
      }
    };

    var defaultPackage = {
      "distribute": distribution
    };

    var initialize = function (factory, distribution)
    {
      if (typeof factory === "function") {
        if (packageRequired.length > 0) {
          var packageArguments = [];

          for (var j in packageRequired) {
            if (defaultPackage[packageRequired[j]] !== undefined) {
              packageArguments.push(defaultPackage[packageRequired[j]]);
            } else {
              var distributed = distribution(packageRequired[j]);
              if ((new RegExp("/<NETWORK>/")).test(packageRequired[j])) {
                if (packageRequired[j].split("/<NETWORK>/")[1].length > 0) {
                  packageArguments.push(distributed);
                }
              } else {
                packageArguments.push(distributed);
              }
            }
          }

          var factoryOutput = factory.apply(null, packageArguments);
          
          if (factoryOutput !== undefined) {
            assignFactoryToID(factoryOutput);

            lazyAssignFactoryToID = function () {
              collection[ID] = factoryOutput;
            };
          }
        } else {
          var factoryOutput = factory(distribution);

          if (factoryOutput !== undefined) {
            assignFactoryToID(factoryOutput);

            lazyAssignFactoryToID = function () {
              collection[ID] = factoryOutput;
            };
          }
        }
      } else {
        assignFactoryToID(factory);

        lazyAssignFactoryToID = function () {
          collection[ID] = factory;
        };
      }
    };

    this.extract = function ()
    {
      return collection;
    };

    this.__proto__.package = function ()
    {
      packageRequired = Array.isArray(arguments[0]) ? arguments[0] : arguments;
      return this;
    };

    this.__proto__.registry = function (registryID)
    {
      ID = registryID;

      if (lazyAssignFactoryToID !== null) {
        lazyAssignFactoryToID();
      }
      
      SCRIPT_INSTANCE[registryID] = this;

      return this;
    };

    this.__proto__.main = function (factory)
    {
      initialize(factory, distribution);
    };

    if (factory !== undefined)
    {
      initialize(factory, distribution);
    }

    Object.freeze(this);
  }

  global.Script = Script;
}(window));