/**
 * Created by Administrator on 2016/7/15.
 */
app.add.controller('appIllegalCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http','highchartsNG', 'dialog','$timeout',function ($scope, $state, $sce, ngTableParams, $http, highchartsNG, dialog,$timeout) {
    //$scope.$emit('menuChange', $state.current.url);
    $scope.$emit('menuChange', '/'+$state.current.name);
    
    var alertInf = {
        toString: function () {
            return '[object mdcalert]'
        },

        close: function (time) {
            var _this = this;
            var myAlert = _this.toString() == '[object mdcalert]';

            $timeout(function () {
                (myAlert ? $scope : _this).alert = null;
            }, (typeof time == 'undefined'? 2000 : time));
        },

        show: function (type, msg, time) {
            var inf = {type: 'success', closeable: true};
            if (arguments.length == 1) {
                inf.msg = type;
            } else {
                inf.type = type || 'success';
                inf.msg = msg;
                inf.time = time;
            }

            var _this = this;
            var myAlert = _this.toString() == '[object mdcalert]';

            $timeout(function () {
                (myAlert ? $scope : _this).alert = inf;
            }, typeof inf.time == 'undefined'? 100 : inf.time);
        }
    };
    $scope.alertInf = alertInf;
    
    //全局变量
    var violationGradeKey=[];
    var violationGradeValue=[];
    var violationItemsKey=[];
    var violationItemsValue=[];
    var httpReq;
    var prevItem;
    
    /*左侧导航栏点击收起*/
    $scope.deviceState = true;
    $scope.changestate = function () {
        $scope.deviceState = !$scope.deviceState;
    }

    //鼠标离开搜索框,树消失
    $scope.closeTree=function () {
        $scope.showTree = false;
    }

    $scope.tabNotice = [
        {
            active:true,disabled:false,heading:'违规情况'
        },
        {
            active:false,disabled:false,heading:'黑名单设备'
        }
    ]
    
    $state.params.id == 1 ? $scope.tabNotice[1].active=true : $scope.tabNotice[0].active=true;
    
    $scope.tabClickFir = function () {
        $state.go('audit/appIllegal/list',{id:0});
    }
    $scope.tabClickSec = function () {
        $state.go('audit/appIllegal/list',{id:1});
    }
    
    //单击行
    $scope.clickTr = function(item){
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    };
    
    //搜索
    $scope.selectTime = "pre30Day";
    $scope.searchfunc = function(selectTime) {
    	$scope.selectTime = selectTime;

    	tableReload();
		violationInfoTab();
    }

    /*移出黑名单*/
    $scope.deleteBlackList = function (dev) {
        dialog.confirm({
            icon:'secondConfirm',
            content: '<p class="successTip">确定要移出黑名单吗？</p>\
            		<p class="w300 fs14">\
		        	移出后不可恢复，请谨慎操作\
		        	</p>',
            ok: function (scope, dialog, button, config) {
    			$http({
                    method : 'POST',
                    url : '../audit/appIllegal/removeBlackList.do',
                    params : {imeis:dev.imei},
                    responseType :  "json"
                }).success(function (result) {
                	if(result.success){
                        dialog.close();
                        alertInf.show('移出黑名单成功');
                        alertInf.close();
                        
                		tableReload();
                	}
                });
            },
            cancel: function (scope, dialog, button, config) {
                alertInf.close(0);
                return true;
            }
        });
        
    }
    
    //导出黑名单设备的excel
    $scope.exportExcl = function() {
    	var deptId;
    	if (null != $scope.selectDept ) {
		 	deptId = $scope.selectDept.id;
		}
	    var selectTime = $scope.selectTime;
	    if(typeof(deptId) == "undefined") {
	    	deptId = "";
	    }
	    
	    //location.href = "../audit/appIllegal/exportBlackListExcl.do";	    
	    location.href = base + "/audit/appIllegal/exportBlackListExcl.do?selectTime="+selectTime+"&deptId="+deptId;
    }
    
    /**
	 * 部门筛选条件
	 */
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

		tableReload();
		violationInfoTab();
		
	}
	$scope.removeSelectDept = function () {
		$scope.selectDept = null;
		
		tableReload();
		violationInfoTab();
	}
    /**
	 * 部门筛选条件 END
	 */

	/** 页面初始化 Start**/
	//加载违规情况
	violationInfoTab();
	//加载黑名单列表
	blackListTab();
	/** 页面初始化 END**/
	
    //加载违规情况
    function violationInfoTab() {
    	var condition={};
    	if (null != $scope.selectDept ) {
		 	condition.deptId = $scope.selectDept.id;
		} else {
		 	condition.deptId = null;
		}
    	condition.selectTime = $scope.selectTime;
    	
        httpReq = $http.post('../audit/appIllegal/ajaxViolationInfo.do', condition,
                {
                    responseType: 'json',
                    cache: false
                });
        httpReq.success(function (result) {//alert(JSON.stringify(result));
            //违规项统计
            var violationItems = result.violationItems;
            //违规等级统计
            var violationGrade = result.violationGrade;
            //左侧总和
            $scope.totalNum = result.violationNum;
            $scope.totalName = "条违规事件";
            
        	violationGradeKey=[];
        	violationGradeValue=[];
            violationItemsKey=[];
            violationItemsValue=[];
            for(var s in violationItems) {//遍历对象中的key与value
            	//console.log(s + ": " + violationItems[s]);
            	
            	violationItemsKey.push(s);
            	violationItemsValue.push(violationItems[s]);
            }
            for(var s in violationGrade) {//遍历对象中的key与value
            	//console.log(s + ": " + violationGrade[s]);
            	
            	violationGradeKey.push(s);
            	violationGradeValue.push(violationGrade[s]);
            }
            
            //加载柱状图
            loadChartColumnConfig(violationItemsKey, violationItemsValue);
            //加载饼状图
            loadChartCircleConfig(violationGradeKey, violationGradeValue);
            
        }).error(function(data, status, headers, config){
            alert('发生错误' + status);
        });
    }
    
    //加载黑名单列表
    function blackListTab() {
    	//分页表格
        $scope.tableParams = new ngTableParams(
        {
            page: 1,	// 初始化显示第几页
            count: window.innerWidth>1600?10:(window.innerWidth>1366?7:5)// 初始化分页大小
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
                 
 				 if (null != $scope.selectDept ) {
				 	condition.deptId = $scope.selectDept.id;
				 } else {
				 	condition.deptId = null;
				 }
 		    	 condition.selectTime = $scope.selectTime;
                //condition.searchKey = $scope.searchKey;

                $http({
                    method : 'POST',
                    url : '../audit/appIllegal/ajaxBlackList.do',
                    data : condition,
                    responseType :  "json"
                }).success(function (result) {
                	var data = result.pagination;
                	var totalCount = data.totalCount;
                    $scope.resultRecords = totalCount;

                    var dataList = data.dataList;                
                    if (dataList.length > 0) {
                    	$scope.prevItem = dataList[0];
                        dataList[0].visited = true;
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
         });
    }
    
    //刷新table
    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    }
    
    //加载柱状图
    function loadChartColumnConfig(violationItemsKey, violationItemsValue) {
        $scope.chartConfig = {
                options: {
                    chart: {
                        type: 'column',
                        zoomType: 'x'
                    }
                },
                series: [{
                    data: violationItemsValue,
                    name:'违规事件',
                    pointWidth: 20,//柱子宽度
                    color: '#1caf9a'//柱子颜色
                }],
                title: {
                    text: ''
                },
                xAxis: {
//                    currentMin: 0,
//                    currentMax: 3,
//                    minRange: 1,
                    categories: violationItemsKey
                },
                yAxis:{
                    /*plotLines: [{
                        color: '#FF0000',
                        width: 2,
                        value: 20,
                        label:{
                            style:{
                                color:'red'
                            }
                        }
                    }]*/
                },
                credits:{
                    text:null
                },
                loading: false
            };
    }

    //加载饼状图
    function loadChartCircleConfig(violationGradeKey, violationGradeValue) {
    	$scope.chartCircleConfig = {
                options: {
                    chart: {
                        type: 'pie'
                    }
                },
                series: [
                    {
                        name: '违规数量',
                        data: [
                            [violationGradeKey[0], violationGradeValue[0]],
                            [violationGradeKey[1], violationGradeValue[1]],
                            [violationGradeKey[2], violationGradeValue[2]]
                        ]
                    }
                ],
                title: {
                    text: ''
                },
                credits:{
                    text:null
                },
                loading: false
            }
    }

}])