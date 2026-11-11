package az.achiqyol.service.impl;
import az.achiqyol.entity.entities.Location;
import az.achiqyol.mapper.LocationMapper;
import az.achiqyol.repository.*;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;
import java.util.Optional;
class LocationAiTest {
 @Test void aiUsedOnlyWithoutCommunityReviews(){
  var locations=mock(LocationRepository.class);var reviews=mock(ReviewRepository.class);
  var service=new LocationServiceImpl(locations,reviews,mock(LocationMapper.class));
  var location=new Location();location.setId(1L);location.setAiColor("YELLOW");location.setAiSummary("Visible step");
  when(locations.findById(1L)).thenReturn(Optional.of(location));
  var stats=mock(ReviewRepository.Stats.class);when(reviews.stats(1L)).thenReturn(stats);when(stats.getAverage()).thenReturn(null);
  assertThat(service.get(1L).color()).isEqualTo("YELLOW");assertThat(service.get(1L).assessmentSource()).isEqualTo("AI");
  when(stats.getAverage()).thenReturn(4.5);when(stats.getTotal()).thenReturn(2L);
  assertThat(service.get(1L).color()).isEqualTo("GREEN");assertThat(service.get(1L).assessmentSource()).isEqualTo("COMMUNITY");
 }
}
