/**
 * 系统设置,修改密码
 * Created by mdc on 2016/6/12.
 */
app.add.controller('modifyPsdCtr', ['$scope', '$state', '$window', '$http', '$timeout', 'dialog',function ($scope, $state, $window, $http, $timeout, dialog) {
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
    
    $scope.clear= function () {
    	$scope.addFrm.password.$invalid=true;
    	$scope.addFrm.newPasswd.$invalid=true;
    	$scope.addFrm.verifyPasswd.$invalid=true;
    };
    
    $scope.keyup = function(frm, formCtr, other){
 	    $scope.addFrm[frm].$setValidity('allsame', !formCtr && !(formCtr == other));
    };
    
    function reloadRoute() {
    	$window.location.reload();
    };
    
    $scope.save= function () {
    	$scope.addFrm.password.$dirty=true;
    	$scope.addFrm.newPasswd.$dirty=true;
    	$scope.addFrm.verifyPasswd.$dirty=true;
    	
    	if($scope.addFrm.$invalid) {
	   		return;
	   	}
    	$http({
             url : 'system/modifyPassword.do',
             method : 'POST',
             params : {oldPasswd:$scope.addFrm.password.$viewValue,newPasswd:$scope.addFrm.newPasswd.$viewValue,verifyPasswd:$scope.addFrm.verifyPasswd.$viewValue},
             cache:false,
             responseType : "json"
         })
         .success(function (result) {
        	 if(result.result == 'success'){
                 dialog.openDialog({
                     title:"修改密码",
                     icon:'success',
                     close:{
                         callback:function ($scope, dialog3, button, config) {
                             reloadRoute();
                         }
                     },
                     content:'<p class="successTip">恭喜您，Administrator!</p>\
				        		<p class="w300 fs14">\
				        			修改密码成功\
				        		</p>',
                     buttons:[{
                         name:"知道了",
                         className:"btn-green",
                         callback:function($scope, dialog3, button, config){
                             reloadRoute();
                         }
                     }]
                 })
        		 /*alertInf.show('success','修改密码成功');
        		 alertInf.close();*/
        	 }else{
        		 alertInf.show('warning',result.result);
        		 alertInf.close();
        	 }
        	 
         })
         .error(function (result) {
             console.info(error);
         });
    };
}]);


app.add.directive('pwCheck', [function () {  
    return {  
      require: "ngModel",  
      link: function(scope, elem, attrs, ctrl) {  
          var otherInput = elem.inheritedData("$formController")[attrs.pwCheck];  

          ctrl.$parsers.push(function(value) {  
              if(value === otherInput.$viewValue) {  
                  ctrl.$setValidity("repeat", true);  
                  return value;  
              }  
              ctrl.$setValidity("repeat", false);  
          });  

          otherInput.$parsers.push(function(value) {  
              ctrl.$setValidity("repeat", value === ctrl.$viewValue);  
              return value;  
          });  
      }  
  };  
}]);  