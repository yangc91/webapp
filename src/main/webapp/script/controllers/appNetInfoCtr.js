/*网络监测详情*/
app.add.controller('appNetInfoCtr',['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', '/audit/appNet/list');

    $scope.goBack=function () {
        $state.go('audit/appNet/list');
    }
    $scope.goFlowInd = function () {
        $state.go('audit/appNet/list',{id:1});
    }
    $scope.tabNotice = [
        {
            active:true,disabled:false,heading:'网络访问'
        },
        {
            active:false,disabled:false,heading:'流量监测'
        }
    ]

    /*左侧导航栏点击收起*/
    $scope.deviceState = true;
    $scope.changestate = function () {
        $scope.deviceState = !$scope.deviceState;
    }

    $scope.deviceState2 = true;
    $scope.changestate2 = function () {
        $scope.deviceState2 = !$scope.deviceState2;
    }
    $scope.deviceState3 = true;
    $scope.changestate3 = function () {
        $scope.deviceState3 = !$scope.deviceState3;
    }

    $scope.netTypeList = [];

    $scope.netTypeArray = [{
        "value" : "1",
        "name" : "外网",
        "id":'internal'
    },{
        "value" : "2",
        "name" : "内网",
        "id":'external'
    }];

    $scope.netTypeSelect = function() {
        var value = this.netType.value;
        if (this.netType.selected) {
            $scope.netTypeList.push(value);
        } else {
            var index = $scope.netTypeList.indexOf(value);
            $scope.netTypeList.splice(index, 1);
        }
        tableReload();
    };

    $scope.browerSelected = false;
    $scope.browerSelect = function() {
        tableReload();
    }

    $scope.tab_1_time = 4;

    $scope.changeTimeType = function () {
        tableReload();
    }

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
            $scope.tableParamsNet = new ngTableParams(
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
                        condition.deviceId = $state.params.id;
                        // 时间范围条件
                        condition.timeType = $scope.tab_1_time;

                        // 访问类型条件
                        condition.netTypeArray = $scope.netTypeList;
                        //安全浏览器
                        condition.browerSelected = $scope.browerSelected;

                        $http({
                            url : '../audit/appNet/appNetlist.do',
                            method : 'POST',
                            data : condition,
                            cache:false,
                            responseType :  "json"
                        })
                        .success(function (result) {
                            var data = result.data;
                            $scope.appNumber = result.appNumber;

                            var totalCount = data.totalCount;
                            var dataList = data.dataList;

                            $scope.totalCount = totalCount;

                            if (dataList.length > 0) {
                                $scope.prevItem = dataList[0];
                                dataList[0].visited = true;
                            } else {
                                $scope.prevItem = {};
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
        $scope.tableParamsNet.page(1);
        $scope.tableParamsNet.reload();
    };

}])