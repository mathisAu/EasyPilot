package com.easypilot.backend.document;

import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.documenttype.DocumentType;
import com.easypilot.backend.documenttype.DocumentTypeService;
import com.easypilot.backend.storage.FileStorageService;
import com.easypilot.backend.user.AppUser;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentTypeService documentTypeService;
    private final FileStorageService fileStorageService;

    public DocumentService(DocumentRepository documentRepository,
                            DocumentTypeService documentTypeService,
                            FileStorageService fileStorageService) {
        this.documentRepository = documentRepository;
        this.documentTypeService = documentTypeService;
        this.fileStorageService = fileStorageService;
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

    @Transactional
    public void delete(Long id) {
        Document document = getOrThrow(id);
        fileStorageService.delete(document.getStoredFilename());
        documentRepository.delete(document);
    }

    private Document getOrThrow(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document niet gevonden"));
    }
}
