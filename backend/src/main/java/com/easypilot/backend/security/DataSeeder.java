package com.easypilot.backend.security;

import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.AppUserRepository;
import com.easypilot.backend.user.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminPassword;

    public DataSeeder(AppUserRepository appUserRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${app.security.admin-username}") String adminUsername,
                       @Value("${app.security.admin-password}") String adminPassword) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (appUserRepository.existsByUsernameIgnoreCase(adminUsername)) {
            return;
        }
        AppUser admin = new AppUser();
        admin.setUsername(adminUsername);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        appUserRepository.save(admin);
        log.info("Admin-account '{}' aangemaakt", adminUsername);
    }
}
