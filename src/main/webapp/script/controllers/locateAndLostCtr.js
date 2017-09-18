/**
 * Created by lb on 2016/7/21.
 */
app.add.controller('locateAndLostCtr', ['$scope','$state','$http','ngTableParams','$timeout', function ($scope, $state, $http, ngTableParams, $timeout) {
    $scope.$emit('menuChange', $state.current.url);

    //跳转到设备行动轨迹
    $scope.searchInfo = function (type, dev) {
    	var imei = dev.imei;
    	var personName = dev.personName;
    	var personCode = dev.personCode;
    	var deptName = dev.deptName;
    	var info = imei + "**" + personName + "**" + personCode + "**" + deptName;
        $state.go("locateAndLost/toInfo", {"type":type, "info":info});
    }

    /*左侧tab页*/
    $scope.tabNotice = [
        {
            active:true,disabled:false,heading:'丢失模式'
        },
        {
            active:false,disabled:false,heading:'执勤模式'
        }
    ]

    //声明地图变量
    var bmap;
    var markerArr=[];
    var initPageFlag = false;
    
    //初始化地图
    initBMap();
    
    //初始化加载总设备数量
    loadActualDevNum();

    //巡逻模式的设备列表
    patrolDevList();
    
    //丢失模式的设备列表
	$timeout(function(){
	    lostDevList();
	}, 800);
    
    //加载地图人员标记
    $scope.loadBMap = function() {
        var actualDeviceList = $scope.actualDeviceList;
        markerArr = [];
        
        if(actualDeviceList.length > 0) {

        	//西安为中心
            bmap.centerAndZoom(new BMap.Point(108.9463060000, 34.3474360000), 5);
            for(var i=0;i<actualDeviceList.length;i++) {
                var position = actualDeviceList[i].position;
                var personName = actualDeviceList[i].personName;
                var personCode = actualDeviceList[i].personCode;
                var deptName = actualDeviceList[i].deptName;
                if(position) {
                    var positionObj = JSON.parse(position);
                    //console.log("===" + positionObj.lon + "," + positionObj.lat);
                    var lon = positionObj.lon;
                    var lat = positionObj.lat;

                    var point = new BMap.Point(lon, lat);
//                  var myIcon = new BMap.Icon('../script/lib/baiduMap/images/top'+(i+1)+'.png',new BMap.Size(300,157));
//                  var myIcon = new BMap.Icon('../script/lib/baiduMap/images/top'+(i+1)+'.png', new BMap.Size(300,157), {imageOffset:new BMap.Size(135,45)});
                    var myIcon = new BMap.Icon('../script/lib/baiduMap/images/top'+(i+1)+'.png', new BMap.Size(150,100), {imageOffset:new BMap.Size(55,18)});
                    var marker = new BMap.Marker(point, {icon:myIcon});
                    //var marker = new BMap.Marker(point);
                    bmap.addOverlay(marker);
                    
    				//监听marker点击事件
                    if(positionObj.address) {
                    	var labelStr = '位置：' + positionObj.address;
                    	addClickHandler(labelStr, marker);
                    }
                    
                    //定位点如果就有一个,则地图放大
                    if(actualDeviceList.length == 1) {
                    	bmap.centerAndZoom(point, 17);
                    }
                    
                    var markerObj = {
                    		"imei":actualDeviceList[i].imei,
                    		"marker":marker,
                    		"point":point
                    };
                    markerArr.push(markerObj);
                }
            }
        }

    }

    //搜索人员
    $scope.searchPerson = function() {
    	var flag = $scope.tabNotice[0].active;
    	//console.log("~~~" + flag);
    	if (flag) {//true - 代表切换至丢失模式
    		 $scope.tableParamsLost.page(1);
             $scope.tableParamsLost.reload();
    	} else {
    		$scope.tableParamsPatrol.page(1);
        	$scope.tableParamsPatrol.reload();
    	}
    }
    
    //回车键搜索
    $scope.myKeyup = function(e) {
        var keycode = window.event?e.keyCode:e.which;
        if(keycode == 13) {
            $scope.searchPerson();
        }
    }
    
    $scope.cleanSearch=function () {
        $scope.searchKey = "";
        $scope.searchPerson();
    }
    
    //切换tr
    $scope.clickTr = function(item) {
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;

        if(markerArr.length > 0) {
        	for(var i=0; i<markerArr.length; i++) {
        		if(markerArr[i].imei == item.imei) {
        			var point = markerArr[i].point;
        			//bmap.centerAndZoom(point, 17);
        			
        			var marker = markerArr[i].marker;
        			marker.setAnimation(BMAP_ANIMATION_BOUNCE);
        			$timeout(function(){
        				marker.setAnimation(null);
        			}, 1000);
        		}
        	}
        }
    }
    
    
    /**
	 * 部门筛选条件 - 设备组
	 */
	$scope.selectDept = {};
	$scope.showTree = false;
	$scope.showDept = function () {
		$scope.showTree = $scope.showTree == true ? false : true;
	}
    $scope.closeTree=function () {
        $scope.showTree = false;
    }
	$scope.d = {};
	$scope.currentdeptPage = 0;
	$scope.deptList = [];
	loadMoreDeptList();

	$scope.loadMoreDeptList = loadMoreDeptList;

	function loadMoreDeptList() {

		if ($scope.deptbusy) {
			return false;
		}
		$scope.deptbusy = true;

		$http.post('../locateAndLost/getMoreDevGroup.do',
			{
				currentPage:$scope.currentdeptPage,
				deptName:$scope.d.deptName
			},
			{
				responseType: 'json',
				cache: false
			}).success(function(data) {
			$scope.deptbusy = false;
			if (data.groupList && data.groupList.length > 0) {
				for (var i = 0; i < data.groupList.length; i++) {
					$scope.deptList.push(data.groupList[i]);
				}
			}
			$scope.currentdeptPage++;
		});

	}
	
	//回车键搜索
    $scope.myKeyupdept = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchdept();
    	}
    }
	
	$scope.searchdept = function(){
		$scope.deptList = [];
		$scope.currentdeptPage = 0;
		$scope.loadMoreDeptList();
	}
	$scope.onSelectedDept = function(dept) {
		$scope.selectDept = dept;
		$scope.showTree = false;

		$scope.searchPerson();
		
	}
	$scope.removeSelectDept = function () {
		$scope.selectDept = {};
		
		$scope.searchPerson();
	}
    /**
	 * 部门筛选条件 END
	 */
    

    //初始化加载总设备数量
    function loadActualDevNum() {
    	var httpReq = $http.post('../locateAndLost/getIndexDataNew.do', {},
    	        {
    	            responseType: 'json',
    	            cache: false
    	        });
    	    httpReq.success(function (result) {
    	    	//alert(JSON.stringify(result));
    	        $scope.actualDeviceNum = result.actualDeviceNum;
    	    }).error(function(data, status, headers, config){
    	        alert('发生错误' + status);
    	    });
    }

    //丢失模式的设备列表
    function lostDevList() {
    	//分页表格
        $scope.tableParamsLost = new ngTableParams(
        {
            page: 1,	// 初始化显示第几页
            count: 3// 初始化分页大小
        },
        {
            counts: [/*5,10,20*/], //控制每页显示大小
            paginationMaxBlocks: 5, //最多显示页码按钮个数
            paginationMinBlocks: 2,//最少显示页码按钮个数
            getData: function ($defer, params) {
            	 var page = params.page();
                 var size = params.count();
                 var condition = {
                     start : ( page - 1 ) * size,
                     length : size,
                     draw : 1
                };
                
                //1-丢失模式, 2-巡逻模式
 				condition.type = 1;
                condition.searchKey = $scope.searchKey;
				if (undefined != $scope.selectDept.id) {
					condition.devGroupId = $scope.selectDept.id;
				} else {
					condition.devGroupId = null;
				}
                
                $http({
                    method : 'POST',
                    url : '../locateAndLost/searchPersonNew.do',
                    data : condition,
                    responseType :  "json"
                }).success(function (result) {//alert(result.pagination);
                	var data = result.pagination;
                	var totalCount = data.totalCount;
                	
                    $scope.resultRecordsLost = totalCount;
					$scope.tabNotice[0].heading = "丢失模式(" + totalCount + ")";

                    var dataList = data.dataList;                
                    if (dataList.length > 0) {
//                    	$scope.prevItem = dataList[0];
//                      dataList[0].visited = true;
                    }
                    params.total(totalCount);
                    $defer.resolve(dataList);
                    
                    //人员设备实时状态信息
		            $scope.actualDeviceList = dataList;
		            
					//清空标记
					bmap.clearOverlays();
					//加载地图人员标记
					$scope.loadBMap();
		            
					initPageFlag = true;
                }).error(function (data) {
                    console.info(error);
                    $defer.reject();
                });
            }
         });
    }
    
    //巡逻模式的设备列表
    function patrolDevList() {
    	//分页表格
    	$scope.tableParamsPatrol = new ngTableParams(
    			{
    				page: 1,	// 初始化显示第几页
    				count: 3// 初始化分页大小
    			},
    			{
    				counts: [/*5,10,20*/], //控制每页显示大小
    				paginationMaxBlocks: 5, //最多显示页码按钮个数
    				paginationMinBlocks: 2,//最少显示页码按钮个数
    				getData: function ($defer, params) {
    					var page = params.page();
    					var size = params.count();
    					var condition = {
    							start : ( page - 1 ) * size,
    							length : size,
    							draw : 1
    					};
    					
    					//1-丢失模式, 2-巡逻模式
    	 				condition.type = 2;
    					condition.searchKey = $scope.searchKey;
    					if (undefined != $scope.selectDept.id) {
    						condition.devGroupId = $scope.selectDept.id;
    					} else {
    						condition.devGroupId = null;
    					}
    					
    					$http({
    						method : 'POST',
    						url : '../locateAndLost/searchPersonNew.do',
    						data : condition,
    						responseType :  "json"
    					}).success(function (result) {
    						var data = result.pagination;
    						var totalCount = data.totalCount;
    						
    						$scope.resultRecordsPatrol = totalCount;
    						$scope.tabNotice[1].heading = "执勤模式(" + totalCount + ")";
    						
    						var dataList = data.dataList;                
    						if (dataList.length > 0) {
//    							$scope.prevItem = dataList[0];
//    							dataList[0].visited = true;
    						}
    						params.total(totalCount);
    						$defer.resolve(dataList);
    						
    						//人员设备实时状态信息
    						$scope.actualDeviceList = dataList;

    						if(initPageFlag) {
    							//清空标记
    							bmap.clearOverlays();
    							//加载地图人员标记
    							$scope.loadBMap();
    						}
    						
    					}).error(function (data) {
    						console.info(error);
    						$defer.reject();
    					});
    				}
    			});
    }
    
    //刷新table
    function tableReload() {
        $scope.tableParamsLost.page(1);
        $scope.tableParamsLost.reload();
        
    	$scope.tableParamsPatrol.page(1);
    	$scope.tableParamsPatrol.reload();
    }

    //初始化地图
    function initBMap() {
        bmap = new BMap.Map("mapContainer", {minZoom:5,maxZoom:17});    //创建地图实例,设置地图允许的最小/大级别
        //西安市政府
        var point = new BMap.Point(108.9463060000, 34.3474360000);    // 创建点坐标
        // 初始化地图,设置中心点坐标和地图级别。
        bmap.centerAndZoom(point,5);
        //添加一个平移缩放控件、一个比例尺控件和一个缩略图控件。
        bmap.addControl(new BMap.NavigationControl());
        //地图拖拽
        bmap.enableDragging();
        // 启用滚轮放大缩小。
        bmap.enableScrollWheelZoom();
        // 启用键盘操作。
        bmap.enableKeyboard();
    }

    //监听marker点击事件
    function addClickHandler(content, marker) {
        marker.addEventListener("click",function(e){
            //初始化进来的时候是true
            if(marker._visible){
                marker._visible = false;
                var label = new BMap.Label(content,{offset:new BMap.Size(10,-10)});
                marker.setLabel(label);
                marker.getLabel().setStyle({display:"block"});
            } else {
                marker._visible = true;
                marker.getLabel().setStyle({display:"none"});
            }

        });
    }

}])

