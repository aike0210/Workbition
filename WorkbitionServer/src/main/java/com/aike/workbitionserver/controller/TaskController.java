package com.aike.workbitionserver.controller;

import com.aike.workbitionserver.common.result.Result;
import com.aike.workbitionserver.dto.task.*;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.service.TaskService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/projects/{projectId}/tasks")
    public Result<TaskResponse> createTask(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = taskService.createTask(projectId, user.getId(), request);
        return Result.success(response);
    }

    @GetMapping("/projects/{projectId}/tasks")
    public Result<Page<TaskResponse>> getTasks(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String priority) {
        Page<TaskResponse> response = taskService.getTasks(projectId, user.getId(), page, size, status, assigneeId, priority);
        return Result.success(response);
    }

    @GetMapping("/tasks/{taskId}")
    public Result<TaskResponse> getTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user) {
        TaskResponse response = taskService.getTask(taskId, user.getId());
        return Result.success(response);
    }

    @PutMapping("/tasks/{taskId}")
    public Result<TaskResponse> updateTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateTaskRequest request) {
        TaskResponse response = taskService.updateTask(taskId, user.getId(), request);
        return Result.success(response);
    }

    @DeleteMapping("/tasks/{taskId}")
    public Result<Void> deleteTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user) {
        taskService.deleteTask(taskId, user.getId());
        return Result.success("删除成功");
    }

    @PatchMapping("/tasks/{taskId}/status")
    public Result<TaskResponse> updateTaskStatus(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateStatusRequest request) {
        TaskResponse response = taskService.updateTaskStatus(taskId, user.getId(), request);
        return Result.success(response);
    }

    @PatchMapping("/tasks/{taskId}/assignee")
    public Result<TaskResponse> updateTaskAssignee(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateAssigneeRequest request) {
        TaskResponse response = taskService.updateTaskAssignee(taskId, user.getId(), request);
        return Result.success(response);
    }

    @PatchMapping("/tasks/{taskId}/position")
    public Result<TaskResponse> updateTaskPosition(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdatePositionRequest request) {
        TaskResponse response = taskService.updateTaskPosition(taskId, user.getId(), request);
        return Result.success(response);
    }
}