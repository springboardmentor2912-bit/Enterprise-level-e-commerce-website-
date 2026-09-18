package com.shopstack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String description;

    private String icon;

    public Category() {}

    public Category(Long id, String name, String slug, String description, String icon) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.icon = icon;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public static CategoryBuilder builder() {
        return new CategoryBuilder();
    }

    public static class CategoryBuilder {
        private Long id;
        private String name;
        private String slug;
        private String description;
        private String icon;

        public CategoryBuilder id(Long id) { this.id = id; return this; }
        public CategoryBuilder name(String name) { this.name = name; return this; }
        public CategoryBuilder slug(String slug) { this.slug = slug; return this; }
        public CategoryBuilder description(String description) { this.description = description; return this; }
        public CategoryBuilder icon(String icon) { this.icon = icon; return this; }

        public Category build() {
            return new Category(id, name, slug, description, icon);
        }
    }
}