//===============================行动轨迹==========================================
app.add.controller('locateAndLostInfoCtr',['$scope','$state','$http','ngTableParams','$timeout', function ($scope, $state, $http, ngTableParams, $timeout) {
    $scope.$emit('menuChange', '/locateAndLost/toPage');

    //返回定位与丢失列表页面
    $scope.goBack = function () {
        $state.go("locateAndLost/toPage");
    }
    
    //console.log("======" + $state.params.type + "," + $state.params.info);
    $scope.type = $state.params.type;
    var info = $state.params.info;
    var infoArr = info.split("**");
    $scope.imei = infoArr[0];
    $scope.personName = infoArr[1];
    $scope.personCode = infoArr[2];
    $scope.deptName = infoArr[3];

    //声明地图变量
    var bmap;
    var markerArr2 = [];
    
	//初始化地图
    initBMap2();
    
	//加载人员设备
	personTraceList();
	
	//改变时间
	$scope.changeTime = function() {
		$scope.startTime = document.getElementById("startTime").value;
		$scope.endTime = document.getElementById("endTime").value;
		
		//alert($scope.startTime + "," + $scope.endTime);
		tableReload2();
	}
	
    //加载地图人员标记
    $scope.loadBMap2 = function() {
        var actualDeviceList = $scope.actualDeviceList2;
        markerArr2 = [];
        
        if(actualDeviceList.length > 0) {
        	
        	//最近的点为中心
        	bmap.centerAndZoom(new BMap.Point(actualDeviceList[0].lon, actualDeviceList[0].lat), 13);
            for(var i=0;i<actualDeviceList.length;i++) {
                var lon = actualDeviceList[i].lon;
                var lat = actualDeviceList[i].lat;
                var time = actualDeviceList[i].time;
                
                var point = new BMap.Point(lon, lat);
//                var myIcon = new BMap.Icon('../script/lib/baiduMap/images/top'+(i+1)+'.png',new BMap.Size(300,157));
                var myIcon = new BMap.Icon('../script/lib/baiduMap/images/top'+(i+1)+'.png',new BMap.Size(150,100), {imageOffset:new BMap.Size(64,20)});
                var marker = new BMap.Marker(point, {icon:myIcon});
                //var marker = new BMap.Marker(point);
                bmap.addOverlay(marker);
                
                var markerObj = {
                		"time":actualDeviceList[i].time,
                		"marker":marker,
                		"point":point
                };
                markerArr2.push(markerObj);
            }
            
//            //画线
//            if(markerArr2.length > 0) {
//            	var pointArr = [];
//            	for(var i=0; i<markerArr2.length; i++) {
//            		pointArr.push(markerArr2[i].point);
//            	}
////            	var polyline = new BMap.Polyline(pointArr, {strokeColor:'blue', strokeWeight:'2', strokeOpacity:'0.9'});
////            	bmap.addOverlay(polyline);
//            	var polyline = new BMap.Polyline([new BMap.Point(113.799698, 34.756634), new BMap.Point(113.789698, 34.746634)], {strokeColor:'blue', strokeWeight:2, strokeOpacity:0.9});
//            	bmap.addOverlay(polyline);
//            }
            
        }

    }
    
    //切换tr
    $scope.clickTr2 = function(item) {
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;

        if(markerArr2.length > 0) {
        	for(var i=0; i<markerArr2.length; i++) {
        		if(markerArr2[i].time == item.time) {
        			var point = markerArr2[i].point;
        			//bmap.centerAndZoom(point, 17);
        			
        			var marker = markerArr2[i].marker;
        			marker.setAnimation(BMAP_ANIMATION_BOUNCE);
        			$timeout(function(){
        				marker.setAnimation(null);
        			}, 1000);
        		}
        	}
        }
    }
    
    //加载人员行动轨迹
    function personTraceList() {
    	//分页表格
        $scope.tableParams = new ngTableParams(
        {
            page: 1,	// 初始化显示第几页
            count: 10// 初始化分页大小
        },
        {
            counts: [/*5,10,20*/], //控制每页显示大小
            paginationMaxBlocks: 5, //最多显示页码按钮个数
            paginationMinBlocks: 2,//最少显示页码按钮个数
            getData: function ($defer, params) {
            	 var page = params.page();
                 var size = params.count();
                 var condition = {
                     start : ( page - 1 ) * size,
                     length : size,
                     draw : 1
                };
                
                condition.imei = $scope.imei;
 				condition.type = $scope.type;
 		    	condition.startTime = $scope.startTime;
                condition.endTime = $scope.endTime;
                
                $http({
                    method : 'POST',
                    url : '../locateAndLost/queryDeviceTrace.do',
                    data : condition,
                    responseType :  "json"
                }).success(function (result) {
                	var data = result.pagination;
                	var totalCount = data.totalCount;
                    $scope.resultRecords = totalCount;

                    var dataList = data.dataList;                
                    if (dataList.length > 0) {
//                    	$scope.prevItem = dataList[0];
//                        dataList[0].visited = true;
                        
                        $scope.devLastTime = dataList[0];
                    }
                    params.total(totalCount);
                    $defer.resolve(dataList);
                    
                    //人员设备实时状态信息
		            $scope.actualDeviceList2 = dataList;		            
		            //清空标记
		            bmap.clearOverlays();		            
		            //加载地图人员标记
		            $scope.loadBMap2();
                    
                }).error(function (data) {
                    console.info(error);
                    $defer.reject();
                });
            }
         });
    }
    
    //刷新table
    function tableReload2() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    }
    
    //初始化地图
    function initBMap2() {
    	bmap = new BMap.Map("mapContainer", {minZoom:5,maxZoom:17});    //创建地图实例,设置地图允许的最小/大级别
        //西安市政府
        var point = new BMap.Point(108.9463060000, 34.3474360000);    // 创建点坐标
        // 初始化地图,设置中心点坐标和地图级别。
        bmap.centerAndZoom(point,5);
        //添加一个平移缩放控件、一个比例尺控件和一个缩略图控件。
        bmap.addControl(new BMap.NavigationControl());
        //地图拖拽
    	bmap.enableDragging();
    	// 启用滚轮放大缩小。
    	bmap.enableScrollWheelZoom();
    	// 启用键盘操作。
    	bmap.enableKeyboard();
    }

    
    
}])