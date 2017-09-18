/**
 * 主界面的处理
 * @author 马德成
 * @date 2016/6/6
 */
app.add.controller('homeCtr', ['$rootScope', '$scope', '$state', '$http', '$timeout', function ($rootScope, $scope, $state, $http, $timeout) {
    $scope.$emit('menuChange', $state.current.url);
	
    $scope.supportB64 = supportB64;

    //跳转到 人员设备管理-设备管控
	$scope.goToPersonDevList = function () {
		$state.go("ecss/deviceMC/toList");
	}
	
	//跳转到 安全审计-审计日志(未审计)
	$scope.goToAuditLogList = function () {
		$state.go("audit/log/list",{auditStatus:0});
	}
	
	//跳转到 安全审计-违规监测黑名单设备
	$scope.goToBlackDevList = function () {
		$state.go("audit/appIllegal/list",{id:1});
	}
	
	//跳转到 安全审计-网络监测流量监测
	$scope.goToFlowList = function () {
		$state.go("audit/appNet/list",{id:1});
	}
	
	//跳转到 定位与丢失
	$scope.goToLocateAndLostList = function () {
		$state.go("locateAndLost/toPage");
	}
	
	//跳转到 应用运行监测
	$scope.goToAppOperationList = function () {
		$state.go("audit/appOperation/list");
	}
	
    var alertInf = {
        toString: function () {
            return '[object mdcalert]'
        },

        /**
         * alert对话框超时
         * @param time 时长,单位毫秒
         */
        close: function (time) {
            var _this = this;
            var myAlert = _this.toString() == '[object mdcalert]';

            $timeout(function () {
                (myAlert ? $scope : _this).alert = null;
            }, (typeof time == 'undefined'? 2000 : time));
        },

        /**
         * 显示警告对话框
         * @param type
         * @param msg
         * @param time
         */
        show: function (type, msg, time) {
            var inf = {type: 'success', closeable: true};
            if (arguments.length == 1) {
                inf.msg = type;
            } else {
                inf.type = type || 'success';
                inf.msg = msg;
                inf.time = time;
            }

            var _this = this;
            var myAlert = _this.toString() == '[object mdcalert]';

            $timeout(function () {
                (myAlert ? $scope : _this).alert = inf;
            }, typeof inf.time == 'undefined'? 100 : inf.time);
        }
    };
    $scope.alertInf = alertInf;
}]);