import { checkWidth } from "../helpers/check-width.js"

const navigation = document.querySelector('#navigation')
const openButton = document.querySelector('#open-navigation-button')
const closeButton = document.querySelector('#close-navigation-button')
const linksWithSubmenu = document.querySelectorAll('.navigation__menu-link.arrow')
let mouseTarget
let submenuInterval

function hideSubmenus() {
  linksWithSubmenu.forEach((element) => {
    element.classList.remove('active')
    element.nextElementSibling.classList.remove('active')
  })
}

function toggleMenu() {
  navigation.classList.toggle('open')
  hideSubmenus()
}

function closeMenu() {
  navigation.classList.remove('open')
  hideSubmenus()
}

linksWithSubmenu.forEach((element) => {
  element.addEventListener('mouseover', () => {
    if (navigator.maxTouchPoints > 0) return
    hideSubmenus()
    element.classList.add('active')
    element.nextElementSibling.classList.add('active')

    clearInterval(submenuInterval)
    submenuInterval = setInterval(() => {
      const allowedElements = [...document.querySelector('.header').querySelectorAll('*')]

      if (!allowedElements || !allowedElements.find((element) => element === mouseTarget)) {
        clearInterval(submenuInterval)
        hideSubmenus()
      }
    }, 1000)
  })
  element.addEventListener('click', () => {
    if (element.classList.contains('active')) {
      hideSubmenus()
    } else {
      hideSubmenus()
      element.classList.add('active')
      element.nextElementSibling.classList.add('active')
    }
    
  })
})

document.addEventListener('click', (event) => {
  const allowedElements = [...document.querySelector('.header').querySelectorAll('*')]

  if (!allowedElements || !allowedElements.find((element) => element === event.target)) {
    hideSubmenus()
  }
});

document.addEventListener('mousemove', (event) => {
  if (!submenuInterval) return
  mouseTarget = event.target
})

window.addEventListener('resize', () => {
  if (checkWidth(992)){
    clearInterval(submenuInterval)
    hideSubmenus()
  }
  closeMenu()
})

openButton.addEventListener('click', () => {
  toggleMenu()
})
closeButton.addEventListener('click', () => {
  toggleMenu()
})