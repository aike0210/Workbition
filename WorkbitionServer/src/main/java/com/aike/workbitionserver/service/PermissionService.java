package com.aike.workbitionserver.service;

import com.aike.workbitionserver.entity.*;
import com.aike.workbitionserver.mapper.*;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final UserRoleMapper userRoleMapper;
    private final RoleMapper roleMapper;
    private final RolePermissionMapper rolePermissionMapper;
    private final PermissionMapper permissionMapper;
    private final OrgMemberMapper orgMemberMapper;

    /**
     * 检查用户是否拥有指定权限
     */
    public boolean hasPermission(Long userId, String permissionCode, String resourceType, Long resourceId) {
        Set<String> userPermissions = getUserPermissions(userId, resourceType, resourceId);
        return userPermissions.contains(permissionCode);
    }

    /**
     * 获取用户在指定资源下的所有权限编码
     */
    public Set<String> getUserPermissions(Long userId, String resourceType, Long resourceId) {
        // 获取用户的角色ID列表
        List<Long> roleIds = getUserRoleIds(userId, resourceType, resourceId);
        if (roleIds.isEmpty()) {
            return Collections.emptySet();
        }

        // 获取角色关联的权限ID列表
        List<Long> permissionIds = rolePermissionMapper.selectList(
                new LambdaQueryWrapper<RolePermission>()
                        .in(RolePermission::getRoleId, roleIds)
        ).stream()
                .map(RolePermission::getPermissionId)
                .distinct()
                .collect(Collectors.toList());

        if (permissionIds.isEmpty()) {
            return Collections.emptySet();
        }

        // 获取权限编码列表
        return permissionMapper.selectList(
                new LambdaQueryWrapper<Permission>()
                        .in(Permission::getId, permissionIds)
        ).stream()
                .map(Permission::getCode)
                .collect(Collectors.toSet());
    }

    /**
     * 获取用户在指定资源下的角色ID列表
     */
    private List<Long> getUserRoleIds(Long userId, String resourceType, Long resourceId) {
        if ("org".equals(resourceType) && resourceId != null) {
            // 获取组织级别角色
            OrgMember orgMember = orgMemberMapper.selectOne(
                    new LambdaQueryWrapper<OrgMember>()
                            .eq(OrgMember::getOrgId, resourceId)
                            .eq(OrgMember::getUserId, userId)
            );
            if (orgMember == null) {
                return Collections.emptyList();
            }

            // 根据组织角色code查找角色ID
            String roleCode = "org_" + orgMember.getRole();
            Role role = roleMapper.selectOne(
                    new LambdaQueryWrapper<Role>()
                            .eq(Role::getCode, roleCode)
                            .eq(Role::getType, "org")
            );
            return role != null ? List.of(role.getId()) : Collections.emptyList();
        }

        if ("project".equals(resourceType) && resourceId != null) {
            // 获取项目级别角色（从user_role表）
            List<UserRole> userRoles = userRoleMapper.selectList(
                    new LambdaQueryWrapper<UserRole>()
                            .eq(UserRole::getUserId, userId)
                            .eq(UserRole::getResourceType, "project")
                            .eq(UserRole::getResourceId, resourceId)
            );
            return userRoles.stream()
                    .map(UserRole::getRoleId)
                    .collect(Collectors.toList());
        }

        // 获取系统级别角色
        List<UserRole> userRoles = userRoleMapper.selectList(
                new LambdaQueryWrapper<UserRole>()
                        .eq(UserRole::getUserId, userId)
                        .eq(UserRole::getResourceType, "system")
        );
        return userRoles.stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());
    }

    /**
     * 检查用户是否是组织成员
     */
    public boolean isOrgMember(Long userId, Long orgId) {
        return orgMemberMapper.exists(
                new LambdaQueryWrapper<OrgMember>()
                        .eq(OrgMember::getOrgId, orgId)
                        .eq(OrgMember::getUserId, userId)
        );
    }

    /**
     * 获取用户在组织中的角色
     */
    public String getUserOrgRole(Long userId, Long orgId) {
        OrgMember member = orgMemberMapper.selectOne(
                new LambdaQueryWrapper<OrgMember>()
                        .eq(OrgMember::getOrgId, orgId)
                        .eq(OrgMember::getUserId, userId)
        );
        return member != null ? member.getRole() : null;
    }
}
