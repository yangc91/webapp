package com.yc.learn.bean;

import java.util.Collection;
import java.util.Set;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * @Auther: yangchun
 * @Date: 2017-9-28 14:25
 */
public class UserLoginInfo implements UserDetails {

  private String id;
  private String password;
  private String username;
  private Set<UserGrantedAuthority> authorities;
  private boolean accountNonExpired = true;
  private boolean accountNonLocked = true;
  private boolean credentialsNonExpired = true;
  private boolean enabled = true;

  public UserLoginInfo() {
    super();
  }

  public UserLoginInfo(String id, String username, String password, Set<UserGrantedAuthority> authorities) {
    this.id = id;
    this.password = password;
    this.username = username;
    this.authorities = authorities;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public void setAccountNonExpired(boolean accountNonExpired) {
    this.accountNonExpired = accountNonExpired;
  }

  public void setAccountNonLocked(boolean accountNonLocked) {
    this.accountNonLocked = accountNonLocked;
  }

  public void setCredentialsNonExpired(boolean credentialsNonExpired) {
    this.credentialsNonExpired = credentialsNonExpired;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  @Override
  public String getPassword() {
    return this.password;
  }

  @Override
  public String getUsername() {
    return this.username;
  }

  @Override
  public boolean isAccountNonExpired() {
    return accountNonExpired;
  }

  @Override
  public boolean isAccountNonLocked() {
    return this.accountNonLocked;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return this.credentialsNonExpired;
  }

  @Override
  public boolean isEnabled() {
    return this.enabled;
  }

  @Override public Set<UserGrantedAuthority> getAuthorities() {
    return authorities;
  }

  public void setAuthorities(Set<UserGrantedAuthority> authorities) {
    this.authorities = authorities;
  }
}
