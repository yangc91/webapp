package com.yc.learn.interceptor;

import com.yc.learn.annotation.PrePermission;
import com.yc.learn.exception.RestException;
import java.lang.reflect.Method;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
//import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

/**
 * 权限拦截器：验证是否有权访问相应接口
 * @Auther: yangchun
 * @Date: 2017-3-7 11:23
 */
public class PermissionInterceptor extends HandlerInterceptorAdapter {

    private Logger logger = LoggerFactory.getLogger(PermissionInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        //String urlPath = getAnnotationPath((HandlerMethod) handler);
        String needPermission =  getAnnotationPermission((HandlerMethod) handler);
        if (StringUtils.isNotBlank(needPermission)) {
            //response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);//使得response的值状态为自定义的
            //response.setHeader("Content-Type", "application/json;charset=utf-8");
            //response.setCharacterEncoding("utf-8");
            //response.getWriter().write("{\"msg\" : \"无权访问\"}");
            // response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "{\"msg\" : \"没有权限\"}");
            // response.sendError();

            if(logger.isDebugEnabled() ) {
                logger.debug("拦截：{}", request.getRequestURL());
            }

            throw new RestException(HttpStatus.FORBIDDEN, "xxx", "xxx");
            //return false;
        }

        return true;
        // 获取 access_token 进行鉴权
        //String access_token = request.getHeader(Constant.ACCESS_TOKEN_KEY);

        //if (StringUtils.isNotBlank(access_token)) {
        //    try {
        //
        //        String tokenJson = redisUtil.getRedisClient().hget(Constant.ACCESS_TOKEN_KEY, access_token);
        //
        //        if (StringUtils.isNotBlank(tokenJson)) {
        //            TokenInfo tokenInfo = JsonUtil.getMapper().readValue(tokenJson, TokenInfo.class);
        //            Set<String> urls = tokenInfo.getScopes();
        //            if (urls.contains(urlPath)) {
        //                if(logger.isDebugEnabled() ) {
        //                    logger.info("放行：{}", request.getRequestURL());
        //                }
        //
        //                return true;
        //            }
        //        }
        //
        //    } catch (Exception e) {
        //        logger.error("检测access_token出现异常", e);
        //    }
        //}

        //response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);//使得response的值状态为自定义的
        //response.setHeader("Content-Type", "application/json;charset=utf-8");
        //response.setCharacterEncoding("utf-8");
        //response.getWriter().write("{\"msg\" : \"无权访问\"}");
        //// response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "{\"msg\" : \"没有权限\"}");
        //// response.sendError();
        //
        //if(logger.isDebugEnabled() ) {
        //    logger.debug("拦截：{}", request.getRequestURL());
        //}
        //
        //return false;
    }

    // 获取handler的urlPath
    private String getAnnotationPath(HandlerMethod handlerMethod) {
        Class clz = handlerMethod.getBeanType();
        Method method = handlerMethod.getMethod();

        String urlPath = "";
        // 控制层 path
        RequestMapping
            typeAnnotation = (RequestMapping) AnnotationUtils.findAnnotation(clz, RequestMapping.class);
        if (typeAnnotation != null) {
            String[] typeValues = typeAnnotation.value();
            if (typeValues.length > 0) {
                urlPath = typeValues[0];
            }
        }

        // 方法注解
        RequestMapping methodAnnotation = (RequestMapping) AnnotationUtils.findAnnotation(method, RequestMapping.class);
        if (methodAnnotation != null) {
            String[] values = methodAnnotation.value();
            if (values.length > 0) {
                urlPath = urlPath + values[0];
            }
        }
        return urlPath;
    }

    // 获取method的permission
    private String getAnnotationPermission(HandlerMethod handlerMethod) {
        Method method = handlerMethod.getMethod();
        String permission = "";
        // 方法注解
        PrePermission perAnnotation = (PrePermission) AnnotationUtils.findAnnotation(method, PrePermission.class);
        if (perAnnotation != null) {
            permission = perAnnotation.value();
        }
        return permission;
    }

}
