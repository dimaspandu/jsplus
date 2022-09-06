/**
 * @license JS+ (SPA) v1.0.0
 * jsplus/koma.js
 *
 * Copyright (c) dimaspandu
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function (global) {
  "use strict";
  
  var onIgnitedEventContext = function (onEvent)
  {
    if (onEvent.delay === 0) {
      onEvent.set();
    } else {
      setTimeout(onEvent.set, onEvent.delay);
    }
  };
  
  var setHistoryStateKoma = function (koma, method, originPath, requestPath)
  {
    var basePath = koma.options.hashtag ? 
      global.location.pathname + "#" 
      : koma.options.baseUrl + "";
  
    if (method === "push") {
      global.history.pushState({ origin: originPath, request: requestPath }, null, basePath + requestPath);
    } else if (method === "replace") {
      global.history.replaceState({ origin: originPath, request: requestPath }, null, basePath + requestPath);
    } else {
      global.history.pushState({ origin: originPath, request: requestPath }, null, basePath + requestPath);
    }
  };
  
  var setFlushingKoma = function (koma, originPath)
  {
    var container = (function () {
      if (typeof koma.pipe[originPath].context.container === "function") {
        return koma.pipe[originPath].context.container();
      } else {
        return koma.pipe[originPath].context.container;
      }
    }());
    var hostdom = koma.options.hostdom;
  
    if (container !== null)
    {
      while (hostdom.firstChild) {
        hostdom.removeChild(hostdom.firstChild);
      }
  
      hostdom.appendChild((function () {
        if (container.nodeType === undefined) {
          return document.createTextNode(container.toString());
        } else {
          return container;
        }
      }()));
    }
  };
  
  var initNavigationKoma = function (koma, context, originPath, params, query)
  {
    context.params = params;
    context.query = query;
  
    koma.pipe[originPath].context = context;
    koma.pipe[originPath].builder(context);
    
    koma.state.firstReactor.origin = originPath;
    koma.state.firstReactor.request = koma.originPath();
    koma.state.firstReactor.params = params;
    koma.state.firstReactor.query = query;
  
    koma.state.activeReactor.origin = originPath;
    koma.state.activeReactor.request = koma.originPath();
    koma.state.activeReactor.params = params;
    koma.state.activeReactor.query = query;
  
    koma.state.journey.push({
      origin: originPath,
      request: koma.originPath(),
      method: "push",
      params: params,
      query: query
    });
    
    koma.pipe[originPath].context.builder.flushTransform = function () {
      setFlushingKoma(koma, originPath);
    };

    setHistoryStateKoma(koma, "replace", originPath, koma.originPath());
  
    if (!koma.pipe[originPath].context.builder.waiting) {
      koma.pipe[originPath].context.builder.flushTransform();
    }
  
    koma.pipe[originPath].context.builder.eventTransform = function () {
      koma.notifier.meet();
      onIgnitedEventContext(koma.pipe[originPath].context.onMeet);
      koma.notifier.arrive();
      onIgnitedEventContext(koma.pipe[originPath].context.onArrive);
    };
  
    if (!koma.pipe[originPath].context.builder.waiting) {
      koma.pipe[originPath].context.builder.eventTransform();
    }
  };
  
  var setNavigationKoma = function (koma, method, originPath, requestPath, params, query)
  {
    if (originPath === "*" && koma.pipe["*"] === undefined) {
      console.error("Handler not found, there is no {koma.err(callback)} pipe cause Koma in hurry.");
      return 0;
    }
  
    if (koma.pipe[originPath].context === null)
    {
      var context = new Context();
  
      context.params = params;
      context.query = query;
  
      koma.pipe[originPath].context = context;
      koma.pipe[originPath].builder(context);
    }
    else
    {
      koma.pipe[originPath].context.params = params;
      koma.pipe[originPath].context.query = query;
    }
    
    if (originPath !== koma.state.activeReactor.origin) {
      koma.pipe[originPath].context.builder.flushTransform = function () {
        setFlushingKoma(koma, originPath);
      };
  
      if (!koma.pipe[originPath].context.builder.waiting) {
        koma.pipe[originPath].context.builder.flushTransform();
      }
    }
  
    if (method !== "replace") {
      koma.state.previousReactor.origin = koma.state.activeReactor.origin;
      koma.state.previousReactor.request = koma.state.activeReactor.request;
      koma.state.previousReactor.params = koma.state.activeReactor.params;
      koma.state.previousReactor.query = koma.state.activeReactor.query;
    }
  
    koma.state.activeReactor.origin = originPath;
    koma.state.activeReactor.request = requestPath;
    koma.state.activeReactor.params = params;
    koma.state.activeReactor.query = query;
  
    if (method === "replace") {
      var journeyLastIndex = koma.state.journey.length - 1;
      koma.state.journey[journeyLastIndex].origin = originPath;
      koma.state.journey[journeyLastIndex].request = requestPath;
      koma.state.journey[journeyLastIndex].method = method;
      koma.state.journey[journeyLastIndex].params = params;
      koma.state.journey[journeyLastIndex].query = query;
    } else {
      koma.state.journey.push({
        origin: originPath,
        request: requestPath,
        method: method,
        params: params,
        query: query,
      });
    }
  
    koma.pipe[originPath].context.builder.eventTransform = function () {
      koma.notifier.meet();
      onIgnitedEventContext(koma.pipe[originPath].context.onMeet);
      koma.notifier.arrive();
      onIgnitedEventContext(koma.pipe[originPath].context.onArrive);
  
      if (originPath !== "*" && koma.pipe[originPath].context.container === null) {
        if (koma.pipe[originPath].catcher === undefined) {
          koma.options.hostdom.innerHTML = "<div style=\"height: 100vh; padding: 20px; width: 100%;\"><h1 style=\"font-size: 5rem; line-height: 1;\">Blank Screen</h1><p style=\"color: #585858; font-size: 2rem; margin-top: 8px;\">No reactor catcher.</p><span style=\"color: #11a3c4; display: block; font-size: 2rem; font-weight: bold; margin-top: 8px; text-decoration: underline;\" onclick=\"window.history.back();\">BACK</span></div>";
        } else {
          koma.pipe[originPath].catcher(koma.pipe[originPath].context);
          setFlushingKoma(koma, originPath);
        }
      }
    };
  
    if (!koma.pipe[originPath].context.builder.waiting) {
      koma.pipe[originPath].context.builder.eventTransform();
    }
  };
  
  function Context ()
  {
    this.params = {};
    this.query = {};
    
    this.container = null;
  
    this.builder = Object.seal({
      waiting: false,
      flushTransform: function () {},
      eventTransform: function () {},
      future: function (builder) {
        this.waiting = true;
        var self = this;
        builder(
          function dispose (snapshot = function () {}) {
            self.waiting = false;
            snapshot();
            self.flushTransform();
            self.eventTransform();
          }
        );
      }
    });
  
    this.onMeet = Object.seal({
      delay: 0,
      set: function () {}
    });
  
    this.onArrive = Object.seal({
      delay: 0,
      set: function () {}
    });
    
    this.onExit = Object.seal({
      delay: 0,
      set: function () {}
    });
    
    this.onComeback = Object.seal({
      delay: 0,
      set: function () {}
    });
  
    Object.seal(this);
  }
  
  function Koma (options = {
    baseUrl: "",
    dividerPath: "#",
    hashtag: true,
    hostdom: document.body
  }) {
    this.options = Object.seal({
      baseUrl: options.baseUrl === undefined ? "" : options.baseUrl[options.baseUrl.length - 1] === "/" ? options.baseUrl.slice(0, -1) : options.baseUrl,
      dividerPath: options.dividerPath === undefined ? "#" : options.dividerPath,
      hashtag: options.hashtag === undefined ? true : options.hashtag,
      hostdom: options.hostdom === undefined ? document.body : options.hostdom
    });
  
    if (!this.options.hashtag && this.options.baseUrl.length === 0)
    {
      console.error("There is no {baseUrl} set in instance of koma arguments options while disabling hashtag options.");
    }
  
    if (!this.options.hashtag && this.options.baseUrl.length > 0)
    {
      if (this.options.dividerPath !== "#" && this.options.dividerPath !== this.options.baseUrl) {
        console.warn("Please set {dividerPath} same as {baseUrl} while disabling hashtag options.");
      }
      this.options.dividerPath = this.options.baseUrl;
    }
  
    Object.freeze(this);
  }
  
  Koma.prototype.requestPath = function () {
    return (global.location.href.split(this.options.dividerPath)[1] !== undefined) ? 
      global.location.href.split(this.options.dividerPath)[1] : 
      global.location.href.split(this.options.dividerPath)[0];
  };
  
  Koma.prototype.originPath = function () {
    var _originPath = (this.requestPath().indexOf("?") === -1) ? 
      this.requestPath() : this.requestPath().split("?")[0];
  
    if (_originPath.length === global.location.href.length) {
      _originPath = "/";
    }
  
    return _originPath;
  };
  
  Koma.prototype.pipe = {};
  
  Koma.prototype.pipeCache = {};
  
  Koma.prototype.state = Object.seal({
    firstReactor: Object.seal({
      origin: null,
      request: null,
      params: {},
      query: {}
    }),
    previousReactor: Object.seal({
      origin: null,
      request: null,
      params: {},
      query: {}
    }),
    activeReactor: Object.seal({
      origin: null,
      request: null,
      params: {},
      query: {}
    }),
    journey: [],
    navigateBlocker: {
      queue: 0,
      works: false
    }
  });

  Koma.prototype.notifier = Object.seal({
    transition: function () {},
    meet: function () {},
    arrive: function () {},
    exit: function () {},
    comeback: function () {}
  });
  
  Koma.prototype.reactor = function (path, builder, catcher)
  {
    this.pipe[path] = {
      context: null,
      builder: builder,
      catcher: catcher
    };
  
    return this;
  };
  
  Koma.prototype.err = function (builder, catcher)
  {
    this.pipe["*"] = {
      context: null,
      builder: builder,
      catcher: catcher
    };
  
    return this;
  };
  
  Koma.prototype.navigator = function (pathInput, resolve, reject)
  {
    var path = pathInput;
    var params = {};
    var query = {};
  
    if (pathInput.indexOf("?") !== -1) {
      var segmentQuery = pathInput.split("?")[1].split("&");
      Object.keys(segmentQuery).forEach(function (sqKey)
      {
        var segmentString = segmentQuery[sqKey].split("=");
        query[segmentString[0]] = segmentString[1];
      });
      path = pathInput.split("?")[0];
    }
  
    if (this.pipe[path] !== undefined) {
      resolve(path, params, query);
      this.pipeCache[pathInput] = {
        originPath: path,
        params: params,
        query: query
      };
    } else {
      var segmentInput = path.split("/");
      var pathInputValidate = {
        exists: false,
        origin: path
      };
      
      for (var pathOutput in this.pipe)
      {
        var segmentOutput = pathOutput.split("/");
        var countSegmentOutput = segmentOutput.length;
        var countSegmentInput = segmentInput.length;
  
        if ((pathOutput.indexOf("{") !== -1) && (countSegmentOutput === countSegmentInput))
        {
          for (var i = 0; i < countSegmentOutput; i++)
          {
            if (segmentOutput[i].split("{")[1] !== undefined)
            {
              var keyParams = segmentOutput[i].split("{")[1].slice(0, -1);
              params[keyParams] = segmentInput[i];
            }
            else
            {
              if (segmentOutput[i] === segmentInput[i])
              {
                pathInputValidate.exists = true;
                pathInputValidate.origin = pathOutput;
              }
              else
              {
                pathInputValidate.exists = false;
                break;
              }
            }
  
            if ((i === (countSegmentOutput - 1)) && pathInputValidate["exists"]) {
              break;
            }
          }
        }
  
        if (pathInputValidate.exists) {
          break;
        }
      }
  
      if (pathInputValidate.exists) {
        resolve(pathInputValidate.origin, params, query);
        this.pipeCache[pathInput] = {
          originPath: pathInputValidate.origin,
          params: params,
          query: query
        };
      } else {
        reject();
        this.pipeCache[pathInput] = {
          originPath: "*",
          params: params,
          query: query
        };
      }
    }
  };
  
  Koma.prototype.navigateProcess = function (path, method = "push")
  {
    var root = this;
  
    if (this.pipeCache[path] !== undefined) {
      setHistoryStateKoma(root, method, this.pipeCache[path].originPath, path);
      setNavigationKoma(root, method, this.pipeCache[path].originPath, path, this.pipeCache[path].params, this.pipeCache[path].query);
    } else {
      this.navigator(path,
        function (originPath, params, query)
        {
          setHistoryStateKoma(root, method, originPath, path);
          setNavigationKoma(root, method, originPath, path, params, query);
        },
        function ()
        {
          setHistoryStateKoma(root, method, "*", path);
          setNavigationKoma(root, method, "*", path, {}, {});
        }
      );
    }
  };
  
  Koma.prototype.navigatePush = function (path)
  {
    this.notifier.transition();

    if (!this.state.navigateBlocker.works) {
      this.navigateProcess(path, "push");
    } else {
      var root = this;
      var looping = true;
      var waiting = setInterval(function () {
        if (!root.state.navigateBlocker.works) {
          root.navigateProcess(path, "push");
          looping = false;
          clearInterval(waiting);
        }
      }, 0);

      setTimeout(function () {
        if (looping) {
          looping = false;
          clearInterval(waiting);
        }
      }, 1000);
    }
  };
  
  Koma.prototype.navigateReplace = function (path)
  {
    this.notifier.transition();

    if (!this.state.navigateBlocker.works) {
      this.navigateProcess(path, "replace");
    } else {
      var root = this;
      var looping = true;
      var waiting = setInterval(function () {
        if (!root.state.navigateBlocker.works) {
          root.navigateProcess(path, "replace");
          looping = false;
          clearInterval(waiting);
        }
      }, 0);

      setTimeout(function () {
        if (looping) {
          looping = false;
          clearInterval(waiting);
        }
      }, 1000);
    }
  };
  
  Koma.prototype.navigateClear = function ()
  {
    this.state.navigateBlocker.queue = this.state.journey.length;
    this.state.navigateBlocker.works = true;
  
    this.state.firstReactor.origin = this.state.activeReactor.origin;
    this.state.firstReactor.request = this.state.activeReactor.request;
    this.state.firstReactor.params = this.state.activeReactor.params;
    this.state.firstReactor.query = this.state.activeReactor.query;
  
    this.state.previousReactor.origin = null;
    this.state.previousReactor.request = null;
    this.state.previousReactor.params = {};
    this.state.previousReactor.query = {};
    
    for (var i = this.state.journey.length - 1; i >= 1; i--) {
      global.history.back();
    }
  
    var newJourney = [{
      origin: this.state.activeReactor.origin,
      request: this.state.activeReactor.request,
      params: this.state.activeReactor.params,
      query: this.state.activeReactor.query
    }];
    this.state.journey = newJourney;
    this.navigateReplace(this.state.journey[0].request);
  };
  
  Koma.prototype.navigatePop = function ()
  {
    var root = this;
    var flip = function () {
      if (root.state.previousReactor.origin !== root.state.activeReactor.origin) {
        root.pipe[root.state.previousReactor.origin].context.builder.flushTransform = function () {
          setFlushingKoma(root, root.state.previousReactor.origin);
        };
    
        if (!root.pipe[root.state.previousReactor.origin].context.builder.waiting) {
          root.pipe[root.state.previousReactor.origin].context.builder.flushTransform();
        }
      }
  
      root.state.journey.pop();
  
      root.state.activeReactor.origin = root.state.journey[root.state.journey.length - 1].origin;
      root.state.activeReactor.request = root.state.journey[root.state.journey.length - 1].request;
      root.state.activeReactor.params = root.state.journey[root.state.journey.length - 1].params;
      root.state.activeReactor.query = root.state.journey[root.state.journey.length - 1].query;
  
      root.state.previousReactor.origin = (root.state.journey.length === 1) ? null : root.state.journey[root.state.journey.length - 2].origin;
      root.state.previousReactor.request = (root.state.journey.length === 1) ? null : root.state.journey[root.state.journey.length - 2].request;
      root.state.previousReactor.params = (root.state.journey.length === 1) ? null : root.state.journey[root.state.journey.length - 2].params;
      root.state.previousReactor.query = (root.state.journey.length === 1) ? null : root.state.journey[root.state.journey.length - 2].query;
  
      root.pipe[root.state.activeReactor.origin].context.params = root.state.activeReactor.params;
      root.pipe[root.state.activeReactor.origin].context.query = root.state.activeReactor.query;
  
      root.pipe[root.state.activeReactor.origin].context.builder.eventTransform = function () {
        root.notifier.meet();
        onIgnitedEventContext(root.pipe[root.state.activeReactor.origin].context.onMeet);
        root.notifier.comeback();
        onIgnitedEventContext(root.pipe[root.state.activeReactor.origin].context.onComeback);
      };
    
      if (!root.pipe[root.state.activeReactor.origin].context.builder.waiting) {
        root.pipe[root.state.activeReactor.origin].context.builder.eventTransform();
      }
    };
    var onExit = this.pipe[this.state.activeReactor.origin].context.onExit;
    var doExit = onExit.set();
  
    if (doExit === undefined || doExit) {
      root.notifier.exit();

      if (onExit.delay === 0) {
        flip();
      } else {
        setTimeout(flip, onExit.delay);
      }
    } else {
      setHistoryStateKoma(this, "push", this.state.activeReactor.origin, this.state.activeReactor.request);
  
      root.pipe[root.state.activeReactor.origin].context.builder.eventTransform = function () {
        root.notifier.meet();
        onIgnitedEventContext(root.pipe[root.state.activeReactor.origin].context.onMeet);
        root.notifier.arrive();
        onIgnitedEventContext(root.pipe[root.state.activeReactor.origin].context.onArrive);
      };
    
      if (!root.pipe[root.state.activeReactor.origin].context.builder.waiting) {
        root.pipe[root.state.activeReactor.origin].context.builder.eventTransform();
      }
    }
  };

  Koma.prototype.addNotifier = function (instructions, callback)
  {
    this.notifier[instructions] = callback;
  };
  
  Koma.prototype.tap = function ()
  {
    try
    {
      var root = this;
      var context = new Context();
  
      this.navigator((this.requestPath().indexOf("?") === -1) ? this.originPath() : this.requestPath(),
        function (originPath, params, query) {
          initNavigationKoma(root, context, originPath, params, query);
        },
        function () {
          if (root.pipe["*"] !== undefined) {
            initNavigationKoma(root, context, "*", {}, {});
          } else {
            console.error("Handler not found, there is no {koma.err(callback)} pipe cause Koma in hurry.");
            return 0;
          }
        }
      );
  
      global.onpopstate = function (event)
      {
        event.preventDefault();

        root.notifier.transition();
  
        if (root.state.navigateBlocker.works) {
          root.state.navigateBlocker.queue--;
          if (root.state.navigateBlocker.queue === 1) {
            root.state.navigateBlocker.works = false;
          }
        }
  
        var endReactor = root.pipe[root.state.activeReactor.origin].context.onExit.delay === -1;

        if (endReactor) {
          global.history.go(-1);
        } else {
          if (event.state.origin === root.state.previousReactor.origin) {
            root.navigatePop();
          } else {
            if (!root.state.navigateBlocker.works) {
              setNavigationKoma(
                root, "push",
                event.state.origin, event.state.request,
                root.pipe[event.state.origin].context === null ? {} : root.pipe[event.state.origin].context.params,
                root.pipe[event.state.origin].context === null ? {} : root.pipe[event.state.origin].context.query
              );
            }
          }
        }
      };
    }
    catch (e)
    {
      console.error("Koma reactor error:", e.message);
      return 0;
    }
  };

  global.Koma = Koma;
}(window));