app.add.controller('appPowerCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', "/audit/appPower/list");
    /*左侧导航栏点击收起*/
    $scope.deviceState = true;
    $scope.changestate = function () {
    	$scope.deviceState = !$scope.deviceState;
    }

    $scope.appType = true;
    $scope.changeAppType = function() {
        $scope.appType = !$scope.appType;
    }

    $scope.tabNotice = [
        {
            active:true,disabled:false,heading:'整体设备应用耗电监测情况'
        },
        {
            active:false,disabled:false,heading:'单个设备应用耗电监测情况'
        }
    ]

    //鼠标离开搜索框,树消失
    $scope.closeTree=function () {
        $scope.showTree = false;
    }

    if (!supportB64) {
        $scope.supportB64 = false;
    } else {
        $scope.supportB64 = true;
    }

    $state.params.id == 1?$scope.tabNotice[1].active=true:$scope.tabNotice[0].active=true;
    $scope.tabClickFir = function () {
    	$state.go('audit/appPower/list',{id:0})
    }

    $scope.status = 2;
    $scope.timeType = 2;
    $scope.changeTime = function() {
    	if($scope.status == 1) {
        	$scope.timeType = 1;
        	tableReload();
        } else if($scope.status == 2) {
        	$scope.timeType = 2;
        	tableReload();
        };
    }

    //回车键搜索
    $scope.myKeyupName = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.clickSearchAppName();
    	}
    }

    $scope.clickSearchAppName = function () {
    	tableReload();
    }

    // 应用类型
    $scope.appTypeList = [{
        "value" : "1",
        "name" : "系统应用"
    },{
        "value" : "2",
        "name" : "第三方应用"
    }];

    var appTypeSelectList = [];

    $scope.appTypeSelect = function() {
        var value = this.appType.value;

        if (this.appType.selected) {
            appTypeSelectList.push(value);
        } else {
            var index = appTypeSelectList.indexOf(value);
            appTypeSelectList.splice(index, 1);
        }

        tableReload();
    };

    function tableReload() {
        $scope.successShow = false;
        $scope.refreshTable = true;
    	$scope.tableParams.page(1);
        $scope.tableParams.reload();
    };
    /***************************整体设备应用耗电监测*************************/
    $scope.successShow = false;
    $scope.refreshTable = true;
    $scope.turnPageShow = true;
    $scope.tableParams = new ngTableParams(
    {
        page: 1,  // 初始化显示第几页
        count: window.innerWidth>1600?5:(window.innerWidth>1366?4:3) // 初始化分页大小
    },
    {
        counts: [/*5,10,20*/], //控制每页显示大小
        paginationMaxBlocks: 5, //最多显示页码按钮个数
        paginationMinBlocks: 2,//最少显示页码按钮个数
        getData: function($defer, params) {
            if( $scope.refreshTable == true){
                $scope.successShow = false;
            }else{
                $scope.turnPageShow = false;
            }

        	var page = params.page();
            var size = params.count();

            var condition = {
                start : ( page - 1 ) * size,
                length : size,
                draw : 1
            };
            condition.search = $scope.searchAppName;
            condition.timeType = $scope.timeType;
            condition.appTypeArray = appTypeSelectList;

            $http({
                method : 'POST',
                url : './../audit/appPower/powerList.do',
                data : condition,
                responseType :  "json"
            }).success(function (result) {
            	var data = result.data;
            	var totalCount = data.totalCount;
            	$scope.totalRecords = result.appTotalNum;
            	$scope.resultRecords = totalCount;

                var dataList = data.dataList;

                if(totalCount==0){
                    $scope.noResultContent1 = true;
                }else{
                    $scope.noResultContent1 = false;
                }

                params.total(totalCount);
                if (dataList.length > 0) {
                    $scope.prevItem = dataList[0];
                    dataList[0].visited = true;
                } else {
                    $scope.prevItem = {};
                }
                $defer.resolve(dataList);
                if( $scope.refreshTable == true){
                    $scope.successShow = true;
                    $scope.refreshTable = false
                }else{
                    $scope.turnPageShow = true;
                }
            }).error(function (data) {
                console.info(data);
                $defer.reject();
            });

        }
    });

    $scope.tabClickSec = function () {
    	$state.go('audit/appPower/list',{id:1})
    }

    //回车键搜索
    $scope.myKeyup = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.clickSearch();
    	}
    }

    $scope.clickSearch = function () {
    	devicetableReload();
	}

    /**
     * 部门筛选条件
     */
    $scope.selectDept = {};
    $scope.showTree = false;
    $scope.showDept = function () {
        $scope.showTree = $scope.showTree == true ? false : true;
    }

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

    $scope.appPower = {
        deptId:null
    };

    /**
     * 选中部门
     * @param dept
     */
    $scope.onSelectedDept = function(dept) {
        $scope.selectDept = dept;
        $scope.appPower.deptId = dept.id;
        $scope.showTree = false;
        devicetableReload();
    }

    $scope.removeSelectDept = function () {
        $scope.selectDept = null;
        $scope.appPower.deptId = null;
        devicetableReload();
    }

    function devicetableReload() {
		$scope.devicetableParams.page(1);
		$scope.devicetableParams.reload();
	}
    /********************单个设备应用耗电监测********************/

    $scope.devicetableParams = new ngTableParams(
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

    	            var condition = {
    	                start : ( page - 1 ) * size,
    	                length : size,
    	                draw : 1
    	            };
    	            condition.search = $scope.searchKey;

    	            if (null != $scope.selectDept ) {
                        condition.deptId = $scope.appPower.deptId;
                    } else {
                        condition.deptId = null;
                    }

    	            $http({
    	                method : 'POST',
    	                url : 'deviceMC/list.do',
    	                data : condition,
    	                responseType :  "json"
    	            }).success(function (result) {
    	            	var data = result.data;
    	            	var totalCount = data.totalCount;
    	            	$scope.totalRecords1 = result.deviceTotalNum;
    	            	$scope.resultRecords1 = totalCount;

    	                var dataList = data.dataList;

                        if(totalCount==0){
                            $scope.noResultContent2 = true;
                        }else{
                            $scope.noResultContent2 = false;
                        }

                        if (dataList.length > 0) {
                            $scope.prevPowerItem = dataList[0];
                            dataList[0].visited = true;
                        } else {
                            $scope.prevPowerItem = {};
                        }

    	                params.total(totalCount);
    	                $defer.resolve(dataList);
    	            }).error(function (data) {
    	                console.info(data);
    	                $defer.reject();
    	            });

    	        }
    	    });

    $scope.deviceControl = function(id){
		$state.go('audit/appPower/info', { id : id});
	}

    //点击行
    $scope.clickTr = function(item){
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    }

    $scope.clickPowerTr = function(item){
        $scope.prevPowerItem && ($scope.prevPowerItem.visited = false);
        item.visited = true;
        $scope.prevPowerItem = item;
    }
}])
    /**
 * Created by Administrator on 2016/7/15.
 */

