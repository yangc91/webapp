package com.yc.learn.utils.page;

import java.io.Serializable;
import java.util.List;

/**
 * 简化的分页对象，provider/consumer之间的传递的分页信息使用此类，可避免引入多余的jar
 * @date 2015-1-27
 * @author rrx
 *
 */
public class LitePaging<T> implements Serializable {

  private static final long serialVersionUID = 1L;

  private int totalCount = -1;
  private int totalPage = -1;
  private int pageSize = -1;
  private int pageNo = -1;

  private List<T> dataList;

  /**
   *
   * 设置当前页包含的数据
   * @param dataList
   * @return
   */
  public LitePaging<T> setDataList(List<T> dataList) {
    this.dataList = dataList;

    return this;
  }

  /**
   *
   * 获取当前页包含的数据
   * @return
   */
  public List<T> getDataList() {
    return dataList;
  }

  /**
   *
   * 设置每页包含的数据条数
   * @param pageSize
   * @return
   */
  public LitePaging<T> setPageSize(Integer pageSize) {
    if (pageSize == null || pageSize < 1) {
      throw new IllegalArgumentException("参数pageSize必须大于1");
    } else {
      this.pageSize = pageSize;
    }

    return this;
  }

  /**
   *
   * 返回每页包含的数据条数
   * @return
   */
  public int getPageSize() {
    return pageSize;
  }

  /**
   *
   * 设置当前页数
   * @param pageNo
   * @return
   */
  public LitePaging<T> setPageNo(Integer pageNo) {
    if (pageNo == null || pageNo < 1) {
      throw new IllegalArgumentException("参数pageNo必须大于1");
    } else {
      this.pageNo = pageNo;
    }

    return this;
  }

  /**
   *
   * 返回当前页数
   * @return
   */
  public int getPageNo() {
    return pageNo;
  }

  /**
   *
   * 设置数据总数
   * @param totalCount
   */
  public LitePaging<T> setTotalCount(Integer totalCount) {
    if (null == totalCount || totalCount < 0) {
      throw new IllegalArgumentException("参数pageNo必须大于0");
    } else {
      this.totalCount = totalCount;
    }

    return this;
  }

  /**
   *
   * 返回数据总数
   * @return
   */
  public int getTotalCount() {
    if (totalCount != -1) return totalCount;

    totalCount = totalPage * pageSize;

    return totalCount;
  }

  /**
   *
   * 设置总页数
   * @param totalPage
   */
  public LitePaging<T> setTotalPage(Integer totalPage) {
    if (null == totalPage || totalPage < 0) {
      throw new IllegalArgumentException("参数pageNo必须大于0");
    } else {
      this.totalPage = totalPage;
    }

    return this;
  }

  /**
   *
   * 返回总页数
   * @return
   */
  public int getTotalPage() {
    if (totalPage != -1) return totalPage;

    totalPage = totalCount / pageSize;
    if (totalPage == 0 || totalCount % pageSize != 0) {
      totalPage++;
    }
    return totalPage;
  }

  /**
   *
   * 判断是否为首页
   * @return
   */
  public boolean isFirstPage() {
    return pageNo <= 1;
  }

  /**
   *
   * 判断是否为末页
   * @return
   */
  public boolean isLastPage() {
    return pageNo >= getTotalPage();
  }

  /**
   *
   * 获取下一页数
   * @return
   */
  public int getNextPage() {
    if (isLastPage()) {
      return pageNo;
    } else {
      return pageNo + 1;
    }
  }

  /**
   *
   * 获取上一页数
   * @return
   */
  public int getPrePage() {
    if (isFirstPage()) {
      return pageNo;
    } else {
      return pageNo - 1;
    }
  }

  /**
   *
   * 第一条数据位置
   * @return
   */
  public int getFirstResult() {
    return (pageNo - 1) * pageSize;
  }
}
