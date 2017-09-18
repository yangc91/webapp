/**
 * 白名单管理
 * LIBO
 * 2016/07/08
 */
app.add.controller('whiteListCtr', ['$scope', '$state', 'ngTableParams', '$http', '$modal', '$timeout','$log','dialog',function ($scope, $state, ngTableParams, $http, $modal, $timeout, $log, dialog) {
    $scope.$emit('menuChange', $state.current.url);
    
    var checkboxes = {
        checked: false,
        items: {}
    };

    //复选框数据
    $scope.checkboxes = checkboxes;
    /*成功失败提示的弹框*/
	$scope.closeable = true;
	$scope.alerts = [];
	
    //切换复选框
	$scope.checkedItem = 0;
    $scope.toggleCheck = function () {
        var _id = this.person.id;
        if (this.person.selected) {
            checkboxes.items[_id] = _id;

            if (Object.keys(checkboxes.items).length == $scope.tableParams.data.length) {
                checkboxes.checked = true;
            }
        } else {
            delete checkboxes.items[_id];
            checkboxes.checked = false;
        }
        $scope.checkedItem = Object.keys(checkboxes.items).length;
    };
    
    //选择全部
    $scope.checkAll = function () {
        checkboxes.items = {}; //先清空已选择
        var data = $scope.tableParams.data;

        for (var i = 0; i < data.length; i++) {
        	//checkboxes.checked为true代表全选按钮被选中
        	//checkboxes.checked为false代表全选按钮没选中
            if (checkboxes.checked) {//全选选中
                checkboxes.items[data[i].id] = data[i].id;
            }

            data[i].selected = checkboxes.checked;
        }
        $scope.checkedItem = Object.keys(checkboxes.items).length;
    };
    
    //点击行
    var prevItem;
    $scope.clickTr = function(item){
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    };
    
    //回车键搜索
    $scope.myKeyup = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.clickSearch();
    	}
    }
    
    //搜索
    $scope.clickSearch = function () {
    	tableReload();
    };
    
    $scope.cleanSearch = function () {
    	$scope.searchKey = "";
    	tableReload();
    };
    
    //刷新
    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };
    
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
             
             condition.searchKey = $scope.searchKey;

            $http({
                method : 'POST',
                url : '../system/whitelist/ajaxList.do',
                data : condition,
                responseType :  "json"
            }).success(function (result) {
            	var data = result.data;
            	var totalCount = data.totalCount;
            	$scope.totalRecords = result.personTotalNum;
                $scope.resultRecords = totalCount;
                
                var dataList = data.dataList;                
                if (dataList.length > 0) {
                    $scope.prevItem = dataList[0];
                    dataList[0].visited = true;
                } else {
                    $scope.prevItem = {};
                }
                
                $scope.noResultContent="false";
                if($scope.totalRecords > 0 && $scope.resultRecords == 0){
                	$scope.noResultContent="true";
                	$scope.faceImg = "littleTrouble";
                	$scope.noContent="啊呀,没有检索到任何内容…";
                	$scope.chooseList = [{"prevLink":"请更改条件后再次搜索或筛选"}]
                }
                
                if($scope.totalRecords == 0 && $scope.resultRecords == 0){
                	$scope.noResultContent="true";
                	$scope.faceImg = "noData";
                	$scope.noContent="终于等到你，来添加白名单设备吧";
                	$scope.chooseList = [
                	                     {"prevLink":'白名单中的设备将不受任何管控'},
                	                     {"content":"添加设备","textLink":true,"prevLink":"点击","nextLink":"来增加白名单设备"}
            	                     ]
                }
                
                params.total(totalCount);
                $defer.resolve(dataList);
            }).error(function (data) {
                console.info(error);
                $defer.reject();
            });
        }
     });
    
    $scope.addWhiteDevice = function(check){
    	if(check){
    		$scope.addWhiteList();
    	}else{
    		return;
    	}
    }
    
    //添加设备
    $scope.addWhiteList = function() {
    	$state.go('system/whitelist/toAdd');
    }

    //移除人员
    $scope.deleteWhite = function(){
    	var _scope = $scope;
  		var items = Object.keys(checkboxes.items);
  		if (items.length < 1) {
  			_scope.alerts = [{
	  				type:'warning',
					msg:"请选择人员!"
			    }];
			$timeout(function(){
				_scope.alerts = [];
			}, 2000);
    		
  			return;
  		}
  		//alert(items);
  		dialog.openDialog({
			title:"移除白名单人员",
			icon:'secondConfirm',
			contentClass:"w350",
			content:'<p class="secondConfirm">确定移除选中的人员吗？</p>',
		    buttons:[
		    	{
			    	name:"取消",
			    	className:"btn-gray",
			    	callback:function($scope, dia, button, config){
	
			    	}
		    	},
		    	{
		    		name:"删除",
		    		className:"btn-red",
		    		callback:function($scope, dia, button, config){
		    			var ids = items;
		    			$http({
		                    method : 'POST',
		                    url : '../system/whitelist/removePerson.do',
		                    params : {ids:ids},
		                    responseType :  "json"
		                }).success(function (result) {
		                	if(result.success){
		                		_scope.alerts.push(
		                				{
		                					type:'success',
		                					msg:"恭喜,删除成功!"
		                				}
		                		);
		                		
		                		$timeout(function(){
		                			_scope.alerts.splice(0, 1);
		                		}, 2000);
		                		
		                		tableReload();
		                		checkboxes.checked = false;
		                		checkboxes.items = {}; //清空已选择
		                	}
		                });
		    		}
		    	}
		    ]
		})
    }
    
    //删除单个人员
    $scope.deleteDevice = function(person) {
    	var _scope = $scope;
  		dialog.openDialog({
			title:"移除白名单人员",
			icon:'secondConfirm',
			contentClass:"w350",
			content:'<p class="successTip">确定移除选中的人员吗？</p>',
		    buttons:[
		    	{
			    	name:"取消",
			    	className:"btn-gray",
			    	callback:function($scope, dia, button, config){
	
			    	}
		    	},
		    	{
		    		name:"删除",
		    		className:"btn-red",
		    		callback:function($scope, dia, button, config){
		    			var ids = person.id;
		    			$http({
		                    method : 'POST',
		                    url : '../system/whitelist/removePerson.do',
		                    params : {ids:ids},
		                    responseType :  "json"
		                }).success(function (result) {
		                	if(result.success){
		                		_scope.alerts.push(
		                				{
		                					type:'success',
		                					msg:"恭喜,删除成功!"
		                				}
		                		);
		                		
		                		$timeout(function(){
		                			_scope.alerts.splice(0, 1);
		                		}, 2000);
		                		
		                		tableReload();
		                		checkboxes.checked = false;
		                		checkboxes.items = {}; //清空已选择
		                	}
		                });
		    		}
		    	}
		    ]
		})    	
    }
    
    
}]);

