package com.yc.learn.restconf;

import com.yc.learn.rootconf.AppConfig;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

/**
 * @Auther: yangchun
 * @Date: 2017-8-17 19:37
 */
public class ServletInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

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

  //@Override
  //public void onStartup(ServletContext servletContext) throws ServletException {
  //  super.onStartup(servletContext);
  //  registerProxyFilter(servletContext, "springSecurityFilterChain");
  //  registerProxyFilter(servletContext, "oauth2ClientContextFilter");
  //}

  //private void registerProxyFilter(ServletContext servletContext, String name) {
  //  DelegatingFilterProxy filter = new DelegatingFilterProxy(name);
  //  filter.setContextAttribute("org.springframework.web.servlet.FrameworkServlet.CONTEXT.dispatcher");
  //  servletContext.addFilter(name, filter).addMappingForUrlPatterns(null, false, "/*");
  //}

}
