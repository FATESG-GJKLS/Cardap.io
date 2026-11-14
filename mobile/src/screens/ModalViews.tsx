import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button, Field, Photo } from '../components/Ui';
import type { Auth, CartEntry, Order, Product } from '../types';

type Styles = Record<string, any>;

type AuthViewProps = {
  styles: Styles;
  mode: 'login' | 'register';
  setMode: (mode: 'login' | 'register') => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  busy: boolean;
  authenticate: () => void;
};

export function AuthView({
  styles,
  mode,
  setMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  busy,
  authenticate,
}: AuthViewProps) {
  return (
    <>
      <Text style={styles.modalKicker}>AQUI TODO MUNDO TEM LUGAR</Text>
      <Text style={styles.modalTitle}>
        {mode === 'login' ? 'Que bom te ver! 👋' : 'Bora fazer parte? ✨'}
      </Text>
      <Text style={[styles.subTitle, { marginBottom: 23 }]}>
        {mode === 'login'
          ? 'Entre na sua conta para pedir e acompanhar seus pedidos.'
          : 'Crie sua conta e aproveite tudo que o Caradap tem.'}
      </Text>
      <View style={styles.toggleRow}>
        <Pressable
          testID="auth-login-toggle"
          onPress={() => setMode('login')}
          style={[styles.toggle, mode === 'login' && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>
            Entrar
          </Text>
        </Pressable>
        <Pressable
          testID="auth-register-toggle"
          onPress={() => setMode('register')}
          style={[styles.toggle, mode === 'register' && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, mode === 'register' && styles.toggleTextActive]}>
            Criar conta
          </Text>
        </Pressable>
      </View>
      {mode === 'register' ? (
        <Field
          testID="auth-name"
          label="Seu nome"
          placeholder="Como podemos te chamar?"
          value={name}
          onChange={setName}
        />
      ) : null}
      <Field
        testID="auth-email"
        label="E-mail"
        placeholder="voce@exemplo.com"
        keyboardType="email-address"
        value={email}
        onChange={setEmail}
      />
      <Field
        testID="auth-password"
        label="Senha"
        placeholder="Mínimo de 8 caracteres"
        secure
        value={password}
        onChange={setPassword}
      />
      <Button testID="auth-submit" onPress={authenticate} disabled={busy}>
        {busy
          ? 'Aguarde...'
          : mode === 'register'
            ? 'Criar minha conta  →'
            : 'Entrar na conta  →'}
      </Button>
      <Text style={{ textAlign: 'center', color: '#746E69', fontSize: 12, marginTop: 19 }}>
        Seus dados são usados somente para cadastro e pedidos.
      </Text>
    </>
  );
}

type DetailViewProps = {
  styles: Styles;
  product: Product;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  addProduct: (product: Product, quantity: number) => void;
  showCart: () => void;
  formatMoney: (value: number) => string;
};

export function DetailView({
  styles,
  product,
  quantity,
  setQuantity,
  addProduct,
  showCart,
  formatMoney,
}: DetailViewProps) {
  return (
    <>
      <Photo
        url={product.imageUrl}
        emoji={product.emoji}
        style={{ width: '100%', height: 240, borderRadius: 17 }}
      />
      <Text style={[styles.eyebrow, { marginTop: 19 }]}>
        {product.exotic ? '🌶️ AVENTURA GASTRONÔMICA' : product.categoryName.toUpperCase()}
      </Text>
      <Text style={styles.modalTitle}>{product.name}</Text>
      <Text style={[styles.subTitle, { marginTop: 6, lineHeight: 22 }]}>
        {product.description}
      </Text>
      <Text style={{ color: '#746E69', marginTop: 12 }}>
        ⏱ Preparo em aproximadamente {product.prepMinutes} minutos
      </Text>
      <View style={[styles.between, { marginTop: 24 }]}>
        <View style={styles.qtyControl}>
          <Pressable onPress={() => setQuantity((value) => Math.max(1, value - 1))}>
            <Text style={styles.qtyText}>−</Text>
          </Pressable>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <Pressable onPress={() => setQuantity((value) => value + 1)}>
            <Text style={styles.qtyText}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.detailPrice}>{formatMoney(product.price * quantity)}</Text>
      </View>
      <Button
        onPress={() => {
          addProduct(product, quantity);
          showCart();
        }}
        style={{ marginTop: 20 }}
      >
        Adicionar ao carrinho  →
      </Button>
    </>
  );
}

type CartViewProps = {
  styles: Styles;
  cart: CartEntry[];
  subtotal: number;
  fee: number;
  cartCount: number;
  changeQuantity: (id: number, difference: number) => void;
  checkout: () => void;
  close: () => void;
  formatMoney: (value: number) => string;
};

export function CartView({
  styles,
  cart,
  subtotal,
  fee,
  cartCount,
  changeQuantity,
  checkout,
  close,
  formatMoney,
}: CartViewProps) {
  return (
    <>
      <Text style={styles.modalKicker}>SEU PEDIDO</Text>
      <Text style={styles.modalTitle}>Meu carrinho 🛒</Text>
      {!cart.length ? (
        <View style={[styles.emptyBlock, { paddingVertical: 45 }]}>
          <Text style={{ fontSize: 53 }}>🛍️</Text>
          <Text style={styles.emptyTitle}>Por enquanto, só a fome!</Text>
          <Text style={styles.emptyText}>Adicione algo gostoso pra começar.</Text>
          <Button onPress={close}>Explorar cardápio</Button>
        </View>
      ) : (
        <>
          <View style={{ marginTop: 20, gap: 15 }}>
            {cart.map((entry) => (
              <View
                key={entry.product.id}
                testID={`cart-item-${entry.product.id}`}
                style={styles.cartEntry}
              >
                <Photo
                  url={entry.product.imageUrl}
                  emoji={entry.product.emoji}
                  style={{ width: 78, height: 78, borderRadius: 13 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: '#221C18', fontSize: 15 }}>
                    {entry.product.name}
                  </Text>
                  <Text style={{ fontWeight: '900', color: '#FF6835', marginTop: 5 }}>
                    {formatMoney(entry.product.price * entry.quantity)}
                  </Text>
                  <View style={[styles.qtyControl, { marginTop: 8, alignSelf: 'flex-start' }]}>
                    <Pressable onPress={() => changeQuantity(entry.product.id, -1)}>
                      <Text style={styles.smallQty}>−</Text>
                    </Pressable>
                    <Text style={{ fontWeight: '800', minWidth: 25, textAlign: 'center' }}>
                      {entry.quantity}
                    </Text>
                    <Pressable onPress={() => changeQuantity(entry.product.id, 1)}>
                      <Text style={styles.smallQty}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <View style={[styles.summary, { marginTop: 25 }]}>
            <View style={styles.between}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatMoney(subtotal)}</Text>
            </View>
            <View style={styles.between}>
              <Text style={styles.summaryLabel}>Entrega</Text>
              <Text style={[styles.summaryValue, { color: fee === 0 ? '#21845B' : '#221C18' }]}>
                {fee === 0 ? 'Grátis' : formatMoney(fee)}
              </Text>
            </View>
            {fee > 0 ? (
              <Text style={{ color: '#21845B', marginTop: 8, fontSize: 12 }}>
                Faltam {formatMoney(80 - subtotal)} para ganhar frete grátis!
              </Text>
            ) : null}
            <View style={[styles.between, { borderTopWidth: 1, borderColor: '#EDE7DF', paddingTop: 15, marginTop: 13 }]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>{formatMoney(subtotal + fee)}</Text>
            </View>
          </View>
          <Button testID="checkout-button" onPress={checkout} style={{ marginTop: 19 }}>
            Continuar para entrega  →
          </Button>
        </>
      )}
    </>
  );
}

export function SuccessView({
  styles,
  order,
  close,
  formatMoney,
}: {
  styles: Styles;
  order: Order;
  close: () => void;
  formatMoney: (value: number) => string;
}) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
      <Text style={{ fontSize: 74 }}>🎉</Text>
      <Text style={[styles.modalTitle, { textAlign: 'center', marginTop: 17 }]}>
        Pedido confirmado!
      </Text>
      <Text style={{ color: '#746E69', textAlign: 'center', marginTop: 10, lineHeight: 22 }}>
        Seu pedido #{order.id} entrou na cozinha. Agora é só preparar a fome!
      </Text>
      <Text style={[styles.totalPrice, { marginVertical: 19 }]}>
        {formatMoney(order.total)}
      </Text>
      <Button onPress={close} style={{ alignSelf: 'stretch' }}>
        Voltar ao cardápio
      </Button>
    </View>
  );
}

type CheckoutViewProps = {
  styles: Styles;
  address: string;
  setAddress: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  payment: string;
  setPayment: (value: string) => void;
  cartCount: number;
  subtotal: number;
  fee: number;
  busy: boolean;
  placeOrder: () => void;
  formatMoney: (value: number) => string;
};

export function CheckoutView({
  styles,
  address,
  setAddress,
  notes,
  setNotes,
  payment,
  setPayment,
  cartCount,
  subtotal,
  fee,
  busy,
  placeOrder,
  formatMoney,
}: CheckoutViewProps) {
  const paymentMethods = [
    ['PIX', '◆ PIX'],
    ['CARD', '💳 Cartão'],
    ['CASH', '💵 Dinheiro'],
  ];

  return (
    <>
      <Text style={styles.modalKicker}>QUASE LÁ!</Text>
      <Text style={styles.modalTitle}>Finalizar pedido 🛵</Text>
      <Text style={[styles.subTitle, { marginBottom: 22 }]}>
        A gente cuida do resto. Só precisamos dos detalhes.
      </Text>
      <Field
        testID="delivery-address"
        label="Endereço de entrega"
        placeholder="Rua, número, bairro e referência"
        value={address}
        onChange={setAddress}
        multiline
      />
      <Field
        label="Observações (opcional)"
        placeholder="Sem cebola, campainha quebrada..."
        value={notes}
        onChange={setNotes}
        multiline
      />
      <Text style={styles.inputLabel}>Forma de pagamento</Text>
      <View style={{ flexDirection: 'row', gap: 9, marginBottom: 24 }}>
        {paymentMethods.map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setPayment(value)}
            style={[
              styles.paymentChip,
              payment === value && {
                backgroundColor: '#FFF0E5',
                borderColor: '#FF6835',
              },
            ]}
          >
            <Text style={{ fontWeight: '800', fontSize: 13, color: '#221C18' }}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.summary}>
        <View style={styles.between}>
          <Text style={styles.summaryLabel}>{cartCount} item(ns)</Text>
          <Text style={styles.summaryValue}>{formatMoney(subtotal)}</Text>
        </View>
        <View style={[styles.between, { marginTop: 10 }]}>
          <Text style={styles.summaryLabel}>Entrega</Text>
          <Text style={styles.summaryValue}>{fee === 0 ? 'Grátis' : formatMoney(fee)}</Text>
        </View>
        <View style={[styles.between, { marginTop: 15, borderTopWidth: 1, borderColor: '#EDE7DF', paddingTop: 16 }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{formatMoney(subtotal + fee)}</Text>
        </View>
      </View>
      <Button testID="confirm-order" onPress={placeOrder} disabled={busy} style={{ marginTop: 19 }}>
        {busy ? 'Enviando...' : 'Confirmar pedido  →'}
      </Button>
      <Text style={{ color: '#746E69', textAlign: 'center', fontSize: 11, marginTop: 13 }}>
        Pedido demonstrativo; nenhuma cobrança real será realizada.
      </Text>
    </>
  );
}

type ProfileViewProps = {
  styles: Styles;
  session: Auth;
  profileName: string;
  setProfileName: (value: string) => void;
  profileEmail: string;
  setProfileEmail: (value: string) => void;
  saveProfile: () => void;
  loadAdmin: () => void;
  logout: () => void;
  busy: boolean;
  orders: Order[];
  formatMoney: (value: number) => string;
  statusLabel: (status: string) => string;
};

export function ProfileView({
  styles,
  session,
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  saveProfile,
  loadAdmin,
  logout,
  busy,
  orders,
  formatMoney,
  statusLabel,
}: ProfileViewProps) {
  return (
    <>
      <Text style={styles.modalKicker}>ÁREA DO CLIENTE</Text>
      <Text testID="profile-title" style={styles.modalTitle}>
        Olá, {session.user.name}! 👋
      </Text>
      <Text style={[styles.subTitle, { marginBottom: 21 }]}>
        Seu cantinho no Caradap.
      </Text>
      <View style={styles.profileBox}>
        <Text style={[styles.inputLabel, { marginBottom: 16 }]}>MEUS DADOS</Text>
        <Field label="Nome" value={profileName} onChange={setProfileName} />
        <Field
          label="E-mail"
          keyboardType="email-address"
          value={profileEmail}
          onChange={setProfileEmail}
        />
        <Button onPress={saveProfile} variant="outline" small disabled={busy}>
          Salvar alterações
        </Button>
      </View>
      {session.user.role === 'ADMIN' ? (
        <Button
          testID="admin-button"
          onPress={loadAdmin}
          variant="dark"
          style={{ marginTop: 16 }}
        >
          ⚙ Painel administrativo  →
        </Button>
      ) : null}
      <Text style={[styles.sectionTitle, { fontSize: 21, marginTop: 27, marginBottom: 14 }]}>
        Meus pedidos
      </Text>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>Seus próximos pedidos aparecerão aqui. 🍽️</Text>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.orderBox}>
            <View style={styles.between}>
              <View>
                <Text style={{ fontWeight: '900', fontSize: 15, color: '#221C18' }}>
                  Pedido #{order.id}
                </Text>
                <Text style={styles.orderCaption}>{formatOrderDate(order.createdAt)}</Text>
              </View>
              <View style={styles.orderStatus}>
                <Text style={{ color: '#FF6835', fontWeight: '800', fontSize: 12 }}>
                  {statusLabel(order.status)}
                </Text>
              </View>
            </View>
            <View style={styles.orderItems}>
              {order.items.map((item) => (
                <View key={`${order.id}-${item.productId}`} style={styles.orderItem}>
                  <Text style={styles.orderItemName}>{item.quantity}× {item.productName}</Text>
                  <Text style={styles.orderItemPrice}>{formatMoney(item.unitPrice * item.quantity)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderDetail}><Text style={styles.orderDetailLabel}>Entrega: </Text>{order.deliveryAddress}</Text>
              <Text style={styles.orderDetail}><Text style={styles.orderDetailLabel}>Pagamento: </Text>{paymentLabel(order.paymentMethod)}</Text>
              {order.notes ? <Text style={styles.orderDetail}><Text style={styles.orderDetailLabel}>Observações: </Text>{order.notes}</Text> : null}
            </View>
            <View style={styles.orderTotals}>
              <Text style={styles.orderTotalLine}>Subtotal {formatMoney(order.subtotal)}</Text>
              <Text style={styles.orderTotalLine}>Entrega {order.deliveryFee === 0 ? 'Grátis' : formatMoney(order.deliveryFee)}</Text>
              <View style={styles.between}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>{formatMoney(order.total)}</Text>
              </View>
            </View>
          </View>
        ))
      )}
      <Button onPress={logout} variant="ghost" style={{ marginTop: 26 }}>
        Sair da conta
      </Button>
    </>
  );
}

function formatOrderDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR');
}

function paymentLabel(value: string) {
  return ({ PIX: 'PIX', CARD: 'Cartão', CASH: 'Dinheiro' } as Record<string, string>)[value] || value;
}

