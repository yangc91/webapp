package com.yc.learn.security.provider;

import java.util.Collection;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * @Auther: yangchun
 * @Date: 2017-8-25 11:40
 */
public class CustomAuthenticationProvider extends DaoAuthenticationProvider {

  private static Logger logger = LoggerFactory.getLogger(CustomAuthenticationProvider.class);

  public Authentication authenticate(Authentication auth) throws AuthenticationException {

    String username = auth.getName();
    String password = auth.getCredentials().toString();

    UserDetails u = null;

    try {
      u = getUserDetailsService().loadUserByUsername(username);
    } catch (UsernameNotFoundException ex) {
      logger.error("User '" + username + "' not found");
    } catch (Exception e) {
      logger.error("Exception in CustomDaoAuthenticationProvider: " + e);
    }

    if (u != null) {
      if (getPasswordEncoder().isPasswordValid(password, u.getPassword(), null)) {
        return new UsernamePasswordAuthenticationToken(u, password, u.getAuthorities());
      }
    }

    throw new BadCredentialsException(messages.getMessage("CustomDaoAuthenticationProvider.badCredentials", "Bad credentials"));
  }

  public boolean supports(Class<?> aClass) {
    return true;
    //return false;
  }
}
