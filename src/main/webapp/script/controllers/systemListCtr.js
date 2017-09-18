/**
 * 系统设置,管理员列表
 * Created by mdc on 2016/6/12.
 */
app.add.controller('systemListCtr', ['$scope', '$state', 'ngTableParams', '$http', '$modal', '$timeout','$log','dialog',function ($scope, $state, ngTableParams, $http, $modal, $timeout, $log, dialog) {
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
	$scope.alerts = [];
    /**
     * 切换复选框
     * @param user
     */
	$scope.checkedItem = 0;
    $scope.toggleCheck = function () {
        var _id = this.user.id;
        if (this.user.selected) {
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
    
    //点击行
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
    
    
    $http({
        url : 'system/user/getAllRole.do',
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
    .success(function (data) {
        $scope.roleList = data;
    }).error(function (data) {
        console.info('error');
    });

    var roleSelectList = [];

    $scope.roleSelect = function() {
        var _id = this.role.id;

        if (this.role.selected) {
            roleSelectList.push(_id);
        } else {
            var index = roleSelectList.indexOf(_id);
            roleSelectList.splice(index, 1);
        }
        tableReload();
    };
    
	//分页表格
    $scope.tableParams = new ngTableParams(
        {
            page: 1,	// 初始化显示第几页
            count: window.innerWidth>1600?10:(window.innerWidth>1366?7:5)	// 初始化分页大小
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
                 
                 condition.search = $scope.searchKey;
                 condition.roleArray = roleSelectList;

                $http({
                    method : 'POST',
                    url : 'system/user/list.do',
                    data : condition,
                    responseType :  "json"
                }).success(function (result) {
                	var data = result.data;
                	var totalCount = data.totalCount;
                	$scope.totalRecords = result.userTotalNum;
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
                    	$scope.noContent="终于等到你，来添加管理员吧";
                    	$scope.chooseList = [
                    	                     {"prevLink":'可以为不同的管理员分配专属账号'},
                    	                     {"content":"添加管理员","textLink":true,"prevLink":"点击","nextLink":"来增加管理员"}
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
    
    $scope.addUser = function(check){
    	if(check){
    		$scope.openUserDialog();
    	}else{
    		return;
    	}
    }
  	//确认重置密码提示
  	$scope.confirmPwd = function (user) {
		var _scope = $scope;
  		var id = user.id;
	    dialog.openDialog({
			title:"重置密码",
			icon:'secondConfirm',
			content:'<p class="confirmTip">确定要重置该管理员的密码吗？</p>\
		        		<p class="w300 fs14">\
		        			重置后的密码是111111\
		        		</p>\
		        		<p class="w300 fs14 mt10">\
		        			别忘了提示他及时登录并修改密码哦~\
		        		</p>',
		    buttons:[
		    	{
			    	name:"取消",
			    	className:"btn-gray",
			    	callback:function($scope, dia, button, config){
	
			    	}
		    	},
		    	{
		    		name:"重置",
		    		className:"btn-red",
		    		callback:function($scope, dia, button, config){
		    			$http({
		                    method : 'POST',
		                    url : 'system/user/resetPwd.do',
		                    params : {userId:id},
		                    responseType :  "json"
		                }).success(function (result) {
		                	if (result.result && result.result == "success") {
			                	var length = _scope.alerts.push(
				    				{
				    					type:'success',
				    					msg:"恭喜,重置密码成功!"
				    				}
				    			);
				    			
				    			$timeout(function(){
				    				_scope.alerts.splice(length-1, 1);
				    			}, 2000);
		                	}
		                });
		    		}
		    	}
		    ]
		})
  	};
  	
  	//删除单个管理员
  	$scope.deleteOneUser = function(user){
  		var _scope = $scope;
  		var ids = user.id;
  		dialog.openDialog({
			title:"删除管理员",
			icon:'secondConfirm',
			contentClass:"w350",
			content:'<p class="secondConfirm">确定要删除该管理员吗？</p>\
		        		<p class="w300 fs14">\
		        			删除后不可恢复\
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
		                    url : 'system/user/remove.do',
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
  	
  	//删除管理员
  	$scope.deleteUser = function(){
  		var _scope = $scope;
  		var items = Object.keys(checkboxes.items);
  		if (items.length > 0) {
	  		dialog.openDialog({
				title:"删除管理员",
				icon:'secondConfirm',
				contentClass:"w350",
				content:'<p class="secondConfirm">确定要删除该管理员吗？</p>\
			        		<p class="w300 fs14">\
			        			删除后不可恢复\
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
			                    url : 'system/user/remove.do',
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
					msg:"请先选择管理员!"
			    }];
			$timeout(function(){
				_scope.alerts = [];
			}, 2000);
    		
  			return;
  		}
  	}
  		
  		//进入添加页面和控制器
        $scope.openUserDialog = function () {
            $state.go("ecss/system/user/toAddUser");
        }
        
      //进入编辑页面和控制器
        $scope.openEditUserDialog = function (editorData) {
        	editorData = editorData || {};
            $state.go("ecss/system/user/toEdit", { id : editorData.id});
        }
}]);