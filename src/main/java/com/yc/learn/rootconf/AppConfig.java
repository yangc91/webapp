package com.yc.learn.rootconf;

import com.alibaba.druid.pool.DruidDataSource;
import javax.sql.DataSource;
import org.nutz.dao.impl.NutDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.ImportResource;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

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
//@Configuration
//@ComponentScan(basePackages = {"com.yc.learn"})
//@ComponentScan(basePackages = {"com.yc.learn"},excludeFilters = {@ComponentScan.Filter(type= FilterType.ANNOTATION, value = {EnableWebMvc.class,
    //org.springframework.stereotype.Controller.class
//    })
//,@ComponentScan.Filter(type= FilterType.ASSIGNABLE_TYPE, value = FooController.class)
//    ,@ComponentScan.Filter(type= FilterType.REGEX, pattern = {"com.yc.learn.controller.*", "com.yc.learn.restconf.*"})
    //, "com.yc.learn.restconf.*"
//})
//@PropertySource({"classpath:system.properties"})
//@ImportResource({"classpath*:/rest_config.xml"})
public class AppConfig {

  //@Bean
  public static PropertySourcesPlaceholderConfigurer properties() {
    return new PropertySourcesPlaceholderConfigurer();
  }

  //@Autowired
  private Environment environment;

  //@Bean
  public NutDao nutDao(DataSource dataSource) {
    return new NutDao(dataSource);
  }

  //@Bean
  public DruidDataSource test() {
    DruidDataSource dataSource = new DruidDataSource();
    dataSource.setDriverClassName("com.mysql.jdbc.Driver");
    dataSource.setUsername("root");
    dataSource.setPassword("root");
    dataSource.setUrl("jdbc:mysql://127.0.0.1:3306/test");
    dataSource.setInitialSize(5);
    dataSource.setMinIdle(1);
    dataSource.setMaxActive(10);
    // 启用监控统计功能  dataSource.setFilters("stat");
    // for mysql  dataSource.setPoolPreparedStatements(false);

    return dataSource;
  }

  //@Bean
  public JedisPool jedisPool() {
    String host = environment.getProperty("redis.host", "localhost");
    String port = environment.getProperty("redis.port", "6379");
    String maxIdle = environment.getProperty("redis.maxIdle", "20");
    String maxTotal = environment.getProperty("redis.maxTotal", "200");
    String timeout = environment.getProperty("redis.timeout", "2000");

    JedisPoolConfig config = new JedisPoolConfig();
    config.setMaxIdle(Integer.valueOf(maxIdle));
    config.setMaxTotal(Integer.valueOf(maxTotal));

    JedisPool pool = new JedisPool(config, host, Integer.valueOf(port), Integer.valueOf(timeout));

    return pool;

  }

}
