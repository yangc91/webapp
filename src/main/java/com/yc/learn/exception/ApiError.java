package com.yc.learn.exception;

import org.springframework.http.HttpStatus;

public class ApiError {

  private HttpStatus status;
  private String code;
  private String msg;

  //

  public ApiError() {
    super();
  }

  public ApiError(final HttpStatus status, final String code, final String msg) {
    super();
    this.status = status;
    this.code = code;
    this.msg = msg;
  }

  //
  public HttpStatus getStatus() {
    return status;
  }

  public void setStatus(final HttpStatus status) {
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
