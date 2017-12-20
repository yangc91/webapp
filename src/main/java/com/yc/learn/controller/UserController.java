package com.yc.learn.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yc.learn.ConstantsProp;
import com.yc.learn.bean.LockUserRequest;
import com.yc.learn.bean.PageBean;
import com.yc.learn.bean.UserLoginInfo;
import com.yc.learn.entity.UserInfo;
import com.yc.learn.exception.RestException;
import com.yc.learn.service.IUserService;
import com.yc.learn.utils.JsonMapperProvide;
import com.yc.learn.utils.page.LitePaging;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Auther: yangchun
 * @Date: 2017-9-15 10:36
 */
@RestController
@RequestMapping("system/user")
public class UserController extends BaseController {

  @Resource
  private IUserService userService;

  @Resource
  private BCryptPasswordEncoder passwordEncoder;

  @RequestMapping("add")
  public Object add(@RequestBody UserInfo userInfo, HttpServletResponse response,
      HttpServletRequest request)
      throws JsonProcessingException {
    logger.info("调用添加用户接口，输入参数：{}",
        JsonMapperProvide.alwaysMapper().writeValueAsString(userInfo));
    Map<String, Object> result = new HashMap<>();
    result.put("success", false);
    userService.add(userInfo);
    result.put("success", true);
    // 记录日志
    logger.info("添加用户加成功");
    return result;
  }

  /**
   * 删除用户
   * @param ids
   * @return
   * @throws JsonProcessingException
   */
  @RequestMapping("delete")
  public Object delete(String... ids) throws JsonProcessingException {
    logger.info("调用删除用户接口，输入参数：ids:{}", ids);

    Map<String, Object> result = new HashMap<>();
    result.put("success", false);
    try {
      userService.delete(ids);
      result.put("success", true);
    }catch (Exception e) {
      logger.error("删除用户出现异常, 参数：{}",ids,  e);
    }

    return result;
  }

  /**
   * 冻结/解冻用户
   * @param lockUser
   * @return
   * @throws JsonProcessingException
   */
  @RequestMapping("lock")
  public Object lock(LockUserRequest lockUser) throws JsonProcessingException {
    logger.info("调用用户冻结/解冻接口，输入参数：{}",
        JsonMapperProvide.alwaysMapper().writeValueAsString(lockUser));
    Map<String, Object> result = new HashMap<>();
    result.put("success", false);
    try {
      userService.changeState(lockUser.getId(), lockUser.getType());
      result.put("success", true);
    }catch (Exception e) {
      logger.error("冻结用户出现异常, 参数：{}",JsonMapperProvide.alwaysMapper().writeValueAsString(lockUser),  e);
    }

    return result;
  }

  @RequestMapping("update")
  public Object update(@RequestBody UserInfo userInfo) throws JsonProcessingException {
    logger.info("调用编辑用户接口，输入参数：{}",
        JsonMapperProvide.alwaysMapper().writeValueAsString(userInfo));

    Map<String, Object> result = new HashMap<>();
    result.put("success", false);

    userService.update(userInfo);

    logger.info("编辑用户加成功");
    result.put("success", true);

    return result;
  }

  @RequestMapping("get")
  public Object get(String id) {
    logger.info("调用查询指定用户接口，输入参数：id:{}", id);
    return userService.getUserById(id);
  }

  @RequestMapping("list")
  //@PreAuthorize("hasAuthority('user:list')")
  public Object list(@RequestBody PageBean pageBean) throws JsonProcessingException {
    logger.info("调用查询用户列表接口, 参数：{}",JsonMapperProvide.alwaysMapper().writeValueAsString(pageBean));
    LitePaging<UserInfo> pagination =
        userService.list(pageBean.getPageNumber(), pageBean.getPageSize());
    return pagination;
  }

  @RequestMapping("count")
  //@PreAuthorize("hasAuthority('user:count')")
  public Object count() throws JsonProcessingException {
    logger.info("调用统计用户接口");
    return userService.count();
  }

  @RequestMapping("resetPassword")
  //@PreAuthorize("hasAuthority('user:resetPassword')")
  public Object resetPassword(String id) {
    logger.info("调用重置用户密码接口，输入参数：{}", id);
    Map<String, Object> result = new HashMap<>(2);
    try {
      userService.updatePassword(id, passwordEncoder.encode(ConstantsProp.DEFAULT_PASSWORD));
      result.put("success", true);
    } catch (Exception e) {
      logger.error("重置密码错误！", e);
      throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, "0x999", "重置密码出现错误");
    }
    return result;
  }

  /**
   * 修改密码
   */
  @RequestMapping("updatePassword")
  //@PreAuthorize("hasAuthority('user:updatePassword')")
  public Object updatePassword(String oldPwd, String newPwd) {
    logger.info("调用修改用户密码接口，输入参数：oldPwd :{}, newPwd: {}", oldPwd, newPwd);
    if (StringUtils.isBlank(oldPwd) || StringUtils.isBlank(newPwd)) {
      throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, "0x000", "缺少必要参数");
    }

    try {
      UserLoginInfo userLoginInfo =
          (UserLoginInfo) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

      UserInfo userInfo = userService.getUserById(userLoginInfo.getId());
      if (userInfo != null && userInfo.getPassword().equals(passwordEncoder.encode(oldPwd))) {
        userService.updatePassword(userLoginInfo.getId(), passwordEncoder.encode(newPwd));
      }
    } catch (Exception e) {
      logger.error("重置密码错误！", e);
      throw new RestException(HttpStatus.INTERNAL_SERVER_ERROR, "0x999", "修改密码出现错误");
    }
    return true;
  }

  //TODO 检查用户名是否重复
  @RequestMapping("check")
  public Object check() {
    return "";
  }
}
