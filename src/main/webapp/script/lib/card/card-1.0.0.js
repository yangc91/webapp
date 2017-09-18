/**
 * 信大捷安写卡控件的js封装类
 * @author 马德成
 * @date 2015-02-21
 *
 * 说明:
 *   1.该文件被引入页面后,会自动初始化,且仅初始化一次
 *   2.初始化时仅检测安全控件是否安装,以及版本号是否最新
 *   3.该组件仅有一个顶级对象--Card,该对象也仅有一个方法--ready
 *   4.大多数方法都支持返回值和回调函数的方式,即回调的参数和返回值的类型一致
 *   5.在回调函数中都会有success属性,当success=false时,对象会有code和message属性
 *   6.所调用的函数全部都经过异常处理,也就是说当你不需要错误消息和错误码时完全可以忽略这些信息
 *
 * 使用实例:
 * 1. 检测是否安装读卡控件,以及获取错误信息
 *
 * 1). 在回调函数中处理错误信息
 * Card.ready(function(data){
 * 	if(!data.success) {
 *    console.log('检测安全控件错误,错误码:' + data.code + ', 错误信息:' + data.message);
 *  }
 * });
 *
 * 2). 从返回值中处理错误信息
 * var plugin = Card.ready();
 * if(!plugin.success) {
 *    console.log('检测安全控件错误,错误码:' + plugin.code + ', 错误信息:' + plugin.message);
 * }
 *
 * 2. 读取安全卡
 *
 * 1). 在回调函数中读取安全卡
 *  Card.ready(function(data){
 * 	if(data.success) { //初始化成功
 *    var cards = this.readUserCard();
 *  }
 * });
 *
 * 2). 从返回值中读取安全卡
 * var plugin = Card.ready();
 * if(plugin.success) { //初始化成功
 *    var cards = plugin.readUserCard();
 *  }
 *
 *  注:与readUserCard相应的函数有readUserTFCard、readUserUSBKeyCard、
 *  readAdminCard、readAdminTFCard、readAdminUSBKeyCard,这些函数都是不需要参数的
 *
 *  3.安全卡相关操作
 *  var cards = plugin.readUserCard(); //获取到的是一个安全卡的集合(实际上是一个伪数组,下标从0开始)
 *
 *  1). 获取安全卡的个数
 *  var length = cards.length; //读取到的安全卡个数
 *
 *  2). 获取指定安全卡的卡号
 *  var cardId = cards[0].getCardId();//获取第一张安全卡的卡号,第二张卡为cards[1],以此类推
 *
 *  3). 遍历安全卡
 *  cards.each(function(i, n){
 *  	console.log('获取第' + (i+1) + '张卡, 卡号是:' + this.getCardId());
 *  	//或者可以这么写,n和this指向的是同一个对象
 *  	//console.log('获取第' + (i+1) + '张卡, 卡号是:' + n.getCardId());
 *  });
 *
 *  4.导入证书到浏览器
 *  var card = cards[0]; //取得第一张卡
 *  card.importCert(4, 1, function(data){ //导入4号容器,算法是1
 *  	if(data.success){
 *  		console.log('导入成功');
 *  		return ;
 *  	}
 *  
 *  	console.log('导入失败,错误码:' + data.code + ', 错误信息:' + data.message);
 *  });
 *
 *  以上代码同样可以使用返回值处理,代码如下
 *  var card = cards[0]; //取得第一张卡
 *  var ret = card.importCert(4, 1);
 *  if(ret.success){
 *  	console.log('导入成功');
 *  } else {
 *  	console.log('导入失败,错误码:' + ret.code + ', 错误信息:' + ret.message);
 *  }
 *  注:通过card对象可以取得卡相关的操作,比如
 *
 *  5.拔卡事件监听
 *
 *  1). 直接通过卡对象操作
 *  var card = cards[0];
 *  card.onpullcard(function(){
 *  	console.log('安全卡已被拔出,卡号是:' + this.getCardId());
 *  });
 *
 *  2). 直接根据卡号监听拔卡事件
 *  plugin.onpullcard('cardid', function(){
 *  	console.log('安全卡已被拔出');
 *  });
 *
 *  3).根据句柄监听拔卡事件
 *  plugin.onpullhandle('cardid', function(){
 *  	console.log('安全卡已被拔出');
 *  });
 *
 *  6.为了支持根据卡号直接获取卡的相关操作,这里提供了卡的包装器
 *  var kit = plugin.cardKit('cardid'); //这里的kit和上面的card其实是同一种对象
 *  kit.checkPin('11111', function(data){//校验PIN码
 *  	if(data.success) {
 *  		console.log('PIN码正确');
 *  		return;
 *  	}
 *  	
 *  	if(data.isLock){
 *  		console.log('安全卡被锁死');
 *  		return;
 *  	}
 *  	
 *  	console.log('校验PIN码失败,错误码:' + data.code + ', 错误信息:' + data.message);
 *  });
 *
 *  同样可以把回调函数改成返回值形式,例如
 *  var ret = kit.checkPin('11111');
 *  if(ret.success) {
 *  	console.log('PIN码正确');
 *  } else if(data.isLock){
 *  	console.log('安全卡被锁死');
 *  } else {
 *  	console.log('校验PIN码失败,错误码:' + data.code + ', 错误信息:' + data.message);
 *  }
 *
 */
