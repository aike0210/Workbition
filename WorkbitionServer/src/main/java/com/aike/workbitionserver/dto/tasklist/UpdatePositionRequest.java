package com.aike.workbitionserver.dto.tasklist;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePositionRequest {

    @NotEmpty(message = "列表不能为空")
    private List<PositionItem> items;

    @Data
    public static class PositionItem {

        private Long id;

        private Integer position;
    }
}
