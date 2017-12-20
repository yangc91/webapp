package com.yc.learn.bean;

import java.io.Serializable;

/**
 * 冻结/解冻 bean
 * @author: yc
 * @date: 2017-12-20.
 */
public class LockUserRequest implements Serializable {

  private static final long serialVersionUID = 4931362743708089489L;

  private String type;

  private String id;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }
}
