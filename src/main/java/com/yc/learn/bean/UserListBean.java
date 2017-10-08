package com.yc.learn.bean;

/**
 * Created by yangchun on 2017-10-7.
 */
public class UserListBean {

  private PageBean pageBean;

  private String search;

  public String getSearch() {
    return search;
  }

  public void setSearch(String search) {
    this.search = search;
  }

  public PageBean getPageBean() {
    return pageBean;
  }

  public void setPageBean(PageBean pageBean) {
    this.pageBean = pageBean;
  }
}
