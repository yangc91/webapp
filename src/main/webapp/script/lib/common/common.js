/**
 * 通用的脚本文件-hss
 **/

/**
 * 通用写卡控件对象
 */
var plugin;
var flag = 1;
/**
 * swfObject
 *
var swfObject;
*/

/**
 * 卡类型 TF 1
 */
var CARD_TYPE_TF = 1;
/**
 * 卡类型 USBKey 2
 */
var CARD_TYPE_USB = 2;
/**
 * 读取卡id出错
 */
var READ_CARD_ID_ERROR = "ERROR";
/**
 * 卡用途：用户卡
 */
var CARD_TYPE_USE_USER = "1";
/**
 * 卡用途：管理卡
 */
var CARD_TYPE_USE_ADMIN = "2";

/**
 * 写卡控件中，卡类型，0-TF
 */
var X_CARD_TYPE_TF = 0;
/**
 * 写卡控件中，卡类型，1-USB
 */
var X_CARD_TYPE_USB = 1;

/**
 * 写卡控件中，卡用途，0-管理卡
 */
var X_CARD_USAGE_ADMIN = 0;
/**
 * 写卡控件中，卡种类，1-用户卡
 */
var X_CARD_USAGE_USER = 1;

/**
 * 写卡控件中，证书用途，0-交换密钥
 */
var X_CERT_USAGE_EX = 0;
/**
 * 写卡控件中，证书用途，1-数字签名
 */
var X_CERT_USAGE_SIGN = 1;

/**
 * 写卡控件中，存放通用证书的容器ID，0-第0个容器
 */
var X_CTN_ID_0 = 0;

/**
 * 写卡控件中，公钥算法标识，0-RSA
 */
var X_PUBKEY_RSA = 0;
/**
 * 写卡控件中，公钥算法标识，1-SM2
 */
var X_PUBKEY_SM2 = 1;

var WRITE_CARD_TYPE_SUPERADMIN = 1;
var WRITE_CARD_TYPE_ADMIN = 2;
var WRITE_CARD_TYPE_USER = 3;

/**
 * 判断是否安装写卡控件
 * 
 * @return 0:未安装
 * 		   2:运行
 * 		   3:版本不正确
 */
function isInstall() {
	var state;
	if (!!window.ActiveXObject || "ActiveXObject" in window) {	//IE
		try {
			plugin = new ActiveXObject("CardCert.WriteCard");
			flag = 1;
		} catch (e) {
			state = 0;
			return state;
		}
	} else {	//NOT IE
		try {
			plugin = document.getElementById("pluginXdja");
			flag = 0;
		} catch (e) {
			state = 0;
			return state;
		}
	}

    var version;
    try {
    	version = plugin.Test();
    } catch(e) {
    	state = 3;
    	return state;
    }
    if(compareVersion(version,"3.0.2.4") == 1) {
    	state = 3;
    } else {
    	state = 2;
    }
    return state;
}

/**
 * 比较版本号大小
 * @author lcs
 * @date 2014-01-02
 * @param currentVersion 当前版本号
 * @param version 需要的最低版本号
 * @return 0-相同；1-currentVersion小于version；2-currentVersion大于version
 */
function compareVersion(currentVersion,version) {
	var currentVersionArray = currentVersion.split(".");
	var versionArray = version.split(".");	
	var len1 = currentVersionArray.length;
	var len2 = versionArray.length;
    var result = 0;
    if (len1 == len2){
        for (var i = 0; i < len1; i++){
            if (parseInt(currentVersionArray[i]) - parseInt(versionArray[i]) > 0){
            	result = 2;
            	break;
            }
            if (parseInt(currentVersionArray[i]) - parseInt(versionArray[i]) < 0){
            	result = 1;
            	break;
            }
         }
    }
    if (len1 < len2) {
    	result = 1;
    }
    if (len1 > len2){
    	
    	result = 2;
    }
    return result;
}


/**
 * 在左面右下角弹出消息提示框
 * @param message 消息内容
 * @param holdSeconds 显示时长，以秒为单位，如果取值0，永久显示
 * @return
 */
function showMsgTip(message, holdSeconds) {
	try {
		plugin.ShowMsgTip(message,holdSeconds);  //1-oa  2-zw
	} catch(ex) {
		return false;
	}
	return true;
}

