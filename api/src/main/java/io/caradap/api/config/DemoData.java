package io.caradap.api.config;

import io.caradap.api.entity.*;
import io.caradap.api.repo.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DemoData {
  @Bean
  CommandLineRunner populate(UserRepository users, CategoryRepository categories, ProductRepository products,
      PasswordEncoder encoder,
      @Value("${app.admin-email}") String adminEmail, @Value("${app.admin-password}") String adminPassword) {
    return args -> {
      if (!users.existsByEmailIgnoreCase(adminEmail)) {
        AppUser admin = new AppUser();
        admin.name = "Administrador Caradap";
        admin.email = adminEmail;
        admin.passwordHash = encoder.encode(adminPassword);
        admin.role = "ADMIN";
        users.save(admin);
      }
      if (categories.count() != 0)
        return;
      Map<String, Category> cats = new HashMap<>();
      category(categories, cats, "Burgers", "burgers", "🍔", "Do smash ao artesanal", 1);
      category(categories, cats, "Pizzas", "pizzas", "🍕", "Fatia de felicidade", 2);
      category(categories, cats, "Brasileira", "brasileira", "🍛", "Com gostinho de casa", 3);
      category(categories, cats, "Oriental", "oriental", "🍜", "Do Japão ao Vietnã", 4);
      category(categories, cats, "Exóticos", "exoticos", "🌶️", "Sair da rotina é delicioso", 5);
      category(categories, cats, "Veggie", "veggie", "🥗", "Verde e surpreendente", 6);
      category(categories, cats, "Doces", "doces", "🍰", "Aquela sobremesa", 7);
      category(categories, cats, "Bebidas", "bebidas", "🥤", "Pra acompanhar", 8);
      if (products.count() != 0)
        return;
      String burger = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80";
      String pizza = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80";
      String bowl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
      String sushi = "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80";
      String ramen = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80";
      String dessert = "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80";
      String fries = "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80";
      String rice = "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80";
      add(products, cats, "burgers", "Smash da Casa",
          "Dois smash burgers, cheddar cremoso, picles e molho secreto no pão brioche.", "32.90", burger, "🍔", false,
          true, 20);
      add(products, cats, "burgers", "Brasa Monstra",
          "180g de carne na brasa, bacon crocante, cebola caramelizada e queijo prato.", "39.90", burger, "🔥", false,
          true, 25);
      add(products, cats, "burgers", "Batata Explosiva", "Batata crocante com cheddar, farofa de bacon e cebolinha.",
          "19.90", fries, "🍟", false, false, 15);
      add(products, cats, "pizzas", "Pizza Margherita",
          "Molho de tomate da casa, muçarela, tomate e manjericão fresco.", "49.90", pizza, "🍕", false, true, 30);
      add(products, cats, "pizzas", "Pizza Pepperoni", "Massa de longa fermentação, muçarela e bastante pepperoni.",
          "59.90", pizza, "🍕", false, false, 35);
      add(products, cats, "brasileira", "PF de Respeito",
          "Arroz soltinho, feijão caseiro, bife acebolado, batata e salada.", "28.90", rice, "🍛", false, true, 25);
      add(products, cats, "brasileira", "Feijoada da Vó", "Feijoada completa com arroz, couve, farofa e laranja.",
          "42.90", rice, "🥘", false, false, 35);
      add(products, cats, "brasileira", "Coxinhas Crocantes",
          "Seis coxinhas de frango com requeijão, empanadas na hora.", "22.90", fries, "🥟", false, false, 20);
      add(products, cats, "oriental", "Ramen Tonkotsu", "Caldo rico, macarrão artesanal, ovo marinado e barriga suína.",
          "46.90", ramen, "🍜", false, true, 30);
      add(products, cats, "oriental", "Combinado Sushi", "12 peças entre uramaki, nigiri e hossomaki fresquinhos.",
          "54.90", sushi, "🍣", false, false, 30);
      add(products, cats, "oriental", "Poke Tropical", "Arroz japonês, salmão, manga, pepino, edamame e molho cítrico.",
          "44.90", bowl, "🥗", false, false, 20);
      add(products, cats, "exoticos", "Burger de Jacaré",
          "Carne de jacaré temperada, aioli cítrico e rúcula no pão australiano.", "65.90", burger, "🐊", true, true,
          35);
      add(products, cats, "exoticos", "Takoyaki de Osaka",
          "Bolinhos japoneses de polvo com molho especial e flocos de bonito.", "42.90", sushi, "🐙", true, true, 30);
      add(products, cats, "exoticos", "Curry Tailandês Picante",
          "Curry vermelho com leite de coco, especiarias e arroz jasmim.", "48.90", bowl, "🌶️", true, true, 35);
      add(products, cats, "exoticos", "Kimchi Fried Rice", "Arroz coreano salteado com kimchi, gochujang e ovo.",
          "38.90", rice, "🇰🇷", true, false, 25);
      add(products, cats, "veggie", "Bowl do Jardim", "Grão-de-bico crocante, legumes, quinoa e molho tahine.", "35.90",
          bowl, "🥬", false, false, 20);
      add(products, cats, "veggie", "Burger de Grão-de-bico", "Hambúrguer vegetal, alface, tomate e maionese vegana.",
          "34.90", burger, "🌱", false, false, 25);
      add(products, cats, "doces", "Brownie Vulcão", "Brownie quentinho com calda generosa de chocolate e sorvete.",
          "24.90", dessert, "🍫", false, true, 15);
      add(products, cats, "doces", "Cheesecake de Frutas",
          "Cheesecake cremoso com geleia artesanal de frutas vermelhas.", "22.90", dessert, "🍰", false, false, 15);
      add(products, cats, "bebidas", "Limonada da Casa", "Limonada fresca com hortelã e gelo, 500ml.", "11.90",
          "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?w=800&q=80", "🍋", false, false, 5);
      add(products, cats, "bebidas", "Refrigerante Lata", "Refrigerante geladinho 350ml. Escolha seu sabor.", "7.90",
          "https://images.unsplash.com/photo-1532634896-26909d0d4b54?w=800&q=80", "🥤", false, false, 5);
    };
  }

  private void category(CategoryRepository repo, Map<String, Category> map, String name, String slug, String emoji,
      String description, int order) {
    Category c = new Category();
    c.name = name;
    c.slug = slug;
    c.emoji = emoji;
    c.description = description;
    c.sortOrder = order;
    map.put(slug, repo.save(c));
  }

  private void add(ProductRepository repo, Map<String, Category> cats, String slug, String name, String description,
      String price, String photo, String emoji, boolean exotic, boolean featured, int minutes) {
    Product p = new Product();
    p.name = name;
    p.description = description;
    p.price = new BigDecimal(price);
    p.category = cats.get(slug);
    p.imageUrl = photo;
    p.emoji = emoji;
    p.exotic = exotic;
    p.featured = featured;
    p.prepMinutes = minutes;
    repo.save(p);
  }
}
