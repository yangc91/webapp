/**
 * Created by Administrator on 2016/7/15.
 */
app.add.controller('appNetCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', '/'+$state.current.name);

    //回车键搜索
    $scope.myKeyup = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchClick();
    	}
    }
    
    // 搜索条件
    $scope.searchClick = function () {
        tableReload();
    }
    
    $scope.cleanSearch = function () {
    	$scope.search = "";
    	tableReload();
    };

    // 部门条件
    $scope.selectDept = {};
    $scope.showTree = false;
    $scope.showDept = function () {
        $scope.showTree = $scope.showTree == true ? false : true;
    }

    //鼠标离开搜索框,树消失
    $scope.closeTree=function () {
        $scope.showTree = false;
    }
    //部门搜索对象
    $scope.d = {};
    $scope.currentdeptPage = 0;
    $scope.deptList = [];
    loadMoreDeptList();
    /**
     * 下拉滚动动态获取部门
     * @returns {boolean}
     */
    $scope.loadMoreDeptList = loadMoreDeptList;

    function loadMoreDeptList() {

        if ($scope.deptbusy) {
            return false;
        }
        $scope.deptbusy = true;

        $http.post('../baseinfo/notice/getMoreDeptList.do',
            {
                currentPage:$scope.currentdeptPage,
                deptName:$scope.d.deptName
            },
            {
                responseType: 'json',
                cache: false
            }).success(function(data) {
            $scope.deptbusy = false;
            if (data.deptList && data.deptList.length > 0) {
                for (var i = 0; i < data.deptList.length; i++) {
                    $scope.deptList.push(data.deptList[i]);
                }
            }
            $scope.currentdeptPage++;
        });

    };

    //回车键搜索
    $scope.myKeyupdept = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchdept();
    	}
    }
    
    /**
     * 搜索部门
     */
    $scope.searchdept = function(){
        $scope.deptList = [];
        $scope.currentdeptPage = 0;
        $scope.loadMoreDeptList();
    }

    /**
     * 选中部门
     * @param dept
     */
    $scope.onSelectedDept = function(dept) {
        $scope.selectDept = dept;
        $scope.showTree = false;
        tableReload();
    }

    $scope.removeSelectDept = function () {
        $scope.selectDept = null;
        tableReload();
    }

    $scope.tabNetTime = 4;
    $scope.tabFlowTime = 5;

    $scope.netTypeList = [];
    $scope.netTypeArray = [{
        "value" : "1",
        "name" : "外网",
        "id":"internal"
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
    // 安全浏览器
    $scope.browerSelected = false;
    $scope.browerSelect = function() {
        tableReload();
    }
    $scope.changeTimeType = function () {
        tableReload();
    }
    function tableReload() {
        if ($scope.tabNotice[0].active) {
            $scope.tableParamsNet.page(1);
            $scope.tableParamsNet.reload();
        } else {
            $scope.tableParamsFlow.page(1);
            $scope.tableParamsFlow.reload();
        }
    };

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
    $scope.netInfo = function (item) {
        $state.go("audit/appNet/netInfo", {id : item.deviceId})
    }
    $scope.flowInfo = function (item) {
        $state.go("audit/appNet/flowInfo", {id : item.deviceId});
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

    $scope.deviceState3 = true;
    $scope.changestate3 = function () {
        $scope.deviceState3 = !$scope.deviceState3;
    }

    var conditionNet = {draw : 1};
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

                conditionNet.start = ( page - 1 ) * size;
                conditionNet.length = size;
                conditionNet.search = $scope.search;

                // 部门条件
                if (null != $scope.selectDept) {
                    conditionNet.deptId = $scope.selectDept.id;
                } else {
                    conditionNet.deptId = null;
                }
                // 时间范围条件
                conditionNet.timeType = $scope.tabNetTime;
                // 访问类型条件
                conditionNet.netTypeArray = $scope.netTypeList;
                //安全浏览器
                conditionNet.browerSelected = $scope.browerSelected;

                $http({
                    url : '../audit/appNet/appNetlist.do',
                    method : 'POST',
                    data : conditionNet,
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
                        $scope.prevItemNet = dataList[0];
                        dataList[0].visited = true;
                    } else {
                        $scope.prevItemNet = {};
                    }

                    if(totalCount==0){
                        $scope.noResultContent1 = true;
                    }else{
                        $scope.noResultContent1 = false;
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

    $scope.clickNetTr = function(item){
        $scope.prevItemNet && ($scope.prevItemNet.visited = false);
        item.visited = true;
        $scope.prevItemNet = item;
    };

    var conditionFlow = {draw : 1};
    $scope.tableParamsFlow = new ngTableParams(
        {
            page: 1,  // 初始化显示第几页
            count: window.innerWidth>1600?7:(window.innerWidth>1366?6:5) //初始化分页大小
        },
        {
            counts: [/*5,10,20*/], //控制每页显示大小
            paginationMaxBlocks: 5, //最多显示页码按钮个数
            paginationMinBlocks: 2,//最少显示页码按钮个数
            getData: function($defer, params) {
                var page = params.page();
                var size = params.count();

                conditionFlow.start = ( page - 1 ) * size;
                conditionFlow.length = size;

                conditionFlow.search = $scope.search;
                // 部门条件
                if (null != $scope.selectDept) {
                    conditionFlow.deptId = $scope.selectDept.id;
                } else {
                    conditionFlow.deptId = null;
                }
                // 时间范围条件
                conditionFlow.timeType = $scope.tabFlowTime;
                conditionFlow.format = '%Y-%m';

                $http({
                    url : '../audit/appNet/flowLogList.do',
                    method : 'POST',
                    data : conditionFlow,
                    cache:false,
                    responseType :  "json"
                })
                .success(function (result) {
                    var data = result.data;
                    $scope.deviceNumber = result.deviceNumber;

                    var totalCount = data.totalCount;
                    var dataList = data.dataList;
                    $scope.totalCount = totalCount;

                    if (dataList.length > 0) {
                        $scope.prevItemFlow = dataList[0];
                        dataList[0].visited = true;
                    } else {
                        $scope.prevItemFlow = {};
                    }
                    if(totalCount==0){
                        $scope.noResultContent2 = true;
                    }else{
                        $scope.noResultContent2 = false;
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

    $scope.clickFlowTr = function(item){
        $scope.prevItemFlow && ($scope.prevItemFlow.visited = false);
        item.visited = true;
        $scope.prevItemFlow = item;
    };

}])
