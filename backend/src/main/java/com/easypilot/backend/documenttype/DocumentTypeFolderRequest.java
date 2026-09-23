package com.easypilot.backend.documenttype;

/** folderId null moves the document type out of any folder. */
public record DocumentTypeFolderRequest(Long folderId) {
}
