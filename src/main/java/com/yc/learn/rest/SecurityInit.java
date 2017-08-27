package com.yc.learn.rest;

import org.springframework.security.web.context.AbstractSecurityWebApplicationInitializer;
import org.springframework.stereotype.Component;

/**
 * 自动注册 DelegatingFilterProxy bean--> springSecurityFilterChain
 * @Auther: yangchun
 * @Date: 2017-8-19 10:05
 */
public class SecurityInit extends AbstractSecurityWebApplicationInitializer {

}
