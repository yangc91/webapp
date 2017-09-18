app.add.controller('deviceControlCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http','dialog','$timeout','$interval', function ($scope, $state, $sce, ngTableParams, $http, dialog, $timeout, $interval) {
    $scope.$emit('menuChange', '/ecss/deviceMC/toList');
    if (!supportB64) {
        $scope.supportB64 = false;
    } else {
        $scope.supportB64 = true;
    }
    $scope.$emit('menuChange', $state.current.url);
    $scope.device = {};

    $scope.memoryProcess = {
        width: 0
    }

    $scope.electronicProcess = {
        width: 0
    }

    $scope.electricProcess = {
        width: 0
    }

    $scope.tabNotice = [
        {
            active:true,disabled:false,heading:'设备管控'
        },
        {
            active:false,disabled:false,heading:'APP管控'
        },
        {
            active:false,disabled:false,heading:'操作状态查询'
        }
    ]
    
    $scope.tabClickFir = function () {
    	$state.go('ecss/deviceMC/toOperateMC',{id:$state.params.id, status:0})
    }
    
    $scope.tabClickSec = function () {
    	$state.go('ecss/deviceMC/toOperateMC',{id:$state.params.id, status:1})
    }
    
    $scope.tabClickThr = function () {
    	$state.go('ecss/deviceMC/toOperateMC',{id:$state.params.id, status:2})
    }

    $scope.toUsbInfo = function () {
        $state.go("audit/usb/toInfo", {id : $state.params.id, from : 1})
    }
    
    if($state.params.status==0) {
        $scope.tabNotice[0].active = true;
    } else if($state.params.status==1) {
    	$scope.tabNotice[1].active = true;
    } else {
    	$scope.tabNotice[2].active = true;
    }
    
   /* if()*/
    
    /**
     * 立即更新状态
     */
    $scope.refulshStatus = function() {
        sendReflushInstruction({operateType : 18, id: $state.params.id});
    }

    // 取消刷新
    $scope.cancelReflushTimer = function(){
        $interval.cancel($scope.reflushTimer);
    }

    $scope.cancelStartAppTimer = function(item){
        if(item.startAppTimer) {
            $interval.cancel(item.startAppTimer);
        }
    }

    $scope.cancelUninstallAppTimer= function(item){
        if(item.uninstallAppTimer) {
            $interval.cancel(item.uninstallAppTimer);
        }
    }

    // 切换页面是关闭所有定时器
    $scope.cancelAllAppTimer = function() {
        for (var i = 0 ; i < $scope.activeApps.length; i++) {
            $scope.cancelUninstallAppTimer($scope.activeApps[i]);
        }
        for (var j = 0 ; j < $scope.unactiveApps.length; j++) {
            $scope.cancelStartAppTimer($scope.unactiveApps[j]);
            $scope.cancelUninstallAppTimer($scope.unactiveApps[j]);
        }
    }

    $scope.cancelFirstPageResultTimer= function(){
        $interval.cancel($scope.firstPageResultTimer);
    }

    /**
     * 下发刷新指令（与其它管控指令区分）
     */
    function sendReflushInstruction (params) {
        $http({
            url : 'deviceMC/operateMC.do',
            method : 'POST',
            data : params,
            cache:false,
            responseType :  "json"
        })
            .success(function (data) {
                if(data.result) {
                    $scope.reflushSeconds = 30;
                    $scope.showReflushSeconds = true;

                    // 每5s请求一次后台，查看刷新指令执行结果
                    $scope.reflushTimer = $interval(function(){
                        if ($scope.reflushSeconds % 5 == 0) {
                            getFlushResult(data.deviceIds, data.instructionSeqs, $scope.reflushSeconds == 0);
                        }
                        $scope.reflushSeconds--;
                    },1000, 31);
                    $scope.reflushTimer.then(function () {
                        $scope.showReflushSeconds = false;
                    }, null, null);
                }
            }).error(function (data) {
            console.info(data);
            $defer.reject();
        });
    }

    function getFlushResult(deviceIds, instructionSeqs, lastRequest) {
        $http({
            url : 'deviceMC/ajaxDataList.do',
            method : 'POST',
            data : {
                start : 0,
                length : 10,
                draw : 0,
                deviceIds : deviceIds,
                instructionSeqs : instructionSeqs,
                lastRequest : lastRequest
            },
            cache:false,
            responseType :  "json"
        })
            .success(function (result) {
                if (result != null && result.data.length > 0) {
                    // 刷新指令执行超时
                    if (result.data[0].resultStatus == 2) {
                        $scope.showReflushSeconds = false;
                        $scope.cancelReflushTimer();
                        $scope.reflushFail = true;
                    } else if (result.data[0].resultStatus == 3) {
                        $scope.showReflushSeconds = false;
                        $scope.cancelReflushTimer();
                        $scope.reflushFail = false;
                        loadDevice();
                    }
                }

            }).error(function (data) {
            $scope.reflushFail = true;
            console.info(data);
            $defer.reject();
        });
    }

    $scope.pwdType = "password";

    $scope.closePwd = function(){
        $scope.pwdType = "text";
    }

    $scope.openPwd = function(){
        $scope.pwdType = "password";
    }

    /**
     * 外设状态
     * @type {Array}
     */
    $scope.outstatus = [
        {
            code: 'bluetoothStatus',
            name: "蓝牙"
        },
        {
            code: 'wifiStatus',
            name:"WIFI"
        },
        {
            code: 'cameraStatus',
            name:"摄像头"
        },
        {
            code: 'gpsStatus',
            name:"GPS"
        }
    ];

    $scope.activeApps=[];
    $scope.unactiveApps = [];

    loadDevice();
    /**
     * 加载设备状态信息
     */
    function loadDevice () {
        // 根据id号获取设备详细信息
        $http({
            url : 'deviceMC/queryDevice.do',
            method : 'POST',
            data : {
                id : $state.params.id
            },
            cache:false,
            responseType :  "json"
        })
        .success(function (result) {
            var deviceInfo = result.device;

            $scope.memoryProcess.width = deviceInfo.usedMemory/deviceInfo.memory * 100 + '%';

            for( var i = 0 ; i < $scope.outstatus.length; i++) {
                if (deviceInfo[$scope.outstatus[i].code] == 1 ) {
                    $scope.outstatus[i].value = '开启';
                } else if (deviceInfo[$scope.outstatus[i].code] == 2 ) {
                    $scope.outstatus[i].value = '关闭';
                } else {
                    $scope.outstatus[i].value = '暂无法获取';
                }
            }

            $scope.electricProcess.width = deviceInfo.electric + '%';

            // 管控、违规锁屏密码公用一个deviceInfo.screenPassword
            if (deviceInfo.screenPassword == null || deviceInfo.screenPassword == "") {
                $scope.screenStatus = '无密码锁屏';
                $scope.screenPassword = '无解锁密码';
                $scope.pwdType = "text";
            } else {
                $scope.screenStatus = '密码锁屏';
                $scope.screenPassword = deviceInfo.screenPassword;
                $scope.pwdType = "password";
            }

            $scope.deviceInfo = deviceInfo;
            // app管控
            if ($scope.tabNotice[1].active) {
                loadAppRunInfo();
            }

            // 管控结果
            if ($scope.tabNotice[2].active) {
                $scope.operatorResultList = [];
                $scope.currentResultPage = 1;
                $scope.operatorResultBusy = false;
                $scope.firstPageResulSeconds = 30;
                loadMoreOperatorResultList();
            }
        }).error(function (data) {
            console.info(data);
            $defer.reject();
        });

        // 根据id号获取设备上运行的策略
        $http({
            url : 'deviceMC/queryDeviceStrategy.do',
            method : 'POST',
            data : {
                id : $state.params.id
            },
            cache:false,
            responseType :  "text"
        })
            .success(function (result) {
                $scope.deviceStrategy = result == '' ? '未部署' : result;
            }).error(function (data) {
            console.info(data);
            $defer.reject();
        });
    }

    $scope.loadAppRunInfo = loadAppRunInfo;
    function loadAppRunInfo() {
        $http({
            url : 'deviceAppInfo/getAppList.do',
            method : 'POST',
            data : {
                id : $state.params.id
            },
            cache:false,
            responseType :  "json"
        })
        .success(function (result) {
            $scope.activeApps = [];
            $scope.unactiveApps = [];
            for(var i = 0; i< result.length; i++) {
                var it = result[i];
                if (it.isRun == '1') {
                    $scope.activeApps.push(it)
                } else {
                    $scope.unactiveApps.push(it)
                }
            }
        })
    }

    // 获取指令
    // 设备相关指令
    $scope.deviceInstruction = [];
    // 数据相关指令
    $scope.dataInstruction = []
    $http({
        url : 'baseinfo/dictionary/getOperatorInstruction.do',
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
        .success(function (result) {
            $scope.deviceInstruction = result.CMD_1;
            $scope.dataInstruction = result.CMD_2;
        }).error(function (data) {
        console.info(data);
        $defer.reject();
    });

    $scope.goBack = function(){
        $state.go('ecss/deviceMC/toList');
    }

    $scope.bigPicShow = false;
    $scope.picShow = function(item){
        item.bigPicShow = true;
    }
    $scope.picHide = function(item){
        item.bigPicShow = false;
    }

    /**
     * 下发指令弹出二次确认框
     * @param item
     */
    $scope.loadConfirmDiv = function(item){
        var param = buildDialog(item);
        dialog.openDialog(param);
    }

    function buildDialog(item) {
        var _$scope = $scope;
        var param = {};
        _$scope.instructionParam = {id : $state.params.id, operateType : item.orders};
        param.title = item.itemName;
        param.icon ='secondConfirm';
        //Integer operateType, Integer operateState, Long[] id, String screenPwd, String appName
        param.buttons = [
            {name : "取消", className:"btn-gray", callback:function($scope, dialog2, button, config){}},
            {
                name:"确定",
                className:"btn-red",
                callback:function($scope, dialog2, button, config){
                    $http({
                        url : 'deviceMC/operateMC.do',
                        method : 'POST',
                        data : _$scope.instructionParam,
                        cache:false,
                        responseType :  "json"
                    })
                        .success(function (result) {
                            resultDialog(result.result);
                        })
                        .error(function (result) {
                            $defer.reject();
                        });
                }
            }
        ];

        if (item.itemCode == 'CMD_LOCATE') {
            param.content = '<p class="secondConfirm">确定查询当前设备的位置吗？</p>\
		        		<p class="w300 fs14">\
		        			如果需要频繁定位该设备，您可以将<span class="desc-text" ng-click="funcalt($modalInstance,false)">执勤模式</span>策略部署到该设备\
		        		</p>';
            param.resolve={
                funcalt:function (dialog, obj) {
                    if(obj)return;
                    dialog.close();
                    $state.go("strategy/index");
                }
            }

        } else if (item.itemCode == 'CMD_PHOTO') {

            if (_$scope.deviceInfo.enableCarema == 2) {
                param.content = '<p class="secondConfirm">确定控制该设备拍照上传吗？</p>\
                        <p class="w300 fs14">\
		        			上传的图片是设备前置摄像头所拍摄 \
		        		</p>\
		        		<p class="w300 fs14">\
		        			摄像头已在策略中被禁用，继续发送指令强制执行吗? \
		        		</p>';
                param.buttons[1].name='继续发送';
            } else {
                param.content = '<p class="secondConfirm">确定控制设备拍照上传吗？</p>\
		        		<p class="w300 fs14">\
		        			远程控制前摄像头，拍摄照片并上传到后台.\
		        		</p>';
            }
        } else if (item.itemCode == 'CMD_REBOOT') {
            param.content = '<p class="secondConfirm">确定重新启动设备吗？</p>\
		        		<p class="w300 fs14">\
		        			远程操控设备重新启动.\
		        		</p>';
        } else if (item.itemCode == 'CMD_SHUTDOWN') {
                param.content = '<p class="secondConfirm">确定将设备关机吗？</p>\
		        		<p class="w300 fs14">\
		        			设备关机后将无法管控，确定发送该指令吗？\
		        		</p>';
        } else if (item.itemCode == 'CMD_LOCK_SCREEN') {
            param.content = '<p class="secondConfirm">确定对该设备进行密码锁屏吗？</p>\
                    		<p class="w300 fs14">\
                        		将为该设备随机生成锁屏密码，具体请查看页面右侧的设备状态\
                    		</p>';
            var screenPwd = '';

            if ($scope.screenPassword == '无解锁密码') {
                for(var i=0; i<6; i++) {
                    screenPwd += Math.floor(Math.random()*10);
                }
            } else {
                screenPwd = $scope.screenPassword;
            }

            _$scope.instructionParam.screenPwd = screenPwd;
        } else if (item.itemCode == 'CMD_UNLOCK_SCREEN') {
            param.content = '<p class="secondConfirm">确定清除设备的锁屏密码吗？</p>\
		        		<p class="w300 fs14">\
		        			远程将锁屏密码清除，滑动后可以使用手机\
		        		</p>';
            $scope.instructionParam.screenPwd = '';
        } else if (item.itemCode == 'CMD_CLEAN_DATA') {
            param.content = '<p class="secondConfirm">确定擦除设备数据吗？</p>\
		        		<p class="w300 fs14">\
		        			将通讯录、通话记录、短信、上网记录等相关数据进行擦除\
		        		</p>';
        } else if (item.itemCode == 'CMD_RESET') {
            param.content = '<p class="secondConfirm">确定恢复出厂时设置吗？</p>\
		        		<p class="w300 fs14">\
		        			恢复出厂将清除所有在手机中产生的数据、设置项、应用等，恢复到出厂时的预设状态\
		        		</p>';
        }

        return param;
    }

    function resultDialog(result) {
        var _$scope = $scope;
        if (result) {
            dialog.openDialog({
                icon:'success',
                content:'<p class="successTip">恭喜,指令下发成功!</p>\
								<div class="w300 fs14">\
									设备接收到指令后反馈还需要一段时间，你可以随时在【操作状态查询】中查看结果\
								</div>',
                buttons:[
                    { name:"取消", className:"btn-gray",callback:function($scope, dialog, button, config){}},
                    {
                        name:"立即查看",
                        className:"btn-green",
                        callback:function($scope, dialog, button, config){
                            $state.go('ecss/deviceMC/toOperateMC',{id:$state.params.id, status:2})
                        }
                    }
                ]
            })
        } else {
            dialog.openDialog({
                icon:'littleTrouble',
                content:'<p class="successTip">指令下发失败!</p>\
								<div class="w300 fs14">\
									服务器出错\
								</div>',
                buttons:[
                    { name:"取消", className:"btn-gray",callback:function($scope, dialog, button, config){}}
                ]
            })
        }
    }

    /**
     * alert警告框
     * @type {{toString: Function, close: Function, show: Function}}
     */
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
            var inf = {type: 'warning', closeable: true};
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

    $scope.uninstallApp = function (item) {
        var _$scope = $scope;

        var uninstallParam = {id : $state.params.id, operateType : 22, packageName : item.packageName};
        dialog.openDialog({
            title : '卸载应用',
            icon:'secondConfirm',
            content : '<p class="secondConfirm">确定远程卸载“'+item.name+'”吗？</p>\
		        		<p class="w300 fs14">\
		        			远程卸载应用时需要设备所有人确认。\
		        		</p>',
            buttons : [
                {name : "取消", className:"btn-gray", callback:function($scope, dialog2, button, config){}},
                {
                    name:"确定",
                    className:"btn-red",
                    callback:function($scope, dialog2, button, config){
                        $http({
                            url : 'deviceMC/operateMC.do',
                            method : 'POST',
                            data : uninstallParam,
                            cache:false,
                            responseType :  "json"
                        })
                        .success(function (data) {
                            item.waitAppSeconds = 30;
                            item.waitUninstallApp = true;

                            // 每5s请求一次后台，查看指令执行结果
                            item.uninstallAppTimer = $interval(function(){
                                if (item.waitAppSeconds % 5 == 0) {
                                    //getFlushResult(data.deviceIds, data.instructionSeqs, waitStartAppSeconds == 0);
                                    $http({
                                        url : 'deviceMC/getInstructionSeqsBySeqs.do',
                                        method : 'POST',
                                        data : {
                                            start : 0,
                                            length : 10,
                                            draw : 0,
                                            instructionSeq : data.instructionSeqs,
                                            lastRequest : item.waitAppSeconds == 0
                                        },
                                        cache:false,
                                        responseType :  "json"
                                    })
                                    .success(function (result) {
                                            // 指令执行超时
                                            if (result.resultStatus == 2 || result.resultStatus == 5 || result.resultStatus == 11) {
                                                _$scope.cancelUninstallAppTimer(item);
                                                item.waitUninstallApp = false;
                                                alertInf.show('卸载' + item.name + '执行失败！');
                                                alertInf.close(3000);
                                            } else if (result.resultStatus == 10) {
                                                _$scope.cancelUninstallAppTimer(item);
                                                item.waitUninstallApp = false;
                                                alertInf.show('卸载' + item.name + '超时！设备网络异常，导致平台获取结果超时。设备可能因为关机、重启、断网，暂时无法执行指令，重新接入网络后，会继续执行指令！');
                                                alertInf.close(3000);
                                            } else if (result.resultStatus == 12) {
                                                _$scope.cancelUninstallAppTimer(item);
                                                item.waitUninstallApp = false;
                                                alertInf.show('卸载' + item.name + '失败！警员确认前下发了多条启用APP指令，系统执行最近下发的一条，本条不执行！');
                                                alertInf.close(3000);
                                            } else if (result.resultStatus == 3) {
                                                _$scope.cancelUninstallAppTimer(item);
                                                var unactiveIndex = _$scope.unactiveApps.indexOf(item);
                                                if (unactiveIndex >= 0) {
                                                    _$scope.unactiveApps.splice(unactiveIndex, 1);
                                                }
                                                var activeIndex = _$scope.activeApps.indexOf(item);
                                                if (activeIndex >= 0) {
                                                    _$scope.activeApps.splice(activeIndex, 1);
                                                }
                                                item.waitUninstallApp = false;
                                                $http({
                                                    url : '../baseinfo/notice/sendMsgOnly.do',
                                                    method : 'POST',
                                                    data : {
                                                        imei: _$scope.deviceInfo.imei,
                                                        title:'设备管控应用卸载',
                                                        content: '您的 ' + item.name + ' 应用已被管理员强制卸载！'
                                                    },
                                                    responseType: 'json',
                                                    cache: false
                                                })
                                                .success(function (result) {
                                                })
                                            }
                                    }).error(function (data) {
                                        console.error(data);
                                        $defer.reject();
                                    });
                                }
                                item.waitAppSeconds--;
                            },1000, 31);
                            item.uninstallAppTimer.then(function () {
                                item.waitStartApp = false;
                            }, null, null);

                        })
                        .error(function (result) {
                            console.log('服务器异常');
                            $defer.reject();
                        });
                    }
                }
            ]
        });
    }

    /**
     * 启动应用
     * @param item
     */
    $scope.startApp = function (item) {
        var _$scope = $scope;
        var startParam = {id : $state.params.id, operateType : 16, packageName : item.packageName, type : 2};
        dialog.openDialog({
            title : '启动应用',
            icon:'secondConfirm',
            content : '<p class="secondConfirm">确定远程启用“'+item.name+'”吗？</p>\
		        		<p class="fs14">\
		        			此APP将在设备中直接打开\
		        		</p>',
            buttons : [
                {name : "取消", className:"btn-gray", callback:function($scope, dialog2, button, config){}},
                {
                    name:"确定",
                    className:"btn-red",
                    callback:function($scope, dialog2, button, config){
                        $http({
                            url : 'deviceMC/operateMC.do',
                            method : 'POST',
                            data : startParam,
                            cache:false,
                            responseType :  "json"
                        })
                            .success(function (data) {
                                item.waitStartAppSeconds = 30;
                                item.waitStartApp = true;

                                // 每5s请求一次后台，查看刷新指令执行结果
                                item.startAppTimer = $interval(function(){
                                    if (item.waitStartAppSeconds % 5 == 0) {
                                        //getFlushResult(data.deviceIds, data.instructionSeqs, waitStartAppSeconds == 0);
                                        $http({
                                            url : 'deviceMC/getInstructionSeqsBySeqs.do',
                                            method : 'POST',
                                            data : {
                                                start : 0,
                                                length : 10,
                                                draw : 0,
                                                instructionSeq : data.instructionSeqs,
                                                lastRequest : item.waitStartAppSeconds == 0
                                            },
                                            cache:false,
                                            responseType :  "json"
                                        })
                                        .success(function (result) {
                                                // 刷新指令执行超时
                                                if (result.resultStatus == 2 || result.resultStatus == 5 || result.resultStatus == 11) {
                                                    item.waitStartApp = false;
                                                    _$scope.cancelStartAppTimer(item);
                                                    alertInf.show('启动' + item.name + '执行失败！');
                                                    alertInf.close(3000);
                                                } else if (result.resultStatus == 10) {
                                                    item.waitStartApp = false;
                                                    _$scope.cancelStartAppTimer(item);
                                                    alertInf.show('启动' + item.name + '超时！设备网络异常，导致平台获取结果超时。设备可能因为关机、重启、断网，暂时无法执行指令，重新接入网络后，会继续执行指令！');
                                                    alertInf.close(3000);
                                                } else if (result.resultStatus == 12) {
                                                    item.waitStartApp = false;
                                                    _$scope.cancelStartAppTimer(item);
                                                    alertInf.show('启动' + item.name + '失败！警员确认前下发了多条启用APP指令，系统执行最近下发的一条，本条不执行！');
                                                    alertInf.close(3000);
                                                } else if (result.resultStatus == 3) {
                                                    _$scope.cancelStartAppTimer(item);
                                                    _$scope.activeApps.push(item);
                                                    var index = _$scope.unactiveApps.indexOf(item);
                                                    _$scope.unactiveApps.splice(index, 1);
                                                    item.waitStartApp = false;
                                                }
                                        }).error(function (data) {
                                            console.error(data);
                                            $defer.reject();
                                        });
                                    }
                                    item.waitStartAppSeconds--;
                                },1000, 31);
                                item.startAppTimer.then(function () {
                                    item.waitStartApp = false;
                                }, null, null);

                            })
                            .error(function (result) {
                                console.log('服务器异常');
                                $defer.reject();
                            });
                    }
                }
            ]
        });
    }
    
    //初始化地图
    function initBMap(lon,lat,address) {
    	var bmap,point,marker;
    	bmap = new BMap.Map("mapContainer", {minZoom:5,maxZoom:17});    //创建地图实例,设置地图允许的最小/大级别
		//debugger;
    	//alert(bmap+","+lon);
    	if(lon && lat) {
    		// 创建点坐标
            point = new BMap.Point(lon, lat);
    		marker = new BMap.Marker(point);
    		var label = new BMap.Label(address,{offset:new BMap.Size(-45,-75)});
			marker.setLabel(label);
    	} else {
    		//西安市政府
    		point = new BMap.Point(108.9463060000, 34.3474360000);
    	}
    	// 初始化地图,设置中心点坐标和地图级别。
        bmap.centerAndZoom(point,17);
        //添加一个平移缩放控件、一个比例尺控件和一个缩略图控件。
        bmap.addControl(new BMap.NavigationControl());
        //地图拖拽
    	bmap.enableDragging();
    	// 启用滚轮放大缩小。
    	bmap.enableScrollWheelZoom();
    	// 启用键盘操作。
    	bmap.enableKeyboard();
    	
    	//添加标注
    	if(marker){
    		bmap.addOverlay(marker);
    	}
    }
    
    //加载地图弹出框
    $scope.showMapDialog = function (pageResult) {
    	var result = JSON.parse(pageResult.instructionResult);
    	//result --- {"type":2,"data":{"lon":"112.35","lat":"25.122","time":"13562362351","address":""}}
    	//console.log(result.data.lon);
    	var mapDialog = dialog.openDialog({
            title : '位置信息',
            content : '<input type="hidden" id="abc" value="abc">' +
                            '<div id="mapContainer" style="height:400px;width: 600px;margin-top:-30px;">' +
                                '<div class="dialogNormal noResult">'+
                                    '<div class="faceLogo">'+
                                        '<img ng-src="../themes/default/images/noData.png" />'+
                                    '</div>'+
                                    '<div class="dialogContent">'+
                                        '<p class="secondConfirm">请稍后,正在加载地图资源!</p>'+
                                    '</div>'+
                                '</div>'+
                            '</div>',
            buttons : [
//                {name : "取消", className:"btn-gray", callback:function($scope, mapDialog, button, config){}},
                {
                    name: '刷新',
                    className: 'btn-green',callback: function (scope, dialog, button, config) {
                    	//console.log("=====" + document.getElementById("abc").value);
                    	
                    	//初始化地图
                    	initBMap(result.data.lon, result.data.lat, result.data.address);                    	
                        
                    	return false;
                    }
                }
            ]
        });
    	
		$timeout(function(){
			//console.log("=====" + document.getElementById("abc").value);
			//初始化地图
        	initBMap(result.data.lon, result.data.lat, result.data.address);
		}, 1500);
		
    }

    /**
     * 下拉滚动动态获取指令执行结果
     * @returns {boolean}
     */
    $scope.loadMoreOperatorResultList = loadMoreOperatorResultList;

    function loadMoreOperatorResultList() {

        if ($scope.lastResultPage && $scope.lastResultPage) {
            return false;
        }

        if ($scope.operatorResultBusy) {
            return false;
        }
        $scope.operatorResultBusy = true;

        $http.post('./deviceMC/queryInstructionSeqs.do',
            {
                currentPage:$scope.currentResultPage,
                imei:$scope.deviceInfo.imei,
                lastRequest : true
            },
            {
                responseType: 'json',
                cache: false
            }).success(function(data) {
                if (data.resultList.dataList && data.resultList.dataList.length > 0) {

                    for (var i = 0; i < data.resultList.dataList.length; i++) {
                        var r = data.resultList.dataList[i];
                        if (r.instructionName == '密码锁屏' && r.instructionContent == '{"pwd":""}') {
                            r.instructionName = '清除锁屏';
                            r.instructionType = 'CMD_UNLOCK_SCREEN';
                        }
                        if ($scope.currentResultPage == 1 && i == 0 && r.resultStatus != 2 && r.resultStatus != 3 && r.resultStatus != 5 && r.resultStatus != 11 && r.resultStatus != 12) {
                            r.resultStatus = 1;
                        }
                        setResultMsg(r);
                        $scope.operatorResultList.push(data.resultList.dataList[i]);
                    }
                    if ($scope.currentResultPage == 1 && data.resultList.dataList[0].resultStatus != 3 ) {
                        // 第一条结果动态查询
                        $scope.firstPageResultTimer = $interval(function () {
                            if ($scope.firstPageResulSeconds % 5 == 0) {
                                $http.post('./deviceMC/getInstructionSeqsBySeqs.do',
                                    {
                                        instructionSeq: data.resultList.dataList[0].instructionSeq,
                                        lastRequest: $scope.firstPageResulSeconds == 0
                                    },
                                    {
                                        responseType: 'json',
                                        cache: false
                                    })
                                    .success(function (data) {
                                        if (data.instructionName == '密码锁屏' && data.instructionContent == '{"pwd":""}') {
                                            data.instructionName = '清除锁屏';
                                            data.instructionType = 'CMD_UNLOCK_SCREEN';
                                        }
                                        $scope.operatorResultList[0] = data;
                                        if (data.resultStatus == 2 || data.resultStatus == 3 || data.resultStatus == 5 || data.resultStatus == 11 || data.resultStatus == 12) {
                                            $scope.cancelFirstPageResultTimer();
                                        }
                                        setResultMsg(data);
                                    })
                            }
                            $scope.firstPageResulSeconds--;
                        }, 1000, 31);

                    }
                }
                $scope.currentResultPage++;
                $scope.lastResultPage = data.resultList.lastPage;
                $scope.operatorResultBusy = false;
        });
    };

    /**
     * 设置指令执行结果前端页面提示信息
     * @param r : 指令执行结果对象
     */
    function setResultMsg(r) {
        switch (r.resultStatus) {
            case 1:
                r.fontClass = 'fcgreen';
                // 执行结果展示信息
                if (r.instructionType == 'CMD_START_APP') {
                    r.resultMsg = '启用“' + r.appName + '”指令下发成功,正在等待设备接收指令...';
                } else if (r.instructionType == 'CMD_UNINSTALL_APP'){
                    r.resultMsg = '卸载“' + r.appName + '”指令下发成功,正在等待设备接收指令...';
                } else {
                    r.resultMsg = '指令下发成功,正在等待设备接收指令...';
                }

                // 执行结果展示信息说明
                r.resultMsgInfo = '执行结果反馈需要一些时间,您可以前往其他页面继续使用,执行结果将稍后反馈给您。';
                break;
            case 7:
                r.fontClass = 'fcgreen';
                r.resultMsg = '指令下发成功,正在等待设备接收指令...';
                r.resultMsgInfo = '执行结果反馈需要一些时间,您可以前往其他页面继续使用,执行结果将稍后反馈给您。';
                break;
            case 2:
                r.fontClass = 'fcred';
                if (r.instructionType == 'CMD_START_APP') {
                    r.resultMsg = '启用“' + r.appName + '”失败！';
                } else if (r.instructionType == 'CMD_UNINSTALL_APP'){
                    r.resultMsg = '卸载“' + r.appName + '”失败！';
                } else {
                    r.resultMsg = '管控失败!';
                }
                r.resultMsgInfo = '设备执行指令失败！';
                break;
            case 3:
                r.fontClass = 'fcgreen';
                if (r.instructionType == 'CMD_START_APP') {
                    r.resultMsg = '恭喜您，启用“' + r.appName + '”成功！';
                } else if (r.instructionType == 'CMD_UNINSTALL_APP'){
                    r.resultMsg = '恭喜您，卸载“' + r.appName + '”成功！';
                } else {
                    r.resultMsg = '恭喜您，指令执行成功！!';
                }
                break;
            case 5:
                r.fontClass = 'fcred';
                if (r.instructionType == 'CMD_START_APP') {
                    r.resultMsg = '启用“' + r.appName + '”失败！';
                } else if (r.instructionType == 'CMD_UNINSTALL_APP'){
                    r.resultMsg = '卸载“' + r.appName + '”失败！';
                } else {
                    r.resultMsg = '管控失败！';
                }
                r.resultMsgInfo = '终端执行超时！';
                break;
            case 10:
                r.fontClass = 'fcred';
                if (r.instructionType == 'CMD_START_APP') {
                    r.resultMsg = '启用“' + r.appName + '”超时！';
                } else if (r.instructionType == 'CMD_UNINSTALL_APP'){
                    r.resultMsg = '卸载“' + r.appName + '”超时！';
                } else {
                    r.resultMsg = '管控超时!设备网络异常导致平台获取结果超时...！';
                }
                r.resultMsgInfo = '设备可能因为关机重启等原因，导致网络不通，暂时无法执行指令，设备重新接入网络后会继续执行指令！';
                break;
            case 11:
                r.fontClass = 'fcred';
                r.resultMsg = '管控失败！';
                r.resultMsgInfo = '终端服务被占用';
                break;
            case 12:
                r.fontClass = 'fcred';
                if (r.instructionType == 'CMD_START_APP') {
                    r.resultMsg = '启用“' + r.appName + '”失败！';
                    r.resultMsgInfo = '因为在警员确认前下发了多条启用APP指令，系统执行最近下发的一条，本条指令未执行，您可以重新下发指令！';
                } else if (r.instructionType == 'CMD_UNINSTALL_APP'){
                    r.resultMsg = '卸载“' + r.appName + '”失败！';
                    r.resultMsgInfo = '因为在警员确认前下发了多条启用APP指令，系统执行最近下发的一条，本条指令未执行，您可以重新下发指令！';
                } else {
                    r.resultMsg = '管控失败！';
                    r.resultMsgInfo = '管理员已变更指令！';
                }
                break;
        }
    }
}]);
