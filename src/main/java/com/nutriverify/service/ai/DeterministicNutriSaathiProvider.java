package com.nutriverify.service.ai;

import com.nutriverify.entity.AnalysisHistoryEntity;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Deterministic domain-rule provider for NutriVerify AI.
 * Serves as a reliable local engine when external AI is unconfigured or unavailable.
 */
@Component
public class DeterministicNutriSaathiProvider implements AIProvider {

    private static final Map<String, String> GREETINGS = new LinkedHashMap<>();
    private static final Map<String, String> GENERAL_NUTRITION = new LinkedHashMap<>();

    static {
        GREETINGS.put("hi", "Hello! I'm the NutriVerify AI Assistant. I can help you understand food labels, analyze nutrition, and make healthier choices. How can I help you today?");
        GREETINGS.put("hello", "Hi there! Welcome to NutriVerify AI. Ask me anything about nutrition, food labels, or the products you've analyzed.");
        GREETINGS.put("hey", "Hey! I'm the NutriVerify AI Assistant. Ready to help with any nutrition questions you have!");
        GREETINGS.put("good morning", "Good morning! Ready to make some healthy food choices today?");
        GREETINGS.put("good afternoon", "Good afternoon! How can I help with your nutrition questions?");
        GREETINGS.put("good evening", "Good evening! Let me help you understand what's in your food.");
        GREETINGS.put("thanks", "You're welcome! Let me know if you have any more nutrition questions.");
        GREETINGS.put("thank you", "You're welcome! I'm here whenever you need nutrition guidance.");
        GREETINGS.put("bye", "Goodbye! Remember, informed food choices are healthier food choices. Take care!");
        GREETINGS.put("who are you", "I'm the NutriVerify AI Assistant. I help analyze food labels, explain nutrition facts, verify statutory claims, and provide evidence-based dietary insights.");
        GREETINGS.put("what can you do", "I can help you with:\n- Explaining verified food labels and nutrition facts\n- Analyzing ingredients and risk categories\n- Verifying health claims on packaging\n- Identifying potential allergens\n- Head-to-head product comparisons\n- Explaining Health & Authenticity Scores\n\nJust ask me anything about food or nutrition!");

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

    @Override
    public AIResult generateResponse(String userPrompt, AnalysisHistoryEntity context, String language) {
        String normalized = userPrompt.trim().toLowerCase();

        // Layer 1: General conversational context
        if (isGreeting(normalized)) {
            return AIResult.verifiedFallback(translate(getGreeting(normalized), language));
        }

        // Layer 2: General nutrition questions
        for (Map.Entry<String, String> entry : GENERAL_NUTRITION.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                return AIResult.verifiedFallback(translate(entry.getValue(), language));
            }
        }

        // Layer 3: Analysis-context questions
        if (context != null) {
            return AIResult.verifiedFallback(handleAnalysisContextQuestion(normalized, context, language));
        }

        // Default response
        return AIResult.verifiedFallback(translate("I'm the NutriVerify AI Assistant. I can help with nutrition questions, food label analysis, and ingredient information. Could you ask me something specific about nutrition, or select a product to analyze?", language));
    }

    @Override
    public boolean isAvailable() {
        return true; // Always available as local fallback
    }

    @Override
    public String getProviderName() {
        return "DeterministicNutriSaathiProvider";
    }

    private boolean isGreeting(String message) {
        return GREETINGS.keySet().stream().anyMatch(key ->
                Pattern.compile("\\b" + Pattern.quote(key) + "\\b", Pattern.CASE_INSENSITIVE).matcher(message).find());
    }

    private String getGreeting(String message) {
        for (Map.Entry<String, String> entry : GREETINGS.entrySet()) {
            if (Pattern.compile("\\b" + Pattern.quote(entry.getKey()) + "\\b", Pattern.CASE_INSENSITIVE).matcher(message).find()) {
                return entry.getValue();
            }
        }
        return GREETINGS.get("hi");
    }

    private String handleAnalysisContextQuestion(String question, AnalysisHistoryEntity ctx, String language) {
        // Health score question
        if (question.contains("health score") || question.contains("low score") || question.contains("high score") || (question.contains("why") && question.contains("score"))) {
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
        if (question.contains("claim") || question.contains("verified") || question.contains("questionable")) {
            String claimResults = ctx.getClaimResults();
            if (claimResults != null && !claimResults.equals("[]")) {
                return translate("The claim verification system checks each marketing claim against the actual nutrition data. Claims are rated as VERIFIED, SUSPICIOUS, or FALSE. Each verdict includes an explanation of why that conclusion was reached. You can see the detailed results in the analysis.", language);
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
        if ("hi".equals(language) && text.contains("Hello")) {
            return text.replace("Hello", "नमस्ते").replace("I'm the NutriVerify AI Assistant. I can help you understand food labels, analyze nutrition, and make healthier choices. How can I help you today?",
                    "मैं NutriVerify AI सहायक हूँ। मैं खाद्य लेबल समझने, पोषण विश्लेषण करने, और स्वस्थ विकल्प बनाने में मदद कर सकता हूँ।");
        }
        if ("ta".equals(language) && text.contains("Hello")) {
            return text.replace("Hello", "வணக்கம்").replace("I'm the NutriVerify AI Assistant. I can help you understand food labels, analyze nutrition, and make healthier choices. How can I help you today?",
                    "நான் NutriVerify AI உதவியாளர். உணவு லேபிள்களைப் புரிந்துகொள்ளவும், ஊட்டச்சத்தை பகுப்பாய்வு செய்யவும், ஆரோக்கியமான தேர்வுகளை செய்யவும் நான் உங்களுக்கு உதவ முடியும்.");
        }
        return text;
    }
}
