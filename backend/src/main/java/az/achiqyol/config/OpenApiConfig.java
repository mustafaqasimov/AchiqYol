package az.achiqyol.config;
import org.springframework.context.annotation.*; import io.swagger.v3.oas.models.OpenAPI; import io.swagger.v3.oas.models.info.Info; @Configuration public class OpenApiConfig { @Bean OpenAPI api() { return new OpenAPI().info(new Info().title("AchiqYol API").version("1.0")); } }
