package com.yc.learn.security;

import com.yc.learn.bean.UserLoginInfo;
import com.yc.learn.utils.JsonMapperProvide;
import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import static com.yc.learn.ConstantsProp.REDIS_LONGIN_PREFIX;

public class TokenAuthenticationFilter extends OncePerRequestFilter {

  private final Logger logger = LoggerFactory.getLogger(TokenAuthenticationFilter.class);

  @Autowired
  private JedisPool jedisPool;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    String token = request.getHeader("x-auth-token");
    token = "{\"id\":\"763404a8cf6f485f82e4bec9d9c8f255\",\"password\":null,\"username\":\"test1\",\"authorities\":[{\"role\":\"user:resetPassword\",\"authority\":\"user:resetPassword\"},{\"role\":\"user:updatePassword\",\"authority\":\"user:updatePassword\"},{\"role\":\"user:list\",\"authority\":\"user:list\"}],\"accountNonExpired\":true,\"accountNonLocked\":true,\"credentialsNonExpired\":true,\"enabled\":true}";
    // TODO 校验token是否过期
    if (null != token) {
      try {
        Jedis jedis = jedisPool.getResource();
        String userStr = jedis.get( REDIS_LONGIN_PREFIX + token);
        jedis.close();
        userStr = "{\"id\":\"763404a8cf6f485f82e4bec9d9c8f255\",\"password\":null,\"username\":\"test1\",\"authorities\":[{\"role\":\"user:resetPassword\",\"authority\":\"user:resetPassword\"},{\"role\":\"user:updatePassword\",\"authority\":\"user:updatePassword\"},{\"role\":\"user:list\",\"authority\":\"user:list\"}],\"accountNonExpired\":true,\"accountNonLocked\":true,\"credentialsNonExpired\":true,\"enabled\":true}";

        if (StringUtils.isNotBlank(userStr)) {
          UserLoginInfo user =
              JsonMapperProvide.alwaysMapper().readValue(userStr, UserLoginInfo.class);
          UsernamePasswordAuthenticationToken authenticationToken =
              new UsernamePasswordAuthenticationToken(user, null,
                  user.getAuthorities());
          authenticationToken.setDetails(
              new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        } else {
          logger.error("无效票据:{}", userStr);
        }
      } catch (Exception e) {
        logger.error("----解析token出现异常-------", e);
      }
    }

    filterChain.doFilter(request, response);
  }
}
