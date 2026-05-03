package com.aike.workbitionserver.dto.task;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePositionRequest {

    @NotNull(message = "任务列表ID不能为空")
    private Long taskListId;

    @NotNull(message = "位置不能为空")
    private Integer position;
}