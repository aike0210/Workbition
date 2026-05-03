package com.aike.workbitionserver.service;

import com.aike.workbitionserver.common.exception.BusinessException;
import com.aike.workbitionserver.common.result.ResultCode;
import com.aike.workbitionserver.dto.task.*;
import com.aike.workbitionserver.entity.ProjectMember;
import com.aike.workbitionserver.entity.Task;
import com.aike.workbitionserver.entity.User;
import com.aike.workbitionserver.mapper.ProjectMemberMapper;
import com.aike.workbitionserver.mapper.TaskMapper;
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
public class TaskService {

    private final TaskMapper taskMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final UserMapper userMapper;

    @Transactional
    public TaskResponse createTask(Long projectId, Long userId, CreateTaskRequest request) {
        // 检查用户是否是项目成员
        checkProjectMember(projectId, userId);

        // 计算排序位置
        Integer position = request.getPosition();
        if (position == null) {
            Long maxPosition = taskMapper.selectCount(
                    new LambdaQueryWrapper<Task>()
                            .eq(Task::getProjectId, projectId)
                            .eq(Task::getTaskListId, request.getTaskListId())
            );
            position = maxPosition.intValue();
        }

        Task task = new Task();
        task.setProjectId(projectId);
        task.setTaskListId(request.getTaskListId());
        task.setParentTaskId(request.getParentTaskId());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setAssigneeId(request.getAssigneeId());
        task.setCreatorId(userId);
        task.setStartDate(request.getStartDate());
        task.setDueDate(request.getDueDate());
        task.setPosition(position);
        task.setIsMilestone(request.getIsMilestone());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setTags(request.getTags());
        taskMapper.insert(task);

        log.info("任务创建成功: {} in project {}", task.getTitle(), projectId);
        return toTaskResponse(task);
    }

    public Page<TaskResponse> getTasks(Long projectId, Long userId, int page, int size,
                                       String status, Long assigneeId, String priority) {
        // 检查用户是否是项目成员
        checkProjectMember(projectId, userId);

        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<Task>()
                .eq(Task::getProjectId, projectId)
                .eq(Task::getDeleted, 0);

        if (status != null) {
            wrapper.eq(Task::getStatus, status);
        }
        if (assigneeId != null) {
            wrapper.eq(Task::getAssigneeId, assigneeId);
        }
        if (priority != null) {
            wrapper.eq(Task::getPriority, priority);
        }

        wrapper.orderByAsc(Task::getPosition);

        Page<Task> taskPage = taskMapper.selectPage(new Page<>(page, size), wrapper);

        Page<TaskResponse> responsePage = new Page<>(taskPage.getCurrent(), taskPage.getSize(), taskPage.getTotal());
        responsePage.setRecords(taskPage.getRecords().stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList()));

        return responsePage;
    }

    public TaskResponse getTask(Long taskId, Long userId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        checkProjectMember(task.getProjectId(), userId);
        return toTaskResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, Long userId, UpdateTaskRequest request) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        checkProjectMember(task.getProjectId(), userId);

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getTaskListId() != null) {
            task.setTaskListId(request.getTaskListId());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            if ("done".equals(request.getStatus())) {
                task.setCompletedAt(LocalDateTime.now());
            }
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getAssigneeId() != null) {
            task.setAssigneeId(request.getAssigneeId());
        }
        if (request.getStartDate() != null) {
            task.setStartDate(request.getStartDate());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }
        if (request.getIsMilestone() != null) {
            task.setIsMilestone(request.getIsMilestone());
        }
        if (request.getEstimatedHours() != null) {
            task.setEstimatedHours(request.getEstimatedHours());
        }
        if (request.getActualHours() != null) {
            task.setActualHours(request.getActualHours());
        }
        if (request.getTags() != null) {
            task.setTags(request.getTags());
        }

        taskMapper.updateById(task);
        log.info("任务更新成功: {}", task.getTitle());

        return toTaskResponse(task);
    }

    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        checkProjectMember(task.getProjectId(), userId);
        taskMapper.deleteById(taskId);
        log.info("任务删除成功: {}", task.getTitle());
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, Long userId, UpdateStatusRequest request) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        checkProjectMember(task.getProjectId(), userId);

        task.setStatus(request.getStatus());
        if ("done".equals(request.getStatus())) {
            task.setCompletedAt(LocalDateTime.now());
        }

        taskMapper.updateById(task);
        log.info("任务状态更新成功: {} -> {}", task.getTitle(), request.getStatus());

        return toTaskResponse(task);
    }

    @Transactional
    public TaskResponse updateTaskAssignee(Long taskId, Long userId, UpdateAssigneeRequest request) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        checkProjectMember(task.getProjectId(), userId);

        task.setAssigneeId(request.getAssigneeId());
        taskMapper.updateById(task);
        log.info("任务负责人更新成功: {}", task.getTitle());

        return toTaskResponse(task);
    }

    @Transactional
    public TaskResponse updateTaskPosition(Long taskId, Long userId, UpdatePositionRequest request) {
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }

        checkProjectMember(task.getProjectId(), userId);

        task.setTaskListId(request.getTaskListId());
        task.setPosition(request.getPosition());
        taskMapper.updateById(task);
        log.info("任务位置更新成功: {}", task.getTitle());

        return toTaskResponse(task);
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

    private TaskResponse toTaskResponse(Task task) {
        User assignee = task.getAssigneeId() != null ? userMapper.selectById(task.getAssigneeId()) : null;
        User creator = task.getCreatorId() != null ? userMapper.selectById(task.getCreatorId()) : null;

        return TaskResponse.builder()
                .id(task.getId())
                .projectId(task.getProjectId())
                .taskListId(task.getTaskListId())
                .parentTaskId(task.getParentTaskId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .assigneeId(task.getAssigneeId())
                .assigneeName(assignee != null ? assignee.getNickname() : null)
                .assigneeAvatar(assignee != null ? assignee.getAvatarUrl() : null)
                .creatorId(task.getCreatorId())
                .creatorName(creator != null ? creator.getNickname() : null)
                .startDate(task.getStartDate())
                .dueDate(task.getDueDate())
                .completedAt(task.getCompletedAt())
                .progress(task.getProgress())
                .position(task.getPosition())
                .isMilestone(task.getIsMilestone())
                .estimatedHours(task.getEstimatedHours())
                .actualHours(task.getActualHours())
                .tags(task.getTags())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}