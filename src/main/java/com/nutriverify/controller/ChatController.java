package com.nutriverify.controller;

import com.nutriverify.data.AnalysisHistoryRepository;
import com.nutriverify.data.UserRepository;
import com.nutriverify.dto.ChatRequest;
import com.nutriverify.dto.ChatResponse;
import com.nutriverify.entity.AnalysisHistoryEntity;
import com.nutriverify.entity.UserEntity;
import com.nutriverify.service.NutriSaathiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Controller for NutriSaathi AI assistant chat.
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

        String response = nutriSaathiService.processMessage(
                request.getMessage(), analysisContext, language);

        List<String> followUps = nutriSaathiService.getSuggestedFollowUps(
                request.getMessage(), analysisContext);

        ChatResponse chatResponse = new ChatResponse(
                response, language, followUps,
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        return ResponseEntity.ok(chatResponse);
    }
}
