package shopstack_backend.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name="categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable=false, unique=true)
    private String name;


    @Column(length = 500)
    private String description;



@JsonIgnore
@OneToMany(mappedBy = "category")
private List<Product> products;

    public Category(){

    }


    public Long getId(){
        return id;
    }


    public String getName(){
        return name;
    }


    public String getDescription() {
        return description;
    }


    public List<Product> getProducts(){
        return products;
    }


    public void setId(Long id){
        this.id=id;
    }


    public void setName(String name){
        this.name=name;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public void setProducts(List<Product> products){
        this.products=products;
    }
}