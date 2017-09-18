/**
 * 人员设备信息控制器
 * Created by  yangchun on 2016/6/14.
 */
app.add.controller('personCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http' , 'ivhTreeviewMgr', '$timeout', function ($scope, $state, $sce, ngTableParams, $http, ivhTreeviewMgr, $timeout) {
    $scope.$emit('menuChange', $state.current.url);
    // draw 参数，后台修改后可去除
    var condition = {draw : 1};

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
    //清空搜索条件
    $scope.cleanSearch=function () {
        $scope.search = "";
        tableReload();
    }
    //鼠标离开搜索框,树消失
    $scope.closeTree=function () {
        $scope.showTree = false;
    }
    // 部门条件
    $scope.selectDept = {};
    $scope.showTree = false;
    $scope.showDept = function () {
        $scope.showTree = $scope.showTree == true ? false : true;
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

    var bindAsset;
    $scope.bindAssetSelect = function() {

        if (this.active && !this.unactive) {
            bindAsset = 1;
        } else if (!this.active && this.unactive) {
            bindAsset = 2;
        } else {
            bindAsset = 0;
        }
         tableReload();
    };

    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };

    $scope.deviceModelList = [];

    $http({
        url : 'baseinfo/dictionary/getDeviceModel.do',
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
    .success(function (result) {
        for(var i = 0; i < result.length; i++) {
            $scope.deviceModelList.push({name : result[i].itemName,itemCode:result[i].itemCode});
        }
    }).error(function (data) {
        console.error(data);
        $defer.reject();
    });

    var deviceModelSelectList = [];

    $scope.deviceModelSelect = function() {
        var name = this.deviceModel.name;

        if (this.deviceModel.selected) {
            deviceModelSelectList.push(name);
        } else {
            var index = deviceModelSelectList.indexOf(name);
            deviceModelSelectList.splice(index, 1);
        }

        tableReload();
    };

    $http({
        url : '/emm-web/ecss/baseinfo/deviceMC/getAll.do',
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
    .success(function (data) {
        $scope.deviceGroupList = data.dataList;
    }).error(function (data) {
        console.info('error');
    });

    var deviceGroupSelectList = [];

    $scope.deviceGroupSelect = function() {
        var _id = this.deviceGroup.id;

        if (this.deviceGroup.selected) {
            deviceGroupSelectList.push(_id);
        } else {
            var index = deviceGroupSelectList.indexOf(_id);
            deviceGroupSelectList.splice(index, 1);
        }
        tableReload();
    };
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
                    condition.deptId = null;
                }

                condition.bindAsset = bindAsset;
                condition.deviceModelArray = deviceModelSelectList;
                condition.deviceGroupArray = deviceGroupSelectList;

                $http({
                    url : 'person/list.do',
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
	
	/*设备状态的筛选框点击事件*/
	$scope.deviceState = true;
	$scope.changestate = function(){
		$scope.deviceState = !$scope.deviceState;
	}
	$scope.deviceType = true;
	$scope.changetype = function(){
		$scope.deviceType = !$scope.deviceType;
	}
	
	$scope.deviceGroupShow = true;
	$scope.changeGroup = function(){
		$scope.deviceGroupShow = !$scope.deviceGroupShow;
	}
}]);