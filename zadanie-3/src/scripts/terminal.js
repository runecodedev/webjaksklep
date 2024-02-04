const BUILT_IN_COMMANDS = {
  clear: {
    msg: "Cleared terminal.",
    hint: "This command will clear the terminal."
  },
  clearInitialDate:{
    msg: "Cleared initial date.",
    hint: "This command will clear the initial date value from local storage"
  },
  help: {
    msg: "List of available commands:",
    hint: "This command will get you all available commands."
  },
  quote: {
    msg: "Here is your quote:",
    hint: "This command will get you a random quote."
  },
  double: {
    msg: "Operation result:",
    hint: "This command will return doubled X value, try 'double 2'"
  }
}

const CUSTOM_COMMANDS = {
  hello: {
    msg: "Hello :)",
    hint: "This command will return welcoming message."
  },
  Bye: {
    msg: "Bye :)",
  },
  clear: {
    msg: "Clear will not be overrided",
  },
}

const terminalBody = document.querySelector('#terminal')
const terminalInput = document.querySelector('#terminal-input')
const terminalInputHints = document.querySelector('#terminal-input-hints')
const commandHistory = [];
let currentHistoryIndex = -1;

function getCombinedCommands(){
  // In this order to not override built in commands :) example 'clear'
  return { ...CUSTOM_COMMANDS, ...BUILT_IN_COMMANDS }
}

function appendWelcomeMessageNode(){
  const welcomeMessageNode = document.createElement('li')
  welcomeMessageNode.classList.add('terminal__item')
  welcomeMessageNode.innerText = `terminal: Welcome to the webjaksklep terminal, type 'help' and submit to get available commands.`

  terminalBody.appendChild(welcomeMessageNode)
}

function appendInitialDateNode(){
  const initialDate = localStorage.getItem('initialDate')

  if (!initialDate) {
    localStorage.setItem('initialDate', new Date().toUTCString())
    return
  }

  const initialDateNode = document.createElement('li')
  initialDateNode.classList.add('terminal__item')
  initialDateNode.innerText = `Last login: ${initialDate}`

  terminalBody.appendChild(initialDateNode)
}

function getUserCommandNode(command){
  const userCommandNode = document.createElement('li')
  userCommandNode.classList.add('terminal__item')
  userCommandNode.innerText = `you: ${command}`
  return userCommandNode
}

function getResponseCommandNode(command, additionalText){
  const responseNode = document.createElement('li')
  responseNode.classList.add('terminal__item')
  responseNode.innerText = `terminal: ${command.msg} ${additionalText || ''}`
  return responseNode
}

function getDoubleValue(number){
  return number * 2
}

function findCommand(key){
  return getCombinedCommands()[key] || undefined
}

function clearTerminal(){
  terminalBody.innerHTML = ''
}

function clearInitialDate(){
  localStorage.setItem('initialDate', '')
}

function getListOfAllCommandsNode(){
  const commands = Object.keys(getCombinedCommands())

  let prepareString = ''

  commands.forEach((command) => {
    prepareString += `'${command}' - ${getCombinedCommands()[command].hint || 'Find out what this command does :)'}\n\n`
  })
  
  const allCommandsNode = document.createElement('li')
  allCommandsNode.classList.add('terminal__item')
  allCommandsNode.innerText = prepareString

  return allCommandsNode
}

function handleHints(){
  terminalInputHints.innerHTML = ''

  if (!terminalInput.value) return

  const splittedCommand = terminalInput.value.split(' ')
  const firstWord = splittedCommand[0]
  const firstLetter = firstWord.split('')[0]
  const commandButtons = []
  const availableCommands = Object.keys(getCombinedCommands()).filter((key) => key.includes(firstWord) && key.split('')[0] === firstLetter)

  if (!availableCommands || !availableCommands.length) {
    const notAvailableText = document.createElement('span')
    notAvailableText.innerText = `No available commands containing '${terminalInput.value}'`

    terminalInputHints.appendChild(notAvailableText)
    return
  }

  availableCommands.forEach((command) => {
    const commandButton = document.createElement('button')
    commandButton.classList.add('terminal__input-hints-button')
    commandButton.innerText = command

    commandButton.addEventListener('click', async () => {
      terminalInput.value = command
      await responseFromCommand(terminalInput.value)
      terminalInput.value = ''
      handleHints()
      terminalBody.scrollTop = terminalBody.scrollHeight;
    })

    commandButtons.push(commandButton)
  })
  
  const availableText = document.createElement('span')
  availableText.innerText = `Available commands:`

  terminalInputHints.appendChild(availableText)

  commandButtons.forEach((button) => {
    terminalInputHints.appendChild(button)
  })
}

