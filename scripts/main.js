"use strict";

/* variable generators */
let qElm = (qElm, parent = document) => parent.querySelector(qElm);
let qElms = (qElms, parent = document) => parent.querySelectorAll(qElms);
let cElms = (cElms, parent = document) => parent.getElementsByClassName(cElms);
let tElms = (tElms, parent = document) => parent.getElementsByTagName(tElms);

/* variables declarations */
const landingPageSection = qElm('.navbar-center h3');
const menuBtn = qElms('.nav-icon')[0];
const menuBar = qElm('.dropdown-menu');
const menuBarOptions = qElms('.dropdown-menu li');
const bannerBtn = qElm('.banner-btn');
const productsDisplayer = qElm('.products-center');
const cartBtn = qElm('.cart-btn');
const cart = qElm('.cart');
const clearCart = qElm('.clear-cart-btn');
const cartContent = qElm('.cart-content');
const cartItemsNumber = qElm('.cart-items-number');
const totalPriceDisplayer = qElm('.total-price');
const hidingTriggerAreas = [qElm('.hero'), qElm('.products'), qElm('.navbar')];

let bagBtns = [];
let cartItemsStorage = [];
let cartItems = [];
let removeItemBtns;

/* page transitions (navbar & hero) */
landingPageSection.addEventListener('click', () => {
    location.hash = 'unknown';
    location.hash = 'landingPageSection';
});

menuBtn.addEventListener('click', (ev) => {
    switch(true) {
        case menuBar.style.transform.includes("rotateX(90deg)") :
            menuBar.style.transform = "translateY(70px) rotateX(0deg)"
            cart.style.transform = 'rotateX(90deg)';
            cart.style.top = '20px';
            break;
        default :
            menuBar.style.transform = "translateY(70px) rotateX(90deg)";
            break;
    }  
    ev.stopPropagation()  
})

menuBarOptions[0].addEventListener('click', () => {
    location.hash = 'unknown';
    location.hash = 'landingPageSection';
});

menuBarOptions[1].addEventListener('click', () => {
    location.hash = 'unknown';
    location.hash = 'productsSection';
});

bannerBtn.addEventListener('click', () => {
    location.hash = 'unknown';
    location.hash = 'productsSection';
});

/* displaying & hiding shopping cart */
cartBtn.addEventListener('click', (ev) => {
    switch (true) {
        case cart.style.transform.includes("rotateX(90deg)"):
            cart.style.transform = 'rotateX(0deg)';
            cart.style.top = '62px';
            menuBar.style.transform = "translateY(70px) rotateX(90deg)";
            break;
        default:
            cart.style.transform = 'rotateX(90deg)';
            cart.style.top = '20px';
            break;
    }
    ev.stopPropagation();
});

hidingTriggerAreas.forEach(item => {
    item.addEventListener('click', () => {
        cart.style.transform = 'rotateX(90deg)';
        cart.style.top = '20px';
        menuBar.style.transform = "translateY(70px) rotateX(90deg)";
    });
});

/* getting, displaying & sending products to storage */
class Products {
    async getProducts() {
        try {
            const getData = await fetch('./products.json');
            if (getData.ok) {
                console.log('Products List Received');
                const data = await getData.json();
                return data;
            } else {
                console.log('No Products Available');
                productsDisplayer.innerHTML = "<p>no item available to purchase at the moment!</p>";
            }
        } catch(error) {
            console.log(`Fetch Error: ${error}`);
        }
    }

    async displayProducts(data) {
        await data.items.forEach(element => {
            productsDisplayer.innerHTML +=
            `<div class="product">
                <div class="img-container">
                    <img src=${element.image} alt="product image" class="product-img">
                    <button class="bag-btn" data-id="${element.id}">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Add to bag</span>
                    </button>
                </div>
                <h3 class="product-name">${element.name}</h3>
                <h3 class="product-price">$${element.price}</h3>
            </div>`;
        });
        let availableProducts = cElms('product', productsDisplayer);
        return availableProducts;
    }
}

