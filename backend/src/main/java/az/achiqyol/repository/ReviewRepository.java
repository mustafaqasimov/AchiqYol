package az.achiqyol.repository;
import az.achiqyol.entity.entities.Review; import org.springframework.data.jpa.repository.*; public interface ReviewRepository extends JpaRepository<Review,Long> { interface Stats { Double getAverage(); long getTotal(); } @Query("select avg(r.rating) as average, count(r) as total from Review r where r.location.id = :id") Stats stats(Long id); }
