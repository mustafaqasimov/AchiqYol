package az.achiqyol.service.impl;
public final class RatingPolicy { private RatingPolicy() {} public static String color(Double rating) { return rating == null ? "GREY" : rating >= 4 ? "GREEN" : rating >= 2.5 ? "YELLOW" : "RED"; } }
