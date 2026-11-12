package io.caradap.api.repo;
import io.caradap.api.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
  List<CustomerOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
  List<CustomerOrder> findAllByOrderByCreatedAtDesc();
  boolean existsByCustomerId(Long customerId);
}
