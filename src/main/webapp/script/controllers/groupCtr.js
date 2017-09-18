/**
 * 设备组管理
 * feiyong
 * 2016/06/20
 */


app.add.controller('groupCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http', '$modal', '$timeout','$log', 'dialog', function ($scope, $state, $sce, ngTableParams, $http, $modal, $timeout, $log, dialog) {
    $scope.$emit('menuChange', $state.current.url);
    
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
    
    var checkboxes = {
        checked: false,
        items: {}
    };

    //复选框数据
    $scope.checkboxes = checkboxes;
    /*成功失败提示的弹框*/
	$scope.closeable = true;
	$scope.alerts = []
    /**
     * 切换复选框
     * @param group
     */
	$scope.checkedItem = 0;
    $scope.toggleCheck = function () {
        var _id = this.group.id;
        if (this.group.selected) {
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
            if (checkboxes.checked) {
                checkboxes.items[data[i].id] = data[i].id;
            }

            data[i].selected = checkboxes.checked;
        }
        $scope.checkedItem = Object.keys(checkboxes.items).length;
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

    //清空搜索条件
    $scope.cleanSearch=function () {
        $scope.searchKey = "";
        tableReload();
    }

    //刷新
    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };

    //分页表格
    $scope.tableParams = new ngTableParams(
        {
            page: 1,	// 初始化显示第几页
            count: window.innerWidth>1600?10:(window.innerWidth>1366?7:5), 	// 初始化分页大小
        },
        {
            counts: [/*5,10,20*/], //控制每页显示大小
            paginationMaxBlocks: 5, //最多显示页码按钮个数
            paginationMinBlocks: 2,//最少显示页码按钮个数
            getData: function ($defer, params) {
            	 var page = params.page();
                 var size = params.count();
                 
                 var search = {
                     start : ( page - 1 ) * size,
                     length : size,
                     draw : 1
                 };
                 
                 search.search = $scope.searchKey;

                $http({
                    method : 'POST',
                    url : '../baseinfo/group/ajaxList.do',
                    data : search,
                    responseType :  "json"
                }).success(function (result) {
                	var data = result.data;
                	var totalCount = data.totalCount;
                	$scope.totalRecords = result.groupTotalNum;
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
                    	$scope.noContent="终于等到你，来添加设备组吧";
                    	$scope.chooseList = [
                    	                     {"prevLink":'你可以对人员设备自定义分组，便于管理查看'},
                    	                     {"content":"添加设备组","textLink":true,"prevLink":"点击","nextLink":"来增加设备组"}
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
    
    $scope.addGroup = function(check){
    	if(check){
    		$scope.openGroupModalDialog();
    	}else{
    		return;
    	}
    }
    
    //点击行
    $scope.clickTr = function(item){
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    };
    
    //删除单个设备组
    $scope.deleteOneDeviceGroup = function(group){
    	var _scope = $scope;
    	var ids = group.id;
    	dialog.openDialog({
			title:"删除设备组",
			icon:'secondConfirm',
			contentClass:"w350",
			content:'<p class="secondConfirm">确定要删除该设备组吗？</p>\
		        		<p class="w300 fs14">\
		        			删除设备组将清除组内所有设备上运行的策略\
		        		</p>',
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
		    			$http({
		                    method : 'POST',
		                    url : '../baseinfo/group/deleteGroup.do',
		                    params : {ids:ids},
		                    responseType :  "json"
		                }).success(function (result) {
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
		                });
		    		}
		    	}
		    ]
		})
    }
    
    //删除设备组
  	$scope.deleteDeviceGroup = function(){
  		var _scope = $scope;
  		var items = Object.keys(checkboxes.items);
  		if (items.length > 0) {
	  		dialog.openDialog({
				title:"删除设备组",
				icon:'secondConfirm',
				contentClass:"w350",
				content:'<p class="secondConfirm">确定要删除该设备组吗？</p>\
			        		<p class="w300 fs14">\
			        			删除设备组将清除组内所有设备上运行的策略\
			        		</p>',
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
			                    url : '../baseinfo/group/deleteGroup.do',
			                    params : {ids:ids},
			                    responseType :  "json"
			                }).success(function (result) {
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
			                });
			    		}
			    	}
			    ]
			})
  		} else {
  			_scope.alerts = [{
					type:'warning',
					msg:"请先选择设备组!"
			    }];
			$timeout(function(){
				_scope.alerts = [];
    		}, 2000);
    		
  			return;
  		}
  	}
    
  	//进入添加页面和控制器
    $scope.openGroupModalDialog=function(){

    	$state.go("baseinfo/group/add");
    }
    
    //进入编辑页面和控制器
    $scope.openEditGroupModalDialog=function(editorData){
    	editorData = editorData || {};
    	$state.go("baseinfo/group/edit", { id : editorData.id});
    }
    
}]);




