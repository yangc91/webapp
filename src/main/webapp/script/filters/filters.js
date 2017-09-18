/**
 * 格式化字符串,例如:
 * 页面使用: {{"欢迎{name}给{content}留言"|format:{name:"马德成", content:"测试人员"}:'--'}}
 * controller使用: $filter('format')("欢迎{name}给{content}留言", {name:"马德成", content:"测试人员"}, '--');
 *
 */
angular.module('app.filter', [])
    .filter('format', function () {
        return function (src, data, defValue) {
            if (arguments.length == 0) return null;

            data = data || {};
            defValue = defValue || '';
            if (!src) return;

            return src.replace(/\{([\w\.]+)\}/g, function (m, ret) {
                if (ret.indexOf('.') != -1) {
                    var list = ret.split('\.'), dat = data;
                    for (var i = 0; i < list.length; i++) dat = dat[list[i]];
                    return dat || defValue;
                }

                return data[ret] || defValue;
            });
            
        };
    }).filter('parsehour', function(){ //毫秒值转小时
        return function(src) {
            if (!src || src == null) return '';
            var result = 0;
            if (src && src > 3600000) {
                result = parseInt(parseInt(src)/3600000) + '小时';
                src = src%3600000;
            }

            if (src && src >= 60000) {
                result = result + parseInt(parseInt(src) / 60000) + '分钟';
                src = src % 60000;
            }
            result  = result + Math.ceil(parseInt(src)/1000) + '秒';

            return result;
        }
    }).filter('formatNetTarget', function(){ //毫秒值转小时
    return function(src) {
        if (!src || src == null) return '';
        var indexBro = src.indexOf("browse");
        if(indexBro != -1) {
            src = src.substr(indexBro + 6, src.length);
            var array;
            if (src.indexOf("wifi") != -1) {
                array = src.split("wifi");
                src = '使用 wifi:' + array[1] + '访问 ' + array[0];
            } else if (src.indexOf("mobile") != -1) {
                array = src.split("mobile");
                src = '使用移动网络访问 ' + array[0];
            } else if (src.indexOf("unknown") != -1) {
                array = src.split("unknown");
                src = '使用网络访问 ' + array[0];
            }
        }
        return src;
    }
});
