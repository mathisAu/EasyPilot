package com.easypilot.backend.documenttype;

import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.document.Document;
import com.easypilot.backend.folder.Folder;
import com.easypilot.backend.folder.FolderRepository;
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
    private final FolderRepository folderRepository;

    public DocumentTypeService(DocumentTypeRepository repository, FileStorageService fileStorageService,
                               FolderRepository folderRepository) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
        this.folderRepository = folderRepository;
    }

    @Transactional(readOnly = true)
    public List<DocumentTypeDto> findAllVisibleTo(AppUser currentUser) {
        List<DocumentType> types = currentUser.getRole() == Role.ADMIN
                ? repository.findAll()
                : repository.findByOrganizationId(requireOrganizationId(currentUser));
        return types.stream().map(type -> toDto(type, currentUser)).toList();
    }

    @Transactional(readOnly = true)
    public DocumentTypeDto findOneVisibleTo(Long id, AppUser currentUser) {
        return toDto(getVisibleOrThrow(id, currentUser), currentUser);
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
            type.setStatus(RequestStatus.AANGELEVERD);
        }

        return toDto(repository.save(type), currentUser);
    }

    @Transactional
    public DocumentTypeDto update(Long id, DocumentTypeRequest request) {
        DocumentType type = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documenttype niet gevonden"));
        applyRequest(type, request);
        return DocumentTypeDto.from(repository.save(type));
    }

    @Transactional
    public DocumentTypeDto changeStatus(Long id, RequestStatus status) {
        DocumentType type = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documenttype niet gevonden"));
        type.setStatus(status);
        return DocumentTypeDto.from(repository.save(type));
    }

    @Transactional
    public DocumentTypeDto moveToFolder(Long id, Long folderId) {
        DocumentType type = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documenttype niet gevonden"));
        Folder folder = folderId == null ? null : folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Map niet gevonden"));
        type.setFolder(folder);
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

    private DocumentTypeDto toDto(DocumentType type, AppUser currentUser) {
        DocumentTypeDto dto = DocumentTypeDto.from(type);
        return currentUser.getRole() == Role.ADMIN ? dto : dto.withoutFolder();
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
        type.setStatus(request.status() != null ? request.status() : RequestStatus.AANGELEVERD);
        type.getFields().clear();
        if (request.fields() != null) {
            type.getFields().addAll(request.fields());
        }
    }
}
