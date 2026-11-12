package io.caradap.api.controller;

import io.caradap.api.dto.ApiDtos.CategoryRequest;
import io.caradap.api.entity.Category;
import io.caradap.api.repo.CategoryRepository;
import io.caradap.api.repo.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;

@RestController @RequestMapping("/api/categories")
public class CategoryController {
  private final CategoryRepository categories; private final ProductRepository products;
  public CategoryController(CategoryRepository categories,ProductRepository products){this.categories=categories;this.products=products;}
  @GetMapping public List<Category> all(){return categories.findAllByOrderBySortOrderAscIdAsc();}
  @GetMapping("/{id}") public Category get(@PathVariable Long id){return find(id);}
  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public Category create(@Valid @RequestBody CategoryRequest body){
    if(categories.existsBySlug(body.slug().trim().toLowerCase(Locale.ROOT))) throw new ResponseStatusException(HttpStatus.CONFLICT,"Slug já utilizado");
    return categories.save(apply(new Category(),body));
  }
  @PutMapping("/{id}") public Category update(@PathVariable Long id,@Valid @RequestBody CategoryRequest body){
    Category c=find(id);return categories.save(apply(c,body));
  }
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id){find(id);if(products.existsByCategoryId(id))throw new ResponseStatusException(HttpStatus.CONFLICT,"Remova ou transfira os produtos desta categoria antes de excluir");categories.deleteById(id);}
  private Category find(Long id){return categories.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Categoria não encontrada"));}
  private Category apply(Category c,CategoryRequest b){
    c.name=b.name().trim();c.slug=b.slug().trim().toLowerCase(Locale.ROOT);c.emoji=b.emoji()==null||b.emoji().isBlank()?"🍽️":b.emoji();
    c.description=b.description()==null?"":b.description();c.sortOrder=b.sortOrder()==null?0:b.sortOrder();c.active=b.active()==null||b.active();return c;
  }
}