app.add.controller('appPowerInfoCtr',['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', '/audit/appPower/list');

    $scope.goBack=function () {
        $state.go('audit/appPower/list',{id:1});
    }
    $scope.goBackIndex=function () {
    	$state.go('audit/appPower/list',{id:0});
    }

    $scope.tabNotice = [
        {
            active:false,disabled:false,heading:'整体设备应用耗电监测情况'
        },
        {
            active:true,disabled:false,heading:'单个设备应用耗电监测情况'
        }
    ]
    /*左侧导航栏点击收起*/
    $scope.deviceState = true;
    $scope.changestate = function () {
        $scope.deviceState = !$scope.deviceState;
    }

    $scope.appType = true;
    $scope.changeAppType = function() {
        $scope.appType = !$scope.appType;
    }

    if (!supportB64) {
        $scope.supportB64 = false;
    } else {
        $scope.supportB64 = true;
    }

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
    	$scope.deviceInfo = result.device;
    	$scope.deviceImei = $scope.deviceInfo.imei;


    	$scope.status = 2;
        $scope.timeType = 2;
        $scope.changeTime = function() {
        	if($scope.status == 1) {
            	$scope.timeType = 1;
            	tableReload();
            } else if($scope.status == 2) {
            	$scope.timeType = 2;
            	tableReload();
            };
        }

        // 应用类型
        $scope.appTypeList = [{
            "value" : "1",
            "name" : "系统应用"
        },{
            "value" : "2",
            "name" : "第三方应用"
        }];

        var appTypeSelectList = [];

        $scope.appTypeSelect = function() {
            var value = this.appType.value;

            if (this.appType.selected) {
                appTypeSelectList.push(value);
            } else {
                var index = appTypeSelectList.indexOf(value);
                appTypeSelectList.splice(index, 1);
            }

            tableReload();
        };
        $scope.powerInfoShow=false;
        $scope.refreshInfoTable = true;
        $scope.turnPageInfoShow = true;
    	$scope.tableParams = new ngTableParams(
	    {
	        page: 1,  // 初始化显示第几页
	        count: window.innerWidth>1600?5:(window.innerWidth>1366?4:3) // 初始化分页大小
	    },
	    {
	        counts: [/*5,10,20*/], //控制每页显示大小
	        paginationMaxBlocks: 5, //最多显示页码按钮个数
	        paginationMinBlocks: 2,//最少显示页码按钮个数
	        getData: function($defer, params) {

	        	var page = params.page();
	            var size = params.count();

	            var condition = {
	                start : ( page - 1 ) * size,
	                length : size,
	                draw : 1
	            };
	            condition.timeType = $scope.timeType;
	            condition.imei = $scope.deviceImei;
                condition.appTypeArray = appTypeSelectList;
	            $http({
	                method : 'POST',
	                url : './../audit/appPower/powerInfo.do',
	                data : condition,
	                responseType :  "json"
	            }).success(function (result) {
	            	var data = result.data;
	            	var totalCount = data.totalCount;
	            	$scope.totalRecords = result.appTotalNum;
	            	$scope.resultRecords = totalCount;

	                var dataList = data.dataList;

                    if (dataList.length > 0) {
                        $scope.prevItem = dataList[0];
                        dataList[0].visited = true;
                    } else {
                        $scope.prevItem = {};
                    }

                    if(totalCount==0){
                        $scope.noResultContent2 = true;
                    }else{
                        $scope.noResultContent2 = false;
                    }

	                params.total(totalCount);
	                $defer.resolve(dataList);
                    if( $scope.refreshInfoTable == true){
                        $scope.powerInfoShow = true;
                        $scope.refreshInfoTable = false
                    }else{
                        $scope.turnPageInfoShow = true;
                    }
	            }).error(function (data) {
	                console.info(data);
	                $defer.reject();
	            });

	        }
	    });

    }).error(function (data) {
        console.info(data);
        $defer.reject();
    });
    $scope.clickTr = function (item) {
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    }
    function tableReload() {
        $scope.powerInfoShow=false;
        $scope.refreshInfoTable = true;
    	$scope.tableParams.page(1);
        $scope.tableParams.reload();
    };

}])