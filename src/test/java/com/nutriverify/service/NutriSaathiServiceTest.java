package com.nutriverify.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutriverify.entity.AnalysisHistoryEntity;
import com.nutriverify.service.ai.AIProviderRouter;
import com.nutriverify.service.ai.AIResult;
import com.nutriverify.service.ai.DeterministicNutriSaathiProvider;
import com.nutriverify.service.ai.ExternalLLMProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class NutriSaathiServiceTest {

    private NutriSaathiService service;
    private AIProviderRouter router;
    private DeterministicNutriSaathiProvider deterministicProvider;
    private ExternalLLMProvider externalLLMProvider;

    @BeforeEach
    public void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        deterministicProvider = new DeterministicNutriSaathiProvider();
        // Unconfigured key -> falls back to deterministic engine
        externalLLMProvider = new ExternalLLMProvider("", "gpt-4o-mini", "https://api.openai.com/v1", 1000, objectMapper);
        router = new AIProviderRouter(externalLLMProvider, deterministicProvider);
        service = new NutriSaathiService(router);
    }

    @Test
    public void testGreetingResponse() {
        AIResult result = service.processMessageDetails("hi", null, "en");
        assertNotNull(result);
        assertNotNull(result.getContent());
        assertFalse(result.getContent().isEmpty());
        assertEquals("DETERMINISTIC_FALLBACK", result.getProviderType());
        assertEquals("Verified fallback", result.getStatusLabel());
    }

    @Test
    public void testHelloResponse() {
        String response = service.processMessage("hello", null, "en");
        assertNotNull(response);
        assertFalse(response.isEmpty());
    }

    @Test
    public void testThankYouResponse() {
        String response = service.processMessage("thanks", null, "en");
        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("welcome"));
    }

    @Test
    public void testByeResponse() {
        String response = service.processMessage("bye", null, "en");
        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("goodbye"));
    }

    @Test
    public void testGeneralSodiumQuestion() {
        String response = service.processMessage("what is sodium?", null, "en");
        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("sodium"));
    }

    @Test
    public void testGeneralProteinQuestion() {
        String response = service.processMessage("what is protein?", null, "en");
        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("protein"));
    }

    @Test
    public void testGeneralCaloriesQuestion() {
        String response = service.processMessage("what are calories?", null, "en");
        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("calori"));
    }

    @Test
    public void testGeneralFiberQuestion() {
        String response = service.processMessage("what is fiber?", null, "en");
        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("fiber"));
    }

    @Test
    public void testGeneralAllergensQuestion() {
        String response = service.processMessage("what are allergens?", null, "en");
        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("allergen"));
    }

    @Test
    public void testContextualHealthScoreQuestion() {
        AnalysisHistoryEntity ctx = new AnalysisHistoryEntity();
        ctx.setProductName("Test Chips");
        ctx.setBrand("CrunchCo");
        ctx.setHealthScore(45);
        ctx.setSugar(15);
        ctx.setSodium(500);
        ctx.setFat(12);
        ctx.setProtein(3);
        ctx.setFiber(1);

        String response = service.processMessage("why did my product get a low score?", ctx, "en");
        assertNotNull(response);
        assertTrue(response.contains("45"), "Should mention the actual score");
    }

    @Test
    public void testContextualIngredientQuestion() {
        AnalysisHistoryEntity ctx = new AnalysisHistoryEntity();
        ctx.setProductName("Test Food");
        ctx.setBrand("Brand");
        ctx.setHealthScore(70);
        ctx.setIngredientRisks("[{\"category\":\"ARTIFICIAL\",\"count\":2}]");

        String response = service.processMessage("what ingredients should I watch?", ctx, "en");
        assertNotNull(response);
        assertFalse(response.isEmpty());
    }

    @Test
    public void testContextualAllergenQuestion() {
        AnalysisHistoryEntity ctx = new AnalysisHistoryEntity();
        ctx.setProductName("Granola Bar");
        ctx.setBrand("Nature");
        ctx.setHealthScore(65);

        String response = service.processMessage("are there allergens?", ctx, "en");
        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("allergen"));
    }

    @Test
    public void testContextualSugarQuestion() {
        AnalysisHistoryEntity ctx = new AnalysisHistoryEntity();
        ctx.setProductName("Yogurt");
        ctx.setBrand("DairyCo");
        ctx.setHealthScore(60);
        ctx.setSugar(18);

        String response = service.processMessage("what is the sugar content?", ctx, "en");
        assertNotNull(response);
        assertTrue(response.contains("18"));
    }

    @Test
    public void testContextualSodiumQuestion() {
        AnalysisHistoryEntity ctx = new AnalysisHistoryEntity();
        ctx.setProductName("Soup");
        ctx.setBrand("SoupCo");
        ctx.setHealthScore(55);
        ctx.setSodium(800);

        String response = service.processMessage("what is the sodium content?", ctx, "en");
        assertNotNull(response);
        assertTrue(response.contains("800"));
    }

    @Test
    public void testUnknownQuestionWithNoContext() {
        String response = service.processMessage("what is quantum physics?", null, "en");
        assertNotNull(response);
        assertFalse(response.isEmpty());
    }

    @Test
    public void testSuggestedFollowUpsWithContext() {
        AnalysisHistoryEntity ctx = new AnalysisHistoryEntity();
        ctx.setHealthScore(50);
        ctx.setProductName("Test");

        List<String> suggestions = service.getSuggestedFollowUps("hello", ctx);
        assertFalse(suggestions.isEmpty());
        assertTrue(suggestions.size() >= 3);
    }

    @Test
    public void testSuggestedFollowUpsWithoutContext() {
        List<String> suggestions = service.getSuggestedFollowUps("hello", null);
        assertFalse(suggestions.isEmpty());
        assertTrue(suggestions.size() >= 3);
    }

    @Test
    public void testLanguageParameterAccepted() {
        String response = service.processMessage("hello", null, "ta");
        assertNotNull(response);
        assertFalse(response.isEmpty());
    }

    @Test
    public void testExternalAIAvailabilityCheck() {
        assertFalse(externalLLMProvider.isAvailable());
        assertFalse(service.isExternalAIAvailable());
    }

    @Test
    public void testExternalAIConfiguredAvailability() {
        ExternalLLMProvider configuredProvider = new ExternalLLMProvider(
                "sk-dummy-test-key", "gpt-4o-mini", "https://api.openai.com/v1", 1000, new ObjectMapper());
        assertTrue(configuredProvider.isAvailable());
    }
}