app.add.controller('groupEditCtr', ['$scope', '$state', '$sce', '$timeout', 'ngTableParams', '$http', 'dialog', 'ivhTreeviewMgr', function ($scope, $state, $sce, $timeout, ngTableParams, $http, dialog, ivhTreeviewMgr) {
    $scope.$emit('menuChange', '/baseinfo/group/index');

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
						$state.go("baseinfo/group/index");
					}
				}
			]
		})
    }

    $scope.blurCheck = function(ctr) {
        if(!ctr || (typeof ctr.$dirty == 'undefined')){
            return ;
        }
        ctr.$dirty = true;
    };

    $scope.checkName = function () {
        $scope.errorShow = true;
        var checkGroupName = {
            id: $state.params.id,
            groupName: $scope.addFrm.name.$viewValue
        }

        if (typeof(checkGroupName.groupName) != undefined) {
            $http({
                url: './../baseinfo/group/checkGroupName.do',
                data: {
                    id: checkGroupName.id,
                    groupName: checkGroupName.groupName
                },
                method: 'POST',
                cache: false,
                responseType: "json"
            })
                .success(function (data) {
                    if (data.result == false ) {
                        $scope.checkGroupName = true;
                    } else {
                        $scope.checkGroupName = false;
                    }
                }).error(function (data) {
                console.info(data);
            });
        }
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
    $scope.imeiList = [];

    // 根据id号获取设备组详细信息
    $http({
        url : './../group/queryGroup.do',
        method : 'POST',
        data : {
            id : $state.params.id
        },
        cache:false,
        responseType :  "json"
    }).success(function (result) {
        var deviceGroup = result.deviceGroup;
        $scope.name = deviceGroup.name;
        $scope.note = deviceGroup.note;

    }).error(function (data) {
        console.info(data);
    });

    // 根据id号获取设备组中设备信息
    $http({
        url : './../group/queryDevice.do',
        method : 'POST',
        data : {
            id : $state.params.id
        },
        cache:false,
        responseType :  "json"
    }).success(function (result) {
        var data = result.data;
        for (var i = 0; i < data.dataList.length; i++) {
            $scope.selectPerson.push(data.dataList[i]);
            $scope.imeiList.push(data.dataList[i]['imei']);
        }
    }).error(function (data) {
        console.info(data);
    });

	$http({
        url : 'baseinfo/department/rootDeptInfo.do',
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
    .success(function (data) {
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

    //回车键搜索
    $scope.myKeyup = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchPerson();
    	}
    }

    //搜索人员
    $scope.searchPerson = function(){
        $scope.dataList = [];
        $scope.currentPage = 1;
        queryPerson();
    }

    queryPerson();

    //点击树选择框时
    $scope.selectDept = {};
    $scope.deptId = null;
    $scope.selectCallback =  function (ivhNode, ivhIsSelected, ivhTree) {
        $scope.selectDept = ivhNode;
        $scope.deptId = ivhNode.id;
        queryPerson();
    };

    function queryPerson() {
	    var promise = $http.post('./../baseinfo/group/queryPerson.do',
	    	{
	    		personName:$scope.personName,
	            deptId:$scope.deptId,
                groupId:$state.params.id
	        },
	        {
	            responseType: 'json',
	            cache: false
	        });
	    promise.success(function (result) {
	        var data = result.data;
	        $scope.dataList = data.dataList;
	        $scope.totalPage = data.totalPage;
	        for (var i = 0 ; i < $scope.dataList.length; i ++ ) {
                $scope.dataList[i].selected = false;
                for(var j = 0 ; j < $scope.selectPerson.length; j++) {
                    if($scope.dataList[i].imei == $scope.selectPerson[j].imei) {
                        $scope.dataList[i].selected = true;
                    }
                }
            }

	    }).error(function(data, status, headers, config){
	        alert('发生错误' + status);
	    });
    }
    $scope.currentPage = 1;

    /**
     * 下拉人员滚动动态获取人员
     * @returns {boolean}
     */
    $scope.groupPersonsMore = function() {
        $scope.currentPage++;
        if($scope.totalPage >= $scope.currentPage) {
        	checkboxes.checked = false;
	        if ($scope.busy) {
	            return false;
	        }
	        $scope.busy = true;

	        $http.post('./../baseinfo/group/getMorePersons.do',
	            {
	        		personName:$scope.personName,
	                currentPage:$scope.currentPage,
                    groupId:$state.params.id
	            },
	            {
	                responseType: 'json',
	                cache: false
	            }).success(function(result) {
	                $scope.busy = false;
	                var data = result.data;
                    for (var i = 0; i < data.dataList.length; i++) {
                        for (var j = 0; j < $scope.selectPerson.length; j++) {
                            if(data.dataList[i].imei == $scope.selectPerson[j].imei) {
                                data.dataList[i].selected = true;
                            }
                        }
                        $scope.dataList.push(data.dataList[i]);
                    }
	        });
        }
    };

    /**
     * 切换复选框
     * @param user
     */
    $scope.toggleCheckPerson = function () {
    	var _id = this.person.imei;
        if (this.person.selected) {
            checkboxes.items[_id] = _id;
            $scope.selectPerson.push(this.person);
            if (Object.keys(checkboxes.items).length == $scope.dataList.length) {
                checkboxes.checked = true;
            }
        } else {
            delete checkboxes.items[_id];
            for (var i=0;i<$scope.selectPerson.length;i++) {
            	if ($scope.selectPerson[i].imei == _id) {
            		index = i;
            	}
            }
            $scope.selectPerson.splice(index,1);
            checkboxes.checked = false;
        }
    };

    //选择全部
    $scope.checkAll = function () {
    	$scope.selectPerson.splice(0,$scope.selectPerson.length); //先清空已选择
        var data = $scope.dataList;

        for (var i = 0; i < $scope.dataList.length; i++) {
            if (checkboxes.checked) {
                checkboxes.items[$scope.dataList[i].id] = $scope.dataList[i].id;
                $scope.selectPerson.push($scope.dataList[i]);
            } else {
            	$scope.selectPerson.splice($scope.dataList,1);
            }

            $scope.dataList[i].selected = checkboxes.checked;
        }

    };

    //点击x时移除
    $scope.deletePerson = function () {
    	for (var i=0;i<$scope.selectPerson.length;i++) {
        	if ($scope.selectPerson[i].imei == this.person.imei) {
        		index = i;
        	}
        }
    	for (var j=0;j<$scope.dataList.length;j++) {
    		if($scope.selectPerson[index].imei == $scope.dataList[j].imei) {
    			$scope.dataList[j].selected = false;
    		}
    	}
        $scope.selectPerson.splice(index,1);
        checkboxes.checked = false;
    }

    //点击清除时
    $scope.deleteAllPerson = function () {
        for (var i = 0; i < $scope.dataList.length; i++) {
            $scope.dataList[i].selected = false;
        }
        $scope.selectPerson.splice(0,$scope.selectPerson.length);
        checkboxes.checked = false;
    }

    //保存
    $scope.saveGroup = function () {
    	var imeis = [];
    	for(var i= 0; i< $scope.selectPerson.length; i++) {
    		imeis.push($scope.selectPerson[i].imei);
    	}
    	var input = {
    			id : $state.params.id,
    			ids : imeis,
    			oldImeis : $scope.imeiList,
                note : $scope.addFrm.note.$viewValue,
                name: $scope.addFrm.name.$viewValue
        };
    	$scope.addFrm.name.$dirty = true;
    	if ($scope.addFrm.name.$invalid) {
            return false;
        }
    	if($scope.checkGroupName) {
    		return false;
    	}

        $http.post('./../baseinfo/group/editPerson.do', input,
        {
            responseType: 'json',
            cache: false
        }).success(function (result) {
            if (result.result && result.result == "success") {
                dialog.openDialog({
                    title:"编辑设备组",
                    icon:'success',
                    close:{
                        callback:function($scope, dialog, button, config){
                            $state.go("baseinfo/group/index");

                            alertInf.show.call($scope, result.result);
                        }
                    },
                    content:'<p class="successTip">恭喜您，Administrator!</p>\
                                <p class="w300 fs14">\
                                    编辑设备组成功\
                                </p>',
                    buttons:[{
                        name:"知道了",
                        className:"btn-green",
                        callback:function($scope, dialog, button, config){
                            $state.go("baseinfo/group/index");

                            alertInf.show.call($scope, result.result);
                        }
                    }]
                })

            }
        });
    }

}]);

