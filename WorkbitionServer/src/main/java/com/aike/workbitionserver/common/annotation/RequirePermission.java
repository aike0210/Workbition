package com.aike.workbitionserver.common.annotation;

import java.lang.annotation.*;

/**
 * 权限校验注解
 * 标注在Controller方法上，用于校验当前用户是否拥有指定权限
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequirePermission {

    /**
     * 权限编码
     */
    String value();

    /**
     * 资源类型（org/project），用于数据权限校验
     */
    String resourceType() default "";

    /**
     * 资源ID参数名（从路径变量或请求参数中获取）
     */
    String resourceIdParam() default "";
}
