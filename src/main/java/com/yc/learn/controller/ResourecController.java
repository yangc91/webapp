package com.yc.learn.controller;

import com.yc.learn.annotation.PrePermission;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Auther: yangchun
 * @Date: 2017-9-5 11:06
 */
@RestController
@RequestMapping("res")
public class ResourecController {

  @PrePermission(value = "res:list", name = "资源列表")
  @RequestMapping("/list")
  public Object list() {
    List<String>  list = new ArrayList<>();
    list.add("11");
    list.add("22");
    list.add("33");

    return list;
  }

}
