/**
 * 系统日志列表
 * Created by  yangchun on 2016/6/14.
 */
app.add.controller('systemLogCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {

    $scope.$emit('menuChange', $state.current.url);

    $scope.deviceState = true;
    $scope.changestate = function () {
        $scope.deviceState = !$scope.deviceState;
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
    
    $scope.logTypeList = [{
        "value" : "1",
        "name" : "登录日志"
    },{
        "value" : "2",
        "name" : "操作日志"
    },{
        "value" : "3",
        "name" : "运行日志"
    }];

    var logTypeSelectList = [];

    $scope.logTypeSelect = function() {
        var value = this.logType.value;

        if (this.logType.selected) {
            logTypeSelectList.push(value);
        } else {
            var index = logTypeSelectList.indexOf(value);
            logTypeSelectList.splice(index, 1);
        }

        tableReload();
    };
    $scope.dateVal = true;
    $scope.chooseDate = function () {
        $scope.dateVal = false;
    }
    // draw 参数，后台修改后可去除
    search = {
        draw : 1
    };

    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };

    $scope.tableParams = new ngTableParams(
    {
        page: 1,  // 初始化显示第几页
        count: window.innerWidth>1600?10:(window.innerWidth>1366?7:5) // 初始化分页大小
    },
    {
        counts: [/*5,10,20*/], //控制每页显示大小
        paginationMaxBlocks: 5, //最多显示页码按钮个数
        paginationMinBlocks: 2,//最少显示页码按钮个数
        getData: function($defer, params) {
            var page = params.page();
            var size = params.count();

            search.start = ( page - 1 ) * size;
            search.length = size;
            search.startTime = $scope.startTime;
            search.endTime = $scope.endTime;
            search.logTypeArray = logTypeSelectList;

            $http({
                url : 'system/syslog/list.do',
                method : 'POST',
                data : search,
                cache:false,
                responseType :  "json"
            })
            .success(function (result) {
                var data = result.data;
                $scope.totalRecords = result.logTotalNum;

                var totalCount = data.totalCount;
                var dataList = data.dataList;

                $scope.resultRecords = totalCount;

                if (dataList.length > 0) {
                    $scope.prevItem = dataList[0];
                    dataList[0].visited = true;
                } else {
                    $scope.prevItem = {};
                }
                
                $scope.noResultContent="false";
                if(totalCount == 0){
                	$scope.noResultContent="true";
                }
                
                params.total(totalCount);
                $defer.resolve(dataList);
            }).error(function (data) {
                console.info(error);
                $defer.reject();
            });
        }
    });
    
    $scope.clickTr = function(item){
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    };
}]);