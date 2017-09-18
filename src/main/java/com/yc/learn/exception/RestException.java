package com.yc.learn.exception;

import org.springframework.http.HttpStatus;

/**
 * @Auther: yangchun
 * @Date: 2017-8-28 10:06
 */
public class RestException extends RuntimeException {

  private HttpStatus status;

  private String code;

  private String msg;

  public RestException(HttpStatus status, String code, String msg) {
    super(msg);
    this.status = status;
    this.code = code;
    this.msg = msg;
  }

  public HttpStatus getStatus() {
    return status;
  }

  public void setStatus(HttpStatus status) {
    this.status = status;
  }

  public String getMsg() {
    return msg;
  }

  public void setMsg(String msg) {
    this.msg = msg;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }
}
