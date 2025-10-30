// Clean consolidated script.js for PokeApi demo
// Contains: fetchData, sliding, Pokemons loop, child message handling, login/register, user card rendering

// Globals
let i = 1;
let pokeLoop = true;
let cardCounter = 0;
let fightButton;
let addTeamButton;
let groupCounter = 0;
let teamIds = [];

class Users {
    constructor(username, password, pokemonsExp) {
        this.username = username;
        this.password = password;
        this.pokemonsExp = pokemonsExp;
    }
}

// Demo in-memory data

let users = ['Administrator', 'Manager', 'Cleric', 'Scribe'];
let passwords = ['Password01', 'Password', 'Admin', 'P@ssword'];
let pokemons = [
    [[2, 364, 8], [18, 463, 9], [30, 634, 10]],
    [[6, 436, 9], [15, 643, 8], [34, 346, 8]],
    [[8, 722, 10], [27, 227, 6], [38, 272, 6]],
    [[12, 200, 5], [25, 1753, 12], [40, 1025, 10]]
];

const User1 = new Users(users[0], passwords[0], pokemons[0]);
const User2 = new Users(users[1], passwords[1], pokemons[1]);
const User3 = new Users(users[2], passwords[2], pokemons[2]);
const User4 = new Users(users[3], passwords[3], pokemons[3]);


// Entrypoint: if Index2.html, register child handlers; else start main page flows
if (window.location.href.includes('Index3.html')) {
    registerChildHandlers();
} else if ('Index2.html') {

    document.getElementById('loginButton').addEventListener('click', () => startButtonsOpen('loginButton'));
    document.getElementById('loginButton').addEventListener('mouseover', () => startButtonsOpen('loginButton'));
    document.getElementById('loginButton').addEventListener('mouseout', () => startButtonsClose('loginButton'));

    document.getElementById('fightButton').addEventListener('click', () => startButtonsOpen('fightButton'));
    document.getElementById('fightButton').addEventListener('mouseover', () => startButtonsOpen('fightButton'));
    document.getElementById('fightButton').addEventListener('mouseout', () => startButtonsClose('fightButton'));
    firstPokemons();
    Pokemons();
}


// Register message handlers for child window
function registerChildHandlers() {
    window.addEventListener('message', (ev) => {
        try { handleChildMessage(ev.data, ev); } catch (e) { console.error('message handler', e); }
    });
    try { if (window.opener) window.opener.postMessage({ type: 'child-ready' }, '*'); } catch (e) { }
}

