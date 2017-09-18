var downLoadCSPPath = "downloads/readCard.rar";
var checkResult;
var timer;
var isLogin = true;
if (top != this) {
	top.location = this.location;
}

$("#username").focus();


$(function(){
	
	$(".pt-logo").bind("click", function(){
	  top.location = "login";
	});
	
/*	if (checkInstall()) {
		//bindBtn();
		checkResult = checkCardIdIsUsed();
		switch (checkResult.checkResult) {
		case CHECK_CARD_ID_IS_USED_OK:
			//changeResult("读安全卡成功!", "message-success");

			var cardIds = getUserCardInfo(-1);
			var cardArray = cardIds.split("#");
			$("#cardId").val(cardArray[1]);
			$("#cardHandle").val(getCardHandle(cardArray[1]));
			timer = setInterval(checkCardHandle, 1000);
			
			importKeyCertEx($("#cardId").val(), 4, 0);

			break;
		case CHECK_CARD_ID_IS_USED_DIFFERENT:// 两次卡不一致，界面显示提示，并不允许登陆
			var tipMsg = "为了您的信息安全，请关闭IE浏览器的所有窗口，然后重新登陆。";
			if (checkResult.cardId == "changeSafePin") {
				tipMsg = "您已修改卡密码，必须关闭IE浏览器的所有窗口，然后重新登录。";
			}
			isLogin = false;
			changeResult(tipMsg);

			break;
		case CHECK_CARD_ID_IS_USED_NONE:// 没插卡
			changeResult("请插入您的USB Key，然后<a href=\"javascript:window.location.reload()\">刷新</a>本页面");
			isLogin = false;

			break;
		case CHECK_CARD_ID_IS_USED_MULTI:// 查了多张卡
			changeResult("登录时只能插入一个USB Key");
			isLogin = false;

			break;
		case CHECK_CARD_ID_IS_USED_ERROR:// 卡控件出错
			changeResult("卡控件出错，请联系管理员。");
			isLogin = false;

			break;
		}
		
		// 用户名密码登录按钮事件
		$("#loginButton").bind("click", function(){
			unlogin();
			
		});

		// 监听Enter键进行登陆
		$(this).keydown(function(event) {
			if (event.keyCode == 13) {
				$("#loginButton").click();
			}
		});
		
	} else {
		//$("#loginButton").attr("disabled", "disabled");
	}*/

});

function unlogin() {
	
	$("#msg").hide();
	
	// 正式环境下开启
	if (!isLogin) {
		return;
	}

	// 校验用户名
	if (!$("#username").val()) {
		changeResult("帐号不能为空");
		return;
	}

	// 校验用户名
	if (!$("#password").val()) {
		changeResult("密码不能为空");
		return;
	}
	
	if (!$("#pin").val()) {
		changeResult("安全口令不能为空");
		return;
	}

	var cardid = $("#cardId").val();
	var pin = $("#pin").val();
	
	var pinResult = safePin(cardid, pin);
	if(pinResult > 0) {
		if(pinResult == 1){
			changeResult("安全口令错误，您还有" + pinResult + "次机会，再次输错将锁死您的USB Key！");
			return;
		} else {
			changeResult("安全口令错误，您还有" + pinResult + "次机会！");
			return;
		}
		
	} else if(pinResult == -4) {
		changeResult("USB Key已锁死，请联系管理员解锁后重试！");
		return;
	}
	
	if (importKeyCertEx(cardid, 4, 0) != 0) {
		changeResult("导入安全卡证书失败");
		return;
	}

	$("#fm1").submit();
}
// 检查控件安装情况
function checkInstall() {
	var state = isInstall();
		
	if (state == 0) {
		changeCheckResult("未安装安全控件,请<a class='alert-link' href='" + downLoadCSPPath + "'>下载</a>安装!");
		return false;
	} else if (state == 2) {
		return true;
	} else if (state == 3) {
		changeCheckResult("安全控件有新版本啦，请<a class='alert-link' href='" + downLoadCSPPath + "'>下载</a>安装");
		return false;
	} else if (state == 4) {
		changeCheckResult("安全控件有新版本啦，请<a class='alert-link' href='" + downLoadCSPPath + "'>下载</a>安装");
		return true;
	}
}

// 显示验证结果信息: result 提示信息
function changeResult(result, isSuccess) {
	// 正式环境下开启
	if (isSuccess) {
		$("#read-msg").html(result);
	} else {		
		$("#read-msg").html(result);
	}
}

function changeCheckResult(result, isSuccess) {
	// 正式环境下开启
	if (isSuccess) {
		$("#read-msg").html(result);
	} else {		
		$("#read-msg").html(result);
	}
}

function bindBtn() {
	 $("#username").keyup(function(){
		 
		 if("" != $("#username").val() && "" != $("#password").val() && "" != $("#pin").val()){
			 $("#loginButton").removeAttr("disabled");
		 } else {
			 $("#loginButton").attr("disabled", "disabled");
		 }
	 });
	 
	 $("#password").keyup(function(){
		 if("" != $("#username").val() && "" != $("#password").val() && "" != $("#pin").val()){
			 $("#loginButton").removeAttr("disabled");
		 } else {
			 $("#loginButton").attr("disabled", "disabled");
		 }
	 });
	 
	 $("#pin").keyup(function(){
		 if("" != $("#username").val() && "" != $("#password").val() && "" != $("#pin").val()){
			 $("#loginButton").removeAttr("disabled");
		 } else {
			 $("#loginButton").attr("disabled", "disabled");
		 }
	 });
}

function checkCardHandle() {
	var cardHandle = $("#cardHandle").val();
	var cos = getCosVer(cardHandle);

	if(cos == -1) {
		$("#cardId").val("");
		$("#msg").empty();
		changeResult("请插入您的USB Key，然后<a href=\"javascript:window.location.reload()\">刷新</a>本页面");
		isLogin = false;
	}

}