app.add.controller('groupAddCtr', ['$scope', '$state', '$sce', '$timeout', 'ngTableParams', '$http', 'dialog', 'ivhTreeviewMgr', function ($scope, $state, $sce, $timeout, ngTableParams, $http, dialog, ivhTreeviewMgr) {
    $scope.$emit('menuChange', '/baseinfo/group/index');

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
						$state.go("baseinfo/group/index");
					}
				}
			]
		})
    }

    $scope.blurCheck = function(ctr) {
        if(!ctr || (typeof ctr.$dirty == 'undefined')){
            return ;
        }
        ctr.$dirty = true;
    };

    $scope.checkName = function () {
        $scope.errorShow = true;
        var checkGroupName = {
            id: $state.params.id,
            groupName: $scope.addFrm.name.$viewValue
        }

        if (typeof(checkGroupName.groupName) != undefined) {
            $http({
                url: './../baseinfo/group/checkGroupName.do',
                data: {
                    id: checkGroupName.id,
                    groupName: checkGroupName.groupName
                },
                method: 'POST',
                cache: false,
                responseType: "json"
            })
                .success(function (data) {
                    if (data.result == false ) {
                        $scope.checkGroupName = true;
                    } else {
                        $scope.checkGroupName = false;
                    }
                }).error(function (data) {
                console.info(data);
            });
        }
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

    var checkboxes = {
        checked: false,
        items: {}
    };


    //复选框数据
    $scope.checkboxes = checkboxes;
    $scope.selectPerson = [];
    /*成功失败提示的弹框*/
	$scope.closeable = true;
	$scope.alerts = []

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

    //回车键搜索
    $scope.myKeyup = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchPerson();
    	}
    }

    //搜索人员
    $scope.searchPerson = function(){
        $scope.dataList = [];
        $scope.currentPage = 1;
        queryPerson();
    }

    queryPerson();

    //点击树选择框时
    $scope.selectDept = {};
    $scope.deptId = null;
    $scope.selectCallback =  function (ivhNode, ivhIsSelected, ivhTree) {
        $scope.selectDept = ivhNode;
        $scope.deptId = ivhNode.id;
        queryPerson();
    };

   function queryPerson() {
	    var promise = $http.post('./../baseinfo/group/queryPerson.do',
	    	{
	    		personName:$scope.personName,
	            deptId:$scope.deptId
	        },
	        {
	            responseType: 'json',
	            cache: false
	        });
	    promise.success(function (result) {
	        var data = result.data;
	        $scope.dataList = data.dataList;
            for (var i = 0; i< $scope.dataList.length; i++) {
                for (var j = 0; j < $scope.selectPerson.length; j++) {
                    if($scope.dataList[i].imei == $scope.selectPerson[j].imei) {
                        $scope.dataList[i].selected = true;
                    }
                }
            }
	        $scope.totalPage = data.totalPage;
	    }).error(function(data, status, headers, config){
	        alert('发生错误' + status);
	    });
    }
    $scope.currentPage = 1;

    /**
     * 下拉人员滚动动态获取人员
     * @returns {boolean}
     */
    $scope.groupPersonsMore = function() {
        $scope.currentPage++;
        if($scope.totalPage >= $scope.currentPage) {
        	checkboxes.checked = false;
        	if ($scope.busy) {
                return false;
            }
            $scope.busy = true;

            $http.post('./../baseinfo/group/getMorePersons.do',
                {
            		personName:$scope.personName,
                    currentPage:$scope.currentPage,
                    deptId:$scope.deptId
                },
                {
                    responseType: 'json',
                    cache: false
                }).success(function(result) {
                    $scope.busy = false;
                    var data = result.data;
                    if (data.dataList.length > 0) {
                        for (var i = 0; i < data.dataList.length; i++) {
                            for (var j = 0; j < $scope.selectPerson.length; j++) {
                                if(data.dataList[i].imei == $scope.selectPerson[j].imei) {
                                    data.dataList[i].selected = true;
                                }
                            }
                            $scope.dataList.push(data.dataList[i]);
                        }
                    }
            });
        }
    };

        /**
         * 切换复选框
         * @param user
         */
        $scope.toggleCheckPerson = function () {
            var _id = this.person.imei;
            if (this.person.selected) {
                checkboxes.items[_id] = _id;
                $scope.selectPerson.push(this.person);
                if (Object.keys(checkboxes.items).length == $scope.dataList.length) {
                    checkboxes.checked = true;
                }
            } else {
                delete checkboxes.items[_id];
                for (var i=0;i<$scope.selectPerson.length;i++) {
                    if ($scope.selectPerson[i].imei == this.person.imei) {
                        $scope.selectPerson.splice(i,1);
                        checkboxes.checked = false;
                    }
                }
            }
        };

        //选择全部
        $scope.checkAll = function () {
        	$scope.selectPerson.splice(0,$scope.selectPerson.length); //先清空已选择
            var data = $scope.dataList;

            for (var i = 0; i < $scope.dataList.length; i++) {
                if (checkboxes.checked) {
                    checkboxes.items[$scope.dataList[i].id] = $scope.dataList[i].id;
                    $scope.selectPerson.push($scope.dataList[i]);
                } else {
                	$scope.selectPerson.splice($scope.dataList,1);
                }

                $scope.dataList[i].selected = checkboxes.checked;
            }

        };

        //点击x时移除
        $scope.deletePerson = function () {
            for (var i=0;i<$scope.selectPerson.length;i++) {
                if ($scope.selectPerson[i].imei == this.person.imei) {
                    index = i;
                }
            }
            for (var j=0;j<$scope.dataList.length;j++) {
                if($scope.selectPerson[index].imei == $scope.dataList[j].imei) {
                    $scope.dataList[j].selected = false;
                }
            }
            var index1 = $scope.dataList.indexOf($scope.selectPerson[index]);
            $scope.selectPerson.splice(index,1);
            checkboxes.checked = false;
        }

        //点击清除时
        $scope.deleteAllPerson = function () {
        	for (var i = 0; i < $scope.dataList.length; i++) {
        		$scope.dataList[i].selected = false;
            }
        	checkboxes.checked = false;
        	$scope.selectPerson.splice(0,$scope.selectPerson.length);
        }

        //保存
        $scope.saveGroup = function () {
        	var imeis = [];
        	for(var i= 0; i< $scope.selectPerson.length; i++) {
        		imeis.push($scope.selectPerson[i].imei);
        	}
        	var input = {
        			ids : imeis,
                    note : $scope.addFrm.note.$viewValue,
                    name: $scope.addFrm.name.$viewValue
            };
            $scope.errorShow = true;
        	$scope.addFrm.name.$dirty = true;
        	if ($scope.addFrm.name.$invalid) {
                return false;
            }
        	if($scope.checkGroupName) {
        		return false;
        	}

            $http.post('./../baseinfo/group/addPerson.do', input,
            {
                responseType: 'json',
                cache: false
            }).success(function (result) {
                if (result.result && result.result == "success") {
                    var dia = dialog.openDialog({
                        title:"添加设备组",
                        icon:'success',
                        close:{
                            callback:function($scope, dialog, button, config){
                                $state.go("baseinfo/group/index");

                                alertInf.show.call($scope, result.result);
                            }
                        },
                        content:'<p class="successTip">恭喜您，Administrator!</p>\
                                    <p class="w300 fs14">\
                                        添加设备组成功\
                                    </p>',
                        buttons:[{
                            name:"知道了",
                            className:"btn-green",
                            callback:function($scope, dialog, button, config){
                                $state.go("baseinfo/group/index");

                                alertInf.show.call($scope, result.result);
                            }
                        }]
                    })
                }


            });

        }
}]);