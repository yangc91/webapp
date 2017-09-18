/**
 * 策略编辑页面
 */
app.add.controller('editStrategyCtr', ['$rootScope', '$scope', '$state', '$http','$timeout', 'ngTableParams' ,'dialog', function ($rootScope, $scope, $state, $http, $timeout, ngTableParams, dialog) {
    $scope.$emit('menuChange', '/strategy/index');
    $scope.commonName = $state.params.commonName;
    var code = ["appPermission","violationStrategy"];
    var strategyCodeList;
    if(!strategyCodeList) {
    	$http({
        url : '../strategy/dicList.do',
        data: {
                    code : code
               },
        method : 'POST',
        cache:false,
        responseType :  "json"
    	})
	    .success(function (data) {
	    	$scope.strategyCodeList = data.data;
	    }).error(function (data) {
	        console.info(data);
	    });
    }
	$scope.addStepList = [
    	{
    		id:'1',name:"配置外设策略",pic:'no2-blue',pic2:'no2-gray',active:true,lineShow:false
    	},
    	{
    		id:'2',name:"配置网络策略",pic:'no3-blue',pic2:'no3-gray',active:false,lineShow:true
    	},
    	{
    		id:'3',name:"配置应用策略",pic:'no4-blue',pic2:'no4-gray',active:false,lineShow:true
    	},
    	{
    		id:'4',name:"配置违规策略",pic:'no5-blue',pic2:'no5-gray',active:false,lineShow:true
    	}
    ]
	//alert($state.params.commonName+"$state.params.id========"+$state.params.id);

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

	//查询策略状态
	$http({
        url : '../strategy/status.do',
        data: {
                    strategyId : $state.params.id
               },
        method : 'POST',
        cache:false,
        responseType :  "json"
    	})
	    .success(function (data) {
	    	$scope.strategyInfo = data.strategy;
	    	for(var i=0; i<data.data.length; i++) {
	    		if(data.data[i].strategyItem == 'extendStrategy') {
	    			$scope.extendStrategy = data.data[i];
	    			extendinitStatus(data.data[i]);
	    		}else if(data.data[i].strategyItem == 'netStrategy') {
	    			$scope.netStrategy = data.data[i];
	    			netinitStatus(data.data[i]);
	    		}
	    		/*else if(data.data[i].strategyItem == 'appStrategy') {
	    			$scope.appStrategy = data.data[i];
	    			//console.log($scope.appStrategy);
	    		}*/
	    	}
	    	//违规策略数据项
	    	for(var keyVio in data.violationMap) {
	    		$scope.violationStrategy[keyVio] = data.violationMap[keyVio];
	    	}
	    	if(data.blackListBean != null) {
	    		$scope.violationStrategy['blackList'].checked = data.blackListBean.checked;
	    		$scope.violationStrategy['blackList'].one = data.blackListBean.one;
	    		$scope.violationStrategy['blackList'].two = data.blackListBean.two;
	    		$scope.violationStrategy['blackList'].three = data.blackListBean.three;
	    	}
	    	$scope.sixNext = true;
			$scope.sixNext4 = true;
	    	if($scope.violationStrategy.VIOLATION_SIM_PULL_OUT.overTime == 0) {
	    		$scope.hourMinSec4 = true;
	    		var otTime4 = $scope.violationStrategy.VIOLATION_SIM_PULL_OUT.otherTime;
	    		var theTime = parseInt(otTime4);// 秒
			    var theTime1 = 0;// 分
			    var theTime2 = 0;// 小时
			    if(theTime > 60) {
			        theTime1 = parseInt(theTime/60);
			        theTime = parseInt(theTime%60);
			            if(theTime1 > 60) {
				            theTime2 = parseInt(theTime1/60);
				            theTime1 = parseInt(theTime1%60);
				         }
			    }
    			$scope.violationStrategyTime.VIOLATION_SIM_PULL_OUT.seconds = theTime;
    			$scope.violationStrategyTime.VIOLATION_SIM_PULL_OUT.minites = theTime1;
    			$scope.violationStrategyTime.VIOLATION_SIM_PULL_OUT.hour = theTime2;
	    	}

	    	if($scope.violationStrategy.VIOLATION_TF_PULL_OUT.overTime == 0) {
	    		$scope.hourMinSec2 = true;
	    		var otTime2 = $scope.violationStrategy.VIOLATION_TF_PULL_OUT.otherTime;
	    		var theTime = parseInt(otTime2);// 秒
			    var theTime1 = 0;// 分
			    var theTime2 = 0;// 小时
			    if(theTime > 60) {
			        theTime1 = parseInt(theTime/60);
			        theTime = parseInt(theTime%60);
			            if(theTime1 > 60) {
				            theTime2 = parseInt(theTime1/60);
				            theTime1 = parseInt(theTime1%60);
				         }
			    }
	    		$scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.seconds = theTime;
	    		$scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.minites = theTime1;
	    		$scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.hour = theTime2;
	    	}
	    	$scope.secondStepShow = true;
		    $scope.thirdStepShow = false;
		    $scope.fourStepShow = false;
		    $scope.fiveStepShow = false;
		    $scope.nextshow = false;
	    	//console.log(data.strategy);
	        //console.log(data.data);
	    }).error(function (data) {
	        console.info(data);
	    });


    $scope.gradePic= {
		'gradehigh':'highGrade',
		'grademidum':'midGrade',
		'gradelow':'lowGrade'
	}
	//外设
    var extendStrategyItems = {
            items: {}
    };
    //点击选中之后加入map
    $scope.toggleCheck = function (limitUse) {
        if (this.limitUse.selected) {
            extendStrategyItems.items[limitUse.name] = 1;
        } else {
             extendStrategyItems.items[limitUse.name] = 2;
        }
    };
    //外设初始状态值
    function extendinitStatus(extend) {
    	extendStrategyItems.items["isConnectUSB"] = 2;
    	extendStrategyItems.items["disableWifi"] = 2;
    	extendStrategyItems.items["disableCamera"] = 2;
    	extendStrategyItems.items["disableGps"] = 2;
    	extendStrategyItems.items["disableBluetooth"] = 2;
    	for(var i=0; i<extend.content.items.length; i++) {
    		if(extend.content.items[i].value == 1) {
    			extendStrategyItems.items[extend.content.items[i].name] = 1;
				extend.content.items[i].selected=true;
    		}else{
				extend.content.items[i].selected=false;
			}
    	}
    }
    //网络策略数据结构
    $scope.netStrategyItems = {
		FLOW_DATA: {
			item: 'FLOW_DATA',
			isAllowed: '1',
			content: {}
		},
		NET_APP: {
			item: 'NET_APP',
			isAllowed: '1',
			content: {}
		},
		APN: {
			item: 'APN',
			isAllowed: '1',
			content: {
				externalApns: [],
				internalApns: []
			}
		},
		BROWSER: {
			item: 'BROWSER',
			isAllowed: '1',
			content: {
				netWhiteList: []
			}
		}
	}
	/**
	 * 网络策略初始状态
	 * @param {Object} arg
	 */
	function netinitStatus(arg) {
		for(var i=0; i<arg.content.items.length; i++) {
			if(arg.content.items[i].item == 'FLOW_DATA') {
				$scope.netStrategyItems.FLOW_DATA.isAllowed = arg.content.items[i].isAllowed;
				$scope.netStrategyItems.FLOW_DATA.content.limit = arg.content.items[i].content.limit;
				if($scope.netStrategyItems.FLOW_DATA.isAllowed==1){
					$scope.flowModel=true;
				}
			}else if(arg.content.items[i].item == 'NET_APP') {
				$scope.netStrategyItems.NET_APP.isAllowed = arg.content.items[i].isAllowed;
				if($scope.netStrategyItems.NET_APP.isAllowed==1){
					$scope.netTraceCheck=true;
				}

			}else if(arg.content.items[i].item == 'APN') {
				$scope.netStrategyItems.APN.isAllowed = arg.content.items[i].isAllowed;
				if(arg.content.items[i].content.externalApns == 0) {
					$scope.netStrategyItems.APN.content.externalApns = [];
				}else {
					$scope.netStrategyItems.APN.content.externalApns = arg.content.items[i].content.externalApns;
				}

				if(arg.content.items[i].content.internalApns == 0) {
					$scope.netStrategyItems.APN.content.internalApns = [];
				}else {
					$scope.netStrategyItems.APN.content.internalApns = arg.content.items[i].content.internalApns;
				}

				if($scope.netStrategyItems.APN.content.externalApns.length>0||$scope.netStrategyItems.APN.content.internalApns.length>0) {
					$scope.netStrategyAPNCheck = true;
				}
				if($scope.netStrategyItems.APN.isAllowed==1){
					$scope.apnCheck = true;
				}
				if($scope.netStrategyAPNCheck && $scope.netStrategyItems.APN.isAllowed==1){
					$scope.addCheck = true;
				}

			}else if(arg.content.items[i].item == 'BROWSER'){
				$scope.netStrategyItems.BROWSER.isAllowed = arg.content.items[i].isAllowed;
				//$scope.netStrategyItems.BROWSER.content.netWhiteList = arg.content.items[i].content.netWhiteList;
				$scope.domainWhiteList = arg.content.items[i].content.netWhiteList;
				if($scope.netStrategyItems.BROWSER.isAllowed==1){
					$scope.nameList = true;
				}
				domainTableReload();
				/*if($scope.netStrategyItems.BROWSER.content.netWhiteList[0] != null) {
					$scope.netWhiteList = $scope.netStrategyItems.BROWSER.content.netWhiteList.join(",");
					//console.log($scope.netStrategyItems.BROWSER.content.netWhiteList);
					$scope.domainListShow = true;
					$scope.inputTextShow = false;
				}else {
					//debugger
					$scope.domainListShow = false;
					$scope.inputTextShow = true;
				}

			}
				}*/
			}
		}
	}
	
	//重新初始化列表
	function domainTableReload() {
		$scope.tableParams.page(1);
		$scope.tableParams.reload();
		if($scope.domainWhiteList.length>0) {
			$scope.domainListShow = true;
		}else{
			$scope.domainListShow = false;
		}
	}

	//根据选中和 反选中 进行动态改变 数据
	$scope.tableParams = new ngTableParams(
		{
			page: 1,  // 初始化显示第几页
			count: 5 // 初始化分页大小
		},
		{
			counts:[],
			paginationMaxBlocks: 5, //最多显示页码按钮个数
			paginationMinBlocks: 2,//最少显示页码按钮个数
			getData: function($defer, params) {
				var page = params.page();
				$scope.totalRecords = $scope.domainWhiteList.length;
				var totalCount = $scope.domainWhiteList.length;
				$scope.domainDataList = domainPageFun(page, 5);
				console.log($scope.domainDataList);
				params.total(totalCount);
				$defer.resolve($scope.domainDataList);
			}
		});

	$scope.domainWhiteList = [];
	function  domainPageFun(page, size) {
		var tempArr = [];
		var start = ( page - 1 ) * size;
		//var length = size;
		for(var i=start; i<$scope.domainWhiteList.length;i++) {
			if(tempArr.length == size) {
				break;
			}
			tempArr.push($scope.domainWhiteList[i]);
		}
		return tempArr;
	}
	//添加域名白名单的弹出框
	$scope.addDomainDialog = function (domainObj) {
		domainObj = domainObj || {};

		var input = {
			domain: domainObj.domain,
			name: domainObj.name
		};
		var editDomainCode;
		if(domainObj.domain != null) {
			editDomainCode = domainObj.domain;
			editDomainName = domainObj.name;
		}
		var _scope = $scope.domainWhiteList;
		dialog.openDialog({
			title:!domainObj.domain?"添加白名单域名":"编辑白名单域名",
			url: '../strategy/addDomain.do',
			size:'w500',
			resolve: {
				input: input
			},
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
						$scope.addFrm.domain.$dirty=true;
						$scope.addFrm.name.$dirty=true;

						if(typeof($scope.input.domain)=="undefined"||$scope.input.domain=="") {
							$scope.domainError = true;
							$scope.domainErrorMsg = "域名项必填,请输入如：baidu.com";
							return false;
						}
						//var patt = /^[0-9a-z.]+$/
						if(!/^[0-9a-z.]+$/.test($scope.addFrm.domain.$viewValue)) {
							$scope.domainError = true;
							$scope.domainErrorMsg = "域名不合法,请输入如：baidu.com";
							return false;
						}

						if(typeof($scope.input.name)=="undefined"||$scope.input.name=="") {
							$scope.nameError = true;
							$scope.nameErrorMsg = "网站名称必填";
							return false;
						}
						//var patt = /^[0-9a-z.]+$/
						if(!/[\u4e00-\u9fa5\w\s]+/.test($scope.addFrm.name.$viewValue)) {
							$scope.nameError = true;
							$scope.nameErrorMsg = "网站名称不合法,只能输入中英文字符";
							return false;
						}
						if(_scope.length >= 1000) {
							$scope.domainError = true;
							$scope.domainErrorMsg = "域名最多可以添加1000个";
							return false;
						}
						if($scope.addFrm.$invalid) {
							$scope.errorShow = true;
							return false;
						}

						var domainWhiteMap ={};
						//alert($scope.domainName+' '+$scope.domainNote);
						domainWhiteMap.name = $scope.addFrm.name.$modelValue;
						domainWhiteMap.domain = $scope.addFrm.domain.$modelValue;

						if(editDomainCode == null) {
							for(var i=0;i<_scope.length;i++) {
								if(domainWhiteMap.domain == _scope[i].domain) {
									$scope.domainError = true;
									$scope.domainErrorMsg = "该域名已经添加，请重新添加！";
									return false;
								}
							}
							_scope.push(domainWhiteMap);
						}else {
							//编辑
							if(domainWhiteMap.domain==editDomainCode && domainWhiteMap.name==editDomainName) {
								return true;
							}
							var dnIndex = _scope.indexOf(domainObj);
							if(dnIndex != -1) {
								_scope.splice(dnIndex, 1);
							}

							for(var i=0;i<_scope.length;i++) {
								if(domainWhiteMap.domain == _scope[i].domain) {
									$scope.domainError = true;
									$scope.domainErrorMsg = "该域名已添加，请重新添加！";
									_scope.push(domainObj);
									domainTableReload();
									return false;
								}
							}
							_scope.push(domainWhiteMap);
						}
						domainTableReload();
					}
				}
			]
		})
	}

	//删除域名白名单
	$scope.deleteDomain = function(domainObj) {
		var index = $scope.domainWhiteList.indexOf(domainObj);
		$scope.domainWhiteList.splice(index, 1);
		domainTableReload();
	}
	//模糊搜索匹配域名
	$scope.domainSearch = '';
	var totalDomainList = [];
	$scope.searchClick = function() {
		var domainSearchList = [];
		if($scope.domainWhiteList.length > totalDomainList.length) {
			totalDomainList = $scope.domainWhiteList;
		}
		//alert($scope.domainSearch);
		if( $scope.domainSearch == '') {
			$scope.domainWhiteList = totalDomainList;
			domainTableReload();
			return;
		}
		if($scope.domainSearch.length>0) {
			$scope.domainWhiteList = totalDomainList;
		}
		for(var i=0;i<$scope.domainWhiteList.length;i++) {
			if($scope.domainWhiteList[i].domain.indexOf($scope.domainSearch)!=-1 ||
				$scope.domainWhiteList[i].name.indexOf($scope.domainSearch)!=-1) {
				domainSearchList.push( $scope.domainWhiteList[i]);
			}
		}
		$scope.domainWhiteList = domainSearchList;
		domainTableReload();
	}
	//根据选中和 反选中 进行动态改变 数据 
	$scope.toggleCheckNet = function(item, isChecked) {
		if(isChecked) {
			if(item == 'FLOW_DATA') {
				$scope.netStrategyItems.FLOW_DATA.isAllowed = 1;
			}else if(item == 'NET_APP') {
				$scope.netStrategyItems.NET_APP.isAllowed = 1;
			}else if(item == 'APN') {
				$scope.netStrategyItems.APN.isAllowed = 1;
			}else if(item == 'BROWSER') {

				$scope.netStrategyItems.BROWSER.isAllowed = 1;
				//$scope.domainWhiteList = arg.content.items[i].content.netWhiteList;
				domainTableReload();

			}else if(item == 'APN-white') {
				$scope.netStrategyAPNCheck = true;
				$scope.showEdit = true;
			}
		}else {
			if(item == 'FLOW_DATA') {
				//TODO 清空conten中的内容
				$scope.netStrategyItems.FLOW_DATA.isAllowed = 2;
			}else if(item == 'NET_APP') {
				$scope.netStrategyItems.NET_APP.isAllowed = 2;
			}else if(item == 'APN') {
				$scope.netStrategyItems.APN.isAllowed = 2;
			}else if(item == 'BROWSER') {
				$scope.netStrategyItems.BROWSER.isAllowed = 2;
				$scope.netStrategyItems.BROWSER.content.netWhiteList.length = 0;
				$scope.domainListShow = false;
			}else if(item == 'APN-white') {
				$scope.netStrategyAPNCheck = false;
				$scope.showEdit = false;
			}
		}
		//console.log($scope.netStrategyAPNCheck);
	}

	//根据选中和 反选中 进行动态改变 数据
	$scope.toggleCheckApn = function (isChecked) {
		if(isChecked) {
			$scope.netStrategyItems.APN.isAllowed = 1;
			$scope.showApnCheck = true;
			$scope.thirdDisable = true;
			//$scope.netStrategyAPNCheck = true;
		}else{
			$scope.thirdDisable = false;
			$scope.showApnCheck = false;
			$scope.netStrategyAPNCheck = false;
			//清空
			$scope.netStrategyItems.APN.content.externalApns = [];
			$scope.netStrategyItems.APN.content.internalApns = [];
			$scope.netStrategyItems.APN.isAllowed = 2;
		}

	}
	$scope.toggleEditCheck = function (isChecked) {
		if(isChecked) {
			$scope.netStrategyItems.APN.isAllowed = 1;
			$scope.showEdit = true;
			$scope.netStrategyAPNCheck = true;
			if($scope.netStrategyItems.APN.content.externalApns.length<1||
				$scope.netStrategyItems.APN.content.internalApns.length<1) {
				$scope.thirdDisable = true;
			}
		}else{
			$scope.showEdit = false;
			//清空
			$scope.netStrategyItems.APN.content.externalApns = [];
			$scope.netStrategyItems.APN.content.internalApns = [];
			//$scope.netStrategyItems.APN.isAllowed = 2;
			$scope.netStrategyAPNCheck = false;
			$scope.showFinish = false;
		}
	}

    /*编辑apn*/
	$scope.editApn = function(str, apn) {
		if(str == 'intern') {
			var internIndex = $scope.netStrategyItems.APN.content.internalApns.indexOf(apn);
			if(internIndex > -1) {
				$scope.netStrategyItems.APN.content.internalApns.splice(internIndex, 1);
			}
			$scope.selectedIntenetApns = 'internalApns';
			$scope.contentExternalApns = apn;
		}
		if(str == 'extern') {
			var externIndex = $scope.netStrategyItems.APN.content.externalApns.indexOf(apn);
			if(externIndex > -1) {
				$scope.netStrategyItems.APN.content.externalApns.splice(externIndex, 1);
			}
			$scope.selectedIntenetApns = 'externalApns';
			$scope.contentExternalApns = apn;
		}
	}

    $scope.showEdit = false;
    $scope.editShow = function(){
    	$scope.showEdit = true;
    }
    $scope.closeFinish = function(){
    	$scope.showEdit = false;
    }
	$scope.selectedIntenetApns = 'internetOption';
   //判断apn接入点白名单是否符合条件
	$scope.showFinish = false;
	$scope.finishShow = function(){

		if($scope.contentExternalApns && $scope.selectedIntenetApns){
			$scope.cancelBtn = true;
			if($scope.selectedIntenetApns == 'internalApns') {
				var apnLength = $scope.netStrategyItems.APN.content.internalApns.length + $scope.netStrategyItems.APN.content.externalApns.length;
				if(apnLength>4) {
					$scope.errorNote = "APN白名单最多只能添加5个";
					$scope.showFinish = true;
					$scope.apnPointShow = true;
					return;
				}
				var internIndex = $scope.netStrategyItems.APN.content.internalApns.indexOf($scope.contentExternalApns);
				if(internIndex > -1) {
					$scope.errorNote = "内网apn重复，请重新添加";
					$scope.showFinish = true;
					$scope.apnPointShow = true;
					return;
				}
				$scope.netStrategyItems.APN.content.internalApns.push($scope.contentExternalApns);
				$scope.apnPointShow = false;
			} else if($scope.selectedIntenetApns == 'externalApns') {
				var apnLength = $scope.netStrategyItems.APN.content.internalApns.length + $scope.netStrategyItems.APN.content.externalApns.length;
				if(apnLength>4) {
					$scope.errorNote = "APN白名单最多只能添加5个";
					$scope.showFinish = true;
					$scope.apnPointShow = true;
					return;
				}
				var externIndex = $scope.netStrategyItems.APN.content.externalApns.indexOf($scope.contentExternalApns);
				if(externIndex > -1) {
					$scope.errorNote = "外网apn重复，请重新添加";
					$scope.showFinish = true;
					$scope.apnPointShow = true;
					return;
				}
				$scope.netStrategyItems.APN.content.externalApns.push($scope.contentExternalApns);
				$scope.apnPointShow = false;
			}else{
				$scope.errorNote = "请选择接入途径";
				$scope.apnPointShow = true;
			}
		}else{
			$scope.errorNote = "请选择接入途径且接入点不能为空";
			$scope.showFinish = true;
			$scope.apnPointShow = true;
		}
		if($scope.apnPointShow==false && $scope.showEdit == true){
			$scope.thirdDisable = false;
		}else{
			$scope.thirdDisable = true;
		}
	}
    $scope.thirdDisableFun = function () {
		$scope.thirdErrorShow=true;
	}
    //删除数据
    $scope.deleteData = function(str, apn){

		var internIndex = $scope.netStrategyItems.APN.content.internalApns.indexOf(apn);
		var externIndex = $scope.netStrategyItems.APN.content.externalApns.indexOf(apn);

		if(str == 'intern') {
			if(internIndex > -1) {
				$scope.netStrategyItems.APN.content.internalApns.splice(internIndex, 1);
			}
		}
		if(str == 'extern') {
			if(externIndex > -1) {
				$scope.netStrategyItems.APN.content.externalApns.splice(externIndex, 1);
			}
		}
		var internLength = $scope.netStrategyItems.APN.content.internalApns.length;
		var externLength = $scope.netStrategyItems.APN.content.externalApns.length;
		if((internLength>1)||(externLength>1)){
			$scope.thirdDisable = false;
		}else {
			$scope.thirdDisable = true;
		}
		$scope.showEdit = true;
		$scope.showFinish = false;
	}

    /*点击下一步*/
    $scope.stepTwo = function(){
	    $scope.firstStepShow = false;
	    $scope.secondStepShow = true;
	    $scope.addStepList[1].active = true;
	    //$scope.extendStrategyName = "1234124";
    }

     /*下一步*/
    $scope.stepThree = function() {
		$scope.addStepList[1].active = true;
    	$scope.addFrm.strategyName.$dirty=true;

    	if($scope.addFrm.$invalid) {
	   		return;
	   	}
    	//保存外设策略内容和注释
    	extendStrategyItems.items['extendStrategyName'] = $scope.addFrm.strategyName.$modelValue;
    	extendStrategyItems.items['extendStrategyNote'] = $scope.strategyInfo.note;
    	$scope.secondStepShow = false;
    	$scope.thirdStepShow = true;
    	//console.log(extendStrategyItems.items);
    	//alert($scope.itemCode);
    }
    /*上一步*/
    $scope.upTwoStep = function() {
    	$scope.thirdStepShow = false;
   		$scope.secondStepShow= true;
   		$scope.addStepList[1].active = false;
		$scope.addStepList[0].active = true;
    }

    /*应用策略配置项默认值*/
	var appPermission = {
		items : {

		}
	}
	 /* 违规策略数据结构
     * type:0 违规处理类型 0-违规只记录不管咯 1-禁拨电话 2-禁止上网 3-擦除数据 4-锁定屏幕
     * grade:违规等级(一共三个违规等级) 1是勾选，2是取消
     */
    $scope.violationStrategy = {
    	VIOLATION_TF_CHANGE: {
    		checked:2,
    		item:'VIOLATION_TF_CHANGE',
    		grade: 3,
    		overTime:0,
			limit:'',
    		type: 4
    	},
    	VIOLATION_TF_PULL_OUT: {
    		checked:2,
    		item:'VIOLATION_TF_PULL_OUT',
    		grade: 2,
    		overTime: 172800,
    		otherTime:0,
			limit:'',
    		type: 1
    	},
    	VIOLATION_SIM_CHANGE: {
    		checked:2,
    		item:'VIOLATION_SIM_CHANGE',
    		grade: 2,
    		overTime:0,
			limit:'',
    		type: 2
    	},
    	VIOLATION_SIM_PULL_OUT: {
    		checked:2,
    		item:'VIOLATION_SIM_PULL_OUT',
    		grade: 2,
    		overTime: 172800,
    		otherTime:0,
			limit:'',
    		type: 4
    	},
    	VIOLATION_ROOT: {
    		checked:2,
    		item:'VIOLATION_ROOT',
    		grade: 3,
    		overTime:0,
			limit:'',
    		type: 4
    	},
    	VIOLATION_OUT_FLOW_DATA: {
    		checked:2,
    		item:'VIOLATION_OUT_FLOW_DATA',
    		grade: 1,
    		overTime:0,
			limit:450,
    		type: 2
    	},
    	VIOLATION_USED_JWT_30: {
    		checked:2,
    		item:'VIOLATION_USED_JWT_30',
    		grade: 2,
    		overTime:0,
			limit:'',
    		type: 2
    	},
    	VIOLATION_APN: {
    		checked:2,
    		item:'VIOLATION_APN',
    		grade: 1,
    		overTime:0,
			limit:'',
    		type: 0
    	},
    	blackList: {
    		checked:2,
    		one:1,
    		two:0,
    		three:0
    	}
    }

    /**
	 * 违规时间设置
	 */
	$scope.violationStrategyTime = {
		VIOLATION_TF_PULL_OUT: {
			hour:0,
			minites:0,
			seconds:0
		},
		VIOLATION_SIM_PULL_OUT: {
			hour:0,
			minites:0,
			seconds:0
		}
	}
	//检查输入时间是否合法
	$scope.checkVioTime = function(code) {
		checkIsIlea(code)
	}
	function checkIsIlea(code) {
		if($scope.violationStrategy[code].overTime == 0 && $scope.violationStrategy[code].checked == 1) {
			var h = checkFormatTime($scope.violationStrategyTime[code].hour);
			if(!h) {
				return;
			}
			var m = checkFormatTime($scope.violationStrategyTime[code].minites);
			if(!m) {
				return;
			}
			var s = checkFormatTime($scope.violationStrategyTime[code].seconds);
			if(!s) {
				return;
			}
		}
	}

	function checkFormatTime(tim) {
		if(!/^[0-9]\d*$/.test(tim)) {
			$scope.sixNext = false;
			return false;
		}else {
			$scope.sixNext = true;
			return true;
		}
	}
    /**
     * 判断是否勾选
     */
    $scope.illegalSel = function(code, sel) {
		if(!sel) {
			$scope.violationStrategy[code].checked = 2;
			if((code == 'blackList')||($scope.violationStrategy.blackList.checked == 2)){
				$scope.sixNext4 = true;
				noBlackListCheck();
			}else{
				//checkRequireCondition();
				checkViolationSelect();
			}
			//判断流量阀值是否合法
			if($scope.violationStrategy.VIOLATION_OUT_FLOW_DATA.checked == 1) {
				checkFlower();
			}

		}else {
			$scope.violationStrategy[code].checked = 1;

			if($scope.violationStrategy.blackList.checked == 2){
				$scope.sixNext4 = true;
				noBlackListCheck();
			}else{
				//checkRequireCondition();
				checkViolationSelect();
			}
			//判断流量阀值是否合法
			if($scope.violationStrategy.VIOLATION_OUT_FLOW_DATA.checked == 1) {
				checkFlower();
			}
		}
	}
    //判断是显示apn白名单选项
	$scope.isShowAPNWhite = function(code) {

		if(code == 'VIOLATION_APN') {
			if($scope.netStrategyItems.APN.content.externalApns.length==0
				&& $scope.netStrategyItems.APN.content.internalApns.length==0) {
				return false;
			}else {
				return true;
			}
		}else {
			return true;
		}
	}
     /**
     * 点击选择违规等级
     * level:等级
     * code：VIOLATION_TF_CHANGE,VIOLATION_TF_PULL_OUT, VIOLATION_SIM_CHANGE, VIOLATION_SIM_PULL_OUT,
     * VIOLATION_ROOT, VIOLATION_OUT_FLOW_DATA, VIOLATION_USED_JWT_30,VIOLATION_APN
     */
    $scope.violationLevelSel = function(code) {
    	//debugger
    	//$scope.violationStrategy[code].grade = level;
    	if($scope.violationStrategy[code].checked==1&&$scope.violationStrategy.blackList.checked==1) {
			//checkRequireCondition();
			checkViolationSelect();
		}
    }
    /**
     * 点击选择违规处理
     * time:时间（24，36，48）
     */
    /**
	 * 点击选择违规处理
	 * time:时间（24，36，48）
	 */
	$scope.violationTimeSel = function(code) {
		if(code=='VIOLATION_TF_PULL_OUT') {
			if($scope.violationStrategy[code].overTime == 0) {
				$scope.hourMinSec2 = true;
			}else{
				$scope.hourMinSec2 = false;
			}
		}else if(code=='VIOLATION_SIM_PULL_OUT') {
			if($scope.violationStrategy[code].overTime == 0) {
				$scope.hourMinSec4 = true;
			}else{
				$scope.hourMinSec4 = false;
			}
		}
	}
   	//检查流量值是否合法
	$scope.checkFlowLimit = function() {
		checkFlower();
	}
	function checkFlower() {
		var flow = $scope.violationStrategy.VIOLATION_OUT_FLOW_DATA.limit;
		if(!/^[1-9]\d*$/.test(flow)) {
			$scope.sixNext = false;
		}else {
			$scope.sixNext = true;
		}
	}
    /**
     * 违规处理
     * type:0 违规处理类型 0-违规只记录不管咯 1-禁拨电话 2-禁止上网 3-擦除数据 4-锁定屏幕
     */
    $scope.violationHandle = function(type, code) {
    	$scope.violationStrategy[code].type = type;
    }
     /**
     * alert警告框
     * @type {{toString: Function, close: Function, show: Function}}
     */
    var alertInf = {
        toString: function () {
            return '[object mdcalert]'
        },

        /**
         * alert对话框超时
         * @param time 时长,单位毫秒
         */
        close: function (time) {
            var _this = this;
            var myAlert = _this.toString() == '[object mdcalert]';

            $timeout(function () {
                (myAlert ? $scope : _this).alert = null;
            }, (typeof time == 'undefined'? 2000 : time));
        },

        /**
         * 显示警告对话框
         * @param type
         * @param msg
         * @param time
         */
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

    $scope.appList = null;
    $scope.appMap  = null;
    $scope.mapItems = null;
    loadAppStr();
    function loadAppStr() {
    	$http({
        url : '../strategy/appStr.do',
        data: {
                     strategyId : $state.params.id
              },
        method : 'POST',
        cache:false,
        responseType :  "json"
    	})
	    .success(function (data) {
	    	//违规策略数据项
	    	//应用策略数据项
    		if(data.data.strategyItem == 'appStrategy') {
    			//$scope.appStrategyContent = data.data;
    			$scope.appList = data.appList;
    			$scope.appMap = data.appMap;
    			$scope.mapItems = data.mapList;
    		}
	    }).error(function (data) {
	        console.info(data);
	    });
    }
     /*下一步*/
    $scope.stepFour = function() {
		$scope.thirdErrorShow = true;
		$scope.addStepList[2].active = true;
    	if($scope.netStrategyItems.BROWSER.isAllowed == 1) {
    		//$scope.addDomainFrm.netWhiteName.$dirty=true;
	    	//alert($scope.addDomainFrm.netWhiteName.$modelValue);
			$scope.netStrategyItems.BROWSER.content.netWhiteList = $scope.domainWhiteList;
	    	/*if($scope.addDomainFrm.$invalid || $scope.netStrategyItems.BROWSER.content.netWhiteList.length<1) {
		   		return;
		   	}*/
    	}
   		//console.log($scope.netStrategyItems);
   		if($scope.appList!=null&&$scope.appMap!=null&&$scope.mapItems!=null) {
			/*for(var keyItem in $scope.mapItems) {
				$scope.appStrategyItems[keyItem] = $scope.mapItems[keyItem];
			}*/
			for(var i=0; i<$scope.mapItems.length;i++) {
				//$scope.appStrategyItems[$scope.mapItems[i].item] = $scope.mapItems[i];
				if($scope.mapItems[i].item=='APP_RUN') {
					$scope.appStrategyItems.APP_RUN.isAllowed =  $scope.mapItems[i].isAllowed;
				}
				if($scope.mapItems[i].item=='APP_ELEC') {
					$scope.appStrategyItems.APP_ELEC.isAllowed =  $scope.mapItems[i].isAllowed;
				}
				if($scope.mapItems[i].isAllowed==1){
					$scope.mapItems[i].selected = true;
				}
			}
			//软件项默认值
			$scope.prevItem={};
			$scope.prevItem.name = $scope.appList[0].name;
			$scope.prevItem.package_bak = $scope.appList[0].package_bak;
			$scope.prevItem.version = $scope.appList[0].version;
			$scope.prevItem.icon = $scope.appList[0].icon;
			$scope.appStrategyItems.appList = $scope.appMap;
			//权限默认值
			$scope.prevItemPer={};
	    	$scope.prevItemPer.itemName = $scope.strategyCodeList.appPermission[0].itemName;
			$scope.prevItemPer.itemCode = $scope.strategyCodeList.appPermission[0].itemCode;
			$scope.prevItemPer.note = $scope.strategyCodeList.appPermission[0].note;
			$scope.thirdStepShow = false;
	   		$scope.fourStepShow = true;
   		}

    }

     /*上一步*/
    $scope.upThreeStep = function() {
    	$scope.fourStepShow = false;
   		$scope.thirdStepShow= true;
   		$scope.addStepList[2].active = false;
		$scope.addStepList[1].active = true;
    }
    //应用策略数据结构
	$scope.appStrategyItems = {
		APP_RUN: {
			item: 'APP_RUN',
			isAllowed: '2',
			content: {}
		},
		APP_ELEC: {
			item: 'APP_ELEC',
			isAllowed: '2',
			content: {}
		},
		appList: {}

	}

	//选中 反选中
	$scope.toggleCheckApp = function(str) {
		//debugger
		if(this.items.selected) {
			if(str == 'APP_RUN') {
				$scope.appStrategyItems.APP_RUN.isAllowed = '1';
			}else if(str == 'APP_ELEC') {
				$scope.appStrategyItems.APP_ELEC.isAllowed = '1';
			}
		}else {
			if(str == 'APP_RUN') {
				$scope.appStrategyItems.APP_RUN.isAllowed = '2';
			}else if(str == 'APP_ELEC') {
				$scope.appStrategyItems.APP_ELEC.isAllowed = '2';
			}
		}

	}

	//点击软件
	$scope.clickSoft = function(item){
		//alert('');
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    };

	//选择权限
    $scope.appLimitShow = false;
    $scope.appLimitDisShow = false;
    $scope.limitShow = function(){
    	$scope.appLimitDisShow = false;
		$scope.appLimitShow = true;

    }
    //点击权限项
    $scope.clickPerssion = function(item) {
    	//alert('');
    	$scope.prevItemPer && ($scope.prevItemPer.visited = false);
        item.visited = true;
        $scope.prevItemPer = item;
    }

    $scope.limitDisShow = function(){
    	$scope.appLimitShow = false;
    	$scope.appLimitDisShow = true;
    }
    /*点击软件分类-->选择管理权限-->切换下拉按钮(1 WIFI com.wx)*/
    $scope.changeOption = function(valOp,appStr,url) {
    	//alert(url);
    	$scope.appStrategyItems.appList[url][appStr] = valOp;
    	//console.log(appPackage.WIFI);
    }
    //黑名单条件检测
	$scope.blackListCtr = function() {
		if($scope.violationStrategy.blackList.checked == 2){
			noBlackListCheck();
		}else{
			//checkRequireCondition();
			checkViolationSelect();
		}
	}
    //没有选择黑名单选项
	function  noBlackListCheck() {
		var i = 0;
		for(var key in $scope.violationStrategy) {
			if(key == 'blackList'){
				break;
			}else if($scope.violationStrategy[key].checked != 1){
				i++;
			}
			if(i==8&&$scope.violationStrategy.blackList.one==0&&$scope.violationStrategy.blackList.two==0&&$scope.violationStrategy.blackList.three==0) {
				$scope.sixNext4 = false;
			}
			if(i==8){
				$scope.sixNext = false;
			}else{
				$scope.sixNext = true;
			}
		}
	}
    //判断违规等级是否勾选
	function checkViolationSelect() {
		var sixNext1 = true;
		var sixNext2 = true;
		var sixNext3 = true;
		if($scope.violationStrategy.blackList.checked==1) {
				if($scope.violationStrategy.blackList.one != 0) {
					for(var key in $scope.violationStrategy) {
						if($scope.violationStrategy[key].checked == 2){
							continue;
						}
						if($scope.violationStrategy[key].grade == 1) {
							sixNext1 = true;
							break;
						}else {
							sixNext1 = false;
						}
					}
			    }
				if($scope.violationStrategy.blackList.two != 0) {
					for(var key in $scope.violationStrategy) {
						if($scope.violationStrategy[key].checked == 2){
							continue;
						}
						if($scope.violationStrategy[key].grade == 2) {
							sixNext2 = true;
							break;
						}else {
							sixNext2 = false;
						}
					}
				}
				if($scope.violationStrategy.blackList.three != 0) {
					for(var key in $scope.violationStrategy) {
						if($scope.violationStrategy[key].checked == 2){
							continue;
						}
						if($scope.violationStrategy[key].grade == 3) {
							sixNext3 = true;
							break;
						}else {
							sixNext3 = false;
						}
					}
				}

				if(sixNext1&&sixNext2&&sixNext3){
					$scope.sixNext4 = true;
					noBlackListCheck();
				}else {
					$scope.sixNext4 = false;
				}

		}
	}
    /*下一步*/
    $scope.stepFive = function() {
		//console.log($scope.appStrategyItems);
    	//$scope.appStrategy.
    	$scope.fourStepShow = false;
   		$scope.fiveStepShow= true;
   		$scope.addStepList[3].active = true;
   		if($scope.netStrategyItems.APN.content.externalApns.length==0
				&& $scope.netStrategyItems.APN.content.internalApns.length==0) {
				$scope.violationStrategy.VIOLATION_APN.checked = 2;
		}else{
			$scope.violationStrategy.VIOLATION_APN.checked = 1;
		}

		for(var i=0;i<$scope.strategyCodeList.violationStrategy.length;i++){
			var itemCode=$scope.strategyCodeList.violationStrategy[i].itemCode;
			if($scope.violationStrategy[itemCode].checked==1){
				$scope.strategyCodeList.violationStrategy[i].selected=true;
			}
		}

		if($scope.violationStrategy['blackList'].checked==1){
			$scope.showBlack = true;
		}
    }
    /*上一步*/
    $scope.upFourStep = function() {
    	$scope.fiveStepShow = false;
   		$scope.fourStepShow = true;
   		$scope.addStepList[3].active = false;
		$scope.addStepList[2].active = true;
    }
     $scope.finish = function(){
     	if($scope.violationStrategy.VIOLATION_TF_PULL_OUT.overTime == 0) {
			//alert($scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.seconds);
			$scope.violationStrategy.VIOLATION_TF_PULL_OUT.otherTime =
			parseInt($scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.seconds)	+
			parseInt($scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.minites*60)	 +
			parseInt($scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.hour*3600)	;
		}else {
			$scope.violationStrategy.VIOLATION_TF_PULL_OUT.otherTime = 0;
		}
		if($scope.violationStrategy.VIOLATION_SIM_PULL_OUT.overTime == 0) {
			$scope.violationStrategy.VIOLATION_SIM_PULL_OUT.otherTime =
			parseInt($scope.violationStrategyTime.VIOLATION_SIM_PULL_OUT.seconds) +
			parseInt($scope.violationStrategyTime.VIOLATION_SIM_PULL_OUT.minites*60) +
			parseInt($scope.violationStrategyTime.VIOLATION_SIM_PULL_OUT.hour*3600);
		}else {
			$scope.violationStrategy.VIOLATION_SIM_PULL_OUT.otherTime = 0;
		}
		//console.log($scope.violationStrategy);
    	/**
   		 * 保存策略
   		 */
   		$http({
	        url : '../strategy/save.do',
	        data: {
	        	violation : JSON.stringify($scope.violationStrategy),
	        	app : JSON.stringify($scope.appStrategyItems),
	        	net : JSON.stringify($scope.netStrategyItems),
	        	extend : JSON.stringify(extendStrategyItems.items),
	        	strategyId : $state.params.id,
	        	args : 'update'
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
	    //返回首页
    	//location.href("index.do");
    }
}]);
