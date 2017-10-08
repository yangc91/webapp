package com.yc.learn.security;

import com.yc.learn.utils.JsonMapperProvide;
import com.yc.learn.utils.ResponseUtils;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.jwt.Jwt;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.jwt.crypto.sign.MacSigner;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import static org.springframework.security.jwt.codec.Codecs.utf8Decode;
import static org.springframework.security.jwt.codec.Codecs.utf8Encode;

public class RestLoginSuccessHandler implements AuthenticationSuccessHandler {

  @Autowired
  private MacSigner hmacsha256;

  @Autowired
  private JedisPool jedisPool;

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws IOException {
    response.setStatus(HttpStatus.OK.value());
    //response.sendRedirect(request.getContextPath() + "/secured/success");
    Map<String, Object> map = new HashMap<>();
    map.put("success", true);
    //Jwt jwt = JwtHelper.encode(JsonMapperProvide.alwaysMapper().writeValueAsString(authentication.getPrincipal()),
    //    hmacsha256);
    //map.put("token", utf8Decode(jwt.bytes()));
    ;
    //User user = new User(null)
    String token = UUID.randomUUID().toString().replace("-","");
    Jedis jedis = jedisPool.getResource();
    jedis.setex(token, 1000*60*30, JsonMapperProvide.alwaysMapper().writeValueAsString(authentication.getPrincipal()));
    jedis.close();
    map.put("token", token);
    ResponseUtils.writeUtf8JSON(response, JsonMapperProvide.alwaysMapper().writeValueAsString(map));
  }

  public MacSigner getHmacsha256() {
    return hmacsha256;
  }

  public void setHmacsha256(MacSigner hmacsha256) {
    this.hmacsha256 = hmacsha256;
  }
}