/* shopping cart */
class CartList {
    static async storeItems(availableProducts) {    
        let productsArray = [ ... availableProducts];
        productsArray.forEach(element => {
            qElm('button', element).addEventListener('click', function() {
                let bagStat = qElm('span', this).innerHTML;

                if (bagStat.includes("bag")) {
                    let itemID = this.getAttribute('data-id');
                    let itemImg = element.childNodes[1].childNodes[1].src;
                    let itemName = element.childNodes[3].innerText;
                    let itemPrice = element.childNodes[5].innerText;
                    let cartItem = {
                        itemID: itemID,
                        itemName: itemName,
                        itemPrice: itemPrice,
                        itemImg: itemImg,
                        itemAmount: 1,
                        bagStat: 'Added'
                    };

                    if (localStorage.getItem('Cart Items') !== null) {
                        cartItemsStorage = [ ... JSON.parse(localStorage.getItem('Cart Items'))];
                    }

                    cartItemsStorage = [ ... cartItemsStorage, cartItem];
                    localStorage.setItem('Cart Items', JSON.stringify(cartItemsStorage));

                    cartItemsNumber.innerHTML ++;
                    
                    Storage.displayCartItems();
                    CartList.totalItems();
                    CartList.totalPrice();
                    CartList.removeItem();
                }
            });
        }); 
    }

    static itemsAmount() {
        cartItems = [ ... cElms('cart-item', cartContent)];

        cartItems.forEach(cartItem => {
            const itemAmount = qElm('.item-amount', cartItem);
            const addAmount = qElm('.fa-chevron-up', cartItem);
            const subtractAmount = qElm('.fa-chevron-down', cartItem);
            const removeItemBtn = qElm('.remove-item-btn', cartItem);
            cartItemsStorage = JSON.parse(localStorage.getItem('Cart Items'));

            addAmount.addEventListener('click', () => {  
                cartItemsStorage.forEach(cartItemStorage => {
                    if (Number(cartItem.getAttribute('data-id')) === Number(cartItemStorage.itemID)) {
                        itemAmount.innerHTML ++;
                        cartItemStorage.itemAmount = itemAmount.innerHTML;
                    }
                });

                localStorage.setItem('Cart Items', JSON.stringify(cartItemsStorage))
                this.totalItems();
                this.totalPrice();
            });

            subtractAmount.addEventListener('click', () => {
                switch(true) {
                    case Number(itemAmount.innerHTML) === 1 :
                        removeItemBtn.style.animation = 'alert 0.3s';
                        cartItemsStorage.forEach(cartItemStorage => {
                            if (Number(cartItem.getAttribute('data-id')) === Number(cartItemStorage.itemID)) {
                                itemAmount.innerHTML = 1;
                                cartItemStorage.itemAmount = itemAmount.innerHTML;
                            }
                        });
                        setTimeout(() => {
                            removeItemBtn.style.removeProperty('animation');
                        }, 300);
                        break;
                    case Number(itemAmount.innerHTML) !== 1 :
                        cartItemsStorage.forEach(cartItemStorage => {
                            if (Number(cartItem.getAttribute('data-id')) === Number(cartItemStorage.itemID)) {
                                itemAmount.innerHTML --;
                                cartItemStorage.itemAmount = itemAmount.innerHTML;
                            }
                        });
                        break;
                }
                        
                localStorage.setItem('Cart Items', JSON.stringify(cartItemsStorage))
                this.totalItems();
                this.totalPrice();
            });
        });
    }

    static totalItems() {
        let totalItems = qElms('.item-amount', cartContent);
        if (totalItems.length > 0) {
            let totalItemsArray = [];
            totalItems.forEach(element => totalItemsArray.push(Number(element.innerHTML)));
            let totalResult = 0;
            
            (() => {
                for(let i = 0; i < totalItemsArray.length; i++) {
                    totalResult += totalItemsArray[i];
                }
            })();
            cartItemsNumber.innerHTML = totalResult;
        } else {
            cartItemsNumber.innerHTML = 0;
        }
    }
        
    static totalPrice() {
        cartItems = [ ... cElms('cart-item', cartContent)];
        if (cartItems.length > 0) {
            let itemsPricesArray = [];
            let itemsAmountsArray = [];
            let totalPrice = 0;
            cartItems.forEach(element => {
                itemsPricesArray.push(Number(element.childNodes[3].childNodes[3].innerHTML.slice(1)))
                itemsAmountsArray.push(Number(element.childNodes[5].childNodes[3].innerHTML))
            });
    
            for (let i = 0; i <itemsPricesArray.length; i++) {
                totalPrice += itemsPricesArray[i] * itemsAmountsArray[i];
                totalPriceDisplayer.innerHTML = totalPrice;
            }  
        } else {
            totalPriceDisplayer.innerHTML = 0;
        }    
    }

