app.add.controller('strategyAddCtr', ['$scope', '$state', '$sce',  '$http', 'strategySelect','ngTableParams', 'dialog', function ($scope, $state, $sce,  $http, strategySelect,ngTableParams, dialog) {
	$scope.$emit('menuChange', '/strategy/index');
	var code = ["STRATEGY_GRADE","extendStrategy","netStrategy","appStrategy","appPermission","violationStrategy","blackList"];
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
				//console.log(data.data);
			}).error(function (data) {
			console.info(data);
		});
	}


	$scope.addStepList = [
		{
			id:'1',name:"选择策略安全等级",pic:'no1-blue',active:true,lineShow:false
		},
		{
			id:'2',name:"配置外设策略",pic:'no2-blue',pic2:'no2-gray',active:false,lineShow:true
		},
		{
			id:'3',name:"配置网络策略",pic:'no3-blue',pic2:'no3-gray',active:false,lineShow:true
		},
		{
			id:'4',name:"配置应用策略",pic:'no4-blue',pic2:'no4-gray',active:false,lineShow:true
		},
		{
			id:'5',name:"配置违规策略",pic:'no5-blue',pic2:'no5-gray',active:false,lineShow:true
		},
		{
			id:'6',name:"部署策略",pic:'no6-blue',pic2:'no6-gray',active:false,lineShow:true
		}
	]

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
	//=================================第一步=============================
	/*默认显示第一步*/
	$scope.firstStepShow = true;
	$scope.secondStepShow = false;
	$scope.thirdStepShow = false;
	$scope.fourStepShow = false;
	$scope.fiveStepShow = false;
	$scope.sixStepShow = false;
	$scope.nextshow = false;

	$scope.gradePic= {
		'gradehigh':'highGrade',
		'grademidum':'midGrade',
		'gradelow':'lowGrade'
	}

	/*点击下一步*/
	$scope.stepTwo = function(){
		$scope.firstStepShow = false;
		$scope.secondStepShow = true;
		$scope.addStepList[1].active = true;
		//$scope.extendStrategyName = "1234124";
	}

	//编辑策略
	$scope.editStrategy = function(itemId) {
		$state.go("strategy/edit",{id:itemId});
	}
	//编辑模式策略
	$scope.editModel = function(itemId) {
		//alert(itemId);
		$state.go("strategy/editModel", {id:itemId});
	}


	//删除策略
	var alertInf = {
		toString: function () {
			return '[object mdcalert]'
		},
	}
	//==============================第二步==================================
	/**
	 * 外设策略数据
	 */
	var extendStrategyItems = {
		items: {}
	};

	//点击选中之后加入map
	$scope.toggleCheck = function (limitUse) {
		if (this.limitUse.selected) {
			extendStrategyItems.items[limitUse.itemCode] = '1';
		} else {
			//delete strategyItems.items[limitUse.itemCode];
			extendStrategyItems.items[limitUse.itemCode] = '2';
		}
		// console.log(extendStrategyItems.items);
	};

	$scope.disableShow = function () {
		$scope.errorShow = true;
	}

	/*上一步*/
	$scope.upStepFirst = function() {
		$scope.secondStepShow = false;
		$scope.firstStepShow = true;
		$scope.addStepList[1].active = false;
	}
	/*下一步*/
	$scope.stepThree = function() {
		/*console.log("$scope.notError============"+$scope.notError);
		console.log("$scope.showEdit============"+$scope.showEdit);*/
		$scope.addFrm.strategyName.$dirty=true;

		if($scope.addFrm.$invalid) {
			return;
		}
		if($scope.checkStrategyName) {
			return;
		}


		//保存外设策略内容和注释
		extendStrategyItems.items['extendStrategyName'] = $scope.addFrm.strategyName.$modelValue;
		extendStrategyItems.items['extendStrategyNote'] = $scope.extendStrategyNote;
		$scope.secondStepShow = false;
		$scope.thirdStepShow = true;
		/*console.log(extendStrategyItems.items);*/

		$scope.addStepList[2].active = true;

		//alert($scope.itemCode);
	}

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

	/*==================第三步=================*/
	$scope.netStrategy = {
		FLOW_DATA: {
			item: 'FLOW_DATA',
			isAllowed: 1,
			content: {}
		},
		NET_APP: {
			item: 'NET_APP',
			isAllowed: 1,
			content: {}
		},
		APN: {
			item: 'APN',
			isAllowed: 1,
			content: {
				externalApns: [],
				internalApns: []
			}
		},
		BROWSER: {
			item: 'BROWSER',
			isAllowed: 1,
			content: {
				netWhiteList: []
			}
		}
	}
	$scope.thirdDisableFun = function () {
		$scope.thirdErrorShow=true;
	}
	//根据勾选进行判断是否进入下一步
	$scope.btnGreenFour = function() {
		/*if($scope.netStrategy.FLOW_DATA.isAllowed==1) {
		 if(!$scope.netStrategy.FLOW_DATA.$valid) {
		 $scope.args_flow = true;
		 }
		 }else {
		 $scope.args_flow = true;
		 }*/

		if($scope.netStrategy.BROWSER.isAllowed==1) {
			if(!(addDomainFrm.netWhiteName.$valid)) {
				$scope.args_browser = true;
			}
		}else {
			$scope.args_browser = true;
		}

	}
	//根据选中和 反选中 进行动态改变 数据
	$scope.toggleCheckApn = function (isChecked) {
		if(isChecked) {
			$scope.netStrategy.APN.isAllowed = 1;
			$scope.showApnCheck = true;
			$scope.thirdDisable = true;
		}else{
			$scope.thirdDisable = false;
			$scope.showApnCheck = false;
			//清空
			$scope.netStrategy.APN.content.externalApns = 0;
			$scope.netStrategy.APN.content.internalApns = 0;
			$scope.externalApns = [];
			$scope.internalApns = [];
			$scope.netStrategy.APN.isAllowed = 2;
		}
	}
	$scope.toggleEditCheck = function (isChecked) {
		if(isChecked) {
			$scope.netStrategy.APN.isAllowed = 1;
			var internLength = $scope.netStrategy.APN.content.internalApns.length;
			var externLength = $scope.netStrategy.APN.content.externalApns.length;

			if(internLength<1 && externLength<1){
				$scope.thirdDisable = true;
			}else {
				$scope.thirdDisable = false;
			}
			$scope.showEdit = true;
		}else{
			$scope.showEdit = false;
			//清空
			$scope.netStrategy.APN.content.externalApns = [];
			$scope.netStrategy.APN.content.internalApns = [];
			$scope.externalApns = [];
			$scope.internalApns = [];
			$scope.netStrategy.APN.isAllowed = 2;
		}
	}

	$scope.toggleCheckNet = function(item, isChecked) {
		if(isChecked) {
			if(item == 'FLOW_DATA') {
				$scope.netStrategy.FLOW_DATA.isAllowed = 1;
			}else if(item == 'NET_APP') {
				$scope.netStrategy.NET_APP.isAllowed = 1;
			}else if(item == 'BROWSER') {
				//debugger
				$scope.netStrategy.BROWSER.isAllowed = 1;
				if($scope.netStrategy.BROWSER.content.netWhiteList.length>0) {
					$scope.netWhiteList = $scope.netStrategy.BROWSER.content.netWhiteList.join(",");

					$scope.domainListShow = true;
					$scope.inputTextShow = false;
				}else {
					//debugger
					$scope.domainListShow = false;
					$scope.inputTextShow = true;
				}
			}
		}else {
			if(item == 'FLOW_DATA') {
				//TODO 清空conten中的内容
				$scope.netStrategy.FLOW_DATA.isAllowed = 2;
			}else if(item == 'NET_APP') {
				$scope.netStrategy.NET_APP.isAllowed = 2;
			}else if(item == 'BROWSER') {
				$scope.netStrategy.BROWSER.isAllowed = 2;
				$scope.netStrategy.BROWSER.content.netWhiteList.length = 0;
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
	};
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
				/*console.log($scope.domainDataList);*/
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
						var domainWhiteMap ={};
						//alert($scope.domainName+' '+$scope.domainNote);
						domainWhiteMap.name = $scope.addFrm.name.$modelValue;
						domainWhiteMap.domain = $scope.addFrm.domain.$modelValue;

                        if(editDomainCode == null) {
                            for(var i=0;i<_scope.length;i++) {
                                if(domainWhiteMap.domain == _scope[i].domain) {
                                    $scope.domainError = true;
                                    $scope.domainErrorMsg = "该域名已添加，请重新添加！";
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
	$scope.externalApns = [];
	$scope.internalApns = [];

	/*上一步*/
	$scope.upTwoStep = function() {
		$scope.thirdStepShow = false;
		$scope.secondStepShow= true;
		$scope.addStepList[2].active = false;
	}
	/*下一步*/
	$scope.stepFour = function() {
		$scope.thirdErrorShow = true;
		$scope.thirdStepShow = false;
		$scope.fourStepShow = true;
		$scope.addStepList[3].active = true;
		//点击下一步 把数据保存到netStrategy
		$scope.netStrategy.APN.content['externalApns'] = $scope.externalApns;
		$scope.netStrategy.APN.content['internalApns'] = $scope.internalApns;
        $scope.netStrategy.BROWSER.content.netWhiteList = $scope.domainWhiteList;
		/*console.log($scope.netStrategy);*/
		$http({
			url : '../strategy/appInfoList.do',
			method : 'POST',
			cache:false,
			responseType :  "json"
		})
			.success(function (data) {
				$scope.limitlist = data.data;

				$scope.prevItem={};
				$scope.prevItem.name = $scope.limitlist[0].name;
				$scope.prevItem.package_bak = $scope.limitlist[0].package_bak;
				$scope.prevItem.version = $scope.limitlist[0].version;
				$scope.prevItem.icon = $scope.limitlist[0].icon;
				//权限默认值
				$scope.prevItemPer={};
				$scope.prevItemPer.itemName = $scope.strategyCodeList.appPermission[0].itemName;
				$scope.prevItemPer.itemCode = $scope.strategyCodeList.appPermission[0].itemCode;
				$scope.prevItemPer.note = $scope.strategyCodeList.appPermission[0].note;
				for(var i=0;i<$scope.limitlist.length;i++) {
					if($scope.itemCode == "gradehigh"){
						$scope.appStrategy.appList[$scope.limitlist[i].package_bak] =
						{'WIFI':2,'LOCATION':2,'RECORD':2,'BLUETOOTH':2,'CAMERA':2,'SMS':2,'CONTACTS':2,'CALL_LOG':2};
					}else if($scope.itemCode == "grademidum") {
						$scope.appStrategy.appList[$scope.limitlist[i].package_bak] =
						{'WIFI':0,'LOCATION':2,'RECORD':2,'BLUETOOTH':2,'CAMERA':0,'SMS':2,'CONTACTS':2,'CALL_LOG':2};
					}else {
						$scope.appStrategy.appList[$scope.limitlist[i].package_bak] =
						{'WIFI':0,'LOCATION':0,'RECORD':0,'BLUETOOTH':0,'CAMERA':0,'SMS':0,'CONTACTS':0,'CALL_LOG':0};
					}
				}
			}).error(function (data) {
			console.info(data);
		});
	}
	/*流量监控*/
	$scope.flowNum=true;
	$scope.flowClick = function(valueNum){
		if(valueNum){
			$scope.flowNum=false
		}else if(valueNum==false){
			$scope.flowNum=true
		}else{
			$scope.flowNum=false
		}
	}

	/*编辑apn*/
	$scope.editApn = function(str, apn) {
		if(str == 'intern') {
			var internIndex = $scope.internalApns.indexOf(apn);
			if(internIndex > -1) {
				$scope.internalApns.splice(internIndex, 1);
			}
			$scope.selectedIntenetApns = 'internalApns';
			$scope.contentExternalApns = apn;
		}
		if(str == 'extern') {
			var externIndex = $scope.externalApns.indexOf(apn);
			if(externIndex > -1) {
				$scope.externalApns.splice(externIndex, 1);
			}
			$scope.selectedIntenetApns = 'externalApns';
			$scope.contentExternalApns = apn;
		}
	}
	$scope.selectedIntenetApns = 'internetOption';
	//判断apn接入点白名单是否符合条件
	$scope.showFinish = false;
	$scope.errorNote = "请选择接入途径且接入点不能为空";
	$scope.finishShow = function(){
		if($scope.contentExternalApns && $scope.selectedIntenetApns){
			$scope.cancelBtn = true;
			if($scope.selectedIntenetApns == 'internalApns') {
				var apnLength = $scope.internalApns.length + $scope.externalApns.length;
				if(apnLength>4) {
					$scope.errorNote = "APN白名单最多只能添加5个";
					$scope.showFinish = true;
					$scope.apnPointShow = true;
					return;
				}
				var internIndex = $scope.internalApns.indexOf($scope.contentExternalApns);
				if(internIndex > -1) {
					$scope.errorNote = "内网apn重复，请重新添加";
					$scope.showFinish = true;
					$scope.apnPointShow = true;
					return;
				}
				$scope.internalApns.push($scope.contentExternalApns);
				$scope.apnPointShow = false;
			} else if($scope.selectedIntenetApns == 'externalApns') {
				var apnLength = $scope.internalApns.length + $scope.externalApns.length;
				if(apnLength>4) {
					$scope.errorNote = "APN白名单最多只能添加5个";
					$scope.showFinish = true;
					$scope.apnPointShow = true;
					return;
				}
				var externIndex = $scope.externalApns.indexOf($scope.contentExternalApns);
				if(externIndex > -1) {
					$scope.errorNote = "外网apn重复，请重新添加";
					$scope.showFinish = true;
					$scope.apnPointShow = true;
					return;
				}
				$scope.externalApns.push($scope.contentExternalApns);
				$scope.apnPointShow = false;
			}else{
				$scope.errorNote = "请选择接入途径";
				$scope.apnPointShow = true;
				$scope.showFinish = true;
			}
		}else{
			$scope.errorNote = "请选择接入途径且接入点不能为空";
			$scope.showFinish = true;
			$scope.apnPointShow = true;
		}
		if($scope.apnPointShow==false && $scope.showEdit == true){
			if(($scope.internalApns.length + $scope.externalApns.length)<1) {
				$scope.thirdDisable = true;
			}else{
				$scope.thirdDisable = false;
			}
		}else{
			$scope.thirdDisable = true;
		}
	}
	$scope.deleteData = function(str, apn){
		var internLength = $scope.internalApns.length;
		var externLength = $scope.externalApns.length;
		var internIndex = $scope.internalApns.indexOf(apn);
		var externIndex = $scope.externalApns.indexOf(apn);
		if((internLength==1&&externLength==1)||(internLength>1)||(externLength>1)){
			$scope.thirdDisable = false;
		}else {
			$scope.thirdDisable = true;
		}
		if(str == 'intern') {
			if(internIndex > -1) {
				$scope.internalApns.splice(internIndex, 1);
			}
		}
		if(str == 'extern') {
			if(externIndex > -1) {
				$scope.externalApns.splice(externIndex, 1);
			}
		}
		$scope.showFinish = false;
	}

	//============================第四步==========================
	//应用策略数据结构
	$scope.appStrategy = {
		APP_RUN: {
			item: 'APP_RUN',
			isAllowed: '1',
			content: {}
		},
		APP_ELEC: {
			item: 'APP_ELEC',
			isAllowed: '2',
			content: {}
		},
		appList: {}

	}
	/*应用策略配置项默认值*/
	var appPermission = {
		items : {}
	}

	//选中 反选中
	$scope.toggleCheckApp = function(str) {
		//debugger
		if(this.app.selected) {
			if(str == 'APP_RUN') {
				$scope.appStrategy.APP_RUN.isAllowed = '1';
			}else if(str == 'APP_ELEC') {
				$scope.appStrategy.APP_ELEC.isAllowed = '1';
			}
		}else {
			if(str == 'APP_RUN') {
				$scope.appStrategy.APP_RUN.isAllowed = '2';
			}else if(str == 'APP_ELEC') {
				$scope.appStrategy.APP_ELEC.isAllowed = '2';
			}
		}

	}
	//点击软件
	$scope.clickSoft = function(item){
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

		$scope.appStrategy.appList[url][appStr] = valOp;
	}
	/*上一步*/
	$scope.upThreeStep = function() {
		$scope.fourStepShow = false;
		$scope.thirdStepShow= true;
		$scope.addStepList[3].active = false;
	}
	/*下一步*/
	$scope.stepFive = function() {

		$scope.fourStepShow = false;
		$scope.fiveStepShow= true;
		$scope.addStepList[4].active = true;
		if($scope.netStrategy.APN.content.externalApns.length==0
			&& $scope.netStrategy.APN.content.internalApns.length==0) {
			$scope.violationStrategy.VIOLATION_APN.checked = 2;
		}else{
			$scope.violationStrategy.VIOLATION_APN.checked = 1;
		}
	}
	/*=====================================第五步========================*/
	/* 违规策略数据结构
	 * type:0 违规处理类型 0-违规只记录不管咯 1-禁拨电话 2-禁止上网 3-擦除数据 4-锁定屏幕
	 * grade:违规等级(一共三个违规等级) 1是勾选，2是取消
	 */
	$scope.violationStrategy = {
		VIOLATION_TF_CHANGE: {
			checked:1,
			item:'VIOLATION_TF_CHANGE',
			grade: 3,
			type: 4
		},
		VIOLATION_TF_PULL_OUT: {
			checked:1,
			item:'VIOLATION_TF_PULL_OUT',
			grade: 2,
			overTime: 172800,
			otherTime:0,
			type: 1
		},
		VIOLATION_SIM_CHANGE: {
			checked:1,
			item:'VIOLATION_SIM_CHANGE',
			grade: 2,
			type: 2
		},
		VIOLATION_SIM_PULL_OUT: {
			checked:1,
			item:'VIOLATION_SIM_PULL_OUT',
			grade: 2,
			overTime: 172800,
			otherTime:0,
			type: 4
		},
		VIOLATION_ROOT: {
			checked:1,
			item:'VIOLATION_ROOT',
			grade: 3,
			type: 4
		},
		VIOLATION_OUT_FLOW_DATA: {
			checked:1,
			item:'VIOLATION_OUT_FLOW_DATA',
			limit:'450',
			grade: 1,
			type: 2
		},
		VIOLATION_USED_JWT_30: {
			checked:1,
			item:'VIOLATION_USED_JWT_30',
			grade: 2,
			type: 2
		},
		VIOLATION_APN: {
			checked:1,
			item:'VIOLATION_APN',
			grade: 1,
			type: 0
		},
		blackList: {
			checked:1,
			one:1,
			two:0,
			three:0
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
		}else {

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
	 * 违规处理
	 * type:0 违规处理类型 0-违规只记录不管咯 1-禁拨电话 2-禁止上网 3-擦除数据 4-锁定屏幕
	 */
	$scope.violationHandle = function(type, code) {
		$scope.violationStrategy[code].type = type;
	}

	//查询选择是否满足条件
	function checkRequireCondition() {

		for(var key in $scope.violationStrategy) {
			if(key == "blackList"){
				continue;
			}

			if($scope.violationStrategy[key].checked == 2){
				continue;
			}else{
				if($scope.violationStrategy[key].grade == 1) {
					if($scope.violationStrategy.blackList.one == 0){
						$scope.sixNext = false;
						break;
					}
				}else if($scope.violationStrategy[key].grade == 2) {
					if($scope.violationStrategy.blackList.two == 0){
						$scope.sixNext = false;
						break;
					}
				}else if($scope.violationStrategy[key].grade == 3){
					if($scope.violationStrategy.blackList.three == 0){
						$scope.sixNext = false;
						break;
					}
				}
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

	//黑名单条件检测
	$scope.blackListCtr = function() {
		if($scope.violationStrategy.blackList.checked == 2){
			noBlackListCheck();
		}else{
			//checkRequireCondition();
			checkViolationSelect();
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
			//验证时间是否合法
			checkIsIlea(code);

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
			if($scope.netStrategy.APN.content.externalApns.length==0
				&& $scope.netStrategy.APN.content.internalApns.length==0) {
				return false;
			}else {
				return true;
			}
		}else {
			return true;
		}
	}

	/*控制点击勾选显示的选项*/
	$scope.illegalStrgClick = function(item,showVal){
		if(showVal){
			item.showNum=2;
		}else if(showVal==false){
			item.showNum=1;
		}else{
			if(item.sel=='1'){
				item.showNum=2;
			}else{
				item.showNum=1;
			}
		}
	}
	$scope.showHigh=function(highShowVal){
		if(!highShowVal){
			if($scope.highShow == '1'){
				$scope.highShow ='2'
			}else{
				$scope.highShow ='1';
			}
		}else{
			$scope.highShow ='2';
		}
	}
	/*上一步*/
	$scope.upFourStep = function() {
		$scope.fiveStepShow = false;
		$scope.fourStepShow = true;
		$scope.addStepList[4].active = false;
	}
	/*下一步*/
	$scope.stepSix = function() {

		if($scope.violationStrategy.VIOLATION_TF_PULL_OUT.overTime == 0) {
			$scope.violationStrategy.VIOLATION_TF_PULL_OUT.otherTime =
				parseInt($scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.seconds)	+
				parseInt($scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.minites*60)	 +
				parseInt($scope.violationStrategyTime.VIOLATION_TF_PULL_OUT.hour*3600)	;
		}
		if($scope.violationStrategy.VIOLATION_SIM_PULL_OUT.overTime == 0) {
			$scope.violationStrategy.VIOLATION_SIM_PULL_OUT.otherTime =
				parseInt($scope.violationStrategyTime.VIOLATION_SIM_PULL_OUT.seconds) +
				parseInt($scope.violationStrategyTime.VIOLATION_SIM_PULL_OUT.minites*60) +
				parseInt($scope.violationStrategyTime.VIOLATION_SIM_PULL_OUT.hour*3600);
		}
		$scope.fiveStepShow = false;
		$scope.sixStepShow= true;
		$scope.addStepList[5].active = true;
		//加载列表数据
		tableReload();
		/*console.log($scope.violationStrategy);*/

	}
	//========================第六步===========================
	$scope.mapList=[
		{
			device:'all',deviceTitle:'部署到所有设备',content:'此策略将会部署到除白名单设备以外的所有警员设备',pic:'allUser'
		},
		{
			device:'none',deviceTitle:'暂不部署',content:'此策略将不会部署到任何设备，但此策略将会保存到列表中，当然你可以随时部署。',pic:'noUser'
		},
		{
			device:'self',deviceTitle:'自定义',content:'你可以将此条策略根据需要部署到设备或设备组。',pic:'customUser'
		}
	]
	$scope.finishBtn = false;
	$scope.mapWapFn = function(mapWayDevice){
		//alert(mapWayDevice);
		$scope.device = mapWayDevice;
		$scope.finishBtn = true;
	}
	/*上一步*/
	$scope.upFiveStep = function(){
		$scope.sixStepShow=false;
		$scope.fiveStepShow = true;
		$scope.addStepList[5].active = false;
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
		/**
		 * 保存策略
		 */
		$http({
			url : '../strategy/save.do',
			data: {
				violation : JSON.stringify($scope.violationStrategy),
				app : JSON.stringify($scope.appStrategy),
				net : JSON.stringify($scope.netStrategy),
				extend : JSON.stringify(extendStrategyItems.items),
				args : 'save',
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
						if($scope.groupShow) {
							if(groupList.length>0) {
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
	/*选择高中低策略对应的默认勾选项*/
	$scope.firstStepClick = function(gradeNum){
		strategySelect.grade = gradeNum;
		$scope.itemCode=gradeNum;
		$scope.nextshow = true;
		/*初始化选择策略后的选项*/
		if($scope.itemCode == "gradehigh"){
			/*外设策略默认配置项*/
			/*$scope.strategyCodeList.extendStrategy[0].id = '0';*/
			$scope.strategyCodeList.extendStrategy[0].selected=false;
			/*$scope.strategyCodeList.extendStrategy[1].id = '0';*/
			$scope.strategyCodeList.extendStrategy[1].selected=false;
			/*$scope.strategyCodeList.extendStrategy[2].id = '0';*/
			$scope.strategyCodeList.extendStrategy[2].selected=false;
			/*$scope.strategyCodeList.extendStrategy[3].id = '0';*/
			$scope.strategyCodeList.extendStrategy[3].selected=false;
			/*$scope.strategyCodeList.extendStrategy[4].id = '1';*/
			$scope.strategyCodeList.extendStrategy[4].selected=true;

			extendStrategyItems.items["isConnectUSB"] = '1';
			extendStrategyItems.items["disableWifi"] = '2';
			extendStrategyItems.items["disableCamera"] = '2';
			extendStrategyItems.items["disableGps"] = '2';
			extendStrategyItems.items["disableBluetooth"] = '2';
			/*外设策略默认配置项*/

			/*网络策略默认配置项*/
			$scope.netStrategy.FLOW_DATA.isAllowed = 1;
			$scope.netStrategy.NET_APP.isAllowed = 1;
			$scope.netStrategy.APN.isAllowed = 1;
			$scope.netStrategy.BROWSER.isAllowed = 1;
			$scope.inputTextShow = true;
			$scope.showEdit = true;
			$scope.thirdDisable = true;
			$scope.showApnCheck = true;
			$scope.flowModel=true;
			$scope.netTraceCheck = true;
			$scope.apnCheck = true;
			$scope.addCheck = true;
			$scope.nameList = true;
			/*网络策略默认配置项*/

			/*应用策略配置项*/
			$scope.strategyCodeList.appStrategy[0].selected=true;
			/*应用策略配置项*/
			/*违规策略配置项*/
			for(var i=0;i<$scope.strategyCodeList.violationStrategy.length;i++){
					$scope.strategyCodeList.violationStrategy[i].showVal = true;
			}
			$scope.showBlack=true;
			/*违规策略配置项*/
			$scope.sixNext = true;
			$scope.sixNext4 = true;
			/*
			 * 黑名单默认策略项
			 */
			$scope.blackStrategy == 0;
		}
		if($scope.itemCode == "grademidum"){
			/*外设策略默认配置项*/
			/*$scope.strategyCodeList.extendStrategy[0].id = '0';*/
			$scope.strategyCodeList.extendStrategy[0].selected=false;
			/*$scope.strategyCodeList.extendStrategy[1].id = '1';*/
			$scope.strategyCodeList.extendStrategy[1].selected=true;
			/*$scope.strategyCodeList.extendStrategy[2].id = '1';*/
			$scope.strategyCodeList.extendStrategy[2].selected=true;
			/*$scope.strategyCodeList.extendStrategy[3].id = '0';*/
			$scope.strategyCodeList.extendStrategy[3].selected=false;
			/*$scope.strategyCodeList.extendStrategy[4].id = '1';*/
			$scope.strategyCodeList.extendStrategy[4].selected=true;

			extendStrategyItems.items["disableCamera"] = '1';
			extendStrategyItems.items["disableGps"] = '1';
			extendStrategyItems.items["isConnectUSB"] = '1';
			extendStrategyItems.items["disableBluetooth"] = '2';
			extendStrategyItems.items["disableWifi"] = '2';
			/*外设策略默认配置项*/

			/*网络策略默认配置项*/
			$scope.netStrategy.FLOW_DATA.isAllowed = 1;
			$scope.netStrategy.NET_APP.isAllowed = 1;
			$scope.netStrategy.APN.isAllowed = 2;
			$scope.netStrategy.BROWSER.isAllowed = 1;
			$scope.inputTextShow = true;
			$scope.thirdDisable = false;
			$scope.showEdit = false;
			if($scope.netStrategy.APN.isAllowed == 1) {
				$scope.showApnCheck = true;
			}else{
				$scope.showApnCheck = false;
			}
			$scope.flowModel=true;
			$scope.netTraceCheck = true;
			$scope.apnCheck = false;
			$scope.addCheck = false;
			$scope.nameList = true;
			/*网络策略默认配置项*/
			/*应用策略配置项*/
			$scope.strategyCodeList.appStrategy[0].selected=true;
			/*应用策略配置项*/
			/*违规策略配置项*/
			for(var i=0;i<$scope.strategyCodeList.violationStrategy.length;i++){
				$scope.strategyCodeList.violationStrategy[i].showVal = true;
			}
			$scope.showBlack=false;
			$scope.sixNext4 = true;
			$scope.violationStrategy.blackList.checked = 2;
			$scope.sixNext = true;
			/*违规策略配置项*/

			$scope.gradehigh = false;
			$scope.showNum = false;

			$scope.grademidum = true;
			$scope.nameListShow = true;

			$scope.forbid = 'medium';

			$scope.allow = 'medium';
			$scope.highShow ='2';
		}
		if($scope.itemCode == "gradelow"){
			/*外设策略默认配置项*/
			for( var i=0; i< $scope.strategyCodeList.extendStrategy.length;i++){
				$scope.strategyCodeList.extendStrategy[i].id = '1';
				$scope.strategyCodeList.extendStrategy[i].selected=true;
				extendStrategyItems.items[$scope.strategyCodeList.extendStrategy[i].itemCode] = '1';
			}
			/*外设策略默认配置项*/

			/*网络策略默认配置项*/
			$scope.netStrategy.FLOW_DATA.isAllowed = 1;
			$scope.netStrategy.NET_APP.isAllowed = 1;
			$scope.netStrategy.APN.isAllowed = 2;
			$scope.netStrategy.BROWSER.isAllowed = 2;
			$scope.inputTextShow = false;
			$scope.thirdDisable = false;
			$scope.showEdit = false;
			if($scope.netStrategy.APN.isAllowed == 1) {
				$scope.showApnCheck = true;
			}else{
				$scope.showApnCheck = false;
			}
			$scope.flowModel=true;
			$scope.netTraceCheck = true;
			$scope.apnCheck = false;
			$scope.addCheck = false;
			$scope.nameList = false;
			/*网络策略默认配置项*/
			/*应用策略配置项*/
			$scope.strategyCodeList.appStrategy[0].selected=true;
			/*应用策略配置项*/
			/*违规策略配置项*/
			$scope.sixNext4 = true;
			$scope.violationStrategy.blackList.checked = 2;
			$scope.violationStrategy.VIOLATION_OUT_FLOW_DATA.checked = 2;
			$scope.violationStrategy.VIOLATION_USED_JWT_30.checked = 2;
			$scope.violationStrategy.VIOLATION_APN.checked = 2;
			$scope.sixNext = true;
			for(var i=0;i<$scope.strategyCodeList.violationStrategy.length;i++){
				if($scope.strategyCodeList.violationStrategy[i].id<6){
					$scope.strategyCodeList.violationStrategy[i].showVal = true;
				}else{
					$scope.strategyCodeList.violationStrategy[i].showVal = false;
				}
			}
			$scope.showBlack=false;
			/*违规策略配置项*/
			$scope.grademidum = false;
			$scope.gradehigh = false;
			$scope.showNum = false;
			$scope.nameListShow = false;

			$scope.forbid = 'low';
			$scope.allow = 'low';
			$scope.highShow ='2';
		}

		/*if($scope.itemCode == 'gradehigh'){
		 $scope.gradehigh = true;
		 $scope.showNum = true;
		 $scope.nameListShow = true;

		 $scope.grademidum = true;
		 $scope.forbid = 'high';

		 $scope.allow = 'high';
		 $scope.highShow ='1';
		 }*/
	}

	//回车键搜索
	$scope.myKeyup = function(e) {
		var keycode = window.event?e.keyCode:e.which;
		if(keycode == 13) {
			$scope.searchPerson();
		}
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

	//点击树选择框时
	$scope.selectDept = {};
	$scope.deptId = null;
	$scope.selectCallback =  function (ivhNode, ivhIsSelected, ivhTree) {
		//ivhTreeviewMgr.deselectAll($scope.list);
		$scope.selectDept = ivhNode;
		$scope.deptId = ivhNode.id;
		//alert($scope.deptId);

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
					for (var i=0; i<data.data.length;i++) {
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
			/*var index = $scope.selectPerson.indexOf(this.person);
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
		/*this.person.selected = false;
		var index = $scope.selectPerson.indexOf(this.person);
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


/**
 * 策略管理
 * feiyong
 * 2016/06/20
 */
app.add.controller('stragegyListCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http','dialog','$timeout', function ($scope, $state, $sce, ngTableParams, $http, dialog, $timeout) {
	$scope.$emit('menuChange', $state.current.url);

	/*设备状态的筛选框点击事件*/
	$scope.deviceGroupShow = true;
	$scope.clickGroup = function(){
		$scope.deviceGroupShow = !$scope.deviceGroupShow;
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

	//重新初始化列表
	function tableReload() {
		$scope.tableParams.page(1);
		$scope.tableParams.reload();
	};
	//按照策略模式进行搜索
	$scope.norm = false;
	$scope.lose = false;
	$scope.style = false;
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
				//condition.deptId = $scope.selectDept.id;
				var modelArr = [];
				condition.norm = 0;
				condition.work = 0;
				condition.lose = 0;
				if($scope.norm) {
					condition.norm = 1;
				}
				if($scope.style) {
					condition.work = 2;
				}
				if($scope.lose) {
					condition.lose = 3;
				}
				condition.modelArr = modelArr;

				$http({
					url : 'strategy/ajaxList.do',
					method : 'POST',
					data : condition,
					cache:false,
					responseType :  "json"
				})
					.success(function (result) {
						var data = result.data;
						$scope.totalRecords = result.totalNum;

						var totalCount = data.totalCount;
						var dataList = data.list;
						$scope.totalCount = totalCount;

						if (dataList.length > 0) {
							$scope.prevItem = dataList[0];
							dataList[0].visited = true;
						} else {
							$scope.prevItem = {};
						}

						$scope.noResultContent="false";
						if($scope.totalRecords > 0 && totalCount == 0){
							$scope.noResultContent="true";
							$scope.faceImg = "littleTrouble";
							$scope.noContent="啊呀,没有检索到任何内容…";
							$scope.chooseList = [{"prevLink":"请更改条件后再次搜索或筛选"}]
						}

						if($scope.totalRecords == 0 && totalCount == 0){
							$scope.noResultContent="true";
							$scope.faceImg = "noData";
							$scope.noContent="终于等到你，来添加策略吧";
							$scope.chooseList = [
								{"prevLink":'通过部署策略可以批量管控设备'},
								{"content":"新建通用策略","textLink":true,"commonStr":true,"prevLink":"点击","nextLink":"来增加通用策略"},
								{"content":"新建模式策略","textLink":true,"prevLink":"点击","nextLink":"来增加模式策略"}
							]
						}

						params.total(totalCount);
						$defer.resolve(dataList);
					}).error(function (data) {
					$defer.reject();
				});
			}
		});

	$scope.addStrategy = function(check, common){
		if(check){
			if(common) {
				$scope.addCommonStrategy();
			} else {
				$scope.addModelStrategy();
			}
		}else{
			return;
		}
	}

	//点击更多操作
	$scope.showMore = false;
	$scope.clickItem = {};
	$scope.moreShow=function (item) {
		item.showMore = true;
	}
	$scope.morehide=function (item) {
		item.showMore = false;
	}
	//点击行
	$scope.prevItem = {};
	$scope.clickTr = function(item){
		$scope.prevItem && ($scope.prevItem.visited = false);
		item.visited = true;
		$scope.prevItem = item;
	};

	$scope.konwInfo = function(itemId){
		$state.go('strategy/info',{id:itemId});
	}
	//新建通用策略
	$scope.addCommonStrategy = function(){
		$state.go("strategy/add");
	}
	$scope.addModelStrategy = function(){
		$state.go("strategy/addModel");
	}
	//编辑策略
	$scope.editStrategy = function(itemId,name) {
		$state.go("strategy/edit",{id:itemId, commonName:name});
	}
	//编辑模式策略
	$scope.editModel = function(itemId, model,name) {
		//alert(itemId);
		$state.go("strategy/editModel", {id:itemId, model:model, modelName:name});
	}
	//编辑模式策略
	$scope.editModelLose = function(itemId, model, name) {
		//alert(itemId);
		$state.go("strategy/editModel", {id:itemId, model:model, modelName:name});
	}
	//变更 策略
	$scope.deviceStrategy = function(itemId, totoal, name) {
		$state.go("strategy/change", {id:itemId,totalDevice:totoal,strategyName:name});
	}
	//删除策略
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
	$scope.delStrategy = function(id){
		dialog.confirm({
			icon:'secondConfirm',
			content: '<p class="secondConfirm">确定要删除该策略吗？</p>\
		        	<p class="w300 fs14">\
		        	删除策略后，已部署的设备将会清除该策略！\
		        	</p>',
			ok: function (scope, dialog, button, config) {
				$http({
					url : '../strategy/delStrategy.do',
					data :{
						id:id
					},
					method : 'POST',
					cache:false,
					responseType :  "json"
				})
					.success(function (data) {
						if(data.result == "success") {
							dialog.close();
							alertInf.show('删除策略成功');
							alertInf.close();
							$scope.tableParams.reload();
							return;
						}else {
							dialog.close();
							alertInf.show('删除策略失败');
							alertInf.close();
							$scope.tableParams.reload();
							return;
						}

					}).error(function (data) {
					console.info(data);
				});

			},
			cancel: function (scope, dialog, button, config) {
				return true;
			}
		})
	};

}])