var Card = (function (){

    //常量定义
    var Const = {
            //控件版本号
            version: '3.0.2.11',

            //初始化控件常量定义
            readyConst : {
                '0':'未安装安全控件',
                '3':'安全控件版本不正确',
                //控件ID
                pluginId:'mdc-card-pluginXdja',
                getEmbed:function (){return '<embed width="0" style="margin:0;padding:0;position: fixed; filter: alpha(opacity=0);" height="0" type="application/NPCardCert" id="' + this.pluginId + '" />'}
            },

            //错误码描述定义
            errorDesc : {
                '0':'成功',				'-1':'卡未插入',		'-2':'参数错误',				 '-3':'未插入管理卡',
                '-4':'卡锁死',			'-5':'口令错误',		'-6':'卡内产生公私钥对',		 '-7':'新建容器失败',
                '-8':'容器不存在',		'-9':'绑定用户卡失败',	'-10':'文件不存在',			'-11':'写文件失败',
                '-12':'证书格式错误',		'-13':'导入证书失败',	'-14':'BASE64解码失败',		'-15':'解析pfx失败',
                '-16':'导入pfx失败',		'-17':'读卡文件失败',	'-18':'导入密钥失败',			'-26':'产生随机数失败',
                '-28':'获取卡激活状态失',	'-19':'SM4运算失败',	'-20':'重置PIN码失败',		'-21':'创建文件失败',
                '-22':'SM3运算失败',		'-23':'SM1运算失败',	'-24':'PSA私钥运算失败',		'-25':'获取设备信息失败',
                '-61':'解析网关证书失败',	'-62':'签名失败',		'-63':'取消签名失败','		 -99':'内部错误',
                '-101':'内存申请失败',	'-203':'容器不存在',	'-204':'容器证书内容错误',    '-100':'不支持此功能',
                '-27':'激活卡失败',		'-29':'未激活'
            },

            //应用中的卡类型和写卡控件中的卡类型对应关系
            cardMapper : {
                '1' : 0, //TF卡
                '2' : 1, //USBKey
                '-1':-1//不区分
            },

            //写卡控件中，卡用途
            cardUsage : {
                X_CARD_USAGE_ADMIN : 0, //0-管理卡
                X_CARD_USAGE_USER : 1, //1-用户卡
                X_CARD_USAGE_All : -1 //所有
            }
        },

    //存储初始化后的控件对象和ready操作
        info = {};

    /**
     * 比较版本号大小
     * @author 马德成
     * @date 2015-02-21
     * @param currentVersion 当前版本号
     * @param version 需要的最低版本号
     * @return 0-相同；1-currentVersion小于version；2-currentVersion大于version
     */
    function compareVersion(currentVersion, version) {
        if(currentVersion == version) return 0;

        var currentVersionArray = currentVersion.split('.');
        var versionArray = version.split('.');
        var len1 = currentVersionArray.length;
        var len2 = versionArray.length;

        if (len1 == len2){
            for (var i = 0; i < len1; i++){
                if (currentVersionArray[i] - versionArray[i] > 0){
                    return 2;
                }

                if (currentVersionArray[i] - versionArray[i] < 0){
                    return 1;
                }
            }
        }

        if (len1 < len2) return 1;
        if (len1 > len2) return 2;
        return 0;
    }

    /**
     * 从异常对象中获取错误码
     * 在以IE为内核的浏览器，在异常中捕获ex.number参数。
     * 以支持NPAPI的浏览器，在异常中捕获ex。但firefox和chrome浏览器捕获的信息有一些不同
     * 示例：
     * 假设错误码为-100。
     * 在IE浏览器中捕获异常ex.number，得到信息为-100;
     * 在firefox浏览器中捕获异常 ex，得到信息-100
     * 在chrome浏览器中捕获异常 ex，得到信息 Error:-100，即”Error:”后面跟着错误码。
     */
    function getExCode(ex){
        //处理IE
        if(typeof ex.number != 'undefined') return ex.number-0;

        //处理chrome
        if(typeof ex.message!= 'undefined') return ex.message-0;

        //处理firefox
        return ex-0;
    }

    /**
     * 颜色的16进制形式,转换为rgb形式
     */
    function hexToRgb(hex) {
        if (!hex || !{7:true, 4:true}[hex.length] || !/^#/.test(hex)){
            return ;
        }

        if (hex.length == 4) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        var colors = [];

        for(var i=1, j=0; i<7; i+=2) colors[j++] = ('0x' + hex.slice(i, i+2)) - 0;
        return colors;
    }

    //只是一个空函数的简写形式
    var noop = function(){};

    //初始化插件信息
    var plugin = (function(d){
        var cardWrap = new CardWrap();
        cardWrap.success = false;
        var cardCertObj, activeX = false;

        if (!!window.ActiveXObject || 'ActiveXObject' in window) {
            activeX = true;
            try {
                cardCertObj = new ActiveXObject("CardCert.WriteCard");
            } catch (e) {
                return {error:{success:false, code:0, message:Const.readyConst[0]}, cardWrap:cardWrap, ex:e};
            }
        } else {
            d.write(Const.readyConst.getEmbed());
            var cardCertObj = d.getElementById(Const.readyConst.pluginId);

            if(!cardCertObj.Test) {
                return {error:{success:false, code:0, message:Const.readyConst[0]}, cardWrap:cardWrap};
            }
        }

        if(compareVersion(cardCertObj.Test(), Const.version) == 1) {
            return {error:{success:false, code:3, message:Const.readyConst[3]}, cardWrap:cardWrap};
        }

        cardWrap.success = true;
        return {cardWrap:cardWrap, card : function(){return cardCertObj;}, activeX:activeX};
    })(document);

    /**
     * 初始化卡控件,一般只需要初始化一次即可
     * 1.检测是否安装控件
     * 2.卡控件版本号是否一致
     * @author 马德成
     * @date 2015-02-21
     * @param callback 类型 function(data) -- 可选
     * 执行成功data={success:true}
     * 执行失败data={success:false, code:0, message:'错误消息'}
     * @return 返回CardWrap对象
     */
        //初始化函数,此函数只会被执行一次
    info.ready= function (callback){
        if(typeof callback != 'function') callback = noop;

        if(plugin.error) {
            callback.call(null, plugin.error);
            return plugin.error;
        }

        callback.call(plugin.cardWrap, {success:true});
        return plugin.cardWrap;
    };

    function CertKit(cardNo){
        //获取卡号
        this.getCardId = function(){return cardNo;};
    }

    /**
     * 获取安全卡信息
     * @author 马德成
     * @param callback 类型 function(data) 回调函数 -可选
     * 当执行成功时data={success:true, type:1, usage:1, container:[0,3,4]}
     * type:卡类型 0-TF卡 1-USB Key
     * usage:卡用途 0-管理卡 1-用户卡
     * container:有证书的容器列表
     * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
     */
    CertKit.prototype.getCardInfo = function(callback){
        if(typeof callback != 'function') callback = noop;
        var ret;

        try {
            var info = plugin.card().GetCardInfo(this.getCardId()).split('#');
            ret = {type:info[0], usage:info[1], container:info.length == 3? info[2]:[]};
        } catch (e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex: e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 生成公私钥对
     * @author 马德成
     * @param password 卡用户口令
     * @param containerid 容器编号
     * @param alg 算法：0-RSA，1-SM2
     * @param certusage 算法用途：0-交换，1-签名
     * @param keybits bits 位数：RSA-一般为1024，SM2-一般为256
     * @param callback 回调函数 类型 function(data) 回调函数 -可选
     * 当执行成功时data={success:true, publicKey:'公钥：RSA-Base64编码的M，SM2-B64编码的x=...y=..'}
     * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
     */
    CertKit.prototype.genKeypair = function(password, containerid, alg, certusage, keybits, callback){
        if(typeof callback != 'function') callback = noop;
        var ret;

        try {
            var publicKey = plugin.card().GenKeypair(this.getCardId(), password, containerid, alg, certusage, keybits);
            ret = {success:true, publicKey:publicKey};
        } catch (e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex: e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 生成0号容器,交换证书,RSA算法的公私钥对
     * @param password 卡用户口令
     * @param containerid 容器编号(可选,默认值为0)
     * @param certusage 算法用途：0-交换，1-签名 (可选,默认值为0)
     * @param callback 回调函数 类型 function(data) 回调函数 -可选
     * 当执行成功时data={success:true, publicKey:'公钥：RSA-Base64编码的M，SM2-B64编码的x=...y=..'}
     * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
     */
    CertKit.prototype.genKeypairRSA = function(password, containerid, certusage, callback) {
        if(typeof containerid == 'function'){
            callback = containerid;
            containerid = null;
        } else if(typeof certusage == 'function'){
            callback = certusage;
            certusage = null;
        }

        return this.genKeypair(password, containerid||0, 0, certusage||0, 1024, callback);
    };

    /**
     * 生成0号容器,交换证书,RSA算法的公私钥对
     * @param password 卡用户口令
     * @param containerid 容器编号(可选,默认值为0)
     * @param certusage 算法用途：0-交换，1-签名 (可选,默认值为0)
     * @param callback 回调函数 类型 function(data) 回调函数 -可选
     * 当执行成功时data={success:true, publicKey:'公钥：RSA-Base64编码的M，SM2-B64编码的x=...y=..'}
     * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
     */
    CertKit.prototype.genKeypairSM2 = function(password, containerid, certusage, callback) {
        if(typeof containerid == 'function'){
            callback = containerid;
            containerid = null;
        } else if(typeof certusage == 'function'){
            callback = certusage;
            certusage = null;
        }
        return this.genKeypair(password, containerid || 0, 1, certusage || 0, 256, callback);
    };

    /**
     * 向卡容器写入证书
     * @param password 卡用户口令
     * @param containerid 容器编号
     * @param certusage 算法用途：0-交换，1-签名
     * @param cert 证书 十六进制编码
     * @param callback 回调函数 类型 function(data) 回调函数 -可选
     * 当执行成功时data={success:true}
     * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
     */
    CertKit.prototype.writeCert = function(password, containerid, certusage, cert, callback){
        if(typeof callback != 'function') callback = noop;
        var ret;

        try {
            plugin.card().WriteCert(this.getCardId(), password, containerid, certusage, cert);
            ret = {success:true};
        } catch (e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex: e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 向卡容器写入证书
     * @param password 卡用户口令
     * @param containerid 容器编号 (可选,默认:0)
     * @param certusage 算法用途：0-交换，1-签名 (可选,默认:0)
     * @param cert 证书 十六进制编码
     * @param callback 回调函数 类型 function(data) 回调函数 -可选
     * 当执行成功时data={success:true}
     * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
     */
    CertKit.prototype.writeCertEx = function(password, containerid, certusage, cert, callback){
        var _cert = cert;
        if(typeof containerid == 'string'){
            _cert = containerid;
            containerid = null;
            if(typeof certusage == 'function'){
                callback = certusage;
                certusage = null;
            }
        } else if(typeof certusage == 'string'){
            _cert = certusage;
            if(typeof cert == 'function') callback = cert;
            certusage = null;
            cert = null;
        }

        return this.writeCert(password, containerid||0, certusage||0, _cert, callback);
    };

    /**
     * 写网关单证书（公钥）
     * @param password 卡用户口令
     * @param cert 证书 十六进制编码
     * @param callback 回调函数 类型 function(data) 回调函数 -可选
     * 当执行成功时data={success:true}
     * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
     */
    CertKit.prototype.writeGateCert = function(password, cert, callback){
        if(typeof callback != 'function') callback = noop;
        var ret;

        try {
            plugin.card().WriteGateCert(this.getCardId(), password, cert);
            ret = {success:true};
        }catch (e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex: e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 写网关双证书（公钥）
     * @param password 卡用户口令
     * @param cert 证书 十六进制编码
     * @param cert2 监管证书：pem编码 十六进制编码
     * @param callback 回调函数 类型 function(data) 回调函数 -可选
     * 当执行成功时data={success:true}
     * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
     */
    CertKit.prototype.writeGateCertEx = function(password, cert, cert2, callback){
        if(typeof callback != 'function') callback = noop;
        var ret;

        try {
            plugin.card().WriteGateCertEx(this.getCardId(), password, cert, cert2);
            ret = {success:true};
        }catch (e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex: e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 读用户交换证书
     * @author 马德成
     * @date 2015-02-21
     * @param containerId 类型 int 容器编号 -必选
     * @param callback 类型 function(data) 获取证书的回调 -可选
     * 当执行成功时data={success:true, cert:cert}
     * 当执行失败时data={success:false, code:1, message:'错误信息'}
     */
    CertKit.prototype.getCert = function (containerId, callback){
        if(isNaN(containerId)) throw new Error('containerId必须为int类型参数');
        if(typeof callback != 'function') callback = noop;

        var ret;
        try {
            var cert = plugin.card().GetCert(this.getCardId(), containerId);
            ret = {success:true, cert:cert};
        } catch (e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex:e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 读取用户证书
     * @param containerId 类型 int 容器编号 -必选
     * @param certType 类型 int 证书类型 0:交换证书 1:签名证书 -必选
     * @param callback 类型 function(data) 获取证书的回调 -可选
     * 当执行成功时data={success:true, cert:cert}
     * 当执行失败时data={success:false, code:1, message:'错误信息'}
     */
    CertKit.prototype.getCertEx = function(containerId, certType, callback) {
        if(isNaN(containerId)) throw new Error('containerId必须为int类型参数');
        if(certType !=0 && certType != 1) throw new Error('certType必须取值为0、1');
        if(typeof callback != 'function') callback = noop;
        var ret ;

        try {
            var cert = plugin.card().GetCertEx(this.getCardId(), containerId, certType);
            ret = {success:true, cert:cert};
        } catch (e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex:e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * Cos操作的包装器
     * @author 马德成
     * @date 2015-02-21
     */
    function CosWrap(handle){
        return {

            /**
             * 获取Cos版本
             * @author 马德成
             * @date 2015-02-21
             * @param callback 类型 function(data) 获取证书的回调 -可选
             * 当执行成功时data={success:true, version:'3.03.1'}
             * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
             */
            getCosVer:function (callback){
                if(typeof callback != 'function') callback = noop;
                var version = null, ret;

                try {
                    version = plugin.card().GetCosVer(handle);
                    ret = {success:true, version:version};

                    return version;
                } catch (e) {
                    var code = getExCode(e);
                    ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex:e};
                }

                callback.call(this, ret);
                return version;
            },

            /**
             * 卡句柄
             */
            handle:handle
        };
    }

    /**
     * 获取该卡的句柄
     * @author 马德成
     * @date 2015-02-21
     * @param callback 类型 function(data) 获取证书的回调 -可选
     * 当执行成功时data={success:true, handle:'00101010'}
     * 当执行失败时data={success:false, code:1, message:'错误信息', ex:异常对象}
     */
    CertKit.prototype.getHandle = function(callback) {
        if(typeof callback != 'function') callback = noop;

        var ret, handle;
        try {
            handle = plugin.card().GetCardHandle(this.getCardId());
            ret = {success:true, handle:handle};
        } catch (e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex:e};
        }

        callback.call(handle?CosWrap(handle):this, ret);
        return ret;
    };

    /**
     * 验证用户口令
     * @author 马德成
     * @date 2015-02-21
     * @param pin 类型 String PIN码 -必选
     * @param callback 类型 function(data) 验证用户口令的回调 -可选
     * 当执行成功时data={success:true}
     * 当执行失败时data={success:false, code:1} code:PIN码错误返回重试次数（4 3 2 1）
     */
    CertKit.prototype.checkPin = function (pin, callback){
        if(!pin) throw new Error('pin为必须参数');
        if(typeof callback != 'function') callback = noop;

        var ret;
        var lockError = {'-10':true, '-16':true, '-4':true, '-5':true};

        try {
            var time = plugin.card().SafePin(this.getCardId(), pin, 0x11)-0;
            ret = time?{success:false, code:time, message: Const.errorDesc[time] || '', isLock:!!lockError[time]} : {success:true, isLock:false};
        } catch(e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message: Const.errorDesc[code] || '', isLock:!!lockError[code], ex:e};
        }

        callback.call(this, ret);

        return ret;
    };

    /**
     * 修改pin码,只有当在卡没被锁死时,才能有用
     * @author 马德成
     * @date 2015-02-21
     * @param oldPin 类型 String 旧PIN码 -必选
     * @param newPin 类型 String 新PIN码 -必选
     * @param callback 类型 function(data) 验证用户口令的回调 -可选
     * 当执行成功时data={success:true}
     * 当执行失败时data={success:false, time:1} time:PIN码错误返回重试次数（4 3 2 1）
     */
    CertKit.prototype.safeChangePin = function (oldPin, newPin, callback){
        if(!oldPin) throw new Error('oldPin为必须参数');
        if(!newPin) throw new Error('newPin为必须参数');
        if(typeof callback != 'function') callback = noop;

        var ret;
        var lockError = {'-10':true, '-16':true, '-4':true, '-5':true};
        try {
            var code = plugin.card().SafeChangePin(this.getCardId(), oldPin, newPin, 0x11)-0;
            ret = code?{success:false, code:code, message: Const.errorDesc[code] || '', isLock:!!lockError[code]} : {success:true, isLock:false};
        } catch(e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message: Const.errorDesc[code] || '', isLock:!!lockError[code], ex:e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 导入容器证书到浏览器
     * @author 马德成
     * @date 2015-02-21
     * @param containerId 类型 int 容器编号 -必选
     * @param certType 类型 int 证书类型 0:交换证书   1:签名证书 -必选
     * @param callback 类型 function(data) 获取证书的回调 -可选
     * 当执行成功时data={success:true, cert:cert}
     * 当执行失败时data={success:false, code:1, message:'错误信息'}
     */
    CertKit.prototype.importCert = function (containerId, certType, callback){
        if(isNaN(containerId)) throw new Error('containerId必须为int类型参数');
        if(certType !=0 && certType != 1) throw new Error('certType必须取值为0、1');
        if(typeof callback != 'function') callback = noop;

        var ret;
        try {
            plugin.card().ImportKeyCertEx(this.getCardId(), "111111", 0x11, containerId, certType);
            ret = {success:true};
        } catch(e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex:e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 设定浏览器记录当前卡ID。当关闭浏览器后则失效
     * @author 马德成
     * @date 2015-02-21
     * @param callback 类型 function(data) 获取证书的回调 -可选
     * 当执行成功时data={success:true}
     * 当执行失败时data={success:false, code:1, message:'错误信息'}
     */
    CertKit.prototype.setCardId = function (callback){
        if(typeof callback != 'function') callback = noop;

        var ret;
        try {
            plugin.card().SetCardId(this.getCardId());
            ret = {success:true};
        } catch(e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex:e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 获取PIN码剩余次数
     * @param callback 回调函数 function(data)
     * 当执行成功时data={success:true, count:5} count:剩余次数
     * 当执行失败时data={success:false, code:1, message:'错误信息'}
     */
    CertKit.prototype.getPinTryCount = function(callback) {
        if(typeof callback != 'function') callback = noop;
        var returns;

        var lockError = {'-10':true, '-16':true, '-4':true, '-5':true};
        try{
            var ret = plugin.card().GetPinTryCount(this.getCardId(), 0x11)-0;
            returns = ret>0?{success:true, code:ret, isLock:false}:{success:false, code:ret, message:Const.errorDesc[ret]||'未知错误', isLock:!!lockError[ret]};
        } catch (e) {
            var code = getExCode(e);
            returns = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', isLock:!!lockError[code], ex:e};
        }

        callback.call(this, returns);
        return returns;
    };

    /**
     * 根据解锁码,解锁卡并修改PIN码,当卡被锁死时可以被解锁
     * @param unlockCode 解锁码
     * @param newPin 新PIN码
     * @param callback function(data) 执行结果的回调函数
     */
    CertKit.prototype.unlockCodePin = function(unlockCode, newPin, callback){
        if(typeof callback != 'function') callback = noop;
        if(plugin.error) {callback.call(this, plugin.error); return plugin.error;}
        var ret;

        try{
            var code = plugin.card().ReloadPIN(this.getCardId(), unlockCode, 0x11, newPin) - 0;
            ret = code == 0?{success:true} : {success:false, code: code, message: Const.errorDesc[code]||'未知错误'};
        } catch (e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex:e};
        }

        callback.call(this, ret);
        return ret;
    };

    /**
     * 当拔卡时,执行的操作
     * @author 马德成
     * @date 2015-02-21
     * @param callback 类型 function()当拔卡时执行的回调
     */
    CertKit.prototype.onpullcard = function(callback){
        if(typeof callback != 'function') callback = noop;

        if(plugin.error) {
            callback.call(this);
            return null;
        }

        var handle, ret = {stop:noop}, error = false;

        try {
            if ((handle = plugin.card().GetCardHandle(this.getCardId())) == -1) error = true;
        } catch (e) {
            error = true;
        }

        if(error){
            callback.call(this, ret);
            return ret;
        }

        var timer, fn = function(){
            try {
                if(!plugin.card().GetCosVer(handle)) error = true; //没有获取到CosVer
            } catch (e) {
                error = true;
            }

            if(error){
                clearInterval(timer);
                callback.call(this);
            }
        };

        timer = setInterval(fn, 800);
        fn();

        return {
            //停止检测
            stop:function(){if(timer) clearInterval(timer);}
        };
    };

    /**
     * 对卡号操作的包装器
     * @author 马德成
     * @date 2015-02-21
     */
    function CertWrap(cardNos){
        for(var i = 0; i < cardNos.length; i++ ) {
            this[i] = new CertKit(cardNos[i]);
        }

        this.length = cardNos.length;
    }

    /**
     * 遍历卡号
     * @author 马德成
     * @date 2015-02-21
     * @param callback 类型 function(index, cardId)
     */
    CertWrap.prototype.each = function (callback){
        if(typeof callback == 'function') {
            for (var i = 0; i < this.length; i++) {
                callback.call(this[i], i, this[i]);
            }
        }

        return this;
    };

    /**
     * 读取卡函数
     * @author 马德成
     * @date 2015-02-21
     * @param cardType 卡类型 1:TF卡,2:USBKey,其他:不区分 -可选(默认:-1)
     * @param cardUsage 用户类型 --0-管理卡,1-用户卡 -1:所有
     */
    function readCard(cardType, cardUsage){
        if(plugin.error) return new CertWrap([]);
        var xCardType = -1;

        if(cardType == 1 || cardType == 2) {
            xCardType = Const.cardMapper[cardType];
        }

        var cardNos = plugin.card().GetAllCards(xCardType, cardUsage);
        cardNos = cardNos? cardNos.split("#") : [];

        return new CertWrap(cardNos);
    }

    /**
     * 对安全卡操作的包装器
     * @author 马德成
     * @date 2015-02-21
     */
    function CardWrap(){}

    /**
     * 当拔卡时,执行的操作
     * @author 马德成
     * @date 2015-02-21
     * @param cardId 类型 string 卡号
     * @param callback 类型 function()当拔卡时执行的回调
     */
    CardWrap.prototype.onpullcard = function(cardId, callback){
        if(typeof callback != 'function') callback = noop;
        if(!cardId) throw new Error('cardId为必须参数');

        if(plugin.error) {
            callback.call(null);
            return null;
        }

        var handle, ret = {stop:noop}, error = false;

        try {
            if ((handle = plugin.card().GetCardHandle(cardId)) == -1) error = true;
        } catch (e) {
            error = true;
        }

        if(error){
            callback.call(this, ret);
            return ret;
        }

        var timer, fn = function(){
            try {
                if(!plugin.card().GetCosVer(handle)) error = true; //没有获取到CosVer
            } catch (e) {
                error = true;
            }

            if(error){
                clearInterval(timer);
                callback.call(this);
            }
        };

        timer = setInterval(fn, 800);
        fn();

        return {
            //停止检测
            stop:function(){if(timer) clearInterval(timer);}
        };
    };

    /**
     * 渲染一个安全输入框
     * @param options 配置项
     * 如果options是一个string类型(输入框id),则直接返回输入框对象
     * 否则options应该是一个对象,其中必须参数为
     */
    CardWrap.prototype.safeInput = function(options){
        var addMethod = function (obj) {
            //获取文本
            obj.val = function(){return obj.getText();};
            //启用控件
            obj.enable = function(){obj.EnableEdit(1);};
            //禁用控件
            obj.disable = function(){obj.EnableEdit(0);};
            //清空内容
            obj.empty = function(){obj.ClearEdit();};
            obj.color = [0, 0, 0];
            obj.bgcolor = [255, 255, 255];

            //设置背景色
            obj.setBgColor = function(hexColor){
                var rgb = hexToRgb(hexColor);
                if(!rgb) return ;
                var nw = obj.color.concat(rgb);
                obj.SetColor(nw[0], nw[1], nw[2], nw[3], nw[4], nw[5]);
                obj.bgcolor = rgb;
            };

            //设置字体色
            obj.setColor = function(hexColor){
                var rgb = hexToRgb(hexColor);
                if(!rgb) return ;
                var nw = rgb.concat(obj.bgcolor);
                obj.SetColor(nw[0], nw[1], nw[2], nw[3], nw[4], nw[5]);
                obj.color = rgb;
            };

            return obj;
        };

        if(typeof options == 'string') {
            var objSrc = document.getElementById(options);
            if(objSrc) return addMethod(objSrc);
            return objSrc;
        }

        if(!options) return null;
        options = options||{};
        if(typeof options.error != 'function') options.error = noop;

        if(plugin.error) {
            options.error.call(options, plugin.error);
            return null;
        }

        if(!plugin.activeX){//不支持ActiveXObject控件
            options.error.call(options, {code:-100, message:Const.errorDesc[-100]});
            return null;
        }

        //设置默认值
        options.width = options.width|| 150;
        options.height = options.height|| 20;
        options.render = options.render || document.body;
        options.id = options.id || ('mdc-object-' + Math.random()).replace('0.', '');
        options['class'] = options.className; //同时支持className属性和class(class为关键字,使用时要加'')

        if(typeof options.render == 'string') {
            options.render = document.getElementById(options.render);
        }
        if(!options.render) return null;

        var exist = true;
        var obj = document.getElementById(options.id);
        if(!obj) { obj = document.createElement("object");  exist = false; }
        obj.setAttribute('classid', 'CLSID:3F6D7581-6684-4113-A9BE-CD0DB641EC05');

        //设置内部参数
        var params;
        if(typeof options.params == 'function') {
            params = options.params.call(obj, obj);

        } else if(typeof options.params == 'object') {
            params = options.params;
        }

        if(params) {
            var param;
            for(var it in params) {
                param = document.createElement('param');
                param.setAttribute('name', it);
                param.setAttribute('value', params[it]);
                obj.appendChild(param);
            }
        }
        // end 设置内部参数

        var attrs = {classid:true, render:true, error:true, params:true};

        //设置属性和事件
        if (document.addEventListener) {
            for(var it in options){
                if(!attrs[it] && options[it]){
                    if(/^on\w+/i.test(it)){
                        if(typeof options[it] == 'function') obj.addEventListener(it.replace(/^on/i,''), options[it], false);
                    } else {
                        obj.setAttribute(it, options[it]);
                    }
                }
            }
        } else if (document.attachEvent)  {
            for(var it in options && options[it]){
                if(!attrs[it]){
                    if(/^on\w+/i.test(it)){
                        if(typeof options[it] == 'function') obj.attachEvent(it, options[it]);
                    } else {
                        obj.setAttribute(it, options[it]);
                    }
                }
            }
        }

        //end 设置属性和事件

        if(!exist) options.render.appendChild(obj);

        obj.id = options.id;
        return addMethod(obj);
    };

    /**
     * 当拔卡时,执行的操作
     * @author 马德成
     * @date 2015-02-21
     * @param handle 类型 string 卡句柄
     * @param callback 类型 function()当拔卡时执行的毁掉
     */
    CardWrap.prototype.onpullhandle = function(handle, callback){
        if(!handle) return null;
        if(typeof callback != 'function') callback = noop;

        //没有安装读卡控件
        if(plugin.error){
            callback.call(this);
            return null;
        }

        var timer, error = false, fn = function() {
            try {
                if(!plugin.card().GetCosVer(handle)) error = true; //没有获取到CosVer
            } catch (e) {
                error = true;
            }

            if(error){
                clearInterval(timer);
                callback.call(this);
            }
        };

        timer = setInterval(fn, 800);
        fn();

        return {
            //停止检测
            stop:function(){clearInterval(timer);}
        };
    };

    /**
     * 读取所有用户卡,包括TF卡和USB Key
     * @author 马德成
     * @date 2015-02-21
     */
    CardWrap.prototype.readUserCard = function (){
        return readCard.call(this, '-1', Const.cardUsage.X_CARD_USAGE_USER);
    };

    /**
     * 读取用户TF卡
     * @author 马德成
     * @date 2015-02-21
     */
    CardWrap.prototype.readUserTFCard = function (){
        return readCard.call(this, '1', Const.cardUsage.X_CARD_USAGE_USER);
    };

    /**
     * 读取用户USB Key
     * @author 马德成
     * @date 2015-02-21
     */
    CardWrap.prototype.readUserUSBKeyCard = function (){
        return readCard.call(this, '2', Const.cardUsage.X_CARD_USAGE_USER);
    };

    /**
     * 读取管理员卡,包括TF卡和USB Key
     * @author 马德成
     * @date 2015-02-21
     */
    CardWrap.prototype.readAdminCard = function (cardType){
        return readCard.call(this, '-1', Const.cardUsage.X_CARD_USAGE_ADMIN);
    };

    /**
     * 读取管理员卡,包括TF卡
     * @author 马德成
     * @date 2015-02-21
     */
    CardWrap.prototype.readAdminTFCard = function (cardType){
        return readCard.call(this, '1', Const.cardUsage.X_CARD_USAGE_ADMIN);
    };

    /**
     * 读取管理员USB Key
     * @author 马德成
     * @date 2015-02-21
     */
    CardWrap.prototype.readAdminUSBKeyCard = function (cardType){
        return readCard.call(this, '2', Const.cardUsage.X_CARD_USAGE_ADMIN);
    };

    /**
     * 在左面右下角弹出消息提示框
     * @author 马德成
     * @date 2015-02-21
     * @param message 消息内容
     * @param time 显示时长(单位:s)，如果取值0，永久显示
     * @param  type 1-oa  2-zw
     * @param callback 类型 function(data)
     * 成功,data={success:true}
     * 失败,data={success:false, code:0, message:'错误信息'}
     */
    CardWrap.prototype.showMsgTip = function (message, time, type, callback){
        if(!message) throw new Error('message为必须参数');
        if(isNaN(time)) throw new Error('time必须是数字');
        if(type !=1 && type!=2) throw new Error('type必须是1、2');
        if(typeof callback != 'function') callback = noop;

        try {
            plugin.card().ShowMsgTip(message, time, type);
            callback.call(this, {success:true});
        } catch(e) {
            var code = getExCode(e);
            callback.call(this, {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex:e});
        }
    };

    /**
     * 获当前浏览器记录的卡ID,当关闭浏览器后则获取不到记录
     * @author 马德成
     * @date 2015-02-21
     * @param callback 类型 function(data)
     * 成功,data={success:true, cardId:'1df0d0f0'}
     * 失败,data={success:false, code:0, message:'错误信息'}
     */
    CardWrap.prototype.getCard = function(callback){
        if(plugin.error) {
            callback.call(this, plugin.error);
            return plugin.error;
        }

        if(typeof callback != 'function') callback = noop;
        var ret;

        try {
            var cardId = plugin.card().GetCardId();
            ret = {success:true, cardId:cardId}
        } catch(e) {
            var code = getExCode(e);
            ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex:e};

        }

        callback.call(this, ret);
        return ret;;
    };

    /**
     * 根据卡号获取CertKit对象
     * @param cardNo 卡号
     * @returns {CertKit} 卡操作的工具类
     */
    CardWrap.prototype.cardKit = function(cardNo){
        if(plugin.error) return plugin.error;
        return new CertKit(cardNo);
    };
    return info;
})();