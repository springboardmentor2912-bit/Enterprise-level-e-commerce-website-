package shopstack_backend.controller;


import org.springframework.web.bind.annotation.*;
import shopstack_backend.entity.Category;
import shopstack_backend.service.CategoryService;

import java.util.List;


@RestController
@RequestMapping("/api/categories")
@CrossOrigin
public class CategoryController {


    private final CategoryService service;


    public CategoryController(CategoryService service){
        this.service=service;
    }



    @PostMapping
    public Category create(
            @RequestBody Category category){

        return service.create(category);
    }



    @GetMapping
    public List<Category> getAll(){

        return service.getAll();
    }



    @GetMapping("/{id}")
    public Category getById(
            @PathVariable Long id){

        return service.getById(id);
    }



    @PutMapping("/{id}")
    public Category update(
            @PathVariable Long id,
            @RequestBody Category category){

        return service.update(id,category);
    }



    @DeleteMapping("/{id}")
    public String delete(
            @PathVariable Long id){

        service.delete(id);

        return "Category deleted";
    }
}