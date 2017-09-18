package com.yc.learn.entity;

import org.nutz.dao.entity.annotation.Column;
import org.nutz.dao.entity.annotation.Table;

/**
 * @Auther: yangchun
 * @Date: 2017-9-15 11:03
 */
@Table("t_sys_user")
public class UserInfo extends BaseEntity {

  /**
   * 用户名，不可为空
   */
  @Column("c_login_name")
  private String loginName;

  /**
   * 密码值SHA1后的小写16进制字符串
   */
  @Column("c_password")
  private String password;

  @Column("c_real_name")
  private String realName;

  @Column("c_email")
  private String email;

  public String getLoginName() {
    return loginName;
  }

  public void setLoginName(String loginName) {
    this.loginName = loginName;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getRealName() {
    return realName;
  }

  public void setRealName(String realName) {
    this.realName = realName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }
}
