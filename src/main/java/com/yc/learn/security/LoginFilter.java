package com.yc.learn.security;

import com.yc.learn.utils.JsonMapperProvide;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.jwt.Jwt;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.jwt.crypto.sign.MacSigner;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.stereotype.Component;

import static org.springframework.security.jwt.codec.Codecs.utf8Decode;
import static org.springframework.security.jwt.codec.Codecs.utf8Encode;
import static org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.SPRING_SECURITY_FORM_PASSWORD_KEY;
import static org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.SPRING_SECURITY_FORM_USERNAME_KEY;

/**
 * @Auther: yangchun
 * @Date: 2017-8-26 16:09
 */
public class LoginFilter  extends AbstractAuthenticationProcessingFilter {

  private Logger logger = LoggerFactory.getLogger(LoginFilter.class);

  private String usernameParameter = SPRING_SECURITY_FORM_USERNAME_KEY;
  private String passwordParameter = SPRING_SECURITY_FORM_PASSWORD_KEY;

  static final MacSigner hmacsha256 = new MacSigner(utf8Encode("uuidtest123456qwert"));

  public LoginFilter(String defaultFilterProcessesUrl) {
    super(defaultFilterProcessesUrl);
  }

  public Authentication attemptAuthentication(HttpServletRequest httpServletRequest,
      HttpServletResponse httpServletResponse)
      throws AuthenticationException, IOException, ServletException {

    if (true && !httpServletRequest.getMethod().equals("POST")) {
      throw new AuthenticationServiceException("Authentication method not supported: " + httpServletRequest.getMethod());
    }
    //RunAsUserToken auth = new RunAsUserToken(null, null, null,null);
    //if(!au)
    //String token = httpServletRequest.getHeader("token");
    //if ( null == token ) {
    //  throw new RestException(HttpStatus.UNAUTHORIZED, "xxx", "xxx");
    //}

    //if (logger.isDebugEnabled()) {
    //  logger.debug("获取请求携带的Authorization:{}", token);
    //}

    String username = obtainUsername(httpServletRequest);
    String password = obtainPassword(httpServletRequest);

    if (username == null) {
      username = "";
    }

    if (password == null) {
      password = "";
    }

    username = username.trim();

    UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(username, password);
    Jwt jwt = JwtHelper.encode(JsonMapperProvide.alwaysMapper().writeValueAsString(authRequest), hmacsha256);

    String token = utf8Decode(jwt.bytes());

    Jwt jwtTest = JwtHelper.decodeAndVerify(token, hmacsha256);
    return this.getAuthenticationManager().authenticate(authRequest);
  }

  //@Override
  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
      throws IOException, ServletException {


    //String token = ((HttpServletRequest)req).getHeader("token");
    List<GrantedAuthority> test = new ArrayList<>();
    String token = ((HttpServletRequest)req).getParameter("token");

    //TODO 暂时不拦截
    //if ( null != token ) {
      //Jwt jwt = JwtHelper.decodeAndVerify(token, hmacsha256);
      //throw new RestException(HttpStatus.UNAUTHORIZED, "xxx", "xxx");
      User user =new User("test", "123", true, true, true,true, test);
      UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(user, "123", test);
      SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    //}

    super.doFilter(req, res, chain);
  }

  protected String obtainUsername(HttpServletRequest request) {
    return request.getParameter("username");
  }

  protected String obtainPassword(HttpServletRequest request) {
    return request.getParameter("password");
  }
}
