import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  request,
  post,
  put,
  patch,
  remove,
  formatMoney,
  priceCalc,
  shipping,
} from "./src/api";
import { sampleCategories, sampleProducts } from "./src/demo";
import type {
  AdminSection,
  Auth,
  CartEntry,
  Category,
  Customer,
  Order,
  Product,
} from "./src/types";
import { Button, Field, Photo, TitleRow } from "./src/components/Ui";
import {
  AuthView,
  CartView,
  CheckoutView,
  DetailView,
  ProfileView,
  SuccessView,
} from "./src/screens/ModalViews";
import {
  initialWindowMetrics,
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets
} from 'react-native-safe-area-context';


const C = {
  ink: "#221C18",
  muted: "#746E69",
  cream: "#FFF9F2",
  paper: "#FFFFFF",
  orange: "#FF6835",
  red: "#DF452C",
  peach: "#FFE6D1",
  orangeLight: "#FFF0E5",
  yellow: "#FFE989",
  border: "#EDE7DF",
  green: "#21845B",
  sage: "#E8F6EB",
  light: "#F8F0E7",
  dark: "#1D1715",
};
type Screen =
  | "none"
  | "cart"
  | "auth"
  | "profile"
  | "checkout"
  | "detail"
  | "admin"
  | "success";
type EntityName = "products" | "categories" | "users";
type Draft = Record<string, string | boolean | number>;

const emptyDrafts: Record<EntityName, Draft> = {
  products: {
    name: "",
    description: "",
    price: "",
    categoryId: "1",
    emoji: "🍽️",
    imageUrl: "",
    exotic: false,
    featured: false,
    available: true,
    prepMinutes: "25",
  },
  categories: {
    name: "",
    slug: "",
    description: "",
    emoji: "🍽️",
    sortOrder: "9",
    active: true,
  },
  users: { name: "", email: "", password: "", role: "CUSTOMER" },
};

function showError(message: string, title = "Erro") {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert(title, message);
  }
}

