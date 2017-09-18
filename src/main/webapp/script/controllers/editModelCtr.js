/**
 * 编辑模式策略
 * xinliu
 * 2016/06/20
 */
app.add.controller('editModelCtr', ['$rootScope', '$scope', '$state', '$http','$timeout', 'dialog', function ($rootScope, $scope, $state, $http, $timeout, dialog) {
    $scope.$emit('menuChange', '/strategy/index');
    $scope.modelName = $state.params.modelName;
    
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
   			id:'2',pic:'no4-blue',name:'配置策略',content:'你可以选择当前需要开启的模式策略',pic2:'no4-gray',active:true,lineShow:false
   		}
	]
	/*模式策略类型*/
	$scope.gradeList = [
		{
			itemCode:'work',itemName:'执勤模式',note:'执勤模式的主要对象为外勤警员，或其他需要频繁获取设备位置的警员。策略运行后，将实时监测设备位置，并在菜单项【定位与丢失】中查看，执勤模式为高耗电策略，请针对性使用。'
		},
		{
			itemCode:'loose',itemName:'丢失模式',note:' 策略运行后，将实时监测设备位置，并在菜单项【定位与丢失】中查看，同时为设备随机生成锁屏密码，强制锁屏。'
		},
	]
	//查询策略状态
	$http({
        url : '../strategy/status.do',
        data: {
                    strategyId : $state.params.id,
                    type: $state.params.model
               },
        method : 'POST',
        cache:false,
        responseType :  "json"
    	})
	    .success(function (data) {
			$scope.threeNext = true;
	    	$scope.styleStrategyItems.name = data.strategy.name;
	    	$scope.styleStrategyItems.note = data.strategy.note;
	    	for(var i=0; i<data.data.length; i++) {
	    		if(data.data[i].strategyItem == 'locationStrategy') {
	    			$scope.styleStrategyItems.content = data.data[i].content;
					if($scope.styleStrategyItems.content.cycleTime != 300 &&
						$scope.styleStrategyItems.content.cycleTime != 600 &&
						$scope.styleStrategyItems.content.cycleTime != 1200 &&
						$scope.styleStrategyItems.content.cycleTime != 1800 &&
						$scope.styleStrategyItems.content.cycleTime != 3600) {
						$scope.styleStrategyItems.content.otherTime = $scope.styleStrategyItems.content.cycleTime;
						$scope.styleStrategyItems.content.cycleTime = 0;
						var otTime4 = $scope.styleStrategyItems.content.otherTime;
						var theTime = parseInt(otTime4);// 秒
						var theTime1 = 0;// 分
						var theTime2 = 0;// 小时
						if(theTime==60) {
							theTime = 0;
							theTime1 = 1;
						}
						if(theTime > 60) {
							theTime1 = parseInt(theTime/60);
							theTime = parseInt(theTime%60);
							if(theTime1 > 60) {
								theTime2 = parseInt(theTime1/60);
								theTime1 = parseInt(theTime1%60);
							}
						}
						$scope.selfStrategyTime.seconds = theTime;
						$scope.selfStrategyTime.minites = theTime1;
						$scope.selfStrategyTime.hour = theTime2;
					}
	    			//console.log($scope.styleStrategyItems.content);
	    		}
	    		if(data.data[i].strategyItem == 'lostStrategy') {
	    			$scope.styleStrategyItems.content = data.data[i].content;
					if($scope.styleStrategyItems.content.cycleTime != 300 &&
						$scope.styleStrategyItems.content.cycleTime != 600 &&
						$scope.styleStrategyItems.content.cycleTime != 1200) {
						$scope.styleStrategyItems.content.otherTime = $scope.styleStrategyItems.content.cycleTime;
						$scope.styleStrategyItems.content.cycleTime = 0;
						var otTime4 = $scope.styleStrategyItems.content.otherTime;
						var theTime = parseInt(otTime4);// 秒
						var theTime1 = 0;// 分
						var theTime2 = 0;// 小时
						if(theTime==60) {
							theTime = 0;
							theTime1 = 1;
						}
						if(theTime > 60) {
							theTime1 = parseInt(theTime/60);
							theTime = parseInt(theTime%60);
							if(theTime1 > 60) {
								theTime2 = parseInt(theTime1/60);
								theTime1 = parseInt(theTime1%60);
							}
						}
						$scope.selfStrategyTime.seconds = theTime;
						$scope.selfStrategyTime.minites = theTime1;
						$scope.selfStrategyTime.hour = theTime2;
					}
	    		}
	    	}
	    	
	    	if($state.params.model == 3) {
	    		$scope.itemCode = 'loose';
				//changeIllustrate();
				cycleTimeSelectIllustrate();
				timeIllustrateTips();
	    	}else {
				$scope.itemCode = 'work';
				//changeIllustrate();
				cycleTimeSelectIllustrate();
				timeIllustrateTips();
	    		var startDateStr = $scope.styleStrategyItems.content.startDate;
    			var endDateStr = $scope.styleStrategyItems.content.endDate;
    			startDateStr = startDateStr.replace(/-/g, '/');
				endDateStr = endDateStr.replace(/-/g, '/');
				var date1 = new Date(startDateStr);
				var date2 = new Date(endDateStr);
				$scope.workDateTime = (date2.getTime()-date1.getTime())/86400000
				
				var perStartTimeStr = $scope.styleStrategyItems.content.perStartTime;
				var perEndTimeStr = $scope.styleStrategyItems.content.perEndTime;
				var time1 = new Date('2016/08/10'+' '+perStartTimeStr);
				var time2 = new Date('2016/08/10'+' '+perEndTimeStr);
				var totalTime =  time2.getTime() - time1.getTime();
				var time3 = new Date(1470585600000 + totalTime);
				$scope.workDateTimeHour =  time3.getHours();
				$scope.workDateTimeMiniute =  time3.getMinutes();
	   	 	}
	    }).error(function (data) {
	        console.info(data);
	    });
	/*====================第二步==================*/
	//模式策略数据结构
	$scope.styleStrategyItems = {
		name: '',
		note: '',
		content: {
			cycleTime: 300,
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
     * 检查是否有时间改变
     */
   // $scope.workDateTime = 0;
   // $scope.workDateTimeHour = 0;
   // $scope.workDateTimeMiniute = 0;
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
	/*完成*/
	$scope.finsh = function() {
		
		//console.log(document.getElementById("perStartTime").value);
		if($state.params.model == 2) {
			if(document.getElementById("startDate").value==''||document.getElementById("endDate").value==''
				||document.getElementById("perStartTime").value==''||document.getElementById("perEndTime").value=='') {
				$scope.firstErrorShow = true;
				$scope.errorNote = '执勤时间必填 ';
				return;
			}
			$scope.styleStrategyItems.content.perStartTime = document.getElementById("perStartTime").value;
			$scope.styleStrategyItems.content.perEndTime = document.getElementById("perEndTime").value;
		}
		if($state.params.model == 3) {
			$scope.styleStrategyItems.content.startDate = null;
     		$scope.styleStrategyItems.content.endDate = null;
     		$scope.styleStrategyItems.content.perStartTime = null;
     		$scope.styleStrategyItems.content.perEndTime = null;
		}
		
		//console.log($scope.styleStrategyItems);
		$scope.addFrm.strategyName.$dirty=true;
    	
    	if($scope.addFrm.$invalid) {
	   		return;
	   	}

		if($scope.styleStrategyItems.content.cycleTime == 0) {
			$scope.styleStrategyItems.content.otherTime =
				parseInt($scope.selfStrategyTime.seconds)	+
				parseInt($scope.selfStrategyTime.minites*60)	 +
				parseInt($scope.selfStrategyTime.hour*3600);
		}
    	/**
   		 * 保存策略
   		 */
   		$http({
	        url : '../strategy/style.do',
	        data: {
	        	styleStrategy: JSON.stringify($scope.styleStrategyItems),
	        	strategyId: $state.params.id,
	        	type: $state.params.model,
	        	args : 'update',
	        },
	        method : 'POST',
	        cache:false,
	        responseType :  "json"
	    	})
		    .success(function (data) {
		    	if(data.result == 'success') {
		    		$state.go('strategy/index');
		    	}
		    }).error(function (data) {
		        console.info(data);
	    });
    }
	/*======================第三步=================*/
}]);