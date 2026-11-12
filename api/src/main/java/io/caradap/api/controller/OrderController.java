package io.caradap.api.controller;

import io.caradap.api.dto.ApiDtos.*;
import io.caradap.api.entity.*;
import io.caradap.api.repo.OrderRepository;
import io.caradap.api.repo.ProductRepository;
import io.caradap.api.service.OrderPricingService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@RestController @RequestMapping("/api/orders")
public class OrderController {
  private final OrderRepository orders;private final ProductRepository products;private final OrderPricingService pricing;
  private static final Set<String> STATUSES=Set.of("RECEIVED","PREPARING","ON_THE_WAY","DELIVERED","CANCELLED");
  public OrderController(OrderRepository orders,ProductRepository products,OrderPricingService pricing){this.orders=orders;this.products=products;this.pricing=pricing;}
  private static OrderView view(CustomerOrder o){return new OrderView(o.id,o.customer.id,o.customer.name,o.deliveryAddress,o.paymentMethod,
    o.notes,o.status,o.subtotal,o.deliveryFee,o.total,o.createdAt,o.items.stream()
      .map(i->new OrderLineView(i.product.id,i.productName,i.quantity,i.unitPrice)).toList());}
  @GetMapping public List<OrderView> all(){return orders.findAllByOrderByCreatedAtDesc().stream().map(OrderController::view).toList();}
  @GetMapping("/mine") public List<OrderView> mine(@AuthenticationPrincipal AppUser user){return orders.findByCustomerIdOrderByCreatedAtDesc(user.id).stream().map(OrderController::view).toList();}
  @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional
  public OrderView place(@AuthenticationPrincipal AppUser user,@Valid @RequestBody OrderRequest body){
    if(body.items().size()>40) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Muitos itens no pedido");
    CustomerOrder o=new CustomerOrder();o.customer=user;o.deliveryAddress=body.deliveryAddress().trim();o.paymentMethod=body.paymentMethod().trim();
    o.notes=body.notes()==null?"":body.notes();BigDecimal subtotal=new BigDecimal("0.00");
    for(OrderLineRequest line:body.items()){
      Product product=products.findById(line.productId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Produto não encontrado"));
      if(!product.available) throw new ResponseStatusException(HttpStatus.CONFLICT,"Produto indisponível: "+product.name);
      OrderItem item=new OrderItem();item.order=o;item.product=product;item.productName=product.name;
      item.quantity=line.quantity();item.unitPrice=product.price;o.items.add(item);
      subtotal=subtotal.add(pricing.lineTotal(product.price,line.quantity()));
    }
    o.subtotal=subtotal;o.deliveryFee=pricing.deliveryFee(subtotal);o.total=pricing.total(subtotal);
    return view(orders.save(o));
  }
  @PatchMapping("/{id}/status")
  public OrderView status(@PathVariable Long id,@Valid @RequestBody StatusRequest body){
    if(!STATUSES.contains(body.status()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Status desconhecido");
    CustomerOrder o=orders.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Pedido não encontrado"));
    o.status=body.status();return view(orders.save(o));
  }
}
