package com.aike.workbitionserver;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.aike.workbitionserver.mapper")
public class WorkbitionServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkbitionServerApplication.class, args);
    }

}