// Handle messages from parent window
function handleChildMessage(msg) {
    if (!msg || !msg.type) return;
    if (msg.type === 'show-starters') return setStarterVisible(true);
    if (msg.type === 'hide-starters') return setStarterVisible(false);
    if (msg.type === 'userPokemons') {
        const arr = msg.data || [];
        if (typeof UserSide === 'function') return UserSide(arr);
        const container = document.getElementById('yourPokemons');
        if (!container) return;
        container.innerText = '';
        (async () => {
            for (const id of arr) {
                const p = document.createElement('p'); p.textContent = `Loading ${id}...`; container.appendChild(p);
                try { const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`); const d = await r.json(); p.textContent = `${d.name} (NO. ${d.id})`; } catch (e) { p.textContent = `Pokemon ${id} kunne ikke hentes`; }
            }
        })();
    }
}

// Show/hide starter Pokemon section
function setStarterVisible(show) {
    try {
        const el = document.getElementById('starter-Pokemon') || document.getElementById('starter-Pokemons');
        if (!el) return;
        if (show) { el.classList.remove('hidden'); el.style.display = ''; }
        else { el.classList.add('hidden'); el.style.display = 'none'; }
    } catch (e) { console.warn(e); }
}

// Sleep utility
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Load first 3 Pokemons into cards
async function firstPokemons() {
    do {
        try {
            const d = await fetchData(i);
            const b = i % 3 + 1;
            const el = (id) => document.getElementById(id);
            if (el(`${b}namePokemon`)) el(`${b}namePokemon`).innerText = d.name;
            if (el(`${b}idPokemon`)) el(`${b}idPokemon`).innerText = `NO. 00${d.id}`;
            if (el(`${b}HTPokemon`)) el(`${b}HTPokemon`).innerText = `HT: ${d.height}`;
            if (el(`${b}WTPokemon`)) el(`${b}WTPokemon`).innerText = `WT: ${d.weight} lbs.`;
            if (el(`${b}hpPokemon`)) el(`${b}hpPokemon`).innerText = `HP - ${d.stats[0].base_stat}`;
            if (el(`${b}attackPokemon`)) el(`${b}attackPokemon`).innerText = `Attack - ${d.stats[1].base_stat}`;
            if (el(`${b}defensePokemon`)) el(`${b}defensePokemon`).innerText = `Defense - ${d.stats[2].base_stat}`;
            if (el(`${b}specialAPokemon`)) el(`${b}specialAPokemon`).innerText = `special-Attack - ${d.stats[3].base_stat}`;
            if (el(`${b}specialDPokemon`)) el(`${b}specialDPokemon`).innerText = `special-Defense - ${d.stats[4].base_stat}`;
            if (el(`${b}speedPokemon`)) el(`${b}speedPokemon`).innerText = `Speed - ${d.stats[5].base_stat}`;
            if (d.types.length > 1) {
                if (el(`${b}typePokemon`)) el(`${b}typePokemon`).innerText = `type - ${d.types[0].type.name} / ${d.types[1].type.name}`;
                if (el(`${b}typeSymbol`)) el(`${b}typeSymbol`).src = await typeSymbol(d.types[0].type.name);
                if (el(`${b}2typeSymbol`)) {
                    el(`${b}2typeSymbol`).src = await typeSymbol(d.types[1].type.name);
                    el(`${b}2typeSymbol`).style.display = "block";
                }
            }
            else {
                if (el(`${b}typePokemon`)) el(`${b}typePokemon`).innerText = `type - ${d.types[0].type.name}`;
                if (el(`${b}typeSymbol`)) el(`${b}typeSymbol`).src = await typeSymbol(d.types[0].type.name);
            }


            const img = el(`${b}pokemonImage`); if (img) img.src = d.sprites.front_default || '';
        } catch (e) { console.error(e); }
        i++;
    } while (i <= 3);
}

// Slide and load next Pokemon card
async function sliding() {
    const row = document.getElementById("row");

    const pokeCard = document.createElement("div");
    pokeCard.classList.add("pokemoncard")
    makeCard(i, pokeCard);
    row.appendChild(pokeCard);

    let slide = i - 3;
    slide = slide * 33.333333333333333333333333333333334;
    if (i >= 27) {
        slide += 1.5;
        if (i >= 37) {
            slide += 1.5;
            if (i >= 47) {
                slide += 1;
                if (i >= 60) {
                    slide += 1.5;
                    if (i >= 75) {
                        slide += 1.5;
                        if (i >= 90) {
                            slide += 1.5;
                            if (i >= 105) {
                                slide += 1.5;
                            }
                        }
                    }
                }
            }
        }
    }

    row.style.transform = `translateX(-${slide}vw)`;
    pokeCard.style.display = "block";
    i++;
}

// Main Pokemon loading loop
async function Pokemons() { do { await sleep(5000); sliding(); } while (i < 1302 && pokeLoop); }

// Map Pokemon types to symbol URLs
async function typeSymbol(type) { const map = { bug: 'https://github.com/Lpopp30/ApiPokemon/blob/main/bug_type_symbol_galar_by_jormxdos_dffvl73-pre.png?raw=true', dark: 'https://github.com/Lpopp30/ApiPokemon/blob/main/darkness_type_symbol_tcg_by_jormxdos_dfgddck-fullview.png?raw=true', fire: 'https://github.com/Lpopp30/ApiPokemon/blob/main/fire_type_symbol_galar_by_jormxdos_dffvl1m-pre.png?raw=true', flying: 'https://github.com/Lpopp30/ApiPokemon/blob/main/flying_type_symbol_galar_by_jormxdos_dffvl6n-fullview.png?raw=true', grass: 'https://github.com/Lpopp30/ApiPokemon/blob/main/grass_type_symbol_tcg_by_jormxdos_dfgdda7-fullview.png?raw=true', poison: 'https://github.com/Lpopp30/ApiPokemon/blob/main/poison_type_lvl_0_by_jormxdos_dh8zwty-pre.png?raw=true' }; return map[type] || ''; }

// Open login panel
function openLogin() {
    const l = document.getElementById('login');
    if (l) l.style.display = 'block';
    const sb = document.getElementById('start-buttons');
    if (sb) sb.style.opacity = '0.3';
    const r = document.getElementById('row');
    if (r) r.style.opacity = '0.3'; pokeLoop = false;
}

// Close login panel
function closeLogin() {
    if (document.getElementById('login')) document.getElementById('login').style.display = 'none';
    if (document.getElementById('start-buttons')) document.getElementById('start-buttons').style.opacity = '1';
    if (document.getElementById('row')) document.getElementById('row').style.opacity = '1';
    pokeLoop = true;
    try {
        Pokemons();

    } catch (e) { }
}

// Handle login or registration
async function loginData(userName, passw0rd, action) {
    const username = userName.value.trim();
    const password = passw0rd.value;
    if (action === 'Login') {

        let index = users.indexOf(username)

        if (index !== -1) {
            if (passwords[index] === password) {

                const newWin = window.open('Index3.html', '_blank');
                let userPokemons = [];

                for (let a = 0; a < pokemons[index].length; a++) {
                    userPokemons.push(pokemons[index][a][0]);
                }

                try {
                    if (!userPokemons || userPokemons.length === 0) newWin && newWin.postMessage({ type: 'show-starters' }, '*');
                    else newWin && newWin.postMessage({ type: 'hide-starters' }, '*');
                } catch (e) { }
                if (!newWin) { alert('Popup blocked — allow popups'); return; }
                try { newWin.focus(); } catch (e) { }
                let called = false;
                function onLoad() {
                    
                    try {
                        
                        if (typeof newWin.UserSide === 'function') {
                            console.log(index);
                            newWin.UserSide(userPokemons, index);
                            called = true;
                        }
                    } catch (e) { console.error(e); } try { newWin.removeEventListener('load', onLoad); } catch (e) { }
                }
                try { newWin.addEventListener('load', onLoad); } catch (e) { }
                setTimeout(() => { if (!called) { try { newWin.postMessage({ type: 'userPokemons', data: userPokemons }, '*'); } catch (e) { console.error(e); } } }, 500);
            } else alert('Your password is incorrect.');
        } else alert('Your username is incorrect.');
    } else if (action === 'Register') {
        if (users.includes(username))
            alert('Username exists.');
        else if (username.length < 3)
            alert('Username must be 3+ chars');
        else if (password.length < 5)
            alert('Password must be 5+ chars');
        else {
            users.push(username);
            passwords.push(password);
            console.log();
            pokemons.push([]);
            alert('Registration successful!');
        }
    }
}

// Change button appearance on hover and click
function startButtonsOpen(button) {

    document.getElementById(button).src = 'https://github.com/Lpopp30/ApiPokemon/blob/main/diyg9dk-352e1c6d-1cf7-4d71-875b-276d08ab3b20.png?raw=true';
    document.getElementById(button).style.width = '7%';
    document.getElementById(button).style.paddingLeft = '30px';
    document.getElementById(button).style.paddingRight = '48px';
    if (button === 'loginButton') {
        document.getElementById('loginInBall').style.left = "265px";
        document.getElementById('loginInBall').style.display = "block";
    }

    if (button === 'fightButton') document.getElementById('fightInBall').style.display = "block";

}

// Reset button appearance
function startButtonsClose(button) {
    document.getElementById(button).src = 'https://github.com/Lpopp30/ApiPokemon/blob/main/original-dbe29920e290da99d214598ac9e2001f.jpg?raw=true';
    document.getElementById(button).style.width = '10%';
    document.getElementById(button).style.paddingLeft = '15px';
    document.getElementById(button).style.paddingRight = '15px';
    if (button === 'loginButton') document.getElementById('loginInBall').style.display = "none";

    if (button === 'fightButton') document.getElementById('fightInBall').style.display = "none";
}

// Fetch and render user's Pokemon card
async function fetchUserPokemon(pokemon, choose, placement) {
    let card = null;
    try {
        const d = await fetchData(pokemon);
        const row = document.getElementById('userRow');
        if (!row) return null;

        let levelUdenExp;

        if (!choose)
        {
            let exp;
            console.log(pokemons);
            console.log(placement);
            let index = pokemons[[placement]].flat().indexOf(pokemon) + 2;
            let flattenArray = pokemons[[placement]].flat()
            levelUdenExp = flattenArray[index];
            if (await expLevel(levelUdenExp, d.name) > 0) {
                exp = await expLevel(levelUdenExp, d.name, flattenArray[index - 1]);
            }
            console.log(exp);
        }

        card = document.createElement('div');
        card.classList.add('userPokemoncard');
        card.setAttribute('data-pokemon-id', String(pokemon));
        cardCounter += 1;
        card.id = `user-poke-${d.id}-${cardCounter}`;
        // Build card contents: image, title, id and stats
        await makeCard(pokemon, card, levelUdenExp);
        row.appendChild(card);
        if (choose) {
            card.addEventListener('click', () => chooseStarter(pokemon, d.name));

        }
        else card.addEventListener('click', (event) => chooseFighter(pokemon, event));





    } catch (e) { console.error(e); }
    return card;
}

// Render user's Pokemons on their side
async function UserSide(userPokemons, placement) {
    if (!userPokemons || userPokemons.length === 0) return setStarterVisible(true);
    setStarterVisible(false);
    for (const id of userPokemons) await fetchUserPokemon(id, false, placement);
}

// Fetch starter Pokemons from generation
async function fetchGeneration(gen) {
    try {
        const r = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
        if (!r.ok) throw new Error('fetch failed'); const d = await r.json();
        const starters = (d.pokemon_species || []).slice(0, 3);
        const ids = extractSpeciesIds(starters);
        for (const id of ids) fetchUserPokemon(id, true);
    } catch (e) { console.error(e); }
    setStarterVisible(false);
}

// Choose starter from starter page
async function chooseStarter(Id, name) {

    let exp;
    if (await expLevel(5, name) > 0) {
        exp = await expLevel(5, name);
    }

    console.log(exp);

    const starterCards = document.getElementsByClassName('userPokemoncard');
    for (let i = starterCards.length - 1; i >= 0; i--) {
        const card = starterCards[i];
        card.parentNode.removeChild(card);
    }

    pokemons.push([[Id, exp]]);
    console.log(pokemons.length);
    UserSide([Id],pokemons.length-1);
}

// Choose fighter from main page
async function chooseFighter(Id, event, name, user) {
    const choose = document.querySelector('.dropdown-content');

    // Clear old buttons if they exist
    choose.innerText = '';

    // Create Fight button
    const fightButton = document.createElement("button");
    fightButton.innerText = "Fight";
    fightButton.id = 'Fight' + Id;

    // Create Add to Team button
    const addTeamButton = document.createElement("button");
    addTeamButton.innerText = "Add to Team";
    addTeamButton.id = 'add' + Id;

    // Append both
    choose.appendChild(fightButton);
    choose.appendChild(addTeamButton);

    // Position dropdown near the click
    const x = event.clientX;
    const y = event.clientY;

    choose.style.left = `${x}px`;
    choose.style.top = `${y}px`;
    choose.style.display = "block";

    // Add button logic
    if (!teamIds.includes(Id)) {
        addTeamButton.addEventListener('click', () => {
            team(Id, 'add');
            choose.removeChild(addTeamButton);
        });

        fightButton.addEventListener('click', () => {
            fightOneOnOne(Id);
            choose.removeChild(fightButton);
        });
    }
}

// Extract species IDs from array of species objects
function extractSpeciesIds(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(s => {
        const u = s && s.url ? s.url : '';
        const m = u.match(/\/(\d+)\/?$/);
        return m ? Number(m[1]) : null;
    }).filter(n => n !== null);
}

// Create Pokemon card
async function makeCard(poke, card, level) {
    const heading = document.createElement("h3");
    heading.classList.add("heading")

    const pokecardh3 = document.createElement("span");
    pokecardh3.classList.add("PokeName")
    heading.appendChild(pokecardh3);

    const pokeCardHp = document.createElement("span");
    heading.appendChild(pokeCardHp);

    const pokeCardTypeSymbol = document.createElement("img");
    pokeCardTypeSymbol.setAttribute('alt', 'Symbol Image');
    pokeCardTypeSymbol.classList.add("types")
    heading.appendChild(pokeCardTypeSymbol);

    const pokeCardTypeSymbol2 = document.createElement("img");
    pokeCardTypeSymbol2.setAttribute('alt', 'Symbol Image');
    pokeCardTypeSymbol2.classList.add("types2")
    heading.appendChild(pokeCardTypeSymbol2);


    card.appendChild(heading);

    const pokeLevel = document.createElement("span");
    if (level) {

        pokeLevel.classList.add("levelStyle")
        card.appendChild(pokeLevel);
    }

    const pokeCardImg = document.createElement("img");
    pokeCardImg.setAttribute('alt', 'Pokemon Image');
    pokeCardImg.classList.add("sprites")
    card.appendChild(pokeCardImg);

    const infoBar = document.createElement("div");
    infoBar.classList.add("infoBar")

    const pokeCardId = document.createElement("span");
    infoBar.appendChild(pokeCardId);

    const pokeCardHT = document.createElement("span");
    infoBar.appendChild(pokeCardHT);

    const pokeCardWT = document.createElement("span");
    infoBar.appendChild(pokeCardWT);

    card.appendChild(infoBar);

    const pokeCardAttack = document.createElement("p");
    card.appendChild(pokeCardAttack);

    const pokeCardDefense = document.createElement("p");
    card.appendChild(pokeCardDefense);

    const pokeCardSpAttack = document.createElement("p");
    card.appendChild(pokeCardSpAttack);

    const pokeCardSpDefense = document.createElement("p");
    card.appendChild(pokeCardSpDefense);

    const pokeCardSpeed = document.createElement("p");
    card.appendChild(pokeCardSpeed);

    const pokeCardtype = document.createElement("p");
    card.appendChild(pokeCardtype);

    try {
        const data = await fetchData(poke);
        pokecardh3.innerText = `${data.name}`;
        if (level) pokeLevel.innerText = `Lvl: ${level}`;
        pokeCardHT.innerText = `  HT: ${data.height} `;
        pokeCardWT.innerText = `  WT: ${data.weight} lbs.`;
        pokeCardHp.innerText = `  HP - ${data.stats[0].base_stat}`;
        pokeCardAttack.innerText = `Attack - ${data.stats[1].base_stat}`;
        pokeCardDefense.innerText = `Defense - ${data.stats[2].base_stat}`;
        pokeCardSpAttack.innerText = `special-Attack - ${data.stats[3].base_stat}`;
        pokeCardSpDefense.innerText = `special-Defense - ${data.stats[4].base_stat}`;
        pokeCardSpeed.innerText = `Speed - ${data.stats[5].base_stat}`;
        let imageUrl = data.sprites.front_default;

        // Set the image source
        pokeCardImg.src = imageUrl;
        if (data.id <= 9) {
            pokeCardId.innerText = `NO. 00${data.id} `;
        }
        else if (10 <= data.id && data.id <= 99) {
            pokeCardId.innerText = `NO. 0${data.id} `;
        }
        else {
            pokeCardId.innerText = `NO. ${data.id} `;
        }

        if (data.types.length == 2) {
            pokeCardTypeSymbol2.style.display = "block";
            pokeCardtype.innerText = `Type - ${data.types[0].type.name} / ${data.types[1].type.name}`;
            pokeCardTypeSymbol.src = await typeSymbol(data.types[0].type.name, 0);
            pokeCardTypeSymbol2.src = await typeSymbol(data.types[1].type.name, 0);
            if (pokecardh3.innerText.length <= 8) {
                pokecardh3.style.paddingRight = "42%";
            }
            else if (pokecardh3.innerText.length <= 12) {
                pokecardh3.style.paddingRight = "42%";
            }
        }
        else {
            pokeCardtype.innerText = `Type - ${data.types[0].type.name}`;
            pokeCardTypeSymbol.src = await typeSymbol(data.types[0].type.name, 0);
            if (data.types[1]) {
                const typeImg2 = document.createElement('img');
                const src2 = await typeSymbol(data.types[1].type.name);
                typeImg2.src = src2;
                typeImg2.classList.add('types2');
                typeImg2.alt = data.types[1].type.name;
                c.appendChild(typeImg2);
            }
            if (pokecardh3.innerText.length <= 8) {

                pokecardh3.style.paddingRight = "49%";
            }
            else if (pokecardh3.innerText.length <= 9) {
                pokecardh3.style.paddingRight = "44%";
            }
            else {
                pokecardh3.style.paddingRight = "40%";
            }
        }
    }
    catch (e) { console.log(e) }
}

// Fetch data from PokeAPI
async function fetchData(pokemon) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        if (!res.ok) throw new Error('fetch failed');
        return await res.json();
    }
    catch (e) {
        console.error(e);
        return null;
    }
}

// Team management function
async function team(Id, choose) {


    const teamPlace = document.getElementsByClassName('team')[0];
    const teamMember = document.createElement('p');
    teamMember.id = Id;

    if (choose == "add" && !teamIds.includes(Id)) {
        groupCounter++;
        teamIds.push(Id);

        const data = await fetchData(Id)

        const deleteMember = document.createElement('button');
        deleteMember.innerText = "X";
        deleteMember.classList.add("deleteMember")
        deleteMember.addEventListener('click', () => team(Id, 'delete'));
        teamMember.appendChild(deleteMember);

        const teamMemberName = document.createElement('p');
        teamMemberName.innerText = `${data.name}`;
        teamMember.appendChild(teamMemberName);

        const Img = document.createElement("img");
        Img.setAttribute('alt', 'Pokemon Image');
        Img.classList.add("sprites")
        let ImageUrl = data.sprites.front_default;
        Img.src = ImageUrl;
        teamMember.appendChild(Img);

        const teamMemberId = document.createElement('p');
        teamMemberId.innerText = `NO. ${Id}`;
        teamMember.appendChild(teamMemberId);

        teamMember.style.marginTop = "-15px";

        if (teamPlace) teamPlace.appendChild(teamMember);
        console.log(document.getElementsByClassName('teamFightButton')[0]);
        if (groupCounter > 0) document.getElementsByClassName('teamFightButton')[0].style.display = 'block';
    }

    else if (choose == "delete") {


        await Promise.resolve(); // allow any pending pushes to finish

        const member = document.getElementById(Id);

        if (member && teamPlace.contains(member)) {
            teamPlace.removeChild(member);

        }

        const index = teamIds.indexOf(Id);
        if (index !== -1) {
            let a = teamIds.splice(index, 1);
            groupCounter--;
            if (groupCounter < 1) document.getElementsByClassName('teamFightButton')[0].style.display = 'none';
            return teamIds, groupCounter;
        }
    }
}

// One-on-one fight function
async function fightOneOnOne(Id) {
    const data = await fetchData(Id);

    const typeChart = {
        bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5 },
        dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
        dragon: { dragon: 2, steel: 0.5 },
        electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
        fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
        fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, ghost: 0 },
        fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
        flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
        ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
        grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
        ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
        ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
        normal: { rock: 0.5, ghost: 0, steel: 0.5 },
        poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
        psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
        rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
        steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5 },
        water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    };

    expFight(142, 50, 50, 1);
}

// Experience calculation function to next level
async function expLevel(level, name, exp) {
    const fast = [
        'aipom', 'alomomola', 'ambipom', 'ariados', 'audino', 'azumarill', 'azurill',
        'banette', 'blissey', 'boltund',
        'chansey', 'chimecho', 'chingling', 'cinccino', 'clefable', 'clefairy', 'cleffa', 'comfey', 'corsola', 'cursola',
        'delcatty', 'delibird', 'dusclops', 'dusknoir', 'duskull',
        'glameow', 'granbull', 'grumpig',
        'happiny',
        'igglybuff', 'indeedee',
        'jigglypuff',
        'klefki',
        'ledian', 'ledyba', 'lunatone', 'luvdisc',
        'marill', 'maushold', 'mawile', 'minccino', 'misdreavus', 'mismagius', 'munna', 'musharna',
        'nickit',
        'purugly', 'pyukumuku',
        'rabsca', 'rellor',
        'shuppet', 'skitty', 'smeargle', 'snubbull', 'solrock', 'spinarak', 'spinda', 'spoink',
        'tandemaus', 'thievul', 'togekiss', 'togepi', 'togetic',
        'veluza',
        'wigglytuff', 'wishiwashi',
        'yamper'
    ];

    const slow = [
        'abomasnow', 'aerodactyl', 'aggron', 'arcanine', 'arceus', 'arctibax', 'arctovish', 'arctozolt', 'armarouge', 'aron', 'arrokuda', 'articuno', 'axew', 'azelf',
        'bagon', 'barraskewda', 'baxcalibur', 'beldum', 'blacephalon', 'bombirdier', 'braviary', 'brute bonnet', 'buzzwole',
        'calyrex', 'carbink', 'carnivine', 'carvanha', 'celesteela', 'ceruledge', 'charcadet', 'chi-yu', 'chien-pao', 'chinchou', 'clauncher', 'clawitzer', 'cloyster', 'cobalion', 'cosmoem', 'cosmog', 'cresselia',
        'darkrai', 'deino', 'deoxys', 'dialga', 'diancie', 'dondozo', 'dracovish', 'dracozolt', 'dragapult', 'dragonair', 'dragonite', 'drakloak', 'drapion', 'dratini', 'dreepy',
        'eelektrik', 'eelektross', 'eiscue', 'electrike', 'enamorus', 'entei', 'eternatus', 'exeggcute', 'exeggutor',
        'fezandipiti', 'finizen', 'flutter mane', 'fraxure', 'frigibax',
        'gabite', 'gallade', 'garchomp', 'gardevoir', 'genesect', 'gholdengo', 'gible', 'gimmighoul', 'giratina', 'glastrier', 'goodra', 'goomy', 'gouging fire', 'great tusk', 'groudon', 'growlithe', 'guzzlord', 'gyarados',
        'hakamo-o', 'hatenna', 'hatterene', 'hattrem', 'haxorus', 'heatran', 'heracross', 'hippopotas', 'hippowdon', 'ho-oh', 'hoopa', 'houndoom', 'houndour', 'hydreigon',
        'iron boulder', 'iron bundle', 'iron crown', 'iron hands', 'iron jugulis', 'iron leaves', 'iron moth', 'iron thorns', 'iron treads', 'iron valiant',
        'jangmo-o', 'jirachi',
        'kartana', 'keldeo', 'kirlia', 'komala', 'kommo-o', 'koraidon', 'kubfu', 'kyogre', 'kyurem',
        'lairon', 'landorus', 'lanturn', 'lapras', 'larvesta', 'larvitar', 'latias', 'latios', 'lugia', 'lunala',
        'magearna', 'magikarp', 'mamoswine', 'manaphy', 'mandibuzz', 'manectric', 'mantine', 'mantyke', 'marshadow', 'melmetal', 'meloetta', 'meltan', 'mesprit', 'metagross', 'metang', 'mewtwo', 'miltank', 'miraidon', 'moltres', 'munchlax', 'munkidori',
        'naganadel', 'necrozma', 'nihilego',
        'ogerpon', 'okidogi', 'oranguru', 'orthworm',
        'palafin', 'palkia', 'passimian', 'pecharunt', 'pheromosa', 'phione', 'piloswine', 'pinsir', 'poipole', 'pupitar',
        'raging bolt', 'raikou', 'ralts', 'rayquaza', 'regice', 'regidrago', 'regieleki', 'regigigas', 'regirock', 'registeel', 'relicanth', 'reshiram', 'rhydon', 'rhyhorn', 'rhyperior', 'roaring moon', 'rufflet',
        'salamence', 'sandy shocks', 'scream tail', 'sharpedo', 'shelgon', 'shellder', 'silvally', 'skarmory', 'skorupi', 'slaking', 'slakoth', 'sliggoo', 'slither wing', 'snorlax', 'snover', 'solgaleo', 'spectrier', 'stakataka', 'stantler', 'starmie', 'staryu', 'stonjourner', 'suicune', 'swinub',
        'tapu bulu', 'tapu fini', 'tapu koko', 'tapu lele', 'tauros', 'tentacool', 'tentacruel', 'terapagos', 'terrakion', 'thundurus', 'ting-lu', 'tornadus', 'tropius', 'tynamo', 'type: null', 'tyranitar',
        'urshifu', 'uxie',
        'vanillish', 'vanillite', 'vanilluxe', 'victini', 'vigoroth', 'virizion', 'volcanion', 'volcarona', 'vullaby',
        'walking wake', 'wo-chien', 'wyrdeer',
        'xerneas', 'xurkitree',
        'yveltal',
        'zacian', 'zamazenta', 'zapdos', 'zarude', 'zekrom', 'zeraora', 'zweilous'

    ];


    const mediumFast = [
        'accelgor', 'aegislash', 'alcremie', 'amaura', 'amoonguss', 'annihilape', 'araquanid', 'arbok', 'archaludon', 'archen', 'archeops', 'aromatisse', 'aurorus', 'avalugg',
        'baltoy', 'barbaracle', 'barboach', 'basculegion', 'basculin', 'beartic', 'beautifly', 'beedrill', 'beheeyem', 'bellibolt', 'bergmite', 'bewear', 'bibarel', 'bidoof', 'binacle', 'bisharp', 'blipbug', 'blitzle', 'bonsly', 'bouffalant', 'brambleghast', 'bramblin', 'bronzong', 'bronzor', 'bruxish', 'buizel', 'buneary', 'bunnelby', 'burmy', 'butterfree',
        'camerupt', 'capsakid', 'carracosta', 'cascoon', 'castform', 'caterpie', 'centiskorch', 'charjabug', 'cherrim', 'cherubi', 'chewtle', 'claydol', 'clodsire', 'cofagrigus', 'copperajah', 'cottonee', 'crabominable', 'crabrawler', 'cramorant', 'croagunk', 'crobat', 'crustle', 'cryogonal', 'cubchoo', 'cubone', 'cufant', 'cutiefly',
        'dedenne', 'deerling', 'dew gong', 'dewpider', 'dhelmise', 'diggersby', 'diglett', 'ditto', 'dodrio', 'doduo', 'donphan', 'dottler', 'doublade', 'dragalge', 'drampa', 'drednaw', 'drilbur', 'drowzee', 'druddigon', 'dubwool', 'ducklett', 'dudunsparce', 'dugtrio', 'dunsparce', 'duraludon', 'durant', 'dustox', 'dwebble',
        'eevee', 'ekans', 'eldegoss', 'electabuzz', 'electivire', 'electrode', 'elekid', 'elgyem', 'emolga', 'escavalier', 'espeon', 'espurr', 'excadrill',
        'falinks', 'farfetchd', 'farigiraf', 'fearow', 'ferroseed', 'ferrothorn', 'flabébé', 'flareon', 'floatzel', 'floette', 'florges', 'fomantis', 'foongus', 'forretress', 'frillish', 'froslass', 'frosmoth', 'furfrou', 'furret',
        'galvantula', 'garbodor', 'gastrodon', 'girafarig', 'glaceon', 'glalie', 'gogoat', 'golbat', 'goldeen', 'golduck', 'golett', 'golisopod', 'golurk', 'gossifleur', 'gourgeist', 'greedent', 'grimer', 'grimmsnarl', 'grubbin', 'gumshoos',
        'hawlucha', 'heatmor', 'heliolisk', 'helioptile', 'hitmonchan', 'hitmonlee', 'hitmontop', 'honedge', 'hoothoot', 'horsea', 'hypno',
        'impidimp', 'inkay',
        'jellicent', 'jolteon', 'joltik', 'jynx',
        'kabuto', 'kabutops', 'kakuna', 'kangaskhan', 'karrablast', 'kingambit', 'kingdra', 'kingler', 'klawf', 'kleavor', 'koffing', 'krabby',
        'leafeon', 'lechonk', 'lickilicky', 'lickitung', 'liepard', 'lilligant', 'linoone', 'lokix', 'lopunny', 'lurantis', 'lycanroc',
        'magby', 'magcargo', 'magmar', 'magmortar', 'magnemite', 'magneton', 'magnezone', 'malamar', 'mankey', 'maractus', 'mareanie', 'marowak', 'masquerain', 'medicham', 'meditite', 'meowstic', 'meowth', 'metapod', 'mightyena', 'milcery', 'mime jr.', 'mimikyu', 'minun', 'morelull', 'morgrem', 'morpeko', 'mothim', 'mr. mime', 'mr. rime', 'mudbray', 'mudsdale', 'muk',
        'natu', 'ninetales', 'noctowl', 'noibat', 'noivern', 'nosepass', 'numel', 'nymble',
        'obstagoon', 'octillery', 'oinkologne', 'omanyte', 'omastar', 'onix', 'orbeetle', 'oricorio', 'overqwil',
        'pachirisu', 'palossand', 'pancham', 'pangoro', 'panpour', 'pansage', 'pansear', 'paras', 'parasect', 'patrat', 'pawmi', 'pawmo', 'pawmot', 'pawniard', 'pelipper', 'perrserker', 'persian', 'petilil', 'phanpy', 'phantump', 'pichu', 'pikachu', 'pikipek', 'pincurchin', 'pineco', 'plusle', 'poltchageist', 'polteageist', 'ponyta', 'poochyena', 'porygon', 'porygon-z', 'porygon2', 'primeape', 'probopass', 'psyduck', 'pumpkaboo', 'purrloin',
        'quagsire', 'qwilfish',
        'raichu', 'rapidash', 'raticate', 'rattata', 'remoraid', 'revavroom', 'ribombee', 'rockruff', 'rotom', 'runerigus',
        'salandit', 'salazzle', 'sandaconda', 'sandshrew', 'sandslash', 'sandygast', 'sawk', 'sawsbuck', 'scatterbug', 'scizor', 'scovillain', 'scrafty', 'scraggy', 'scyther', 'seadra', 'seaking', 'seel', 'sentret', 'shellos', 'shelmet', 'shiinotic', 'sigilyph', 'silcoon', 'silicobra', 'simipour', 'simisage', 'simisear', 'sinistcha', 'sinistea', 'sirfetch\'d', 'sizzlipede', 'skiddo', 'skrelp', 'skuntank', 'skwovet', 'slowbro', 'slowking', 'slowpoke', 'slugma', 'slurpuff', 'smoochum', 'snom', 'snorunt', 'spearow', 'spewpa', 'spiritomb', 'spritzee', 'steelix', 'stufful', 'stunfisk', 'stunky', 'sudowoodo', 'surskit', 'swanna', 'swirlix', 'swoobat', 'sylveon',
        'tadbulb', 'tangela', 'tangrowth', 'teddiursa', 'throh', 'tirtouga', 'togedemaru', 'torkoal', 'toucannon', 'toxapex', 'toxicroak', 'trevenant', 'trubbish', 'trumbeak', 'turtonator', 'tyrantrum', 'tyrogue', 'tyrunt',
        'umbreon', 'unown', 'ursaluna', 'ursaring',
        'vaporeon', 'varoom', 'venomoth', 'venonat', 'vikavolt', 'vivillon', 'voltorb', 'vulpix',
        'watchog', 'weedle', 'weezing', 'whimsicott', 'whiscash', 'wiglett', 'wimpod', 'wingull', 'wobbuffet', 'woobat', 'wooloo', 'wooper', 'wormadam', 'wugtrio', 'wurmple', 'wynaut',
        'xatu',
        'yamask', 'yanma', 'yanmega', 'yungoos',
        'zebstrika', 'zigzagoon', 'zubat'

    ];


    const mediumSlow = [
        'abra', 'absol', 'alakazam', 'ampharos', 'arboliva',
        'bayleef', 'bellossom', 'bellsprout', 'blastoise', 'blaziken', 'boldore', 'bounsweet', 'braixen', 'brionne', 'budew', 'bulbasaur',
        'cacnea', 'cacturne', 'carkol', 'celebi', 'cetitan', 'cetoddle', 'chandelure', 'charizard', 'charmander', 'charmeleon', 'chatot', 'chesnaught', 'chespin', 'chikorita', 'chimchar', 'cinderace', 'clobbopus', 'coalossal', 'combee', 'combusken', 'conkeldurr', 'corviknight', 'corvisquire', 'crocalor', 'croconaw', 'cyclizar', 'cyndaquil',
        'dachsbun', 'darmanitan', 'dartrix', 'darumaka', 'decidueye', 'delphox', 'dewott', 'dolliv', 'drizzile', 'duosion',
        'emboar', 'empoleon', 'espathra', 'exploud',
        'fennekin', 'feraligatr', 'fidough', 'flaaffy', 'flamigo', 'fletchinder', 'fletchling', 'flittle', 'floragato', 'flygon', 'froakie', 'frogadier', 'fuecoco',
        'garganacl', 'gastly', 'gengar', 'geodude', 'gigalith', 'gligar', 'glimmet', 'glimmora', 'gliscor', 'gloom', 'golem', 'gothita', 'gothitelle', 'gothorita', 'grafaiai', 'grapploct', 'graveler', 'greavard', 'greninja', 'grookey', 'grotle', 'grovyle', 'gurdurr',
        'haunter', 'herdier', 'honchkrow', 'hoppip', 'houndstone',
        'incineroar', 'infernape', 'inteleon', 'ivysaur',
        'jumpluff',
        'kadabra', 'kecleon', 'kilowattrel', 'klang', 'klink', 'klinklang', 'kricketot', 'kricketune', 'krokorok', 'krookodile',
        'lampent', 'leavanny', 'lillipup', 'litleo', 'litten', 'litwick', 'lombre', 'lotad', 'loudred', 'lucario', 'ludicolo', 'luxio', 'luxray',
        'mabosstiff', 'machamp', 'machoke', 'machop', 'mareep', 'marshtomp', 'maschiff', 'meganium', 'meowscarada', 'mew', 'mienfoo', 'mienshao', 'minior', 'monferno', 'mudkip', 'murkrow',
        'nacli', 'naclstack', 'nidoking', 'nidoqueen', 'nidoran♀', 'nidoran♂', 'nidorina', 'nidorino', 'nuzleaf',
        'oddish', 'oshawott',
        'palpitoad', 'pidgeot', 'pidgeotto', 'pidgey', 'pidove', 'pignite', 'piplup', 'politoed', 'poliwag', 'poliwhirl', 'poliwrath', 'popplio', 'primarina', 'prinplup', 'pyroar',
        'quaquaval', 'quaxly', 'quaxwell', 'quilava', 'quilladin',
        'raboot', 'reuniclus', 'rillaboom', 'riolu', 'roggenrola', 'rolycoly', 'rookidee', 'roselia', 'roserade', 'rowlet',
        'sableye', 'samurott', 'sandile', 'sceptile', 'scolipede', 'scorbunny', 'sealeo', 'seedot', 'seismitoad', 'serperior', 'servine', 'sewaddle', 'shaymin', 'shiftry', 'shinx', 'shroodle', 'shuckle', 'skeledirge', 'skiploom', 'smoliv', 'sneasel', 'sneasler', 'snivy', 'sobble', 'solosis', 'spheal', 'sprigatito', 'squirtle', 'staraptor', 'staravia', 'starly', 'steenee', 'stoutland', 'sunflora', 'sunkern', 'swadloon', 'swampert', 'swellow',
        'taillow', 'talonflame', 'tatsugiri', 'tepig', 'thwackey', 'timburr', 'tinkatink', 'tinkaton', 'tinkatuff', 'toedscool', 'toedscruel', 'torchic', 'torracat', 'torterra', 'totodile', 'toxel', 'toxtricity', 'tranquill', 'trapinch', 'treecko', 'tsareena', 'turtwig', 'tympole', 'typhlosion',
        'unfezant',
        'venipede', 'venusaur', 'vespiquen', 'vibrava', 'victreebel', 'vileplume',
        'walrein', 'wartortle', 'wattrel', 'weavile', 'weepinbell', 'whirlipede', 'whismur',
        'zoroark', 'zorua'

    ];


    const erratic = ['altaria', 'anorith', 'appletun', 'applin', 'armaldo', 'bastiodon', 'clamperl', 'cradily', 'cranidos', 'dipplin', 'feebas', 'finneon', 'flapple', 'grebyss', 'huntail', 'hydrapple', 'lileep', 'lumineon', 'milotic', 'nincada', 'ninjask', 'rampardos', 'shedinja', 'shieldon', 'spidops', 'squawkabilly', 'swablu', 'tarountula', 'volbeat', 'zangoose'];

    const fluctuating = ['breloom', 'corphish', 'crawdaunt', 'drifblim', 'drifloon', 'gulpin', 'hariyama', 'illumise', 'makuhita', 'seviper', 'shroomish', 'swalot', 'wailmer', 'wailord'];

    if (exp) level++;

    let curve;

    if (fast.includes(name)) curve = 'fast';

    else if (slow.includes(name)) curve = 'slow';

    else if (mediumFast.includes(name)) curve = 'mediumFast';

    else if (mediumSlow.includes(name)) curve = 'mediumSlow';

    else if (erratic.includes(name)) curve = 'erratic';

    else if (fluctuating.includes(name)) curve = 'fluctuating';


    const curvesLevel = {
        fast: function (n) {
            return Math.floor(Math.pow(n, 3) * 4 / 5);
        },
        slow: function (n) {
            return Math.floor(Math.pow(n, 3) * 5 / 4);
        },
        mediumFast: function (n) {
            return Math.pow(n, 3);
        },
        mediumSlow: function (n) {
            return Math.floor(Math.pow(n, 3) * 6 / 5 - Math.pow(n, 2) * 15 + n * 100 - 140);
        },
        erratic: function (n) {
            if (n < 50) {
                return Math.floor(Math.pow(n, 3) * (100 - n) / 50);
            } else if (50 <= n && n <= 68) {
                return Math.floor(Math.pow(n, 3) * (150 - n) / 100);
            } else if (68 < n && n < 98) {
                return Math.floor(Math.pow(n, 3) * (1911 - n * 10) / 1500);
            }
            return Math.floor(Math.pow(n, 3) * (160 - n) / 100);
        },
        fluctuating: function (n) {
            if (n < 15) {
                return Math.floor(Math.pow(n, 3) * (73 + n) / 150);
            } else if (15 <= n && n < 36) {
                return Math.floor(Math.pow(n, 3) * (14 + n) / 50);
            }
            return Math.floor(Math.pow(n, 3) * (64 + n) / 100);
        }
    }

    let expNeed = curvesLevel[curve](level);


    if (exp < expNeed) {
        console.log('Level:', level - 1, 'Next Level', level);
        console.log('Exp right now', exp, 'needed Exp', expNeed - exp);
    }
    else if (exp > expNeed) {
        level = +1;
        expLevel(level, name, exp);
    }
    else if (exp == expNeed) {
        level = +1;
        expLevel(level, name, exp);
    }
    else {
        return expNeed;
    }

}


// Experience calculation function after battle
async function expFight(b, L, Lp, s, placement) {
    // b is the base experience yield of the fainted Pokémon's species; values for the current Generation are listed here
    b;
    // L is the level of the fainted Pokémon
    L;
    //Lp is the level of the victorious Pokémon
    Lp;
    // s is the number of Pokémon that participated in defeating the opponent Pokémon
    s;

    math = ((b * L) / 5) * (1 / s) * (((Math.sqrt(2 * L + 10)) * Math.pow(2 * L + 10, 2)) / (Math.sqrt(L + Lp + 10) * Math.pow(2 * L + 10, 2))) + 1;

    let exp = pokemons[[placement]] + math;
    pokemons[[placement]].push(exp);

}


async function teamFight() {
}