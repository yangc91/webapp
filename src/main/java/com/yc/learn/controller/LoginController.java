package com.yc.learn.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yc.learn.bean.AuthenticationRequest;
import com.yc.learn.bean.UserLoginInfo;
import com.yc.learn.exception.RestException;
import com.yc.learn.utils.JsonMapperProvide;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.nutz.dao.impl.NutDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AccountStatusException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import static com.yc.learn.ConstantsProp.REDIS_LONGIN_PREFIX;

/**
 * @author yangchun
 * @Date: 2017-7-29 10:55
 */
@RestController
public class LoginController extends BaseController {

  @Autowired
  private AuthenticationManager authenticationManager;

  @Autowired
  private UserDetailsService userDetailsService;

  @Autowired
  private JedisPool jedisPool;

  @RequestMapping(value = "public/login", method = RequestMethod.POST)
  public Object login(@RequestBody AuthenticationRequest authenticationRequest, HttpServletRequest request, HttpServletResponse response)
      throws JsonProcessingException {

    logger.info("==========获取登录请求的输入参数: username: {}",authenticationRequest.getUsername());

    if (StringUtils.isBlank(authenticationRequest.getUsername()) || StringUtils.isBlank(
        authenticationRequest.getPassword())) {
      throw new RestException(HttpStatus.BAD_REQUEST, "0x0001", "缺少必要参数");
    }
    Authentication authentication = null;
    try {
      authentication = this.authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(),
              authenticationRequest.getPassword()));
    } catch (AccountStatusException e) {
      logger.error("账号状态锁定");
      throw new RestException(HttpStatus.BAD_REQUEST, "0x002", "账号状态锁定");
    } catch (BadCredentialsException e1) {
      logger.error("密码错误");
      throw new RestException(HttpStatus.BAD_REQUEST, "0x003", "用户名或密码错误");
    }

    String token = UUID.randomUUID().toString().replace("-", "");

    UserLoginInfo userLoginInfo =
        (UserLoginInfo) userDetailsService.loadUserByUsername(authenticationRequest.getUsername());
    // 清除敏感信息
    userLoginInfo.setPassword(null);
    // 将用户信息存入redis
    Jedis jedis = jedisPool.getResource();
    // 1个小时有效期
    jedis.setex(REDIS_LONGIN_PREFIX + token, 1000 * 60 * 60,
        JsonMapperProvide.alwaysMapper().writeValueAsString(userLoginInfo));
    jedis.close();
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("token", token);

    ((UsernamePasswordAuthenticationToken)authentication).setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authentication);

    return map;
  }
}
