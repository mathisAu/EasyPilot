package com.easypilot.backend.folder;

public record FolderDto(Long id, String name) {

    public static FolderDto from(Folder folder) {
        return new FolderDto(folder.getId(), folder.getName());
    }
}
