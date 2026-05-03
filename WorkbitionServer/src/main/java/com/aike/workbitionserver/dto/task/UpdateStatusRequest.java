package com.aike.workbitionserver.dto.task;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateStatusRequest {

    @NotBlank(message = "状态不能为空")
    private String status;
}