/**
 * 通知管理
 * feiyong
 * 2016/6/20.
 */
app.add.controller('noticeCtr', ['$scope', '$state', '$http', 'map', '$timeout', 'ivhTreeviewMgr', 'dialog', function ($scope, $state, $http, map, $timeout, ivhTreeviewMgr, dialog) {
    $scope.$emit('menuChange', $state.current.url);

    $scope.tabNotice = [{active:true, disabled:false, heading:"发送新通知"},{active:false, disabled:false, heading:"已发送通知"}];

    $scope.sendNewMsg = function(){
    	$scope.tabNotice = [{active:true, disabled:false, heading:"发送新通知"},{active:false, disabled:false, heading:"已发送通知"}];
    }
    
    //人员搜索对象
    $scope.p ={};

    //部门搜索对象
    $scope.d = {};

    //设备组搜索对象
    $scope.g ={};
    $scope.selectedMap = new map();

    $scope.msg={};

    $scope.SearchType = {
        person:1,
        dept:2,
        group:3
    }
   //获取查询条件
    var promise = $http.post('../baseinfo/notice/getCondition.do', null,
        {
            responseType: 'json',
            cache: false
        });
    promise.success(function (result) {
        $scope.deptList = result.deptList;
        $scope.personList = result.personList;
        $scope.groupList = result.groupList;

        if (result.noticeList.totalCount > 0) {
            $scope.noticeList = result.noticeList.list;
            $scope.noResultContent = false;
        } else {
            $scope.noResultContent = true;
        }

    }).error(function(data, status, headers, config){
        alert('发生错误' + status);
    });

    $scope.currentPage = 0;

    /**
     * 下拉人员滚动动态获取人员
     * @returns {boolean}
     */
    $scope.loadMore = function() {
        $scope.currentPage++;
        if ($scope.busy) {
            return false;
        }
        $scope.busy = true;

        $http.post('../baseinfo/notice/getMorePersons.do',
            {
                currentPage:$scope.currentPage,
                personName:$scope.p.personName
            },
            {
                responseType: 'json',
                cache: false
            }).success(function(data) {
                $scope.busy = false;
                if (data.personList.length > 0) {
                    for (var i = 0; i < data.personList.length; i++) {
                        $scope.personList.push(data.personList[i]);
                        var item = $scope.selectedMap.get( $scope.personList[i].id + '@' + $scope.SearchType.person);
                        if (item) {
                            $scope.personList[i].selected = true;
                            $scope.personList[i].chk = true;
                        }
                    }
                }

        });

    };

    $scope.currentdeptPage = 2;
    /**
     * 下拉滚动动态获取部门
     * @returns {boolean}
     */
    $scope.loadMoreDeptList = function() {

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
                        var item = $scope.selectedMap.get( $scope.deptList[i].id + '@' + $scope.SearchType.dept);
                        if (item) {
                            $scope.deptList[i].selected = true;
                            $scope.deptList[i].chk = true;
                        }
                    }
                }
                $scope.currentdeptPage++;
            });

    };

    //回车键搜索
    $scope.myKeyupPerson = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchPerson();
    	}
    }
    
    /**
     * 搜索人员
     */
    $scope.searchPerson = function(){
        $scope.personList = [];
        $scope.currentPage = -1;
        $scope.loadMore();
    }
    
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
     * 选中人员
     * @param person
     */
    $scope.onSelectedPerson = function(person) {
        if (person.selected) {
               $scope.selectedMap.put(person.id + '@' + $scope.SearchType.person,{
                   type:$scope.SearchType.person,
                   id:person.id,
                   name:person.name
               });
       } else {
               $scope.selectedMap.remove(person.id + '@' + $scope.SearchType.person);
       }
    }

    //回车键搜索
    $scope.myKeyupGroup = function(e) {
    	var keycode = window.event?e.keyCode:e.which;
    	if(keycode == 13) {
    		$scope.searchGroup();
    	}
    }
    
    /**
     * 搜索设备组
     */
    $scope.searchGroup = function(){
        var promise = $http.post('../baseinfo/notice/searchGroup.do',
            {
                groupName:$scope.g.groupName
            },
            {
                responseType: 'json',
                cache: false
            }).success(function (result) {
                $timeout(function(){
                    if (result) {
                        $scope.groupList = result.groupList;
                        for(var i = 0;i < $scope.groupList.length;i++) {
                            var item = $scope.selectedMap.get( $scope.groupList[i].id + '@' + $scope.SearchType.group);
                            if (item) {
                                $scope.groupList[i].selected = true;
                                $scope.groupList[i].chk = true;
                            }
                        }
                    } else {
                        $scope.groupList = null;
                    }

                })

            }).error(function(data, status, headers, config){
            alert('发生错误' + status);
        });
    }

    /**
     * 选中部门
     * @param dept
     */
    $scope.onSelectedDept = function(dept) {
        if (dept.selected) {
            $scope.selectedMap.put(dept.id + '@' + $scope.SearchType.dept,{
                type:$scope.SearchType.dept,
                id:dept.id,
                name:dept.name
            });
        } else {
            $scope.selectedMap.remove(dept.id + '@' + + $scope.SearchType.dept);
        }
    }

    /**
     * 选中设备组
     * @param person
     */
    $scope.onSelectedGroup = function(group) {
        if (group.selected) {
            $scope.selectedMap.put(group.id + '@' + $scope.SearchType.group,{
                type:$scope.SearchType.group,
                id:group.id,
                name:group.name
            });
        } else {
            $scope.selectedMap.remove(group.id + '@' + + $scope.SearchType.group);
        }
    }

    /**
     * 选中部门
     * @param ivhNode
     * @param ivhIsSelected
     * @param ivhTree
     */
    $scope.otherAwesomeCallback = function (ivhNode, ivhIsSelected, ivhTree) {

        //校验是否选择权限
        if (ivhIsSelected) {
            $scope.selectedMap.put(ivhNode.value + '@' + $scope.SearchType.dept,{
                type:$scope.SearchType.dept,
                id:ivhNode.value,
                name:ivhNode.label
            });
        } else {
            $scope.selectedMap.remove(ivhNode.value + '@' + $scope.SearchType.dept);
        }

        if (ivhNode.children && ivhNode.children.length) {
            for (var i = 0; i < ivhNode.children.length; i++) {
                if (ivhIsSelected) {
                    $scope.selectedMap.put(ivhNode.children[i].value + '@' + $scope.SearchType.dept,{
                        type:$scope.SearchType.dept,
                        id:ivhNode.children[i].value,
                        name:ivhNode.children[i].label
                    });

                } else {
                    $scope.selectedMap.remove(ivhNode.children[i].value + '@' + + $scope.SearchType.dept);
                }
            }
        }

        /*console.log($scope.selectedMap);*/
    };

    /**
     * 删除
     */
    $scope.removePeople = function(item) {
        $scope.selectedMap.remove(item.id + '@' + item.type);
        if (item.type == $scope.SearchType.person) {
            for (var i = 0; i < $scope.personList.length; i++) {
                if (item.id == $scope.personList[i].id) {
                    $scope.personList[i].selected = false;
                    $scope.personList[i].chk = false;
                }
            }
        } else if (item.type == $scope.SearchType.dept) {
            for (var i = 0; i < $scope.deptList.length; i++) {
                if (item.id == $scope.deptList[i].id) {
                    $scope.deptList[i].selected = false;
                    $scope.deptList[i].chk = false;
                }
            }
        } else if (item.type == $scope.SearchType.group) {
            for (var i = 0; i < $scope.groupList.length; i++) {
                if (item.id == $scope.groupList[i].id) {
                    $scope.groupList[i].selected = false;
                    $scope.groupList[i].chk = false;
                }
            }
        }


    }


    /**
     * 发送通知
     */
    $scope.sendMsg = function(sendFrm){
        sendFrm.title.$dirty = true;
        sendFrm.content.$dirty = true;


        if (!$scope.selectedMap || $scope.selectedMap.values().length <= 0) {
            $scope.chooseperson = true;
            /*alertInf.show('warning', '请您选择接收人...');
            alertInf.close(3000);*/
            return;
        }else{
            $scope.chooseperson = false;
        }
        if (sendFrm.$invalid) {
            $scope.contentShow = true;
            /*alertInf.show('warning', '标题和内容不能为空');
            alertInf.close(3000);*/
            return false;
        }else{
            $scope.contentShow = false;
        }

        sendFrm.title.$valid = true;
        sendFrm.content.$valid = true;

        //发送通知
       dialog.confirm({
            icon:'secondConfirm',
            content: '<p class="secondConfirm">确定要发送此通知吗？</p>\
		        	<p class="w300 fs14">\
		        	通知发送成功后，可去已发送通知页面查看</p>',
            resolve:{
                ids: $scope.selectedMap.values(),
                title:$scope.msg.title,
                content:$scope.msg.content,
                id:$scope.msg.id
            },
            okVal:"发送",
            ok:function(resolveData, dialog, button, config){
                button.name = "发送中...";
                $http.post('../baseinfo/notice/sendMsg.do',
                    {
                        ids: resolveData.ids,
                        title:resolveData.title,
                        content:resolveData.content,
                        id:resolveData.id
                    },
                    {
                        responseType: 'json',
                        cache: false
                    }).success(function (ret) {

                        if (ret.success == "true") {
                            sendFrm.title.$dirty = false;
                            sendFrm.content.$dirty = false;

                            alertInf.show('发送通知成功');
                            alertInf.close();

                            //更新列表
                            $http.post('../baseinfo/notice/getMoreMsgs.do',
                                {
                                    currentPage:0
                                },
                                {
                                    responseType: 'json',
                                    cache: false
                                }).success(function(data) {
                                    dialog.close();

                                    $timeout(function(){
                                        alertInf.show('success', '发送通知成功!');
                                        $scope.noticeList=data.noticeList.list;
                                        $scope.selectedMap.clear();
                                        $scope.msg.title = null;
                                        $scope.msg.content = null;

                                        for (var i = 0; i < $scope.personList.length; i++) {
                                                $scope.personList[i].selected = false;
                                                $scope.personList[i].chk = false;
                                        }

                                        for (var i = 0; i < $scope.deptList.length; i++) {
                                            $scope.personList[i].selected = false;
                                            $scope.personList[i].chk = false;
                                        }

                                        for (var i = 0; i < $scope.groupList.length; i++) {
                                            $scope.personList[i].selected = false;
                                            $scope.personList[i].chk = false;
                                        }
                                    }, 50)

                                });
                            return;
                        }

                        if (ret && ret.success == "false") {
                            return alertInf.show('warning', '发送通知失败!');
                        }

                        alertInf.show('warning', ret);
                    }).error(function(data, status, headers, config){
                        alert('发生错误' + status);
                    })

                //不让模态框自动关闭
                return false;
            }


        });
    }


    /**
     * 加载更多通知信息
     */
    $scope.currentMsgPage = 2;
    $scope.loadMoreMsg = function(){

        if ($scope.flag) {
            return false;
        }
        $scope.flag = true;

        $http.post('../baseinfo/notice/getMoreMsgs.do',
            {
                currentPage:$scope.currentMsgPage
            },
            {
                responseType: 'json',
                cache: false
            }).success(function(data) {
                $scope.flag = false;
                if (data.noticeList.list.length > 0) {
                    for (var i in data.noticeList.list) {
                        $scope.noticeList.push(data.noticeList.list[i]);
                    }
                }
                $scope.currentMsgPage++;
            });
    }

    /**
     * 发布到更多设备
     */
    $scope.sendMoreDevice = function(notice){
        //alert(notice.id);
        $scope.msg = {
            id:notice.id,
            title:notice.title,
            content:notice.content
        }

        $scope.tabNotice[0].active=true;
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

    //发送通知页面样式
    /*$scope.noticeTabStyle = {
        'height':window.innerHeight-220+'px',
        'overflow-y':'auto'
    }*/
}]);
