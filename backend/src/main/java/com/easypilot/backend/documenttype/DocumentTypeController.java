package com.easypilot.backend.documenttype;

import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/document-types")
public class DocumentTypeController {

    private final DocumentTypeService service;
    private final CurrentUserService currentUserService;

    public DocumentTypeController(DocumentTypeService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<DocumentTypeDto> findAll(Authentication authentication) {
        return service.findAllVisibleTo(currentUserService.require(authentication));
    }

    @PostMapping
    public ResponseEntity<DocumentTypeDto> create(@Valid @RequestBody DocumentTypeRequest request, Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, currentUser));
    }

    @GetMapping("/{id}")
    public DocumentTypeDto findOne(@PathVariable Long id, Authentication authentication) {
        return service.findOneVisibleTo(id, currentUserService.require(authentication));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public DocumentTypeDto update(@PathVariable Long id, @Valid @RequestBody DocumentTypeRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public DocumentTypeDto changeStatus(@PathVariable Long id, @Valid @RequestBody DocumentTypeStatusRequest request) {
        return service.changeStatus(id, request.status());
    }

    @PatchMapping("/{id}/folder")
    @PreAuthorize("hasRole('ADMIN')")
    public DocumentTypeDto moveToFolder(@PathVariable Long id, @RequestBody DocumentTypeFolderRequest request) {
        return service.moveToFolder(id, request.folderId());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
