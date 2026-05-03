package com.aike.workbitionserver.service;

import com.aike.workbitionserver.common.exception.BusinessException;
import com.aike.workbitionserver.common.result.ResultCode;
import com.aike.workbitionserver.dto.project.*;
import com.aike.workbitionserver.entity.*;
import com.aike.workbitionserver.mapper.*;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
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
public class ProjectService {

    private final ProjectMapper projectMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final OrgMemberMapper orgMemberMapper;
    private final UserMapper userMapper;

    @Transactional
    public ProjectResponse createProject(Long userId, CreateProjectRequest request) {
        // 检查用户是否是组织成员
        checkOrgMember(request.getOrgId(), userId);

        // 创建项目
        Project project = new Project();
        project.setOrgId(request.getOrgId());
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setIcon(request.getIcon());
        project.setColor(request.getColor());
        project.setVisibility(request.getVisibility());
        project.setStatus("active");
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setCreatorId(userId);
        projectMapper.insert(project);

        // 将创建者添加为项目管理员
        ProjectMember member = new ProjectMember();
        member.setProjectId(project.getId());
        member.setUserId(userId);
        member.setRole("admin");
        member.setJoinedAt(LocalDateTime.now());
        projectMemberMapper.insert(member);

        log.info("项目创建成功: {} (ID: {})", project.getName(), project.getId());

        return toProjectResponse(project, userId);
    }

    public List<ProjectResponse> getProjects(Long userId, Long orgId, String status, int page, int size) {
        // 查询用户参与的项目ID列表
        List<ProjectMember> memberships = projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>().eq(ProjectMember::getUserId, userId)
        );

        if (memberships.isEmpty()) {
            return List.of();
        }

        List<Long> projectIds = memberships.stream()
                .map(ProjectMember::getProjectId)
                .collect(Collectors.toList());

        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<Project>()
                .in(Project::getId, projectIds)
                .eq(orgId != null, Project::getOrgId, orgId)
                .eq(status != null, Project::getStatus, status)
                .orderByDesc(Project::getCreatedAt);

        List<Project> projects = projectMapper.selectList(wrapper);

