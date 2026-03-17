package com.example.tenant.config;

import java.io.File;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        // Absolute path so the resource handler and the controller
        // both resolve to the same directory regardless of how/where
        // the JAR is launched.
        String uploadsLocation = "file:" + System.getProperty("user.dir")
                + File.separator + "uploads" + File.separator;

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Serves GET /uploads/maintenance/filename.jpg
                // from <cwd>/uploads/maintenance/filename.jpg
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations(uploadsLocation);
            }
        };
    }
}