/**
 *  获取句柄，调用该方法需处理异常
 * @param cardId  卡ID
 * @return
 */
function getCardHandle(cardId) {
	return plugin.GetCardHandle(cardId);
}

/**
 * 获取Cos版本，调用该方法需处理异常
 * @param handle
 * @return
 */
function getCosVer(handle) {
	return plugin.GetCosVer(handle);
}

/**
 * 证书导入浏览器
 * @param pin pin码
 * @return 0成功，1#msg失败
 */
function importKeyCert(pin) {
	var result = 0;
	var ret;
	try {
		ret = plugin.ImportKeyCert(pin,0x11);
	} catch(ex) {
		return "1#" + ret;
	}
	return result;
}

/**
 * 证书导入浏览器
 * @param cid 卡ID
 * @param containerId 容器ID
 * @param certUsage 证书用途:0交换证书，1签名证书
 * @return 0：成功，其他：失败
 */
function importKeyCertEx(cid, containerId, certUsage) {
	var ret = 0;
	try {
		/*导入容器证书
		cardid		卡ID号
		pin	        卡用户口令
		role    	    角色
		containerid	 容器ID
		certusage   证书用途:0交换证书，1签名证书
		*/
		plugin.ImportKeyCertEx(cid, "111111", 0x11, containerId, certUsage);
	} catch (ex) {
		ret = ex.number;
	}
	return ret;
}

/**
 * 修改pin码
 * @param cardId 卡ID
 * @param oldPin 旧Pin码
 * @param newPin 新Pin码
 * @return ret=0修改成功,ret>0旧pin码错误剩余ret次重试机会,ret=-10表示剩余0次重试机会,ret=-16卡锁死,其他错误
 */
function safeChangePin(cardId, oldPin, newPin) {
	var ret;
	try {
		ret = plugin.SafeChangePin(cardId,oldPin,newPin,0x11);
	} catch(ex) {
		ret = ex.number;
		/**
		if(ernum == -10)
			alert("PIN码错误,剩余0次重试机会");
		else if(ernum == -16)
			alert("PIN码锁死");
		else
			alert("修改PIN码失败,ret="+ret);
		*/
	}
	return ret;
}

/**
 * 根据卡类型查询用户卡ID
 * @author 周小欠
 * @date 2012-11-23
 * @param cardType
 * @return
 */
function getUserCardByCardType(cardType) {
	var xCardType = getCardType(cardType);
	var cardIds = plugin.GetAllCards(xCardType, X_CARD_USAGE_USER);
	return cardIds;
}

/**
 * 读取各类型的管理员卡
 * @author 周小欠
 * @date 2012-11-23
 * @return
 */
function getAdminCardIds() {
	return plugin.GetAllCards(-1, X_CARD_USAGE_ADMIN);
}

function getCert(cardNo, containerId) {
	var cert = "===";
	try {
		cert = plugin.GetCert(cardNo, containerId);
	} catch (e) {
		//alert(e.number);
		if(e.number == -203){
			cert = "1#" + getErrDescription(e.number);
		} else {
			cert = "0#" + getErrDescription(e.number);
		}
		
	}
	return cert;
}

/**
 * 检查是否有管理卡
 * 
 * @param adminCardId
 *            管理卡ID
 * @return true-有，false-没有
 */
function checkHaveAdminCard(adminCardId) {
	// alert("进入checkHaveAdminCard " + adminCardId);
	try {
		var cardIds = "";
		cardIds = plugin.GetAllCards(-1, X_CARD_USAGE_ADMIN);
		// alert("cardIds " + cardIds + " " + adminCardId);
		if (cardIds == null || cardIds == "") {
			return false;
		} else if (cardIds.indexOf(adminCardId) != -1) {
			// alert("Index " + cardIds.indexOf(adminCardId));
			return true;
		} else
			return false;
	} catch (e) {
		return false;
	}
}

function getSuperAdminCardInfo(cardType) {
	// alert("进入 getSuperAdminCardInfo cardType=" + cardType);
	var ret = "0";
	var xCardType = getCardType(cardType);
	var cardIds = plugin.GetAllCards(xCardType, X_CARD_USAGE_ADMIN);
	if (cardIds == null || cardIds == "") {
		ret = "0";
	} else if (cardIds.split("#").length == 1) {
		ret = 1 + "#" + cardType + "#" + cardIds;
	} else {
		ret = "2";
	}
	// alert("退出 getSuperAdminCardInfo ret=" + ret);
	return ret;
}

