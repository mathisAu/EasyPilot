package com.easypilot.backend.organization;

import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.CurrentUserService;
import com.easypilot.backend.user.Role;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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

    @PatchMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public OrganizationDto updateMyDetails(@Valid @RequestBody OrganizationDetailsRequest request,
                                           Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        if (currentUser.getOrganization() == null) {
            throw new ResourceNotFoundException("Geen organisatie gekoppeld aan dit account");
        }
        return service.updateDetails(currentUser.getOrganization().getId(), request);
    }

    @PostMapping(value = "/me/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public OrganizationDto uploadMyLogo(@RequestParam("file") MultipartFile file, Authentication authentication) {
        return service.uploadLogo(requireOwnOrganizationId(authentication), file);
    }

    @DeleteMapping("/me/logo")
    @PreAuthorize("hasRole('CUSTOMER')")
    public OrganizationDto deleteMyLogo(Authentication authentication) {
        return service.deleteLogo(requireOwnOrganizationId(authentication));
    }

    /** Readable by admins and by the organisation's own customer account. */
    @GetMapping("/{id}/logo")
    public ResponseEntity<Resource> logo(@PathVariable Long id, Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        boolean ownOrganization = currentUser.getOrganization() != null && currentUser.getOrganization().getId().equals(id);
        if (currentUser.getRole() != Role.ADMIN && !ownOrganization) {
            throw new AccessDeniedException("Geen toegang tot dit logo");
        }
        OrganizationService.LogoPayload logo = service.loadLogo(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .contentType(MediaType.parseMediaType(logo.contentType()))
                .body(logo.resource());
    }

    private Long requireOwnOrganizationId(Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        if (currentUser.getOrganization() == null) {
            throw new ResourceNotFoundException("Geen organisatie gekoppeld aan dit account");
        }
        return currentUser.getOrganization().getId();
    }
}
