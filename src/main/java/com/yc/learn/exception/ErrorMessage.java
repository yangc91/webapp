package com.yc.learn.exception;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * 通用错误返回结构
 * @author	libo
 * @date	2016-3-7 下午4:12:41
 * @project	pmc-api
 */
public class ErrorMessage {

    public ErrorMessage(int s, String c, String msg) {
        this.status = s;
        this.errCode = c;
        this.message = msg;
    }

    //Http 状态码
    private transient int status;

    private String hostId = "";
    private String requestId = "";
    //错误代码
    private String errCode;
    //错误描述
    private String message;

    @JsonIgnore
    public int getStatus() {
        return status;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getErrCode() {
        return errCode;
    }

    public void setErrCode(String errCode) {
        this.errCode = errCode;
    }

    public String getHostId() {
        return hostId;
    }

    public void setHostId(String hostId) {
        this.hostId = hostId;
    }

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

    @Override
    public String toString() {
        return "ErrorMessage{" +
                "status=" + status +
                ", hostId='" + hostId + '\'' +
                ", requestId='" + requestId + '\'' +
                ", errCode=" + errCode +
                ", message='" + message + '\'' +
                '}';
    }
}
