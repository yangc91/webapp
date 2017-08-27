package com.yc.learn.rest;

import com.yc.learn.service.FooService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * @Auther: yangchun
 * @Date: 2017-7-28 17:38
 *
 *
 * @EnableWebMvc  == <mvc:annotation-driven />
 * @ComponentScan  == < context:component-scan base-package= "org.rest" />
 * @EnableAspectJAutoProxy == <aop:aspectj-autoproxy>
 *
 */
@Configuration
@EnableWebMvc
// @EnableAspectJAutoProxy   // 启用aspectJ自动代理
@ComponentScan(basePackages = "com.yc.learn")
public class WebConfig extends WebMvcConfigurerAdapter {

  @Bean
  public FooService fooService() {
    return new FooService() {
      public void test() {

      }
    };
  }

  /**
   * 配置视图解析器
   * @return
   */
  @Bean
  public ViewResolver viewResolver() {
    InternalResourceViewResolver resolver = new InternalResourceViewResolver();
    resolver.setPrefix("/WEB-INF/views/");
    resolver.setSuffix(".html");
    resolver.setExposeContextBeansAsAttributes(true);
    return resolver;
  }

  /**
   * 静态资源处理
   * @param configurer
   */
  @Override
  public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
    //configurer.enable();
    super.configureDefaultServletHandling(configurer);
  }
}
