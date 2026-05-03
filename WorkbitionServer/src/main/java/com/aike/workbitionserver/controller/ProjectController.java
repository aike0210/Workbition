package com.aike.workbitionserver.controller;

import com.aike.workbitionserver.common.result.Result;
import com.aike.workbitionserver.dto.project.*;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public Result<ProjectResponse> createProject(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse response = projectService.createProject(user.getId(), request);
        return Result.success("项目创建成功", response);
    }

    @GetMapping
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
    public Result<ProjectResponse> getProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        ProjectResponse response = projectService.getProject(projectId, user.getId());
        return Result.success(response);
    }

    @PutMapping("/{projectId}")
    public Result<ProjectResponse> updateProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @RequestBody UpdateProjectRequest request) {
        ProjectResponse response = projectService.updateProject(projectId, user.getId(), request);
        return Result.success("项目更新成功", response);
    }

    @DeleteMapping("/{projectId}")
    public Result<Void> deleteProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        projectService.deleteProject(projectId, user.getId());
        return Result.success();
    }

    @PostMapping("/{projectId}/archive")
    public Result<Void> archiveProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        projectService.archiveProject(projectId, user.getId());
        return Result.success();
    }

    @GetMapping("/{projectId}/members")
    public Result<List<ProjectMemberResponse>> getProjectMembers(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        List<ProjectMemberResponse> members = projectService.getProjectMembers(projectId, user.getId());
        return Result.success(members);
    }

    @PostMapping("/{projectId}/members")
    public Result<ProjectMemberResponse> addProjectMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "member") String role) {
        ProjectMemberResponse response = projectService.addProjectMember(projectId, user.getId(), userId, role);
        return Result.success("成员添加成功", response);
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public Result<Void> removeProjectMember(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        projectService.removeProjectMember(projectId, user.getId(), userId);
        return Result.success();
    }
}
