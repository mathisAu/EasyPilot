package com.easypilot.backend.extraction;

import java.util.Map;

record ExtractionResult(Map<String, String> values, String errorMessage) {

    static ExtractionResult success(Map<String, String> values) {
        return new ExtractionResult(values, null);
    }

    static ExtractionResult failure(String errorMessage) {
        return new ExtractionResult(null, errorMessage);
    }

    boolean isSuccess() {
        return errorMessage == null;
    }
}
