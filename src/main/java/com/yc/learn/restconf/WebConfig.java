package com.yc.learn.restconf;

import com.yc.learn.interceptor.PermissionInterceptor;
import com.yc.learn.utils.JsonMapperProvide;
import java.util.List;
import org.nutz.dao.impl.NutDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.converter.BufferedImageHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
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
@ComponentScan(basePackages = "com.yc.learn.controller")
//@PropertySource({"classpath:system.properties"})
//@ImportResource({"classpath*:/rest_config.xml"})
public class WebConfig extends WebMvcConfigurerAdapter {



  @SuppressWarnings("SpringJavaAutowiringInspection")
  @Autowired
  private NutDao nutDao;

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

  //@Bean
  //public ContentNegotiatingViewResolver contentViewResolver() throws Exception {
  //  ContentNegotiatingViewResolver contentViewResolver = new ContentNegotiatingViewResolver();
  //  ContentNegotiationManagerFactoryBean contentNegotiationManager = new ContentNegotiationManagerFactoryBean();
  //  contentNegotiationManager.addMediaType("json", MediaType.APPLICATION_JSON);
  //  contentViewResolver.setContentNegotiationManager(contentNegotiationManager.getObject());
  //  contentViewResolver.setDefaultViews(Arrays.<View> asList(new MappingJackson2JsonView()));
  //  return contentViewResolver;
  //}

  /**
   * 静态资源处理
   * @param configurer
   */
  @Override
  public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
    configurer.enable();
    //super.configureDefaultServletHandling(configurer);
  }

  @Override
  public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
    MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
    converter.setObjectMapper(JsonMapperProvide.nonEmptyMapper());
    converters.add(converter);
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    //super.addInterceptors(registry);
    registry.addInterceptor(new PermissionInterceptor())
        .addPathPatterns("/**")  // 需指定拦截路径，才会创建MappedInterceptor，下面的exclude的路径才会放行
        .excludePathPatterns("/**/public/**");
  }
}
