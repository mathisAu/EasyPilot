package com.easypilot.backend.extraction;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExtractedFieldRepository extends JpaRepository<ExtractedField, Long> {

    List<ExtractedField> findByDocumentIdOrderByIdAsc(Long documentId);

    void deleteByDocumentId(Long documentId);

    /**
     * Fields on other documents of the same type where an admin replaced what the AI
     * read with a different, non-empty value. Cleared fields are left out: removing a
     * value means "not wanted", not "read wrong".
     */
    @Query("""
            select f from ExtractedField f
            where f.document.documentType.id = :typeId
              and f.document.id <> :excludeDocumentId
              and f.originalValue is not null
              and f.value is not null
              and trim(f.value) <> ''
              and f.value <> f.originalValue
            order by f.updatedAt desc
            """)
    List<ExtractedField> findRecentCorrections(@Param("typeId") Long typeId,
                                               @Param("excludeDocumentId") Long excludeDocumentId,
                                               Pageable pageable);
}
