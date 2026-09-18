package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import shopstack_backend.entity.Category;

public interface CategoryRepository 
        extends JpaRepository<Category, Long> {

}