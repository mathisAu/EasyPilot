package com.easypilot.backend.folder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FolderRequest(
        @NotBlank(message = "Mapnaam is verplicht")
        @Size(max = 60, message = "Mapnaam mag maximaal 60 tekens zijn")
        String name
) {
}
