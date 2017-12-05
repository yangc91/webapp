package com.yc.learn.service.impl;

import com.yc.learn.bean.UserGrantedAuthority;
import com.yc.learn.dao.UserDao;
import com.yc.learn.entity.UserInfo;
import com.yc.learn.exception.RestException;
import com.yc.learn.service.IUserService;
import com.yc.learn.utils.page.LitePaging;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * @Auther: yangchun
 * @Date: 2017-9-15 10:42
 */
@Service
public class UserServiceImpl implements IUserService {

  @Resource
  private UserDao userDao;

  @Override
  public void add(UserInfo userInfo) {
    userDao.add(userInfo);
  }

  @Override
  public UserInfo getUserById(String id) {
    return userDao.getUserById(id);
  }

  @Override
  public UserInfo getUserByName(String name) {
    return userDao.getUserByName(name);
  }

  @Override
  public void update(UserInfo userInfo) {
    userDao.update(userInfo);
  }

  @Override
  public List<UserInfo> list() {
    return userDao.list();
  }

  @Override
  public LitePaging<UserInfo> list(Integer pageNumber, Integer pageSize) {
    return userDao.list(pageNumber, pageSize);
  }

  @Override
  public Boolean updatePassword(String userId, String newPwd) {
    return userDao.updatePassword(userId, newPwd);
  }

  @Override
  public Set<UserGrantedAuthority> listAuthroty(String userId) {

    Set<UserGrantedAuthority> authoritySet = new HashSet<UserGrantedAuthority>();

    //user权限
    Set<String> userAuth = userDao.listAuthroty(userId);
    //role权限 TODO 添加角色权限
    //return userDao.listAuthroty(userId);

    UserGrantedAuthority authority = null;
    for (String auth : userAuth) {
      authority = new UserGrantedAuthority(auth);
      authoritySet.add(authority);
    }

    return authoritySet;
  }
}
