package com.yc.learn.security.provider;

import java.util.Collection;
import java.util.Collections;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;

/**
 * @Auther: yangchun
 * @Date: 2017-8-25 11:40
 */
public class CustomAuthenticationProvider implements AuthenticationProvider {

  public Authentication authenticate(Authentication auth) throws AuthenticationException {
    final String username = auth.getName();
    final String password = auth.getCredentials()
        .toString();

    if ("test".equals(username) && "123".equals(password)) {
      UsernamePasswordAuthenticationToken test = new UsernamePasswordAuthenticationToken(username, password, null);
      return test;
    } else {
      throw new BadCredentialsException("External system authentication failed");
    }
  }

  public boolean supports(Class<?> aClass) {
    return true;
    //return false;
  }
}
