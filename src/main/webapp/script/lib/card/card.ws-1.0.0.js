/**
 * 信大捷安写卡控件的js封装类-基于websocket的读卡控件
 * @author 马德成
 * @date 2015-11-20
 * 
 * 说明:
 *   1.该文件被引入页面后,会自动建立websocket连接,且仅初始化一次
 *   2.每次接收的消息会自动匹配发送的消息,自动注册回调列表
 *   3.该组件全部操作均为异步方式,所以都需要在回调函数中处理业务
 *   5.在回调函数中都会有success属性,当success=false时,对象会有code和message属性
 */

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
var CardWs = (function (){
	var socket, noop = function(){};
	if (('MozWebSocket' in window)) {
		socket = new MozWebSocket('wss://localhost:8000/xdja');
	} else if (('WebSocket' in window)) {
		socket = new WebSocket('wss://localhost:8000/xdja');
	} else {
		return {};
	}
	
	//观察者对象
	var EvtObserver=(function(){var b={};for(var c=0,e="Boolean Number String Function Array Date RegExp Object".split(" "),a=e.length;c<a;c++){b["[object "+e[c]+"]"]=e[c].toLowerCase()}var d=function(l){var k={};var h=function(u){var v=k[u]={},w,x;u=u.split(/\s+/);for(w=0,x=u.length;w<x;w++){v[u[w]]=true}return v};l=l?(k[l]||h(l)):{};var q=[],r=[],m,g,n,j,o,p,t=function(v){var w,y,x,u,z;for(w=0,y=v.length;w<y;w++){x=v[w];u=x==null?String(x):b[Object.prototype.toString.call(x)]||"object";if(u==="array"){t(x)}else{if(u==="function"){if(!l.unique||!s.has(x)){q.push(x)}}}}},i=function(v,u){u=u||[];m=!l.memory||[v,u];g=true;n=true;p=j||0;j=0;o=q.length;for(;q&&p<o;p++){if(q[p].apply(v,u)===false&&l.stopOnFalse){m=true;break}}n=false;if(q){if(!l.once){if(r&&r.length){m=r.shift();s.fireWith(m[0],m[1])}}else{if(m===true){s.disable()}else{q=[]}}}},s={add:function(){if(q){var u=q.length;t(arguments);if(n){o=q.length}else{if(m&&m!==true){j=u;i(m[0],m[1])}}}return this},remove:function(){if(q){var u=arguments,w=0,x=u.length;for(;w<x;w++){for(var v=0;v<q.length;v++){if(u[w]===q[v]){if(n){if(v<=o){o--;if(v<=p){p--}}}q.splice(v--,1);if(l.unique){break}}}}}return this},has:function(v){if(q){var u=0,w=q.length;for(;u<w;u++){if(v===q[u]){return true}}}return false},empty:function(){q=[];return this},disable:function(){q=r=m=undefined;return this},disabled:function(){return !q},lock:function(){r=undefined;if(!m||m===true){s.disable()}return this},locked:function(){return !r},fireWith:function(v,u){if(r){if(n){if(!l.once){r.push([v,u])}}else{if(!(l.once&&m)){i(v,u)}}}return this},fire:function(){s.fireWith(this,arguments);return this},fired:function(){return !!g}};return s};var f={};return function(h){var g=f[h];if(!g){g=d("once");g.trigger=function(i){g.fire(i);delete f[h]};f[h]=g}return g}})();
	//生成guid
	function guid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}

	//插卡和拔卡的消息和id映射
	var idMapping = {
		'Device Arrival':'00000000000000000000000000000001',
		'Device Remove': '00000000000000000000000000000002'
	};
	socket.onopen = function(evt) {
		WsCardWrap.success = true;		
		console.log('open==>' + JSON.stringify(evt));
		if(WsCardWrap.onopen) WsCardWrap.onopen.call(this, evt);

//		//alert('Conn opened');可以阻塞执行，也可以起到停顿的作用
//		console.log('等待1秒...');
//		setTimeout(function(){			
//			if(WsCardWrap.onopen) WsCardWrap.onopen.call(this, evt);
//		}, 1000);
		
	};
	
	socket.onmessage = function(evt){
		var id = idMapping[evt.data];
		if(id) return EvtObserver(id).trigger(ret);
		
		try{
		var data = JSON.parse(evt.data);
		if(data && data.id) { //发布消息广播
			var ret = data.state? data.result :{error:{code:data.result, message:WsCardWrap.errorDesc[data.result]||'未知错误', success:data.state}};
			EvtObserver(data.id).trigger(ret);
		}
		} catch (e) {
			console.log('exception==>' + evt.data + '----' +  e);
		}
	};

	//监听socket关闭和错误事件
	socket.onerror = function(evt){
		console.log('socket链接失败' + '~~~' + JSON.stringify(plugin));
		WsCardWrap.success = false;
//		if($('.login-form-error-s0').html()) showErrorStatus('s0');
		if(!plugin && document.getElementById('login-form-error-s0')) showErrorStatus('s0');
	};
	
	function send(method, args, fn) { //发送消息
		if(socket.readyState != 1) return false;
		fn = fn || noop;

		var argv = {method:method, id:guid()};
		typeof args === 'function'? fn = args : argv.param = args;
		//console.log('send==>' + JSON.stringify(argv));
		socket.send(JSON.stringify(argv));
		EvtObserver(argv.id).add(fn);
		return true;
	}

	onclose = function(){
		if(socket){socket.close();}
	};
	/*----------以上是websocket的操作-------------*/
	
	//处理pin码错误
	function getPinResult(name, parame, context, callback){
		if(typeof callback != 'function') callback = noop;
		var lockError = {'-10':true, '-16':true, '-4':true, '-5':true};
		send(name, parame, function(data){
			//alert(JSON.stringify(data));
			if(data.error){ data = data.error.code;}
			data = data-0;
			var ret;
			if(name == 'GetPinTryCount') {
				ret = data>0?{success:true, code:data, isLock:false}:{success:false, code:data, message:Const.errorDesc[data]||'未知错误', isLock:true};
			} else {
				ret = data?{success:false, code:data, message: WsCardWrap.errorDesc[data] || 'PIN码错误', isLock:!!lockError[data]} : {success:true, isLock:false};
			}
			callback.call(context, ret);
		});
		
		return context;
	}
	
	//根据卡号, 拔卡监听函数
	function pullCard(cardId, callback, isHandle) {
		if(typeof callback != 'function') callback = noop;
		if(!cardId) throw new Error('cardId为必须参数');
		var ret = {}, timer, fn = function(handle){
			//console.log('定时检测');
			send("GetCosVer", {handle:handle}, function(resv){
				if(resv.error) {
					clearInterval(timer);
					resv.error.stop = noop;
					callback.call((ret=resv.error), resv.error);
				}
			});
		};
		if(isHandle) {
			timer = setInterval(function(){fn(cardId);}, 800);
			fn(cardId);
			ret.stop = function(){if(timer) clearInterval(timer);}; //停止检测
			return ret;
		}
		
		send("GetCardHandle", {cardid:cardId}, function(data){
			if(data.error) {
				data.error.stop = noop;
				return callback.call((ret=data.error), data.error);
			}
			timer = setInterval(function(){fn(data);}, 800);
			fn(data);
			ret.stop = function(){if(timer) clearInterval(timer);};//停止检测
		});
		
		return ret;
	}
	
	function WsCertKit(cardNo){
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
	 * container:有证书的容器列表,数组
	 * 当执行失败时data={success:false, code:1, message:'错误信息'}
	 */
	WsCertKit.prototype.getCardInfo = function(callback){
		if(typeof callback != 'function') callback = noop;
		
		var _this = this;
		send('GetCardInfo', {cardid:this.getCardId()}, function(data){
			if(data.error) return callback.call(_this, data.error);
			var info = data.split('#');
			ret = {success:true, type:info[0], usage:info[1], container:info.length == 3? info[2].match(/\d{1}/g):[]};
			callback.call(_this, ret);
		});
	};
	
	/**
	 * 读用户交换证书
	 * @author 马德成
	 * @date 2015-11-10
	 * @param containerId 类型 int 容器编号 -必选
	 * @param callback 类型 function(data) 获取证书的回调 -可选
	 * 当执行成功时data={success:true, cert:cert}
	 * 当执行失败时data={success:false, code:1, message:'错误信息'}
	 */
	WsCertKit.prototype.getCert = function (containerId, callback){
		if(isNaN(containerId)) throw new Error('containerId必须为int类型参数');
		if(typeof callback != 'function') callback = noop;
		
		var _this = this;
		send('GetCert', {cardid:this.getCardId(), containerid:containerId}, function(data){
			if(data.error) return callback.call(_this, data.error);
			callback.call(_this, {success:true, cert:data});
		});
	};
	
	/**
	 * 读取用户证书
	 * @param containerId 类型 int 容器编号 -必选
	 * @param certType 类型 int 证书类型 0:交换证书 1:签名证书 -必选
	 * @param callback 类型 function(data) 获取证书的回调 -可选
	 * 当执行成功时data={success:true, cert:cert}
	 * 当执行失败时data={success:false, code:1, message:'错误信息'}
	 */
	 WsCertKit.prototype.getCertEx = function(containerId, certType, callback) {
		if(typeof callback != 'function') callback = noop;
		
		var _this = this;
		send('GetCertEx', {cardid:this.getCardId(), containerid:containerId, certusage:certType}, function(data){
			if(data.error) return callback.call(_this, data.error);
			callback.call(_this, {success:true, cert:data});
		});
		return this;
	};
	
	/**
	 * Cos操作的包装器
	 * @author 马德成
	 * @date 2015-11-10
	 */
	function WsCosWrap(handle){
		WsCosWrap.prototype.handle = handle;
	}

	/**
	 * 获取Cos版本
	 * @author 马德成
	 * @date 2015-11-10
	 * @param callback 类型 function(data) 获取证书的回调 -可选
	 * 当执行成功时data={success:true, version:'3.03.1'}
	 * 当执行失败时data={success:false, code:1, message:'错误信息'}
	 */
	WsCosWrap.prototype.getCosVer = function (callback){
		if(typeof callback != 'function') callback = noop;
		send('GetCosVer', {handle:this.handle}, function(resv){
			if(resv.error) return callback.call(resv.error, resv.error);
			var ret = {success:true, version:version};
			callback.call(ret, ret);
		});
	};
	
	/**
	 * 获取该卡的句柄
	 * @author 马德成
	 * @date 2015-11-10
	 * @param callback 类型 function(data) 获取证书的回调 -可选
	 * 当执行成功时data={success:true, handle:'00101010'}
	 * 当执行失败时data={success:false, code:1, message:'错误信息'}
	 */
	WsCertKit.prototype.getHandle = function(callback) {
		if(typeof callback != 'function') callback = noop;
		send("GetCardHandle", {cardid:this.getCardId()}, function(data){
			if(data.error) return callback.call(data.error, data.error);
			callback.call(WsCosWrap(data), {success:true, handle:data});
		});
		return this;
	};

	/**
	 * 验证用户口令,使用0x11角色
	 * @author 马德成
	 * @date 2015-11-10
	 * @param pin 类型 String PIN码 -必选
	 * @param callback 类型 function(data) 验证用户口令的回调 -可选
	 * 当执行成功时data={success:true, isLock:false, code:1} code:PIN码错误返回重试次数（4 3 2 1）
	 * 当执行失败时data={success:false, isLock:true}
	 */
	WsCertKit.prototype.checkPin = function (pin, callback){
		return this.checkPinEx(pin, 0x11, callback);
	};
	
	/**
	 * 验证用户口令
	 * @author 马德成
	 * @date 2015-11-10
	 * @param pin 类型 String PIN码 -必选
	 * @param role 类型 int 用户角色 -必选
	 * @param callback 类型 function(data) 验证用户口令的回调 -可选
	 * 当执行成功时data={success:true, isLock:false, code:1} code:PIN码错误返回重试次数（4 3 2 1）
	 * 当执行失败时data={success:false, isLock:true}
	 */
	WsCertKit.prototype.checkPinEx = function (pin, role, callback){
		if(!pin) throw new Error('pin为必须参数');
		return getPinResult('SafePin', {cardid:this.getCardId(), pin:pin, role:role}, this, callback);
	};
	
	/**
	 * 修改pin码,只有当在卡没被锁死时,才能有用
	 * @author 马德成
	 * @date 2015-11-10
	 * @param oldPin 类型 String 旧PIN码 -必选
	 * @param newPin 类型 String 新PIN码 -必选
	 * @param callback 类型 function(data) 验证用户口令的回调 -可选
	 * 当执行成功时data={success:true, isLock:false, code:1} code:PIN码错误返回重试次数（4 3 2 1）
	 * 当执行失败时data={success:false, isLock:true}
	 */
	WsCertKit.prototype.safeChangePin = function (oldPin, newPin, callback){
		return this.safeChangePinEx(oldPin, newPin, 0x11, callback);
	};
	
	/**
	 * 修改pin码,只有当在卡没被锁死时,才能有用
	 * @author 马德成
	 * @date 2015-11-10
	 * @param oldPin 类型 String 旧PIN码 -必选
	 * @param newPin 类型 String 新PIN码 -必选
	 * @param role 类型 int 用户角色 -必选
	 * @param callback 类型 function(data) 验证用户口令的回调 -可选
	 * 当执行成功时data={success:true, isLock:false, code:1} code:PIN码错误返回重试次数（4 3 2 1）
	 * 当执行失败时data={success:false, isLock:true}
	 */
	WsCertKit.prototype.safeChangePinEx = function (oldPin, newPin, role, callback){
		return getPinResult('SafeChangePin', {cardid:this.getCardId(), oldPin:oldPin, newPin:newPin, role:role}, this, callback);
	};
	
	/**
	 * 获取PIN码剩余次数
	 * @param callback 回调函数 function(data)
	 * 当执行成功时data={success:true, isLock:false, code:1} code:PIN码错误返回重试次数（4 3 2 1）
	 * 当执行失败时data={success:false, isLock:true}
	 */
	WsCertKit.prototype.getPinTryCount = function(callback) {
		return this.getPinTryCountEx(0x11, callback);
	};
	
	/**
	 * 获取PIN码剩余次数
	 * @param role 用户角色
	 * @param callback 回调函数 function(data)
	 * 当执行成功时data={success:true, isLock:false, code:1} code:PIN码错误返回重试次数（4 3 2 1）
	 * 当执行失败时data={success:false, isLock:true}
	 */
	WsCertKit.prototype.getPinTryCountEx = function(role, callback) {
		return getPinResult('GetPinTryCount', {cardid:this.getCardId(), pinrole:role}, this, callback);
	};

	/**
	 * 根据解锁码,解锁卡并修改PIN码,当卡被锁死时可以被解锁
	 * @param unlockCode 解锁码
	 * @param newPin 新PIN码
	 * @param callback function(data) 执行结果的回调函数
	 * 成功:{success:true}
	 * 失败:{success:false, code:-1, message:'错误消息'}
	 */
	WsCertKit.prototype.unlockCodePin = function(unlockCode, newPin, callback){
		return this.unlockCodePinEx(unlockCode, newPin, 0x11, callback);
	};
	
	/**
	 * 根据解锁码,解锁卡并修改PIN码,当卡被锁死时可以被解锁
	 * @param unlockCode 解锁码
	 * @param newPin 新PIN码
	 * @param role 用户角色
	 * @param callback function(data) 执行结果的回调函数
	 * 成功:{success:true}
	 * 失败:{success:false, code:-1, message:'错误消息'}
	 */
	WsCertKit.prototype.unlockCodePinEx = function(unlockCode, newPin, role, callback){
		if(typeof callback != 'function') callback = noop;
		var _this = this;
		
		send('ReloadPIN', {cardid:this.getCardId(), enscode:unlockCode, newpin:newPin, role:role}, function(data){
			if(data.error) return callback.call(_this, data.error);
			data = data-0;
			var ret = data?{success:false, code:data, message: WsCardWrap.errorDesc[data] || '未知错误'} : {success:true};
			callback.call(_this, ret);
		});
		return this;
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
	 * 当执行失败时data={success:false, code:1, message:'错误信息'}
	 */
	WsCertKit.prototype.genKeypair = function(password, containerid, alg, certusage, keybits, callback){
		if(typeof callback != 'function') callback = noop;
		var _this = this, parame = {cardid:this.getCardId(), password:password, containerid:containerid, 
				alg:alg,certusage:certusage, keybits:keybits};
		
		send('GenKeypair', parame, function(data){
			if(data.error) return callback.call(_this, data.error);
			callback.call(_this, {success:true, publicKey:publicKey});
		});
		return this;
	};
	
	/**
	 * 生成0号容器,交换证书,RSA算法的公私钥对 
	 * @param password 卡用户口令
	 * @param containerid 容器编号(可选,默认值为0)
	 * @param certusage 算法用途：0-交换，1-签名 (可选,默认值为0)
	 * @param callback 回调函数 类型 function(data) 回调函数 -可选
	 * 当执行成功时data={success:true, publicKey:'公钥：RSA-Base64编码的M，SM2-B64编码的x=...y=..'}
	 * 当执行失败时data={success:false, code:1, message:'错误信息'} 
	 */
	WsCertKit.prototype.genKeypairRSA = function(password, containerid, certusage, callback) {
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
	 * 当执行失败时data={success:false, code:1, message:'错误信息'} 
	 */
	WsCertKit.prototype.genKeypairSM2 = function(password, containerid, certusage, callback) {
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
	 * 生成公私钥对-扩展
	 * @author 马德成 
	 * @param role 角色
	 * @param password 卡用户口令
	 * @param containerid 容器编号
	 * @param alg 算法：0-RSA，1-SM2
	 * @param certusage 算法用途：0-交换，1-签名
	 * @param keybits bits 位数：RSA-一般为1024，SM2-一般为256
	 * @param callback 回调函数 类型 function(data) 回调函数 -可选
	 * 当执行成功时data={success:true, publicKey:'公钥：RSA-Base64编码的M，SM2-B64编码的x=...y=..'}
	 * 当执行失败时data={success:false, code:1, message:'错误信息'}
	 */
	WsCertKit.prototype.genKeypairEx = function(role, password, containerid, alg, certusage, keybits, callback){
		if(typeof callback != 'function') callback = noop;
		var _this = this, parame = {cardid:this.getCardId(), role:role, password:password, containerid:containerid, 
				alg:alg,certusage:certusage, keybits:keybits};
		
		send('GenKeypairEx', parame, function(data){
			if(data.error) return callback.call(_this, data.error);
			callback.call(_this, {success:true, publicKey:publicKey});
		});
		return this;
	};
	
	/**
	 * 向卡容器写入证书
	 * @param password 卡用户口令
	 * @param containerid 容器编号
	 * @param certusage 算法用途：0-交换，1-签名
	 * @param cert 证书 十六进制编码
	 * @param callback 回调函数 类型 function(data) 回调函数 -可选
	 * 当执行成功时data={success:true}
	 * 当执行失败时data={success:false, code:1, message:'错误信息'} 
	 */
	WsCertKit.prototype.writeCert = function(password, containerid, certusage, cert, callback){
		if(typeof callback != 'function') callback = noop;
		var _this = this, parame = {cardid:this.getCardId(), password:password, containerid:containerid, 
				certusage:certusage, cert:cert};
		
		send('WriteCert', parame, function(data){
			if(data.error) return callback.call(_this, data.error);
			callback.call(_this, {success:true});
		});
		return this;
	};
	
	/**
	 * 向卡容器写入证书
	 * @param password 卡用户口令
	 * @param containerid 容器编号 (可选,默认:0)
	 * @param certusage 算法用途：0-交换，1-签名 (可选,默认:0)
	 * @param cert 证书 十六进制编码
	 * @param callback 回调函数 类型 function(data) 回调函数 -可选
	 * 当执行成功时data={success:true}
	 * 当执行失败时data={success:false, code:1, message:'错误信息'} 
	 */
	WsCertKit.prototype.writeCertEx = function(password, containerid, certusage, cert, callback){
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
	 * 当执行失败时data={success:false, code:1, message:'错误信息'} 
	 */
	WsCertKit.prototype.writeGateCert = function(password, cert, callback){
		if(typeof callback != 'function') callback = noop;
		var _this = this;
		
		send('WriteGateCert', {cardid:this.getCardId(), password:password,cert:cert}, function(data){
			if(data.error) return callback.call(_this, data.error);
			callback.call(_this, {success:true});
		});
		return this;
	};
	
	/**
	 * 写网关双证书（公钥）
	 * @param password 卡用户口令
	 * @param cert 证书 十六进制编码
	 * @param cert2 监管证书：pem编码 十六进制编码
	 * @param callback 回调函数 类型 function(data) 回调函数 -可选
	 * 当执行成功时data={success:true}
	 * 当执行失败时data={success:false, code:1, message:'错误信息'} 
	 */
	WsCertKit.prototype.writeGateCertEx = function(password, cert, cert2, callback){
		if(typeof callback != 'function') callback = noop;
		var _this = this;
		
		send('WriteGateCertEx', {cardid:this.getCardId(), password:password,cert1:cert, cert2:cert2}, function(data){
			if(data.error) return callback.call(_this, data.error);
			callback.call(_this, {success:true});
		});
		return this;
	};
	
	/**
	 * 当拔卡时,执行的操作
	 * @author 马德成
	 * @date 2015-11-10
	 * @param callback 类型 function()当拔卡时执行的回调
	 */
	WsCertKit.prototype.onpullcard = function(callback){
		return pullCard(this.getCardId(), callback);
	};
	// TODO 测试卡拔出
	WsCertKit.prototype.onpulltest = function(callback){
		return pullCard(this.getCardId(), callback);
	};
	
	/**
	 * 根据解锁码,解锁加密盘
	 * @author LB
	 * @param unlockCode 解锁码
	 * @param newPin 新PIN码
	 * @param callback function(data) 执行结果的回调函数
	 * 成功:{success:true}
	 * 失败:{success:false, message:'错误消息'}
	 */
	WsCertKit.prototype.unlockUsbSecuZone = function(unlockCode, newPin, callback){
		if(typeof callback != 'function') callback = noop;
		var _this = this;
		
		send('UnlockUsbSecuZone', {cardid:this.getCardId(), enscode:unlockCode, newpin:newPin}, function(data){
			if(data.error) return callback.call(_this, data.error);
			data = data-0;
			var ret = (data<0)?{success:false, code:data, message: WsCardWrap.errorDesc[data] || '未知错误'} : {success:true};
			callback.call(_this, ret);
		});
		return this;
	};
	
	/**
	 * 对卡号操作的包装器
	 * @author 马德成
	 * @date 2015-11-10
	 */
	function WsCertWrap(cardNos){
		for(var i = 0; i < cardNos.length; i++ ) {
            this[i] = new WsCertKit(cardNos[i]);
        }

        this.length = cardNos.length;
	}
	
	/**
	 * 遍历卡号
	 * @author 马德成
	 * @date 2015-11-10
	 * @param callback 类型 function(index, cardId)
	 */
	WsCertWrap.prototype.each = function (callback){
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
	WsCertWrap.prototype.push = function(certWrap) {
		if(!certWrap || !certWrap.length) return this;
		var len = this.length;
		
		for (var i = 0; i < certWrap.length; i++) {
			this[len++] = certWrap[i];
		}
		
		this.length = this.length + certWrap.length;
		return this;
	};
	
	/**
	 * 对安全卡操作的包装器
	 * @author 马德成
	 * @date 2015-11-10
	 */
	function WsCardWrap(){}
	WsCardWrap.__send = send;
	WsCardWrap.success = true;
	
	/**
	 * 当拔卡时,执行的操作
	 * @author 马德成
	 * @date 2015-11-10
	 * @param cardId 类型 string 卡号
	 * @param callback 类型 function()当拔卡时执行的回调
	 * @returns 返回{stop:fn}可以停止定时器的
	 */
	WsCardWrap.prototype.onpullcard = function(cardId, callback){
		return pullCard(cardId, callback);
	};
	
	/**
	 * 当拔卡时,执行的操作
	 * @author 马德成
	 * @date 2015-11-10
	 * @param handle 类型 string 卡句柄
	 * @param callback 类型 function()当拔卡时执行的毁掉
	 */
	WsCardWrap.prototype.onpullhandle = function(handle, callback){
		return pullCard(handle, callback, true);
	};
	
	/**
	 * 读取卡函数
	 * @author 马德成
	 * @date 2015-11-10
	 * @param cardType 卡类型 0:TF卡,1:USBKey,2:手机,其他:不区分 -可选(默认:-1)
	 * @param cardUsage 用户类型 --0-管理卡,1-用户卡 -1:所有
	 * @param callback 获取安全卡后的回调函数-----该函数没有错误码,只能通过通过属性length来判断是否读到卡
	 */
	function readCard(cardType, cardUsage, callback) {
		if(typeof callback != 'function') callback = noop;
		send('GetAllCards', {type:cardType, usage:cardUsage}, function(data){
			var ret = new WsCertWrap(data.error?[] : data.split('#'));
			callback.call(ret, ret);
		});
		return this;
	}
	
	/**
	 * 读取所有用户卡, 包括TF卡 和 USB Key 和 手机
	 * @author 马德成
	 * @date 2015-11-10
	 */
	WsCardWrap.prototype.readUserCard = function (callback){
		return readCard.call(this, -1, WsCardWrap.cardUsage.X_CARD_USAGE_USER, callback);
	};
	
	/**
	 * 读取ACE手机的芯片号
	 * @author 马德成
	 * @date 2015-08-14
	 */
	WsCardWrap.prototype.readUserACE = function (callback){
		return readCard.call(this, 2, WsCardWrap.cardUsage.X_CARD_USAGE_USER, callback);
	};
	
	/**
	 * 读取用户TF卡
	 * @author 马德成
	 * @date 2015-11-10
	 */
	WsCardWrap.prototype.readUserTFCard = function (callback){
		return readCard.call(this, 0, WsCardWrap.cardUsage.X_CARD_USAGE_USER, callback);
	};
	
	/**
	 * 读取用户USB Key
	 * @author 马德成
	 * @date 2015-11-10
	 */
	WsCardWrap.prototype.readUserUSBKeyCard = function (callback){
		return readCard.call(this, 1, WsCardWrap.cardUsage.X_CARD_USAGE_USER, callback);
	};
	
	/**
	 * 读取管理员卡,包括TF卡和USB Key
	 * @author 马德成
	 * @date 2015-11-10
	 */
	WsCardWrap.prototype.readAdminCard = function (cardType, callback){
		return readCard.call(this, -1, WsCardWrap.cardUsage.X_CARD_USAGE_ADMIN, callback);
	};
	
	/**
	 * 读取管理员卡,包括TF卡
	 * @author 马德成
	 * @date 2015-11-10
	 */
	WsCardWrap.prototype.readAdminTFCard = function (cardType, callback){
		return readCard.call(this, 0, WsCardWrap.cardUsage.X_CARD_USAGE_ADMIN, callback);
	};
	
	/**
	 * 读取管理员USB Key
	 * @author 马德成
	 * @date 2015-11-10
	 */
	WsCardWrap.prototype.readAdminUSBKeyCard = function (cardType, callback){
		return readCard.call(this, 1, WsCardWrap.cardUsage.X_CARD_USAGE_ADMIN, callback);
	};
	
	/**
	 * 根据卡号获取CertKit对象
	 * @param cardNo 卡号
	 * @returns {WsCertKit} 卡操作的工具类
	 */
	WsCardWrap.prototype.cardKit = function(cardNo){
		return new WsCertKit(cardNo);
	};
	
	/**
	 * LB
	 * WsCardWrap - connectACE
	 */
	WsCardWrap.prototype.connectACE = function (callback){
		if(typeof callback != 'function') callback = noop;
		send('ConnectACE', null, function(data){
			var ret = {success:data == undefined?false:!!!data};
			callback.call(ret, ret);
		});
		return this;
	};
	
	/**
	 * LB
	 * WsCardWrap - countACE
	 */
	WsCardWrap.prototype.countACE = function (callback){
		if(typeof callback != 'function') callback = noop;
		send('EnumACE', null, function(data){
			var ret = {success:true, count:data || 0};
			callback.call(ret, ret);
		});
		return this;
	};
	
	/**
	 * LB
	 * WsCardWrap - asymDecryption
	 */
	WsCardWrap.prototype.asymDecryption = function(cardId, role, pin, container, alg, usage, inBase64, certBase64, callback) {
		if(typeof callback != 'function') callback = noop;
		send('AsymDecryption', {cardid:cardId, role:role, password:pin, containernum:container, alg:alg, usage:usage, instr:inBase64, certstr:certBase64}, function(data){
			var ret = {success:!!data, dekuep:data};
			callback.call(ret, ret);
		});
		return this;
	};
	
	/**
	 * LB
	 * WsCertKit - cardSign
	 * @param role 角色
	 * @param pin 卡密码
	 * @param container 容器ID
	 * @param alg 算法类型 0-RSA 1-SM2
	 * @param usage 证书类型 0-交换证书 1-签名证书
	 * @param inData 待签名的数据
	 * @param dataType 待签名数据的数据类型 0-inData是经过hash运算的值 1-inData没经过hash运算
	 * @param callback 回调函数 形式如{success:true, signature:'签名值,经base64编码后的值'}
	 */
	WsCertKit.prototype.cardSign = function(role, pin, container, alg, usage, inData, dataType, callback){
		if(typeof callback != 'function') callback = noop;
		send('CardSign', {cardid:this.getCardId(),role:role,password:pin,containernum:container,alg:alg,usage:usage,instr:inData,datatype:dataType}, function(data){
			var ret = {success:!!data, signature:data};
			callback.call(ret, ret);
		});
		return this;
	};

	/**
	 * LB
	 * WsCertKit - cardRSASign
	 * 使用卡内证书进行RAS签名运算
	 * @param pin 卡密码
	 * @param container 容器ID
	 * @param usage 证书类型 0-交换证书 1-签名证书
	 * @param inData 待签名的数据(原文)
	 * @param callback 回调函数 形式如{success:true, signature:'签名值,经base64编码后的值'}
	 */
	WsCertKit.prototype.cardRSASign = function(pin, container, usage, inData, callback){
		return this.cardSign(0x11, pin, container, 0, usage, inData, 1, callback);
	};
	
	//最终返回值
	return WsCardWrap;
})();