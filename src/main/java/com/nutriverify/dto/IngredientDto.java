package com.nutriverify.dto;

public class IngredientDto {
    private String name;
    private String category;
    private String note;

    public IngredientDto() {}

    public IngredientDto(String name, String category, String note) {
        this.name = name;
        this.category = category;
        this.note = note;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
