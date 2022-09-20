//First we grab the variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");


 //for the dark/light mode
 function darkMode() {
  if (document.body.style.backgroundColor == "black") {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
  } else {
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
  }
} 



// for the cart

let cart = [];
//for the cart buttons
let buttonsDOM = [];

//to get the products

class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = Array.from(data.items);
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        const soldout = item.fields.soldout;
        return { title, price, id, image, soldout };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//to display the products

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
       //If Statement displaying the Soldout Items
        if(product.soldout == true) {
        console.log('soldout');
        result += `
        <!-- single product -->
        <article class="product relative">
          <div id="img-container">
            <img
            src=${product.image}
            class="block relative soldout-image" />

          </div>
          <div class="soldout">
          Soldout
          </div>
          <h3 class="capitalize text-center">
          ${product.title} 
          </h3>
          <h4 class="text-center">
          $${product.price}
          </h4>
        </article>
        <!-- end of single product-->
        `;

        
        //Else Statement returning the Available Products
     } else{
        result += `
        <!-- single product -->
        <article class="product">
          <div id="img-container">
            <img
            src=${product.image}
            id="product-img"
            class="block " />
            <button class="bag-btn absolute bg-brightRed right-0 border-none uppercase font-bold cursor-pointer text-black" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3 class="capitalize text-center">
          ${product.title} 
          </h3>
          <h4 class="text-center">
          $${product.price}
          </h4>
        </article>
        <!-- end of single product-->
        `;
     }
      
    }
    );
    productsDom.innerHTML = result;
  }
}


