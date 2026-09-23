package com.easypilot.backend.extraction;

/** A value an admin fixed on an earlier document of the same type: what the AI read vs. what was correct. */
record FieldCorrection(String fieldName, String extractedValue, String correctedValue) {
}
