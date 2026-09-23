package com.easypilot.backend.extraction;

import com.easypilot.backend.document.Document;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "extracted_fields")
public class ExtractedField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(nullable = false)
    private String fieldName;

    @Column(name = "field_value", columnDefinition = "TEXT")
    private String value;

    @Column(nullable = false)
    private boolean edited = false;

    @Column(nullable = false, columnDefinition = "boolean not null default true")
    private boolean included = true;

    // Where this field's value sits on the source document, as fractions (0-1) of
    // page/image width and height from the top-left corner. Null when the AI
    // couldn't locate the field, or for documents extracted before this existed —
    // used only to burn edits into a downloadable copy of the original file.
    private Integer boxPage;
    private Double boxX;
    private Double boxY;
    private Double boxWidth;
    private Double boxHeight;

    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void onSave() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public boolean isEdited() {
        return edited;
    }

    public void setEdited(boolean edited) {
        this.edited = edited;
    }

    public boolean isIncluded() {
        return included;
    }

    public void setIncluded(boolean included) {
        this.included = included;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Integer getBoxPage() {
        return boxPage;
    }

    public void setBoxPage(Integer boxPage) {
        this.boxPage = boxPage;
    }

    public Double getBoxX() {
        return boxX;
    }

    public void setBoxX(Double boxX) {
        this.boxX = boxX;
    }

    public Double getBoxY() {
        return boxY;
    }

    public void setBoxY(Double boxY) {
        this.boxY = boxY;
    }

    public Double getBoxWidth() {
        return boxWidth;
    }

    public void setBoxWidth(Double boxWidth) {
        this.boxWidth = boxWidth;
    }

    public Double getBoxHeight() {
        return boxHeight;
    }

    public void setBoxHeight(Double boxHeight) {
        this.boxHeight = boxHeight;
    }

    public boolean hasBox() {
        return boxX != null && boxY != null && boxWidth != null && boxHeight != null;
    }
}
