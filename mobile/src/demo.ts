import type { Category, Product } from './types';

export const sampleCategories: Category[] = [
  { id:1,name:'Burgers',slug:'burgers',emoji:'🍔',description:'Do smash ao artesanal',sortOrder:1,active:true },
  { id:2,name:'Pizzas',slug:'pizzas',emoji:'🍕',description:'Fatia de felicidade',sortOrder:2,active:true },
  { id:3,name:'Brasileira',slug:'brasileira',emoji:'🍛',description:'Com gostinho de casa',sortOrder:3,active:true },
  { id:4,name:'Oriental',slug:'oriental',emoji:'🍜',description:'Do Japão ao Vietnã',sortOrder:4,active:true },
  { id:5,name:'Exóticos',slug:'exoticos',emoji:'🌶️',description:'Sair da rotina é delicioso',sortOrder:5,active:true },
  { id:6,name:'Veggie',slug:'veggie',emoji:'🥗',description:'Verde e surpreendente',sortOrder:6,active:true },
  { id:7,name:'Doces',slug:'doces',emoji:'🍰',description:'Aquela sobremesa',sortOrder:7,active:true },
  { id:8,name:'Bebidas',slug:'bebidas',emoji:'🥤',description:'Pra acompanhar',sortOrder:8,active:true }
];
const images = {
  burger:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  pizza:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  bowl:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  sushi:'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
  ramen:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  dessert:'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
  fries:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
  rice:'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
};
type MakeProduct = [number,string,string,number,number,string,string,boolean,boolean];
const catalog: MakeProduct[] = [
  [1,'Smash da Casa','Dois smash burgers, cheddar cremoso, picles e molho secreto no pão brioche.',32.90,1,'🍔',images.burger,false,true],
  [2,'Brasa Monstra','180g de carne na brasa, bacon crocante, cebola caramelizada e queijo prato.',39.90,1,'🔥',images.burger,false,true],
  [3,'Batata Explosiva','Batata crocante com cheddar, farofa de bacon e cebolinha.',19.90,1,'🍟',images.fries,false,false],
  [4,'Pizza Margherita','Molho de tomate da casa, muçarela, tomate e manjericão fresco.',49.90,2,'🍕',images.pizza,false,true],
  [5,'Pizza Pepperoni','Massa de longa fermentação, muçarela e bastante pepperoni.',59.90,2,'🍕',images.pizza,false,false],
  [6,'PF de Respeito','Arroz soltinho, feijão caseiro, bife acebolado, batata e salada.',28.90,3,'🍛',images.rice,false,true],
  [7,'Feijoada da Vó','Feijoada completa com arroz, couve, farofa e laranja.',42.90,3,'🥘',images.rice,false,false],
  [8,'Coxinhas Crocantes','Seis coxinhas de frango com requeijão, empanadas na hora.',22.90,3,'🥟',images.fries,false,false],
  [9,'Ramen Tonkotsu','Caldo rico, macarrão artesanal, ovo marinado e barriga suína.',46.90,4,'🍜',images.ramen,false,true],
  [10,'Combinado Sushi','12 peças entre uramaki, nigiri e hossomaki fresquinhos.',54.90,4,'🍣',images.sushi,false,false],
  [11,'Poke Tropical','Arroz japonês, salmão, manga, pepino, edamame e molho cítrico.',44.90,4,'🥗',images.bowl,false,false],
  [12,'Burger de Jacaré','Carne de jacaré temperada, aioli cítrico e rúcula no pão australiano.',65.90,5,'🐊',images.burger,true,true],
  [13,'Takoyaki de Osaka','Bolinhos japoneses de polvo com molho especial e flocos de bonito.',42.90,5,'🐙',images.sushi,true,true],
  [14,'Curry Tailandês Picante','Curry vermelho com leite de coco, especiarias e arroz jasmim.',48.90,5,'🌶️',images.bowl,true,true],
  [15,'Kimchi Fried Rice','Arroz coreano salteado com kimchi, gochujang e ovo.',38.90,5,'🇰🇷',images.rice,true,false],
  [16,'Bowl do Jardim','Grão-de-bico crocante, legumes, quinoa e molho tahine.',35.90,6,'🥬',images.bowl,false,false],
  [17,'Burger de Grão-de-bico','Hambúrguer vegetal, alface, tomate e maionese vegana.',34.90,6,'🌱',images.burger,false,false],
  [18,'Brownie Vulcão','Brownie quentinho com calda generosa de chocolate e sorvete.',24.90,7,'🍫',images.dessert,false,true],
  [19,'Cheesecake de Frutas','Cheesecake cremoso com geleia artesanal de frutas vermelhas.',22.90,7,'🍰',images.dessert,false,false],
  [20,'Limonada da Casa','Limonada fresca com hortelã e gelo, 500ml.',11.90,8,'🍋','https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?w=800&q=80',false,false],
  [21,'Refrigerante Lata','Refrigerante geladinho 350ml. Escolha seu sabor.',7.90,8,'🥤','https://images.unsplash.com/photo-1532634896-26909d0d4b54?w=800&q=80',false,false]
];
export const sampleProducts: Product[] = catalog.map(([id,name,description,price,categoryId,emoji,imageUrl,exotic,featured]) => ({
  id,name,description,price,categoryId,categoryName:sampleCategories.find(c=>c.id===categoryId)?.name||'',
  emoji,imageUrl,exotic,featured,available:true,prepMinutes:25,
}));
