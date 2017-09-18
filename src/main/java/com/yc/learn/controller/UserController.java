package com.yc.learn.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yc.learn.entity.UserInfo;
import com.yc.learn.service.IUserService;
import com.yc.learn.utils.JsonMapperProvide;
import com.yc.learn.utils.page.LitePaging;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Auther: yangchun
 * @Date: 2017-9-15 10:36
 */
@RestController
@RequestMapping("system/user/auth")
public class UserController extends BaseController {

  @Resource
  private IUserService userService;

  @RequestMapping("add")
  public Object add(@RequestBody UserInfo userInfo, HttpServletResponse response, HttpServletRequest request)
      throws JsonProcessingException {
    if (logger.isInfoEnabled() ) {
      logger.info("调用添加用户接口，输入参数：{}", JsonMapperProvide.alwaysMapper().writeValueAsString(userInfo));
    }
    Map<String, Object> result = new HashMap<>();
    result.put("success", "false");
    userService.add(userInfo);
    result.put("success", "true");
    // 记录日志
    logger.info("添加用户加成功");
    return result;
  }

  @RequestMapping("update")
  public Object add(@RequestBody UserInfo userInfo) throws JsonProcessingException {
    if (logger.isInfoEnabled() ) {
      logger.info("调用编辑用户接口，输入参数：{}", JsonMapperProvide.alwaysMapper().writeValueAsString(userInfo));
    }
    Map<String, Object> result = new HashMap<>();
    result.put("success", "false");

    userService.update(userInfo);

    logger.info("编辑用户加成功");
    result.put("success", "true");

    return result;
  }

  @RequestMapping("get")
  public Object add(String id) {
    if (logger.isInfoEnabled() ) {
      logger.info("调用查询指定用户接口，输入参数：{}", id);
    }

    return userService.getUserById(id);
  }

  @RequestMapping("list")
  public Object get() {

    if (logger.isInfoEnabled() ) {
      logger.info("调用查询用户列表接口");
    }

    LitePaging<UserInfo> pagination = new LitePaging<UserInfo>();
    pagination.setDataList(userService.list());
    return pagination;
  }

  //TODO 检查用户名是否重复
  @RequestMapping("check")
  public Object add() {
    return "";
  }

}
