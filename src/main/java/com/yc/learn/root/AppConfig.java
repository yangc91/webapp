package com.yc.learn.root;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.ImportResource;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

/**
 * @Auther: yangchun
 * @Date: 2017-7-28 15:06
 *
 *
 * @ImportResource == <import resource=”classpath*:/rest_config.xml” />
 *
 *
 *
 * < context:property-placeholder
    location= "classpath:persistence.properties, classpath:web.properties"
    ignore-unresolvable=
 *
 */
@Configuration
@ComponentScan("com.yc.lear")//(basePackages = {"com.yc.lear"}, excludeFilters = {@ComponentScan.Filter(type= FilterType.ANNOTATION, value = EnableWebMvc.class)})
//@ImportResource({"classpath*:/rest_config.xml"})
//@PropertySource({"classpath:rest.properties", "classpath:web.properties"})
public class AppConfig {

  @Bean
  public static PropertySourcesPlaceholderConfigurer properties() {
    return new PropertySourcesPlaceholderConfigurer();
  }
}
