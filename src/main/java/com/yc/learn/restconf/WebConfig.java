package com.yc.learn.restconf;

import com.alibaba.druid.pool.DruidDataSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.yc.learn.activiti.EventListener.MyEventListener;
import com.yc.learn.activiti.entitymanager.CustomUserEntityManager;
import com.yc.learn.interceptor.PermissionInterceptor;
import com.yc.learn.service.IUserService;
import com.yc.learn.utils.JsonMapperProvide;
import com.yc.learn.xss.DefaultJsonDeserializer;
import com.yc.learn.xss.DefaultJsonSerializer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Resource;
import javax.sql.DataSource;
import org.activiti.engine.HistoryService;
import org.activiti.engine.IdentityService;
import org.activiti.engine.ManagementService;
import org.activiti.engine.ProcessEngine;
import org.activiti.engine.ProcessEngineConfiguration;
import org.activiti.engine.RepositoryService;
import org.activiti.engine.RuntimeService;
import org.activiti.engine.TaskService;
import org.activiti.engine.delegate.event.ActivitiEventListener;
import org.activiti.spring.ProcessEngineFactoryBean;
import org.activiti.spring.SpringProcessEngineConfiguration;
import org.nutz.dao.Sqls;
import org.nutz.dao.impl.NutDao;
import org.nutz.dao.sql.Sql;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.ImportResource;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisSentinelConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.converter.BufferedImageHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.SimpleDriverDataSource;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.InternalResourceViewResolver;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

/**
 * @author: yangchun
 * @Date: 2017-7-28 17:38
 * @EnableWebMvc == <mvc:annotation-driven />
 * @ComponentScan == < context:component-scan base-package= "org.rest" />
 * @EnableAspectJAutoProxy == <aop:aspectj-autoproxy>
 * @ImportResource == <import resource=”classpath*:/rest_config.xml” />
 *
 * < context:property-placeholder location= "classpath:persistence.properties,
 * classpath:web.properties" ignore-unresolvable=
 */
@Configuration
@EnableWebMvc
//@EnableAspectJAutoProxy   // 启用aspectJ自动代理
@ComponentScan(basePackages = "com.yc.learn")
@PropertySource({"classpath:system.properties"})
@ImportResource({"classpath*:/rest_config.xml"})
//@ComponentScan(basePackages = {"com.yc.learn"},excludeFilters = {@ComponentScan.Filter(type= FilterType.ANNOTATION, value = {EnableWebMvc.class,
//org.springframework.stereotype.Controller.class
//    })
//,@ComponentScan.Filter(type= FilterType.ASSIGNABLE_TYPE, value = FooController.class)
//    ,@ComponentScan.Filter(type= FilterType.REGEX, pattern = {"com.yc.learn.controller.*", "com.yc.learn.restconf.*"})
//, "com.yc.learn.restconf.*"
//})
public class WebConfig extends WebMvcConfigurerAdapter {

  public Logger logger = LoggerFactory.getLogger(this.getClass());

  @Bean
  public static PropertySourcesPlaceholderConfigurer properties() {
    return new PropertySourcesPlaceholderConfigurer();
  }

  @Autowired
  private Environment environment;

  //@Autowired
  //private DataSourceTransactionManager transactionManager;

  @Bean
  public NutDao nutDao(DataSource dataSource) {
    return new NutDao(dataSource);
  }

  @Bean
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


