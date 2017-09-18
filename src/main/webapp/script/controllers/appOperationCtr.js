/**
 * 应用运行监测
 * Created by Administrator on 2016/7/14.
 * @author fy
 * @date 2016/7/23
 */
app.add.controller('appOperationCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', "/audit/appOperation/list");

    $scope.tabNotice = [
        {
            active:true,disabled:false,heading:'整体设备应用监测情况'
        },
        {
            active:false,disabled:false,heading:'单个设备应用监测情况'
        }
    ]

    //鼠标离开搜索框,树消失
    $scope.closeTree=function () {
        $scope.showTree = false;
    }

    $scope.deviceState = true;
    $scope.changestate = function () {
        $scope.deviceState = !$scope.deviceState;
    }

    if (!supportB64) {
        $scope.supportB64 = false;
    } else {
        $scope.supportB64 = true;
    }
    $scope.checkInfo = function (imei) {
        $state.go("audit/appOperation/info", {imei:imei});
    }

    $state.params.id == 1?$scope.tabNotice[1].active=true:$scope.tabNotice[0].active=true;

    $scope.tabClickFir = function () {
        $state.go('audit/appOperation/list',{id:0})
    }

    $scope.tabClickSec = function () {
        $state.go('audit/appOperation/list',{id:1})
    }

    $scope.appRun = {
        search:null,
        flag:1,
        deptId:null
    };

    //回车键搜索
    $scope.myKeyup = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchClick();
    	}
    }
    
    /**
     * 搜索
     */
    $scope.searchClick = function(){
        if ($scope.tabNotice[0].active) {
            tableReload();
        } else {
            devicetableReload();
        }
    }
    
    $scope.cleanSearch = function () {
    	$scope.appRun.search = "";
    	if ($scope.tabNotice[0].active) {
            tableReload();
        } else {
            devicetableReload();
        }
    };

    /**
     * 加载表格
     */
    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };

    /**
     * 加载单个设备表格
     */
    function devicetableReload() {
        $scope.deviceTable.page(1);
        $scope.deviceTable.reload();
    };

    /**
     * 应用排序
     * @type {boolean}
     */
    $scope.deviceState = true;
    $scope.changestate = function () {
        $scope.deviceState = !$scope.deviceState;
    }

    /**
     * 整体应用运行情况表格数据初始化
     */
    $scope.tableParams = new ngTableParams(
        {
            page: 1, // 初始化显示第几页
            count: window.innerWidth>1600?5:(window.innerWidth>1366?4:3), // 初始化分页大小
            filter: {search: $scope.search}
        },
        {
            counts: [/*5,10,15*/], //控制每页显示大小
            paginationMaxBlocks: 5, //最多显示页码按钮个数
            paginationMinBlocks: 2,//最少显示页码按钮个数

            getData: function ($defer, params) {
                function getParame(params) {
                    var url = params.url();
                    var inf = {
                        draw: url.page,
                        length: url.count,
                        search: $scope.appRun.search,
                        flag:$scope.appRun.flag,
                        deptId:$scope.appRun.deptId,
                        start: (url.page - 1) * url.count
                    };

                    return inf;
                }

                var promise = $http.post(base + '/audit/appOperation/ajaxList.do', getParame(params), {
                    responseType: 'json',
                    cache: false
                });

                promise.success(function (data) {
                    $scope.appRun.total = data.appTotalNum;

                    var dataList = data.pageList.dataList;
                    if (dataList.length > 0) {
                        $scope.prevItem = dataList[0];
                        dataList[0].visited = true;
                    } else {
                        $scope.prevItem = {};
                    }

                    if(data.pageList.totalCount==0){
                        $scope.noResultContent1 = true;
                    }else{
                        $scope.noResultContent1 = false;
                    }

                    params.total(data.pageList.totalCount);
                    $defer.resolve(data.pageList.dataList);
                });
            }
        });

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

    /**
     * 选中部门
     * @param dept
     */
    $scope.onSelectedDept = function(dept) {
        $scope.selectDept = dept;
        $scope.appRun.deptId = dept.id;
        $scope.showTree = false;
        if ($scope.tabNotice[0].active) {
            tableReload();
        } else {
            devicetableReload();
        }

    }

    $scope.removeSelectDept = function () {
        $scope.selectDept = null;
        $scope.appRun.deptId = null;
        tableReload();
    }


    /**
     * *************************单个设备应用监测情况*********************************
     */

    // draw 参数，后台修改后可去除
    var condition = {draw : 1};

    /**
     * 初始化表格
     */
    $scope.deviceTable = new ngTableParams(
        {
            page: 1,  // 初始化显示第几页
            count: window.innerWidth>1600?7:(window.innerWidth>1366?6:5)// 初始化分页大小
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
                condition.search = $scope.appRun.search;

                if (null != $scope.selectDept ) {
                    condition.deptId = $scope.appRun.deptId;
                } else {
                    condition.deptId = null;
                }

                $http({
                    url : 'deviceMC/list.do',
                    method : 'POST',
                    data : condition,
                    cache:false,
                    responseType :  "json"
                })
                    .success(function (result) {
                        var data = result.data;
                        $scope.totalRecords = result.deviceTotalNum;

                        var totalCount = data.totalCount;
                        var dataList = data.dataList;

                        $scope.totalCount = totalCount;

                        if(totalCount==0){
                            $scope.noResultContent2 = true;
                        }else{
                            $scope.noResultContent2 = false;
                        }

                        if (dataList.length > 0) {
                            $scope.prevAppItem = dataList[0];
                            dataList[0].visited = true;
                        } else {
                            $scope.prevAppItem = {};
                        }

                        params.total(totalCount);
                        $defer.resolve(dataList);
                    }).error(function (data) {
                        console.info(data);
                        $defer.reject();
                    });
            }
        });

    //点击行
    $scope.clickAppTr = function(item){
        $scope.prevAppItem && ($scope.prevAppItem.visited = false);
        item.visited = true;
        $scope.prevAppItem = item;
    }

    //点击行
    $scope.clickTr = function(item){
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    }
}])

