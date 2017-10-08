package com.yc.learn.bean;

/**
 * @Auther: yangchun
 * @Date: 2017-9-23 16:56
 */
public class PageBean {

  private Integer pageNumber = 1;

  private Integer pageSize = 10;

  public Integer getPageNumber() {
    return pageNumber;
  }

  public void setPageNumber(Integer pageNumber) {
    this.pageNumber = pageNumber;
  }

  public Integer getPageSize() {
    return pageSize;
  }

  public void setPageSize(Integer pageSize) {
    this.pageSize = pageSize;
  }
}
