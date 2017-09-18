/**
 * 查看策略部署详情
 * feiyong
 * 2016/07/06
 */
app.add.controller('stragegyInfoCtr', ['$scope', '$state', '$sce',  '$http', 'strategySelect','ngTableParams', function ($scope, $state, $sce,  $http, strategySelect, ngTableParams) {
    $scope.$emit('menuChange', '/strategy/index');
    $scope.goBack = function(){
    	$state.go('strategy/index');
    }
    
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
    
    $scope.cleanSearch = function () {
    	$scope.search = "";
    	tableReload();
    };
    
    /**
	 * 部门筛选条件
	 */
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
    /*设备状态的筛选框点击事件*/
	$scope.deviceGroupShow = true;
	$scope.clickGroup = function(){
		$scope.deviceGroupShow = !$scope.deviceGroupShow;
	}
	
	 //按照策略执行 为执行 进行搜索
    $scope.selectExcute = function() {
         tableReload();
    }
    
    //重新初始化列表
    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };
    //按照策略模式进行搜索
    $scope.strategySelect = function() {
         tableReload();
    }
    var size;
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
                size = params.count();

                condition.start = ( page - 1 ) * size;
                condition.length = size;
                condition.name = $scope.search;
                condition.strategyId = $state.params.id;
                if (null != $scope.selectDept ) {
					condition.deptId = $scope.selectDept.id;
				} else {
					condition.deptId = null;
				}
                var statusArr = [];
                 if($scope.excute) {
		    	 	statusArr.push(1);
		    	 }
		    	 if($scope.noExcute) {
		    	 	statusArr.push(0);
		    	 }
                condition.statusArr = statusArr;

                $http({
                    url : 'strategy/infoDetail.do',
                    method : 'POST',
                    data : condition,
                    cache:false,
                    responseType :  "json"
                })
                .success(function (result) {
                    var data = result.data;
                    /*console.log(data);*/
                    $scope.totalRecords = result.totalNum;

                    var totalCount = data.totalCount;
                    var dataList = data.list;
					/*console.log(data);*/
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
                    $defer.reject();
                });
            }
        });
    	//点击更多操作
    	$scope.clickTr = function(item){
			$scope.prevItem && ($scope.prevItem.visited = false);
			item.visited = true;
			$scope.prevItem = item;
		};
    
}])