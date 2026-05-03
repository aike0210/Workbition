package com.aike.workbitionserver.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateProjectRequest {

    @NotNull(message = "组织ID不能为空")
    private Long orgId;

    @NotBlank(message = "项目名称不能为空")
    private String name;

    private String description;

    private String icon;

    private String color;

    private String visibility = "private";

    private LocalDate startDate;

    private LocalDate endDate;
}
