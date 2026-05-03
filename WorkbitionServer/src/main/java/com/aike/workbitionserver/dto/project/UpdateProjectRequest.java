package com.aike.workbitionserver.dto.project;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProjectRequest {

    private String name;

    private String description;

    private String icon;

    private String color;

    private String visibility;

    private LocalDate startDate;

    private LocalDate endDate;
}
