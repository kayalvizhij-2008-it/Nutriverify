package com.nutriverify.data;

import com.nutriverify.entity.UploadedDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UploadedDocumentRepository extends JpaRepository<UploadedDocumentEntity, Long> {
    List<UploadedDocumentEntity> findByUserIdOrderByUploadedAtDesc(String userId);
}
