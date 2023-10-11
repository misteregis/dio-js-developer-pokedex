
const pokeApi = {}

pokeApi.pokemons = []

const _replace = {
    "hp": "HP",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def"
}

async function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()

    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name
    pokemon.stats = pokeDetail.stats.flatMap(stats => {
        const name = _replace[stats.stat.name] || stats.stat.name.ucfirst()
        const stat = {
            value: stats.base_stat,
            name
        }

        pokemon.totalStats += stat.value

        return stat
    })

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    pokemon.image = pokeDetail.sprites.other.dream_world.front_default
    pokemon.imageShiny = pokeDetail.sprites.other.home.front_shiny
    pokemon.image = pokeDetail.sprites.other.home.front_default

    pokeApi.pokemons.push(pokemon)

    return pokemon
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon)
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails)
}
