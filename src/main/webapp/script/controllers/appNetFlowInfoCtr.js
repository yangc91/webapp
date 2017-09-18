/*流量监测详情*/
app.add.controller('appNetFlowInfoCtr',['$scope', '$state', '$sce', 'ngTableParams', '$http','highchartsNG', function ($scope, $state, $sce, ngTableParams, $http, highchartsNG) {
    $scope.$emit('menuChange', '/audit/appNet/list');

    $scope.goBack=function () {
        $state.go('audit/appNet/list', {id : 1});
    }
    $scope.netTabClickFir = function () {
        $state.go('audit/appNet/list',{id:0});
    }
    $scope.tabNotice = [
        {
            active:false,disabled:false,heading:'网络访问'
        },
        {
            active:true,disabled:false,heading:'流量监测'
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

    $scope.tabFlowTime = 5;

    /*$scope.addPoints = function () {
     var seriesArray = $scope.chartConfig.series
     var rndIdx = Math.floor(Math.random() * seriesArray.length);
     seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20])
     };*/

    /* $scope.addSeries = function () {
     var rnd = []
     for (var i = 0; i < 10; i++) {
     rnd.push(Math.floor(Math.random() * 20) + 1)
     }
     $scope.chartConfig.series.push({
     data: rnd
     })
     }*/

    /*$scope.removeRandomSeries = function () {
     var seriesArray = $scope.chartConfig.series
     var rndIdx = Math.floor(Math.random() * seriesArray.length);
     seriesArray.splice(rndIdx, 1)
     }*/

    /*$scope.toggleLoading = function () {
     this.chartConfig.loading = !this.chartConfig.loading
     }*/
    $scope.chartValueList = [
        0, 0, 0, 0, 0, 0,0,
        0, 0, 0, 0, 0, 0,0,
        0, 0, 0, 0, 0, 0,0,
        0, 0, 0, 0, 0, 0,0,
        0, 0, 0
    ];
    $scope.chartXList = [
        '1号', '2号', '3号', '4号', '5号', '6号','7号',
        '8号', '9号', '10号', '11号', '12号', '13号','14号',
        '15号', '16号', '17号', '18号', '19号', '20号','21号',
        '22号', '23号', '24号', '25号', '26号', '27号','28号',
        '29号', '30号', '31号'
    ];

    $scope.limitFlowSet = {
        plotLines: [{
            color: '#FF0000',
            width: 2,
            value: 500,
            label:{
                text:'阈值：500MB',
                style:{
                    color:'red'
                }
            }
        }]
    },
    $scope.chartConfig = {
        options: {
            chart: {
                type: 'column',
                zoomType: 'x'
            }
        },
        series: [{
            data: $scope.chartValueList,
            name:'已用流量',
            pointWidth: 20,//柱子宽度
            color: '#1caf9a',//柱子颜色
            tooltip:{
                valueSuffix:'MB'
            }
        }],
        title: {
            text: ''
        },
        xAxis: {
            currentMin: 0,
            currentMax: 30,
            minRange: 1,
            categories: $scope.chartXList
        },
        credits:{
            text:null
        },
        loading: false
    };

    $scope.changeTimeType = function () {
        loadChart();
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
        }).error(function (data) {
            console.info(data);
            $defer.reject();
        });
    }

    /**
     * 加载图标
     */
    loadChart();
    function loadChart() {
        // draw 参数，后台修改后可去除
        var condition = {draw : 1};
        condition.start = 0;
        condition.length = 31;
        condition.search = $scope.search;
        // 部门条件
        if (null != $scope.selectDept) {
            condition.deptId = $scope.selectDept.id;
        } else {
            condition.deptId = null;
        }
        // 时间范围条件
        condition.timeType = $scope.tabFlowTime;
        condition.format = '%Y-%m-%d';
        condition.deviceId = $state.params.id;

        $http({
            url : '../audit/appNet/flowLogList.do',
            method : 'POST',
            data : condition,
            cache:false,
            responseType :  "json"
        })
        .success(function (result) {
            var data = result.data;
            var dataList = data.dataList;
            if (dataList.length > 0) {
                resetChartValueList();
                for (var i=0; i< dataList.length; i++) {
                    var item = dataList[i];
                    var uploadTimeStr = dataList[i].uploadTimeStr;
                    var index = parseInt(uploadTimeStr.substr(uploadTimeStr.length-2,2)) - 1;
                    $scope.chartValueList[index] = parseInt(item.flowData,0);
                }
                $scope.limitFlowSet.plotLines[0].label.text = '阈值：' + dataList[0].limitFlow + 'MB';
                $scope.limitFlowSet.plotLines[0].value = parseInt(dataList[0].limitFlow, 0);
                $scope.chartConfig.yAxis = $scope.limitFlowSet
            } else {
                resetChartValueList();
                $scope.chartConfig.yAxis = null;
            }
        }).error(function (data) {
            console.info(error);
            $defer.reject();
        });
    }

    /**
     * 重置x值
     */
    function resetChartValueList() {
        for (var i = 0 ; i< $scope.chartValueList.length; i++) {
            $scope.chartValueList[i] = 0;
        }
    }
}])