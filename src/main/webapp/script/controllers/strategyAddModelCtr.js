/**
 * 新建模式策略
 * xinliu
 * 2016/06/20
 */
app.add.controller('strategyAddModelCtr', ['$scope', '$state', '$sce',  '$http', 'strategySelect', 'dialog', function ($scope, $state, $sce, $http, strategySelect, dialog) {
    $scope.$emit('menuChange', '/strategy/index');
    
    window.onbeforeunload = function(event) {
    	var message = '是否要离开此页面?此页面的数据将不被保存';
    	if(typeof event == 'undefined') {
    		event = window.event;
    	}
    	if(event) {
    		event.returnValue = message;
    	}
    	return message;
    }
    
    $scope.goBack = function(){
		dialog.openDialog({
			title:"提示",
			icon:'secondConfirm',
			content:'<p class="confirmTip">确定要返回列表吗？</p>\
			        		<p class="w300 fs14">\
				此页面的数据将不被保存\
			        		</p>',
			buttons:[
				{
					name:"取消",
					className:"btn-gray",
					callback:function($scope, dia, button, config){

					}
				},
				{
					name:"确定",
					className:"btn-red",
					callback:function($scope, dia, button, config){
						$state.go('strategy/index');
					}
				}
			]
		})
	}
    /*左侧菜单导航信息*/
	$scope.addStepList=[
   		{
   			id:'1',pic:'no1-blue',name:'选择模式策略类型',content:'你可以选择需要创建的模式策略',active:true,lineShow:false
   		},
   		{
   			id:'2',pic:'no4-blue',name:'配置策略', content:'你可以选择当前需要开启的模式策略',pic2:'no4-gray',active:false,lineShow:true
   		},
   		{
   			id:'3',pic:'no6-blue',name:'部署策略',pic2:'no6-gray',active:false,lineShow:true
   		}
	]
	/*模式策略类型*/
	$scope.gradeList = [
		{
			itemCode:'work',itemName:'执勤模式',note:'执勤模式的主要对象为外勤警员，或其他需要频繁获取设备位置的警员。策略运行后，将实时监测设备位置，并在菜单项【定位与丢失】中查看，执勤模式为高耗电策略，请针对性使用。'
		},
		{
			itemCode:'loose',itemName:'丢失模式',note:' 策略运行后，将实时监测设备位置，并在菜单项【定位与丢失】中查看，同时为设备随机生成锁屏密码，强制锁屏。'
		}
	]

	$scope.gradePic= {
		'work':'deacon',
		'loose':'lose'
	}

    $scope.firstStepShow = true;
    $scope.secondStepShow = false;
    $scope.thirdStepShow = false;
    $scope.firstErrorShow = true;
    //单击策略类型给以选中状态
    $scope.firstStepClick = function(gradeNum){
    	$scope.itemCode=gradeNum;
    	$scope.nextshow = true;
    }
    /*点击下一步*/
	$scope.stepTwo = function(){
		$scope.firstStepShow = false;
	    $scope.secondStepShow = true;
		$scope.threeNext = true;
	   // $scope.disableShow = true;
	    $scope.addStepList[0].active = true;
	    $scope.addStepList[1].active=true;
		if($scope.styleStrategyItems.content.otherTime !=0) {
			$scope.styleStrategyItems.content.cycleTime = 0;
		}
		timeIllustrateTips();
		if($scope.itemCode=='work') {
			//$scope.styleStrategyItems.content.cycleTime = 1200;
			//$scope.flowILLustrate = "流量消耗高";
			if($scope.styleStrategyItems.content.otherTime ==0) {
			 	$scope.styleStrategyItems.content.cycleTime = 1200;
			 }
		}else{
			if($scope.styleStrategyItems.content.otherTime == 0) {
				$scope.styleStrategyItems.content.cycleTime = 600;
			}

			//$scope.flowILLustrate = "流量消耗高";
		}
	}
	/*====================第二步==================*/
	//模式策略数据结构
	$scope.styleStrategyItems = {
		name: '',
		note: '',
		content: {
			cycleTime: 1200,
			otherTime:0,
			startDate: '',
			endDate: '',
			perStartTime: '',
			perEndTime: ''
		}
	}

	/**
	 * 自定义时间格式
	 * @type {{hour: number, minites: number, seconds: number}}
     */
	$scope.selfStrategyTime = {
			hour:0,
			minites:0,
			seconds:0

	}
	
	/*返回上一步*/
	$scope.upStepFirst = function(){
		$scope.secondStepShow = false;
   		$scope.firstStepShow = true;
   		$scope.addStepList[1].active=false;
	}
	/**
	 *
	 */
	$scope.cycleTimeSelect = function() {
		if($scope.styleStrategyItems.content.cycleTime == 0) {
			if(!/^[1-9]\d*$/.test($scope.selfStrategyTime.hour)&&!/^[1-9]\d*$/.test($scope.selfStrategyTime.minites)) {
				$scope.threeNext = false;
			}
			changeIllustrate();
		}else{
			cycleTimeSelectIllustrate();
			$scope.threeNext = true;
			$scope.styleStrategyItems.content.otherTime = 0;
			$scope.selfStrategyTime.seconds = 0;
			$scope.selfStrategyTime.minites = 0;
			$scope.selfStrategyTime.hour = 0;
		}
	}
	function  cycleTimeSelectIllustrate() {
		if($scope.styleStrategyItems.content.cycleTime <=1200) {
			$scope.flowILLustrate = "流量消耗高";
		}else if($scope.styleStrategyItems.content.cycleTime<=1800 && $scope.styleStrategyItems.content.cycleTime>1200) {
			$scope.flowILLustrate = "流量消耗普通";
		}else if($scope.styleStrategyItems.content.cycleTime>1800){
			$scope.flowILLustrate = "流量消耗少";
		}
	}
	/**
	 * 检查时间是否合法
	 */
	$scope.checkCycleTime = function(format) {
		if(format == 'hour') {
			if($scope.selfStrategyTime.minites<5||$scope.selfStrategyTime.minites>60) {
				if($scope.selfStrategyTime.hour==0) {
					$scope.threeNext = false;
					return false;
				}
			}else{
				changeIllustrate();
				$scope.threeNext = true;
				return true;
			}

			if(!/^[1-9]\d*$/.test($scope.selfStrategyTime.hour)) {
				$scope.threeNext = false;
				return false;
			}else {
				changeIllustrate();
				$scope.threeNext = true;
				return true;
			}
		}else if(format == 'minites') {
			if($scope.selfStrategyTime.hour==0) {
				if($scope.selfStrategyTime.minites<5||$scope.selfStrategyTime.minites>60) {
					$scope.threeNext = false;
					return false;
				}
			}else{
				changeIllustrate();
				$scope.threeNext = true;
				return true;
			}
			if(!/^[1-9]\d*$/.test($scope.selfStrategyTime.minites)) {
				$scope.threeNext = false;
				return false;
			}else {
				changeIllustrate();
				$scope.threeNext = true;
				return true;
			}
		}

	}
	//根据选择改变说明
	function  changeIllustrate() {
		if($scope.selfStrategyTime.hour==0) {
			if($scope.selfStrategyTime.minites<5||$scope.selfStrategyTime.minites>60) {
				$scope.threeNext = false;
				return false;
			}
		}
		if($scope.styleStrategyItems.content.cycleTime == 0) {
			$scope.styleStrategyItems.content.otherTime =
				parseInt($scope.selfStrategyTime.seconds)	+
				parseInt($scope.selfStrategyTime.minites*60)	 +
				parseInt($scope.selfStrategyTime.hour*3600);
		}
		timeIllustrateTips();
	}
	//
	function  timeIllustrateTips() {
		if($scope.styleStrategyItems.content.otherTime <=1200) {
			$scope.flowILLustrate = "流量消耗高";
		}else if($scope.styleStrategyItems.content.otherTime<=1800 && $scope.styleStrategyItems.content.otherTime>1200) {
			$scope.flowILLustrate = "流量消耗普通";
		}else if($scope.styleStrategyItems.content.otherTime>1800){
			$scope.flowILLustrate = "流量消耗少";
		}
	}
	 /**
     * 检查是否有时间改变
     */
    $scope.workDateTime = 0;
    $scope.workDateTimeHour = 0;
    $scope.workDateTimeMiniute = 0;
    $scope.changeDate = function() {
    	
    	var startDateStr = $scope.styleStrategyItems.content.startDate;
    	var endDateStr = $scope.styleStrategyItems.content.endDate;
    	
    	if(startDateStr==''||endDateStr=='') {
			$scope.firstErrorShow = true;
			$scope.errorNote = '执勤时间必填 ';
			return;
		}else{
			startDateStr = startDateStr.replace(/-/g, '/');
			endDateStr = endDateStr.replace(/-/g, '/');
			var date1 = new Date(startDateStr);
			var date2 = new Date(endDateStr);
			
			$scope.workDateTime = (date2.getTime()-date1.getTime())/86400000
			$scope.firstErrorShow = false;
		}
		
		var perStartTimeStr = $scope.styleStrategyItems.content.perStartTime;
		var perEndTimeStr = $scope.styleStrategyItems.content.perEndTime;
		
		if(perStartTimeStr==''||perEndTimeStr=='') {
			$scope.firstErrorShow = true;
			$scope.errorNote = '执勤时间必填';
			return;
		}else{
			var timeTemp1 = new Date(startDateStr+' '+perStartTimeStr);
			var timeTemp2 = new Date(endDateStr+' '+perEndTimeStr);
			var totalTimeTemp =  timeTemp2.getTime() - timeTemp1.getTime();
			if(totalTimeTemp < 0) {
				$scope.errorNote = '执勤时间输入不合法';
				$scope.firstErrorShow = true;
				return;
			}
			
			var time1 = new Date('2016/08/10'+' '+perStartTimeStr);
			var time2 = new Date('2016/08/10'+' '+perEndTimeStr);
			var totalTime =  time2.getTime() - time1.getTime();
			//1470585600000
			var time3 = new Date(1470585600000 + totalTime);
			$scope.workDateTimeHour =  time3.getHours();
			$scope.workDateTimeMiniute =  time3.getMinutes();
			if($scope.workDateTimeHour < 0||$scope.workDateTimeMiniute < 0) {
				$scope.errorNote = '执勤时间输入不合法';
				$scope.firstErrorShow = true;
				return; 
			}
			
			$scope.firstErrorShow = false;
		}
    }
   
    /**
     * 判断是否有重复出现 的策略名称
     * @param {Object} name
     */
    $scope.checkDubStrName = function(name) {
    	
		if(typeof(name)!=undefined) {
			 $http({
			        url : '../strategy/checkName.do',
			        data :{
			        	name:name
			        },
			        method : 'POST',
			        cache:false,
			        responseType :  "json"
			    })
			    .success(function (data) {
					$scope.checkStrategyName = data.data;
			    }).error(function (data) {
			        console.info(data);
			    });
			$scope.errorShow = true;
		}
	}
	/*进入下一步*/
	$scope.stepThree = function() {
		$scope.addFrm.strategyName.$dirty=true;
		
		if($scope.addFrm.$invalid) {
			return;
		}
		if($scope.checkStrategyName) {
			return;
		}
		
		if($scope.itemCode != 'loose') {
			if($scope.styleStrategyItems.content.startDate==''||$scope.styleStrategyItems.content.endDate=='') {
				$scope.firstErrorShow = true;
				$scope.errorNote = '执勤时间必填 ';
				return;
			}else{
				$scope.firstErrorShow = false;
			}
			$scope.styleStrategyItems.content.perStartTime = document.getElementById("perStartTime").value;
			$scope.styleStrategyItems.content.perEndTime = document.getElementById("perEndTime").value;
			
			if($scope.styleStrategyItems.content.perStartTime==''||$scope.styleStrategyItems.content.perEndTime=='') {
				$scope.firstErrorShow = true;
				$scope.errorNote = '执勤时间必填 ';
				return;
			}else{
				$scope.firstErrorShow = false;
			}
			
			if(document.getElementById("startDate").value==''||document.getElementById("endDate").value==''
				||$scope.styleStrategyItems.content.perStartTime==''||$scope.styleStrategyItems.content.perEndTime == '') {
				$scope.firstErrorShow = true;
				$scope.errorNote = '执勤时间必填 ';
				return;
			}
		}

		if($scope.styleStrategyItems.content.cycleTime == 0) {
			$scope.styleStrategyItems.content.otherTime =
				parseInt($scope.selfStrategyTime.seconds)	+
				parseInt($scope.selfStrategyTime.minites*60)	 +
				parseInt($scope.selfStrategyTime.hour*3600);
		}
		//console.log(document.getElementById("perStartTime").value);
		
		//console.log($scope.styleStrategyItems);
		
    	$scope.secondStepShow = false;
    	$scope.thirdStepShow = true;
    	$scope.addStepList[2].active=true;
    	tableReload();
    }
	
	/*======================第三步=================*/
	/*上一步*/
	$scope.upSecondStep = function(){
		$scope.secondStepShow = true;
		$scope.thirdStepShow = false;
		$scope.addStepList[2].active=false;
	}
	$scope.mapList=[
    	{
    		device:'all',deviceTitle:'所有用户的设备',content:'此策略将会部署到所有用户的设备',pic:'allUser'
    	},
    	{
    		device:'none',deviceTitle:'暂不部署',content:'此策略将不会部署到任何设备，但此策略将会保存到列表中，当然你可以随时部署。',pic:'noUser'
    	},
    	{
    		device:'self',deviceTitle:'自定义',content:'你可以将此条策略根据你的需要部署到任何单个设备、部门设备和设备中的设备。',pic:'customUser'
    	}
    ]
	$scope.nextshow2 = false;
    $scope.mapWapFn = function(mapWayDevice){
    	$scope.device = mapWayDevice;
    	$scope.nextshow2 = true;
    }
    /*部署到设备组 点击事件*/
    $scope.groupShow = false;
    $scope.groupshowMenu = function(){
    	$scope.groupShow = !$scope.groupShow;
    	$scope.groupShow2 = false;
    }
    /*部署到单个设备 点击事件*/
    $scope.groupShow2 = false;
    $scope.groupshowMenu2 = function(){
    	$scope.groupShow = false;
    	$scope.groupShow2 = !$scope.groupShow2;
    }
    /**
     * 
     * @param {Object} sel
     */
    $scope.groupCheck = function(sel) {
    	if(sel == 'group') {
    		$scope.groupShow = true;
    		$scope.groupShow2 = false;
    	}else {
    		$scope.groupShow = false;
    		$scope.groupShow2 = true;
    	}
    }
    selectDeviceGroup();
	 //查询设备组中的设备
    function selectDeviceGroup() {
    	$http({
		        url : '../group/deviceGroup.do',
		        method : 'POST',
		        data :{
		        	strategyId:$state.params.id
		        },
		        cache:false,
		        responseType :  "json"
		    	})
			    .success(function (data) {
			    	$scope.groupList = data.groupList;
			    	$scope.groupSize = data.size;
			    }).error(function (data) {
			        console.info(data);
		    });
    }
    /**
     * 
     */
  	$scope.disableShow = function () {
		$scope.errorShow = true;
		if($scope.itemCode != 'loose'&&($scope.styleStrategyItems.content.startDate==''||$scope.styleStrategyItems.content.perEndTime==''
			||$scope.styleStrategyItems.content.startDate==''||$scope.styleStrategyItems.content.perEndTime=='')) {
			$scope.firstErrorShow = true;
			$scope.errorNote = '执勤时间必填 ';
		}
	}
    
   
    /**
     * 
     * @param {Object} groupId
     */
    var groupList = [];
    $scope.selGroupListSize = groupList;
    $scope.selGroup = function(groupId) {
    	if(this.group.selected) {
    		groupList.push(groupId);
    	}else {
    		var index = groupList.indexOf(groupId);
            groupList.splice(index, 1);
    	}
    }
   
    
     $scope.finish = function(){
     	var type;
     	if($scope.itemCode == 'work') {
     		type = 2;
     	}else{
     		type = 3;
     		$scope.styleStrategyItems.content.startDate = null;
     		$scope.styleStrategyItems.content.endDate = null;
     		$scope.styleStrategyItems.content.perStartTime = null;
     		$scope.styleStrategyItems.content.perEndTime = null;
     	}
    	/**
   		 * 保存策略
   		 */
   		$http({
	        url : '../strategy/style.do',
	        data: {
	        	styleStrategy: JSON.stringify($scope.styleStrategyItems),
	        	args : 'save',
	        	type : type
	        },
	        method : 'POST',
	        cache:false,
	        responseType :  "json"
	    	})
		    .success(function (data) {
		    	
		    	if(data.result == 'success') {
		    		if($scope.device == 'all') {
		    			$http({
					        url : '../strategy/publishAll.do',
					        data: {strategyId : data.strategyId},
					        method : 'POST',
					        cache:false,
					        responseType :  "json"
					    	})
						    .success(function (data) {
						    	$state.go('strategy/index');
						    }).error(function (data) {
						        console.info(data);
					    });
		    		}else if($scope.device == 'none') {
		    			$state.go('strategy/index');
		    		}else if($scope.device == 'self'){
		    			if(groupList.length>0) {
		    				if($scope.groupShow) {
			    				$http({
						        url : '../group/publishDeviceGroup.do',
						        data: {strategyId : data.strategyId, groupId : groupList},
						        method : 'POST',
						        cache:false,
						        responseType :  "json"
						    	})
							    .success(function (data) {
							    	$state.go('strategy/index');
							    }).error(function (data) {
							        console.info(data);
						    });
		    			}else{
		    				$state.go('strategy/index');
		    			}
		    			
		    			}else {
		    				var imeis = [];
		    				for(var i=0; i<$scope.selectPerson.length; i++) {
		    					imeis.push($scope.selectPerson[i].imei);
		    				}
		    				if(imeis.length>0) {
		    					$http({
							        url : '../strategy/publishSelDevice.do',
							        data: {strategyId : data.strategyId, imeis : imeis},
							        method : 'POST',
							        cache:false,
							        responseType :  "json"
							    	})
								    .success(function (data) {
								    	$state.go('strategy/index');
								    }).error(function (data) {
								        console.info(data);
							    });
		    				}else{
		    					$state.go('strategy/index');
		    				}
		    				
		    			}
		    		}
		    	}
		    }).error(function (data) {
		        console.info(data);
	    });
	    //返回首页 
    	//location.href("index.do");
    }
      //搜索人员
    $scope.searchPerson = function(){
        $scope.personList = [];
        $scope.currentPage = 1;
        $scope.loadMore();
    }
    //加载列表数据
    function tableReload() {
        $http.post('../strategy/queryDevice.do', {deptId:$scope.deptId},
                {
                    responseType: 'json',
                    cache: false
                }).success(function (result) {
                $scope.personList = result.data;
                $scope.totalPage = result.totalPage;
				for (var i=0; i<result.data.length;i++) {
					for(var j=0; j<$scope.selectPerson.length;j++) {
						if($scope.selectPerson[j].imei == result.data[i].imei) {
							result.data[i].selected = true;
						}
					}
					//$scope.personList.push(data.data[i]);
				}
                //console.log(result);
            }).error(function(data, status, headers, config){
                alert('发生错误' + status);
            });
    }
    
     //回车键搜索
    $scope.myKeyup = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchPerson();
    	}
    }
    
    //点击树选择框时
    $scope.selectDept = {};
    $scope.deptId = null;
    $scope.selectCallback =  function (ivhNode, ivhIsSelected, ivhTree) {
    	//ivhTreeviewMgr.deselectAll($scope.list);
        $scope.selectDept = ivhNode;
        $scope.deptId = ivhNode.id;
        //alert($scope.deptId);
        
        //加载列表数据
		//加载列表数据
		$scope.searchPerson();
    };

    $http({
        url : 'baseinfo/department/rootDeptInfo.do',
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
    .success(function (data) {
    	/*console.log(data);*/
        for(var i = 0; i < data.length; i++) {
            if(data[i].isParent) {
                data[i].children = [{}];
                data[i].nullChildren = true;
            }
        }
        $scope.list = data;
    }).error(function (data) {
        console.info(data);
    });
    
    $scope.toggleCallback = function (ivhNode, ivhIsExpanded, ivhTree) {
    	var _pid = ivhNode.id;
        if (ivhNode.nullChildren) {
            ivhNode.children = [];
            $http({
                url : 'baseinfo/department/queryTreeData.do',
                method : 'POST',
                data : {
                    pId : _pid
                },
                cache:false,
                responseType :  "json"
            })
            .success(function (result) {
       for(var i = 0; i < result.length; i++) {
                    if(result[i].isParent) {
                        result[i].children = [{}];
                        result[i].nullChildren = true;
                    }
                }
                ivhNode.children = result;
                ivhNode.nullChildren = false;
            }).error(function (data) {
                console.info(data);
            });
        }
    };
    
    
    //下拉人员滚动动态获取人员
    $scope.currentPage = 1;
    $scope.loadMore = function() {
    	if ($scope.personList.length > 0) {
    		$scope.currentPage++;
    	}
    	if($scope.totalPage >= $scope.currentPage) {
    		 if ($scope.busy) {
	            return false;
	        }
	        $scope.busy = true;
	        
	        $http.post('../strategy/queryMoreDevice.do',
	            {
	                currentPage:$scope.currentPage,
	                personName:$scope.personName,
	                deptId:$scope.deptId
	            },
	            {
	                responseType: 'json',
	                cache: false
	            }).success(function(data) {//alert($scope.personList.length);
	                $scope.busy = false;
	                if (data.data.length > 0) {
	                    for (var i=0;  i<data.data.length; i++) {
							for(var j=0; j<$scope.selectPerson.length;j++) {
								if($scope.selectPerson[j].imei == data.data[i].imei) {
									data.data[i].selected = true;
								}
							}
	                        $scope.personList.push(data.data[i]);
	                    }
	                    //全选未选中
	                    checkboxes.checked = false;
	                }
	        });
    	}
    };
    
    //复选框集合
    var checkboxes = {
        checked: false,
        items: {}
    };
    //复选框数据
    $scope.checkboxes = checkboxes;
    $scope.selectPerson = [];
    /*成功失败提示的弹框*/
	$scope.closeable = true;
	$scope.alerts = [];
	
	//切换选择人员
    $scope.toggleCheckPerson = function () {//alert("这里的person变成了TEmmPerson类的对象实体");
        var _id = this.person.id;
        if (this.person.selected) {//选中
            checkboxes.items[_id] = _id;
            $scope.selectPerson.push(this.person);
            
            if (Object.keys(checkboxes.items).length == $scope.personList.length) {
                checkboxes.checked = true;
            }
        } else {//未选中
            delete checkboxes.items[_id];
            checkboxes.checked = false;

			for(var i=0;i<$scope.selectPerson.length;i++) {
				if(this.person.imei == $scope.selectPerson[i].imei) {
					$scope.selectPerson.splice(i,1);
				}
			}
           /* var index = $scope.selectPerson.indexOf(this.person);
            if(index>-1) {
            	//如果找不到，则index为-1
            	//index=-1,splice会删除数组最后一个元素
            	$scope.selectPerson.splice(index,1);
            }*/
        }
    };
    
    //选择全部
    $scope.checkAll = function () {
        checkboxes.items = {}; //先清空已选择
        $scope.selectPerson = []; //先清空已选人员
        var data = $scope.personList;
        for (var i = 0; i < data.length; i++) {
            if (checkboxes.checked) {//全选并且排除已经存在设备组中的设备 
            	if(data[i].isGroup==1) {
        			continue;
        		}
                checkboxes.items[data[i].id] = data[i].id;
                $scope.selectPerson.push(data[i]);
            } else {//全未选
            	//$scope.selectPerson.splice(data[i],1);
            }
            data[i].selected = checkboxes.checked;
        }
        //selectPerson去重复
        if ( $scope.selectPerson.length > 0 ) {
        	var tempArr = [];
        	tempArr.push($scope.selectPerson[0]);
        	for (var i=1; i<$scope.selectPerson.length; i++ ) {
        		if( $scope.selectPerson[i].imei != tempArr[tempArr.length-1].imei ) {
        			tempArr.push($scope.selectPerson[i]);
        		}
        	}
        	$scope.selectPerson = tempArr;
        }
        
    };
    
    //点击x时移除
    $scope.deletePerson = function () {
		for (var i=0;i<$scope.selectPerson.length;i++) {
			if ($scope.selectPerson[i].imei == this.person.imei) {
				index = i;
			}
		}
		for (var j=0;j<$scope.personList.length;j++) {
			if($scope.selectPerson[index].imei == $scope.personList[j].imei) {
				$scope.personList[j].selected = false;
			}
		}

		if($scope.personList.indexOf($scope.selectPerson[index])==-1) {
			$scope.personList.push($scope.selectPerson[index]);
		}

		var index = $scope.selectPerson.indexOf(this.person);
		$scope.selectPerson.splice(index,1);
		this.person.selected = false;
    	/*var index = $scope.selectPerson.indexOf(this.person);
        $scope.selectPerson.splice(index,1);
        
    	this.person.selected = false;
    	
    	var _id = this.person.id;
    	delete checkboxes.items[_id];
    	checkboxes.checked = false;*/
    }
    
    //点击清除
    $scope.deleteAllPerson = function () {
    	for (var i = 0; i < $scope.personList.length; i++) {
    		$scope.personList[i].selected = false;
        }
    	$scope.selectPerson.splice(0,$scope.selectPerson.length);
    	
    	checkboxes.items = {}; //清空已选择
    	checkboxes.checked = false;
    }
}])