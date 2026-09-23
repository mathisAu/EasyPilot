package com.easypilot.backend.extraction;

import com.easypilot.backend.document.Document;
import com.easypilot.backend.document.DocumentRepository;
import com.easypilot.backend.storage.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Split out from ExtractionService so beginExtraction/persistResult run as real,
 * separately-committed transactions: calling a @Transactional method on `this` from
 * within the same class bypasses Spring's proxy (self-invocation), silently running
 * with no transaction at all.
 */
@Service
public class ExtractionTransactionSupport {

    private final DocumentRepository documentRepository;
    private final ExtractedFieldRepository extractedFieldRepository;
    private final FileStorageService fileStorageService;
    private final GeminiClientHolder geminiClientHolder;

    public ExtractionTransactionSupport(DocumentRepository documentRepository,
                                         ExtractedFieldRepository extractedFieldRepository,
                                         FileStorageService fileStorageService,
                                         GeminiClientHolder geminiClientHolder) {
        this.documentRepository = documentRepository;
        this.extractedFieldRepository = extractedFieldRepository;
        this.fileStorageService = fileStorageService;
        this.geminiClientHolder = geminiClientHolder;
    }

    @Transactional
    public ExtractContext beginExtraction(Long documentId) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return null;
        }

        List<String> fieldNames = document.getDocumentType().getFields();
        if (fieldNames == null || fieldNames.isEmpty()) {
            document.setExtractionStatus(ExtractionStatus.SKIPPED);
            document.setExtractionError("Geen velden geconfigureerd voor dit documenttype.");
            documentRepository.save(document);
            return null;
        }

        String contentType = document.getContentType();
        boolean isPdf = "application/pdf".equalsIgnoreCase(contentType);
        boolean isImage = contentType != null && contentType.toLowerCase().startsWith("image/");
        if (!isPdf && !isImage) {
            document.setExtractionStatus(ExtractionStatus.SKIPPED);
            document.setExtractionError("Alleen PDF, JPG en PNG worden ondersteund voor automatische extractie.");
            documentRepository.save(document);
            return null;
        }

        if (!geminiClientHolder.isAvailable()) {
            document.setExtractionStatus(ExtractionStatus.FAILED);
            document.setExtractionError(geminiClientHolder.unavailableReason());
            documentRepository.save(document);
            return null;
        }

        byte[] bytes = fileStorageService.readAllBytes(document.getStoredFilename());
        document.setExtractionStatus(ExtractionStatus.IN_PROGRESS);
        document.setExtractionError(null);
        documentRepository.save(document);

        return new ExtractContext(documentId, bytes, contentType, List.copyOf(fieldNames));
    }

    @Transactional
    public void persistResult(Long documentId, List<String> fieldNames, ExtractionResult result) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return;
        }

        extractedFieldRepository.deleteByDocumentId(documentId);

        if (result.isSuccess()) {
            Map<String, String> values = result.values() != null ? result.values() : Map.of();
            for (String fieldName : fieldNames) {
                ExtractedField field = new ExtractedField();
                field.setDocument(document);
                field.setFieldName(fieldName);
                field.setValue(values.get(fieldName));
                extractedFieldRepository.save(field);
            }
            document.setExtractionStatus(ExtractionStatus.DONE);
            document.setExtractionError(null);
        } else {
            document.setExtractionStatus(ExtractionStatus.FAILED);
            document.setExtractionError(result.errorMessage());
        }
        documentRepository.save(document);
    }
}
