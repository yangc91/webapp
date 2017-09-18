package com.yc.learn.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 自定义权限， 将在 {PermissionInterceptor}中对当前方法进行权限校验
 * @Auther: yangchun
 * @Date: 2017-9-5 17:50
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PrePermission {

  /** permission code */
  String value() default "";

  /** permission name */
  String name() default "";

}