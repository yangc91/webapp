/************************************************************************
 * AUTHOR: 李惠荣
 * FILENAME: common.js
 * DESCRIPTION: 公用方法编写
 * NOTE: cookie操作，toJSON
 * HISTORY: create 2017/07/27 by lhr;
 ***********************************************************************/

//cookie设置读取
var cookieObj = {
  //获取cookie对象，以对象表示
  getCookiesObj: function () {
    var cookies = {};
    if (document.cookie) {
      var objs = document.cookie.split('; ');
      for (var i = 0; i < objs.length; i++) {
        var name = objs[i].split("=")[0],
          value = objs[i].split("=")[1];
        cookies[name] = value;
      }
    }
    return cookies;
  },
  //设置cookie
  set: function (name, value, opts) {
    //opts maxAge, path, domain, secure
    if (name && value) {
      var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
      //可选参数
      if (opts) {
        if (opts.maxAge) {
          cookie += '; max-age=' + opts.maxAge;
        }
        if (opts.path) {
          cookie += '; path=' + opts.path;
        }
        if (opts.domain) {
          cookie += '; domain=' + opts.domain;
        }
        if (opts.secure) {
          cookie += '; secure';
        }
      }
      document.cookie = cookie;
      return cookie;
    } else {
      return '';
    }
  },
  //获取cookie
  get: function (name) {
    return decodeURIComponent(this.getCookiesObj()[name]) || null;
  },
  //清除某个cookie
  remove: function (name) {
    if (this.getCookiesObj()[name]) {
      document.cookie = name + '=; max-age=0';
    }
  },
  //清除所有cookie
  clear: function () {
    var cookies = this.getCookiesObj();
    for (var key in cookies) {
      document.cookie = key + '=; max-age=0';
    }
  },
  //获取所有cookies
  getCookies: function (name) {
    return this.getCookiesObj();
  }
};
/*
 * jQuery JSON Plugin
 * version: 2.1 (2009-08-14)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 * website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold.
 *
 * It is also influenced heavily by MochiKit's serializeJSON, which is
 * copyrighted 2005 by Bob Ippolito.
 */

(function ($) {
  /** jQuery.toJSON( json-serializble )
   Converts the given argument into a JSON respresentation.

   If an object has a "toJSON" function, that will be used to get the representation.
   Non-integer/string keys are skipped in the object, as are keys that point to a function.

   json-serializble:
   The *thing* to be converted.
   **/
  $.toJSON = function (o) {
    if (typeof (JSON) == 'object' && JSON.stringify) {
      var json = JSON.stringify(o);
      //by jnx:过滤转批过程中空字符变成null字符
      return json.replace(/null/gi, "null");
    }
    var type = typeof (o);

    if (o === null)
      return "null";

    if (type == "undefined")
      return undefined;

    if (type == "number" || type == "boolean")
      return o + "";

    if (type == "string")
      return $.quoteString(o);

    if (type == 'object') {
      if (typeof o.toJSON == "function")
        return $.toJSON(o.toJSON());

      if (o.constructor === Date) {
        var month = o.getUTCMonth() + 1;
        if (month < 10) month = '0' + month;

        var day = o.getUTCDate();
        if (day < 10) day = '0' + day;

        var year = o.getUTCFullYear();

        var hours = o.getUTCHours();
        if (hours < 10) hours = '0' + hours;

        var minutes = o.getUTCMinutes();
        if (minutes < 10) minutes = '0' + minutes;

        var seconds = o.getUTCSeconds();
        if (seconds < 10) seconds = '0' + seconds;

        var milli = o.getUTCMilliseconds();
        if (milli < 100) milli = '0' + milli;
        if (milli < 10) milli = '0' + milli;

        return '"' + year + '-' + month + '-' + day + 'T' +
          hours + ':' + minutes + ':' + seconds +
          '.' + milli + 'Z"';
      }

      if (o.constructor === Array) {
        var ret = [];
        for (var i = 0; i < o.length; i++)
          ret.push($.toJSON(o[i]) || "");

        return "[" + ret.join(",") + "]";
      }

      var pairs = [];
      for (var k in o) {
        var name;
        var type = typeof k;

        if (type == "number")
          name = '"' + k + '"';
        else if (type == "string")
          name = $.quoteString(k);
        else
          continue;  //skip non-string or number keys

        if (typeof o[k] == "function")
          continue;  //skip pairs where the value is a function.

        var val = $.toJSON(o[k]);

        pairs.push(name + ":" + val);
      }

      return "{" + pairs.join(", ") + "}";
    }
  };

  /** jQuery.evalJSON(src)
   Evaluates a given piece of json source.
   **/
  $.evalJSON = function (src) {
    if (typeof (JSON) == 'object' && JSON.parse)
      return JSON.parse(src);
    return eval("(" + src + ")");
  };

  /** jQuery.secureEvalJSON(src)
   Evals JSON in a way that is *more* secure.
   **/
  $.secureEvalJSON = function (src) {
    if (typeof (JSON) == 'object' && JSON.parse)
      return JSON.parse(src);

    var filtered = src;
    filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
    filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');

    if (/^[\],:{}\s]*$/.test(filtered))
      return eval("(" + src + ")");
    else
      throw new SyntaxError("Error parsing JSON, source is not valid.");
  };

  /** jQuery.quoteString(string)
   Returns a string-repr of a string, escaping quotes intelligently.
   Mostly a support function for toJSON.

   Examples:
   >>> jQuery.quoteString("apple")
   "apple"

   >>> jQuery.quoteString('"Where are we going?", she asked.')
   "\"Where are we going?\", she asked."
   **/
  $.quoteString = function (string) {
    if (string.match(_escapeable)) {
      return '"' + string.replace(_escapeable, function (a) {
          var c = _meta[a];
          if (typeof c === 'string') return c;
          c = a.charCodeAt();
          return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
        }) + '"';
    }
    return '"' + string + '"';
  };

  var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;

  var _meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
  };
})(jQuery);

