package com.nutriverify.service;

import com.nutriverify.entity.AnalysisHistoryEntity;
import com.nutriverify.util.JsonMapper;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * NutriSaathi - Conversational AI assistant for NutriVerify.
 * Uses a rules-based approach for responses; can be extended with external AI providers.
 */
@Service
public class NutriSaathiService {

    private static final Map<String, String> GREETINGS = new LinkedHashMap<>();
    private static final Map<String, String> GENERAL_NUTRITION = new LinkedHashMap<>();

    static {
        GREETINGS.put("hi", "Hello! I'm NutriSaathi, your nutrition intelligence assistant. I can help you understand food labels, analyze nutrition, and make healthier choices. How can I help you today?");
        GREETINGS.put("hello", "Hi there! Welcome to NutriSaathi. Ask me anything about nutrition, food labels, or the products you've analyzed.");
        GREETINGS.put("hey", "Hey! I'm NutriSaathi. Ready to help with any nutrition questions you have!");
        GREETINGS.put("good morning", "Good morning! Ready to make some healthy food choices today?");
        GREETINGS.put("good afternoon", "Good afternoon! How can I help with your nutrition questions?");
        GREETINGS.put("good evening", "Good evening! Let me help you understand what's in your food.");
        GREETINGS.put("thanks", "You're welcome! Let me know if you have any more nutrition questions.");
        GREETINGS.put("thank you", "You're welcome! I'm here whenever you need nutrition guidance.");
        GREETINGS.put("bye", "Goodbye! Remember, informed food choices are healthier food choices. Take care!");
        GREETINGS.put("who are you", "I'm NutriSaathi, your nutrition intelligence assistant built into NutriVerify. I can help analyze food labels, explain nutrition facts, verify claims, and provide personalized dietary insights.");
        GREETINGS.put("what can you do", "I can help you with:\n- Understanding food labels and nutrition facts\n- Explaining ingredients and their categories\n- Verifying health claims on packaging\n- Identifying potential allergens\n- Comparing products\n- Personalized nutrition advice based on your goals\n\nJust ask me anything about nutrition or food!");

        GENERAL_NUTRITION.put("what is sodium", "Sodium is a mineral essential for bodily functions, but too much can raise blood pressure. The recommended daily limit is about 2,300mg (about 1 teaspoon of salt). Most adults should aim for less than 1,500mg. High sodium is common in processed foods.");
        GENERAL_NUTRITION.put("what is protein", "Protein is a macronutrient essential for building and repairing tissues, making enzymes and hormones. The recommended daily intake is about 0.8g per kg of body weight. Good sources include lean meats, eggs, dairy, legumes, and nuts.");
        GENERAL_NUTRITION.put("what are carbs", "Carbohydrates (carbs) are your body's main energy source. They're found in grains, fruits, vegetables, and sugars. Complex carbs (whole grains, vegetables) provide sustained energy, while simple carbs (sugar, white flour) give quick energy but less nutrition.");
        GENERAL_NUTRITION.put("what is fiber", "Dietary fiber is a type of carbohydrate that your body can't digest. It helps with digestion, blood sugar control, and heart health. Recommended daily intake is 25-30g. Good sources include whole grains, fruits, vegetables, and legumes.");
        GENERAL_NUTRITION.put("what is sugar", "Sugar is a simple carbohydrate that provides quick energy. The WHO recommends limiting added sugars to less than 10% of daily calories (about 25g for a 2000-calorie diet). Too much sugar is linked to obesity, diabetes, and heart disease.");
        GENERAL_NUTRITION.put("what is fat", "Fat is an essential macronutrient for energy, cell growth, and nutrient absorption. Unsaturated fats (olive oil, nuts, fish) are healthy. Saturated fats should be limited. Trans fats should be avoided. The daily recommended fat intake is about 44-77g.");
        GENERAL_NUTRITION.put("what are calories", "Calories measure the energy in food. Your body needs calories for basic functions (breathing, circulation) and activity. An average adult needs about 2,000-2,500 calories per day, depending on age, gender, and activity level.");
        GENERAL_NUTRITION.put("what is bmi", "BMI (Body Mass Index) is a measure of body fat based on height and weight. A BMI of 18.5-24.9 is considered normal weight. However, BMI doesn't account for muscle mass, bone density, or body composition, so it's just one indicator of health.");
        GENERAL_NUTRITION.put("what is cholesterol", "Cholesterol is a waxy substance found in your blood. Your body needs it to build cells, but too much can increase heart disease risk. There are two types: LDL ('bad') cholesterol should be low, and HDL ('good') cholesterol should be high.");
        GENERAL_NUTRITION.put("what are allergens", "Food allergens are proteins in certain foods that can trigger immune responses in sensitive individuals. The major allergens include milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, and soy. Always check food labels for allergen warnings.");
    }

    /**
     * Process a chat message and return a response.
     */
    public String processMessage(String message, AnalysisHistoryEntity analysisContext, String language) {
        String normalized = message.trim().toLowerCase();

        // Layer 1: General conversational context
        if (isGreeting(normalized)) {
            return translate(getGreeting(normalized), language);
        }

        // Layer 2: General nutrition questions
        for (Map.Entry<String, String> entry : GENERAL_NUTRITION.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                return translate(entry.getValue(), language);
            }
        }

        // Layer 3: Analysis-context questions
        if (analysisContext != null) {
            return handleAnalysisContextQuestion(normalized, analysisContext, language);
        }

