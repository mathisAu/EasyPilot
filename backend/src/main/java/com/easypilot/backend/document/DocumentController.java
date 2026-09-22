package com.easypilot.backend.document;

import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.CurrentUserService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
public class DocumentController {

    private final DocumentService service;
    private final CurrentUserService currentUserService;

    public DocumentController(DocumentService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @PostMapping(value = "/api/document-types/{typeId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDto> upload(@PathVariable Long typeId, @RequestParam("file") MultipartFile file,
                                               Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.upload(typeId, file, currentUser));
    }

    @GetMapping("/api/document-types/{typeId}/documents")
    public List<DocumentDto> listForType(@PathVariable Long typeId, Authentication authentication) {
        return service.listForType(typeId, currentUserService.require(authentication));
    }

    @GetMapping("/api/documents/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id, Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        DocumentService.DownloadPayload payload = service.loadForDownload(id, currentUser);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(payload.document().getOriginalFilename(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.parseMediaType(payload.document().getContentType()))
                .body(payload.resource());
    }

    @DeleteMapping("/api/documents/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
