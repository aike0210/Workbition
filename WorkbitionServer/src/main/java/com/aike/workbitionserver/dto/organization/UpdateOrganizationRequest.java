package com.aike.workbitionserver.dto.organization;

import lombok.Data;

@Data
public class UpdateOrganizationRequest {

    private String name;

    private String description;

    private String logoUrl;
}