function MainApp() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const compact = width < 590;
  const gutter = compact ? 17 : 28;
  const contentWidth = Math.min(width - gutter * 2, 1180);
  const cardWidth = compact
    ? Math.max(145, (contentWidth - 12) / 2)
    : desktop
      ? (contentWidth - 48) / 4
      : (contentWidth - 28) / 3;
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [offline, setOffline] = useState(false);
  const [categoryId, setCategoryId] = useState(0);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [session, setSession] = useState<Auth | null>(null);
  const [screen, setScreen] = useState<Screen>("none");
  const [selected, setSelected] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authFromCheckout, setAuthFromCheckout] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("PIX");
  const [orders, setOrders] = useState<Order[]>([]);
  const [finishedOrder, setFinishedOrder] = useState<Order | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [adminSection, setAdminSection] = useState<AdminSection>("products");
  const [adminUsers, setAdminUsers] = useState<Customer[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminError, setAdminError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>({ ...emptyDrafts.products });

  const refreshCatalog = useCallback(async () => {
    try {
      const [cs, ps] = await Promise.all([
        request<Category[]>("/categories"),
        request<Product[]>("/products"),
      ]);
      setCategories(cs);
      setProducts(ps);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);
  useEffect(() => {
    refreshCatalog();
    AsyncStorage.getItem("caradap-session").then((value) => {
      if (value) {
        try {
          setSession(JSON.parse(value) as Auth);
        } catch {
          /* ignored */
        }
      }
    });
    AsyncStorage.getItem("caradap-address").then((value) => {
      if (value) setAddress(value);
    });
  }, [refreshCatalog]);
  useEffect(() => {
    if (session) {
      setProfileName(session.user.name);
      setProfileEmail(session.user.email);
    }
  }, [session]);
  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3500);
  };
  const subtotal = priceCalc(cart);
  const fee = shipping(subtotal);
  const cartCount = cart.reduce((sum, p) => sum + p.quantity, 0);
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (categoryId === 0 || p.categoryId === categoryId) &&
          (!search.trim() ||
            (p.name + " " + p.description + " " + p.categoryName)
              .toLocaleLowerCase("pt-BR")
              .includes(search.trim().toLocaleLowerCase("pt-BR"))),
      ),
    [products, categoryId, search],
  );
  const featured = filtered.filter((p) => p.featured && p.available);
  const exotic = filtered.filter((p) => p.exotic && p.available);
  const displayProducts =
    categoryId || search.trim()
      ? filtered
      : products.filter((p) => p.available).slice(0, 12);

  const addProduct = (product: Product, quantity = 1) => {
    if (!product.available) return;
    setCart((old) => {
      const found = old.find((p) => p.product.id === product.id);
      return found
        ? old.map((p) =>
            p.product.id === product.id
              ? { ...p, quantity: p.quantity + quantity }
              : p,
          )
        : [...old, { product, quantity }];
    });
    notify(`${product.name} adicionado ao carrinho!`);
  };
  const changeQuantity = (id: number, difference: number) =>
    setCart((old) =>
      old
        .map((entry) =>
          entry.product.id === id
            ? { ...entry, quantity: entry.quantity + difference }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  const showProduct = (p: Product) => {
    setSelected(p);
    setDetailQuantity(1);
    setScreen("detail");
  };
  const openAuth = (checkout = false) => {
    setAuthFromCheckout(checkout);
    setAuthMode("login");
    setAuthPassword("");
    setScreen("auth");
  };
  const openAccount = async () => {
    if (!session) {
      openAuth();
      return;
    }
    setScreen("profile");
    try {
      setOrders(await request<Order[]>("/orders/mine", {}, session.token));
    } catch {
      /* session may have expired */
    }
  };
  const authenticate = async () => {
    if (
      !authEmail.trim() ||
      !authPassword.trim() ||
      (authMode === "register" && !authName.trim())
    ) {
      showError("Preencha os campos para continuar.", "Dados incompletos");
      return;
    }
    setBusy(true);
    try {
      const data =
        authMode === "register"
          ? await post<Auth>("/auth/register", {
              name: authName.trim(),
              email: authEmail.trim(),
              password: authPassword,
            })
          : await post<Auth>("/auth/login", {
              email: authEmail.trim(),
              password: authPassword,
            });
      setSession(data);
      await AsyncStorage.setItem("caradap-session", JSON.stringify(data));
      setAuthPassword("");
      setScreen(authFromCheckout ? "checkout" : "profile");
      setAuthFromCheckout(false);
      setOrders(
        await request<Order[]>("/orders/mine", {}, data.token).catch(() => []),
      );
      notify(`Que bom te ver, ${data.user.name.split(" ")[0]}!`);
    } catch (err) {
      showError((err as Error).message, "Não foi possível entrar");
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    setSession(null);
    setOrders([]);
    setScreen("none");
    await AsyncStorage.removeItem("caradap-session");
    notify("Você saiu da sua conta.");
  };
  const saveProfile = async () => {
    if (!session) return;
    setBusy(true);
    try {
      const updated = await put<Customer>(
        "/users/me",
        { name: profileName, email: profileEmail, password: "" },
        session.token,
      );
      // Updating e-mail changes the JWT subject; force a new login rather than keeping an invalid session.
      if (updated.email !== session.user.email) {
        await logout();
        notify("E-mail alterado. Entre novamente com o novo endereço.");
      } else {
        const next = { ...session, user: updated };
        setSession(next);
        await AsyncStorage.setItem("caradap-session", JSON.stringify(next));
        notify("Perfil atualizado!");
      }
    } catch (err) {
      notify((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const checkout = () => {
    if (!cart.length) return;
    session ? setScreen("checkout") : openAuth(true);
  };
  const placeOrder = async () => {
    if (!session) {
      openAuth(true);
      return;
    }
    if (address.trim().length < 8) {
      notify("Informe um endereço de entrega válido.");
      return;
    }
    setBusy(true);
    try {
      const placed = await post<Order>(
        "/orders",
        {
          items: cart.map((e) => ({
            productId: e.product.id,
            quantity: e.quantity,
          })),
          deliveryAddress: address.trim(),
          paymentMethod: payment,
          notes,
        },
        session.token,
      );
      setFinishedOrder(placed);
      setCart([]);
      setScreen("success");
      setNotes("");
      await AsyncStorage.setItem("caradap-address", address);
      setOrders((old) => [placed, ...old]);
    } catch (err) {
      notify((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const loadAdmin = async () => {
    if (!session || session.user.role !== "ADMIN") return;
    setEditingId(null);
    setDraft({ ...emptyDrafts.products });
    setAdminSection("products");
    setAdminError("");
    setScreen("admin");
    try {
      const [us, os] = await Promise.all([
        request<Customer[]>("/users", {}, session.token),
        request<Order[]>("/orders", {}, session.token),
      ]);
      setAdminUsers(us);
      setAdminOrders(os);
    } catch (err) {
      const message = (err as Error).message;
      setAdminError(message);
      showError(message);
      notify(message);
    }
  };
  const setSection = (section: AdminSection) => {
    setAdminSection(section);
    setAdminError("");
    setEditingId(null);
    setDraft({ ...emptyDrafts[section === "orders" ? "products" : section] });
  };
  const editEntity = (
    entity: Product | Category | Customer,
    kind: EntityName,
  ) => {
    setEditingId(entity.id);
    if (kind === "products") {
      const p = entity as Product;
      setDraft({
        name: p.name,
        description: p.description,
        price: String(p.price),
        categoryId: String(p.categoryId),
        emoji: p.emoji,
        imageUrl: p.imageUrl,
        exotic: p.exotic,
        featured: p.featured,
        available: p.available,
        prepMinutes: String(p.prepMinutes),
      });
    } else if (kind === "categories") {
      const c = entity as Category;
      setDraft({
        name: c.name,
        slug: c.slug,
        description: c.description,
        emoji: c.emoji,
        sortOrder: String(c.sortOrder),
        active: c.active,
      });
    } else {
      const u = entity as Customer;
      setDraft({ name: u.name, email: u.email, password: "", role: u.role });
    }
  };
  const saveEntity = async () => {
    if (!session || adminSection === "orders") return;
    const section: EntityName = adminSection;
    let body: any = { ...draft };
    if (section === "products")
      body = {
        ...body,
        price: Number(body.price),
        categoryId: Number(body.categoryId),
        prepMinutes: Number(body.prepMinutes),
      };
    if (section === "categories")
      body = { ...body, sortOrder: Number(body.sortOrder) };
    if (!String(body.name || "").trim()) {
      showError("Informe um nome.", "Dados incompletos");
      return;
    }
    setBusy(true);
    try {
      if (editingId) await put(`/${section}/${editingId}`, body, session.token);
      else await post(`/${section}`, body, session.token);
      if (section === "users")
        setAdminUsers(await request("/users", {}, session.token));
      else await refreshCatalog();
      setEditingId(null);
      setDraft({ ...emptyDrafts[section] });
      notify("Salvo com sucesso!");
    } catch (err) {
      const message = (err as Error).message;
      setAdminError(message);
      showError(message);
      notify(message);
    } finally {
      setBusy(false);
    }
  };
  const deleteEntity = async (kind: EntityName, id: number) => {
    if (!session) return;
    setBusy(true);
    try {
      await remove(`/${kind}/${id}`, session.token);
      if (kind === "users")
        setAdminUsers(await request<Customer[]>("/users", {}, session.token));
      else await refreshCatalog();
      setEditingId(null);
      notify("Registro excluído.");
    } catch (err) {
      const message = (err as Error).message;
      setAdminError(message);
      if (kind === "categories")
        showError(message, "Não foi possível excluir a categoria");
      else showError(message);
      notify(message);
    } finally {
      setBusy(false);
    }
  };
  const updateOrderStatus = async (id: number, status: string) => {
    if (!session) return;
    try {
      await patch(`/orders/${id}/status`, { status }, session.token);
      setAdminOrders(await request<Order[]>("/orders", {}, session.token));
      notify("Status atualizado.");
    } catch (err) {
      const message = (err as Error).message;
      setAdminError(message);
      showError(message);
      notify(message);
    }
  };
  const updateDraft = (key: string, value: string | boolean) =>
    setDraft((old) => ({ ...old, [key]: value }));
  const draftField = (
    key: string,
    label: string,
    hint = "",
    input?: "numeric" | "email-address",
  ) => (
    <Field
      label={label}
      value={String(draft[key] ?? "")}
      onChange={(v) => updateDraft(key, v)}
      placeholder={hint}
      keyboardType={input || "default"}
    />
  );
  const flag = (key: string, label: string) => (
    <Pressable
      onPress={() => updateDraft(key, !draft[key])}
      style={[
        s.flag,
        {
          borderColor: draft[key] ? C.orange : C.border,
          backgroundColor: draft[key] ? C.orangeLight : "#FFF",
        },
      ]}
    >
      <Text style={{ fontSize: 16, color: C.ink }}>
        {draft[key] ? "☑" : "□"} {label}
      </Text>
    </Pressable>
  );
  const tile = (p: Product) => (
    <View key={p.id} style={[s.productCard, { width: cardWidth }]}>
      <Pressable
        onPress={() => showProduct(p)}
        accessibilityRole="button"
        style={{ position: "relative" }}
      >
        <Photo
          url={p.imageUrl}
          emoji={p.emoji}
          style={{
            width: "100%",
            height: compact ? 142 : 172,
            borderTopLeftRadius: 17,
            borderTopRightRadius: 17,
          }}
        />
        {p.exotic ? (
          <View style={s.imageBadge}>
            <Text style={s.imageBadgeText}>🌶️ EXÓTICO</Text>
          </View>
        ) : p.featured ? (
          <View style={[s.imageBadge, { backgroundColor: C.yellow }]}>
            <Text style={[s.imageBadgeText, { color: C.ink }]}>★ FAVORITO</Text>
          </View>
        ) : null}
      </Pressable>
      <View style={s.productInfo}>
        <Text style={s.productCategory}>
          {p.categoryName.toUpperCase()} · {p.prepMinutes} MIN
        </Text>
        <Pressable onPress={() => showProduct(p)}>
          <Text numberOfLines={1} style={s.productName}>
            {p.name}
          </Text>
        </Pressable>
        <Text numberOfLines={compact ? 2 : 2} style={s.productDescription}>
          {p.description}
        </Text>
        <View style={s.productBottom}>
          <Text style={[s.productPrice, compact && { fontSize: 17 }]}>
            {formatMoney(p.price)}
          </Text>
          <Pressable
            testID={`add-product-${p.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Adicionar ${p.name}`}
            onPress={() => addProduct(p)}
            disabled={!p.available}
            style={({ pressed }) => [
              s.plusButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={s.plusText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      <View style={s.topbar}>
        <View
          style={[
            s.topbarContent,
            {
              maxWidth: 1180,
              paddingHorizontal: gutter,
              flexWrap: compact ? "wrap" : "nowrap",
            },
          ]}
        >
          <Pressable
            onPress={() => {
              setScreen("none");
              setCategoryId(0);
              setSearch("");
            }}
            style={s.logoWrap}
          >
            <View style={s.logoMark}>
              <Text style={{ fontSize: 23 }}>🍴</Text>
            </View>
            <Text style={s.logo}>
              cara<Text style={{ color: C.orange }}>dap</Text>
              <Text style={s.logoDot}>.io</Text>
            </Text>
          </Pressable>
          {!compact ? (
            <View style={s.locationPill}>
              <Text style={{ fontSize: 16 }}>📍</Text>
              <View>
                <Text style={s.locKicker}>ENTREGANDO EM</Text>
                <Text style={s.locText}>Goiânia, GO ⌄</Text>
              </View>
            </View>
          ) : null}
          {!compact ? (
            <View style={s.searchBox}>
              <Text style={{ fontSize: 19, color: C.muted }}>⌕</Text>
              <TextInput
                testID="search-input"
                placeholder="O que você tá com vontade de comer?"
                placeholderTextColor="#948A82"
                value={search}
                onChangeText={(v) => {
                  setSearch(v);
                  setCategoryId(0);
                }}
                style={s.searchInput}
              />
              {search ? (
                <Pressable onPress={() => setSearch("")}>
                  <Text style={{ fontSize: 17, color: C.muted }}>×</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          <View style={s.headerActions}>
            <Pressable
              testID="account-button"
              accessibilityRole="button"
              onPress={openAccount}
              style={s.headerAction}
            >
              <Text style={{ fontSize: 20 }}>☺</Text>
              {!compact ? (
                <Text style={s.actionLabel}>
                  {session ? session.user.name.split(" ")[0] : "Entrar"}
                </Text>
              ) : null}
            </Pressable>
            <Pressable
              testID="cart-button"
              accessibilityRole="button"
              onPress={() => setScreen("cart")}
              style={s.cartButton}
            >
              <Text style={{ fontSize: 19, color: "#FFF" }}>🛒</Text>
              {!compact ? <Text style={s.cartLabel}>Carrinho</Text> : null}
              {cartCount ? (
                <View style={s.countBubble}>
                  <Text
                    style={{ fontSize: 11, fontWeight: "900", color: C.ink }}
                  >
                    {cartCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
          {compact ? (
            <View
              style={[
                s.searchBox,
                { width: "100%", marginTop: 12, marginLeft: 0 },
              ]}
            >
              <Text style={{ fontSize: 20, color: C.muted }}>⌕</Text>
              <TextInput
                testID="search-input"
                placeholder="Busca um rango aí..."
                placeholderTextColor="#948A82"
                value={search}
                onChangeText={(v) => {
                  setSearch(v);
                  setCategoryId(0);
                }}
                style={s.searchInput}
              />
              {search ? (
                <Pressable onPress={() => setSearch("")}>
                  <Text style={{ fontSize: 18, color: C.muted }}>×</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: compact ? 110 : 65,
        }}
      >
        <View
          style={{ width: "100%", maxWidth: 1180, paddingHorizontal: gutter }}
        >
          <View style={s.infoStrip}>
            <Text style={s.infoText}>
              🛵 Delivery em Goiânia <Text style={{ color: C.orange }}>•</Text>{" "}
              Feito pra matar qualquer vontade
            </Text>
            {!compact ? (
              <Text style={s.infoText}>🎁 Frete grátis a partir de R$ 80</Text>
            ) : null}
          </View>
          {!search.trim() && categoryId === 0 ? (
            <>
              <LinearGradient
                colors={["#FF7142", "#FF4D2E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[s.hero, { height: compact ? 375 : 356 }]}
              >
                <View
                  style={[
                    s.heroCopy,
                    {
                      width: compact ? "100%" : "58%",
                      padding: compact ? 25 : 42,
                      zIndex: 2,
                    },
                  ]}
                >
                  <Text style={s.heroKicker}>✳ EXPLORE O INESPERADO</Text>
                  <Text
                    style={[
                      s.heroTitle,
                      {
                        fontSize: compact ? 39 : 52,
                        lineHeight: compact ? 43 : 56,
                      },
                    ]}
                  >
                    DO BÁSICO AO
                    <Text style={{ color: C.yellow }}> EXTRAORDINÁRIO.</Text>
                  </Text>
                  <Text
                    style={[
                      s.heroDescription,
                      { maxWidth: compact ? 250 : 425 },
                    ]}
                  >
                    Um cardápio sem limites. Da coxinha de sempre ao sabor que
                    você nunca imaginou provar.
                  </Text>
                  <Pressable onPress={() => setCategoryId(5)} style={s.heroCta}>
                    <Text style={s.heroCtaText}>Conheça o lado exótico ↗</Text>
                  </Pressable>
                </View>
                <View
                  style={[
                    s.heroOrb,
                    {
                      width: compact ? 215 : 340,
                      height: compact ? 215 : 340,
                      right: compact ? -35 : 26,
                      top: compact ? 203 : 12,
                    },
                  ]}
                />
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=950&q=85",
                  }}
                  style={[
                    s.heroPhoto,
                    {
                      width: compact ? 230 : 365,
                      height: compact ? 171 : 296,
                      right: compact ? -18 : 11,
                      top: compact ? 222 : 39,
                    },
                  ]}
                  resizeMode="cover"
                />
                <Text
                  style={[
                    s.heroDecor,
                    {
                      right: compact ? 160 : 350,
                      top: compact ? 205 : 50,
                      fontSize: compact ? 27 : 40,
                    },
                  ]}
                >
                  ✳
                </Text>
                <Text
                  style={[
                    s.heroDecor,
                    {
                      right: compact ? 12 : 60,
                      bottom: compact ? 14 : 24,
                      fontSize: compact ? 25 : 37,
                    },
                  ]}
                >
                  ✦
                </Text>
              </LinearGradient>
              <View style={s.benefits}>
                <View style={s.benefit}>
                  <Text style={{ fontSize: 23 }}>🌎</Text>
                  <View>
                    <Text style={s.benefitTitle}>Um mundo de sabores</Text>
                    <Text style={s.benefitCaption}>O comum e o inesperado</Text>
                  </View>
                </View>
                <View style={s.benefit}>
                  <Text style={{ fontSize: 23 }}>💛</Text>
                  <View>
                    <Text style={s.benefitTitle}>Feito com carinho</Text>
                    <Text style={s.benefitCaption}>Comida de verdade</Text>
                  </View>
                </View>
                {!compact ? (
                  <View style={s.benefit}>
                    <Text style={{ fontSize: 23 }}>⚡</Text>
                    <View>
                      <Text style={s.benefitTitle}>Pediu, chegou!</Text>
                      <Text style={s.benefitCaption}>
                        Seu pedido sem complicação
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </>
          ) : null}

          <View style={{ marginTop: compact ? 24 : 34 }}>
            <TitleRow
              kicker="ESCOLHA SUA VIBE"
              title="Qual é a fome de hoje?"
              subtitle="Tem de tudo. Sem exagero (ou com)."
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 10,
                paddingVertical: 8,
                paddingRight: 20,
              }}
            >
              <Pressable
                onPress={() => {
                  setCategoryId(0);
                  setSearch("");
                }}
                style={[s.categoryChip, categoryId === 0 && s.chipActive]}
              >
                <Text style={{ fontSize: 21 }}>✨</Text>
                <Text
                  style={[s.chipLabel, categoryId === 0 && s.chipLabelActive]}
                >
                  Tudo
                </Text>
              </Pressable>
              {categories
                .filter((c) => c.active)
                .map((cat) => (
                  <Pressable
                    key={cat.id}
                    testID={`category-${cat.slug}`}
                    onPress={() => {
                      setCategoryId(cat.id);
                      setSearch("");
                    }}
                    style={[
                      s.categoryChip,
                      categoryId === cat.id && s.chipActive,
                    ]}
                  >
                    <Text style={{ fontSize: 21 }}>{cat.emoji}</Text>
                    <Text
                      style={[
                        s.chipLabel,
                        categoryId === cat.id && s.chipLabelActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>
          </View>

          {!categoryId && !search.trim() && featured.length > 0 ? (
            <View style={{ marginTop: 26 }}>
              <TitleRow
                kicker="OS QUERIDINHOS"
                title="Os mais irresistíveis 🔥"
                subtitle="A galera ama e a gente entende o motivo."
                action="Ver tudo"
                onAction={() => setCategoryId(0)}
              />
              <View style={[s.productGrid, { gap: 12 }]}>
                {featured.slice(0, 4).map(tile)}
              </View>
            </View>
          ) : null}

          {!categoryId && !search.trim() ? (
            <View style={[s.adventureBanner, { marginTop: 34 }]}>
              <View style={{ flex: 1, padding: compact ? 21 : 29, zIndex: 2 }}>
                <Text
                  style={{
                    color: C.yellow,
                    fontSize: 11,
                    fontWeight: "900",
                    letterSpacing: 2,
                  }}
                >
                  PASSAPORTE GASTRONÔMICO ✈
                </Text>
                <Text
                  style={[s.adventureTitle, { fontSize: compact ? 27 : 35 }]}
                >
                  Seu paladar pede
                  <Text style={{ color: C.yellow }}> aventura.</Text>
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#E6D8CB",
                    maxWidth: 400,
                    marginTop: 7,
                    lineHeight: 20,
                  }}
                >
                  Jacaré, takoyaki, curry tailandês e outras experiências sem
                  sair de casa.
                </Text>
                <Pressable
                  onPress={() => setCategoryId(5)}
                  style={s.adventureButton}
                >
                  <Text style={{ color: C.ink, fontWeight: "900" }}>
                    Partiu experimentar →
                  </Text>
                </Pressable>
              </View>
              <Text
                style={[
                  s.adventureEmoji,
                  { fontSize: compact ? 87 : 140, right: compact ? -12 : 26 },
                ]}
              >
                🌶️
              </Text>
            </View>
          ) : null}

          <View style={{ marginTop: 32 }}>
            {search.trim() ? (
              <TitleRow
                kicker="RESULTADOS DA BUSCA"
                title={`Procurando por “${search}”`}
                subtitle={`${filtered.length} delícias encontradas`}
              />
            ) : categoryId ? (
              <TitleRow
                kicker="SEU CARDÁPIO"
                title={`${categories.find((c) => c.id === categoryId)?.emoji || "🍽️"} ${categories.find((c) => c.id === categoryId)?.name || "Sabores"}`}
                subtitle={`${filtered.length} opções para se apaixonar`}
              />
            ) : (
              <TitleRow
                kicker="TEM MUITO MAIS"
                title="Explore todo o cardápio 🍽️"
                subtitle="Porque repetir o de sempre é opcional."
              />
            )}
            {displayProducts.length ? (
              <View style={[s.productGrid, { gap: 12 }]}>
                {displayProducts.map(tile)}
              </View>
            ) : (
              <View style={s.emptyBlock}>
                <Text style={{ fontSize: 40 }}>🔎</Text>
                <Text style={s.emptyTitle}>Não achamos esse sabor</Text>
                <Text style={s.emptyText}>
                  Tente outra busca ou escolha uma categoria diferente.
                </Text>
                <Button
                  onPress={() => {
                    setSearch("");
                    setCategoryId(0);
                  }}
                  small
                >
                  Ver todo o cardápio
                </Button>
              </View>
            )}
          </View>
          {!categoryId && !search.trim() && exotic.length > 0 ? (
            <View style={{ marginTop: 35 }}>
              <TitleRow
                kicker="SAIA DA ROTINA"
                title="O lado selvagem do cardápio 🌶️"
                subtitle="Ousadia na medida certa."
                action="Explorar exóticos"
                onAction={() => setCategoryId(5)}
              />
              <View style={[s.productGrid, { gap: 12 }]}>
                {exotic.slice(0, 4).map(tile)}
              </View>
            </View>
          ) : null}
          <View style={s.footer}>
            <Text style={[s.logo, { fontSize: 25 }]}>
              cara<Text style={{ color: C.orange }}>dap</Text>
              <Text style={s.logoDot}>.io</Text>
            </Text>
            <Text style={s.footerText}>
              Do arroz com feijão ao improvável. Aqui cabe todo mundo, toda fome
              e todo sabor.
            </Text>
            <Text style={{ color: "#A59A91", fontSize: 11, marginTop: 11 }}>
              Projeto acadêmico demonstrativo · FATESG N2 · 2026
            </Text>
            {offline ? (
              <Pressable onPress={refreshCatalog}>
                <Text style={{ color: C.red, fontSize: 12, marginTop: 10 }}>
                  ⚠ Modo demonstração: API desconectada. Toque para tentar
                  novamente.
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
      {compact ? (
        <View style={[
            s.mobileBottom,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}>
          <Pressable
            onPress={() => {
              setScreen("none");
              setCategoryId(0);
              setSearch("");
            }}
            style={s.bottomTab}
          >
            <Text style={s.bottomIcon}>⌂</Text>
            <Text style={s.bottomCaption}>Início</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setScreen("none");
              setCategoryId(5);
              setSearch("");
            }}
            style={s.bottomTab}
          >
            <Text style={s.bottomIcon}>🌶️</Text>
            <Text style={s.bottomCaption}>Exóticos</Text>
          </Pressable>
          <Pressable onPress={() => setScreen("cart")} style={s.bottomTab}>
            <Text style={s.bottomIcon}>🛒</Text>
            <Text style={s.bottomCaption}>Carrinho ({cartCount})</Text>
          </Pressable>
          <Pressable onPress={openAccount} style={s.bottomTab}>
            <Text style={s.bottomIcon}>☺</Text>
            <Text style={s.bottomCaption}>Conta</Text>
          </Pressable>
        </View>
      ) : null}
      {toast ? (
        <View pointerEvents="none" style={[s.toast, { bottom: (compact ? 75 : 25) + insets.bottom }]}>
          <Text
            style={{ color: "#FFF", fontWeight: "700", textAlign: "center" }}
          >
            {toast}
          </Text>
        </View>
      ) : null}

      <Modal
        visible={screen !== "none"}
        animationType="fade"
        transparent
        onRequestClose={() => setScreen("none")}
      >
        <KeyboardAvoidingView
          style={s.modalScrim}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setScreen("none")}
          />
          <View
            style={[
              s.modalSheet,
              {
                maxWidth:
                  screen === "admin" ? 920 : screen === "detail" ? 640 : 520,
                maxHeight: "92%",
              },
            ]}
          >
            <View style={s.modalTop}>
              <Text style={s.modalBrand}>
                caradap<Text style={{ color: C.orange }}>.io</Text>
              </Text>
              <Pressable
                onPress={() => setScreen("none")}
                accessibilityRole="button"
                style={s.close}
              >
                <Text style={{ fontSize: 23, color: C.ink }}>×</Text>
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: compact ? 19 : 26,
                paddingBottom: 34,
              }}
            >
              {screen === "detail" && selected ? (
                <DetailView
                  styles={s}
                  product={selected}
                  quantity={detailQuantity}
                  setQuantity={setDetailQuantity}
                  addProduct={addProduct}
                  showCart={() => setScreen("cart")}
                  formatMoney={formatMoney}
                />
              ) : null}
              {screen === "cart" ? (
                <CartView
                  styles={s}
                  cart={cart}
                  subtotal={subtotal}
                  fee={fee}
                  cartCount={cartCount}
                  changeQuantity={changeQuantity}
                  checkout={checkout}
                  close={() => setScreen("none")}
                  formatMoney={formatMoney}
                />
              ) : null}
              {screen === "auth" ? (
                <AuthView
                  styles={s}
                  mode={authMode}
                  setMode={setAuthMode}
                  name={authName}
                  setName={setAuthName}
                  email={authEmail}
                  setEmail={setAuthEmail}
                  password={authPassword}
                  setPassword={setAuthPassword}
                  busy={busy}
                  authenticate={authenticate}
                />
              ) : null}
              {screen === "checkout" ? (
                <CheckoutView
                  styles={s}
                  address={address}
                  setAddress={setAddress}
                  notes={notes}
                  setNotes={setNotes}
                  payment={payment}
                  setPayment={setPayment}
                  cartCount={cartCount}
                  subtotal={subtotal}
                  fee={fee}
                  busy={busy}
                  placeOrder={placeOrder}
                  formatMoney={formatMoney}
                />
              ) : null}
              {screen === "success" && finishedOrder ? (
                <SuccessView
                  styles={s}
                  order={finishedOrder}
                  close={() => setScreen("none")}
                  formatMoney={formatMoney}
                />
              ) : null}
              {screen === "profile" && session ? (
                <ProfileView
                  styles={s}
                  session={session}
                  profileName={profileName}
                  setProfileName={setProfileName}
                  profileEmail={profileEmail}
                  setProfileEmail={setProfileEmail}
                  saveProfile={saveProfile}
                  loadAdmin={loadAdmin}
                  logout={logout}
                  busy={busy}
                  orders={orders}
                  formatMoney={formatMoney}
                  statusLabel={statusLabel}
                />
              ) : null}
              {screen === "admin" && session?.user.role === "ADMIN" ? (
                <>
                  <Text style={s.modalKicker}>GERENCIAMENTO</Text>
                  <Text style={s.modalTitle}>Painel Caradap ⚙️</Text>
                  <Text style={[s.subTitle, { marginBottom: 16 }]}>
                    Produtos, categorias, usuários e pedidos num só lugar.
                  </Text>
                  {adminError ? (
                    <View accessibilityRole="alert" style={s.adminError}>
                      <Text style={s.adminErrorTitle}>
                        Não foi possível concluir a ação
                      </Text>
                      <Text style={s.adminErrorText}>{adminError}</Text>
                      <Pressable onPress={() => setAdminError("")}>
                        <Text style={s.adminErrorDismiss}>Fechar aviso</Text>
                      </Pressable>
                    </View>
                  ) : null}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, marginBottom: 20 }}
                  >
                    {(
                      [
                        ["products", "🍔 Produtos"],
                        ["categories", "📂 Categorias"],
                        ["users", "👥 Usuários"],
                        ["orders", "📦 Pedidos"],
                      ] as [AdminSection, string][]
                    ).map(([key, label]) => (
                      <Pressable
                        key={key}
                        onPress={() => setSection(key)}
                        style={[
                          s.adminTab,
                          adminSection === key && { backgroundColor: C.ink },
                        ]}
                      >
                        <Text
                          style={{
                            fontWeight: "800",
                            color: adminSection === key ? "#FFF" : C.ink,
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  {adminSection !== "orders" ? (
                    <>
                      <View style={[s.between, { marginBottom: 13 }]}>
                        <Text style={[s.sectionTitle, { fontSize: 21 }]}>
                          {editingId
                            ? `Editando #${editingId}`
                            : "Novo cadastro"}
                        </Text>
                        {editingId ? (
                          <Pressable
                            onPress={() => {
                              setEditingId(null);
                              setDraft({ ...emptyDrafts[adminSection] });
                            }}
                          >
                            <Text style={{ color: C.red, fontWeight: "800" }}>
                              Cancelar
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                      <View style={s.adminForm}>
                        {draftField("name", "Nome")}
                        {adminSection === "products" ? (
                          <>
                            {draftField("description", "Descrição")}
                            <View style={s.formPair}>
                              <View style={{ flex: 1 }}>
                                {draftField(
                                  "price",
                                  "Preço (R$)",
                                  "32.90",
                                  "numeric",
                                )}
                              </View>
                              <View style={{ flex: 1 }}>
                                {draftField(
                                  "prepMinutes",
                                  "Preparo (minutos)",
                                  "25",
                                  "numeric",
                                )}
                              </View>
                            </View>
                            <Text style={s.inputLabel}>Categoria</Text>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={{
                                gap: 7,
                                marginBottom: 13,
                              }}
                            >
                              {categories.map((c) => (
                                <Pressable
                                  key={c.id}
                                  onPress={() =>
                                    updateDraft("categoryId", String(c.id))
                                  }
                                  style={[
                                    s.paymentChip,
                                    {
                                      backgroundColor:
                                        String(draft.categoryId) ===
                                        String(c.id)
                                          ? C.orangeLight
                                          : "#FFF",
                                      borderColor:
                                        String(draft.categoryId) ===
                                        String(c.id)
                                          ? C.orange
                                          : C.border,
                                    },
                                  ]}
                                >
                                  <Text
                                    style={{ fontSize: 12, fontWeight: "700" }}
                                  >
                                    {c.emoji} {c.name}
                                  </Text>
                                </Pressable>
                              ))}
                            </ScrollView>
                            {draftField(
                              "imageUrl",
                              "URL da imagem (opcional)",
                              "https://...",
                            )}
                            {draftField("emoji", "Emoji do prato", "🍔")}
                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                                marginBottom: 15,
                              }}
                            >
                              {flag("featured", "Destaque")}
                              {flag("exotic", "Exótico")}
                              {flag("available", "Disponível")}
                            </View>
                          </>
                        ) : null}
                        {adminSection === "categories" ? (
                          <>
                            {draftField("slug", "Slug", "novos-sabores")}
                            {draftField("description", "Descrição")}
                            <View style={s.formPair}>
                              <View style={{ flex: 1 }}>
                                {draftField("emoji", "Emoji", "🍕")}
                              </View>
                              <View style={{ flex: 1 }}>
                                {draftField(
                                  "sortOrder",
                                  "Ordem",
                                  "1",
                                  "numeric",
                                )}
                              </View>
                            </View>
                            {flag("active", "Categoria ativa")}
                          </>
                        ) : null}
                        {adminSection === "users" ? (
                          <>
                            {draftField(
                              "email",
                              "E-mail",
                              "nome@exemplo.com",
                              "email-address",
                            )}
                            {draftField(
                              "password",
                              editingId
                                ? "Nova senha (deixe em branco para manter)"
                                : "Senha (mínimo 8 caracteres)",
                            )}
                            <View
                              style={{
                                flexDirection: "row",
                                gap: 8,
                                marginBottom: 16,
                              }}
                            >
                              {["CUSTOMER", "ADMIN"].map((role) => (
                                <Pressable
                                  key={role}
                                  onPress={() => updateDraft("role", role)}
                                  style={[
                                    s.paymentChip,
                                    {
                                      borderColor:
                                        draft.role === role
                                          ? C.orange
                                          : C.border,
                                      backgroundColor:
                                        draft.role === role
                                          ? C.orangeLight
                                          : "#FFF",
                                    },
                                  ]}
                                >
                                  <Text style={{ fontWeight: "700" }}>
                                    {role === "ADMIN"
                                      ? "Administrador"
                                      : "Cliente"}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                          </>
                        ) : null}
                        <Button onPress={saveEntity} disabled={busy}>
                          {busy
                            ? "Salvando..."
                            : editingId
                              ? "Salvar alterações"
                              : "Criar registro"}
                        </Button>
                      </View>
                    </>
                  ) : null}
                  <Text
                    style={[
                      s.sectionTitle,
                      { fontSize: 21, marginTop: 26, marginBottom: 14 },
                    ]}
                  >
                    {adminSection === "products"
                      ? "Produtos cadastrados"
                      : adminSection === "categories"
                        ? "Categorias cadastradas"
                        : adminSection === "users"
                          ? "Usuários cadastrados"
                          : "Pedidos recebidos"}
                  </Text>
                  {adminSection === "products"
                    ? products.map((p) => (
                        <View key={p.id} style={s.adminListItem}>
                          <Text style={{ fontSize: 26 }}>{p.emoji}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.adminListTitle}>{p.name}</Text>
                            <Text style={s.adminListDescription}>
                              {formatMoney(p.price)} · {p.categoryName}
                            </Text>
                          </View>
                          <Pressable onPress={() => editEntity(p, "products")}>
                            <Text style={s.editText}>Editar</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => deleteEntity("products", p.id)}
                          >
                            <Text style={s.deleteText}>Excluir</Text>
                          </Pressable>
                        </View>
                      ))
                    : null}
                  {adminSection === "categories"
                    ? categories.map((c) => (
                        <View key={c.id} style={s.adminListItem}>
                          <Text style={{ fontSize: 26 }}>{c.emoji}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.adminListTitle}>{c.name}</Text>
                            <Text style={s.adminListDescription}>
                              {c.slug} · #{c.sortOrder}
                            </Text>
                          </View>
                          <Pressable
                            onPress={() => editEntity(c, "categories")}
                          >
                            <Text style={s.editText}>Editar</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => deleteEntity("categories", c.id)}
                          >
                            <Text style={s.deleteText}>Excluir</Text>
                          </Pressable>
                        </View>
                      ))
                    : null}
                  {adminSection === "users"
                    ? adminUsers.map((u) => (
                        <View key={u.id} style={s.adminListItem}>
                          <Text style={{ fontSize: 24 }}>👤</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.adminListTitle}>{u.name}</Text>
                            <Text style={s.adminListDescription}>
                              {u.email} · {u.role}
                            </Text>
                          </View>
                          <Pressable onPress={() => editEntity(u, "users")}>
                            <Text style={s.editText}>Editar</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => deleteEntity("users", u.id)}
                          >
                            <Text style={s.deleteText}>Excluir</Text>
                          </Pressable>
                        </View>
                      ))
                    : null}
                  {adminSection === "orders"
                    ? adminOrders.map((order) => (
                        <View key={order.id} style={s.orderBox}>
                          <View style={s.between}>
                            <Text style={s.adminListTitle}>
                              Pedido #{order.id} · {order.customerName}
                            </Text>
                            <Text
                              style={{ color: C.orange, fontWeight: "900" }}
                            >
                              {formatMoney(order.total)}
                            </Text>
                          </View>
                          <Text style={s.orderCaption}>
                            {order.items
                              .map((i) => `${i.quantity}× ${i.productName}`)
                              .join(", ")}
                          </Text>
                          <Text style={s.orderCaption}>
                            {order.deliveryAddress}
                          </Text>
                          <Text style={[s.inputLabel, { marginTop: 10 }]}>
                            Status: {statusLabel(order.status)}
                          </Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 7, paddingTop: 8 }}
                          >
                            {[
                              ["RECEIVED", "Recebido"],
                              ["PREPARING", "Preparando"],
                              ["ON_THE_WAY", "A caminho"],
                              ["DELIVERED", "Entregue"],
                              ["CANCELLED", "Cancelado"],
                            ].map(([value, label]) => (
                              <Pressable
                                key={value}
                                onPress={() =>
                                  updateOrderStatus(order.id, value)
                                }
                                style={[
                                  s.paymentChip,
                                  {
                                    borderColor:
                                      order.status === value
                                        ? C.orange
                                        : C.border,
                                    backgroundColor:
                                      order.status === value
                                        ? C.orangeLight
                                        : "#FFF",
                                  },
                                ]}
                              >
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontWeight: "700",
                                    color: C.ink,
                                  }}
                                >
                                  {label}
                                </Text>
                              </Pressable>
                            ))}
                          </ScrollView>
                        </View>
                      ))
                    : null}
                  <Button
                    onPress={() => setScreen("profile")}
                    variant="outline"
                    style={{ marginTop: 26 }}
                  >
                    Voltar ao perfil
                  </Button>
                </>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <MainApp />
    </SafeAreaProvider>
  );
}

function statusLabel(status: string) {
  return (
    (
      {
        RECEIVED: "Recebido",
        PREPARING: "Em preparo",
        ON_THE_WAY: "A caminho",
        DELIVERED: "Entregue",
        CANCELLED: "Cancelado",
      } as Record<string, string>
    )[status] || status
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
  topbar: {
    backgroundColor: C.paper,
    borderBottomWidth: 1,
    borderColor: C.border,
    zIndex: 3,
  },
  topbarContent: {
    width: "100%",
    alignSelf: "center",
    minHeight: 77,
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 11,
    gap: 18,
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.orange,
    borderRadius: 11,
  },
  logo: { fontSize: 27, fontWeight: "900", letterSpacing: -1.7, color: C.ink },
  logoDot: { color: C.orange, fontWeight: "900" },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingLeft: 17,
    borderLeftWidth: 1,
    borderColor: C.border,
  },
  locKicker: {
    fontSize: 9,
    fontWeight: "900",
    color: C.muted,
    letterSpacing: 1.1,
  },
  locText: { fontWeight: "800", fontSize: 13, color: C.ink, marginTop: 2 },
  searchBox: {
    height: 46,
    flex: 1,
    backgroundColor: "#F7F2EB",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: C.ink,
    fontSize: 14,
    paddingVertical: 10,
    outlineStyle: "none",
  } as any,
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginLeft: "auto",
  },
  headerAction: {
    height: 43,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
  },
  actionLabel: { fontSize: 13, color: C.ink, fontWeight: "800" },
  cartButton: {
    backgroundColor: C.ink,
    height: 44,
    borderRadius: 13,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cartLabel: { fontSize: 13, fontWeight: "900", color: "#FFF" },
  countBubble: {
    backgroundColor: C.yellow,
    borderRadius: 20,
    minWidth: 19,
    height: 19,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: -6,
    top: -6,
  },
  infoStrip: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoText: { fontSize: 12, fontWeight: "700", color: C.muted },
  hero: { borderRadius: 22, overflow: "hidden", position: "relative" },
  heroCopy: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  heroKicker: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.9,
    marginBottom: 12,
  },
  heroTitle: { fontWeight: "900", color: "#FFF", letterSpacing: -1.9 },
  heroDescription: {
    color: "#FFF4EA",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 13,
    fontWeight: "600",
  },
  heroCta: {
    backgroundColor: C.ink,
    alignSelf: "flex-start",
    paddingVertical: 13,
    paddingHorizontal: 17,
    borderRadius: 12,
    marginTop: 18,
  },
  heroCtaText: { color: "#FFF", fontSize: 13, fontWeight: "900" },
  heroOrb: {
    position: "absolute",
    borderRadius: 300,
    backgroundColor: "#FFC96C",
    opacity: 0.95,
  },
  heroPhoto: {
    position: "absolute",
    borderRadius: 170,
    borderWidth: 8,
    borderColor: "#FFF6C7",
    transform: [{ rotate: "-11deg" }],
  },
  heroDecor: { position: "absolute", color: C.yellow, fontWeight: "900" },
  benefits: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: C.border,
    flexWrap: "wrap",
    gap: 14,
  },
  benefit: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitTitle: { fontWeight: "900", color: C.ink, fontSize: 12 },
  benefitCaption: { fontSize: 11, color: C.muted, marginTop: 4 },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 15,
    gap: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.6,
    color: C.orange,
    marginBottom: 7,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: C.ink,
  },
  subTitle: { color: C.muted, fontSize: 13, marginTop: 5, lineHeight: 19 },
  sectionAction: {
    fontWeight: "900",
    fontSize: 12,
    color: C.orange,
    marginBottom: 5,
  },
  categoryChip: {
    backgroundColor: C.paper,
    borderRadius: 14,
    paddingHorizontal: 17,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 54,
  },
  chipActive: { backgroundColor: C.ink, borderColor: C.ink },
  chipLabel: { fontSize: 13, fontWeight: "800", color: C.ink },
  chipLabelActive: { color: "#FFF" },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  productCard: {
    borderRadius: 17,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    marginBottom: 4,
  },
  imageFallback: {
    backgroundColor: "#FFF0E4",
    alignItems: "center",
    justifyContent: "center",
  },
  imageBadge: {
    backgroundColor: C.ink,
    position: "absolute",
    top: 11,
    left: 10,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  imageBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.65,
    color: "#FFF",
  },
  productInfo: { padding: 12, flex: 1 },
  productCategory: {
    fontSize: 9,
    color: C.orange,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  productName: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 7,
    letterSpacing: -0.3,
  },
  productDescription: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 17,
    marginTop: 5,
    minHeight: 34,
  },
  productBottom: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productPrice: {
    color: C.ink,
    fontWeight: "900",
    fontSize: 19,
    letterSpacing: -0.5,
  },
  plusButton: {
    backgroundColor: C.orange,
    width: 33,
    height: 33,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: { color: "#FFF", fontSize: 25, fontWeight: "700", lineHeight: 28 },
  adventureBanner: {
    backgroundColor: C.dark,
    borderRadius: 20,
    minHeight: 205,
    overflow: "hidden",
    justifyContent: "center",
  },
  adventureTitle: {
    color: "#FFF",
    fontWeight: "900",
    maxWidth: 560,
    letterSpacing: -0.7,
    marginTop: 10,
  },
  adventureButton: {
    alignSelf: "flex-start",
    backgroundColor: C.yellow,
    borderRadius: 11,
    marginTop: 18,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  adventureEmoji: {
    position: "absolute",
    bottom: -5,
    transform: [{ rotate: "-17deg" }],
  },
  footer: {
    borderTopWidth: 1,
    borderColor: C.border,
    marginTop: 45,
    paddingVertical: 25,
    alignItems: "center",
  },
  footerText: {
    color: C.muted,
    fontSize: 12,
    maxWidth: 450,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 12,
  },
  mobileBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.paper,
    borderTopWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 19 : 10,
    paddingTop: 8,
    zIndex: 4,
  },
  bottomTab: { alignItems: "center", justifyContent: "center", minWidth: 60 },
  bottomIcon: { fontSize: 22, color: C.ink, fontWeight: "900" },
  bottomCaption: {
    fontSize: 10,
    color: C.muted,
    fontWeight: "700",
    marginTop: 2,
  },
  toast: {
    position: "absolute",
    bottom: 85,
    alignSelf: "center",
    maxWidth: "90%",
    backgroundColor: C.dark,
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 13,
    zIndex: 100,
    elevation: 10,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontWeight: "900", letterSpacing: 0.1 },
  modalScrim: {
    flex: 1,
    backgroundColor: "rgba(25,16,10,.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  modalSheet: {
    backgroundColor: C.cream,
    width: "100%",
    borderRadius: 21,
    overflow: "hidden",
    elevation: 12,
  },
  modalTop: {
    height: 60,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  modalBrand: {
    color: C.ink,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -1,
  },
  close: {
    width: 34,
    height: 34,
    backgroundColor: C.light,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalKicker: {
    fontSize: 10,
    fontWeight: "900",
    color: C.orange,
    letterSpacing: 1.7,
    marginBottom: 8,
  },
  modalTitle: {
    color: C.ink,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: C.ink,
    marginBottom: 7,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 45,
    color: C.ink,
    fontSize: 14,
  },
  toggleRow: {
    backgroundColor: C.light,
    borderRadius: 13,
    padding: 5,
    flexDirection: "row",
    marginBottom: 22,
  },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: C.paper },
  toggleText: { fontWeight: "900", color: C.muted },
  toggleTextActive: { color: C.ink },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  qtyControl: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  qtyText: { fontSize: 21, fontWeight: "700", color: C.orange },
  qtyValue: {
    minWidth: 15,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
  smallQty: { color: C.orange, fontSize: 17, fontWeight: "900" },
  detailPrice: { fontSize: 26, fontWeight: "900", color: C.ink },
  cartEntry: {
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  summary: { padding: 17, borderRadius: 15, backgroundColor: C.light, gap: 9 },
  summaryLabel: { color: C.muted, fontSize: 13 },
  summaryValue: { color: C.ink, fontSize: 14, fontWeight: "800" },
  totalLabel: { color: C.ink, fontSize: 17, fontWeight: "900" },
  totalPrice: { color: C.ink, fontWeight: "900", fontSize: 22 },
  emptyBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    gap: 12,
  },
  emptyTitle: { fontWeight: "900", fontSize: 19, color: C.ink },
  emptyText: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  paymentChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
    backgroundColor: "#FFF",
  },
  profileBox: { backgroundColor: C.light, borderRadius: 16, padding: 16 },
  orderBox: {
    backgroundColor: "#FFF",
    padding: 15,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
    marginBottom: 10,
  },
  orderCaption: { color: C.muted, fontSize: 12, marginTop: 7, lineHeight: 18 },
  orderStatus: {
    backgroundColor: C.orangeLight,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  orderItems: {
    marginTop: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.border,
    paddingVertical: 9,
    gap: 7,
  },
  orderItem: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  orderItemName: { color: C.ink, fontSize: 13, fontWeight: "700", flex: 1 },
  orderItemPrice: { color: C.ink, fontSize: 13, fontWeight: "800" },
  orderDetails: { gap: 5, paddingTop: 11 },
  orderDetail: { color: C.muted, fontSize: 12, lineHeight: 17 },
  orderDetailLabel: { color: C.ink, fontWeight: "800" },
  orderTotals: {
    marginTop: 13,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  orderTotalLine: { color: C.muted, fontSize: 12 },
  adminError: {
    backgroundColor: "#FFF0ED",
    borderWidth: 1,
    borderColor: "#F3B1A5",
    borderRadius: 12,
    padding: 13,
    marginBottom: 16,
  },
  adminErrorTitle: { color: C.red, fontWeight: "900", fontSize: 13 },
  adminErrorText: { color: C.ink, fontSize: 13, lineHeight: 19, marginTop: 4 },
  adminErrorDismiss: {
    color: C.red,
    fontWeight: "800",
    fontSize: 12,
    marginTop: 8,
  },
  adminTab: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
  },
  adminForm: { backgroundColor: C.light, padding: 16, borderRadius: 15 },
  formPair: { flexDirection: "row", gap: 12 },
  flag: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  adminListItem: {
    flexDirection: "row",
    gap: 13,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  adminListTitle: { fontWeight: "900", color: C.ink, fontSize: 14 },
  adminListDescription: { color: C.muted, fontSize: 11, marginTop: 4 },
  editText: { color: C.orange, fontWeight: "900", fontSize: 12 },
  deleteText: { color: C.red, fontWeight: "900", fontSize: 12 },
});
