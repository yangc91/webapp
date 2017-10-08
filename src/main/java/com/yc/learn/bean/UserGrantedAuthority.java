package com.yc.learn.bean;

import org.springframework.security.core.GrantedAuthority;

/**
 * @Auther: yangchun
 * @Date: 2017-9-29 17:06
 */
public class UserGrantedAuthority implements GrantedAuthority {

  private String role;

  public UserGrantedAuthority() {
  }

  public UserGrantedAuthority(String role) {
    this.role = role;
  }

  @Override
  public String getAuthority() {
    return role;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }
}
