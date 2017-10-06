package com.yc.learn.security;

import com.yc.learn.exception.RestException;
import com.yc.learn.utils.JsonMapperProvide;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import static org.springframework.security.jwt.codec.Codecs.utf8Decode;
import static org.springframework.security.jwt.codec.Codecs.utf8Encode;
import static org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.SPRING_SECURITY_FORM_PASSWORD_KEY;
import static org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.SPRING_SECURITY_FORM_USERNAME_KEY;

/**
 * @Auther: yangchun
 * @Date: 2017-8-26 16:09
 */
public class LoginFilter extends AbstractAuthenticationProcessingFilter {

  private Logger logger = LoggerFactory.getLogger(LoginFilter.class);

  private String usernameParameter = SPRING_SECURITY_FORM_USERNAME_KEY;
  private String passwordParameter = SPRING_SECURITY_FORM_PASSWORD_KEY;

  @Autowired
  private MacSigner macSigner;

  @Autowired
  private JedisPool jedisPool;

  public LoginFilter(String defaultFilterProcessesUrl) {
    super(defaultFilterProcessesUrl);
  }

  public Authentication attemptAuthentication(HttpServletRequest httpServletRequest,
      HttpServletResponse httpServletResponse)
      throws AuthenticationException, IOException, ServletException {

    if (true && !httpServletRequest.getMethod().equals("POST")) {
      throw new AuthenticationServiceException(
          "Authentication method not supported: " + httpServletRequest.getMethod());
    }
    //WebUtils

    // 表单参数
    // String username = obtainUsername(httpServletRequest);
    // String password = obtainPassword(httpServletRequest);
    String username = null;
    String password = null;
    // 获取application/json
    String params = getRequestPostBytes(httpServletRequest);
    if (StringUtils.isNotBlank(params)) {
      Map<String, String> map = JsonMapperProvide.alwaysMapper().readValue(params, Map.class);
      username = map.get("username");
      password = map.get("password");
    }

    if (username == null) {
      username = "";
    }

    if (password == null) {
      password = "";
    }

    username = username.trim();

    UsernamePasswordAuthenticationToken authRequest =
        new UsernamePasswordAuthenticationToken(username, password);

    return this.getAuthenticationManager().authenticate(authRequest);
  }

  @Override
  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
      throws IOException, ServletException {

    String token = ((HttpServletRequest) req).getHeader("x-auth-token");
    // TODO 校验token是否过期
    if (null != token) {
      try {
        //Jwt jwt = JwtHelper.decodeAndVerify(token, hmacsha256);
        //Map<String, Object> map = JsonMapperProvide.alwaysMapper().readValue (jwt.getClaims(), Map.class);
        Jedis jedis = jedisPool.getResource();
        String userStr = jedis.get(token);
        jedis.close();
        if (StringUtils.isNotBlank(userStr)) {

          Map<String, Object> map = JsonMapperProvide.alwaysMapper().readValue(userStr, Map.class);
          User user =
              new User(map.get("username").toString(), "", new ArrayList<GrantedAuthority>());
          UsernamePasswordAuthenticationToken authenticationToken =
              new UsernamePasswordAuthenticationToken(user, user.getPassword(),
                  user.getAuthorities());
          authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(
              (HttpServletRequest) req));
          SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }
      } catch (Exception e) {
        logger.error("----解析token出现异常-------", e);
        //throw new AuthenticationException("token无效", e);
        //unsuccessfulAuthentication(req, res, );
        //authenticationEntryPoint.commence(request, response, failed);
      }
    }

    super.doFilter(req, res, chain);
  }

  private String getRequestPostBytes(HttpServletRequest request) throws IOException {
    int contentLength = request.getContentLength();
    if (contentLength < 0) {
      return null;
    }
    byte buffer[] = new byte[contentLength];
    for (int i = 0; i < contentLength; ) {
      int readLen = request.getInputStream().read(buffer, i, contentLength - i);
      if (readLen == -1) {
        break;
      }
      i += readLen;
    }

    return new String(buffer);
  }

  protected String obtainUsername(HttpServletRequest request) {
    return request.getParameter("username");
  }

  protected String obtainPassword(HttpServletRequest request) {
    return request.getParameter("password");
  }
}
