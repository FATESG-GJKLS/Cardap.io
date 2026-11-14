import type { Category, Product } from './types';

export const sampleCategories: Category[] = [
];
type MakeProduct = [number,string,string,number,number,string,string,boolean,boolean];
const catalog: MakeProduct[] = [
];
export const sampleProducts: Product[] = catalog.map(([id,name,description,price,categoryId,emoji,imageUrl,exotic,featured]) => ({
  id,name,description,price,categoryId,categoryName:sampleCategories.find(c=>c.id===categoryId)?.name||'',
  emoji,imageUrl,exotic,featured,available:true,prepMinutes:25,
}));
