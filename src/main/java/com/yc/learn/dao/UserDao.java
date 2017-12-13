package com.yc.learn.dao;

import com.yc.learn.entity.UserInfo;
import com.yc.learn.utils.page.LitePaging;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.Resource;
import org.nutz.dao.Cnd;
import org.nutz.dao.Sqls;
import org.nutz.dao.impl.NutDao;
import org.nutz.dao.pager.Pager;
import org.nutz.dao.sql.Criteria;
import org.nutz.dao.sql.Sql;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

/**
 * @author: yangchun
 * @Date: 2017-9-15 10:58
 */
@Repository
public class UserDao {

  public Logger logger = LoggerFactory.getLogger(this.getClass());

  @Resource
  private NutDao nutDao;

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

  /**
   * 修改密码
   */
  public Boolean updatePassword(String userId, String newPwd) {
    StringBuffer sqlBuffer =
        new StringBuffer(" UPDATE t_sys_user SET c_password = @password WHERE C_ID = @id");
    Sql sql = Sqls.create(sqlBuffer.toString());
    sql.params().set("password", newPwd).set("id", userId);
    nutDao.execute(sql);

    return true;
  }

  public Set<String> listAuthroty(String userId) {
    Sql sql = Sqls.create(
        " SELECT auth.c_code from t_sys_authorities auth LEFT JOIN t_sys_user_auth uauth ON auth.c_id = uauth.c_auth_id where uauth.c_user_id = @userId");
    sql.params().set("userId", userId);

    sql.setCallback(Sqls.callback.strList());
    nutDao.execute(sql);

    List<String> authoritys = sql.getList(String.class);
    Set<String> set = new HashSet<String>();
    set.addAll(authoritys);
    return set;
  }
}