  /**
   * 配置视图解析器
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
   */
  @Override
  public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
    configurer.enable();
  }

  @Override
  public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
  }

  @Override
  public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
    //...额外添加转换器....
    SimpleModule module = new SimpleModule();
    module.addDeserializer(String.class, new DefaultJsonDeserializer());
    module.addSerializer(String.class, new DefaultJsonSerializer());
    ObjectMapper mapper = Jackson2ObjectMapperBuilder.json().build();
    mapper.registerModule(module);
    MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter(mapper);

    converters.add(converter);
  }

  /**
   * 添加自定义权限拦截器
   * @param registry
   */
  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new PermissionInterceptor())
        .addPathPatterns("/**")  // 需指定拦截路径，才会创建MappedInterceptor，下面的exclude的路径才会放行
        .excludePathPatterns("/**/public/**");
  }

  //@Bean
  //public SpringProcessEngineConfiguration processEngineConfiguration() {
  //  SpringProcessEngineConfiguration configuration = new SpringProcessEngineConfiguration();
  //  configuration.setTransactionManager(transactionManager);
  //  configuration.setDataSource(dataSourceActivi3());
  //  configuration.setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE);
  //  configuration.setAsyncExecutorActivate(false);
  //
  //  // event listener 所有事件类型的listener
  //  //List<ActivitiEventListener> eventListeners = new ArrayList<>();
  //  //eventListeners.add(myEventListener());
  //  //configuration.setEventListeners(eventListeners);
  //
  //  // event listener 指定类型的listener
  //  List<ActivitiEventListener> eventListeners = new ArrayList<>();
  //  eventListeners.add(myEventListener());
  //
  //  Map<String, List<ActivitiEventListener>> typedListeners = new HashMap<>();
  //  typedListeners.put("JOB_EXECUTION_SUCCESS,ENGINE_CREATED", eventListeners);
  //  //typedListeners.put("JOB_EXECUTION_SUCCESS", eventListeners);
  //  configuration.setTypedEventListeners(typedListeners);
  //
  //  //configuration.setGroupEntityManager()
  //
  //
  //  return configuration;
  //}

  //@Autowired
  //@Bean
  //public CustomUserEntityManager customUserEntityManager(SpringProcessEngineConfiguration processEngineConfiguration, IUserService userService) {
  //  CustomUserEntityManager customUserEntityManager = new CustomUserEntityManager(processEngineConfiguration);
  //  customUserEntityManager.setUserService(userService);
  //  processEngineConfiguration.setUserEntityManager(customUserEntityManager);
  //  return customUserEntityManager;
  //}

  //@Bean
  //public DataSourceTransactionManager transactionManager() {
  //  return new DataSourceTransactionManager(dataSourceActivi3());
  //}

  //@Bean
  //public ProcessEngine processEngine() {
  //  ProcessEngineFactoryBean factoryBean = new ProcessEngineFactoryBean();
  //  factoryBean.setProcessEngineConfiguration(processEngineConfiguration());
  //  ProcessEngine processEngine = null;
  //  try {
  //    processEngine = factoryBean.getObject();
  //  } catch (Exception e) {
  //    logger.error("activiti 引擎启动失败", e);
  //  }
  //
  //  return processEngine;
  //}
  //
  //@Bean
  //public RepositoryService repositoryService(ProcessEngine processEngine) {
  //  return processEngine.getRepositoryService();
  //}
  //
  //@Bean
  //public RuntimeService runtimeService(ProcessEngine processEngine) {
  //  return processEngine.getRuntimeService();
  //}
  //
  //@Bean
  //public TaskService taskService(ProcessEngine processEngine) {
  //  return processEngine.getTaskService();
  //}
  //
  //@Bean
  //public HistoryService historyService(ProcessEngine processEngine) {
  //  return processEngine.getHistoryService();
  //}
  //
  //@Bean
  //public ManagementService managementService(ProcessEngine processEngine) {
  //  return processEngine.getManagementService();
  //}
  //
  //@Bean
  //public MyEventListener myEventListener() {
  //
  //  return new MyEventListener();
  //}
  //
  //@Bean
  //public IdentityService identityService() {
  //  return processEngine().getIdentityService();
  //}


  //@Autowired
  //private RedisTemplate<String, String> template;
  //
  //// inject the template as ListOperations
  //@Resource(name="redisTemplate")
  //private ListOperations<String, String> listOps;

  ///**
  // * jedis
  // */
  //@Bean
  //public RedisConnectionFactory jedisConnectionFactory() {
  //  RedisSentinelConfiguration sentinelConfig = new RedisSentinelConfiguration()
  //      .master("mymaster")
  //      .sentinel("127.0.0.1", 26379)
  //      .sentinel("127.0.0.1", 26380);
  //  JedisConnectionFactory jedisConnectionFactory = new JedisConnectionFactory();
  //  return jedisConnectionFactory;
  //}
  //
  //@Bean
  //public RedisTemplate<String, String> redisTemplate() {
  //  RedisTemplate<String, String> template = new RedisTemplate<String, String>();
  //  template.setConnectionFactory(jedisConnectionFactory());
  //  return template;
  //}
  //
  //@Resource(name="redisTemplate")
  //@Bean
  //public String test() {
  //  listOps.leftPush("aaa", "xxxxxxxxx");
  //  listOps.leftPush("11", "2222");
  //  return "";
  //}
}
