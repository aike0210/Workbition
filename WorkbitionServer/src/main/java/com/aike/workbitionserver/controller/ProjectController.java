package com.aike.workbitionserver.controller;

import com.aike.workbitionserver.common.result.Result;
import com.aike.workbitionserver.dto.project.*;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "项目管理", description = "项目相关接口")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "创建项目")
    public Result<ProjectResponse> createProject(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse response = projectService.createProject(user.getId(), request);
        return Result.success("项目创建成功", response);
    }

    @GetMapping
    @Operation(summary = "获取项目列表")
    public Result<List<ProjectResponse>> getProjects(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<ProjectResponse> projects = projectService.getProjects(user.getId(), orgId, status, page, size);
        return Result.success(projects);
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "获取项目详情")
    public Result<ProjectResponse> getProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        ProjectResponse response = projectService.getProject(projectId, user.getId());
        return Result.success(response);
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "更新项目信息")
    public Result<ProjectResponse> updateProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @RequestBody UpdateProjectRequest request) {
        ProjectResponse response = projectService.updateProject(projectId, user.getId(), request);
        return Result.success("项目更新成功", response);
    }

    @DeleteMapping("/{projectId}")
    @Operation(summary = "删除项目")
    public Result<Void> deleteProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        projectService.deleteProject(projectId, user.getId());
        return Result.success();
    }

    @PostMapping("/{projectId}/archive")
    @Operation(summary = "归档项目")
    public Result<Void> archiveProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        projectService.archiveProject(projectId, user.getId());
        return Result.success();
    }

    @GetMapping("/{projectId}/members")
    @Operation(summary = "获取项目成员列表")
    public Result<List<ProjectMemberResponse>> getProjectMembers(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        List<ProjectMemberResponse> members = projectService.getProjectMembers(projectId, user.getId());
        return Result.success(members);
    }

    @PostMapping("/{projectId}/members")
    @Operation(summary = "添加项目成员")
    public Result<ProjectMemberResponse> addProjectMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "member") String role) {
        ProjectMemberResponse response = projectService.addProjectMember(projectId, user.getId(), userId, role);
        return Result.success("成员添加成功", response);
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @Operation(summary = "移除项目成员")
    public Result<Void> removeProjectMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        projectService.removeProjectMember(projectId, user.getId(), userId);
        return Result.success();
    }
}
