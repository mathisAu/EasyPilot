package com.easypilot.backend.extraction;

/** confidence is the model's own 0-1 estimate, or null if it didn't give one. */
record ExtractedValue(String value, FieldBox box, Double confidence) {
}
