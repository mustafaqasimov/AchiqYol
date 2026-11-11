package az.achiqyol.dto.response;
public record LocationResponse(Long id,String name,String description,double latitude,double longitude,Double rating,long reviewCount,String color,String assessmentSource,String aiSummary) implements java.io.Serializable {}
