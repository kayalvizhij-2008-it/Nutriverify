package com.nutriverify.data;

import com.nutriverify.entity.SavedProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedProductRepository extends JpaRepository<SavedProductEntity, Long> {
    List<SavedProductEntity> findByUserIdOrderBySavedAtDesc(String userId);
    List<SavedProductEntity> findByUserIdAndProductNameContainingIgnoreCase(String userId, String name);
}
