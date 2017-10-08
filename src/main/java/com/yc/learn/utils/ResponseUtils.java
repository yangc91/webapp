package com.yc.learn.utils;

import java.io.IOException;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @Auther: yangchun
 * @Date: 2017-8-3 9:55
 */
public class ResponseUtils {

  private static final Logger log = LoggerFactory.getLogger(ResponseUtils.class);

  /**
   * 方法描述：向HttpServletResponse中写数据
   * 设置ContentType为application/json;charset=utf-8
   * @author: zhangyq
   * @date: 2014-6-17 上午11:13:10
   * @param response
   * @param text
   */
  public static void writeUtf8JSON(HttpServletResponse response, String text) {
    response.setContentType("application/json;charset=UTF-8");
    response.setHeader("Pragma", "No-cache");
    response.setHeader("Cache-Control", "no-cache");
    response.setDateHeader("Expires", 0);
    try {
      response.getWriter().write(text);
      response.getWriter().flush();
      response.getWriter().close();
    } catch (IOException e) {
      log.error("向HttpServletResponse中写数据异常", e);
    }
  }

  /**
   * 向HttpServletResponse中写数据
   * 设置ContentType为html/txt;charset=utf-8
   * @param response
   * @param text 要写入的数据
   */
  public static void writeUtf8Text(HttpServletResponse response, String text) {
    response.setContentType("text/html;charset=UTF-8");//解决IE下，Ajax请求时，不能识别Json格式返回数据，直接弹出下载页面
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Cache-Control", "no-cache, must-revalidate");
    response.setHeader("Expires", "0");
    try {
      response.getWriter().write(text);
      response.getWriter().flush();
      response.getWriter().close();
    } catch (IOException e) {
      log.error("向HttpServletResponse中写数据异常", e);
    }
  }
}

