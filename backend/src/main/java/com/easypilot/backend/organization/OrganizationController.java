package com.easypilot.backend.organization;

import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService service;
    private final CurrentUserService currentUserService;

    public OrganizationController(OrganizationService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrganizationDto> findAll() {
        return service.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrganizationDto> create(@Valid @RequestBody OrganizationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public OrganizationDto me(Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        if (currentUser.getOrganization() == null) {
            throw new ResourceNotFoundException("Geen organisatie gekoppeld aan dit account");
        }
        return service.findForCustomer(currentUser.getOrganization().getId());
    }
}
