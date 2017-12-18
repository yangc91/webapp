/**
 * 应用程序入口
 * @author 马德成
 * @date 2016/3/4
 */

// var app = angular.module('app', ['ui.router', 'oc.lazyLoad', 'app.filter', 'uidialog',
// 'ui.bootstrap']); var app = angular.module('app', ['ui.router', 'oc.lazyLoad']);
var app = angular.module('app', ['ui.router', 'oc.lazyLoad', 'ui.bootstrap']);
app.config(function ($sceProvider) {
  var div = document.createElement('div');
  div.innerHTML = '<!--[if lte IE 7]><script type="text/javascript">var is7SupportBrowser = 7;</script><![endif]-->';
  $sceProvider.enabled(typeof is7SupportBrowser != 'undefined');
});

//注册各服务
app.config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
  app.add = {
    controller: $controllerProvider.register,
    directive: $compileProvider.directive,
    filter: $filterProvider.register,
    factory: $provide.factory,
    service: $provide.service
  };
}]);
//配置module常量
app.constant('modulesConfig', [{
  name: "ngTable",
  module: true,
  files: [base + "/script/lib/ng-table/ng-table.min.css", base
  + "/script/lib/ng-table/ng-table.min.js"]
}, {
  name: "bootstrap",
  module: true,
  files: [//base + "/script/lib/ui-bootstrap/css/bootstrap.min.css",
    base + "/script/lib/ui-bootstrap/ui-bootstrap-tpls.min.js"]
}, {
  name: "treeview",
  module: true,
  files: [base + "/script/lib/ivh-treeview/ivh-treeview.min.css", base
  + "/script/lib/ivh-treeview/ivh-treeview.min.js"]
}, {
  name: "uidialog", module: true, files: [base + "/script/services/dialogService.js"]
}, {
  name: "placehoder", module: false, files: [base + '/script/lib/placeholder/mdc-placehoder.js']
}, {
  name: "datepicker", module: false, files: [base + '/script/lib/calendar/WdatePicker.js']
}, {
  name: 'highcharts-ng',
  module: true,
  files: [base + '/script/lib/highcharts-ng/adapters/standalone-framework.js', base
  + '/script/lib/highcharts-ng/highcharts.js', base + '/script/lib/highcharts-ng/highcharts-ng.js']
}]);

//配置延迟加载
app.config(['$ocLazyLoadProvider', '$locationProvider', 'modulesConfig', function ($ocLazyLoadProvider, $locationProvider, modulesConfig) {
  $ocLazyLoadProvider.config({
    debug: false, events: false, modules: modulesConfig
  });
}]);

