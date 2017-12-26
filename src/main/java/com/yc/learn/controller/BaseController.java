package com.yc.learn.controller;

import com.yc.learn.xss.CustomStringEditor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.InitBinder;

/**
 * @author yangchun
 * @Date: 2017-9-15 10:47
 */
public class BaseController {
  public Logger logger = LoggerFactory.getLogger(this.getClass());

  @InitBinder
  public void initBinder(WebDataBinder binder) {
    binder.registerCustomEditor(String.class, new CustomStringEditor());
  }
}
