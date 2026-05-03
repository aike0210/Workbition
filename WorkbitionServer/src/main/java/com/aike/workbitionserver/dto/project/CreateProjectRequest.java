package com.aike.workbitionserver.dto.project;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "创建项目请求")
public class CreateProjectRequest {

    @NotNull(message = "组织ID不能为空")
    @Schema(description = "所属组织ID")
    private Long orgId;

    @NotBlank(message = "项目名称不能为空")
    @Schema(description = "项目名称", example = "Workbition开发项目")
    private String name;

    @Schema(description = "项目描述")
    private String description;

    @Schema(description = "项目图标")
    private String icon;

    @Schema(description = "项目颜色")
    private String color;

    @Schema(description = "可见性: public/private", defaultValue = "private")
    private String visibility = "private";

    @Schema(description = "开始日期")
    private LocalDate startDate;

    @Schema(description = "结束日期")
    private LocalDate endDate;
}
