/**
 * Created by Administrator on 2016/7/11.
 */
app.add.controller('systemUserAddCtr', ['$rootScope', '$scope', '$state', 'ngTableParams', '$http', '$modal', '$timeout','$log','dialog',function ($rootScope, $scope, $state, ngTableParams, $http, $modal, $timeout, $log, dialog) {
    $scope.$emit('menuChange', '/ecss/system/user/toList');

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
						$state.go("ecss/system/user/toList");
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
    
    var checkboxes = {
        checked: false,
        items: []
    };

    //复选框数据
    $scope.checkboxes = checkboxes;
    /*成功失败提示的弹框*/
	$scope.closeable = true;
	$scope.alerts = [];
    
    $scope.blurCheck = function(ctr) {
        if(!ctr || (typeof ctr.$dirty == 'undefined')){
            return ;
        }
        ctr.$dirty = true;
    };
    
    $scope.checkName = function () {
        $scope.errorShow = true;
        var checkuserName = {
        	id : $state.params.id,
        	userName: $scope.addFrm.userName.$viewValue
        }

        if (typeof(checkuserName.userName) != undefined) {
            $http({
                url: 'system/user/checkUserName.do',
                data: {
                	id: checkuserName.id,
                    userName: checkuserName.userName
                },
                method: 'POST',
                cache: false,
                responseType: "json"
            })
                .success(function (data) {
                    if (data.result == false ) {
                        $scope.checkuserName = true;
                    } else {
                        $scope.checkuserName = false;
                    }
                }).error(function (data) {
                console.info(data);
            });
        }
    }
    
    $http({
        url : 'system/user/getAllRole.do',
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
    .success(function (data) {
        $scope.rolesList = data;
    }).error(function (data) {
        console.info('error');
    });
    
    /**
     * 切换复选框
     * @param user
     */
    $scope.roleSelect = function () {
        var _id = this.role.id;
        if (this.role.selected) {
        	checkboxes.items.push(_id);

            if (checkboxes.items.length == $scope.rolesList.length) {
                checkboxes.checked = true;
            }
        } else {
        	var index = checkboxes.items.indexOf(_id);
        	checkboxes.items.splice(index,1);
            checkboxes.checked = false;
        }
    };

    //选择全部
    $scope.checkAll = function () {
        checkboxes.items = []; //先清空已选择
        var data = $scope.rolesList;

        for (var i = 0; i < data.length; i++) {
            if (checkboxes.checked) {
                checkboxes.items.push(data[i].id);
            }

            data[i].selected = checkboxes.checked;
        }
    };

    $http({
    	url : 'system/user/getRootId.do',
        method : 'POST',
        cache:false,
    })
    .success(function (data){
    	$scope.rootId = data;
    })
    .error(function (data) {
        console.info(data);
    });
    
    $http({
        url : 'system/user/getFunctions.do',
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
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
        var child, parent;
        for (var i = 0; i < data.length; i++) {
     	   child = data[i];
     	   if (child.parentId == $scope.rootId) {
     		 	list.push(child);
					continue;
				}
     	   
     	   parent = mapData[child.parentId];
     	   if(!parent) {
     		   data.splice(i, 1);
     		   i--;
     	   } else {
     		   parent.children.push(child);
     	   }
        }

        $scope.list = list;
    }).error(function (data) {
        console.info(data);
    });
    
    var functions = {};
    //点击树选择框时
    $scope.selectCallback =  function (ivhNode, ivhIsSelected, ivhTree) {
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
            	
            	if (ivhNode.children[i].children && ivhNode.children[i].children.length) {
	            	for (var j = 0; j < ivhNode.children[i].children.length; j++) {
		                if (ivhIsSelected) {
		                    functions[ivhNode.children[i].children[j].id] = 1;
		                    if (ivhNode.children[i].children[j].children && ivhNode.children[i].children[j].children.length) {
		                    	for (var k = 0; k < ivhNode.children[i].children[j].children.length; k++) {
		                    		if (ivhIsSelected) {
		                    			functions[ivhNode.children[i].children[j].children[k].id] = 1;
		                    		} else {
		                    			delete functions[ivhNode.children[i].children[j].children[k].id]
		                    		}
		                    	}
		                    }
		                } else {
		                    delete functions[ivhNode.children[i].children[j].id];
		                    if (ivhNode.children[i].children[j].children && ivhNode.children[i].children[j].children.length) {
		                    	for (var k = 0; k < ivhNode.children[i].children[j].children.length; k++) {
		                    		if (ivhIsSelected) {
		                    			functions[ivhNode.children[i].children[j].children[k].id] = 1;
		                    		} else {
		                    			delete functions[ivhNode.children[i].children[j].children[k].id]
		                    		}
		                    	}
		                    }
		                }
	            	}
            	}
            }
        } 
        $scope.treectr1 = Object.keys(functions).length;
    };
    
    $scope.cardInfoList = [];
    $scope.cardInfoRepeat = [];
    $scope.secondAdd = false;
    $scope.addCard = true;
    
    $scope.editShow = function(){
    	$scope.addCard = true;
    	$scope.cardInfo == true?$scope.secondAdd = true:$scope.secondAdd = false;;
    }
    

	$scope.readCard = function() {
        //初始化
        $rootScope.pluginCard.readUserCard(function(cards){
            if (!cards || cards.length < 2) {
                alertInf.show('warning', '请插入待绑定的安全卡！');
                alertInf.close(2000);
                return false;
            } else if (cards.length > 2){
                alertInf.show('warning', '绑卡时除登陆卡只能插入一张卡！');
                alertInf.close(2000);
                return false;
            } else if (cards.length == 2){

                cards[1].getCert(4, function(data){
                    if (data.success) {
                        var cardId_1 = cards[1].getCardId();
                        var cert1 = cardId_1 + "--" + data.cert;

                        //如果读取的卡为登录卡，需要读取第一张卡
                        if(cardId_1 == $rootScope.user.cardId) {
                            cards[0].getCert(4, function(data2){
                                if (data2.success) {
                                    cert1 = cards[0].getCardId() + "--" + data2.cert;
                                } else {
                                    alertInf.show('warning', '读卡证书失败！');
                                    alertInf.close(2000);
                                    return false;
                                }
                            });

                        }

                        getCardSn(cert1);
                    } else {
                        alertInf.show('warning', '读卡证书失败！');
                        alertInf.close(2000);
                        return false;
                    }
                });

            }
        });
	}
		
	$scope.card = {};
	//检查卡号是否已经被绑定过
	function getCardSn(cert) {
		var input = {cert : cert};
		$http.post('system/user/getCardSn.do', input,
		{
            responseType: 'json',
	        cache:false,
	    })
	    .success(function (result) {
	    	if(!result.isBind) {
	    		$scope.card.id = result.cardId;
	    		$scope.card.sn = result.sn;
			} else {
				$scope.card.id = '';
				alertInf.show('warning', '该安全卡已经被绑定！');
    	  		alertInf.close(2000);
			}
	    	for (var i = 0; i < $scope.cardInfoRepeat.length; i++) {
				if($scope.card.id == $scope.cardInfoRepeat[i]['cardId']){
					$scope.card.id = '';
					alertInf.show('warning', '该安全卡已经绑定，继续绑定请换卡');
	    	  		alertInf.close(3000);
	    	  		return false;
				}
			}
	    }).error(function (result) {
	        console.info(result);
	    });
	}
    
    $scope.bindCard = function(){
        if($scope.card.id != null && $scope.card.id != '') {
            var cardId = $scope.card.id;
            var note = $scope.card.note == null ? '' : $scope.card.note;
    		var sn = $scope.card.sn;
    		$scope.cardInfoList.push(cardId + '--' + note + '--' + sn);
    		$scope.cardInfoRepeat.push({cardId:cardId, note:note, sn:sn});
    		$scope.card.id = "";
    		$scope.card.note = "";
    		$scope.cardInfo = true;
    		$scope.addCard = false;
    		$scope.secondAdd = false;
    	} else {
    		alertInf.show('warning', '请先点击读卡读取卡号！');
	  		alertInf.close(2000);
    	}
    }
    
    $scope.editCardInfo = function (cardInfo) {
        $scope.editCardId = cardInfo.cardId;
    }
    $scope.sureEdit = function (cardInfo) {
    	var cardId = cardInfo.cardId;
        var sn = cardInfo.sn;
        $scope.editCardId = 1;
        var index1 = $scope.cardInfoList.indexOf(cardId + '--' + cardInfo.note + '--' + sn);
        $scope.cardInfoList.splice(index1,1);
        var index2 = $scope.cardInfoRepeat.indexOf(this.cardInfo);
        $scope.cardInfoRepeat.splice(index2,1);
        var note = cardInfo.note;
		$scope.cardInfoList.push(cardId + '--' + note + '--' + sn);
		$scope.cardInfoRepeat.push({cardId:cardId, note:note, sn:sn});
		$scope.cardInfo = true;
		$scope.addCard = false;
		$scope.secondAdd = false;
    }
    $scope.cancelEdit = function (cardInfo) {
    	$scope.editCardId = 1;
        $scope.cardInfo = cardInfo;
    }
    
    $scope.unBindCard = function(cardInfo) {
        for(var i = 0; i < $scope.cardInfoRepeat.length; i++) {
            if($scope.cardInfoRepeat[i].cardId == this.cardInfo.cardId) {
                $scope.cardInfoList.splice(i,1);
                $scope.cardInfoRepeat.splice(i,1);
            }
        }
    }
    
    $scope.cancelBind = function(cardInfo){
    	$scope.card.id = '';
		$scope.card.note = '';
    	$scope.addCard = false;
    	$scope.secondAdd = false;
    }
    
    $scope.saveManager = function() {
		var input = {
			status: 1,
			cardInfoLists: $scope.cardInfoList,
			roleIds: checkboxes.items,
			functionIds: Object.keys(functions),
			userName: $scope.addFrm.userName.$viewValue,
			name: $scope.addFrm.name.$viewValue,
		    mobile: $scope.addFrm.mobile.$viewValue,
		    email: $scope.addFrm.email.$viewValue
		};
		$scope.addFrm.userName.$dirty = true;
		$scope.addFrm.name.$dirty = true;
		$scope.addFrm.mobile.$dirty = true;
		
		if ($scope.addFrm.userName.$invalid || $scope.addFrm.name.$invalid || $scope.addFrm.mobile.$invalid) {
		    return false;
		}
		if($scope.checkuserName) {
			return false;
		}
		if (!$scope.cardInfoList.length) {
			alertInf.show('warning', '请您绑定卡！');
	  		alertInf.close(2000);
			return false;
		}
		if (!checkboxes.items.length) {
			alertInf.show('warning', '请选择角色权限！');
	  		alertInf.close(2000);
			return false;
		}
		if (!Object.keys(functions).length) {
			alertInf.show('warning', '请选择部门权限！');
	  		alertInf.close(2000);
			return false;
		}
		
		$http.post('system/user/save.do', input,
	    {
	        responseType: 'json',
	        cache: false
	    }).success(function (result) {
	        if (result.result && result.result == "success") {
	            dialog.openDialog({
					title:"保存管理员",
					icon:'success',
	                close:{
	                    callback:function ($scope, dialog3, button, config) {
	                    	$state.go("ecss/system/user/toList");
	                    }
	                },
					content:'<p class="successTip">恭喜您，Administrator!</p>\
				        		<p class="w300 fs14">\
				        			保存管理员成功，默认密码：111111\
				        		</p>\
				        		<p class="w300 fs14 mt10">\
				        			别忘了提示他及时登录并修改密码哦~\
				        		</p>',
				    buttons:[{
				    	name:"知道了",
				    	className:"btn-green",
				    	callback:function($scope, dialog3, button, config){
				    		$state.go("ecss/system/user/toList");
				    	}
				    }]
				})
	
	        }
	
	    });
    }
}]);