function getAdminCardInfo(cardType, loginId) {
	// alert("进入 getAdminCardInfo cardType=" + cardType + " loginId=" +
	// loginId);
	var ret = "0";
	var xCardType = getCardType(cardType);
	var cardIds = plugin.GetAllCards(xCardType, X_CARD_USAGE_ADMIN);
	// alert("getAdminCardInfo " + cardIds + " " + xCardType);

	if (cardIds == null || cardIds == "") {
		ret = "0";
	} else if (cardIds.split("#").length == 1) {
		if (cardIds == loginId) {
			ret = "0";
		} else {
			ret = 1 + "#" + cardType + "#" + cardIds;
		}
	} else if (cardIds.split("#").length == 2) {
		if (cardIds.indexOf(loginId) == -1) {
			ret = "2";
		} else if (cardIds.indexOf(loginId) == 0) {
			ret = 1 + "#" + cardType + "#" + cardIds.split("#")[1];
		} else {
			ret = 1 + "#" + cardType + "#" + cardIds.split("#")[0];
		}
	} else {
		ret = "2";
	}
	// alert("退出 getAdminCardInfo ret=" + ret);
	return ret;
}

/**
 * 读用户卡信息,没有卡时返回0,1张卡返回1#sn，2张卡返回2#sn#sn，2张以上返回3
 * @param cardType
 * @return
 */
function getUserCardInfo(cardType) {
	var xCardType = getCardType(cardType);
	var cardIds = plugin.GetAllCards(xCardType, X_CARD_USAGE_USER);
	
	if (cardIds == null || cardIds == "") {
		ret = "0";
		return ret;
	}
	var cardSize = cardIds.split("#").length;
	if (cardSize == 1) {
		ret = "1#" + cardIds;
	} else if (cardSize == 2){
		ret = "2#" + cardIds;
	} else if(cardSize == 3){
		ret = "3#" + cardIds;
	} else {
		ret = -1;
	}
	return ret;
}

/**
 * 验证用户口令 
 * @param cardid 卡ID号 
 * @param pin PIN码 
 * @return 成功返回0，PIN码错误返回重试次数（4 3 2 1）
 */
function checkPin(cardid, pin){
	var ret; 	
	try { 
		ret = plugin.SafePin(cardid,pin,0x11);
	} catch(ex) {
		ret = ex.number;
	} 	
	return ret;
}

/**
 * 设定浏览器记录当前登陆的卡ID。
 * @author 武宗品
 * @return 设定成功或者失败。
 */
