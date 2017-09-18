package com.yc.learn.security.detailsService;

import java.util.Collection;
import java.util.HashSet;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.provisioning.UserDetailsManager;

/**
 * @Auther: yangchun
 * @Date: 2017-8-25 11:56
 */
public class CustomUserDetailsService implements UserDetailsService {

  private final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

  @Autowired
  private DataSource dataSource;

  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    try {
      User user = new User("user", "password", null);
      //if (user != null) return new CustomUserDetails(user, getAuthorities(user));
      return user;
    } catch (Exception ex) {
      logger.error("Exception in CustomUserDetailsService: " + ex);
    }
    return null;
  }

  public void createUser(UserDetails userDetails) {

  }

  public void updateUser(UserDetails userDetails) {

  }

  public void deleteUser(String s) {

  }

  public void changePassword(String s, String s1) {

  }

  public boolean userExists(String s) {
    return false;
  }

  //private Collection<GrantedAuthority> getAuthorities(User user) {
  //  Collection<GrantedAuthority> authorities = new HashSet<>();
  //  for (Role role : user.getRoles()) {
  //    GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(role.getRole());
  //    authorities.add(grantedAuthority);
  //  }
  //  return authorities;
  //}

}
