/**
 * Created by Administrator on 2016/7/15.
 */
app.add.controller('appFlowListCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', '/'+$state.current.name);
    $scope.tabNotice = [
        {
            active:true,disabled:false,heading:'网络访问'
        },
        {
            active:false,disabled:false,heading:'流量监测'
        }
    ]
    $state.params.id == 1?$scope.tabNotice[1].active=true:$scope.tabNotice[0].active=true;

    /*网络监测查看更多*/
    $scope.netInfo = function () {
        $state.go("audit/appNet/netInfo")
    }
    $scope.flowInfo = function () {
        $state.go("audit/appNet/flowInfo");
    }

    $scope.netTabClickFir = function () {
        $state.go('audit/appNet/list',{id:0});
    }
    $scope.netTabClickSec = function () {
        $state.go('audit/appNet/list',{id:1});
    }
    
    /*左侧导航栏点击收起*/
    $scope.deviceState = true;
    $scope.changestate = function () {
        $scope.deviceState = !$scope.deviceState;
    }

    $scope.deviceState2 = true;
    $scope.changestate2 = function () {
        $scope.deviceState2 = !$scope.deviceState2;
    }

    // draw 参数，后台修改后可去除
    var condition = {draw : 1};

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
                condition.search = $scope.search;

                if (null != $scope.selectDept ) {
                    condition.deptId = $scope.selectDept.id;
                } else {
                    // condition.deptId = null;
                }

                //condition.bindAsset = bindAsset;
                //condition.deviceModelArray = deviceModelSelectList;
                //condition.deviceGroupArray = deviceGroupSelectList;

                $http({
                    url : '../audit/appNet/auditLoglist.do',
                    method : 'POST',
                    data : condition,
                    cache:false,
                    responseType :  "json"
                })
                .success(function (result) {
                    var data = result.data;
                    $scope.totalRecords = result.persionTotalNum;

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
            }
        }
    );

    $scope.clickTr = function(item){
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    };


}])