function setExplorerCardId(cardId) {
	try {
		plugin.SetCardId(cardId);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * 卡类型转换
 * 
 * @param cardType
 *            系统中定义的卡类型变量
 * @return 对应的写卡控件中的卡类型变量
 */
function getCardType(cardType) {
	var xCardType = 0;
	if(cardType == -1) {
		xCardType = -1;
	} else if (cardType == CARD_TYPE_USB) {
		xCardType = X_CARD_TYPE_USB;
	} else if (cardType == CARD_TYPE_TF) {
		xCardType = X_CARD_TYPE_TF;
	} else {
		//swfObject.showTip("ERROR:卡类型有误，cardType = " + cardType);
		alert("ERROR:卡类型有误，cardType = " + cardType);
		return;
	}
	return xCardType;
}

var CHECK_CARD_ID_IS_USED_OK = 1;
var CHECK_CARD_ID_IS_USED_SAME = 2;
var CHECK_CARD_ID_IS_USED_DIFFERENT = 3;
var CHECK_CARD_ID_IS_USED_NONE = 4;
var CHECK_CARD_ID_IS_USED_MULTI = 5;
var CHECK_CARD_ID_IS_USED_ERROR = 6;
/**
 * 判断当前浏览器之前是否建立成功过安全连接。
 * @author 武宗品
 * @return 
 * obj.checkResult<br/>
 * CHECK_CARD_ID_IS_USED_OK-当前浏览器没有导入过任何证书。<br/>
 * CHECK_CARD_ID_IS_USED_SAME-当前浏览器导入过证书，
 * 并且当前插入的卡和之前建立安全连接时使用的相同。<br/>
 * CHECK_CARD_ID_IS_USED_DIFFERENT-当前浏览器导入过证书，
 * 并且当前插入的卡和之前建立安全连接时使用的不相同。<br/>
 * CHECK_CARD_ID_IS_USED_NONE-没有插入任何安全卡。<br/>
 * CHECK_CARD_ID_IS_USED_MULTI-插入了多张安全卡。<br/>
 * CHECK_CARD_ID_IS_USED_ERROR-卡控件出错。<br/><br/><br/>
 * obj.cardId<br/>
 * 当前插入的卡ID。只有当obj.checkResult是CHECK_CARD_ID_IS_USED_OK、
 * CHECK_CARD_ID_IS_USED_SAME和CHECK_CARD_ID_IS_USED_DIFFERENT时，
 * 此字段有值，否则都是空字符串,其中当obj.checkResult
 * 是CHECK_CARD_ID_IS_USED_DIFFERENT时，返回的是浏览器中已有的卡ID
 */
function checkCardIdIsUsed() {
	var cardId = "";
	var cardIds = getUserCardInfo(-1);
	if(cardIds == "0") {
		return {checkResult:CHECK_CARD_ID_IS_USED_NONE, cardId:""};
	} else if(cardIds.indexOf("1#") == 0){
		cardId = cardIds.split("#")[1];
		canSubmit = true;
	} else {
		return {checkResult:CHECK_CARD_ID_IS_USED_MULTI, cardId:""};
	}
	try {
		var oldCardId = plugin.GetCardId();
//		if(oldCardId == "") {
//			return {checkResult:CHECK_CARD_ID_IS_USED_OK, cardId:cardId};
//		} else if(oldCardId == cardId) {
//			return {checkResult:CHECK_CARD_ID_IS_USED_SAME, cardId:cardId};
//		} else {
//			return {checkResult:CHECK_CARD_ID_IS_USED_DIFFERENT, cardId:oldCardId};
//		}
		return {checkResult:CHECK_CARD_ID_IS_USED_OK, cardId:cardId};
	} catch (e) {
		return {checkResult:CHECK_CARD_ID_IS_USED_ERROR, cardId:""};
	}
}

/**
 * 设定浏览器记录当前登陆的卡ID。
 * @author 武宗品
 * @return 设定成功或者失败。
 */
function setExplorerCardId(cardId) {
	try {
		plugin.SetCardId(cardId);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * 获取证书
cardid		卡ID号
containerid	容器号
certusage	证书用途   0:交换证书   1:签名证书
certinfo     证书信息   
*/
function getCertEx(cardid,containerid,certusage)
{
	var cert = "===";
	try {
		cert = plugin.GetCertEx(cardid, containerid,certusage);
	} catch (e) {
		if(e.number == -203){
			cert = "1#" + getErrDescription(e.number);
		} else {
			cert = "0#" + getErrDescription(e.number);
		}
		
	}
	return cert;
}

/**
 * 获取错误代码的描述
 * 
 * @param errno
 *            错误代码
 * @return 错误描述
 */
function getErrDescription(errno) {
	switch (errno) {
	case -1:
		return "卡未插入";
	case -2:
		return "未插入管理KEY";
	case -3:
		return "口令错误";
	case -4:
		return "参数错误";
	case -5:
		return "不支持的密钥位数";
	case -6:
		return "文件不存在";
	case -7:
		return "权限不足";
	case -8:
		return "证书与密钥不匹配";
	case -9:
		return "绑定用户卡失败";
	case -10:
		return "文件不存在";
	case -11:
		return "写文件失败";
	case -12:
		return "证书格式错误";
	case -13:
		return "导入证书失败";
	case -14:
		return "BASE64解码失败";
	case -15:
		return "解析pfx失败";
	case -16:
		return "导入pfx失败";
	case -17:
		return "读卡文件失败";
	case -18:
		return "导入密钥失败";
	case -20:
		return "容器不存在";
	case -61:
		return "解析网关证书失败";
	case -62:
		return "签名失败";
	case -99:
		return "无证书";
	case -201:
		return "容器空间不足";
	case -203:
		return "容器不存在";
	case -204:
		return "证书不存在";
	default:
		return "未知错误";
	}
}
  
