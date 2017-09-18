/**
 * 部门信息控制器
 * Created by  yangchun on 2016/6/14.
 */

app.add.controller('departmentCtr', ['$scope', '$state', '$sce', 'ngTableParams', '$http', function ($scope, $state, $sce, ngTableParams, $http) {
    $scope.$emit('menuChange', $state.current.url);

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
                console.info(error);
            });
        }
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
        console.info(error);
    });
}])
