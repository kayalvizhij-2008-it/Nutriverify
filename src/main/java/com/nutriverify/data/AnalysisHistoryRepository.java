package com.nutriverify.data;

import com.nutriverify.entity.AnalysisHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisHistoryRepository extends JpaRepository<AnalysisHistoryEntity, Long> {
    List<AnalysisHistoryEntity> findByUserIdOrderByAnalyzedAtDesc(String userId);
    List<AnalysisHistoryEntity> findByUserIdAndProductNameContainingIgnoreCase(String userId, String productName);
}
