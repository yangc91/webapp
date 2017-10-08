/**
 * 页面的根节点处理器
 * Created by 马德成
 * @date 2016/6/6
 */
app.controller('rootCtr', ['$rootScope', '$scope', '$http', '$timeout', '$state', function ($rootScope, $scope, $http, $timeout, $state) {
    $scope.selected;
    //$scope.menus = menus;
    //$scope.menus = [{ 'text': "首页",'url': '/index'}];
    $scope.menus =[
        {
            "id" : "1",
            "text": "首页",
            "url": 'index',
        },
        { 'text': "系统管理",
            "child": [
                {
                    "id" : "t11",
                    "text": "人员管理",
                    "url": 'sys/user/list'
                },
                {
                    "id" : "t12",
                    "text": "角色管理",
                    "url": 'index12'
                },{
                    "id" : "t11",
                    "text": "系统日志",
                    "url": 'test'
                },{
                    "id" : "t11",
                    "text": "修改密码",
                    "url": 'test'
                }
            ]
        }
    ];
    $rootScope.user = {'name': "yc"};

    $scope.$on('menuChange', function(event, url) {

        $scope.url = url;
        var item;

        for(var i= $scope.menus.length - 1; i>= 0; i--){
            item = $scope.menus[i];

            if(!item.child && ('/' + item.url) == url) {
                $scope.selected = item;
                return ;
            }

            if(item.child) {
                for(var j = item.child.length - 1 ; j>=0 ; j--) {
                    if('/' + item.child[j].url == url) {
                        $scope.selected = item;
                        $scope.selected.childSelected = item.child[j];
                        return ;
                    }
                }
            }
        }
    });

    $scope.goIndex=function () {
        $state.go('/index');
    }

    //点击一级菜单
    $scope.clickMenu = function (item) {
        if (item.child) {
            $state.go('/' + item.child[0].url);
            return;
        }

        $state.go('/' + item.url);
    };

    //点击子菜单
    $scope.clickChildMenu = function (child, $event) {
        $event.stopPropagation();
        $state.go('/'+child.url);
    };
    
    $scope.adminLinkShow = false;
    $scope.toggleLink = function(){
    	$scope.adminLinkShow = true;
    }
    $scope.hoverOut = function(){
    	$scope.adminLinkShow = false;
    }

    /**
     * 退出
     * @param message
     */
    $scope.logout = function() {
        $http({
            url: base + '/public/logout', method: 'POST',
            //data: condition,
            //cache: false,
            headers: {"x-auth-token" : cookieObj.get("x-auth-token")},
            responseType: "json"
        })
        .success(function (result) {
            cookieObj.remove("x-auth-token");
            location.href = "./login.html";
        });
    }

}]);