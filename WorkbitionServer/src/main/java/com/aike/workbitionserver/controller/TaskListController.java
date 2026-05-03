package com.aike.workbitionserver.controller;

import com.aike.workbitionserver.common.result.Result;
import com.aike.workbitionserver.dto.tasklist.*;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.service.TaskListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskListController {

    private final TaskListService taskListService;

    @PostMapping("/projects/{projectId}/tasklists")
    public Result<TaskListResponse> createTaskList(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateTaskListRequest request) {
        TaskListResponse response = taskListService.createTaskList(projectId, user.getId(), request);
        return Result.success(response);
    }

    @GetMapping("/projects/{projectId}/tasklists")
    public Result<List<TaskListResponse>> getTaskLists(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user) {
        List<TaskListResponse> response = taskListService.getTaskLists(projectId, user.getId());
        return Result.success(response);
    }

    @GetMapping("/tasklists/{taskListId}")
    public Result<TaskListResponse> getTaskList(
            @PathVariable Long taskListId,
            @AuthenticationPrincipal User user) {
        TaskListResponse response = taskListService.getTaskList(taskListId, user.getId());
        return Result.success(response);
    }

    @PutMapping("/tasklists/{taskListId}")
    public Result<TaskListResponse> updateTaskList(
            @PathVariable Long taskListId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateTaskListRequest request) {
        TaskListResponse response = taskListService.updateTaskList(taskListId, user.getId(), request);
        return Result.success(response);
    }

    @DeleteMapping("/tasklists/{taskListId}")
    public Result<Void> deleteTaskList(
            @PathVariable Long taskListId,
            @AuthenticationPrincipal User user) {
        taskListService.deleteTaskList(taskListId, user.getId());
        return Result.success("删除成功");
    }

    @PatchMapping("/projects/{projectId}/tasklists/position")
    public Result<Void> updatePositions(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdatePositionRequest request) {
        taskListService.updatePositions(projectId, user.getId(), request);
        return Result.success("排序更新成功");
    }
}
