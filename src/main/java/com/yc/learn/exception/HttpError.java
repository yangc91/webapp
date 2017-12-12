package com.yc.learn.exception;

import javax.servlet.http.HttpServletResponse;

/**
 *  通用异常枚举
 * @file	HttpError.java
 * @author	LB
 * @date	2016年12月6日 下午4:31:11
 *
 */
public enum HttpError {
	
	/**=====请求部分异常定义=======*/

	/**
	 * 元数据格式非法 400
	 */
	SOURCE_DATA_FORMAT_ILLEGAL("0x0001", 400, "source_data_format_illegal"),

	/**
	 * 缺少必要请求参数
	 */
	MISSING_REQUIRED_PARAMETERS("0x0002", 400, "missing_required_parameters"),
	
	/**
	 * 非法请求参数
	 */
	ILLEGAL_REQUEST_PARAMETER("0x0003", 400, "illegal_request_parameter"),
	
	/**
	 * 元数据格式非法 400
	 */
	URL_PARAM_NOT_MATCH_SOURCE("0x0004", 400, "url_param_not_match_source"),

	/**
	 * 服务器内部异常
	 */
	SERVER_INTERNAL_EXCEPTION("0x0005", 500, "server_internal_exception"),
	
	/**
	 * 请求方法不支持
	 */
	REQUEST_METHOD_NOT_SUPPORTED("0x0006", 415, "request_method_not_supported"),
	
	
	//=========================== UAA 定制 =========================================
	/**
	 * ticket失效
	 */
	TICKET_IS_INVALID("0x0014", 400, "ticket_is_invalid"),
		
	/**
	 * Ticket不存在,没有在HTTP头中取到ticket字段
	 */
	TICKET_IS_NOT_EXIST("0x0015", 400, "ticket_is_not_exist"),
	
	/**
	* 未知错误
	*/
	UNKNOWN_ERROR("0x0016", 500, "unknown_error"),
	
	/**
	 * 证书验签失败
	 */
	ERROR_CERT_VERIFY_SIGNATURE("0x0022", 400, "error_cert_verify_signature"),
	
	/**
	 * 证书验签超时
	 */
	OVERTIME_CERT_VERIFY_SIGNATURE("0x0023", 400, "overtime_cert_verify_signature"),
	
	/**
	 * 用户名或证书不存在
	 */
	UNKNOWN_USER_OR_SN("0x0024", 400, "unknown_user_or_sn"),
	
	/**
	 * 未知终端
	 */
	UNKNOWN_TERMINAL("0x0025", 400, "unknown_terminal"),
	
	/**
	 * 密码认证错误
	 */
	PASSWORD_ERROR("0x0026", 400, "password_error"),
	
	/**
	 * 证书过期或被吊销
	 */
	CERT_EXPIRED_OR_REVOCATION("0x0027", 400, "cert_expired_or_revocation"),
	
	/**
	 * 无效密码
	 */
	INVALID_PASSWORD("0x0028", 400, "invalid_password"),
	/**
	 * token已存在
	 */
	TOKEN_IS_EXIST("0x0029", 400, "token_is_exist"),
	
	UNKNOWN_MOBILE("0x0030", 400, "unknown_mobile"),
	AUTHCODE_SEND_SOMUCH("0x0031", 400, "authcode_send_somuch"),
	AUTHCODE_SEND_LIMIT("0x0032", 400, "authcode_send_limit"),
	AUTHCODE_SEND_ERROR("0x0033", 400, "authcode_send_error"),
	
	/**
	 * 调用uas服务异常
	 */
	UAS_SERVER_EXCEPTION("0x0034", 400, "uas_server_exception"),
	
	/**
	 * 未找到对应的安全组信息
	 */
	SAFEGROUP_NOT_FOUND("0x0035", 400, "safegroup_not_found"),
	
	/**
	 * 人脸信息未录入
	 */
	FACEINFO_NOT_FOUND("0x0036", 400, "faceinfo_not_found"),
	
	/**
	 * 调用人脸识别第三方服务异常
	 */
	FACEINFO_SERVER_EXCEPTION("0x0037", 400, "faceinfo_server_exception"),
	
	/**
	 * 调用人脸识别第三方服务异常
	 */
	FACEINFO_NOT_MATCH("0x0038", 400, "faceinfo_not_match"),
	
	//=========================== UAA 定制 END =========================================
	
	/**
	 * 未授权
	 */
	UNAUTHORIZED("0x0012", 400, "unauthorized"),

	/**
	 * 未知应用
	 */
	UNKNOWN_APPID("0x0015", 400, "unknown_appid"),

	/**
	 * 挑战值无效
	 */
	INVALID_CHALLENGE("0x0016", 400, "invalid_challenge"),

	/**
	 * 验签失败
	 */
	ERROR_VERIFY_SIGNATURE("0x0017", 400, "error_verify_signature"),

	/**
	 * token数量达到上限
	 */
	TOKEN_OUT_OF_LIMIT("0x0018", 400, "token_out_of_limit"),

	/**
	 * token无效
	 */
	INVALID_TOKEN("0x0019", 400, "invalid_token"),

	/**
	 * api调用次数限制
	 */
	API_CALL_NUMBER_LIMIT("0x0020", 400, "api_call_number_limit"),

	/**
	 * 人脸服务异常
	 */
	FACE_SERVER_EXCEPTION("0x0021", 400, "face_server_exception"),

	/**
	 * drs服务异常
	 */
	DRS_SERVER_EXCEPTION("0x0022", 400, "drs_server_exception");
	
	private final ErrorMessage msg;

	HttpError(String code, int status, String msg) {
		this.msg = new ErrorMessage(status, code, msg);
	}
	
	/**
     * 处理错误返回值
     *
     * @param resp  响应流
     */
    public ErrorMessage handle(HttpServletResponse resp) {
        resp.setStatus(msg.getStatus());//使得response的值状态为自定义的
        return msg;//因为有@JsonIgnore注解所以不会显示status,只会显示的有：{"hostId":"","requestId":"","errCode":"0x0025","message":"unknown_terminal"}
    }

		public ErrorMessage getMsg() {
			return msg;
		}
}
