package com.easypilot.backend.documenttype;

import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.document.Document;
import com.easypilot.backend.organization.Organization;
import com.easypilot.backend.storage.FileStorageService;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DocumentTypeService {

    private final DocumentTypeRepository repository;
    private final FileStorageService fileStorageService;

    public DocumentTypeService(DocumentTypeRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<DocumentTypeDto> findAllVisibleTo(AppUser currentUser) {
        List<DocumentType> types = currentUser.getRole() == Role.ADMIN
                ? repository.findAll()
                : repository.findByOrganizationId(requireOrganizationId(currentUser));
        return types.stream().map(DocumentTypeDto::from).toList();
    }

    @Transactional(readOnly = true)
    public DocumentTypeDto findOneVisibleTo(Long id, AppUser currentUser) {
        return DocumentTypeDto.from(getVisibleOrThrow(id, currentUser));
    }

    @Transactional
    public DocumentTypeDto create(DocumentTypeRequest request, AppUser currentUser) {
        DocumentType type = new DocumentType();
        applyRequest(type, request);

        if (currentUser.getRole() == Role.CUSTOMER) {
            Organization organization = currentUser.getOrganization();
            if (organization == null) {
                throw new ResourceNotFoundException("Geen organisatie gekoppeld aan dit account");
            }
            type.setOrganization(organization);
            type.setLive(false);
        }

        return DocumentTypeDto.from(repository.save(type));
    }

    @Transactional
    public DocumentTypeDto update(Long id, DocumentTypeRequest request) {
        DocumentType type = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documenttype niet gevonden"));
        applyRequest(type, request);
        return DocumentTypeDto.from(repository.save(type));
    }

    @Transactional
    public void delete(Long id) {
        DocumentType type = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documenttype niet gevonden"));
        for (Document document : type.getDocuments()) {
            fileStorageService.delete(document.getStoredFilename());
        }
        repository.delete(type);
    }

    @Transactional(readOnly = true)
    public DocumentType getVisibleOrThrow(Long id, AppUser currentUser) {
        DocumentType type = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documenttype niet gevonden"));
        if (currentUser.getRole() == Role.CUSTOMER) {
            Long myOrgId = requireOrganizationId(currentUser);
            if (type.getOrganization() == null || !type.getOrganization().getId().equals(myOrgId)) {
                throw new ResourceNotFoundException("Documenttype niet gevonden");
            }
        }
        return type;
    }

    private Long requireOrganizationId(AppUser currentUser) {
        if (currentUser.getOrganization() == null) {
            throw new ResourceNotFoundException("Geen organisatie gekoppeld aan dit account");
        }
        return currentUser.getOrganization().getId();
    }

    private void applyRequest(DocumentType type, DocumentTypeRequest request) {
        type.setName(request.name());
        type.setProvider(request.provider());
        type.setLive(request.live());
        type.getFields().clear();
        if (request.fields() != null) {
            type.getFields().addAll(request.fields());
        }
    }
}
