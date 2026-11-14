package io.caradap.api.controller;

import java.util.List;
import java.util.Locale;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.caradap.api.dto.ApiDtos.CategoryRequest;
import io.caradap.api.entity.Category;
import io.caradap.api.repo.CategoryRepository;
import io.caradap.api.repo.ProductRepository;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryController(
        CategoryRepository categoryRepository,
        ProductRepository productRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Category> findAll() {
        return categoryRepository.findAllByOrderBySortOrderAscIdAsc();
    }

    @GetMapping("/{id}")
    public Category findById(@PathVariable Long id) {
        return findCategory(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@Valid @RequestBody CategoryRequest request) {
        String slug = request.slug().trim().toLowerCase(Locale.ROOT);
        if (categoryRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Slug já utilizado"
            );
        }

        return categoryRepository.save(applyRequest(new Category(), request));
    }

    @PutMapping("/{id}")
    public Category update(
        @PathVariable Long id,
        @Valid @RequestBody CategoryRequest request
    ) {
        Category category = findCategory(id);
        return categoryRepository.save(applyRequest(category, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        findCategory(id);
        if (productRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Remova ou transfira os produtos desta categoria antes de excluir"
            );
        }
        categoryRepository.deleteById(id);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Categoria não encontrada"
            ));
    }

    private Category applyRequest(Category category, CategoryRequest request) {
        category.name = request.name().trim();
        category.slug = request.slug().trim().toLowerCase(Locale.ROOT);
        category.emoji = request.emoji() == null || request.emoji().isBlank()
            ? "🍽️"
            : request.emoji();
        category.description = request.description() == null
            ? ""
            : request.description();
        category.sortOrder = request.sortOrder() == null ? 0 : request.sortOrder();
        category.active = request.active() == null || request.active();
        return category;
    }
}