//=======================================================
app.add.controller('addWhiteListCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http', 'dialog', '$timeout', function ($scope, $state, $sce, ngTableParams, $http, dialog, $timeout) {
    $scope.$emit('menuChange', '/system/whitelist/list');
    
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
    
    $scope.goBack = function () {
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
						$state.go('system/whitelist/list');
					}
				}
			]
		})
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
    
    //加载列表数据
    function tableReload() {
        $http.post('../system/whitelist/queryPerson.do', {deptId:$scope.deptId},
                {
                    responseType: 'json',
                    cache: false
                }).success(function (result) {
                $scope.personList = result.personList;
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
    
    //人员搜索对象
//    $scope.p ={};
//   $scope.selectedMap = new map();
    
    //加载列表数据
    tableReload();
    
    //下拉人员滚动动态获取人员
    $scope.currentPage = 1;
    $scope.loadMore = function() {
    	if ($scope.personList.length > 0) {
    		$scope.currentPage++;
    	}
        if ($scope.busy) {
            return false;
        }
        $scope.busy = true;
        
        $http.post('../system/whitelist/getMorePersons.do',
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
                if (data.personList.length > 0) {
                	
                	//alert($scope.selectPerson.length);
                    for(var i=0; i<data.personList.length; i++) {
                    	
                        //如果底部有选中的，则对应的列表复选框也要选中
                        if ( $scope.selectPerson.length > 0 ) {
                        	for (var ii=0; ii<$scope.selectPerson.length; ii++ ) {
                        		if($scope.selectPerson[ii].id == data.personList[i].id) {
                        			data.personList[i].selected = true;
                        		}
                        	}
                        }
                        
                    	$scope.personList.push(data.personList[i]);                        
                    }
                    
                    //全选未选中
                    checkboxes.checked = false;
                                        
                }
        });
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
            
//			  存在bug
//            var index = $scope.selectPerson.indexOf(this.person);
//            if(index>-1) {
//            	//如果找不到，则index为-1
//            	//index=-1,splice会删除数组最后一个元素
//            	$scope.selectPerson.splice(index,1);
//            }
            
            for(var i=0; i<$scope.selectPerson.length; i++) {
            	if($scope.selectPerson[i].id == this.person.id){
                	$scope.selectPerson.splice(i,1);
            	}
            }
            
        }
    };
    
    //选择全部
    $scope.checkAll = function () {
        checkboxes.items = {}; //先清空已选择
        $scope.selectPerson = []; //先清空已选人员
        
        var data = $scope.personList;
        for (var i = 0; i < data.length; i++) {
            if (checkboxes.checked) {//全选
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
        		if( $scope.selectPerson[i].id !== tempArr[tempArr.length-1].id ) {
        			tempArr.push($scope.selectPerson[i]);
        		}
        	}
        	$scope.selectPerson = tempArr;
        }
        
    };
    
    //点击x时移除
    $scope.deletePerson = function () {
    	var index = $scope.selectPerson.indexOf(this.person);
        $scope.selectPerson.splice(index,1);
        
        //存在bug
		//this.person.selected = false;

        for(var i=0; $scope.personList.length; i++) {
        	if($scope.personList[i].id == this.person.id) {
        		$scope.personList[i].selected = false;
        	}
        }
    	
    	var _id = this.person.id;
    	delete checkboxes.items[_id];
    	checkboxes.checked = false;
    }
    
    //点击清除
    $scope.deleteAllPerson = function () {
    	
    	for (var i = 0; i < $scope.selectPerson.length; i++) {
            for(var ii=0; ii<$scope.personList.length; ii++) {
            	if($scope.personList[ii].id == $scope.selectPerson[i].id) {
            		$scope.personList[ii].selected = false;
            	}
            }
        }
    	
    	$scope.selectPerson.splice(0, $scope.selectPerson.length);
    	
    	checkboxes.items = {}; //清空已选择
    	checkboxes.checked = false;
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
    
    //添加人员
    $scope.addPerson = function() {
    	var _scope = $scope;
    	var _state = $state;
  		var items = Object.keys(checkboxes.items);
  		if (items.length < 1) {
	  		alertInf.show('warning', '请您选择人员！');
	  		alertInf.close(5000);
  			
	  		return;
  		}
  		//alert(items);
  		
  		dialog.openDialog({
			title:"添加白名单人员",
			icon:'secondConfirm',
			contentClass:"w350",
			content:'<p class="secondConfirm">确定添加选中的人员吗？</p>',
		    buttons:[
		    	{
			    	name:"取消",
			    	className:"btn-gray",
			    	callback:function($scope, dia, button, config){
	
			    	}
		    	},
		    	{
		    		name:"添加",
		    		className:"btn-green",
		    		callback:function($scope, dia, button, config){
		    			var ids = items;
		    			$http({
		    	            method : 'POST',
		    	            url : '../system/whitelist/addPerson.do',
		    	            params : {ids:ids},
		    	            responseType :  "json"
		    	        }).success(function (result) {
		    	        	if(result.success) {
		    	        		_state.go('system/whitelist/list');
		    	        	}
		    	        });
		    		}
		    	}
		    ]
		})
  		
    };
    
    
}]);