app.config(function ($httpProvider) {
  var headers = $httpProvider.defaults.headers;
  //headers.common['X-Requested-By'] = 'MDC'; //统一添加请求头信息

  //删除AngularJS默认的X-Request-With头
  delete headers.common['X-Requested-With'];

  // 头信息配置,缺少X-Requested-With时解析错误
  // headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  // headers.post['Accept'] = 'application/json, text/javascript, */*; q=0.01';
  // headers.post['X-Requested-With'] = 'XMLHttpRequest';

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
  var param = function (obj) {

    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for (name in obj) {
      value = obj[name];

      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          if (angular.isObject(subValue)) {
            fullSubName = name + '[' + i + ']';
          } else {
            fullSubName = name;
          }

          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      } else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '.' + subName;
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      } else if (value !== undefined && value !== null) {
          query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // 覆盖默认 transformRequest
  // $httpProvider.defaults.transformRequest = [function (data) {
  //   return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  // }];

  //对所有请求统一拦截
  $httpProvider.interceptors.push(['$rootScope', '$q', function ($rootScope, $q) {
    return {
      'request': function (config) {
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        return config || $q.when(config);
      }, 'requestError': function (rejection) {
        return rejection;
      }, 'response': function (response) {
        /*console.log("response=========="+response);*/
        // console.log('response.headers(sessionstatus)====' + response.headers('sessionstatus'))
        //会话超时, 请重新登录
        if (response.headers('sessionstatus') == 'timeout') {
          $rootScope.user = null;
          //location.href = base + "/logout.do";
          //发布Session超时事件
          $rootScope.$emit('userIntercepted', 'ServerTimeout', response);
          return false;
        }

        //有异常抛出
        if (response.headers('isException') == 'true' && (response.headers('Content-Type')
            == 'text/html;charset=UTF-8'
            || response.headers('Content-Type')
            == 'text/html; charset=utf-8')) {
          //发布服务器错误事件
          $rootScope.$emit('userIntercepted', 'ServerException', response);
          return false;
        }

        return response || $q.when(response);
      }, 'responseError': function (response) {
        if (response.status != 200) {
          console.log("请求失败")
        } else {
          console.log("请求成功")
        }
        //会话超时
        if (response.status === 401 || response.status === 403) {
          $rootScope.$emit('userIntercepted', 'ServerTimeout', response);
          //location.href = base + "/logout.do";
          return false;
        }

        if (response.status === 404) {
          //$location.path('/error');
          //发布服务器错误事件
          $rootScope.$emit('userIntercepted', 'NotFound', response);
          /*alert(response.status);*/
          return false;
        }
        if (response.status === 500) {
          //$location.path('/error');
          //发布服务器错误事件
          $rootScope.$emit('userIntercepted', 'ServerException', response);
          return false;
        }

        return $q.reject(response);
      }
    };
  }]);

});

//配置页面路由
app.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
  $stateProvider
      .state('/index', { //主界面
        url: '/index', templateUrl: base + '/view/homeIndex.html', controller: 'homeCtr', resolve: {
          deps: function ($ocLazyLoad) {
            return $ocLazyLoad.load([base
            + '/script/controllers/homeCtr.js', 'bootstrap', 'placehoder']);
          }
        }
      })
      .state('/test', { //主界面
        url: '/test',
        templateUrl: base + '/view/homeIndex_1.html',
        controller: 'homeCtr1',
        resolve: {
          deps: function ($ocLazyLoad) {
            return $ocLazyLoad.load([base
            + '/script/controllers/homeCtr1.js', 'bootstrap', 'placehoder']);
          }
        }
      })
      .state('/sys/user/list', { //用户列表
        url: '/sys/user/list',
        templateUrl: base + '/view/system/user/list.html',
        controller: 'userListCtr',
        resolve: {
          deps: function ($ocLazyLoad) {
            return $ocLazyLoad.load(['bootstrap', 'placehoder', 'ngTable', 'uidialog',
              'treeview', base + '/script/controllers/system/user/userListCtr.js' ]);
          }
        }
      })

      .state('404', {
        url: '/404', templateUrl: 'exception/404.html'
      });

  $urlRouterProvider.otherwise('/index');
}]);

//统一处理错误
app.run(['$rootScope', '$state', function ($rootScope, $state) {
  //$rootScope.user = _user;
  $rootScope.user = {};

  $rootScope.$on('ocLazyLoad.moduleLoaded', function (e, module) {
    console.log('-------module loaded-------', module);
  });

  //资源未找到统一处理
  $rootScope.$on('$stateChangeStart', function (event, toState, fromState, fromParams) {
    if (!$rootScope.user) {
      event.preventDefault(); //取消默认的事件
      return;
    }
    //event.preventDefault(); //取消默认的事件
    //$state.go('404');
    console.log('-------$stateChangeStart---------');
    console.log(event); // "lazy.state"
    console.log(toState); // "lazy.state"
    console.log(fromState); // {a:1, b:2}
    console.log(fromParams); // {inherit:false} + default options
  });

  //资源未找到统一处理
  $rootScope.$on('$stateNotFound', function (event, toState, fromState, fromParams) {
    //event.preventDefault(); //取消默认的事件
    //$state.go('404');
    console.log('-------$stateNotFound---------');
    console.log(event); // "lazy.state"
    console.log(toState); // "lazy.state"
    console.log(fromState); // {a:1, b:2}
    console.log(fromParams); // {inherit:false} + default options
  });

  //处理模板解析过程中发生错误
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    //TODO 开发调试阶段把跳转404去掉
    //event.preventDefault(); //取消默认的事件
    //$state.go('404');
    console.log('-------$stateChangeError---------');
    console.log(toState); // "lazy.state"
    console.log(toParams); // {a:1, b:2}
    console.log(fromParams); // {inherit:false} + default options
    console.log(error); // {inherit:false} + default options
  });
}]);