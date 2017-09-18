
app.add.directive('mydatepicker', function ($timeout) {
    return {
        restrict: 'A',
        require:"ngModel",
        scope: {
           	minDate:"@"
        },
        link: function (scope, elem, attrs, ngModel) {
            elem.val(ngModel.$viewValue);
            function onpicking(dp){
            	var date = dp.cal.getNewDateStr();
            	scope.$apply(function(){
            		ngModel.$setViewValue(date);
            	});
            }

			function oncleared(dp){
				scope.$apply(function(){
					ngModel.$setViewValue('');
				});
			}

            elem.bind("click",function(){
                WdatePicker({
            		onpicking:onpicking,
					oncleared: oncleared,
                    minDate : attrs.mindate,
                    maxDate : attrs.maxdate
            	})
            })
        }
    };
});

app.add.directive('mytimepicker', function ($timeout) {
	return {
		restrict: 'A',
		require:"ngModel",
		scope: {
			minDate:"@"
		},
		link: function (scope, elem, attrs, ngModel) {
			elem.val(ngModel.$viewValue);
			function onpicking(dp){
				var date = dp.cal.getNewDateStr();
				scope.$apply(function(){
					ngModel.$setViewValue(date);
				});
			}
			
			elem.bind("click",function(){
				WdatePicker({
					dateFmt:'HH:mm:ss',
					onpicking:onpicking,
					minDate : attrs.mindate,
                    maxDate : attrs.maxdate
				})
			})
		}
	};
});