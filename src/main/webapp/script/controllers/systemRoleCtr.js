/**
 * 系统设置,角色管理
 * Created by mdc on 2016/6/12.
 */
app.add.controller('systemRoleCtr', ['$scope', '$state', 'ngTableParams', '$http', '$timeout', '$modal', 'dialog', function ($scope, $state, ngTableParams, $http, $timeout, $modal, dialog) {
    $scope.$emit('menuChange', $state.current.url);
    $scope.formData = {};

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

    /**
     * 删除操作
     */
    $scope.deleteConfirm = function () {
        dialog.confirm({
            icon:'secondConfirm',
            content: '<p class="secondConfirm">确定要删除该角色吗？</p>\
            		<p class="w300 fs14">\
		        	删除后不可恢复，请谨慎操作</p>',
            ok: function (scope, dialog, button, config) {
                $http.post('system/role/remove.do', {id: $scope.prevItem.id}, {
                    responseType: 'json',
                    cache: false
                }).success(function (ret) {
                    if (ret.result == "success") {
                        dialog.close();
                        alertInf.show('删除角色成功');
                        alertInf.close();
                        return tableReload();
                    }

                    if (ret.result && ret.result == "isuse") {
                        return alertInf.show('warning', '删除失败，当前角色已被绑定用户!');
                    }

                    alertInf.show('warning', ret.result);
                });

                //阻止关闭对话框
                return false;
            },
            cancel: function (scope, dialog, button, config) {
                alertInf.close(0);
                return true;
            }
        });
    };

    //点击行
    $scope.prevItem = {};
    $scope.clickTr = function (item) {
        $scope.prevItem && ($scope.prevItem.visited = false);
        $scope.prevItem.checked = false;
        item.visited = true;
        item.checked = true;
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
        //$scope.tableParams.filter({search: $scope.search});
        tableReload();
    };
    
    $scope.cleanSearch = function () {
    	$scope.search = "";
    	tableReload();
    };

    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };

    //分页表格
    $scope.tableParams = new ngTableParams(
        {
            page: 1, // 初始化显示第几页
            count: window.innerWidth>1600?10:(window.innerWidth>1366?7:5), // 初始化分页大小
            filter: {search: $scope.search}
        },
        {
            counts: [/*5,10,15*/], //控制每页显示大小
            paginationMaxBlocks: 5, //最多显示页码按钮个数
            paginationMinBlocks: 2,//最少显示页码按钮个数

            getData: function ($defer, params) {
                function getParame(params) {
                    var url = params.url();
                    var inf = {
                        draw: url.page,
                        length: url.count,
                        search: $scope.search,
                        start: (url.page - 1) * url.count
                    };

                    return inf;
                }

                var promise = $http.post('system/role/list.do', getParame(params), {
                    responseType: 'json',
                    cache: false
                });
                promise.success(function (data) {
                	var list = data.data;
                    if(list.list && list.list[0]) {
                        $scope.prevItem = list.list[0];
                        $scope.prevItem.visited = true;
                        $scope.prevItem.checked = true;
                    }

                    $scope.totalRecords = data.roleTotalNum;
                    $scope.noResultContent="false";
                    if($scope.totalRecords > 0 && list.totalCount == 0){
                    	$scope.noResultContent="true";
                    	$scope.faceImg = "littleTrouble";
                    	$scope.noContent="啊呀,没有检索到任何内容…";
                    	$scope.chooseList = [{"prevLink":"请更改条件后再次搜索或筛选"}]
                    }
                    
                    if($scope.totalRecords == 0 && list.totalCount == 0){
                    	$scope.noResultContent="true";
                    	$scope.faceImg = "noData";
                    	$scope.noContent="终于等到你，来添加角色吧";
                    	$scope.chooseList = [
                    	                     {"prevLink":'可以为管理员分配不同的权限'},
                    	                     {"content":"添加","textLink":true,"prevLink":"点击","nextLink":"来增加角色"}
                	                     ]
                    }
                    
                    params.total(list.totalCount);
                    $defer.resolve(list.list);
                });
            }
        });

    $scope.addRole = function(check){
    	if(check){
    		$scope.openRoleModalDialog();
    	}else{
    		return;
    	}
    }
    
    //打开添加角色对话框
    $scope.openRoleModalDialog = function (editorData) {
        editorData = editorData || {};
        var functions = {};

        var input = {
            rolename: editorData.name,
            note: editorData.note
        };
        dialog.openDialog({
            title: editorData.id ? '编辑角色' : '添加角色',
            url: "system/role/toAdd.do?random=" + Math.random(),
            size: "w700",
            resolve: {
                input: input,
                blurCheck:function(ctr) {
                    if(!ctr || (typeof ctr.$dirty == 'undefined')){
                        return ;
                    }
                    ctr.$dirty = true;
                },
                list: function (scope, $q, $modalInstance, mdcOpt) {

                    //校验是否选择权限
                    scope.hasFunctions = function () {
                        return !!(Object.keys(functions).length);
                    };

                    scope.otherAwesomeCallback = function (ivhNode, ivhIsSelected, ivhTree) {
                        if (ivhIsSelected) {
                            functions[ivhNode.id] = 1;
                        } else {
                            delete functions[ivhNode.id];
                        }

                        if (ivhNode.children && ivhNode.children.length) {
                            for (var i = 0; i < ivhNode.children.length; i++) {
                                if (ivhIsSelected) {
                                    functions[ivhNode.children[i].id] = 1;
                                } else {
                                    delete functions[ivhNode.children[i].id];
                                }
                            }
                        }

                        scope.treectr = Object.keys(functions).length;
                    };

                    var defer = $q.defer();  //声明延后执行
                    $http.get('system/role/getFunctions.do' + (editorData.id ? '?roleId=' + editorData.id : ''))
                        .success(function (data) {
                            var list = [], mapData = {};

                            if (!data) {
                                defer.resolve(list);
                                return;
                            }

                            for (var i = data.length - 1; i >= 0; i--) {
                                mapData[data[i].id] = data[i];
                                if (data[i].checked) {
                                    functions[data[i].id] = 1;
                                }
                            }

                            var pid, index, item, mapping = {};
                            for (var i = 0; i < data.length; i++) {
                                pid = data[i].parentId;
                                index = mapping[pid];

                                if (index) {
                                    list[index].children = list[index].children || [];
                                    list[index].children.push(data[i]);
                                } else {
                                    item = mapData[pid] || data[i];
                                    index = list.push(item) - 1;
                                    mapping[item.id] = index;
                                }
                            }

                            if(Object.keys(functions).length){
                                scope.treectr = Object.keys(functions).length;
                            }

                            defer.resolve(list);
                        })
                        .error(function () {
                            defer.reject([]);
                        });

                    return defer.promise;
                }
            },
            buttons: [
                {
                    name: '取消',
                    className: 'btn-gray'
                },
                {
                    name: '确定',
                    className: 'btn-green',
                    callback: function (scope, dialog, button, config) {

                        scope.addFrm.roleName.$dirty = true;
                        scope.addFrm.treectr.$dirty = true;

                        if (scope.addFrm.$invalid || !scope.hasFunctions()) {
                            return false;
                        }

                        editorData = angular.extend({}, editorData, {
                            functionIds: Object.keys(functions),
                            name: scope.input.rolename,
                            note: scope.input.note
                        });

                        $http.post('system/role/checkRoleName.do', {id: editorData.id, roleName: scope.input.rolename},
                            {
                                responseType: 'json',
                                cache: false
                            })
                            .success(function (result) {
                                if (result.result != "success") {
                                    alertInf.show('warning', result.result);
                                    alertInf.close(2000);
                                    return false;
                                }
                                $http.post('system/role/save.do', editorData,
                                    {
                                        responseType: 'json',
                                        cache: false
                                    })
                                    .success(function (ret) {
                                        if (ret.result && ret.result == "success") {
                                            dialog.close();

                                            alertInf.show(config.title + '成功!');
                                            alertInf.close();
                                            return tableReload();
                                        }

                                        alertInf.show.call(scope, ret.result);
                                    });
                            });
                        return false;
                    }
                }
            ]
        });
    }
}]);