        // Default response
        return translate("I'm NutriSaathi, your nutrition assistant. I can help with nutrition questions, food label analysis, and ingredient information. Could you ask me something specific about nutrition, or would you like to analyze a product first?", language);
    }

    /**
     * Get suggested follow-up questions.
     */
    public List<String> getSuggestedFollowUps(String lastMessage, AnalysisHistoryEntity context) {
        List<String> suggestions = new ArrayList<>();
        if (context != null) {
            suggestions.add("Why is this product's health score " + context.getHealthScore() + "?");
            suggestions.add("What ingredients should I watch?");
            suggestions.add("Are there allergens in this product?");
            suggestions.add("Explain the claim verification");
        } else {
            suggestions.add("What is sodium?");
            suggestions.add("How much protein should I eat daily?");
            suggestions.add("What are the best sources of fiber?");
            suggestions.add("Help me analyze a food product");
        }
        return suggestions;
    }

    private boolean isGreeting(String message) {
        return GREETINGS.keySet().stream().anyMatch(message::contains) ||
               message.matches(".*(hi|hello|hey|greetings|howdy|yo)\\b.*");
    }

    private String getGreeting(String message) {
        for (Map.Entry<String, String> entry : GREETINGS.entrySet()) {
            if (message.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return GREETINGS.get("hi");
    }

    private String handleAnalysisContextQuestion(String question, AnalysisHistoryEntity ctx, String language) {
        // Health score question
        if (question.contains("health score") || question.contains("low score") || question.contains("high score") || question.contains("why") && question.contains("score")) {
            int score = ctx.getHealthScore();
            String assessment;
            if (score >= 80) {
                assessment = "This product has a good health score of " + score + "/100. ";
            } else if (score >= 50) {
                assessment = "This product has a moderate health score of " + score + "/100. ";
            } else {
                assessment = "This product has a low health score of " + score + "/100. ";
            }
            String details = "The score considers sugar (" + ctx.getSugar() + "g), sodium (" + ctx.getSodium() + "mg), fat (" + ctx.getFat() + "g), protein (" + ctx.getProtein() + "g), and fiber (" + ctx.getFiber() + "g).";
            return translate(assessment + details, language);
        }

        // Ingredient question
        if (question.contains("ingredient") || question.contains("watch")) {
            String risks = ctx.getIngredientRisks();
            if (risks != null && !risks.equals("[]") && !risks.isEmpty()) {
                return translate("This product has ingredients in concerning categories. The ingredient risk data shows categories that may include artificial additives, preservatives, or other non-natural ingredients. I recommend reviewing the full ingredient list carefully.", language);
            }
            return translate("This product's ingredients appear to be primarily natural, which is a positive indicator.", language);
        }

        // Allergen question
        if (question.contains("allergen")) {
            return translate("The allergen detection in this analysis identifies potential allergens based on common food allergen categories (milk, wheat, eggs, peanuts, soy, etc.). Please check the ingredient list for specific allergen warnings. NutriVerify uses cautious language and doesn't provide medical certainty about allergen presence.", language);
        }

        // Claim question
        if (question.contains("claim") || question.contains("verified")) {
            String claimResults = ctx.getClaimResults();
            if (claimResults != null && !claimResults.equals("[]")) {
                return translate("The claim verification system checks each marketing claim against the actual nutrition data. Claims are rated as VERIFIED, PARTIALLY SUPPORTED, NOT SUPPORTED, or INSUFFICIENT DATA. Each verdict includes an explanation of why that conclusion was reached. You can see the detailed results in the analysis.", language);
            }
            return translate("This product doesn't have any marketing claims listed. If you'd like to verify claims, you can add them when analyzing a product.", language);
        }

        // Sugar/sodium specifics
        if (question.contains("sugar")) {
            double sugar = ctx.getSugar();
            String level = sugar > 10 ? "high" : (sugar > 5 ? "moderate" : "low");
            return translate("This product contains " + sugar + "g of sugar per serving, which is " + level + ". The WHO recommends limiting added sugars to less than 25g per day.", language);
        }
        if (question.contains("sodium")) {
            double sodium = ctx.getSodium();
            String level = sodium > 400 ? "high" : (sodium > 200 ? "moderate" : "low");
            return translate("This product contains " + sodium + "mg of sodium per serving, which is " + level + ". The recommended daily limit is about 2,300mg.", language);
        }

        // Default analysis-context response
        return translate("Based on the analysis of " + ctx.getProductName() + " by " + ctx.getBrand() + ": Health Score is " + ctx.getHealthScore() + "/100, Authenticity Score is " + ctx.getAuthenticityScore() + "/100, Risk Level is " + ctx.getRiskLevel() + ". Feel free to ask specific questions about nutrition, ingredients, claims, or allergens.", language);
    }

    private String translate(String text, String language) {
        // In production, this would call a translation API
        // For now, return English for all languages
        // Demo: basic Hindi/Tamil translations for common phrases
        if ("hi".equals(language) && text.contains("Hello")) {
            return text.replace("Hello", "नमस्ते").replace("I'm NutriSaathi, your nutrition intelligence assistant. I can help you understand food labels, analyze nutrition, and make healthier choices. How can I help you today?",
                    "मैं NutriSaathi हूँ, आपका पोषण सहायक। मैं खाद्य लेबल समझने, पोषण विश्लेषण करने, और स्वस्थ विकल्प बनाने में मदद कर सकता हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?");
        }
        return text;
    }
}
