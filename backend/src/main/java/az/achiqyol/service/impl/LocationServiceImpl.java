package az.achiqyol.service.impl;
import az.achiqyol.service.interfaces.LocationService; import az.achiqyol.repository.*; import az.achiqyol.mapper.LocationMapper; import az.achiqyol.entity.entities.Location; import az.achiqyol.dto.request.LocationRequest; import az.achiqyol.dto.response.LocationResponse; import az.achiqyol.exception.NotFoundException; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import org.springframework.cache.annotation.*; import org.springframework.data.domain.*; import java.util.List;
@Service @RequiredArgsConstructor @Transactional(readOnly=true) public class LocationServiceImpl implements LocationService {
 private final LocationRepository locations; private final ReviewRepository reviews; private final LocationMapper mapper;
 private Location find(Long id) { return locations.findById(id).orElseThrow(()->new NotFoundException("Location not found")); }
 private LocationResponse response(Location l) { var s=reviews.stats(l.getId()); return new LocationResponse(l.getId(),l.getName(),l.getDescription(),l.getLatitude(),l.getLongitude(),s.getAverage(),s.getTotal(),s.getAverage()!=null ? RatingPolicy.color(s.getAverage()) : (l.getAiColor()!=null ? l.getAiColor() : "GREY"), s.getAverage()!=null ? "COMMUNITY" : (l.getAiColor()!=null ? "AI" : "UNRATED"), l.getAiSummary()); }
 @Cacheable(value="locations-v2",key="'page:' + #page + ':' + #size") public List<LocationResponse> list(int page,int size) { return locations.findAll(PageRequest.of(page,size,Sort.by("id"))).map(this::response).getContent(); }
 public LocationResponse get(Long id) { return response(find(id)); }
 @Transactional @CacheEvict(value="locations-v2",allEntries=true) public LocationResponse create(LocationRequest request) { return response(locations.saveAndFlush(mapper.toEntity(request))); }
 @Transactional @CacheEvict(value="locations-v2",allEntries=true) public LocationResponse update(Long id,LocationRequest request) { var l=find(id); mapper.update(request,l); return response(locations.saveAndFlush(l)); }
 @Transactional @CacheEvict(value="locations-v2",allEntries=true) public void delete(Long id) { locations.delete(find(id)); }
}
