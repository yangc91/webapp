package com.yc.learn.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.jwt.Jwt;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;

public class TokenFilter extends AbstractAuthenticationProcessingFilter {

  private final Logger logger = LoggerFactory.getLogger(TokenFilter.class);

  public TokenFilter(String defaultFilterProcessesUrl) {
    super(defaultFilterProcessesUrl);
  }

  @Override
  public Authentication attemptAuthentication(HttpServletRequest request,
      HttpServletResponse response) throws AuthenticationException, IOException, ServletException {

    String header = request.getHeader("Authorization");
    if (null == header && !header.startsWith("Bearer ")) {
      throw new BadCredentialsException("Could not obtain access token");
    }
    if (logger.isDebugEnabled()) {
      logger.debug("获取请求携带的Authorization：{}", header);
    }

    String authToken = header.substring(7);

    //JwtAuth
    Jwt jwt = JwtHelper.decode(authToken);
    //final OpenIdConnectUserDetails user = new OpenIdConnectUserDetails(authInfo, accessToken);
    //return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    //} catch (final InvalidTokenException e) {
    //  throw new BadCredentialsException("Could not obtain user details from token", e);
    //}

    return null;
  }


}