        return projects.stream()
                .map(project -> toProjectResponse(project, userId))
                .collect(Collectors.toList());
    }

    public ProjectResponse getProject(Long projectId, Long userId) {
        Project project = projectMapper.selectById(projectId);
        if (project == null) {
            throw new BusinessException(ResultCode.PROJECT_NOT_FOUND);
        }

        // 检查用户是否是项目成员
        checkProjectMember(projectId, userId);

        return toProjectResponse(project, userId);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, Long userId, UpdateProjectRequest request) {
        Project project = projectMapper.selectById(projectId);
        if (project == null) {
            throw new BusinessException(ResultCode.PROJECT_NOT_FOUND);
        }

        // 检查权限（只有管理员可以更新）
        checkProjectPermission(projectId, userId, "admin");

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getIcon() != null) {
            project.setIcon(request.getIcon());
        }
        if (request.getColor() != null) {
            project.setColor(request.getColor());
        }
        if (request.getVisibility() != null) {
            project.setVisibility(request.getVisibility());
        }
        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            project.setEndDate(request.getEndDate());
        }

        projectMapper.updateById(project);
        log.info("项目更新成功: {} (ID: {})", project.getName(), project.getId());

        return toProjectResponse(project, userId);
    }

    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = projectMapper.selectById(projectId);
        if (project == null) {
            throw new BusinessException(ResultCode.PROJECT_NOT_FOUND);
        }

        // 只有创建者或组织管理员可以删除项目
        checkProjectPermission(projectId, userId, "admin");

        // 删除项目成员
        projectMemberMapper.delete(
                new LambdaQueryWrapper<ProjectMember>().eq(ProjectMember::getProjectId, projectId)
        );

        // 删除项目
        projectMapper.deleteById(projectId);
        log.info("项目删除成功: {} (ID: {})", project.getName(), projectId);
    }

    @Transactional
    public void archiveProject(Long projectId, Long userId) {
        Project project = projectMapper.selectById(projectId);
        if (project == null) {
            throw new BusinessException(ResultCode.PROJECT_NOT_FOUND);
        }

        checkProjectPermission(projectId, userId, "admin");

        project.setStatus("archived");
        projectMapper.updateById(project);
        log.info("项目归档成功: {} (ID: {})", project.getName(), projectId);
    }

    public List<ProjectMemberResponse> getProjectMembers(Long projectId, Long userId) {
        checkProjectMember(projectId, userId);

        List<ProjectMember> members = projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>().eq(ProjectMember::getProjectId, projectId)
        );

        return members.stream().map(member -> {
            User user = userMapper.selectById(member.getUserId());
            return toProjectMemberResponse(member, user);
        }).collect(Collectors.toList());
    }

    @Transactional
    public ProjectMemberResponse addProjectMember(Long projectId, Long operatorId, Long targetUserId, String role) {
        Project project = projectMapper.selectById(projectId);
        if (project == null) {
            throw new BusinessException(ResultCode.PROJECT_NOT_FOUND);
        }

        // 检查操作者权限
        checkProjectPermission(projectId, operatorId, "admin");

        // 检查目标用户是否是组织成员
        checkOrgMember(project.getOrgId(), targetUserId);

        // 检查是否已经是项目成员
        boolean exists = projectMemberMapper.exists(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, targetUserId)
        );
        if (exists) {
            throw new BusinessException(ResultCode.PROJECT_MEMBER_ALREADY_EXISTS);
        }

        // 添加成员
        ProjectMember member = new ProjectMember();
        member.setProjectId(projectId);
        member.setUserId(targetUserId);
        member.setRole(role != null ? role : "member");
        member.setJoinedAt(LocalDateTime.now());
        projectMemberMapper.insert(member);

        User targetUser = userMapper.selectById(targetUserId);
        log.info("项目成员添加成功: 用户{}加入项目{}", targetUser.getUsername(), project.getName());

        return toProjectMemberResponse(member, targetUser);
    }

    @Transactional
    public void removeProjectMember(Long projectId, Long operatorId, Long targetUserId) {
        Project project = projectMapper.selectById(projectId);
        if (project == null) {
            throw new BusinessException(ResultCode.PROJECT_NOT_FOUND);
        }

        // 检查操作者权限
        checkProjectPermission(projectId, operatorId, "admin");

        // 不能移除自己
        if (operatorId.equals(targetUserId)) {
            throw new BusinessException("不能移除自己");
        }

        int deleted = projectMemberMapper.delete(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, targetUserId)
        );

        if (deleted == 0) {
            throw new BusinessException(ResultCode.NOT_FOUND, "项目成员不存在");
        }

        User targetUser = userMapper.selectById(targetUserId);
        log.info("项目成员移除成功: 用户{}从项目{}中移除", targetUser.getUsername(), project.getName());
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

    private void checkProjectMember(Long projectId, Long userId) {
        boolean isMember = projectMemberMapper.exists(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId)
        );
        if (!isMember) {
            throw new BusinessException(ResultCode.FORBIDDEN, "您不是该项目的成员");
        }
    }

    private void checkProjectPermission(Long projectId, Long userId, String... allowedRoles) {
        ProjectMember member = projectMemberMapper.selectOne(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId)
        );

        if (member == null) {
            throw new BusinessException(ResultCode.FORBIDDEN, "您不是该项目的成员");
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

    private String getUserProjectRole(Long projectId, Long userId) {
        ProjectMember member = projectMemberMapper.selectOne(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId)
        );
        return member != null ? member.getRole() : null;
    }

    private ProjectResponse toProjectResponse(Project project, Long currentUserId) {
        User creator = userMapper.selectById(project.getCreatorId());
        Long memberCount = projectMemberMapper.selectCount(
                new LambdaQueryWrapper<ProjectMember>().eq(ProjectMember::getProjectId, project.getId())
        );

        return ProjectResponse.builder()
                .id(project.getId())
                .orgId(project.getOrgId())
                .name(project.getName())
                .description(project.getDescription())
                .icon(project.getIcon())
                .color(project.getColor())
                .visibility(project.getVisibility())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .creatorId(project.getCreatorId())
                .creatorUsername(creator != null ? creator.getUsername() : null)
                .memberCount(memberCount.intValue())
                .currentUserRole(getUserProjectRole(project.getId(), currentUserId))
                .createdAt(project.getCreatedAt())
                .build();
    }

    private ProjectMemberResponse toProjectMemberResponse(ProjectMember member, User user) {
        return ProjectMemberResponse.builder()
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
