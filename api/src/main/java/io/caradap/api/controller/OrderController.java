package io.caradap.api.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.caradap.api.dto.ApiDtos.OrderLineRequest;
import io.caradap.api.dto.ApiDtos.OrderLineView;
import io.caradap.api.dto.ApiDtos.OrderRequest;
import io.caradap.api.dto.ApiDtos.OrderView;
import io.caradap.api.dto.ApiDtos.StatusRequest;
import io.caradap.api.entity.AppUser;
import io.caradap.api.entity.CustomerOrder;
import io.caradap.api.entity.OrderItem;
import io.caradap.api.entity.Product;
import io.caradap.api.repo.OrderRepository;
import io.caradap.api.repo.ProductRepository;
import io.caradap.api.service.OrderPricingService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Set<String> STATUSES = Set.of(
        "RECEIVED",
        "PREPARING",
        "ON_THE_WAY",
        "DELIVERED",
        "CANCELLED"
    );

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderPricingService orderPricingService;

    public OrderController(
        OrderRepository orderRepository,
        ProductRepository productRepository,
        OrderPricingService orderPricingService
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.orderPricingService = orderPricingService;
    }

    @GetMapping
    public List<OrderView> findAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(OrderController::toView)
            .toList();
    }

    @GetMapping("/mine")
    public List<OrderView> findMine(@AuthenticationPrincipal AppUser user) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(user.id)
            .stream()
            .map(OrderController::toView)
            .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public OrderView create(
        @AuthenticationPrincipal AppUser user,
        @Valid @RequestBody OrderRequest request
    ) {
        validateItemCount(request);

        CustomerOrder order = new CustomerOrder();
        order.customer = user;
        order.deliveryAddress = request.deliveryAddress().trim();
        order.paymentMethod = request.paymentMethod().trim();
        order.notes = request.notes() == null ? "" : request.notes();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderLineRequest lineRequest : request.items()) {
            Product product = findProduct(lineRequest.productId());
            validateProductAvailability(product);

            OrderItem item = createOrderItem(order, product, lineRequest);
            order.items.add(item);
            subtotal = subtotal.add(
                orderPricingService.lineTotal(product.price, lineRequest.quantity())
            );
        }

        order.subtotal = subtotal;
        order.deliveryFee = orderPricingService.deliveryFee(subtotal);
        order.total = orderPricingService.total(subtotal);

        return toView(orderRepository.save(order));
    }

    @PatchMapping("/{id}/status")
    public OrderView updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody StatusRequest request
    ) {
        if (!STATUSES.contains(request.status())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Status desconhecido"
            );
        }

        CustomerOrder order = orderRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Pedido não encontrado"
            ));

        order.status = request.status();
        return toView(orderRepository.save(order));
    }

    private void validateItemCount(OrderRequest request) {
        if (request.items().size() > 40) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Muitos itens no pedido"
            );
        }
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Produto não encontrado"
            ));
    }

    private void validateProductAvailability(Product product) {
        if (!product.available) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Produto indisponível: " + product.name
            );
        }
    }

    private OrderItem createOrderItem(
        CustomerOrder order,
        Product product,
        OrderLineRequest lineRequest
    ) {
        OrderItem item = new OrderItem();
        item.order = order;
        item.product = product;
        item.productName = product.name;
        item.quantity = lineRequest.quantity();
        item.unitPrice = product.price;
        return item;
    }

    private static OrderView toView(CustomerOrder order) {
        List<OrderLineView> items = order.items.stream()
            .map(item -> new OrderLineView(
                item.product.id,
                item.productName,
                item.quantity,
                item.unitPrice
            ))
            .toList();

        return new OrderView(
            order.id,
            order.customer.id,
            order.customer.name,
            order.deliveryAddress,
            order.paymentMethod,
            order.notes,
            order.status,
            order.subtotal,
            order.deliveryFee,
            order.total,
            order.createdAt,
            items
        );
    }
}
