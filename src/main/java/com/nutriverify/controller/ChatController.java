package com.nutriverify.controller;

import com.nutriverify.data.AnalysisHistoryRepository;
import com.nutriverify.data.UserRepository;
import com.nutriverify.dto.ChatRequest;
import com.nutriverify.dto.ChatResponse;
import com.nutriverify.entity.AnalysisHistoryEntity;
import com.nutriverify.service.NutriSaathiService;
import com.nutriverify.service.ai.AIResult;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Controller for NutriSaathi AI assistant chat with hybrid AI routing.
 */
@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final NutriSaathiService nutriSaathiService;
    private final AnalysisHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public ChatController(NutriSaathiService nutriSaathiService,
                          AnalysisHistoryRepository historyRepository,
                          UserRepository userRepository) {
        this.nutriSaathiService = nutriSaathiService;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            Authentication authentication) {

        String language = request.getLanguage() != null ? request.getLanguage() : "en";

        // Check if analysis context is provided
        AnalysisHistoryEntity analysisContext = null;
        if (request.getAnalysisContextId() != null) {
            analysisContext = historyRepository.findById(request.getAnalysisContextId()).orElse(null);
        }

        AIResult result = nutriSaathiService.processMessageDetails(
                request.getMessage(), analysisContext, language);

        List<String> followUps = nutriSaathiService.getSuggestedFollowUps(
                request.getMessage(), analysisContext);

        String contextProductName = analysisContext != null ? analysisContext.getProductName() : null;

        ChatResponse chatResponse = new ChatResponse(
                result.getContent(),
                language,
                followUps,
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                result.getProviderType(),
                result.getStatusLabel(),
                contextProductName,
                result.isFallback()
        );

        return ResponseEntity.ok(chatResponse);
    }
}
