package com.yc.learn.restconf;

import com.yc.learn.security.LoginFilter;
import com.yc.learn.security.detailsService.CustomUserDetailsService;
import com.yc.learn.security.provider.CustomAuthenticationProvider;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * @Auther: yangchun
 * @Date: 2017-8-19 10:30
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
//@EnableGlobalMethodSecurity(securedEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  @Override
  @Autowired  //需全局注入，@EnableGlobalMethodSecurity才可使用
  public void configure(AuthenticationManagerBuilder auth) throws Exception {
    //super.configure(auth);
    //auth.inMemoryAuthentication()
    //    .withUser("user").password("password").roles("USER");
    //    .and()
    //    .withUser("admin").password("password").roles("ADMIN");
    //auth.jdbcAuthentication()
    //    .dataSource(dataSource);
    //auth.jdbcAuthentication().dataSource(dataSource);
        //auth.userDetailsService(myUserDetailsService());
            //passwordEncoder(passwordEncoder()).and().build();
    auth.authenticationProvider(customAuthenticationProvider());
  }

  //@Bean
  //public AuthenticationManager authenticationManagerBean() throws Exception {
  //  return super.authenticationManagerBean();
  //}

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    //super.configure(http);
    http
      .csrf().disable()
      .authorizeRequests()
        // 放行带public的路径
        .antMatchers("/public/**").permitAll()
        //.antMatchers("/manage/**").hasRole("ADMIN")
        .antMatchers("/auth/**").authenticated()
        //.antMatchers("/foo/get").access(" hasRole('ROLE_admin') and  hasIpAddress('11.12.109.123')")
        //.antMatchers("/foo/get").permitAll()
            //.access(" hasRole('ROLE_user') ")
        .anyRequest().authenticated()
        //.and().httpBasic()
        //.and().formLogin()
        .and().logout()
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
        .and().addFilterBefore(loginFilter(), UsernamePasswordAuthenticationFilter.class);
        //.addFilterBefore(new LogoutFilter("/login*"), UsernamePasswordAuthenticationFilter.class);

  }

  @Bean
  public LoginFilter loginFilter() {
    LoginFilter filter = new LoginFilter("/j_spring_security_check");

    try {
      filter.setAuthenticationManager(authenticationManager());
      filter.setRequiresAuthenticationRequestMatcher(new AntPathRequestMatcher("/login", "POST"));
    } catch (Exception e) {
      e.printStackTrace();
    }

    return filter;
  }

  @Override
  public void configure(WebSecurity web) throws Exception {
    web.ignoring().antMatchers("/resources/**")
    .antMatchers("/images/**")
    .antMatchers("/script/**")
    .antMatchers("/themes/**")
    .antMatchers("/view/**");
  }

  @Bean
  public CustomAuthenticationProvider customAuthenticationProvider() {
    return new CustomAuthenticationProvider();
  }

  //@Bean
  //public CustomAuthenticationProvider authenticationProvider() {
  //  final CustomAuthenticationProvider authProvider = new CustomAuthenticationProvider();
  //  authProvider .setUserDetailsService(myUserDetailsService());
  //  authProvider.setPasswordEncoder(encoder());
  //  return authProvider;
  //}

  @Bean
  public UserDetailsService myUserDetailsService() {
    //return super.userDetailsService();
    //InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
    //manager.createUser(User; .withUsername("user").password("password").roles("USER"));
    return new CustomUserDetailsService();
  }

  //@Bean
  //public BCryptPasswordEncoder passwordEncoder() {
  //  return new BCryptPasswordEncoder();
  //}

  //@Override
  //@Bean
  //public AuthenticationManager authenticationManager() throws Exception {
  //  //return super.authenticationManager();
  //  return new ProviderManager();
  //}
}
