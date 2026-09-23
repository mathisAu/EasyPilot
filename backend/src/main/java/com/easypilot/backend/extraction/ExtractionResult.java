package com.easypilot.backend.extraction;

import java.util.Map;

record ExtractionResult(Map<String, ExtractedValue> values, String errorMessage) {

    static ExtractionResult success(Map<String, ExtractedValue> values) {
        return new ExtractionResult(values, null);
    }

    static ExtractionResult failure(String errorMessage) {
        return new ExtractionResult(null, errorMessage);
    }

    boolean isSuccess() {
        return errorMessage == null;
    }
}
