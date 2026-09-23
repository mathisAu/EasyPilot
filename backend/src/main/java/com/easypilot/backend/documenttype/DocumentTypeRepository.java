package com.easypilot.backend.documenttype;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {

    List<DocumentType> findByOrganizationId(Long organizationId);

    long countByOrganizationId(Long organizationId);

    List<DocumentType> findByFolderId(Long folderId);
}
