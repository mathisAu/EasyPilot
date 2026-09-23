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
        // Only fields the admin left checked (included) and filled in go into the
        // summary — unchecking a field, or clearing its value, leaves it out.
        List<ExtractedField> filled = extractedFieldRepository.findByDocumentIdOrderByIdAsc(documentId).stream()
                .filter(field -> field.isIncluded() && field.getValue() != null && !field.getValue().isBlank())
                .toList();
        byte[] pdf = SummaryPdfGenerator.generate(
                document.getDocumentType().getName(), document.getOriginalFilename(), filled);
        return new SummaryPdf(document.getDocumentType().getName() + " - samenvatting.pdf", pdf);
    }

    public record RedactedFile(String filename, String contentType, byte[] content) {
    }

    @Transactional(readOnly = true)
    public RedactedFile generateRedactedFile(Long documentId, AppUser currentUser) {
        Document document = getOrThrow(documentId);
        documentTypeService.getVisibleOrThrow(document.getDocumentType().getId(), currentUser);

        List<DocumentRedactor.FieldEdit> edits = extractedFieldRepository.findByDocumentIdOrderByIdAsc(documentId)
                .stream()
                .filter(ExtractedField::hasBox)
                .map(field -> new DocumentRedactor.FieldEdit(
                        field.getBoxPage() != null ? field.getBoxPage() : 0,
                        field.getBoxX(), field.getBoxY(), field.getBoxWidth(), field.getBoxHeight(),
                        field.isIncluded() ? field.getValue() : null))
                .toList();

        byte[] originalBytes = fileStorageService.readAllBytes(document.getStoredFilename());
        String contentType = document.getContentType();
        byte[] content = "application/pdf".equalsIgnoreCase(contentType)
                ? DocumentRedactor.redactPdf(originalBytes, edits)
                : DocumentRedactor.redactImage(originalBytes, imageFormatFor(contentType), edits);

        String filename = document.getDocumentType().getName() + " - aangepast" + extensionOf(document.getOriginalFilename());
        return new RedactedFile(filename, contentType, content);
    }

    private String imageFormatFor(String contentType) {
        if (contentType == null) {
            return "png";
        }
        return switch (contentType.toLowerCase()) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            default -> "png";
        };
    }

    private String extensionOf(String filename) {
        int dot = filename == null ? -1 : filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
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
        return extractedFieldRepository.findByDocumentIdOrderByIdAsc(documentId).stream().map(ExtractedFieldDto::from).toList();
    }

    @Transactional
    public List<ExtractedFieldDto> updateExtractedFields(Long documentId, List<ExtractedFieldUpdateRequest> updates) {
        getOrThrow(documentId);
        List<ExtractedField> existing = extractedFieldRepository.findByDocumentIdOrderByIdAsc(documentId);
        Map<String, ExtractedField> byName = new HashMap<>();
        for (ExtractedField field : existing) {
            byName.put(field.getFieldName(), field);
        }
        for (ExtractedFieldUpdateRequest update : updates) {
            ExtractedField field = byName.get(update.fieldName());
            if (field != null) {
                field.setValue(update.value());
                field.setEdited(true);
                field.setIncluded(update.included());
            }
        }
        return existing.stream().map(ExtractedFieldDto::from).toList();
    }

    private Document getOrThrow(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document niet gevonden"));
    }
}
