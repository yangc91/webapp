/**
 * 设备管控
 * feiyong
 * 2016/06/20
 */

app.add.controller('deviceCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http' , 'ivhTreeviewMgr',  function ($scope, $state, $sce, ngTableParams, $http, ivhTreeviewMgr) {
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
	
	// IMEI、姓名、警号 搜索条件
	$scope.searchClick = function () {
		tableReload();
	}
	//清空搜索条件
	$scope.cleanSearch=function () {
		$scope.search = "";
		tableReload();
	}

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


	// 设备组搜索条件
	$http({
		url : '/emm-web/ecss/baseinfo/deviceMC/getAll.do',
		method : 'POST',
		cache:false,
		responseType :  "json"
	})
		.success(function (data) {
			$scope.deviceGroupList = data.dataList;
		}).error(function (data) {
		console.info(data);
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

	// 初始化状态条件
	// 违规状态
	$scope.violationStatus = 2;
	// 黑名单状态条件
	$scope.blackStatus = 2;
	// 执勤状态
	$scope.patrolModelStatus = 2;
	// 丢失状态
	$scope.lostModelStatus = 2;

	// 状态条件
	$scope.status = [
		{
			name:'violationStatus',text:"违规状态"
		},
		{
			name:'blackStatus',text:"黑名单状态"
		},
		{
			name:'patrolModelStatus',text:"执勤状态"
		},
		{
			name:'lostModelStatus',text:"丢失状态"
		}
	]

	$scope.statusChange = function (deviceStu) {
		if(deviceStu.check) {
			$scope[deviceStu.name] = 1;
		} else {
			$scope[deviceStu.name] = 2;
		}

		tableReload();
	}


	/**
	 * 初始化表格
	 */
	$scope.tableParams = new ngTableParams(
		{
			page: 1,  // 初始化显示第几页
			count: window.innerWidth>1600?10:(window.innerWidth>1366?7:5)// 初始化分页大小
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

				condition.violationStatus = $scope.violationStatus;
				condition.blackStatus = $scope.blackStatus;
				condition.patrolModelStatus = $scope.patrolModelStatus;
				condition.lostModelStatus = $scope.lostModelStatus;

				condition.deviceModelArray = deviceModelSelectList;
				condition.deviceGroupArray = deviceGroupSelectList;

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

						if (dataList.length > 0) {
							$scope.prevItem = dataList[0];
							builtDeviceStatusStr($scope.prevItem);
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
					console.info(data);
					$defer.reject();
				});
			}
		});

	function tableReload() {
		$scope.tableParams.page(1);
		$scope.tableParams.reload();
	}

	$scope.clickTr = function(item){
		$scope.prevItem && ($scope.prevItem.visited = false);
		item.visited = true;
		builtDeviceStatusStr(item);
		$scope.prevItem = item;
	};

	function builtDeviceStatusStr(device) {
		device.statusStr = '';
		if(device.violationStatus == 1) {
			device.statusStr += '已违规，'
		}
		if(device.blackStatus == 1) {
			device.statusStr += '已被拉入黑名单，'
		}
		if(device.patrolModelStatus == 1) {
			device.statusStr += '执勤模式中，'
		}
		if(device.lostModelStatus == 1) {
			device.statusStr += '丢失模式中，'
		}
		if (device.statusStr.length > 0) {
			device.statusStr = device.statusStr.substr(0, device.statusStr.length - 1);
		} else {
			device.statusStr = '普通状态';
		}
	}

	// 跳转管控详情
	$scope.deviceControl = function(id){
		$state.go('ecss/deviceMC/toOperateMC',{id:id, status:0});
	}	

	/*设备状态的筛选框点击事件*/
	$scope.deviceState = true;
	$scope.clickState = function(){
		$scope.deviceState = !$scope.deviceState;
	}
	$scope.deviceType = true;
	$scope.clickType = function(){
		$scope.deviceType = !$scope.deviceType;
	}

	$scope.deviceGroupShow = true;
	$scope.clickGroup = function(){
		$scope.deviceGroupShow = !$scope.deviceGroupShow;
	}

}]);
