package com.yc.learn.dao;

import com.yc.learn.entity.UserInfo;
import com.yc.learn.utils.page.LitePaging;
import java.util.ArrayList;
import java.util.List;
import org.nutz.dao.Cnd;
import org.nutz.dao.impl.NutDao;
import org.nutz.dao.pager.Pager;
import org.nutz.dao.sql.Criteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

/**
 * @Auther: yangchun
 * @Date: 2017-9-15 10:58
 */
@Repository
public class UserDao {

  @Autowired
  public NutDao nutDao;

  public UserInfo add(UserInfo userInfo) {
    return nutDao.insert(userInfo);
  }

  public UserInfo getUserById(String id) {
    return nutDao.fetch(UserInfo.class, id);
  }

  public UserInfo getUserByName(String name) {
    return nutDao.fetch(UserInfo.class, Cnd.where("loginName", "=", name));
  }

  public void update(UserInfo userInfo) {
    nutDao.update(userInfo);
  }

  public List<UserInfo> list() {
    //Pager pager = nutDao.createPager(pageNu, pageSize);
    Criteria cri = Cnd.cri();
    List<UserInfo> list = nutDao.query(UserInfo.class, cri);
    return list;
  }

  public LitePaging<UserInfo> list(Integer pageNumber, Integer pageSize) {
    Pager pager = nutDao.createPager(pageNumber, pageSize);
    Criteria cri = Cnd.cri();

    List<UserInfo> list = nutDao.query(UserInfo.class, cri, pager);
    int count = nutDao.count(UserInfo.class, cri);

    LitePaging<UserInfo> litePaging = new LitePaging<>();
    litePaging.setDataList(list);
    litePaging.setPageNo(pageNumber);
    litePaging.setPageSize(pageSize);
    litePaging.setTotalCount(count);

    return litePaging;
  }
}
