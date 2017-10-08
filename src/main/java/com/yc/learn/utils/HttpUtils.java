package com.yc.learn.utils;

import java.io.IOException;
import javax.servlet.http.HttpServletRequest;

/**
 * @Auther: yangchun
 * @Date: 2017-9-28 15:14
 */
public class HttpUtils {

  /**
   * 从HttpServletRequest中获取 json 传递的参数
   * @param request
   * @return
   * @throws IOException
   */
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
}