//日期格式化
function fixedTwo(num) {
  if (num < 10) {
    return "0" + "" + num;
  } else {
    return num;
  }
}

//日期格式化 2017-09-09
Date.prototype.formatDate = function(){
  if(new Date(this) == "Invalid Date"){
    return "-";
  }
  return this.getFullYear() + "-" + fixedTwo(this.getMonth() + 1) + "-" + fixedTwo(this.getDate());
};
//日期格式化 2017-09-09 10:00
Date.prototype.formatDateTime = function(){
  if(new Date(this) == "Invalid Date"){
    return "-";
  }
  return this.getFullYear() + "-" + fixedTwo(this.getMonth() + 1) + "-" + fixedTwo(this.getDate()) + " " + fixedTwo(this.getHours()) + ":" + fixedTwo(this.getMinutes());
};

//数字格式化成 1,000,000格式的
String.prototype.formatComma = function () {
  if(this.length <= 3){
    return this+'';
  }
  if(this.length % 3 == 0){
    var str1 = this.replace(/(\d{3})/g, '$1' + ',');
    return str1.substring(0, str1.length - 1);
  }else{
    var leaveNum = this.length % 3;
    var strLeft = this.substr(0,leaveNum);
    var str2 = this.substr(leaveNum).replace(/(\d{3})/g, '$1' + ',');
    var strRight = str2.substring(0, str2.length - 1);
    return strLeft + "," + strRight;
  }
};

var layer;
//配置全局拦截器
layui.use('layer', function () {
  layer = layui.layer;
  layer.config({
    btnAlign: 'c',//默认按钮居中对齐
    resize: false,//默认不可拉伸
    closeBtn: 0//默认不显示右上角关闭阿牛
  });
  $.ajaxPrefilter(function (options) {
    options.timeout = 60000;
    options.dataType = "json";
    //options.contentType = "application/json";
    if (options.headers && options.headers.ticket) {

    } else {
      options.headers = {
        "ticket": cookieObj.get("ticket") == "undefined" ? "" : cookieObj.get("ticket")
      }
    }
    options.cache = false;
  });
  $(document).ajaxStart(function () {
    layer.load();
  }).ajaxSend(function (event, request, settings) {
  }).ajaxError(function (event, xhr, options, exc) {
    var status = xhr.status;
    if (status == 401) {
      layer.open({
        title: '提示'
        , content: '页面已过期，请重新登录'
        ,yes: function(index){
          window.location.href = "login.html";
          layer.close(index);
        }
      });
    } else if (status == 403) {
      layer.open({
        title: '提示'
        , content: '页面已过期，请重新登录'
        ,yes: function(index){
          window.location.href = "login.html";
          layer.close(index);
        }
      });
    } else if (status == 404) {
      layer.open({
        title: '提示'
        , content: '请求地址不存在'
      });
    } else if (status == 500) {
      layer.open({
        title: '提示'
        , content: '服务器内部异常'
      });
    } else if (status == 502) {
      layer.open({
        title: '提示'
        , content: '服务未启动，请先检查服务状态'
      });
    } else if (status == 503) {
      layer.open({
        title: '提示'
        , content: '服务器已超载或维护中导致请求无法完成'
      });
    } else if (status == 504) {
      layer.open({
        title: '提示'
        , content: '请求超时,请稍候重试'
      });
    } else {
      layer.open({
        title: '提示'
        , content: '网络异常'
      });
    }
  }).ajaxComplete(function () {
    layer.closeAll('loading');
  });
});



