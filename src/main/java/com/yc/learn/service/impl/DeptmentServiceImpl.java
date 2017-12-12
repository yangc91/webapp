package com.yc.learn.service.impl;

import com.yc.learn.dao.DeptmentDao;
import com.yc.learn.entity.DeptmentInfo;
import com.yc.learn.service.IDeptmentService;
import com.yc.learn.utils.page.LitePaging;
import java.util.List;
import javax.annotation.Resource;
import org.springframework.stereotype.Service;

/**
 * @Auther: yangchun
 * @Date: 2017-9-15 10:42
 */
@Service
public class DeptmentServiceImpl implements IDeptmentService {

  @Resource
  private DeptmentDao deptmentDao;

  @Override
  public void add(DeptmentInfo deptmentInfo) {
    deptmentDao.add(deptmentInfo);
  }

  @Override
  public DeptmentInfo getDeptmentById(String id) {
    return deptmentDao.getDeptmentById(id);
  }

  @Override
  public void update(DeptmentInfo deptmentInfo) {
    deptmentDao.update(deptmentInfo);
  }

  @Override
  public List<DeptmentInfo> list() {
    return deptmentDao.list();
  }

  @Override
  public LitePaging<DeptmentInfo> list(Integer pageNumber, Integer pageSize) {
    return deptmentDao.list(pageNumber, pageSize);
  }
}
