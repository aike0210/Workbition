package com.aike.workbitionserver.dto.organization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateOrganizationRequest {

    @NotBlank(message = "组织名称不能为空")
    @Size(max = 100, message = "组织名称最长100个字符")
    private String name;

    private String description;

    private String logoUrl;
}
