package com.example.pi4eme02;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.example.pi4eme02.Client")
public class Pi4eme02Application {

    public static void main(String[] args) {
        SpringApplication.run(Pi4eme02Application.class, args);
    }

}