app.add.controller('appOperationInfoCtr',['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', '/audit/appOperation/list');

    $scope.goBack=function () {
        $state.go('audit/appOperation/list',{id:1});
    }
    $scope.goBackIndex=function () {
    	$state.go('audit/appOperation/list',{id:0});
    }
    $scope.tabNotice = [
        {
            active:false,disabled:false,heading:'整体设备应用监测情况'
        },
        {
            active:true,disabled:false,heading:'单个设备应用监测情况'
        }
    ]

    if (!supportB64) {
        $scope.supportB64 = false;
    } else {
        $scope.supportB64 = true;
    }

    /**
     * 设备基本信息
     */
    $scope.deviceInfo = {};
    $http.post(base + '/audit/appOperation/getDeviceInfo.do',
        {
            imei:$state.params.imei
        },
        {
            responseType: 'json',
            cache: false
        }).success(function(data) {
            $scope.deviceInfo = data.deviceInfo;

        });


    /**
     *单个设备应用监测列表
     */
    $scope.tableParams = new ngTableParams(
        {
            page: 1, // 初始化显示第几页
            count: window.innerWidth>1600?10:(window.innerWidth>1366?7:5), // 初始化分页大小
            filter: {search: $scope.search}
        },
        {
            counts: [/*5,10,15*/], //控制每页显示大小
            paginationMaxBlocks: 5, //最多显示页码按钮个数
            paginationMinBlocks: 2,//最少显示页码按钮个数

            getData: function ($defer, params) {
                function getParame(params) {
                    var url = params.url();
                    var inf = {
                        draw: url.page,
                        length: url.count,
                        search: $state.params.imei,
                        flag:2,
                        deptId:null,
                        start: (url.page - 1) * url.count
                    };

                    return inf;
                }

                var promise = $http.post(base + '/audit/appOperation/singleDeviceApps.do', getParame(params), {
                    responseType: 'json',
                    cache: false
                });

                promise.success(function (data) {
                    $scope.total = data.pageList.totalCount;

                    if($scope.total==0){
                        $scope.noResultContent2 = true;
                    }else{
                        $scope.noResultContent2 = false;
                    }
                    params.total(data.pageList.totalCount);
                    $defer.resolve(data.pageList.dataList);

                    var dataList = data.pageList.dataList;

                    if (dataList.length > 0) {
                        $scope.prevAppItem = dataList[0];
                        dataList[0].visited = true;
                    } else {
                        $scope.prevAppItem = {};
                    }

                });
            }
        });
    $scope.clickAppTr = function(item){
        $scope.prevAppItem && ($scope.prevAppItem.visited = false);
        item.visited = true;
        $scope.prevAppItem = item;
    }

    /*左侧导航栏点击收起*/
    $scope.deviceState = true;
    $scope.changestate = function () {
        $scope.deviceState = !$scope.deviceState;
    }

    /**
     * 按安装时间排序
     * @type {boolean}
     */
    $scope.appsbusy = false;
    $scope.currPage = 0;

    $scope.appsList = [];
    loadMoreDeviceAppList();

    $scope.loadMoreDeviceAppList = loadMoreDeviceAppList;

    function loadMoreDeviceAppList() {

        if ($scope.appsbusy) {
            return false;
        }
        $scope.appsbusy = true;

        $http.post(base + '/audit/appOperation/singDeviceAppsByDruation.do',
            {
                currPage:$scope.currPage,
                imei:$state.params.imei
            },
            {
                responseType: 'json',
                cache: false
            }).success(function(data) {
                $scope.appsbusy = false;
                if (data.deviceApps && data.deviceApps.length > 0) {
                    for (var i = 0; i < data.deviceApps.length; i++) {
                        $scope.appsList.push(data.deviceApps[i]);
                    }
                }
                $scope.currPage++;
            });

    };



    $scope.operatTime = true;
    $scope.tableShow = function () {
        $scope.operatTime = true;
    }

    $scope.timeLineShow = function () {
        $scope.operatTime = false;
    }
}])