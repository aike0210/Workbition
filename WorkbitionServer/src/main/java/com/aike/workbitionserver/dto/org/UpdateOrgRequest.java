package com.aike.workbitionserver.dto.org;

import lombok.Data;

@Data
public class UpdateOrgRequest {

    private String name;

    private String description;

    private String logoUrl;
}
