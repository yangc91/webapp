package com.yc.learn.rest;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.servlet.configuration.EnableWebMvcSecurity;

/**
 * @Auther: yangchun
 * @Date: 2017-8-19 10:30
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    //super.configure(auth);
    auth.inMemoryAuthentication()
        .withUser("user").password("password").roles("USER")
        .and()
        .withUser("admin").password("password").roles("admin");
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    //super.configure(http);
    http.authorizeRequests()

        .antMatchers("/foo/get").access(" hasRole('ROLE_admin') and  hasIpAddress('11.12.109.123')")
        .anyRequest().authenticated()
        .and()
        .httpBasic().and()
        .formLogin().and()
        .logout()
          .logoutSuccessUrl("/")
          .logoutUrl("*/logout")
        //.httpBasic()
    ;

  }
}
