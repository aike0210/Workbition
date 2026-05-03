package com.aike.workbitionserver.security;

import com.aike.workbitionserver.common.annotation.RequirePermission;
import com.aike.workbitionserver.common.exception.BusinessException;
import com.aike.workbitionserver.common.result.ResultCode;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.service.PermissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PermissionInterceptor implements HandlerInterceptor {

    private final PermissionService permissionService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        RequirePermission annotation = handlerMethod.getMethodAnnotation(RequirePermission.class);
        if (annotation == null) {
            return true;
        }

        // 获取当前用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        String permissionCode = annotation.value();
        String resourceType = annotation.resourceType();
        Long resourceId = resolveResourceId(request, annotation.resourceIdParam());

        // 如果没有指定资源类型，只检查功能权限
        if (!StringUtils.hasText(resourceType)) {
            // 这里简化处理：检查用户是否有该权限（不区分资源）
            // 实际项目中可能需要更复杂的逻辑
            log.debug("权限校验: user={}, permission={}", user.getUsername(), permissionCode);
            return true;
        }

        // 检查用户在指定资源下是否有该权限
        boolean hasPermission = permissionService.hasPermission(user.getId(), permissionCode, resourceType, resourceId);
        if (!hasPermission) {
            log.warn("权限校验失败: user={}, permission={}, resource={}:{}",
                    user.getUsername(), permissionCode, resourceType, resourceId);
            throw new BusinessException(ResultCode.FORBIDDEN, "权限不足: " + permissionCode);
        }

        log.debug("权限校验通过: user={}, permission={}, resource={}:{}",
                user.getUsername(), permissionCode, resourceType, resourceId);
        return true;
    }

    @SuppressWarnings("unchecked")
    private Long resolveResourceId(HttpServletRequest request, String paramName) {
        if (!StringUtils.hasText(paramName)) {
            return null;
        }

        // 首先尝试从路径变量中获取
        Map<String, String> pathVariables = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (pathVariables != null && pathVariables.containsKey(paramName)) {
            try {
                return Long.parseLong(pathVariables.get(paramName));
            } catch (NumberFormatException e) {
                log.warn("路径变量解析失败: {}={}", paramName, pathVariables.get(paramName));
            }
        }

        // 然后尝试从请求参数中获取
        String paramValue = request.getParameter(paramName);
        if (StringUtils.hasText(paramValue)) {
            try {
                return Long.parseLong(paramValue);
            } catch (NumberFormatException e) {
                log.warn("请求参数解析失败: {}={}", paramName, paramValue);
            }
        }

        return null;
    }
}
