/**
 * <h2>信大捷安卡控件的javascript API</h2>
 * 说明:
 * 1. 文件被引入页面后,会自动初始化,且仅初始化一次
 * 2. 初始化时仅检测安全控件是否安装,以及版本号是否最新
 * 3. 该组件仅有一个顶级对象--Card,该对象也仅有一个方法--ready
 * 4. 方法都支持返回值和回调函数的方式,即回调的参数和返回值的类型一致
 * 5. 在回调函数中都会有success属性,当success=false时,对象会有code和message属性
 * 6. 所调用的函数全部都经过异常处理,也就是说当不需要错误消息和错误码时完全可以忽略这些信息
 * 7. 自动对浏览器兼容性判断,当浏览器支持websocket时会优先建立websocket连接,否则以插件的形式调用控件
 * 8. 最优先兼容信大捷安PC容器
 * @author 马德成
 * @since 2015-02-21
 * @module API
 * @main Card 读卡控件的入口类
 */
(function (win){
	
	//常量定义
	var Const = {
		//控件最低版本号
		lowestVersion:'3.0.2.11',
		
		//控件当前版本号
		version: '3.0.2.11',
		
		//初始化控件常量定义
		readyConst : {
			'0':'未安装安全控件',
			'3':'安全控件版本过低',
			'4':'安全控件版本有更新',
			'5':'连接读卡服务错误',
			//控件ID
			pluginId:'mdc-card-pluginXdja',
			getEmbed:function (){return '<embed width="0" style="margin:0;padding:0;position: fixed; filter: alpha(opacity=0);" height="0" type="application/NPCardCert" id="' + this.pluginId + '" />'}
		},
		
		//错误码描述定义
		errorDesc : {
			'0':'成功',				'-19':'SM4运算失败',	  	'-12':'证书格式错误',		'-203':'容器不存在',      
			'-1':'卡未插入',			'-20':'重置PIN码失败',	'-13':'导入证书失败',		'-204':'容器证书内容错误',
			'-2':'参数错误',			'-21':'创建文件失败',	  	'-14':'BASE64解码失败',	'-100':'不支持此功能',    
			'-3':'未插入管理卡',		'-22':'SM3运算失败',	  	'-15':'解析pfx失败',		'-27':'激活卡失败',       
			'-4':'卡锁死',			'-23':'SM1运算失败',	  	'-16':'导入pfx失败',		'-29':'未激活',           
			'-5':'口令错误',			'-24':'PSA私钥运算失败',  '-17':'读卡文件失败',		'-31':'手机驱动安装失败', 
			'-6':'卡内产生公私钥对失败','-25':'获取设备信息失败',	'-18':'导入密钥失败',		'-33':'获取设备号失败',   
			'-7':'新建容器失败',		'-61':'解析网关证书失败',	'-26':'产生随机数失败',	'-35':'导入公钥失败',     
			'-8':'容器不存在',		'-62':'签名失败',	  		'-28':'获取卡激活状态失败','-37':'公钥运算失败',     
			'-9':'绑定用户卡失败',		'-63':'取消签名失败',	  	'-30':'ADB 端口被占用',	'-39':'SM2运算失败',     
			'-10':'文件不存在',		'-99':'内部错误',	  		'-36':'导入私钥失败',		'-38':'私钥运算失败',
			'-11':'写文件失败',		'-101':'内存申请失败',	'-32':'卸载安通助手失败',	'-34':'开启安通助手失败',
			'-43':'解锁加密盘失败'
		},
		
		//写卡控件中，卡用途
		cardUsage : {
			X_CARD_USAGE_ADMIN : 0, //0-管理卡
			X_CARD_USAGE_USER : 1, //1-用户卡
			X_CARD_USAGE_All : -1 //所有
		}
	};
	
	/**
	 * 读卡控件的入口类
	 * @class Card
	 * @main Card
	 */
	win.Card = win.Card || {};
	//只是一个空函数的简写形式
	var noop = function(){};
	
	/**
	 * 比较版本号大小
	 * @author 马德成
	 * @date 2015-02-21
	 * @param currentVersion 当前版本号
	 * @param version 需要的最低版本号
	 * @return {String} 
	 * 0. 相同
	 * 1. currentVersion小于version
	 * 2. currentVersion大于version
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
	 * 读取卡函数
	 * @author 马德成
	 * @date 2015-02-21
	 * @param cardType 卡类型 1:TF卡,2:USBKey,其他:不区分 -可选(默认:-1)
	 * @param cardUsage 用户类型 --0-管理卡,1-用户卡 -1:所有
	 */
	function readCard(cardType, cardUsage, callback){
		if(typeof callback != 'function') callback = noop;
		
		var cardNos = plugin.card().GetAllCards(cardType, cardUsage);
		cardNos = cardNos? cardNos.split('#') : [];
		
		var ret = new CertWrap(cardNos);
		callback.call(ret, ret);
		return ret;
	}
	
	/**
	 * 处理pin码错误
	 * @param {Object} fn
	 * @param {Object} context
	 * @param {Object} callback
	 */
	function getPinResult(fn, context, callback){
		if(typeof callback != 'function') callback = noop;
		
		var ret, lockError = {'-10':true, '-16':true, '-4':true, '-5':true};
		try { 
			var result = fn.call(context, plugin.card());
			var time = result.time - 0;
			if(result.pinTry) {
				ret = time>0?{success:true, code:time, isLock:false}:{success:false, code:time, message:Const.errorDesc[time]||'未知错误', isLock:!!lockError[time]};
			} else {
				ret = time?{success:false, code:time, message: Const.errorDesc[time] || 'PIN码错误', isLock:!!lockError[time]} : {success:true, isLock:false};
			}
		} catch(e) {
			var code = getExCode(e);
			ret = {success:false, code:code, message: Const.errorDesc[code] || '未知错误', isLock:!!lockError[code], ex:e};
		}
		
		callback.call(context, ret);
		return ret;
	}
	
	/**
	 * 拔卡函数处理,当卡被拔出时,stop函数将自动执行
	 * @param {String} cardId 卡号
	 * @param {Object} callback 拔卡时的回调函数
	 * @param {Boolean} isHandle 是否是句柄
	 * @return {Object} {stop:function} 返回一个可以停止监听的函数
	 */
	function pullCard(cardId, callback, isHandle){
		if(typeof callback != 'function') callback = noop;
		if(!cardId) throw new Error('cardId为必须参数');
		var handle, ret = {stop:noop}, error = false;
		
		if(isHandle) {
			handle = cardId;
		} else {
			try {
				if ((handle = plugin.card().GetCardHandle(cardId)) == -1) error = true;
			} catch (e) {
				error = true;
			}
			
			if(error){
				callback.call(ret, ret);
				return ret;
			}
		}
		
		var timer, fn = function(){
			try {
				if(!plugin.card().GetCosVer(handle)) error = true; //没有获取到CosVer
			} catch (e) {
				error = true;
			}
			
			if(error){
				clearInterval(timer);
				callback.call(ret, ret);
			}
		};
		
		timer = setInterval(fn, 800);
		fn();
		ret.stop = function(){if(timer) clearInterval(timer);};
		return ret; //停止检测
	}
	
	/**
	 * 一个函数调用的包装器,统一处理fn的异常,并设置fn的上下文
	 * @param {Function} fn 待执行的函数
	 * @param {Object} ctx fn的上下文
	 * @param {Function} [callback] 执行结果的回调函数
	 */
	function fnCaller(fn, ctx, callback){
		if(typeof callback != 'function') callback = noop;
		var ret;
		
		try {
			ret = fn.call(ctx, plugin.card());
		} catch (e) {
			var code = getExCode(e);
			ret = {success:false, code:code, message:Const.errorDesc[code] || '未知错误', ex: e};
		}
		
		callback.call(ctx, ret);
		return ret;
	}
	
	//初始化插件信息
	var plugin = (function(d){
		var cardCertObj, activeX = false;

		if(typeof safekey == "object" && window.safekey) {
			cardCertObj = safekey; //兼容xdja nw
		} else {
			if (!!window.ActiveXObject || 'ActiveXObject' in window) {
				activeX = true;
				try {
					cardCertObj = new ActiveXObject("CardCert.WriteCard");
				} catch (e) {
					return {error:{success:false, code:0, message:Const.readyConst[0]}, ex:e};
				}
			} else {
				d.write(Const.readyConst.getEmbed());
				var cardCertObj = d.getElementById(Const.readyConst.pluginId);
				
				if(!cardCertObj.Test) {
					//判断游览器是否支持websocket
					if(('WebSocket' in window) || ('MozWebSocket' in window)) {
						CardWs.cardUsage = Const.cardUsage;
						CardWs.errorDesc = Const.errorDesc;
						return {ws: new CardWs()};
					} else {
						return {error:{success:false, code:0, message:Const.readyConst[0]}};
					}
				}
			}
		}
		
		var ver = cardCertObj.Test();
		if(compareVersion(ver, Const.lowestVersion) == 1) { //小于最低版本号
			return {error:{success:false, code:3, message:Const.readyConst[3]}};
		} 

		var cardWrap = new CardWrap();
		cardWrap.newVer = compareVersion(ver, Const.version) == 1;
		cardWrap.success = true;
		return {cardWrap:cardWrap, card:function(){return cardCertObj;}, activeX:activeX};
	})(document);
	
	//初始化过
	var inited;
	
	/**
	 * 初始化卡控件,初始化函数,此函数只会被执行一次
	 * 1. 检测是否安装控件；
	 * 2. 卡控件版本号是否一致；
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {Function} [callback] 对初始化结果处理的回调函数
	 *  callback参数内容为:
	 * 1. 执行成功data={success:true}
	 * 2. 执行失败data={success:false, code:0, message:'错误消息'}
	 * @return {CardWrap}
	 * @method ready
	 * @for Card
	 * @static
	 */
	win.Card.ready = function (callback){
		if(typeof callback != 'function') callback = noop;
		if(!plugin.ws) {
			if(plugin.error) {
				callback.call(plugin.error, plugin.error);
				return plugin.error;
			}
			
			callback.call(plugin.cardWrap, {success:true});
			return plugin.cardWrap;
		}
		
		if(inited) {return callback.call(inited, inited);}

		CardWs.onopen = function(){
			var req = CardWs.__send('Test', function(data){
				console.log('Test==>' + data);
				
				if(data.error) {
					inited = data.error;
					return callback.call(inited, inited);
				}
				
				if(compareVersion(data, Const.lowestVersion) == 1) { //小于最低版本号
					inited = {success:false, code:3, message:Const.readyConst[3]};
					return callback.call(inited, inited);
				}
				
				plugin.ws.success = true;
				plugin.ws.newVer = compareVersion(data, Const.version) == 1;
				inited = plugin.ws;
				return callback.call(inited, inited);
			});

			if(!req) {
				var ret = {code:5, message:Const.readyConst[5], success:false};
				return callback.call(ret, ret);
			}
		};
	};
	
	/**
	 * Cos操作的包装器
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {Number} handle 卡句柄
	 * @class CosWrap
	 * @constructor
	 */
	function CosWrap(handle){
		this.handle = handle;
	}

	/**
	 * 获取Cos版本
	 * @author 马德成
	 * @date 2015-11-10
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, version:'Mod-no1..'}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method getCosVer
	 * @for CosWrap
	 */
	CosWrap.prototype.getCosVer = function (callback){
		var fn = function(plugin){
			var version = plugin.GetCosVer(this.handle);
			return {success:true, version:version};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 根据卡号创建卡相关操作的工具类
	 * @param {String} cardNo 卡号
	 * @class CertKit
	 * @constructor
	 */
	function CertKit(cardNo){
		//获取卡号
		this.getCardId = function(){return cardNo;};
	}
	
	/**
	 * 获取安全卡信息
	 * @author 马德成
	 * @date 20125-12-5
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, type:1, usage:1, container:[0,3,4]}
	 * <pre>
	 * 。type:卡类型 0:TF卡 1:USB Key
	 * 。usage:卡用途 0:管理卡 1:用户卡
	 * 。container:有证书的容器列表
	 * </pre>
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @method getCardInfo
	 * @for CertKit
	 */
	CertKit.prototype.getCardInfo = function(callback){
		var fn = function(plugin){
			var info = plugin.GetCardInfo(this.getCardId()).split('#');
			return {type:info[0], usage:info[1], container:info.length == 3? info[2].match(/\d{1}/g):[]};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 读用户交换证书
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {Number} containerId 容器编号
	 * @param {Function} callback 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, cert:cert}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method getCert
	 * @for CertKit
	 */
	CertKit.prototype.getCert = function (containerId, callback){
		var fn = function(plugin){
			var cert = plugin.GetCert(this.getCardId(), containerId);
			return {success:true, cert:cert};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 读取用户证书
	 * @param {Number} containerId 类型 int 容器编号 -必选
	 * @param {Number} certType 证书类型
	 * <pre>
	 * 0:交换证书
	 * 1:签名证书
	 * </pre>
	 * @param {Function} callback 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, cert:cert}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method getCertEx
	 * @for CertKit
	 */
	 CertKit.prototype.getCertEx = function(containerId, certType, callback) {
		var fn = function(plugin){
			var cert = plugin.GetCertEx(this.getCardId(), containerId, certType);
			return {success:true, cert:cert};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 获取该卡的句柄
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {Function} [callback]  完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, handle:00101010}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method getHandle
	 * @for CertKit
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
		
		callback.call(handle? new CosWrap(handle):this, ret);
		return ret;
	};

	/**
	 * 验证用户口令,使用0x11角色
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {String} pin PIN码
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, isLock:false}
	 * 2. 失败:{success:false, code:1, isLock:false, message:'错误信息', ex:异常对象}
	 * <pre>
	 * 。code为PIN码错误返回重试次数（4 3 2 1）
	 * 。isLock判断卡是否锁死
	 * </pre>
	 * @return {Object} 和callback参数一致
	 * @method checkPin
	 * @for CertKit
	 */
	CertKit.prototype.checkPin = function (pin, callback){
		return this.checkPinEx(pin, 0x11, callback);
	};

	/**
	 * 验证用户口令
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {String} pin PIN码
	 * @param {Number}role 用户角色
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, isLock:false}
	 * 2. 失败:{success:false, code:1, isLock:false, message:'错误信息', ex:异常对象}
	 * <pre>
	 * 。code为PIN码错误返回重试次数（4 3 2 1）
	 * 。isLock判断卡是否锁死
	 * </pre>
	 * @return {Object} 和callback参数一致
	 * @method checkPinEx
	 * @for CertKit
	 */
	CertKit.prototype.checkPinEx = function (pin, role, callback){
		if(!pin) throw new Error('pin为必须参数');
		return getPinResult(function(card){return {time:card.SafePin(this.getCardId(), pin, role)};}, this, callback);
	};
	
	/**
	 * 修改pin码,只有当在卡没被锁死时,才能有用,使用0x11角色
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {String} oldPin 旧PIN码
	 * @param {String} newPin 新PIN码
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, isLock:false}
	 * 2. 失败:{success:false, code:1, isLock:false, message:'错误信息', ex:异常对象}
	 * <pre>
	 * 。code为PIN码错误返回重试次数（4 3 2 1）
	 * 。isLock判断卡是否锁死
	 * </pre>
	 * @return {Object} 和callback参数一致
	 * @method safeChangePin
	 * @for CertKit
	 */
	CertKit.prototype.safeChangePin = function (oldPin, newPin, callback){
		return this.safeChangePinEx(oldPin, newPin, 0x11, callback);
	};
	
	/**
	 * 修改pin码,只有当在卡没被锁死时,才能有用
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {String} oldPin 旧PIN码
	 * @param {String} newPin 新PIN码 
	 * @param {Number} role 角色
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, isLock:false}
	 * 2. 失败:{success:false, code:1, isLock:false, message:'错误信息', ex:异常对象}
	 * <pre>
	 * 。code为PIN码错误返回重试次数（4 3 2 1）
	 * 。isLock判断卡是否锁死
	 * </pre>
	 * @return {Object} 和callback参数一致
	 * @method safeChangePinEx
	 * @for CertKit
	 */
	CertKit.prototype.safeChangePinEx = function (oldPin, newPin, role, callback){
		return getPinResult(function(card){return {time:card.SafeChangePin(this.getCardId(), oldPin, newPin, role)};}, this, callback);
	};
	
	/**
	 * 导入容器证书到浏览器,使用角色0x11
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {Number} containerId 容器编号
	 * @param {Number} certType 证书类型:
	 * <pre>
	 * 0: 交换证书
	 * 1: 签名证书
	 * </pre>
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method importCert
	 * @for CertKit
	 */
	CertKit.prototype.importCert = function (containerId, certType, callback){
		return this.importCertEx(containerId, certType, 0x11, callback);
	};
	
	/**
	 * 导入容器证书到浏览器
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {Number} containerId 容器编号
	 * @param {Number} certType 证书类型:
	 * <pre>
	 * 0: 交换证书
	 * 1: 签名证书
	 * </pre>
	 * @param {Number} role 角色
	 * @param {Function} callback 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method importCertEx
	 * @for CertKit
	 */
	CertKit.prototype.importCertEx = function (containerId, certType, role, callback){
		var fn = function(plugin){
			plugin.ImportKeyCertEx(this.getCardId(), '111111', role, containerId, certType);
			return {success:true};
		};
		return fnCaller(fn, this, callback);
	};

	/**
	 * 设定浏览器记录卡ID,当关闭浏览器后则失效
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method setCardId
	 * @for CertKit
	 */
	CertKit.prototype.setCardId = function (callback){
		var fn = function(plugin){
			plugin.SetCardId(this.getCardId());
			return {success:true};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 获取PIN码剩余次数,使用角色0x11
	 * @author 马德成
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, code:5, isLock:false} code为剩余次数
	 * 2. 失败:{success:false, code:1, isLock:false, message:'错误信息', ex:异常对象}
	 * <pre>
	 * 。code为PIN码错误返回重试次数（4 3 2 1）
	 * 。isLock判断卡是否锁死
	 * </pre>
	 * @return {Object} 和callback参数一致
	 * @method getPinTryCount
	 * @for CertKit
	 */
	CertKit.prototype.getPinTryCount = function(callback) {
		return this.getPinTryCountEx(0x11, callback);
	};
	
	/**
	 * 获取PIN码剩余次数
	 * @author 马德成
	 * @param {Number} role 角色
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, code:5, isLock:false} code为剩余次数
	 * 2. 失败:{success:false, code:1, isLock:false, message:'错误信息', ex:异常对象}
	 * <pre>
	 * 。code为PIN码错误返回重试次数（4 3 2 1）
	 * 。isLock判断卡是否锁死
	 * </pre>
	 * @return {Object} 和callback参数一致
	 * @method getPinTryCountEx
	 * @for CertKit
	 */
	CertKit.prototype.getPinTryCountEx = function(role, callback) {
		return getPinResult(function(card){return {time:card.GetPinTryCount(this.getCardId(), role), pinTry:true};}, this, callback);
	};

	/**
	 * 根据解锁码,解锁卡并修改PIN码,当卡被锁死时可以被解锁
	 * @author 马德成
	 * @param {String} unlockCode 解锁码
	 * @param {String} newPin 新PIN码
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method unlockCodePin
	 * @for CertKit
	 */
	CertKit.prototype.unlockCodePin = function(unlockCode, newPin, callback){
		return this.unlockCodePinEx(unlockCode, newPin, 0x11, callback);
	};
	
	/**
	 * 根据解锁码,解锁卡并修改PIN码,当卡被锁死时可以被解锁
	 * @author 马德成
	 * @param {String} unlockCode 解锁码
	 * @param {String} newPin 新PIN码
	 * @param {Number} role 角色
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method unlockCodePinEx
	 * @for CertKit
	 */
	CertKit.prototype.unlockCodePinEx = function(unlockCode, newPin, role, callback){
		var fn = function(plugin){
			var code = plugin.ReloadPIN(this.getCardId(), unlockCode, role, newPin) - 0;
			return code?{success:false, code: code, message: Const.errorDesc[code]||'未知错误'}:{success:true};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 生成公私钥对
	 * @author 马德成
	 * @param {String} pin 卡用户口令
	 * @param {Number} containerid 容器编号
	 * @param {Number} alg 算法：
	 * <pre>
	 * 。0:RSA
	 * 。1:SM2
	 * </pre>
	 * @param {Number} certusage 算法用途：
	 * <pre>
	 * 。0:交换
	 * 。1:签名
	 * </pre>
	 * @param {Number} keybits bits 位数：
	 * <pre>
	 * 。RSA:一般为1024
	 * 。SM2:一般为256
	 * </pre>
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, publicKey:'公钥：RSA-Base64编码的M，SM2-B64编码的x=...y=..'}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method genKeypair
	 * @for CertKit
	 */
	CertKit.prototype.genKeypair = function(pin, containerid, alg, certusage, keybits, callback){
		var fn = function(plugin){
			var publicKey = plugin.GenKeypair(this.getCardId(), pin, containerid, alg, certusage, keybits);
			return {success:true, publicKey:publicKey};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 生成公私钥对,默认使用0号容器,交换证书,1024位RSA算法,参见{{#crossLink "CertKit/genKeypair"}}{{/crossLink}}
	 * @param {String} pin 卡用户口令
	 * @param {Number} [containerid] 容器编号
	 * @param {Number} [certusage] 算法用途：
	 * <pre>
	 * 。0:交换
	 * 。1:签名
	 * </pre>
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, publicKey:'公钥：RSA-Base64编码的M，SM2-B64编码的x=...y=..'}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method genKeypairRSA
	 * @for CertKit
	 */
	CertKit.prototype.genKeypairRSA = function(pin, containerid, certusage, callback) {
		if(typeof containerid == 'function'){
			callback = containerid;
			containerid = null;
		} else if(typeof certusage == 'function'){
			callback = certusage;
			certusage = null;
		} 
		return this.genKeypair(pin, containerid||0, 0, certusage||0, 1024, callback);
	};
	
	/**
	 * 生成公私钥对,默认使用0号容器,交换证书,256位SM2算法,参见{{#crossLink "CertKit/genKeypair"}}{{/crossLink}}
	 * @author 马德成
	 * @param {String} pin 卡用户口令
	 * @param {Number} [containerid] 容器编号
	 * @param {Number} [certusage] 算法用途：
	 * <pre>
	 * 。0:交换
	 * 。1:签名
	 * </pre>
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, publicKey:'公钥：RSA-Base64编码的M，SM2-B64编码的x=...y=..'}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method genKeypairSM2
	 * @for CertKit
	 */
	CertKit.prototype.genKeypairSM2 = function(pin, containerid, certusage, callback) {
		if(typeof containerid == 'function'){
			callback = containerid;
			containerid = null;
		} else if(typeof certusage == 'function'){
			callback = certusage;
			certusage = null;
		}
		return this.genKeypair(pin, containerid || 0, 1, certusage || 0, 256, callback);
	};
	
	/**
	 * 向卡容器写入证书
	 * @author 马德成
	 * @param {String} pin 卡用户口令
	 * @param {Number} containerid 容器编号
	 * @param {Number} certusage 算法用途：
	 * <pre>
	 * 。0:交换
	 * 。1:签名
	 * </pre>
	 * @param {String} cert 十六进制编码证书
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method writeCert
	 * @for CertKit
	 */
	CertKit.prototype.writeCert = function(pin, containerid, certusage, cert, callback){
		var fn = function(plugin){
			plugin.WriteCert(this.getCardId(), pin, containerid, certusage, cert);
			return {success:true};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 向卡容器写入证书
	 * @author 马德成
	 * @param {String} [pin] 卡用户口令
	 * @param {Number} [containerid] 容器编号
	 * @param {Number} [certusage] 算法用途：
	 * <pre>
	 * 。0:交换
	 * 。1:签名
	 * </pre>
	 * @param {String} cert 十六进制编码证书
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method writeCertEx
	 * @for CertKit
	 */
	CertKit.prototype.writeCertEx = function(pin, containerid, certusage, cert, callback){
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
		return this.writeCert(pin, containerid||0, certusage||0, _cert, callback);
	};
	
	/**
	 * 写网关单证书（公钥）
	 * @author 马德成
	 * @param {String} pin 卡用户口令
	 * @param {String} cert 十六进制编码证书
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method writeGateCert
	 * @for CertKit
	 */
	CertKit.prototype.writeGateCert = function(pin, cert, callback){
		var fn = function(plugin){
			plugin.WriteGateCert(this.getCardId(), pin, cert);
			return {success:true};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 写网关双证书（公钥）
	 * @author 马德成
	 * @param {String} pin 卡用户口令
	 * @param {String} cert 十六进制编码证书
	 * @param {String} cert2 监管证书：pem编码 十六进制编码
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method writeGateCertEx
	 * @for CertKit
	 */
	CertKit.prototype.writeGateCertEx = function(pin, cert, cert2, callback){
		var fn = function(plugin){
			plugin.WriteGateCertEx(this.getCardId(), pin, cert, cert2);
			return {success:true};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 导入私钥
	 * 用卡内私钥解密，并由传入的证书得到公钥加密明文，将加密的密文传出
	 * @author 马德成
	 * @param {Number} role 角色
	 * @param {String} pin 卡用户口令
	 * @param {Number} container 容器ID
	 * @param {Number} alg 算法类型:
	 * <pre>
	 * 。0:RSA
	 * 。1:SM2
	 * </pre>
	 * @param {Number} usage 加密类型:
	 * <pre>
	 * 。0:交换
	 * 。1:签名
	 * </pre>
	 * @param {String} privateKey 要导入的私钥Bsae64编码
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method importAsymKey
	 * @for CertKit
	 */
	CertKit.prototype.importAsymKey = function(role, pin, container, alg, usage, privateKey, callback){
		var fn = function(plugin){
			var str = plugin.ImportAsymKey(this.getCardId(), role, pin, container, alg, usage, privateKey);
			return {success:true};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 私钥运算
	 * 用卡内私钥解密，并由传入的证书得到公钥加密明文，将加密的密文传出
	 * @author 马德成
	 * @param {Number} role 角色
	 * @param {String} pin Pin码
	 * @param {Number} container 容器ID
	 * @param {Number} alg 算法类型 0-RSA 1-SM2
	 * @param {Number} usage 证书类型 0- 交换证书  1- 签名证书
	 * @param {String} inBase64 老设备Base64形式的待解密数据(加密后kuep)
	 * @param {String} certBase64 新设备Base64形式的证书内容
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true, dekuep:'老设备解密后的kuep'}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method asymDecryption
	 * @for CertKit
	 */
	CertKit.prototype.asymDecryption = function(role, pin, container, alg, usage, inBase64, certBase64, callback) {
		var fn = function(plugin){
			var str = plugin.AsymDecryption(this.getCardId(), role, pin, container, alg, usage, inBase64, certBase64);
			return {success:!!str, dekuep:str};
		};
		return fnCaller(fn, this, callback);
	};

	/**
	 * 使用卡内证书进行签名运算
	 * @author 马德成
	 * @date 2015-11-28
	 * @param role 角色
	 * @param pin 卡密码
	 * @param container 容器ID
	 * @param alg 算法类型 0-RSA 1-SM2
	 * @param usage 证书类型 0-交换证书 1-签名证书
	 * @param inData 待签名的数据
	 * @param dataType 待签名数据的数据类型 0-inData是经过hash运算的值 1-inData没经过hash运算
	 * @param callback 回调函数 形式如{success:true, signature:'签名值,经base64编码后的值'}
	 */
	CertKit.prototype.cardSign = function(role, pin, container, alg, usage, inData, dataType, callback){
		var fn = function(plugin){
			var str = plugin.CardSign(this.getCardId(), role, pin, container, alg, usage, inData, dataType);
			return {success:!!str, signature:str};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 使用卡内证书进行RAS签名运算
	 * @author 马德成
	 * @date 2015-11-28
	 * @param pin 卡密码
	 * @param container 容器ID
	 * @param usage 证书类型 0-交换证书 1-签名证书
	 * @param inData 待签名的数据(原文)
	 * @param callback 回调函数 形式如{success:true, signature:'签名值,经base64编码后的值'}
	 */
	CertKit.prototype.cardRSASign = function(pin, container, usage, inData, callback){
		return this.cardSign(0x11, pin, container, 0, usage, inData, 1, callback);
	};
	
	/**
	 * 使用卡内证书进行SM2签名运算
	 * @author 马德成
	 * @date 2015-11-28
	 * @param pin 卡密码
	 * @param container 容器ID
	 * @param usage 证书类型 0-交换证书 1-签名证书
	 * @param inData 待签名的数据(原文)
	 * @param callback 回调函数 形式如{success:true, signature:'签名值,经base64编码后的值'}
	 */
	CertKit.prototype.cardSM2Sign = function(pin, container, usage, inData, callback){
		return this.cardSign(0x11, pin, container, 1, usage, inData, 1, callback);
	};
	
	/**
	 * 使用卡内证书进行RAS签名运算
	 * @author 马德成
	 * @date 2015-11-28
	 * @param pin 卡密码
	 * @param container 容器ID
	 * @param usage 证书类型 0-交换证书 1-签名证书
	 * @param inData 待签名的数据(经过hash运算)
	 * @param callback 回调函数 形式如{success:true, signature:'签名值,经base64编码后的值'}
	 */
	CertKit.prototype.cardSha1RSASign = function(pin, container, usage, inData, callback){
		return this.cardSign(0x11, pin, container, 0, usage, inData, 0, callback);
	};
	
	/**
	 * 使用卡内证书进行SM2签名运算
	 * @author 马德成
	 * @date 2015-11-28
	 * @param pwd 卡密码
	 * @param container 容器ID
	 * @param usage 证书类型 0-交换证书 1-签名证书
	 * @param inData 待签名的数据(经过hash运算)
	 * @param callback 回调函数 形式如{success:true, signature:'签名值,经base64编码后的值'}
	 */
	CertKit.prototype.cardSha1SM2Sign = function(pwd, container, usage, inData, callback){
		return this.cardSign(0x11, pwd, container, 1, usage, inData, 0, callback);
	};
	
	/**
	 * 当拔卡时,执行的操作
	 * @author 马德成
	 * @date 2015-02-21
	 * @param callback 类型 function()当拔卡时执行的回调
	 */
	CertKit.prototype.onpullcard = function(callback){
		return pullCard(this.getCardId(), callback);
	};
	
	/**
	 * 根据解锁码,解锁加密盘
	 * @author LB
	 * @param {String} unlockCode 解锁码
	 * @param {String} newPin 新PIN码
	 * @param {Function} [callback] 完成操作后的回调函数,回调参数形式如:
	 * 1. 成功:{success:true}
	 * 2. 失败:{success:false, code:1, message:'错误信息', ex:异常对象}
	 * @return {Object} 和callback参数一致
	 * @method unlockUsbSecuZone
	 * @for CertKit
	 */
	CertKit.prototype.unlockUsbSecuZone = function(unlockCode, newPin, callback){
		var fn = function(plugin){
			/*-2    参数错误
			  -1    找不到卡
			  -19  解密静态解锁码失败
			  -43  解锁加密盘失败
			*/
			var code = plugin.UnlockUsbSecuZone(this.getCardId(), unlockCode, newPin) - 0;
			return (code<0)?{success:false, code: code, message: Const.errorDesc[code]||'未知错误'}:{success:true};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 对卡号枚举的包装器
	 * @author 马德成
	 * @date 2015-02-21
	 * @param {Array} cardNos 卡号列表
	 * @class CertWrap
	 * @constructor
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
	 * 把另一个certWrap放到当前CertWrap里
	 * 例如:
	 * var cards = plugin.readUserUSBKeyCard(); //读取Ukey
	 * var tfs = plugin.readUserTFCard();//读取TF卡
	 * cards.push(tfs); //把读取的TF卡结果push到cards
	 * @param certWrap
	 * @returns {CertWrap}
	 */
	CertWrap.prototype.push = function(certWrap) {
		if(!certWrap || !certWrap.length) return this;
		var len = this.length;
		
		for (var i = 0; i < certWrap.length; i++) {
			this[len++] = certWrap[i];
		}
		this.length = this.length + certWrap.length;
		return this;
	};

	/**
	 * 读取安全卡操作的类
	 * @author 马德成
	 * @date 2015-02-21
	 * @class CardWrap
	 * @constructor
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
		return pullCard(cardId, callback);
	};
	
	/**
	 * 当拔卡时,执行的操作
	 * @author 马德成
	 * @date 2015-02-21
	 * @param handle 类型 string 卡句柄
	 * @param callback 类型 function()当拔卡时执行的毁掉
	 */
	CardWrap.prototype.onpullhandle = function(handle, callback){
		return pullCard(handle, callback, true);
	};
	
	/**
	 * 读取所有用户卡,包括TF卡和USB Key
	 * @author 马德成
	 * @date 2015-02-21
	 */
	CardWrap.prototype.readUserCard = function (callback){
		return readCard.call(this, -1, Const.cardUsage.X_CARD_USAGE_USER, callback);
	};
	
	/**
	 * 读取ACE手机的芯片号
	 * @author 马德成
	 * @date 2015-08-14
	 */
	CardWrap.prototype.readUserACE = function (callback){
		return readCard.call(this, 2, Const.cardUsage.X_CARD_USAGE_USER, callback);
	};
	
	/**
	 * 读取用户TF卡
	 * @author 马德成
	 * @date 2015-02-21
	 */
	CardWrap.prototype.readUserTFCard = function (callback){
		return readCard.call(this, 0, Const.cardUsage.X_CARD_USAGE_USER, callback);
	};
	
	/**
	 * 读取用户USB Key
	 * @author 马德成
	 * @date 2015-02-21
	 */
	CardWrap.prototype.readUserUSBKeyCard = function (callback){
		return readCard.call(this, 1, Const.cardUsage.X_CARD_USAGE_USER, callback);
	};
	
	/**
	 * 读取管理员卡,包括TF卡和USB Key
	 * @author 马德成
	 * @date 2015-02-21
	 */
	CardWrap.prototype.readAdminCard = function (cardType, callback){
		return readCard.call(this, -1, Const.cardUsage.X_CARD_USAGE_ADMIN, callback);
	};
	
	/**
	 * 读取管理员卡,包括TF卡
	 * @author 马德成
	 * @date 2015-02-21
	 */
	CardWrap.prototype.readAdminTFCard = function (cardType, callback){
		return readCard.call(this, 0, Const.cardUsage.X_CARD_USAGE_ADMIN, callback);
	};
	
	/**
	 * 读取管理员USB Key
	 * @author 马德成
	 * @date 2015-02-21
	 */
	CardWrap.prototype.readAdminUSBKeyCard = function (cardType, callback){
		return readCard.call(this, 1, Const.cardUsage.X_CARD_USAGE_ADMIN, callback);
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
	 * 失败,data={success:false, code:0, message:'错误信息', ex:异常对象}
	 */
	CardWrap.prototype.showMsgTip = function (message, time, type, callback){
		var fn = function(plugin){
			plugin.ShowMsgTip(message, time, type);
			return {success:true};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 获当前浏览器记录的卡ID,当关闭浏览器后则获取不到记录
	 * @author 马德成
	 * @date 2015-02-21
	 * @param callback 类型 function(data)
	 * 成功,data={success:true, cardId:'1df0d0f0'}
	 * 失败,data={success:false, code:0, message:'错误信息', ex:异常对象}
	 */
	CardWrap.prototype.getCard = function(callback){
		var fn = function(plugin){
			return {success:true, cardId:plugin.GetCardId()};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 根据卡号获取CertKit对象
	 * @param cardNo 卡号
	 * @returns {CertKit} 卡操作的工具类
	 */
	CardWrap.prototype.cardKit = function(cardNo){
		return new CertKit(cardNo);
	};
	
	/**
	 * 私钥运算
	 * 用卡内私钥解密，并由传入的证书得到公钥加密明文，将加密的密文传出
	 * @param cardId 老卡的卡号
	 * @param role 角色
	 * @param pin Pin码
	 * @param container 容器ID
	 * @param alg 算法类型 0-RSA 1-SM2
	 * @param usage 证书类型 0- 交换证书  1- 签名证书
	 * @param inBase64 老设备Base64形式的待解密数据(加密后kuep)
	 * @param certBase64 新设备Base64形式的证书内容
	 * @param callback 回调函数 形式如{success:true, dekuep:'老设备解密后的kuep'}
	 */
	CardWrap.prototype.asymDecryption = function(cardId, role, pin, container, alg, usage, inBase64, certBase64, callback) {
		var fn = function(plugin){
			var str = plugin.AsymDecryption(cardId, role, pin, container, alg, usage, inBase64, certBase64);
			return {success:!!str, dekuep:str};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 获取连接手机个数
	 * @return 返回枚举的手机个数
	 */
	CardWrap.prototype.countACE = function(callback){
		var fn = function(plugin){
			return {success:true, count:plugin.EnumACE() || 0};
		};
		return fnCaller(fn, this, callback);
	};
	
	
	/**
	 * 连接ACE手机
	 * code -31:未连接手机
	 */
	CardWrap.prototype.connectACE = function(callback){
		var fn = function(plugin){
			var str = plugin.ConnectACE();
			return {success:str == undefined? false : !!!str};
		};
		return fnCaller(fn, this, callback);
	};
	
	/**
	 * 卸载APK
	 */
	CardWrap.prototype.uninstallApk = function(callback){
		var fn = function(plugin){
			plugin.UnInstallApk();
			return {success:true};
		};
		return fnCaller(fn, this, callback);
	};
	
})(window);