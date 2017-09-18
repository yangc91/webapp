/**
 * 查看策略部署详情
 * 
 * 2016/07/22
 */
app.add.controller('changeDeviceCtr', ['$scope', '$state', '$sce',  '$http', 'strategySelect','ngTableParams', function ($scope, $state, $sce,  $http, strategySelect, ngTableParams) {
    $scope.$emit('menuChange', '/strategy/index');
    $scope.totalDevice = $state.params.totalDevice;
    $scope.strategyName = $state.params.strategyName;
   // alert($scope.totalDevice);
    $scope.goBack = function(){
    	$state.go('strategy/index');
    }
    
     $scope.mapList=[
    	{
    		device:'all',deviceTitle:'部署到所有设备',content:'此策略将会部署到除白名单设备以外的所有警员设备',pic:'allUser'
    	},
    	
    	{
    		device:'self',deviceTitle:'自定义',content:'你可以将此条策略根据需要部署到设备或设备组。',pic:'customUser'
    	}
    ]
     
    $scope.mapWapFn = function(mapWayDevice){
    	//alert(mapWayDevice);
    	$scope.device = mapWayDevice;
    	$scope.nextshow = true;
    }
    //alert($state.params.id+"------"+$state.params.strategyName);
    selectDeviceGroup();
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
    		//selectDeviceGroup();
    		$scope.groupShow = true;
    		$scope.groupShow2 = false;
    	}else {
    		$scope.groupShow = false;
    		$scope.groupShow2 = true;
    	}
    }
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
			    	$scope.groupListTotal = data.groupList;
			    	for(var i=0; i<data.groupList.length; i++) {
			    		if(data.groupList[i].checked) {
			    			hasPublishedGroup.push(data.groupList[i].id);
			    			groupList.push(data.groupList[i].id);
							$scope.groupListTotal[i].selected=true;
			    		}
			    	}
			    	$scope.groupSize = data.size;
			    }).error(function (data) {
			        console.info(data);
		    });
    }
    /**
     * 
     * @param {Object} groupId
     */
    var hasPublishedGroup = [];
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
    //$scope.selectGroupSize = hasPublishedGroup.length + groupList.length;
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
    tableReload();
    function tableReload() {
        $http.post('../strategy/queryDevice.do', {deptId:$scope.deptId, strategyId:$state.params.id},
                {
                    responseType: 'json',
                    cache: false
                }).success(function (result) {
                	//debugger
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
            }).error(function(data, status, headers, config){
                alert('发生错误' + status);
            });
    }
    //已经存在策略的设备imei
    var hasPublished = [];
    $http({
        url : '../strategy/queryHasStr.do',
        data :{
        	strategyId:$state.params.id
        },
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
    .success(function (data) {
    	$scope.selectPerson = data.hasPublishedDevice;
    	for(var i=0; i<$scope.selectPerson.length; i++) {
    		hasPublished.push($scope.selectPerson[i].imei);
    	}
    }).error(function (data) {
        console.info(data);
    });
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
	                deptId:$scope.deptId,
	                strategyId:$state.params.id
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
        var _imei = this.person.imei;
        if (this.person.selected) {//选中
            checkboxes.items[_imei] = _imei;
            $scope.selectPerson.push(this.person);
            if (Object.keys(checkboxes.items).length == $scope.personList.length) {
                checkboxes.checked = true;
            }
        } else {//未选中
            delete checkboxes.items[_imei];
            checkboxes.checked = false;

			for(var i=0;i<$scope.selectPerson.length;i++) {
				if(this.person.imei == $scope.selectPerson[i].imei) {
					$scope.selectPerson.splice(i,1);
				}
			}
           /* if(index>-1) {
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
    	/*console.log($scope.selectPerson);*/
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
    	/*console.log($scope.selectPerson);*/
    	/*var _imei = this.person.imei;
    	delete checkboxes.items[_imei];
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
    
    //发布设备
    $scope.finish = function() {
    	var imeis = [];
    	var delImeis = [];
    	for(var i=0; i<$scope.selectPerson.length; i++) {
    		imeis.push($scope.selectPerson[i].imei);
		}
    
    	if($scope.device == 'self') {
    		if($scope.groupShow) {
    			if(groupList.length>0||hasPublishedGroup.length>0) {
    				$http({
				        url : '../group/changeDeviceGroup.do',
				        data: {
				        	hasPublishedGroup: hasPublishedGroup,
				        	groupList: groupList,
				        	strategyId: $state.params.id
				        },
				        method : 'POST',
				        cache:false,
				        responseType :  "json"
				    })
				    .success(function (data) {
				    	$state.go('strategy/index');
				    }).error(function (data) {
				        console.info(data);
				    });
    			}else {
    				$state.go('strategy/index');
    			}
    			
    		}else {
    			if(imeis.length>0||hasPublished.length>0) {
    				$http({
				        url : '../strategy/changeDevice.do',
				        data: {
				        	imeis: imeis,
				        	hasPublished: hasPublished,
				        	strategyId: $state.params.id
				        },
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
    		
    	}else if($scope.device == 'all') {
    		$http({
					url : '../strategy/publishAll.do',
					data: {strategyId : $state.params.id},
					method : 'POST',
					cache:false,
					responseType :  "json"
				})
				.success(function (data) {
					$state.go('strategy/index');
				}).error(function (data) {
					console.info(data);
				});
    	}
    	
    }
    
}])