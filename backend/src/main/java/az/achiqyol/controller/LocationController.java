package az.achiqyol.controller;
import az.achiqyol.service.interfaces.LocationService; import az.achiqyol.dto.request.LocationRequest; import az.achiqyol.dto.response.LocationResponse; import lombok.RequiredArgsConstructor; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import org.springframework.validation.annotation.Validated; import org.springframework.web.bind.annotation.*; import org.springframework.http.ResponseEntity; import java.net.URI; import java.util.List;
@RestController @RequestMapping("/api/locations") @RequiredArgsConstructor @Validated public class LocationController { private final LocationService service;
@GetMapping public List<LocationResponse> list(@RequestParam(defaultValue="0") @Min(0) int page,@RequestParam(defaultValue="50") @Min(1) @Max(100) int size) { return service.list(page,size); }
@GetMapping("/{id}") public LocationResponse get(@PathVariable Long id) { return service.get(id); }
@PostMapping public ResponseEntity<LocationResponse> create(@Valid @RequestBody LocationRequest request) { var r=service.create(request); return ResponseEntity.created(URI.create("/api/locations/"+r.id())).body(r); }
@PutMapping("/{id}") public LocationResponse update(@PathVariable Long id,@Valid @RequestBody LocationRequest request) { return service.update(id,request); }
@DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); } }
