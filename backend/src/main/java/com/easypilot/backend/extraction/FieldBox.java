package com.easypilot.backend.extraction;

/**
 * Where a field's value sits on the source document: page index (0-based, always
 * 0 for a single image) plus x/y/width/height as fractions (0-1) of the page or
 * image size, measured from the top-left corner.
 */
record FieldBox(int page, double x, double y, double width, double height) {
}
