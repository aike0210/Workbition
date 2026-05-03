package com.aike.workbitionserver.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "健康检查", description = "系统健康检查接口")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "健康检查", description = "检查服务是否正常运行")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "WorkbitionServer",
                "timestamp", System.currentTimeMillis()
        );
    }
}
