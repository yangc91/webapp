package com.yc.learn.entity;

import org.nutz.dao.entity.annotation.Column;
import org.nutz.dao.entity.annotation.Table;

/**
 * 类描述：部门基础信息表
 *
 * @author yangchun
 * @date 2016/12/5 10:24
 */
@Table("t_sys_deptment")
public class DeptmentInfo extends BaseEntity {

  /**
   * 机构名称
   */
  @Column("c_name")
  private String name;

  /**
   * 机构code
   */
  @Column("c_code")
  private String code;

  /**
   * 上级机构ID
   */
  @Column("c_parent_id")
  private String parentId;

  /**
   * 状态： 0-删除，1-正常
   */
  private Integer state = 1;

  /**
   * 排序
   */
  @Column("n_order")
  private Integer order;

  /**
   * 备注
   */
  @Column("c_note")
  private String note;

  /**
   * true - 不可选；false - 可选
   */
  private Boolean disabled;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getParentId() {
    return parentId;
  }

  public void setParentId(String parentId) {
    this.parentId = parentId;
  }

  public Integer getState() {
    return state;
  }

  public void setState(Integer state) {
    this.state = state;
  }

  public Integer getOrder() {
    return order;
  }

  public void setOrder(Integer order) {
    this.order = order;
  }

  public String getNote() {
    return note;
  }

  public void setNote(String note) {
    this.note = note;
  }

  public Boolean getDisabled() {
    return disabled;
  }

  public Boolean isDisabled() {
    return disabled;
  }

  public void setDisabled(Boolean disabled) {
    this.disabled = disabled;
  }
}
