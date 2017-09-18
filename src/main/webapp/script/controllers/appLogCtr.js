/**
 * Created by Administrator on 2016/7/18.
 */
app.add.controller('appLogCtr', ['$scope', '$state', '$stateParams', '$sce', 'ngTableParams', '$http','highchartsNG', 'dialog','$timeout',function ($scope, $state, $stateParams, $sce, ngTableParams, $http, highchartsNG, dialog,$timeout) {
    $scope.$emit('menuChange', $state.current.url);

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

    // 部门条件
    $scope.selectDept = {};
    $scope.showTree = false;
    $scope.showDept = function () {
        $scope.showTree = $scope.showTree == true ? false : true;
    }

    //鼠标离开搜索框,树消失
    $scope.closeTree=function () {
        $scope.showTree = false;
    }
    //部门搜索对象
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

    };

    //回车键搜索
    $scope.myKeyupdept = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchdept();
    	}
    }
    
    /**
     * 搜索部门
     */
    $scope.searchdept = function(){
        $scope.deptList = [];
        $scope.currentdeptPage = 0;
        $scope.loadMoreDeptList();
    }

    /**
     * 选中部门
     * @param dept
     */
    $scope.onSelectedDept = function(dept) {
        $scope.selectDept = dept;
        $scope.showTree = false;
        tableReload();
    }

    $scope.removeSelectDept = function () {
        $scope.selectDept = null;
        tableReload();
    }

    /*左侧菜单点击事件*/
    $scope.deviceState1 = true;
    $scope.changestate1 = function () {
        $scope.deviceState1 = !$scope.deviceState1;
    }

    $scope.deviceState2 = true;
    $scope.changestate2 = function () {
        $scope.deviceState2 = !$scope.deviceState2;
    }

    $scope.deviceState3 = true;
    $scope.changestate3 = function () {
        $scope.deviceState3 = !$scope.deviceState3;
    }

    //鼠标离开搜索框,树消失
    $scope.closeTree=function () {
        $scope.showTree = false;
    }
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
    $scope.auditDialog = function (item) {
        dialog.openDialog({
            title: "审计日志",
            url: '../audit/log/auditPage.do',
            resolve: {
                blurCheck:function(ctr) {
                    if(!ctr || (typeof ctr.$dirty == 'undefined')){
                        return ;
                    }
                    ctr.$dirty = true;
                },
               selectItem : item,
                isSendMsg : false
            },
            size:'w500',
            buttons: [
                {
                    name: '取消',
                    className: 'btn-gray'
                },
                {
                    name: '确定',
                    className: 'btn-green',
                    callback: function (scope, dialog, button, config) {
                        var _scope = $scope;
                        scope.addFrm.modelMsgInput.$dirty = true;
                        if (scope.addFrm.$invalid) {
                            return false;
                        }
                        $http({
                            url : '../audit/log/audit.do',
                            method : 'POST',
                            data : {
                                imei : scope.selectItem.imei,
                                violationId: scope.selectItem.strategyUniqueId,
                                msg: scope.addFrm.modelMsgInput.$modelValue,
                                type : scope.selectItem.disposeType,
                                version : scope.selectItem.version
                            },
                            responseType: 'json',
                            cache: false
                        })
                        .success(function (result) {
                            dialog.close();
                            alertInf.show('审计成功!');
                            tableReload();
                            alertInf.close();
                        })
                    }
                }
            ]
        })
    }

    $scope.gradeList = [];

    $scope.gradeArray = [{
        "value" : "1",
        "name" : "一级违规"
    },{
        "value" : "2",
        "name" : "二级违规"
    },{
        "value" : "3",
        "name" : "三级违规"
    }];

    $scope.gradeSelect = function() {
        var value = this.grade.value;
        if (this.grade.selected) {
            $scope.gradeList.push(value);
        } else {
            var index = $scope.gradeList.indexOf(value);
            $scope.gradeList.splice(index, 1);
        }
        tableReload();
    };

    $scope.disposeList = [];

    $scope.disposeTypeArray = [{
        "value" : "1",
        "name" : "禁拨电话"
    },{
        "value" : "3",
        "name" : "擦除数据"
    },{
        "value" : "4",
        "name" : "锁定锁屏"
    },{
        "value" : "2",
        "name" : "禁止上网"
    },{
        "value" : "0",
        "name" : "违规只记录不管控"
    }];

    $scope.disposeSelect = function() {
        var value = this.dispose.value;
        if (this.dispose.selected) {
            $scope.disposeList.push(value);
        } else {
            var index = $scope.disposeList.indexOf(value);
            $scope.disposeList.splice(index, 1);
        }
        tableReload();
    };

    var auditStatus = $stateParams.auditStatus;
    if($stateParams.auditStatus == 0) {
    	/*$scope.auditStatus0 = true;*/
        $scope.unaudit = true;
    }
    $scope.auditSelect = function() {
        if (this.audit && !this.unaudit) {
            auditStatus = 1;
        } else if (!this.audit && this.unaudit) {
            auditStatus = 0;
        } else {
            auditStatus = null;
        }
        tableReload();
    };

    var condition = {draw : 1};
    $scope.tableParams = new ngTableParams(
        {
            page: 1,  // 初始化显示第几页
            count: window.innerWidth>1600?10:(window.innerWidth>1366?7:5) //初始化分页大小
        },
        {
            counts: [/*5,10,20*/], //控制每页显示大小
            paginationMaxBlocks: 5, //最多显示页码按钮个数
            paginationMinBlocks: 2,//最少显示页码按钮个数
            getData: function($defer, params) {
                var page = params.page();
                var size = params.count();

                condition.start = ( page - 1 ) * size;
                condition.length = size;
                condition.search = $scope.search;
                condition.auditStatus = auditStatus;
                // 部门条件
                if (null != $scope.selectDept) {
                    condition.deptId = $scope.selectDept.id;
                } else {
                    condition.deptId = null;
                }
                // 违规等级
                condition.gradeArray = $scope.gradeList;
                // 违规自动处理
                condition.disposeTypeArray = $scope.disposeList;
                $http({
                    url : '../audit/log/getLogList.do',
                    method : 'POST',
                    data : condition,
                    cache:false,
                    responseType :  "json"
                })
                .success(function (result) {
                    var data = result.data;
                    $scope.recordsNumber = result.recordsNumber;
                    var totalCount = data.totalCount;
                    var dataList = data.dataList;

                    $scope.totalCount = totalCount;

                    if (dataList.length > 0) {
                        $scope.prevItem = dataList[0];
                        dataList[0].visited = true;
                    } else {
                        $scope.prevItem = {};
                    }

                    $scope.noResultContent="false";
                    if(totalCount == 0){
                    	$scope.noResultContent="true";
                    }
                    
                    params.total(totalCount);
                    $defer.resolve(dataList);
                }).error(function (data) {
                    console.info(error);
                    $defer.reject();
                });
            }
        }
    );
    $scope.prevItem = {};
    $scope.clickNetTr = function(item){
        $scope.prevItem && ($scope.prevItem.visited = false);
        item.visited = true;
        $scope.prevItem = item;
    };

    function tableReload() {
        $scope.tableParams.page(1);
        $scope.tableParams.reload();
    };

}])