package io.caradap.api.repo;
import io.caradap.api.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CategoryRepository extends JpaRepository<Category, Long> {
  List<Category> findAllByOrderBySortOrderAscIdAsc();
  boolean existsBySlug(String slug);
}
