package com.yc.learn.entity;

import org.nutz.dao.entity.annotation.Column;

/**
 * @Auther: yangchun
 * @Date: 2017-9-29 9:43
 */
public class Authority extends BaseEntity {

  /**
   * 权限code，eg:  user:add, user:del
   */
  @Column("c_code")
  private String code;

  /**
   * 权限名称, eg： 添加用户、删除用户
   */
  @Column("c_name")
  private String name;

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
