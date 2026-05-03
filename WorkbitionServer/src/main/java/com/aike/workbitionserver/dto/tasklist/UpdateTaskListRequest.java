package com.aike.workbitionserver.dto.tasklist;

import lombok.Data;

@Data
public class UpdateTaskListRequest {

    private String name;

    private Integer position;
}
