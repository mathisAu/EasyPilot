package com.easypilot.backend.document;

import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.documenttype.DocumentType;
import com.easypilot.backend.documenttype.DocumentTypeService;
import com.easypilot.backend.extraction.ExtractedField;
import com.easypilot.backend.extraction.ExtractedFieldDto;
import com.easypilot.backend.extraction.ExtractedFieldRepository;
import com.easypilot.backend.extraction.ExtractedFieldUpdateRequest;
import com.easypilot.backend.storage.FileStorageService;
import com.easypilot.backend.user.AppUser;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentTypeService documentTypeService;
    private final FileStorageService fileStorageService;
    private final ExtractedFieldRepository extractedFieldRepository;

    public DocumentService(DocumentRepository documentRepository,
                            DocumentTypeService documentTypeService,
                            FileStorageService fileStorageService,
                            ExtractedFieldRepository extractedFieldRepository) {
        this.documentRepository = documentRepository;
        this.documentTypeService = documentTypeService;
        this.fileStorageService = fileStorageService;
        this.extractedFieldRepository = extractedFieldRepository;
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> listForType(Long typeId, AppUser currentUser) {
        documentTypeService.getVisibleOrThrow(typeId, currentUser);
        return documentRepository.findByDocumentTypeIdOrderByUploadedAtDesc(typeId)
                .stream().map(DocumentDto::from).toList();
    }

    @Transactional
    public DocumentDto upload(Long typeId, MultipartFile file, AppUser currentUser) {
        DocumentType type = documentTypeService.getVisibleOrThrow(typeId, currentUser);

        String storedFilename = fileStorageService.store(file);

        Document document = new Document();
        document.setDocumentType(type);
        document.setOriginalFilename(file.getOriginalFilename() != null ? file.getOriginalFilename() : storedFilename);
        document.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        document.setSizeBytes(file.getSize());
        document.setStoredFilename(storedFilename);

        return DocumentDto.from(documentRepository.save(document));
    }

    public record DownloadPayload(Document document, Resource resource) {
    }

    @Transactional(readOnly = true)
    public DownloadPayload loadForDownload(Long id, AppUser currentUser) {
        Document document = getOrThrow(id);
        documentTypeService.getVisibleOrThrow(document.getDocumentType().getId(), currentUser);
        Resource resource = fileStorageService.loadAsResource(document.getStoredFilename());
        return new DownloadPayload(document, resource);
    }

    public record SummaryPdf(String filename, byte[] content) {
    }

    @Transactional(readOnly = true)
    public SummaryPdf generateSummaryPdf(Long documentId, AppUser currentUser) {
        Document document = getOrThrow(documentId);
        documentTypeService.getVisibleOrThrow(document.getDocumentType().getId(), currentUser);
        // Only the fields the admin left filled in go into the summary — a field
        // cleared out in the review screen is simply absent, not redacted.
        List<ExtractedField> filled = extractedFieldRepository.findByDocumentId(documentId).stream()
                .filter(field -> field.getValue() != null && !field.getValue().isBlank())
                .toList();
        byte[] pdf = SummaryPdfGenerator.generate(
                document.getDocumentType().getName(), document.getOriginalFilename(), filled);
        return new SummaryPdf(document.getDocumentType().getName() + " - samenvatting.pdf", pdf);
    }

    @Transactional
    public void delete(Long id) {
        Document document = getOrThrow(id);
        fileStorageService.delete(document.getStoredFilename());
        documentRepository.delete(document);
    }

    @Transactional(readOnly = true)
    public List<ExtractedFieldDto> getExtractedFields(Long documentId) {
        getOrThrow(documentId);
        return extractedFieldRepository.findByDocumentId(documentId).stream().map(ExtractedFieldDto::from).toList();
    }

    @Transactional
    public List<ExtractedFieldDto> updateExtractedFields(Long documentId, List<ExtractedFieldUpdateRequest> updates) {
        getOrThrow(documentId);
        List<ExtractedField> existing = extractedFieldRepository.findByDocumentId(documentId);
        Map<String, ExtractedField> byName = new HashMap<>();
        for (ExtractedField field : existing) {
            byName.put(field.getFieldName(), field);
        }
        for (ExtractedFieldUpdateRequest update : updates) {
            ExtractedField field = byName.get(update.fieldName());
            if (field != null) {
                field.setValue(update.value());
                field.setEdited(true);
            }
        }
        return existing.stream().map(ExtractedFieldDto::from).toList();
    }

    private Document getOrThrow(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document niet gevonden"));
    }
}
