package com.yc.learn.restconf;

import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

/**
 * @Auther: yangchun
 * @Date: 2017-8-17 19:37
 */
public class ServletInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

  @Override
  protected Class<?>[] getRootConfigClasses() {
    return null;
  }

  @Override
  protected Class<?>[] getServletConfigClasses() {
    return new Class<?>[] {WebConfig.class, SecurityConfig.class};
  }

  @Override
  protected String[] getServletMappings() {
    return new String[] {"/*"};
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
