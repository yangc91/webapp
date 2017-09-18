/*网络监测详情*/
app.add.controller('usbInfoCtr',['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', '/audit/usb/toList');

    $scope.goBack=function () {
        var from = $state.params.from;
        if (from == 2) {
            $state.go('audit/usb/toList');
        } else {
            $state.go('ecss/deviceMC/toOperateMC',{id:$state.params.id, status:0})
        }

    }

    $scope.startTime = null;
    $scope.endTime = null;

    $scope.startTimeClass=true;
    $scope.changeStartTime = function () {
        if($scope.startTime && $scope.startTime!=""){
            $scope.startTimeClass=false
        }else{
            $scope.startTimeClass=true
        }
        tableReload();
    };

    $scope.endTimeClass=true;
    $scope.changeEndTime = function () {
        if($scope.endTime && $scope.endTime!=""){
            $scope.endTimeClass=false
        }else{
            $scope.endTimeClass=true
        }
        tableReload();
    };

    /*左侧导航栏点击收起*/
    $scope.deviceState = true;
    $scope.changestate = function () {
        $scope.deviceState = !$scope.deviceState;
    }

    $scope.statusList = [];

    $scope.statusArray = [{
        "value" : "1",
        "name" : "已连接",
        "id":'connect'
    },{
        "value" : "2",
        "name" : "断开连接",
        "id":'disconnect'
    }];

    $scope.statusSelect = function() {
        var value = this.status.value;
        if (this.status.selected) {
            $scope.statusList.push(value);
        } else {
            var index = $scope.statusList.indexOf(value);
            $scope.statusList.splice(index, 1);
        }
        tableReload();
    };

    // draw 参数，后台修改后可去除
    var condition = {draw : 1};

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
            $scope.deviceInfo = deviceInfo;
            $scope.tableParams = new ngTableParams(
                {
                    page: 1,  // 初始化显示第几页
                    count: window.innerWidth>1600?10:(window.innerWidth>1366?7:5) //初始化分页大小
                },
                {
                    counts: [/*5,10,20*/], //控制每页显示大小
                    paginationMaxBlocks: 5, //最多显示页码按钮个数
                    paginationMinBlocks: 2,//最少显示页码按钮个数
                    getData: function($defer, params) {
                        var page = params.page();
                        var size = params.count();

                        condition.start = ( page - 1 ) * size;
                        condition.length = size;

                        condition.imei = $scope.deviceInfo.imei;
                        // 连接状态
                        condition.statusArray = $scope.statusList;

                        condition.startTime = $scope.startTime;
                        condition.endTime = $scope.endTime;

                        $http({
                            url : '../audit/usb/info.do',
                            method : 'POST',
                            data : condition,
                            cache:false,
                            responseType :  "json"
                        })
                        .success(function (result) {
                            var data = result.data;
                            var totalCount = data.totalCount;
                            var dataList = data.dataList;

                            $scope.totalCount = totalCount;

                            if (dataList.length > 0) {
                                $scope.prevItem = dataList[0];
                                dataList[0].visited = true;
                            } else {
                                $scope.prevItem = {};
                            }

                            if(totalCount==0){
                                $scope.noResultContent = true;
                            }else{
                                $scope.noResultContent = false;
                            }

                            params.total(totalCount);
                            $defer.resolve(dataList);
                        }).error(function (data) {
                            console.info(error);
                            $defer.reject();
                        });

                        $scope.clickTr = function(item){
                            $scope.prevItem && ($scope.prevItem.visited = false);
                            item.visited = true;
                            $scope.prevItem = item;
                        };
                    }
                }
            );
        }).error(function (data) {
            console.info(data);
            $defer.reject();
        });
    }

    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };

}])