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
   * 密码, 不可为空
   */
  @Column("c_password")
  private String password;

  /**
   * 真实姓名
   */
  @Column("c_real_name")
  private String realName;

  /**
   * 邮箱
   */
  @Column("c_email")
  private String email;

  /**
   * 状态： 0-删除，1-正常, 2-未激活，3-冻结
   */
  private Integer state;

  /**
   * 排序号， n_order
   */
  private Integer order;

  private String deptId;

  private String deptName;

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
