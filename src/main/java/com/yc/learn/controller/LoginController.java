package com.yc.learn.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yc.learn.annotation.PrePermission;
import com.yc.learn.service.FooService;
import com.yc.learn.utils.JsonMapperProvide;
import java.util.HashMap;
import java.util.Map;
import org.nutz.dao.impl.NutDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Auther: yangchun
 * @Date: 2017-7-29 10:55
 */
@Controller
public class LoginController {

  @Autowired
  private FooService fooService;

  @Autowired
  private NutDao nutDao;

  @RequestMapping(value = "login", method = RequestMethod.POST)
  public Object get() {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("success", true);
    map.put("msg", "test get");
    return map;
  }

}
