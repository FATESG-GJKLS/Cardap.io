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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.caradap.api.dto.ApiDtos.ProductRequest;
import io.caradap.api.dto.ApiDtos.ProductView;
import io.caradap.api.entity.Product;
import io.caradap.api.repo.CategoryRepository;
import io.caradap.api.repo.OrderItemRepository;
import io.caradap.api.repo.ProductRepository;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;

    public ProductController(
        ProductRepository productRepository,
        CategoryRepository categoryRepository,
        OrderItemRepository orderItemRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @GetMapping
    public List<ProductView> findAll(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(name = "q", required = false) String query
    ) {
        String normalizedQuery = query == null
            ? ""
            : query.toLowerCase(Locale.ROOT).trim();

        return productRepository.findAllByOrderByIdAsc()
            .stream()
            .filter(product -> categoryId == null
                || product.category.id.equals(categoryId))
            .filter(product -> matchesQuery(product, normalizedQuery))
            .map(ProductController::toView)
            .toList();
    }

    @GetMapping("/{id}")
    public ProductView findById(@PathVariable Long id) {
        return toView(findProduct(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductView create(@Valid @RequestBody ProductRequest request) {
        Product product = applyRequest(new Product(), request);
        return toView(productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ProductView update(
        @PathVariable Long id,
        @Valid @RequestBody ProductRequest request
    ) {
        Product product = applyRequest(findProduct(id), request);
        return toView(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Product product = findProduct(id);
        if (orderItemRepository.existsByProductId(id)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Este produto pertence a pedidos existentes. Marque-o como indisponível."
            );
        }
        productRepository.delete(product);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Produto não encontrado"
            ));
    }

    private Product applyRequest(Product product, ProductRequest request) {
        product.name = request.name().trim();
        product.description = request.description().trim();
        product.price = request.price();
        product.category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Categoria não encontrada"
            ));
        product.imageUrl = request.imageUrl() == null ? "" : request.imageUrl();
        product.emoji = request.emoji() == null || request.emoji().isBlank()
            ? "🍽️"
            : request.emoji();
        product.exotic = Boolean.TRUE.equals(request.exotic());
        product.featured = Boolean.TRUE.equals(request.featured());
        product.available = request.available() == null || request.available();
        product.prepMinutes = request.prepMinutes() == null
            ? 25
            : request.prepMinutes();
        return product;
    }

    private static boolean matchesQuery(Product product, String query) {
        return query.isBlank()
            || product.name.toLowerCase(Locale.ROOT).contains(query)
            || product.description.toLowerCase(Locale.ROOT).contains(query);
    }

    public static ProductView toView(Product product) {
        return new ProductView(
            product.id,
            product.name,
            product.description,
            product.price,
            product.category.id,
            product.category.name,
            product.imageUrl,
            product.emoji,
            product.exotic,
            product.featured,
            product.available,
            product.prepMinutes
        );
    }
}
