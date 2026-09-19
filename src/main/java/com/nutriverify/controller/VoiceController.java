package com.nutriverify.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Voice Saathi controller for speech-to-text and text-to-speech.
 */
@RestController
@RequestMapping("/api/v1/voice")
public class VoiceController {

    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, Object>> transcribe(@RequestBody Map<String, Object> request, Authentication authentication) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "manual-entry-required");
        response.put("message", "Speech-to-text provider not configured. Voice input requires a configured speech provider.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/speak")
    public ResponseEntity<Map<String, Object>> speak(@RequestBody Map<String, Object> request, Authentication authentication) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "manual-entry-required");
        response.put("message", "Text-to-speech provider not configured. Voice output requires a configured TTS provider.");
        return ResponseEntity.ok(response);
    }
}
