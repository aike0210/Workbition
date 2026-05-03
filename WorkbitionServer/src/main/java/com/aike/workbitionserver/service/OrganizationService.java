package com.aike.workbitionserver.service;

import com.aike.workbitionserver.common.exception.BusinessException;
import com.aike.workbitionserver.common.result.ResultCode;
import com.aike.workbitionserver.dto.organization.*;
import com.aike.workbitionserver.entity.OrgMember;
import com.aike.workbitionserver.entity.Organization;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.mapper.OrgMemberMapper;
import com.aike.workbitionserver.mapper.OrganizationMapper;
import com.aike.workbitionserver.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationMapper organizationMapper;
    private final OrgMemberMapper orgMemberMapper;
    private final UserMapper userMapper;

    @Transactional
    public OrganizationResponse createOrganization(Long userId, CreateOrganizationRequest request) {
        // 创建组织
        Organization org = new Organization();
        org.setName(request.getName());
        org.setDescription(request.getDescription());
        org.setLogoUrl(request.getLogoUrl());
        org.setOwnerId(userId);
        org.setStatus(1);
        organizationMapper.insert(org);

        // 将创建者添加为组织所有者
        OrgMember member = new OrgMember();
        member.setOrgId(org.getId());
        member.setUserId(userId);
        member.setRole("owner");
        member.setJoinedAt(LocalDateTime.now());
        orgMemberMapper.insert(member);

        log.info("组织创建成功: {} (ID: {})", org.getName(), org.getId());

        return toOrganizationResponse(org, userId);
    }

    public List<OrganizationResponse> getUserOrganizations(Long userId) {
        // 查询用户所属的组织ID列表
        List<OrgMember> memberships = orgMemberMapper.selectList(
                new LambdaQueryWrapper<OrgMember>().eq(OrgMember::getUserId, userId)
        );

        if (memberships.isEmpty()) {
            return List.of();
        }

        List<Long> orgIds = memberships.stream()
                .map(OrgMember::getOrgId)
                .collect(Collectors.toList());

        List<Organization> organizations = organizationMapper.selectBatchIds(orgIds);

        return organizations.stream()
                .map(org -> toOrganizationResponse(org, userId))
                .collect(Collectors.toList());
    }

    public OrganizationResponse getOrganization(Long orgId, Long userId) {
        Organization org = organizationMapper.selectById(orgId);
        if (org == null) {
            throw new BusinessException(ResultCode.ORG_NOT_FOUND);
        }

        // 检查用户是否是组织成员
        checkOrgMember(orgId, userId);

        return toOrganizationResponse(org, userId);
    }

    @Transactional
    public OrganizationResponse updateOrganization(Long orgId, Long userId, UpdateOrganizationRequest request) {
        Organization org = organizationMapper.selectById(orgId);
        if (org == null) {
            throw new BusinessException(ResultCode.ORG_NOT_FOUND);
        }

        // 检查权限（只有所有者和管理员可以更新）
        checkOrgPermission(orgId, userId, "owner", "admin");

        if (request.getName() != null) {
            org.setName(request.getName());
        }
        if (request.getDescription() != null) {
            org.setDescription(request.getDescription());
        }
        if (request.getLogoUrl() != null) {
            org.setLogoUrl(request.getLogoUrl());
        }

        organizationMapper.updateById(org);
        log.info("组织更新成功: {} (ID: {})", org.getName(), org.getId());

        return toOrganizationResponse(org, userId);
    }

    @Transactional
    public void deleteOrganization(Long orgId, Long userId) {
        Organization org = organizationMapper.selectById(orgId);
        if (org == null) {
            throw new BusinessException(ResultCode.ORG_NOT_FOUND);
        }

        // 只有所有者可以删除组织
        if (!org.getOwnerId().equals(userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }

        // 删除组织成员
        orgMemberMapper.delete(
                new LambdaQueryWrapper<OrgMember>().eq(OrgMember::getOrgId, orgId)
        );

        // 删除组织
        organizationMapper.deleteById(orgId);
        log.info("组织删除成功: {} (ID: {})", org.getName(), orgId);
    }

    @Transactional
    public OrgMemberResponse addMember(Long orgId, Long operatorId, AddMemberRequest request) {
        Organization org = organizationMapper.selectById(orgId);
        if (org == null) {
            throw new BusinessException(ResultCode.ORG_NOT_FOUND);
        }

        // 检查操作者权限
        checkOrgPermission(orgId, operatorId, "owner", "admin");

        // 查找目标用户
        User targetUser = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getEmail, request.getEmail())
        );
        if (targetUser == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 检查是否已经是成员
        boolean exists = orgMemberMapper.exists(
                new LambdaQueryWrapper<OrgMember>()
                        .eq(OrgMember::getOrgId, orgId)
                        .eq(OrgMember::getUserId, targetUser.getId())
        );
        if (exists) {
            throw new BusinessException(ResultCode.ORG_MEMBER_ALREADY_EXISTS);
        }

        // 添加成员
        OrgMember member = new OrgMember();
        member.setOrgId(orgId);
        member.setUserId(targetUser.getId());
        member.setRole(request.getRole());
        member.setJoinedAt(LocalDateTime.now());
        orgMemberMapper.insert(member);

        log.info("组织成员添加成功: 用户{}加入组织{}", targetUser.getUsername(), org.getName());

        return toOrgMemberResponse(member, targetUser);
    }

    public List<OrgMemberResponse> getMembers(Long orgId, Long userId, int page, int size, String keyword) {
        // 检查用户是否是组织成员
        checkOrgMember(orgId, userId);

        LambdaQueryWrapper<OrgMember> wrapper = new LambdaQueryWrapper<OrgMember>()
                .eq(OrgMember::getOrgId, orgId);

        List<OrgMember> members = orgMemberMapper.selectList(wrapper);

        return members.stream().map(member -> {
            User user = userMapper.selectById(member.getUserId());
            return toOrgMemberResponse(member, user);
        }).collect(Collectors.toList());
    }

    @Transactional
    public OrgMemberResponse updateMemberRole(Long orgId, Long operatorId, Long targetUserId, UpdateMemberRoleRequest request) {
        Organization org = organizationMapper.selectById(orgId);
        if (org == null) {
            throw new BusinessException(ResultCode.ORG_NOT_FOUND);
        }

        // 检查操作者权限（只有所有者可以变更角色）
        checkOrgPermission(orgId, operatorId, "owner");

        // 查找目标成员
        OrgMember member = orgMemberMapper.selectOne(
                new LambdaQueryWrapper<OrgMember>()
                        .eq(OrgMember::getOrgId, orgId)
                        .eq(OrgMember::getUserId, targetUserId)
        );
        if (member == null) {
            throw new BusinessException(ResultCode.ORG_MEMBER_NOT_FOUND);
        }

        // 不能变更自己的角色
        if (operatorId.equals(targetUserId)) {
            throw new BusinessException("不能变更自己的角色");
        }

        member.setRole(request.getRole());
        orgMemberMapper.updateById(member);

        User targetUser = userMapper.selectById(targetUserId);
        log.info("组织成员角色变更成功: 用户{}在组织{}中的角色变更为{}", targetUser.getUsername(), org.getName(), request.getRole());

        return toOrgMemberResponse(member, targetUser);
    }

    @Transactional
    public void removeMember(Long orgId, Long operatorId, Long targetUserId) {
        Organization org = organizationMapper.selectById(orgId);
        if (org == null) {
            throw new BusinessException(ResultCode.ORG_NOT_FOUND);
        }

        // 检查操作者权限
        checkOrgPermission(orgId, operatorId, "owner", "admin");

        // 不能移除自己
        if (operatorId.equals(targetUserId)) {
            throw new BusinessException("不能移除自己，请使用退出组织功能");
        }

        // 不能移除所有者
        if (org.getOwnerId().equals(targetUserId)) {
            throw new BusinessException("不能移除组织所有者");
        }

        int deleted = orgMemberMapper.delete(
                new LambdaQueryWrapper<OrgMember>()
                        .eq(OrgMember::getOrgId, orgId)
                        .eq(OrgMember::getUserId, targetUserId)
        );

        if (deleted == 0) {
            throw new BusinessException(ResultCode.ORG_MEMBER_NOT_FOUND);
        }

        User targetUser = userMapper.selectById(targetUserId);
        log.info("组织成员移除成功: 用户{}从组织{}中移除", targetUser.getUsername(), org.getName());
    }

    private void checkOrgMember(Long orgId, Long userId) {
        boolean isMember = orgMemberMapper.exists(
                new LambdaQueryWrapper<OrgMember>()
                        .eq(OrgMember::getOrgId, orgId)
                        .eq(OrgMember::getUserId, userId)
        );
        if (!isMember) {
            throw new BusinessException(ResultCode.FORBIDDEN, "您不是该组织的成员");
        }
    }

    private void checkOrgPermission(Long orgId, Long userId, String... allowedRoles) {
        OrgMember member = orgMemberMapper.selectOne(
                new LambdaQueryWrapper<OrgMember>()
                        .eq(OrgMember::getOrgId, orgId)
                        .eq(OrgMember::getUserId, userId)
        );

        if (member == null) {
            throw new BusinessException(ResultCode.FORBIDDEN, "您不是该组织的成员");
        }

        boolean hasPermission = false;
        for (String role : allowedRoles) {
            if (role.equals(member.getRole())) {
                hasPermission = true;
                break;
            }
        }

        if (!hasPermission) {
            throw new BusinessException(ResultCode.FORBIDDEN, "权限不足");
        }
    }

    private String getUserRole(Long orgId, Long userId) {
        OrgMember member = orgMemberMapper.selectOne(
                new LambdaQueryWrapper<OrgMember>()
                        .eq(OrgMember::getOrgId, orgId)
                        .eq(OrgMember::getUserId, userId)
        );
        return member != null ? member.getRole() : null;
    }

    private OrganizationResponse toOrganizationResponse(Organization org, Long currentUserId) {
        User owner = userMapper.selectById(org.getOwnerId());
        Long memberCount = orgMemberMapper.selectCount(
                new LambdaQueryWrapper<OrgMember>().eq(OrgMember::getOrgId, org.getId())
        );

        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .logoUrl(org.getLogoUrl())
                .description(org.getDescription())
                .ownerId(org.getOwnerId())
                .ownerUsername(owner != null ? owner.getUsername() : null)
                .status(org.getStatus())
                .memberCount(memberCount.intValue())
                .currentUserRole(getUserRole(org.getId(), currentUserId))
                .createdAt(org.getCreatedAt())
                .build();
    }

    private OrgMemberResponse toOrgMemberResponse(OrgMember member, User user) {
        return OrgMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUserId())
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .nickname(user != null ? user.getNickname() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
