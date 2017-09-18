/**
 * Created by Administrator on 2016/7/15.
 */
app.add.controller('usbLogCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', '/'+$state.current.name );

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


    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };

    //$state.params.id == 1?$scope.tabNotice[1].active=true:$scope.tabNotice[0].active=true;

    $scope.toUsbInfo = function (item) {
        $state.go("audit/usb/toInfo", {id : item.deviceId, from : 2})
    }

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

                // 部门条件
                if (null != $scope.selectDept) {
                    condition.deptId = $scope.selectDept.id;
                } else {
                    condition.deptId = null;
                }

                $http({
                    url : '../audit/usb/list.do',
                    method : 'POST',
                    data : condition,
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
            }
        }
    );

    $scope.clickNetTr = function(item){
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    };

}])
