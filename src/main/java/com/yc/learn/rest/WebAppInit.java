package com.yc.learn.rest;

import com.yc.learn.root.AppConfig;
import javax.servlet.Filter;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

/**
 * @Auther: yangchun
 * @Date: 2017-8-17 19:37
 */
public class WebAppInit extends AbstractAnnotationConfigDispatcherServletInitializer {

  protected Class<?>[] getRootConfigClasses() {
    return new Class<?>[]{AppConfig.class, SecurityConfig.class};
  }

  protected Class<?>[] getServletConfigClasses() {
    return new Class<?>[]{WebConfig.class};
  }

  protected String[] getServletMappings() {
    return new String[]{"/*"};
  }

  //@Override
  //protected Filter[] getServletFilters() {
  //  return super.getServletFilters();
  //}
}
