package com.yc.learn.rootconf;

import com.alibaba.druid.pool.DruidDataSource;

/**
 * @Auther: yangchun
 * @Date: 2017-7-28 15:06
 * @ImportResource == <import resource=”classpath*:/rest_config.xml” />
 *
 *
 *
 * < context:property-placeholder location= "classpath:persistence.properties,
 * classpath:web.properties" ignore-unresolvable=
 */
//@Configuration
//@ComponentScan(basePackages = {"com.yc.learn"})
//@ComponentScan(basePackages = {"com.yc.learn"},excludeFilters = {@ComponentScan.Filter(type= FilterType.ANNOTATION, value = {EnableWebMvc.class,
//org.springframework.stereotype.Controller.class
//    })
//,@ComponentScan.Filter(type= FilterType.ASSIGNABLE_TYPE, value = FooController.class)
//    ,@ComponentScan.Filter(type= FilterType.REGEX, pattern = {"com.yc.learn.controller.*", "com.yc.learn.restconf.*"})
//, "com.yc.learn.restconf.*"
//})
public class AppConfig {

  //@Bean
  public DruidDataSource dataSource() {
    DruidDataSource dataSource = new DruidDataSource();
    dataSource.setDriverClassName("com.mysql.jdbc.Driver");
    dataSource.setUsername("root");
    dataSource.setPassword("root");
    dataSource.setUrl("jdbc:mysql://127.0.0.1:3306/test");
    dataSource.setInitialSize(5);
    dataSource.setMinIdle(1);
    dataSource.setMaxActive(10);
    // 启用监控统计功能
    // dataSource.setFilters("stat");
    // for mysql
    // dataSource.setPoolPreparedStatements(false);

    return dataSource;
  }
}
