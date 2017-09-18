package com.yc.learn.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yc.learn.annotation.PrePermission;
import com.yc.learn.service.FooService;
import com.yc.learn.service.IUserService;
import com.yc.learn.utils.JsonMapperProvide;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Resource;
import org.nutz.dao.impl.NutDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Auther: yangchun
 * @Date: 2017-7-29 10:55
 */
@RestController
@RequestMapping("foo")
public class FooController {

  public FooController() {
    //SecurityContextHolder.getContext().setAuthentication();
    System.out.println("FooController init……");
  }

  @Autowired
  @Qualifier("userServiceImpl")
  private IUserService userService;

  @Resource
  private IUserService userServiceImpl;

  @Autowired
  private FooService fooService;

  @Autowired
  private NutDao nutDao;

  @PrePermission()
  @RequestMapping("auth/get")
  public Object get() {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("success", true);
    map.put("msg", "test get");
    return map;
  }

  @RequestMapping("public/get")
  public Object test() {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("success", true);
    map.put("msg", "test get");
    map.put("xx",null);
    Map<String, Object> map1 = new HashMap<>();
    map.put("map1", map1);
    try {
      String test = JsonMapperProvide.alwaysMapper().writeValueAsString(map);
      System.out.println(test);
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }
    return map;
  }

  @PrePermission("xx")
  @RequestMapping("xx/get")
  public Object xx() {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("success", true);
    map.put("msg", "test get");
    return map;
  }

}
