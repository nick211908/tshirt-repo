import { supabase } from './fast_supabase';

export const authAPI = {
  register: async (data: { email: string; password: string; full_name: string }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
        },
      },
    });
    if (error) throw error;
    return authData;
  },
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    // Fetch profile data
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // If profile not found, return user basic info (graceful fallback)
        return { ...user, role: 'USER' };
      }
      return { ...user, ...profile };
    }
    return null;
  }
};

export const productsAPI = {
  getAll: async (skip: number = 0, limit: number = 20) => {
    const { data, error, count } = await supabase
      .from('products')
      .select('*, product_variants(*)', { count: 'exact' })
      .range(skip, skip + limit - 1)
      .eq('is_published', true);

    if (error) throw error;
    return { data, total: count };
  },
  getBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },
  create: async (data: any) => {
    const { product_variants, ...productData } = data;

    // Insert product
    const { data: product, error: prodError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (prodError) throw prodError;

    // Insert variants if any
    if (product_variants && product_variants.length > 0) {
      const variantsWithProdId = product_variants.map((v: any) => ({ ...v, product_id: product.id }));
      const { error: varError } = await supabase
        .from('product_variants')
        .insert(variantsWithProdId);
      if (varError) throw varError;
    }

    return product;
  },
  update: async (id: string, data: any) => {
    // Separate variants from product data
    const { product_variants, ...productData } = data;

    const { data: product, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Handle variants: Delete all existing and re-insert new ones
    if (product_variants) {
      // 1. Delete existing variants
      const { error: deleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', id);

      if (deleteError) throw deleteError;

      // 2. Insert new variants
      if (product_variants.length > 0) {
        const variantsWithProdId = product_variants.map((v: any) => ({
          ...v,
          product_id: id
        }));

        const { error: insertError } = await supabase
          .from('product_variants')
          .insert(variantsWithProdId);

        if (insertError) throw insertError;
      }
    }

    return product;
  },
  delete: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  uploadImage: async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('products') // Ensure bucket 'products' exists and is public
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return { url: publicURL.publicUrl };
  },
};

export const cartAPI = {
  get: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get cart
    let { data: cartData, error } = await supabase
      .from('carts')
      .select('*, cart_items(*, product:products(title, images, base_price))')
      .eq('user_id', user.id)
      .single();

    // If no cart, create one
    if (error && error.code === 'PGRST116') {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (createError) throw createError;
      return { ...newCart, items: [], total_price: 0 };
    }

    if (error) throw error;

    // Transform to match frontend Store interface
    const items = cartData.cart_items.map((item: any) => ({
      product_id: item.product.id || item.product_id, // ensure we have product id
      variant_sku: item.variant_sku,
      quantity: item.quantity,
      added_at: item.added_at,
      title: item.product.title,
      price: item.product.base_price,
      image: item.product.images?.[0] || null
    }));

    const total_price = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    return {
      ...cartData,
      items,
      total_price
    };
  },
  addItem: async (productId: string, variantSku: string, quantity: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    // Ensure cart exists (reuse get logic or simple check)
    let { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
    if (!cart) {
      const { data: newCart } = await supabase.from('carts').insert({ user_id: user.id }).select().single();
      cart = newCart;
    }

    // Upsert cart item
    // Check if exists
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart!.id)
      .eq('product_id', productId)
      .eq('variant_sku', variantSku)
      .single();

    if (existingItem) {
      const { error } = await supabase.from('cart_items').update({ quantity: existingItem.quantity + quantity }).eq('id', existingItem.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('cart_items').insert({
        cart_id: cart!.id,
        product_id: productId,
        variant_sku: variantSku,
        quantity
      });
      if (error) throw error;
    }

    return await cartAPI.get();
  },
  removeItem: async (productId: string, variantSku: string) => {
    // Need cart id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
    if (!cart) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .eq('variant_sku', variantSku);

    if (error) throw error;

    return await cartAPI.get();
  },
};

export const ordersAPI = {
  create: async (data: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    // Create order
    const { items, ...orderData } = data;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ ...orderData, user_id: user.id })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_sku: item.variant_sku,
      title: item.title,
      size: item.size || 'N/A', // fallback
      color: item.color || 'N/A', // fallback
      unit_price: item.unit_price || item.price,
      quantity: item.quantity,
      image: item.image
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return order;
  },
  getAll: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};

export default supabase;
