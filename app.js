import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use(express.json());

const PORT = 8080;
const PRODUCTS_FILE_URL = new URL('./products.json', import.meta.url);
// RUTAS DE PRODUCTOS (/api/products)
app.listen(PORT, () => {
  console.log(`El servidor esta corriendo en el puerto ${PORT}`);
});
// GET products tiene que listar todos los productos de la base de datos
app.get('/api/products', async (req, res) => {
  try {
    const data = await readFile(PRODUCTS_FILE_URL, 'utf-8');
    const products = JSON.parse(data);
    console.log('Productos encontrados:', products);
    res.json(products);
  } catch (error) {
    console.error('Error leyendo products.json:', error);
    res.status(500).json({ error: 'No se pudo leer products.json' });
  }
});
// GET products/:id tiene que listar un producto específico de la base de datos
app.get('/api/products/:id', async (req, res) => {
  try {
    const data = await readFile(PRODUCTS_FILE_URL, 'utf-8');
    const products = JSON.parse(data);
    const product = products.find(product => product.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    console.log('Producto encontrado:', product);
    res.json(product);
  } catch (error) {
    console.error('Error leyendo products.json:', error);
    res.status(500).json({ error: 'No se pudo leer products.json' });
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
    const data = await readFile(PRODUCTS_FILE_URL, 'utf-8');
    const products = JSON.parse(data);
    const newProduct = req.body;
    newProduct.id = uuidv4();
    products.push(newProduct);
    await writeFile(PRODUCTS_FILE_URL, JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error escribiendo products.json:', error);
    res.status(500).json({ error: 'No se pudo escribir products.json' });
  }
});
// PUT debe actualizar un producto específico de la base de datos con los datos enviados en el body de la petición. No se debe actualizar ni eliminar el id al momeonto de haceer la actualizacion.
app.put('/api/products/:id', async (req, res) => {
  try {
    const data = await readFile(PRODUCTS_FILE_URL, 'utf-8');
    const products = JSON.parse(data);
    const product = products.find(product => product.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const updatedProduct = req.body;
    Object.assign(product, updatedProduct);
    await writeFile(PRODUCTS_FILE_URL, JSON.stringify(products, null, 2));
    res.json(product);
  } catch (error) {
    console.error('Error escribiendo products.json:', error);
    res.status(500).json({ error: 'No se pudo escribir products.json' });
  }
});
// DELETE debe eliminar un producto específico de la base de datos con el id enviado en la ruta.


// RUTAS PARA CARRITOS (/api/carts)
// POST - debe crear un nuevo carrito con un id autogenerado y products, que va a ser un array de objetos con cada producto
// GET - /:cid debe listar los productos que pertenecen al carrito con ese id
// POST - /:cid/product/:pid debe agregar el producto al arreglo de products con el pid al carrito con el cid proporcionado, y deberia utilizar el siguiente formato:
// product: solo va a tener el id del producto
// quantity: debe tener el numero de ejemplares de dicho producto en el carrito. Los productos se van a agregar de uno en uno
// si un producto ya existente intenta agregarse, se debe incrementar el campo quantity en 1 para dicho producto

// PERSISTENCIA DE DATOS
// la persistencia se implementara usando archivos JSON en la carpeta data.
// los archivos products.json y cats.json van a contener el listado de productos y categorias respectivamente.
// se debe utilizar un ProductManager desarrollado en el desafio anterior y crear un CartManager que se encargue de la persistencia de los carritos.
// sin frontend, se debe poder testear todo desde postman