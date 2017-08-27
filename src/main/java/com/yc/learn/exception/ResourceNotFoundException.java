package com.yc.learn.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * @Auther: yangchun
 * @Date: 2017-7-29 11:14
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "not fount")
public class ResourceNotFoundException extends RuntimeException {
}