app.add.controller('systemUserEditCtr', ['$rootScope', '$scope', '$state', 'ngTableParams', '$http', '$modal', '$timeout','$log','dialog',function ($rootScope, $scope, $state, ngTableParams, $http, $modal, $timeout, $log, dialog) {
    $scope.$emit('menuChange', '/ecss/system/user/toList');
    
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
						$state.go("ecss/system/user/toList");
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
    
    var checkboxes = {
        checked: false,
        items: []
    };

    //复选框数据
    $scope.checkboxes = checkboxes;
    /*成功失败提示的弹框*/
	$scope.closeable = true;
	$scope.alerts = [];
    
    $scope.blurCheck = function(ctr) {
        if(!ctr || (typeof ctr.$dirty == 'undefined')){
            return ;
        }
        ctr.$dirty = true;
    };

    $scope.checkName = function () {
        $scope.errorShow = true;
        var checkuserName = {
        	id : $state.params.id,
        	userName: $scope.addFrm.userName.$viewValue
        }

        if (typeof(checkuserName.userName) != undefined) {
            $http({
                url: 'system/user/checkUserName.do',
                data: {
                	id: checkuserName.id,
                    userName: checkuserName.userName
                },
                method: 'POST',
                cache: false,
                responseType: "json"
            })
                .success(function (data) {
                    if (data.result == false ) {
                        $scope.checkuserName = true;
                    } else {
                        $scope.checkuserName = false;
                    }
                }).error(function (data) {
                console.info(data);
            });
        }
    }
    
    // 根据id号获取管理员详细信息
	$http({
		url : 'system/user/getSysInfo.do',
		method : 'POST',
		data : {
			id : $state.params.id
		},
		cache:false,
		responseType :  "json"
	}).success(function (result) {
		var sysInfo = result.sysInfo;
		$scope.userName = sysInfo.userName;
		$scope.name = sysInfo.name;
		$scope.mobile = sysInfo.mobile;
		$scope.email = sysInfo.email;
		$scope.status = sysInfo.status;
	}).error(function (data) {
		console.info(data);
	});
	
    
    $scope.cardInfoList = [];
    $scope.cardInfoRepeat = [];
    $scope.secondAdd = false;
    $scope.addCard = false;
    
  //根据id获取卡信息
    $http({
		url : 'system/user/getCertInfo.do',
		method : 'POST',
		data : {
			userId : $state.params.id
		},
		cache:false,
		responseType :  "json"
	}).success(function (result) {
		for (var i = 0;i < result.certInfo.length;i++) {
			$scope.cardInfoList.push(result.certInfo[i].cardId + '--' + result.certInfo[i].note + '--' + result.certInfo[i].sn);
			$scope.cardInfoRepeat.push({cardId:result.certInfo[i].cardId, note:result.certInfo[i].note, sn:result.certInfo[i].sn});
		}
	}).error(function (data) {
		console.info(data);
	});
    
    $scope.editShow = function(){
    	$scope.addCard = true;
    	$scope.cardInfo == true?$scope.secondAdd = true:$scope.secondAdd = false;;
    }
	
	$scope.readCard = function() {
        //初始化
        $rootScope.pluginCard.readUserCard(function(cards){
            if (!cards || cards.length < 2) {
                alertInf.show('warning', '请插入待绑定的安全卡！');
                alertInf.close(2000);
                return false;
            } else if (cards.length > 2){
                alertInf.show('warning', '绑卡时除登陆卡只能插入一张卡！');
                alertInf.close(2000);
                return false;
            } else if (cards.length == 2){

                cards[1].getCert(4, function(data){
                    if (data.success) {
                        var cardId_1 = cards[1].getCardId();
                        var cert1 = cardId_1 + "--" + data.cert;

                        //如果读取的卡为登录卡，需要读取第一张卡
                        if(cardId_1 == $rootScope.user.cardId) {
                            cards[0].getCert(4, function(data2){
                                if (data2.success) {
                                    cert1 = cards[0].getCardId() + "--" + data2.cert;
                                } else {
                                    alertInf.show('warning', '读卡证书失败！');
                                    alertInf.close(2000);
                                    return false;
                                }
                            });

                        }

                        getCardSn(cert1);
                    } else {
                        alertInf.show('warning', '读卡证书失败！');
                        alertInf.close(2000);
                        return false;
                    }
                });

            }
        })
	}
		
	$scope.card = {};
	//检查卡号是否已经被绑定过
	function getCardSn(cert) {
		var input = {cert : cert};
		$http.post('system/user/getCardSn.do', input,
		{
            responseType: 'json',
	        cache:false,
	    })
	    .success(function (result) {
	    	if(!result.isBind) {
	    		$scope.card.id = result.cardId;
	    		$scope.card.sn = result.sn;
			} else {
				$scope.card.id = '';
				alertInf.show('warning', '该安全卡已经被绑定！');
    	  		alertInf.close(2000);
			}
	    	for (var i = 0; i < $scope.cardInfoRepeat.length; i++) {
				if($scope.card.id == $scope.cardInfoRepeat[i]['cardId']){
					$scope.card.id = '';
					alertInf.show('warning', '该安全卡已经绑定，继续绑定请换卡');
	    	  		alertInf.close(3000);
	    	  		return false;
				}
			}
	    }).error(function (result) {
	        console.info(result);
	    });
	}
    
    $scope.bindCard = function(){
        if($scope.card.id != null && $scope.card.id != '') {
            var cardId = $scope.card.id;
            var note = $scope.card.note == null ? '' : $scope.card.note;
            var sn = $scope.card.sn;
            $scope.cardInfoList.push(cardId + '--' + note + '--' + sn);
            $scope.cardInfoRepeat.push({cardId: cardId, note: note, sn: sn});
            $scope.card.id = "";
            $scope.card.note = "";
            $scope.cardInfo = true;
            $scope.addCard = false;
            $scope.secondAdd = false;
        } else {
            alertInf.show('warning', '请先点击读卡读取卡号！');
            alertInf.close(2000);
        }
    }
    
    $scope.editCardInfo = function (cardInfo) {
    	$scope.editCardId = cardInfo.cardId;
        if(cardInfo.note == null) {
            cardInfo.note = '';
        }
    }
    $scope.sureEdit = function (cardInfo) {
    	var cardId = cardInfo.cardId;
        var sn = cardInfo.sn;
        $scope.editCardId = 1;
        var index1 = $scope.cardInfoList.indexOf(cardId + '--' + cardInfo.note + '--' + sn);
        $scope.cardInfoList.splice(index1,1);
        var index2 = $scope.cardInfoRepeat.indexOf(this.cardInfo);
        $scope.cardInfoRepeat.splice(index2,1);
    	var note = cardInfo.note;
		$scope.cardInfoList.push(cardId + '--' + note + '--' + sn);
		$scope.cardInfoRepeat.push({cardId:cardId, note:note, sn:sn});
		$scope.cardInfo = true;
		$scope.addCard = false;
		$scope.secondAdd = false;
    }
    $scope.cancelEdit = function (cardInfo) {
    	 $scope.editCardId = 1;
        $scope.cardInfo = cardInfo;
    }
    
    $scope.unBindCard = function(cardInfo) {
        for(var i = 0; i < $scope.cardInfoRepeat.length; i++) {
            if($scope.cardInfoRepeat[i].cardId == this.cardInfo.cardId) {
                $scope.cardInfoList.splice(i,1);
                $scope.cardInfoRepeat.splice(i,1);
            }
        }
    }
    
    $scope.cancelBind = function(){
    	$scope.card.id = '';
		$scope.card.note = '';
    	$scope.addCard = false;
    	$scope.secondAdd = false;
    }
    
    //根据id获取角色
    $http({
		url : 'system/user/getRoles.do',
		method : 'POST',
		data : {
			userId : $state.params.id
		},
		cache:false,
		responseType :  "json"
	}).success(function (result) {
		for(var i = 0; i < result.length; i++) {
			if (result[i].checked) {
				result[i]['selected'] = true;
				checkboxes.items.push(result[i].id);
			};
		}
		if (checkboxes.items.length == result.length) {
			checkboxes.checked = true;
		}
		$scope.rolesList = result;
	}).error(function (data) {
		console.info(data);
	});
    
    /**
     * 切换复选框
     * @param user
     */
    $scope.roleSelect = function () {
        var _id = this.role.id;
        if (this.role.selected) {
        	checkboxes.items.push(_id);

            if (checkboxes.items.length == $scope.rolesList.length) {
                checkboxes.checked = true;
            }
        } else {
        	var index = checkboxes.items.indexOf(_id);
        	checkboxes.items.splice(index,1);
            checkboxes.checked = false;
        }
    };

    //选择全部
    $scope.checkAll = function () {
        checkboxes.items = []; //先清空已选择
        var data = $scope.rolesList;

        for (var i = 0; i < data.length; i++) {
            if (checkboxes.checked) {
                checkboxes.items.push(data[i].id);
            }

            data[i].selected = checkboxes.checked;
        }
    };
    
    $http({
    	url : 'system/user/getRootId.do',
        method : 'POST',
        cache:false,
    })
    .success(function (data){
    	$scope.rootId = data;
    })
    .error(function (data) {
        console.info(data);
    });
    
    //根据id获取部门权限
    $http({
        url : 'system/user/getFunctions.do',
        data : {
			userId : $state.params.id
		},
        method : 'POST',
        cache:false,
        responseType :  "json"
    })
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
        
        var child, parent;
        for (var i = 0; i < data.length; i++) {
     	   child = data[i];
     	   
     	   if (child.parentId == $scope.rootId) {
     		 	list.push(child);
					continue;
				}
     	   
     	   parent = mapData[child.parentId];
     	   if(!parent) {
     		   data.splice(i, 1);
     		   i--;
     	   } else {
     		   parent.children.push(child);
     	   }
        }

        $scope.list = list;
    }).error(function (data) {
        console.info(data);
    });
    
    var functions = {};
    //点击树选择框时
    $scope.selectCallback =  function (ivhNode, ivhIsSelected, ivhTree) {
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
            	
            	if (ivhNode.children[i].children && ivhNode.children[i].children.length) {
	            	for (var j = 0; j < ivhNode.children[i].children.length; j++) {
		                if (ivhIsSelected) {
		                    functions[ivhNode.children[i].children[j].id] = 1;
		                    if (ivhNode.children[i].children[j].children && ivhNode.children[i].children[j].children.length) {
		                    	for (var k = 0; k < ivhNode.children[i].children[j].children.length; k++) {
		                    		if (ivhIsSelected) {
		                    			functions[ivhNode.children[i].children[j].children[k].id] = 1;
		                    		} else {
		                    			delete functions[ivhNode.children[i].children[j].children[k].id]
		                    		}
		                    	}
		                    }
		                } else {
		                    delete functions[ivhNode.children[i].children[j].id];
		                    if (ivhNode.children[i].children[j].children && ivhNode.children[i].children[j].children.length) {
		                    	for (var k = 0; k < ivhNode.children[i].children[j].children.length; k++) {
		                    		if (ivhIsSelected) {
		                    			functions[ivhNode.children[i].children[j].children[k].id] = 1;
		                    		} else {
		                    			delete functions[ivhNode.children[i].children[j].children[k].id]
		                    		}
		                    	}
		                    }
		                }
	            	}
            	}
            }
        } 
        $scope.treectr1 = Object.keys(functions).length;
    };
    
    $scope.saveManager = function() {
		var input = {
			id : $state.params.id,
			status: $scope.status,
			cardInfoLists: $scope.cardInfoList,
			roleIds: checkboxes.items,
			functionIds: Object.keys(functions),
			userName: $scope.addFrm.userName.$viewValue,
			name: $scope.addFrm.name.$viewValue,
		    mobile: $scope.addFrm.mobile.$viewValue,
		    email: $scope.addFrm.email.$viewValue
		};
		$scope.addFrm.userName.$dirty = true;
		$scope.addFrm.name.$dirty = true;
		$scope.addFrm.mobile.$dirty = true;
		if ($scope.addFrm.userName.$invalid || $scope.addFrm.name.$invalid || $scope.addFrm.mobile.$invalid) {
		    return false;
		}
		if($scope.checkuserName) {
			return false;
		}
		if (!$scope.cardInfoList.length) {
			alertInf.show('warning', '请您绑定卡！');
	  		alertInf.close(2000);
			return false;
		}
		if (!checkboxes.items.length) {
			alertInf.show('warning', '请选择角色权限！');
	  		alertInf.close(2000);
			return false;
		}
		if (!Object.keys(functions).length) {
			alertInf.show('warning', '请选择部门权限！');
	  		alertInf.close(2000);
			return false;
		}
		
    	$http.post('system/user/save.do', input,
        {
            responseType: 'json',
            cache: false
        }).success(function (result) {
            if (result.result && result.result == "success") {
                dialog.openDialog({
					title:"保存管理员",
					icon:'success',
                    close: {
                        callback:function ($scope, dialog3, button, config) {
                        	$state.go("ecss/system/user/toList");
                        }
                    },
					content:'<p class="successTip">恭喜您，Administrator!</p>\
				        		<p class="w300 fs14">\
				        			保存管理员成功，默认密码：111111\
				        		</p>\
				        		<p class="w300 fs14 mt10">\
				        			别忘了提示他及时登录并修改密码哦~\
				        		</p>',
				    buttons:[{
				    	name:"知道了",
				    	className:"btn-green",
				    	callback:function($scope, dialog3, button, config){
				    		$state.go("ecss/system/user/toList");
				    	}
				    }]
				})

            }

        });
    }
}]);