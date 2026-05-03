package com.aike.workbitionserver.dto.project;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

@Data
@Schema(description = "更新项目请求")
public class UpdateProjectRequest {

    @Schema(description = "项目名称")
    private String name;

    @Schema(description = "项目描述")
    private String description;

    @Schema(description = "项目图标")
    private String icon;

    @Schema(description = "项目颜色")
    private String color;

    @Schema(description = "可见性: public/private")
    private String visibility;

    @Schema(description = "开始日期")
    private LocalDate startDate;

    @Schema(description = "结束日期")
    private LocalDate endDate;
}
