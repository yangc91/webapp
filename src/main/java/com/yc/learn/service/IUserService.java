package com.yc.learn.service;

import com.yc.learn.bean.UserGrantedAuthority;
import com.yc.learn.entity.UserInfo;
import com.yc.learn.utils.page.LitePaging;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 用户业务类
 *
 * @Auther: yangchun
 * @Date: 2017-8-17 17:29
 */
public interface IUserService {

  /**
   * 添加用户
   */
  void add(UserInfo userInfo);

  /**
   * 根据ID查询用户
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
   */
  void update(UserInfo userInfo);

  /**
   *  变更用户状态
   * @param id
   * @param state 1-正常, 2-未激活，3-冻结
   */
  void changeState(String id, String state);

  /**
   * 查询用户列表(全部)
   */
  List<UserInfo> list();

  /**
   * 分页查询用户列表
   * @param pageNo
   * @param pageSize
   * @return
   */
  LitePaging<UserInfo> list(Integer pageNo, Integer pageSize);

  /**
   * 统计用户信息
   * @return
   */
  Map<String, Object> count();

  /**
   * 修改密码
   */
  void updatePassword(String userId, String newPwd);

  /**
   * 批量删除用户
   * @param ids
   */
  void delete(String... ids);

  /**
   * 获取用户的所有权限（个人及所有role角色）
   */
  Set<UserGrantedAuthority> listAuthroty(String userId);
}
