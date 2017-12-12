package com.yc.learn.dao;

import com.yc.learn.entity.DeptmentInfo;
import com.yc.learn.utils.page.LitePaging;
import java.util.List;
import javax.annotation.Resource;
import org.nutz.dao.Cnd;
import org.nutz.dao.impl.NutDao;
import org.nutz.dao.pager.Pager;
import org.nutz.dao.sql.Criteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

/**
 * 部门操作类
 * @Auther: yangchun
 * @Date: 2017-9-15 10:58
 */
@Repository
public class DeptmentDao {

  public Logger logger = LoggerFactory.getLogger(this.getClass());

  @Resource
  private NutDao nutDao;

  public void add(DeptmentInfo deptmentInfo) {
    nutDao.insert(deptmentInfo);
  }

  public DeptmentInfo getDeptmentById(String id) {
    return nutDao.fetch(DeptmentInfo.class, id);
  }

  public void update(DeptmentInfo deptmentInfo) {
    nutDao.update(deptmentInfo);
  }

  public List<DeptmentInfo> list() {
    Criteria cri = Cnd.cri();
    List<DeptmentInfo> list = nutDao.query(DeptmentInfo.class, cri);
    return list;
  }

  public LitePaging<DeptmentInfo> list(Integer pageNumber, Integer pageSize) {
    Pager pager = nutDao.createPager(pageNumber, pageSize);
    Criteria cri = Cnd.cri();

    List<DeptmentInfo> list = nutDao.query(DeptmentInfo.class, cri, pager);
    int count = nutDao.count(DeptmentInfo.class, cri);

    LitePaging<DeptmentInfo> litePaging = new LitePaging<>();
    litePaging.setDataList(list);
    litePaging.setPageNo(pageNumber);
    litePaging.setPageSize(pageSize);
    litePaging.setTotalCount(count);

    return litePaging;
  }
}
