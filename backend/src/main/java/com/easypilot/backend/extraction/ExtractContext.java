package com.easypilot.backend.extraction;

import java.util.List;

record ExtractContext(Long documentId, byte[] bytes, String contentType, List<String> fieldNames) {
}