async function getRandomQuoteNode(){
  try {
    const response = await fetch('https://dummyjson.com/quotes/random')
      
    const { quote } = await response.json()

    if (!quote) {
      throw new Error('Random quote was not found on the server')
    }

    const randomQuoteNode = document.createElement('li')
    randomQuoteNode.classList.add('terminal__item')

    const qNode = document.createElement('q')
    const iNode = document.createElement('i')
    iNode.innerText = quote

    qNode.appendChild(iNode)
    randomQuoteNode.appendChild(qNode)

    return randomQuoteNode
  } catch (error) {
    const errorNode = document.createElement('li')
    errorNode.classList.add('terminal__item')
    errorNode.innerText = `${error}`

    return errorNode
  }
}

async function responseFromCommand(command){
  const splittedCommand = command.split(' ')
  const firstWord = splittedCommand[0]
  const findCommandObject = findCommand(firstWord)
  let additionalNode = null
  let additionalText = null

  if (!findCommandObject) {
    const notFoundNode = document.createElement('li')
    notFoundNode.classList.add('terminal__item')
    notFoundNode.innerText = `terminal: Command '${command}' not found, please type 'help' to see available commands.`
    terminalBody.appendChild(getUserCommandNode(command))
    terminalBody.appendChild(notFoundNode)
    return
  }

  switch (firstWord) {
    case 'clear':
      clearTerminal()
      break;
    case 'clearInitialDate':
      clearInitialDate()
      break;
    case 'help':
      additionalNode = getListOfAllCommandsNode()
      break;
    case 'quote':
      additionalNode = await getRandomQuoteNode()
      break;
    case 'double':
      const numberValue = Number(splittedCommand[1]);
  
      if(!splittedCommand[1]) {
        additionalText = "You need to provide number after 'double' command ex. 'double 3'."
        break;
      }

      if (numberValue && typeof numberValue === 'number' && isFinite(numberValue)) {
          additionalText = getDoubleValue(numberValue);
      } else {
          additionalText = `'${splittedCommand[1]}' is not a number`
      }
      break;
    default:
      break;
  }

  terminalBody.appendChild(getUserCommandNode(command))
  terminalBody.appendChild(getResponseCommandNode(findCommandObject, additionalText))

  if (additionalNode) {
    terminalBody.appendChild(additionalNode)
  }
}

terminalInput.addEventListener('keydown', async (event) => {
  switch (event.key) {
    case 'Enter':
      if (!terminalInput.value) return;
      commandHistory.unshift(terminalInput.value);
      currentHistoryIndex = -1;
      await responseFromCommand(terminalInput.value);
      terminalInput.value = '';
      terminalBody.scrollTop = terminalBody.scrollHeight;
      break;
    case 'ArrowUp':
      // without prevent default user was forced to type on the left side of last command
      event.preventDefault()
      if (currentHistoryIndex < commandHistory.length - 1) {
        currentHistoryIndex++;
        terminalInput.value = commandHistory[currentHistoryIndex];
      }
      break;
    case 'ArrowDown':
      if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        terminalInput.value = commandHistory[currentHistoryIndex];
      } else if (currentHistoryIndex === 0) {
        currentHistoryIndex = -1;
        terminalInput.value = '';
      }
      break;
    default:
      break;
  }
  handleHints()
});

terminalInput.addEventListener('input', () => {
  handleHints()
})

appendInitialDateNode()
appendWelcomeMessageNode()