    static removeItem() {
        removeItemBtns = [ ... cElms('remove-item-btn', cartContent)];
        bagBtns = [ ... cElms('bag-btn', productsDisplayer)];
        if (Number(removeItemBtns.length) > 0) {
            for (let i = 0; i < removeItemBtns.length; i++) {
                removeItemBtns[i].addEventListener('click', () => {
                    cartItemsStorage = JSON.parse(localStorage.getItem('Cart Items'))
                    for (let j = 0; j < cartItemsStorage.length; j++) {
                        if (Number(cartItemsStorage[j].itemID) === Number(removeItemBtns[i].getAttribute('data-id'))) {
                            cartItemsStorage.splice(cartItemsStorage.indexOf(cartItemsStorage[j]), 1);
                            localStorage.setItem('Cart Items', JSON.stringify(cartItemsStorage))
                            Storage.displayCartItems();
                            CartList.totalItems();
                            CartList.totalPrice();
                            bagBtns.forEach(bagBtn => {
                                if (Number(bagBtn.getAttribute('data-id')) === Number(removeItemBtns[i].getAttribute('data-id'))) {
                                    bagBtn.style.background = 'white';
                                    bagBtn.style.color = 'rgb(94, 175, 202)';
                                    bagBtn.innerHTML = 
                                        `<i class="fas fa-shopping-cart"></i>
                                        <span>Add to bag</span>`;
                                    bagBtn.style.cursor = 'pointer';
                                }
                            })
                            this.removeItem();
                        }
                    };
                });
            };
        }
    }

    static clearCart() {
        bagBtns = [ ... cElms('bag-btn', productsDisplayer)];
        localStorage.setItem('Cart Items', JSON.stringify([]));
        Storage.displayCartItems();
        CartList.totalItems();
        CartList.totalPrice();
        
        bagBtns.forEach(bagBtn => {
            bagBtn.style.background = 'white';
            bagBtn.style.color = 'rgb(94, 175, 202)';
            bagBtn.innerHTML = 
                `<i class="fas fa-shopping-cart"></i>
                <span>Add to bag</span>`;
        })
    }
}

class Storage {
    static async displayCartItems() {
        if(localStorage.getItem('Cart Items') !== null) {
            cartContent.innerHTML = '';
            cartItemsStorage = [ ... JSON.parse(localStorage.getItem('Cart Items'))];
            let addBtns = [... tElms('button', productsDisplayer)];

            addBtns.forEach(btn => {
                cartItemsStorage.forEach(element => {
                    if (Number(btn.getAttribute('data-id')) === Number(element.itemID)) {
                        btn.innerHTML = 
                            `<i class="fas fa-shopping-cart"></i>
                            <span>${element.bagStat}</span>`;
                        btn.style.background = 'rgb(94, 175, 202)';
                        btn.style.color = 'white';
                        btn.style.cursor = 'auto';
                    }
                });
            });
        
            cartItemsStorage.forEach(cartItemStorage => {
                cartContent.innerHTML +=
                                        `<div class="cart-item" data-id=${cartItemStorage.itemID}>
                                            <img src=${cartItemStorage.itemImg} alt="product">
                                            <div>
                                                <h4>${cartItemStorage.itemName}</h4>
                                                <h5>${cartItemStorage.itemPrice}</h5>
                                                <span class="remove-item-btn" data-id="${cartItemStorage.itemID}">remove</span>
                                            </div>
                                            <div>
                                                <i class="fas fa-chevron-up"></i>
                                                <p class="item-amount">${cartItemStorage.itemAmount}</p>
                                                <i class="fas fa-chevron-down"></i>
                                            </div>
                                        </div>`;
            });

            CartList.itemsAmount();
            CartList.totalPrice(); 
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();

    (async () => {
        let getProducts = await products.getProducts();
        let displayProducts = await products.displayProducts(getProducts);
        await CartList.storeItems(displayProducts);
        await Storage.displayCartItems()
        CartList.totalItems();
        CartList.removeItem();
    })()

    clearCart.addEventListener('click', CartList.clearCart);
});














