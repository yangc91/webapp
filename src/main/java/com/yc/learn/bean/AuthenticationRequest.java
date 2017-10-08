package com.yc.learn.bean;

import java.io.Serializable;

/**
 * 认证请求bean
 *
 * @Auther: yangchun
 * @Date: 2017-9-28 11:50
 */
public class AuthenticationRequest implements Serializable {

  private static final long serialVersionUID = 2873596863671832762L;

  private String username;

  private String password;

  public AuthenticationRequest() {
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }
}
