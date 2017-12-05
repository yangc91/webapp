package com.yc.learn.security.detailsService;

import com.yc.learn.bean.UserGrantedAuthority;
import com.yc.learn.bean.UserLoginInfo;
import com.yc.learn.entity.UserInfo;
import com.yc.learn.service.IUserService;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import javax.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * @Auther: yangchun
 * @Date: 2017-8-25 11:56
 */
public class CustomUserDetailsService implements UserDetailsService {

  private static Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

  @Resource
  private IUserService userService;

  public CustomUserDetailsService() {
    super();
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    UserInfo userInfo = null;
    try {
      userInfo = userService.getUserByName(username);
    } catch (Exception ex) {
      logger.error("查询用户信息出现异常: " + ex);
    }
    if (userInfo != null) {

      Set<UserGrantedAuthority> authoritySet = userService.listAuthroty(userInfo.getId());
      UserLoginInfo user =
          new UserLoginInfo(userInfo.getId(), userInfo.getLoginName(), userInfo.getPassword(),
              authoritySet);
      return user;
    } else {
      logger.error("Query returned no results for user '" + username + "'");
      throw new UsernameNotFoundException("未知用户");
    }
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
