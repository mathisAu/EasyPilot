package com.easypilot.backend.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByDocumentTypeIdOrderByUploadedAtDesc(Long documentTypeId);
}
