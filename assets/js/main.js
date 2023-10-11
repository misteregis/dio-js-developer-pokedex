const spinner = `<div class="spinner-container"><div class="spinner"></div></div>`
const loadMoreButton = document.getElementById('loadMoreButton')
const pokemonList = document.getElementById('pokemonList')

const loader = `<div id="loader">${spinner}</div>`
const maxRecords = 151
let offset = 0

let running = false

/**
 * Converte para maiúscula o primeiro caractere de uma string
 * @param {string} str A string de entrada.
 * @author Misteregis <misteregis@gmail.com>
 * @copyright Copyright (c) 2023, Siger
 * @returns {string} A string resultante.
 */
const ucfirst = str => {
    let text = str.toLowerCase()

    return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
}

const calculatePercentage = (partialValue, totalValue) => (100 * partialValue) / totalValue

function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}">
            <span class="number">#${pokemon.number.toString().padStart(3, 0)}</span>
            <span class="name">${pokemon.name.ucfirst()}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type.ucfirst()}</li>`).join('')}
                </ol>

                <img src="${pokemon.image}" alt="${pokemon.name.ucfirst()}">
                <img class="shiny" src="${pokemon.imageShiny}" alt="${pokemon.name.ucfirst()}">
            </div>
        </li>
    `
}

function setStats(stat, total = 200) {
    const percentage = calculatePercentage(stat.value, total)

    return `<small style="opacity: .5;">${stat.name}</small>
        <small>${stat.value}</small>
        <div class="progress">
            <div class="progress-bar" style="width: ${percentage}%"></div>
        </div>`
}

function loadPokemonItems(offset, limit) {
    if (running) return

    running = true
    pokemonList.insertAdjacentHTML('afterend', spinner)

    if (document.body.clientHeight > window.innerHeight || window.innerHeight < document.body.scrollHeight)
        loadMoreButton.remove()

    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        document.querySelector('.content .spinner-container').remove()
        const newHtml = pokemons.map(convertPokemonToLi).join('')

        pokemonList.insertAdjacentHTML('beforeend', newHtml)

        running = false
    })
}

function load(first) {
    if (running) return

    const minRows = getMinRow()
    const limit = minRows * getNumCols()

    if (!first) offset += limit

    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset

        loadPokemonItems(offset, newLimit)

        window.removeEventListener('scroll', loadMore)
    } else {
        loadPokemonItems(offset, limit)
    }
}

function loadMore() {
    if (window.innerHeight + window.scrollY - 30 >= document.body.offsetHeight)
        load()
}

function getNumCols() {
    const gridContainer = document.getElementById('pokemonList')
    const computedStyles = window.getComputedStyle(gridContainer)
    const gridColumnTemplate = computedStyles.gridTemplateColumns
    const numCols = gridColumnTemplate.split(' ').length

    return numCols
}

function getRowWidth() {
    const gridContainer = document.getElementById('pokemonList')
    const computedStyles = window.getComputedStyle(gridContainer)
    const gridColumnTemplate = computedStyles.gridTemplateColumns
    const rowWidth = Number(gridColumnTemplate.split(' ').shift().replace(/\D/g, ''))

    return rowWidth
}

function getMinRow() {
    const minRow = Math.floor(window.innerHeight / getRowWidth())

    return minRow > 0 ? minRow : 1
}

loadMoreButton.addEventListener('click', load)

String.prototype.ucfirst = function () { return ucfirst(this) }

window.onload = () => {
    load(true)

    window.addEventListener('scroll', loadMore);
}

document.addEventListener('click', function(event) {
    const parent = document.getElementById('pokemonList')
    const element = event.target.closest('li.pokemon')

    if (event.target.classList.contains('pokemon-modal') || event.target.classList.contains('close'))
        document.body.classList.remove('info')

    if (event.target !== parent && parent.contains(event.target)) {
        const number = element.querySelector('.number').textContent
        const index = parseInt(number.replace(/\D/g, ''))
        const header = document.querySelector('.pokemon-header')
        const body = document.querySelector('.pokemon-body')
        const pokemon = pokeApi.pokemons.find(poker => poker.number === index)

        header.setAttribute('class', `pokemon-header ${pokemon.type}`)
        header.querySelector('.title').textContent = pokemon.name.ucfirst()
        header.querySelector('.types-list').innerHTML = pokemon.types.map((type) => `<div class="type ${type}">${type.ucfirst()}</div>`).join('')
        header.querySelector('small').textContent = number

        const stats = pokemon.stats.map((stat) => setStats(stat)).join('')

        body.innerHTML = `${stats}${setStats({
            value: pokemon.totalStats,
            name: 'Total'
        }, 780)}`

        const img = header.querySelector('img')

        img.alt = pokemon.name.ucfirst()
        img.src = pokemon.image

        document.body.classList.add('info')
    }
})
