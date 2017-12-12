package com.yc.learn.service;

import com.yc.learn.entity.DeptmentInfo;
import com.yc.learn.utils.page.LitePaging;
import java.util.List;

/**
 * 部门业务类
 *
 * @Auther: yangchun
 * @Date: 2017-8-17 17:29
 */
public interface IDeptmentService {

  /**
   * 添加
   */
  void add(DeptmentInfo deptmentInfo);

  /**
   * 根据ID查询
   */
  DeptmentInfo getDeptmentById(String id);


  /**
   * 更新
   */
  void update(DeptmentInfo deptmentInfo);

  /**
   * 查询列表(全部)
   */
  List<DeptmentInfo> list();

  /**
   * 分页查询列表
   */
  LitePaging<DeptmentInfo> list(Integer pageNo, Integer pageSize);
}
