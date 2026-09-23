package com.easypilot.backend.document;

import com.easypilot.backend.extraction.ExtractedFieldDto;
import com.easypilot.backend.extraction.ExtractedFieldUpdateRequest;
import com.easypilot.backend.extraction.ExtractionService;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.CurrentUserService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
public class DocumentController {

    private final DocumentService service;
    private final CurrentUserService currentUserService;
    private final ExtractionService extractionService;

    public DocumentController(DocumentService service, CurrentUserService currentUserService,
                               ExtractionService extractionService) {
        this.service = service;
        this.currentUserService = currentUserService;
        this.extractionService = extractionService;
    }

    @PostMapping(value = "/api/document-types/{typeId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDto> upload(@PathVariable Long typeId, @RequestParam("file") MultipartFile file,
                                               Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        DocumentDto result = service.upload(typeId, file, currentUser);
        extractionService.extractAsync(result.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/api/document-types/{typeId}/documents")
    public List<DocumentDto> listForType(@PathVariable Long typeId, Authentication authentication) {
        return service.listForType(typeId, currentUserService.require(authentication));
    }

    @GetMapping("/api/documents/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id,
                                              @RequestParam(defaultValue = "attachment") String disposition,
                                              Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        DocumentService.DownloadPayload payload = service.loadForDownload(id, currentUser);
        ContentDisposition.Builder builder = "inline".equalsIgnoreCase(disposition)
                ? ContentDisposition.inline()
                : ContentDisposition.attachment();
        ContentDisposition contentDisposition = builder
                .filename(payload.document().getOriginalFilename(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .contentType(MediaType.parseMediaType(payload.document().getContentType()))
                .body(payload.resource());
    }

    @GetMapping("/api/documents/{id}/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadSummary(@PathVariable Long id, Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        DocumentService.SummaryPdf summary = service.generateSummaryPdf(id, currentUser);
        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(summary.filename(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .contentType(MediaType.APPLICATION_PDF)
                .body(summary.content());
    }

    @GetMapping("/api/documents/{id}/redacted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadRedacted(@PathVariable Long id, Authentication authentication) {
        AppUser currentUser = currentUserService.require(authentication);
        DocumentService.RedactedFile file = service.generateRedactedFile(id, currentUser);
        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(file.filename(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(file.content());
    }

    @GetMapping("/api/documents/{id}/extracted-fields")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ExtractedFieldDto> getExtractedFields(@PathVariable Long id) {
        return service.getExtractedFields(id);
    }

    @PutMapping("/api/documents/{id}/extracted-fields")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ExtractedFieldDto> updateExtractedFields(@PathVariable Long id,
                                                          @Valid @RequestBody List<ExtractedFieldUpdateRequest> updates) {
        return service.updateExtractedFields(id, updates);
    }

    @PostMapping("/api/documents/{id}/extract")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> retryExtraction(@PathVariable Long id) {
        extractionService.extractAsync(id);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping("/api/documents/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
