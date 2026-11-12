package io.caradap.api.controller;

import io.caradap.api.dto.ApiDtos.*;
import io.caradap.api.entity.Product;
import io.caradap.api.repo.CategoryRepository;
import io.caradap.api.repo.ProductRepository;
import io.caradap.api.repo.OrderItemRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;

@RestController @RequestMapping("/api/products")
public class ProductController {
  private final ProductRepository products;private final CategoryRepository categories;private final OrderItemRepository orderItems;
  public ProductController(ProductRepository products,CategoryRepository categories,OrderItemRepository orderItems){this.products=products;this.categories=categories;this.orderItems=orderItems;}
  public static ProductView view(Product p){return new ProductView(p.id,p.name,p.description,p.price,p.category.id,p.category.name,p.imageUrl,p.emoji,p.exotic,p.featured,p.available,p.prepMinutes);}
  @GetMapping public List<ProductView> all(@RequestParam(required=false) Long categoryId,@RequestParam(required=false) String q){
    String search=q==null?"":q.toLowerCase(Locale.ROOT).trim();
    return products.findAllByOrderByIdAsc().stream()
      .filter(p->categoryId==null||p.category.id.equals(categoryId))
      .filter(p->search.isBlank()||p.name.toLowerCase(Locale.ROOT).contains(search)||p.description.toLowerCase(Locale.ROOT).contains(search))
      .map(ProductController::view).toList();
  }
  @GetMapping("/{id}") public ProductView get(@PathVariable Long id){return view(find(id));}
  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public ProductView create(@Valid @RequestBody ProductRequest body){return view(products.save(apply(new Product(),body)));}
  @PutMapping("/{id}") public ProductView update(@PathVariable Long id,@Valid @RequestBody ProductRequest body){return view(products.save(apply(find(id),body)));}
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id){
    Product p=find(id);
    if(orderItems.existsByProductId(id)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Este produto pertence a pedidos existentes. Marque-o como indisponível.");
    products.delete(p);
  }
  private Product find(Long id){return products.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Produto não encontrado"));}
  private Product apply(Product p,ProductRequest b){
    p.name=b.name().trim();p.description=b.description().trim();p.price=b.price();
    p.category=categories.findById(b.categoryId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Categoria não encontrada"));
    p.imageUrl=b.imageUrl()==null?"":b.imageUrl();p.emoji=b.emoji()==null||b.emoji().isBlank()?"🍽️":b.emoji();
    p.exotic=Boolean.TRUE.equals(b.exotic());p.featured=Boolean.TRUE.equals(b.featured());p.available=b.available()==null||b.available();
    p.prepMinutes=b.prepMinutes()==null?25:b.prepMinutes();return p;
  }
}
