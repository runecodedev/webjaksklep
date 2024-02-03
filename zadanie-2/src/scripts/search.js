const searchInput = document.querySelector('#search-input')
const searchSubmitButton = document.querySelector('#search-submit')
const clearButton = document.querySelector('#search-clear')
const resultsHolder = document.querySelector('#results')
let mouseTarget
let inputInterval
let controller
let productsCopy = []
let lastInputValue = ''

function addClassToElement(element, style) {
  element.classList.add(style)
}

function removeClassFromElement(element, style) {
  element.classList.remove(style)
}

function checkMouseTargetIsOnElements(){
  const allowedElements = [...document.querySelector('.search').querySelectorAll('*')]
  if (searchInput.value) return

  if (!allowedElements || !allowedElements.find((element) => element === mouseTarget)) {
    removeClassFromElement(searchInput.parentElement, 'focused')
  }
}

function addProductsToResults(products){
  products.forEach((product) => {
    const productNode = document.createElement('li')
    productNode.classList.add('search__results-item')
    productNode.innerHTML = `
    <a href="#product-${product.id}" class="search__results-item-link">
      <span class="search__results-item-title">${product.title}</span>
      <span class="search__results-item-price">$${product.price}</span>
    </a>
    `

    resultsHolder.appendChild(productNode)
  })
}

function addNoProductsWereFound(){
  const warningNode = document.createElement('li')
  warningNode.classList.add('search__results-warning')
  warningNode.innerHTML = `
    No items found, please try again...
    `

  resultsHolder.appendChild(warningNode)
}

function removeNodesFromResults(){
  resultsHolder.innerHTML = ''
}

function checkDisplayClearButton(){
  if(searchInput.value) {
    clearButton.classList.remove('not-visible')
  } else {
    clearButton.classList.add('not-visible')
  }
}

async function fetchData() {
  clearInterval(inputInterval)

  if(!searchInput.value){
    removeNodesFromResults()
    return
  }

  if(lastInputValue === searchInput.value){
    removeNodesFromResults()
    if(productsCopy.length > 1){
      addProductsToResults(productsCopy)
    } else {
      addNoProductsWereFound()
    }
    return
  }

  lastInputValue = searchInput.value

  try {
    controller = new AbortController();
    const signal = controller.signal;

    addClassToElement(searchInput.parentElement, 'loading')
    removeNodesFromResults()
    const response = await fetch(`https://dummyjson.com/products/search?q=${searchInput.value}&limit=5&delay=1000`, { signal })

    // Test case for unexpected error from response
    // throw new Error()

    if (signal.aborted) {
      console.log('aborted');
      return
    }

    const { products } = await response.json()

    if(products && products.length) {
      addProductsToResults(products)
      productsCopy = products
    }

    if(!products || products.length === 0) {
      removeNodesFromResults()
      addNoProductsWereFound()
      productsCopy = []
    }
  } catch (error) {
    removeNodesFromResults()
    console.error(error)
  } finally {
    removeClassFromElement(searchInput.parentElement, 'loading')
  }
}

document.addEventListener('mousemove', (event) => {
  mouseTarget = event.target
})

searchInput.addEventListener('focus', async () => {
  addClassToElement(searchInput.parentElement, 'focused')

  if (productsCopy && productsCopy.length && searchInput.value) {
    removeNodesFromResults()
    addProductsToResults(productsCopy)
  } else if (searchInput.value) {
    removeNodesFromResults()
    addNoProductsWereFound()
  }

  if(controller && controller.signal) {
    await controller.abort('User focused input again, stopping request')
  }
})

searchInput.addEventListener('blur', () => {
  checkMouseTargetIsOnElements()
})

searchInput.addEventListener('input', async () => {
  clearInterval(inputInterval)
  checkDisplayClearButton()

  if(controller && controller.signal) {
    await controller.abort('User started to type again, stopping request')
  }

  inputInterval = setInterval(() => {
    fetchData()
  }, 300);
})

searchInput.addEventListener('keyup', (event) => {
  if (event.key === "Enter") {
    fetchData()
  }
})

searchSubmitButton.addEventListener('click', async () => {
  if(controller && controller.signal) {
    await controller.abort('User clicked submit search button, stopping request')
  }

  if(!searchInput.value) {
    searchInput.focus()
  } else {
    fetchData()
  }
})

document.addEventListener('click', (event) => {
  const allowedElements = [...document.querySelector('.search').querySelectorAll('*')]
  
  if (!allowedElements || !allowedElements.find((element) => element === event.target)) {
    removeNodesFromResults()

    if (!searchInput.value) {
      removeClassFromElement(searchInput.parentElement, 'focused')
    }
  }
});

clearButton.addEventListener('click', async () => {
  searchInput.value = ''
  removeNodesFromResults()
  checkDisplayClearButton()
  if(controller && controller.signal) {
    await controller.abort('User cleared input, stopping request')
  }
  searchInput.focus()
})