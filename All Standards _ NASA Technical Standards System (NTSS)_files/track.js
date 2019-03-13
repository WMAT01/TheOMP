
var Pulse = (function()
{
  var writeToConsole = (typeof console == "object");

  var trackingAppId;

  var oneUncaughtSent = false;
  
  var module =
  {};

  module.track = function(appId, params)
  {
    if (!params)
    {
      params = {}
    }
  
    trackingAppId = appId;
    
    var analyticsUrl = params["analyticsUrl"];    
    var auid = params["auid"];
    var server = params["server"];
    var method = params["method"];
    var status = params["status"];
    var processMSecs = params["processMSecs"];
    
    trackUrl(appId, document.URL, method, false, analyticsUrl, auid, status,  processMSecs, server);

    if (!window.onerror)
    {
      window.onerror = function(msg, url, line, col, errorObj)
      {
        if (!oneUncaughtSent)
        {
          oneUncaughtSent = true;
          var message = "Uncaught JavaScript exception on page: " + document.URL + " message: " + msg;
          if (url)
          {
            message += " source: " + url;
          }

          if (line)
          {
            message += " line: " + line;
          }

          if (col)
          {
            message += " column: " + col;
          }

          Pulse.logError(message);
          return false;
        }
      };
    }
  }
  
  module.logInfo = function(msg)
  {
    log(msg, 'info');
  }
  
  module.logWarn = function(msg)
  {
    log(msg, 'warn');
  }
  
  module.logError = function(msg)
  {
    log(msg, 'error');
  }

  module.event = function(eventName, eventProperties)
  {
    sendEvent(eventName, eventProperties);
  }

  function trackUrl(appId, url, method, ajax, analyticsUrl, auid, status, processMSecs, server)
  {
    var trackUrl = "https://mobile.neacc.nasa.gov/pulse/track.gif";
    trackUrl += "?app=" + encodeURIComponent(appId);
    trackUrl += "&url=" + encodeURIComponent(fullUrl(url));
    trackUrl += "&at=" + (new Date()).getTime();

    if (ajax) trackUrl += "&ajax=true";

    if (analyticsUrl) trackUrl += "&analyticsUrl=" + encodeURIComponent(analyticsUrl);

    if (auid) trackUrl += "&auid=" + encodeURIComponent(auid);
    
    if (server) trackUrl += "&server=" + encodeURIComponent(server);
    
    if (method) trackUrl += "&method=" + method;
    
    if (status) trackUrl += "&status=" + status;
    
    if (processMSecs) trackUrl += "&processMSecs=" + processMSecs;

    if (document.referrer) trackUrl += "&referrer=" + document.referrer;

    var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    
    trackUrl += "&screen=" + window.screen.width + "x" + window.screen.height + "&window=" + windowWidth + "x" + windowHeight;

    sendAsyncRequest(trackUrl);
  }
  
  function log(msg, level)
  {
    trace(level.toUpperCase() + ": " + msg);
  
    var logUrl = "https://mobile.neacc.nasa.gov/pulse/track.gif";
    logUrl += "?app=" + encodeURIComponent(trackingAppId);
    logUrl += "&logMessage=" + encodeURIComponent(msg);
    logUrl += "&logLevel=" + level;
    logUrl += "&at=" + (new Date()).getTime();

    sendAsyncRequest(logUrl);
  }

  function sendEvent(eventName, eventProperties)
  {
    var eventUrl = "https://mobile.neacc.nasa.gov/pulse/track.gif";
    eventUrl += "?app=" + encodeURIComponent(trackingAppId);
    eventUrl += "&event=" + encodeURIComponent(eventName);

    if (eventProperties)
    {
      for (var eventProperty in eventProperties) {
        if (eventProperties.hasOwnProperty(eventProperty)) {
          eventUrl += "&" + encodeURIComponent(eventProperty) + "=" +  encodeURIComponent(eventProperties[eventProperty]);
        }
      }
    }

    sendAsyncRequest(eventUrl);
  }

  function trace(s)
  {
    if (writeToConsole)
    {
      try 
      { 
        console.log(s) 
      } 
      catch (e) 
      {}
    }
  }
  
  function fullUrl(url)
  {
    if (url.toLowerCase().substring(0, 4) != "http")
    {
      if (url.toLowerCase().substring(0, 1) == "/")
      {
        return window.location.protocol + "//" + window.location.host + url;
      }
      else
      {
        var fullUrl = document.URL;
        if (fullUrl.substring(fullUrl.length - 1, 1) != "/")
        {
          fullUrl += "/";
        }
        return fullUrl + url;
      }
    }
    else
    {
      return url;
    }
  }

  function sendAsyncRequest(url)
  {
    var image = new Image(1, 1);
    image.onload = function () { };
    image.src = url;
  }
  
  return module;
}());

if (typeof makePulseTrackCall == 'function') 
{
  try
  {
    makePulseTrackCall(); 
  }
  catch (e)
  {
    try
    {
      console.log('Unable to make pulse track call');
      console.log(e);
    }
    catch (ex)
    {}
  }
}
