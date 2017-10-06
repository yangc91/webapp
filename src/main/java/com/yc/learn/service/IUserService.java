package com.yc.learn.service;

import com.yc.learn.entity.UserInfo;
import com.yc.learn.utils.page.LitePaging;
import java.util.List;

/**
 * 用户业务类
 *
 * @Auther: yangchun
 * @Date: 2017-8-17 17:29
 */
public interface IUserService {

  /**
   * 添加用户
   * @param userInfo
   */
  void add(UserInfo userInfo);

  /**
   * 根据ID查询用户
   * @param id
   * @return
   */
  UserInfo getUserById(String id);

  /**
   * 根据name(登录名)查询用户
   * @param name
   * @return
   */
  UserInfo getUserByName(String name);

  /**
   * 更新用户信息
   * @param userInfo
   * @return
   */
  void update(UserInfo userInfo);

  /**
   * 查询用户列表(全部)
   * @return
   */
  List<UserInfo> list();

  /**
   * 分页查询用户列表
   * @return
   */
  LitePaging<UserInfo> list(Integer pageNo, Integer pageSize);

}
