package com.yc.learn.restconf;

import com.yc.learn.security.RestLoginSuccessHandler;
import com.yc.learn.security.LoginFilter;
import com.yc.learn.security.RestAuthenticationEntryPoint;
import com.yc.learn.security.TokenAuthenticationFilter;
import com.yc.learn.security.detailsService.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import static org.springframework.security.jwt.codec.Codecs.utf8Encode;

/**
 * @Auther: yangchun
 * @Date: 2017-8-19 10:30
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
// @EnableGlobalMethodSecurity(securedEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  /**
   *  将AuthenticationManager注册为spring bean
   * @return
   * @throws Exception
   */
  @Bean
  @Override
  public AuthenticationManager authenticationManagerBean() throws Exception {
    return super.authenticationManagerBean();
  }

  //@Autowired  //需全局注入，@EnableGlobalMethodSecurity才可使用
  //public void configureAuthentication(AuthenticationManagerBuilder auth) throws Exception {
  //  auth.userDetailsService(myUserDetailsService())
  //      .passwordEncoder(passwordEncoder());
  //  // auth.authenticationProvider(customAuthenticationProvider());
  //}

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    //auth.userDetailsService(myUserDetailsService())
    //    .passwordEncoder(passwordEncoder());
    auth.authenticationProvider(customAuthenticationProvider());
    super.configure(auth);
  }



  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .csrf().disable()
      .authorizeRequests()
        // 放行带public的路径
        .antMatchers("/public/**").permitAll()
        .antMatchers("/auth/**").authenticated()
        //.antMatchers("/foo/get").access(" hasRole('ROLE_admin') and  hasIpAddress('11.12.109.123')")
        //.antMatchers("/foo/get").permitAll()
            //.access(" hasRole('ROLE_user') ")
        .anyRequest().authenticated()
        //.and().httpBasic()
        //.and().formLogin()
        //.usernameParameter("username")
        //.passwordParameter("password")
        //.successHandler()
        //.and().logout()
          //.logoutSuccessUrl("/")
          //.logoutUrl("*/logout*")
        .and().sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        //.httpBasic()
        //http.antMatcher("/admin*").authorizeRequests().anyRequest().hasRole("ADMIN")
        //    // log in
        //    .and().formLogin().loginPage("/loginAdmin").loginProcessingUrl("/admin_login").failureUrl("/loginAdmin?error=loginError").defaultSuccessUrl("/adminPage")
        //    // logout
        //    .and().logout().logoutUrl("/admin_logout").logoutSuccessUrl("/protectedLinks").deleteCookies("JSESSIONID").and().exceptionHandling().accessDeniedPage("/403").and().csrf().disable();
        //    ;
        //.logout()
        //    .logoutUrl("*/logout*")
        //    .logoutSuccessUrl("/login.jsp")
        //    .permitAll()
        //    .and()
        //    .formLogin()
        //    .loginProcessingUrl("/login")
        //    .loginPage("/login.jsp")
        //    .failureUrl("/login.jsp?authentication_error=true")
        //    .defaultSuccessUrl("/index.html",Boolean.TRUE)
        //    .permitAll();
        .and().exceptionHandling().authenticationEntryPoint(new RestAuthenticationEntryPoint())
        //.and().addFilterBefore(loginFilter(), UsernamePasswordAuthenticationFilter.class);
        ;

        http.addFilterBefore(tokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        //http.addFilterBefore(loginFilter(), UsernamePasswordAuthenticationFilter.class)
        //.addFilterBefore(new LogoutFilter("/login*"), UsernamePasswordAuthenticationFilter.class);
  }

  //@Bean
  public LoginFilter loginFilter() {
    LoginFilter filter = new LoginFilter("/");

    try {
      filter.setAuthenticationManager(authenticationManager());
      filter.setRequiresAuthenticationRequestMatcher(new AntPathRequestMatcher("/login", "POST"));
      filter.setAuthenticationSuccessHandler(restLoginSuccessHandler());
    } catch (Exception e) {
      e.printStackTrace();
    }

    return filter;
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
    //CustomAuthenticationProvider provider = new CustomAuthenticationProvider();
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(myUserDetailsService());
    provider.setPasswordEncoder(passwordEncoder());
    return provider;
  }

  @Bean
  public UserDetailsService myUserDetailsService() {
    //return super.userDetailsService();
    //InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
    //manager.createUser(User; .withUsername("user").password("password").roles("USER"));
    return new CustomUserDetailsService();
  }

  @Bean
  public BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  //@Override
  //@Bean
  //public AuthenticationManager authenticationManager() throws Exception {
  //  //return super.authenticationManager();
  //  return new ProviderManager();
  //}
}
