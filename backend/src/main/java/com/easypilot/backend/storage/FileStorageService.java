package com.easypilot.backend.storage;

import com.easypilot.backend.common.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final Path root;

    public FileStorageService(@Value("${app.storage.location}") String location) {
        this.root = Paths.get(location).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Kon opslagmap niet aanmaken: " + root, e);
        }
    }

    public String store(MultipartFile file) {
        String extension = extractExtension(file.getOriginalFilename());
        String storedFilename = UUID.randomUUID() + extension;
        Path target = root.resolve(storedFilename).normalize();
        if (!target.getParent().equals(root)) {
            throw new IllegalArgumentException("Ongeldige bestandsnaam");
        }
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Kon bestand niet opslaan", e);
        }
        return storedFilename;
    }

    public Resource loadAsResource(String storedFilename) {
        Path path = root.resolve(storedFilename).normalize();
        if (!path.getParent().equals(root)) {
            throw new ResourceNotFoundException("Bestand niet gevonden");
        }
        try {
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Bestand niet gevonden");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Bestand niet gevonden");
        }
    }

    public void delete(String storedFilename) {
        try {
            Path path = root.resolve(storedFilename).normalize();
            if (!path.getParent().equals(root)) {
                return;
            }
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Kon bestand {} niet verwijderen van schijf", storedFilename, e);
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        String name = Paths.get(originalFilename).getFileName().toString();
        int dotIndex = name.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == name.length() - 1) {
            return "";
        }
        String extension = name.substring(dotIndex).replaceAll("[^a-zA-Z0-9.]", "");
        return extension.length() > 10 ? "" : extension;
    }
}
