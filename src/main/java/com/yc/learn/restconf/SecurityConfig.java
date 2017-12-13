package com.yc.learn.restconf;

import com.yc.learn.security.RestLoginSuccessHandler;
import com.yc.learn.security.RestAuthenticationEntryPoint;
import com.yc.learn.security.TokenAuthenticationFilter;
import com.yc.learn.security.detailsService.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.jwt.crypto.sign.MacSigner;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.jwt.codec.Codecs.utf8Encode;

/**
 * @Auther: yangchun
 * @Date: 2017-8-19 10:30
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  /**
   * 将AuthenticationManager注册为spring bean
   * 需全局注入，@EnableGlobalMethodSecurity才可使用
   * @throws Exception
   */
  @Bean
  @Override
  public AuthenticationManager authenticationManagerBean() throws Exception {
    return super.authenticationManagerBean();
  }

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.authenticationProvider(customAuthenticationProvider());
    super.configure(auth);
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
        .csrf().disable()
        .authorizeRequests()
        //管理员放行
        .antMatchers("/**").access(" hasRole('admin')")
        // 放行带public的路径
        .antMatchers("/public/**").permitAll()
        .antMatchers("/auth/**").authenticated()
        //.antMatchers("/foo/get").access(" hasRole('ROLE_admin') and  hasIpAddress('11.12.109.123')")
        //.antMatchers("/foo/get").permitAll()
        //.access(" hasRole('ROLE_user') ")
        .anyRequest().authenticated()
        .and().sessionManagement()
        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and().exceptionHandling().authenticationEntryPoint(new RestAuthenticationEntryPoint());

    http.addFilterBefore(tokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
  }

  @Bean
  public TokenAuthenticationFilter tokenAuthenticationFilter() {
    return new TokenAuthenticationFilter();
  }

  @Bean
  public RestLoginSuccessHandler restLoginSuccessHandler() {
    RestLoginSuccessHandler successHandler = new RestLoginSuccessHandler();
    successHandler.setHmacsha256(macSigner());
    return successHandler;
  }

  @Bean
  public MacSigner macSigner() {
    return new MacSigner(utf8Encode("uuidtest123456qwert"));
  }

  /**
   * 放行静态资源
   * @param web
   * @throws Exception
   */
  @Override
  public void configure(WebSecurity web) throws Exception {
    web.ignoring().antMatchers("/resources/**")
        .antMatchers("/images/**")
        .antMatchers("/script/**")
        .antMatchers("/themes/**")
        .antMatchers("/materialize/**")
        .antMatchers("/view/**");
  }

  @Bean
  public DaoAuthenticationProvider customAuthenticationProvider() {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(myUserDetailsService());
    provider.setPasswordEncoder(passwordEncoder());
    return provider;
  }

  @Bean
  public UserDetailsService myUserDetailsService() {
    return new CustomUserDetailsService();
  }

  @Bean
  public BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
