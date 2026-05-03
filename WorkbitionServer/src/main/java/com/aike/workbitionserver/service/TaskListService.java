package com.aike.workbitionserver.service;

import com.aike.workbitionserver.common.exception.BusinessException;
import com.aike.workbitionserver.common.result.ResultCode;
import com.aike.workbitionserver.dto.tasklist.*;
import com.aike.workbitionserver.entity.ProjectMember;
import com.aike.workbitionserver.entity.Task;
import com.aike.workbitionserver.entity.TaskList;
import com.aike.workbitionserver.mapper.ProjectMemberMapper;
import com.aike.workbitionserver.mapper.TaskListMapper;
import com.aike.workbitionserver.mapper.TaskMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskListService {

    private final TaskListMapper taskListMapper;
    private final TaskMapper taskMapper;
    private final ProjectMemberMapper projectMemberMapper;

    @Transactional
    public TaskListResponse createTaskList(Long projectId, Long userId, CreateTaskListRequest request) {
        // 检查用户是否是项目成员
        checkProjectMember(projectId, userId);

        // 计算排序位置
        Integer position = request.getPosition();
        if (position == null) {
            Long maxPosition = taskListMapper.selectCount(
                    new LambdaQueryWrapper<TaskList>().eq(TaskList::getProjectId, projectId)
            );
            position = maxPosition.intValue();
        }

        TaskList taskList = new TaskList();
        taskList.setProjectId(projectId);
        taskList.setName(request.getName());
        taskList.setPosition(position);
        taskListMapper.insert(taskList);

        log.info("任务列表创建成功: {} in project {}", taskList.getName(), projectId);
        return toTaskListResponse(taskList, 0);
    }

    public List<TaskListResponse> getTaskLists(Long projectId, Long userId) {
        // 检查用户是否是项目成员
        checkProjectMember(projectId, userId);

        List<TaskList> taskLists = taskListMapper.selectList(
                new LambdaQueryWrapper<TaskList>()
                        .eq(TaskList::getProjectId, projectId)
                        .orderByAsc(TaskList::getPosition)
        );

        return taskLists.stream()
                .map(tl -> {
                    Long taskCount = taskMapper.selectCount(
                            new LambdaQueryWrapper<Task>()
                                    .eq(Task::getTaskListId, tl.getId())
                                    .eq(Task::getDeleted, 0)
                    );
                    return toTaskListResponse(tl, taskCount.intValue());
                })
                .collect(Collectors.toList());
    }

    public TaskListResponse getTaskList(Long taskListId, Long userId) {
        TaskList taskList = taskListMapper.selectById(taskListId);
        if (taskList == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务列表不存在");
        }

        checkProjectMember(taskList.getProjectId(), userId);

        Long taskCount = taskMapper.selectCount(
                new LambdaQueryWrapper<Task>()
                        .eq(Task::getTaskListId, taskListId)
                        .eq(Task::getDeleted, 0)
        );

        return toTaskListResponse(taskList, taskCount.intValue());
    }

    @Transactional
    public TaskListResponse updateTaskList(Long taskListId, Long userId, UpdateTaskListRequest request) {
        TaskList taskList = taskListMapper.selectById(taskListId);
        if (taskList == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务列表不存在");
        }

        checkProjectMember(taskList.getProjectId(), userId);

        if (request.getName() != null) {
            taskList.setName(request.getName());
        }
        if (request.getPosition() != null) {
            taskList.setPosition(request.getPosition());
        }

        taskListMapper.updateById(taskList);
        log.info("任务列表更新成功: {}", taskList.getName());

        Long taskCount = taskMapper.selectCount(
                new LambdaQueryWrapper<Task>()
                        .eq(Task::getTaskListId, taskListId)
                        .eq(Task::getDeleted, 0)
        );

        return toTaskListResponse(taskList, taskCount.intValue());
    }

    @Transactional
    public void deleteTaskList(Long taskListId, Long userId) {
        TaskList taskList = taskListMapper.selectById(taskListId);
        if (taskList == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务列表不存在");
        }

        checkProjectMember(taskList.getProjectId(), userId);

        // 将该列表下的任务的 taskListId 置为 NULL
        List<Task> tasks = taskMapper.selectList(
                new LambdaQueryWrapper<Task>().eq(Task::getTaskListId, taskListId)
        );
        for (Task task : tasks) {
            task.setTaskListId(null);
            taskMapper.updateById(task);
        }

        taskListMapper.deleteById(taskListId);
        log.info("任务列表删除成功: {}，已处理 {} 个任务", taskList.getName(), tasks.size());
    }

    @Transactional
    public void updatePositions(Long projectId, Long userId, UpdatePositionRequest request) {
        checkProjectMember(projectId, userId);

        for (UpdatePositionRequest.PositionItem item : request.getItems()) {
            TaskList taskList = taskListMapper.selectById(item.getId());
            if (taskList != null && taskList.getProjectId().equals(projectId)) {
                taskList.setPosition(item.getPosition());
                taskListMapper.updateById(taskList);
            }
        }

        log.info("任务列表排序更新成功: project {}", projectId);
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

    private TaskListResponse toTaskListResponse(TaskList taskList, int taskCount) {
        return TaskListResponse.builder()
                .id(taskList.getId())
                .projectId(taskList.getProjectId())
                .name(taskList.getName())
                .position(taskList.getPosition())
                .taskCount(taskCount)
                .createdAt(taskList.getCreatedAt())
                .build();
    }
}
