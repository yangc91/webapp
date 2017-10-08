package com.yc.learn.security;

import com.yc.learn.exception.ErrorMessage;
import com.yc.learn.utils.JsonMapperProvide;
import com.yc.learn.utils.ResponseUtils;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/**
 * @Auther: yangchun
 * @Date: 2017-9-21 14:27
 */
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private static final Logger logger = LoggerFactory.getLogger(RestAuthenticationEntryPoint.class);

  /**
   * Always returns a 403 error code to the client.
   */
  public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException arg2) throws IOException,
      ServletException {
    if (logger.isDebugEnabled()) {
      logger.debug("Pre-authenticated entry point called. Rejecting access");
    }
    //HttpServletResponse httpResponse = (HttpServletResponse) response;
    //httpResponse.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
    response.setStatus(HttpServletResponse.SC_FORBIDDEN);//403
    ResponseUtils.writeUtf8JSON(response,
        JsonMapperProvide.alwaysMapper().writeValueAsString((new ErrorMessage(403, "0x0012", "unauthorized"))));
  }

}
