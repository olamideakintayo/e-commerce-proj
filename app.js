
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
let tempTotal;
let itemsTotal;

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
    displayProducts(products ) {
      let result = "";
      products.forEach((product) => {
         //If Statement displaying the Soldout Items
          if(product.soldout == true) {
          result += `
          <!-- single product -->
          <article class="product relative">
            <div id="img-container">
              <img
              src=${product.image}
              class="block relative soldout-image" />
  
            </div>
            <div class="soldout">
            <img src="./images/red-dot.png" class="red-dot" />
            Soldout
            </div>
            <h3 class="capitalize text-center line-through">
            ${product.title} 
            </h3>
            <h4 class="text-center line-through">
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
    
  //the button add to cart to display the products to the cart by the ID.
  getBagButtons() {
      const buttons = [...document.querySelectorAll(".bag-btn")];
      buttonsDOM = buttons;
      buttons.forEach((button) => {
        let id = button.dataset.id;
        let inCart = cart.find((item) => item.id === id);
        if (inCart) {
          button.innerText = "In Cart";
          button.disabled = true;

        }
       
        button.addEventListener("click", (event) => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;
       //to get product from products based on the ID we are getting from the button.
       let cartItem = { ...Storage.getProduct(id), amount: 1 };
       //Then we add the product to the cart when being; click add to cart.
      cart = [...cart, cartItem];
          //Then we save the cart in the local storage.
          Storage.saveCart(cart);
          //Then we set cart value.
          this.getCartTotalPrice(cart);
          //Then we display cart items when added to cart
          this.addCartItems(cartItem);
          //then we call the event listener that calls the whatsapp function
          this.checkout()
        });
      });
      
    }

    //set cart values 
   getCartTotalPrice(cart) {
    let tempTotal = 0; 
    let itemsTotal = 0;
    cart.map((item) => {
     tempTotal += item.price * item.amount;
    itemsTotal += item.amount;
      });
      cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
      cartItems.innerText = itemsTotal;
 }

  addCartItems(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product" />
        <div class="text-black">
          <h4 class="capitalize">${item.title}</h4>
          <h5>$${item.price}</h5>
          <span class="remove-item cursor-pointer" data-id = ${item.id}>remove</span>
        </div>
        <div class="text-black"> 
        <i class="fas fa-chevron-up cursor-pointer" data-id= ${item.id}></i>
        <p class="item-amount self-center">${item.amount}</p>
        <i class="fas fa-chevron-down cursor-pointer" data-id= ${item.id}></i>
      </div>
      `; 
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDom.classList.add("showCart");
  }
  //a method upon the loading of the page, to check the cart value from the local storage.
  setupAPP() {
    cart = Storage.getCart();
    this.getCartTotalPrice(cart);
    this.populateCart(cart);
    //EventListeners for Displaying and Hiding the cart.
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItems(item));
  }
  //to close cart
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDom.classList.remove("showCart");
  }

  //A method for the cart logic
  initCart() {
    cartContent.addEventListener("click", (event) => {
      //For the remove button in the cart
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }
      //for the increament of the variant
      else if (event.target.classList.contains("fa-chevron-up")) {
        let increaseNumber = event.target;
        let id = increaseNumber.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.getCartTotalPrice(cart);

        increaseNumber.nextElementSibling.innerText = tempItem.amount;
      }
      //for the reduction of the variant
      else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.getCartTotalPrice(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
    //For the clear cart  button event
    clearCartBtn.addEventListener('click',() => {
      this.clearCart();
      });
  }
  //For the Clear cart button Functionalities.
  clearCart() {
  let cartItems = cart.map(item => item.id);
  cartItems.forEach(id => this.removeItem(id))
  while(cartContent.children.length >0) {
   cartContent.removeChild(cartContent.children[0])
  };
  this.hideCart();
  }

  //to remove the items from the cart doing that with their ID.
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.getCartTotalPrice(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class ="fas fa-shopping-cart">add to cart</i>`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }

   //The whatsapp link function that returns the cart order message.
 WhatsappLinkLogic() {
  let tempTotal = 0; 
  let itemsTotal = 0;
  const itemDetails = cart.map(item => {
  return (tempTotal += item.price * item.amount,
    itemsTotal += item.amount),
  [item.amount, item.title, `${'$'+item.price}`].join(" ")
})
  //for the whatsapp checkout link
  let link = `https://wa.me/+2349032592825?text=I%20will%20like%20to%20place%20an%20order%20of%20`;
  //for displaying the amount of items and total price in the checkout chat.
   link += itemDetails + ', ';
   //to create href attributes to display the link contents and items total price rounded up to 2.
   document.getElementById("check").href = link + 'Total Price:$' + parseFloat(tempTotal.toFixed(2))
 }

//the event listener that calls the whatsapp function
checkout(){
  const checkoutButton = document.getElementById('check')
  checkoutButton.addEventListener('click', () => {
    this.WhatsappLinkLogic();
  })
  this.clearCartLocalStorage();
  }

  ///A function that clears the local storage after check out.
  clearCartLocalStorage() {
    document.getElementById('checkout-btn').addEventListener('click', () => {
      window.localStorage.clear("cart")
      window.location.reload("cart")
    })
  }
} 


//To store it in the local storage.
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  //Getting the new cart values and saving it in the local storage
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // To setup the products to load in cart
  ui.setupAPP();

  //get all products to the local storage.
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.initCart();
    });
})

