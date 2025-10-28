import { readFile, writeFile } from 'fs/promises';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());
const PORT = 8080;
const PRODUCTS_FILE_URL = new URL('./data/products.json', import.meta.url);

// Products Manager
class ProductManager {

  static async getProducts() {
    const data = await readFile(PRODUCTS_FILE_URL, 'utf-8');
    const products = JSON.parse(data);
    return products;
  }

  static async getProductById(id) {
    const products = await this.getProducts();
    const product = products.find(product => product.id === id);
    if (!product) {
      return null;
    }
    return product;
  }

  static async createProduct({tittle, description, code, price, status, stock, category, thumbnails}) {
    // Validación de campos requeridos
    const requiredFields = { tittle, description, code, price, status, stock, category, thumbnails };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null) {
        throw new Error(`Falta el campo requerido: ${key}`);
      }
    }

    const newProduct = {
      id: uuidv4(),
      tittle,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails
    };
    const products = await this.getProducts();
    products.push(newProduct);
    await writeFile(PRODUCTS_FILE_URL, JSON.stringify(products, null, 2));
  }
  
  static async updateProduct(id, {tittle, description, code, price, status, stock, category, thumbnails}) {
    const products = await this.getProducts();
    const product = products.find(product => product.id === id)
    product.tittle = tittle;
    product.description = description;
    product.code = code;
    product.price = price;
    product.status = status;
    product.stock = stock;
    product.category = category;
    product.thumbnails = thumbnails;
    await writeFile(PRODUCTS_FILE_URL, JSON.stringify(products, null, 2));
  }

  static async deleteProduct(id) {
    const product = await this.getProductById(id);
    if (product === null) {
      throw new Error('Producto no encontrado');
    }
    const products = await this.getProducts();
    products.splice(products.indexOf(product), 1);
    await writeFile(PRODUCTS_FILE_URL, JSON.stringify(products, null, 2));
  }
}

// RUTAS DE PRODUCTOS (/api/products)
app.listen(PORT, async () => {
  console.log(`El servidor esta corriendo en el puerto ${PORT}`);
});


// GET products tiene que listar todos los productos de la base de datos
app.get('/api/products', async (req, res) => {
  try {
    const products = await ProductManager.getProducts();
    console.log('Productos encontrados:', products);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error leyendo products.json:', error);
    res.status(500).json({ error: 'No se pudo leer products.json' });
  }
});


// GET products/:id tiene que listar un producto específico de la base de datos
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await ProductManager.getProductById(req.params.id);
    if (product === null) {
      console.log('Producto no encontrado');
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    console.log('Producto encontrado:', product);
    res.status(200).json(product);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'No se pudo obtener el producto' });
  }
});


// POST debe agregar un nuevo producto con los siguientes campos:
// - id: number/string (autogenerado)
// - tittle: string
// - description: string
// - code: string
// - price: number
// - status: boolean
// - stock: number
// - category: string
// - thumbnails: array de strings
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = req.body;
    await ProductManager.createProduct(newProduct);
    console.log('Producto creado:', newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'No se pudo crear el producto' });
  }
});


// PUT debe actualizar un producto específico de la base de datos con los datos enviados en el body de la petición. No se debe actualizar ni eliminar el id al momento de haceer la actualizacion.
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await ProductManager.getProductById(req.params.id);
    if (product === null) {
      console.log('Producto no encontrado');
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    await ProductManager.updateProduct(req.params.id, req.body);
    console.log('Producto actualizado:', product);
    res.status(200).json(product);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'No se pudo actualizar el producto' });
  }
});


// DELETE debe eliminar un producto específico de la base de datos con el id enviado en la ruta.
app.delete('/api/products/:id', async (req, res) => {{
  try {
   await ProductManager.deleteProduct(req.params.id);
    console.log('Producto eliminado');
    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error eliminando producto de products.json:', error);
    res.status(500).json({ error: 'No se pudo eliminar el producto de products.json' });
  }
}})


// RUTAS PARA CARRITOS (/api/carts)
const CART_FILE_URL = new URL('./data/carts.json', import.meta.url);

class CartsManager {

  static async getCarts() {
    const data = await readFile(CART_FILE_URL, 'utf-8');
    const carts = JSON.parse(data);
    return carts;
  }

  static async getCartProducts(id) {
    const data = await readFile(CART_FILE_URL, 'utf-8');
    const carts = JSON.parse(data);
    const cart = carts.find(cart => cart.id === id);
    if (cart === undefined) {
      throw new Error('Carrito no encontrado');
    }
    return cart.products;
  }

  static async createCart() {
    const newCart = {
      id: uuidv4(),
      products: []
    }
    const carts = await this.getCarts();
    carts.push(newCart);
    await writeFile(CART_FILE_URL, JSON.stringify(carts, null, 2));
    return newCart.id;
  }

  static async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const cart = carts.find(cart => cart.id === cid);
    if (cart === undefined) {
      throw new Error('Carrito no encontrado');
    }
    const product = cart.products.find(product => product.id === pid);
    if (product === undefined) {
      cart.products.push({ id: pid, quantity: 1 });
      await writeFile(CART_FILE_URL, JSON.stringify(carts, null, 2));
      return cart;
    } else {
      product.quantity++;
      await writeFile(CART_FILE_URL, JSON.stringify(carts, null, 2));
      return cart;
    }
  }
}


// POST - debe crear un nuevo carrito con un id autogenerado y products, que va a ser un array de objetos con cada producto
app.post('/api/carts', async (req,res) => {
  try {
    const newCartId = await CartsManager.createCart();
    console.log('Carrito creado:', newCartId);
    res.status(201).json({ id: newCartId });
  } catch (error) {
    console.error('Error creando carrito:', error);
    res.status(500).json({ error: 'No se pudo crear el carrito' });
  }
})

// GET - /:cid debe listar los productos que pertenecen al carrito con ese id
app.get('/api/carts/:id', async (req,res) => {
  try {
    const products = await CartsManager.getCartProducts(req.params.id);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error obteniendo productos del carrito:', error);
    res.status(500).json({ error: 'No se pudo obtener los productos del carrito' });
  }
})

// POST - /:cid/product/:pid debe agregar el producto al arreglo de products con el pid al carrito con el cid proporcionado, y deberia utilizar el siguiente formato:
app.post('/api/carts/:cid/product/:pid', async (req,res) => {
  try {
    const cart = await CartsManager.addProductToCart(req.params.cid, req.params.pid);
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error agregando producto al carrito:', error);
    res.status(500).json({ error: 'No se pudo agregar el producto al carrito' });
  }
})
