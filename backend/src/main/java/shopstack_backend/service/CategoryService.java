package shopstack_backend.service;

import org.springframework.stereotype.Service;
import shopstack_backend.entity.Category;
import shopstack_backend.repository.CategoryRepository;

import java.util.List;

@Service
public class CategoryService {


    private final CategoryRepository categoryRepository;


    public CategoryService(CategoryRepository categoryRepository){
        this.categoryRepository=categoryRepository;
    }


    public Category create(Category category){

        return categoryRepository.save(category);
    }


    public List<Category> getAll(){

        return categoryRepository.findAll();
    }


    public Category getById(Long id){

        return categoryRepository.findById(id)
                .orElseThrow();
    }


    public Category update(Long id, Category updated){

        Category category=getById(id);

        category.setName(updated.getName());
        category.setDescription(updated.getDescription());

        return categoryRepository.save(category);
    }


    public void delete(Long id){

        categoryRepository.deleteById(id);
    }
}