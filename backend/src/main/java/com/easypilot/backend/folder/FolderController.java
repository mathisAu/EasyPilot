package com.easypilot.backend.folder;

import com.easypilot.backend.common.BadRequestException;
import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.documenttype.DocumentTypeRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@PreAuthorize("hasRole('ADMIN')")
public class FolderController {

    private final FolderRepository folderRepository;
    private final DocumentTypeRepository documentTypeRepository;

    public FolderController(FolderRepository folderRepository, DocumentTypeRepository documentTypeRepository) {
        this.folderRepository = folderRepository;
        this.documentTypeRepository = documentTypeRepository;
    }

    @GetMapping
    public List<FolderDto> findAll() {
        return folderRepository.findAllByOrderByNameAsc().stream().map(FolderDto::from).toList();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<FolderDto> create(@Valid @RequestBody FolderRequest request) {
        String name = request.name().trim();
        if (folderRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Er bestaat al een map met deze naam");
        }
        Folder folder = new Folder();
        folder.setName(name);
        return ResponseEntity.status(HttpStatus.CREATED).body(FolderDto.from(folderRepository.save(folder)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Map niet gevonden"));
        // Deleting a folder only ungroups its document types; it never deletes them.
        documentTypeRepository.findByFolderId(id).forEach(type -> type.setFolder(null));
        folderRepository.delete(folder);
        return ResponseEntity.noContent().build();
    }
}
