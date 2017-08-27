package com.yc.learn.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @Auther: yangchun
 * @Date: 2017-7-29 10:55
 */
@Controller
@RequestMapping("foo")
public class FooController {

  @RequestMapping("/get")
  @ResponseBody
  public Object get() {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("success", true);
    map.put("msg", "test get");
    return map;
  }

}
