package com.easypilot.backend.folder;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);
}
