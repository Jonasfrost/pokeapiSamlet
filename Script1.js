// Clean consolidated script.js for PokeApi demo
// Contains: fetchData, sliding, Pokemons loop, child message handling, login/register, user card rendering

// Globals
// ------------------ UTILITY FUNCTIONS ------------------ \\
let newStat = 0;
let attackMultiplier = 1;
let defenseMultiplier = 1;
let i = 1;
let pokeLoop = true;
let cardCounter = 0;
let fightButton;
let addTeamButton;
let groupCounter = 0;
let teamIds = [];

class Users {
    constructor(username, password, pokemonAndExp) {
        this.username = username;
        this.password = password;
        this.pokemonAndExp = pokemonAndExp;
    }
}

//data
let users = ['Administrator', 'Manager', 'Cleric', 'Scribe'];
let passwords = ['Password01', 'Password', 'Admin', 'P@ssword'];
let pokemons = [
    [[2, 364, 8], [18, 463, 9], [30, 634, 10]],
    [[6, 436, 9], [15, 643, 8], [34, 346, 8]],
    [[8, 722, 10], [27, 227, 6], [38, 272, 8]],
    [[12, 200, 5], [25, 1753, 12], [40, 1025, 10]]
];

const User1 = new Users(users[0], passwords[0], pokemons[0]);
const User2 = new Users(users[1], passwords[1], pokemons[1]);
const User3 = new Users(users[2], passwords[2], pokemons[2]);
const User4 = new Users(users[3], passwords[3], pokemons[3]);


// Entrypoint: if Index2.html, register child handlers; else start main page flows
if (window.location.href.includes('index3.html')) {
    registerChildHandlers();
} else if (window.location.href.includes('index2.html')) {

    document.getElementById('loginButton').addEventListener('click', () => startButtonsOpen('loginButton'));
    document.getElementById('loginButton').addEventListener('mouseover', () => startButtonsOpen('loginButton'));
    document.getElementById('loginButton').addEventListener('mouseout', () => startButtonsClose('loginButton'));

    document.getElementById('fightButton').addEventListener('click', () => startButtonsOpen('fightButton'));
    document.getElementById('fightButton').addEventListener('mouseover', () => startButtonsOpen('fightButton'));
    document.getElementById('fightButton').addEventListener('mouseout', () => startButtonsClose('fightButton'));
    firstPokemons();
    Pokemons();
}
else {
    document.getElementById('pokemonSprite1').addEventListener('mouseover', () => function () { document.getElementsById('battle-stats').style.display = "block"; });

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
    slide = slide * 33.33333333333333333333333333333344;
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
async function typeSymbol(type) {
    let typesymbol = `https://raw.githubusercontent.com/waydelyle/pokemon-assets/2386d4308f6995d9539a5c15c1256c22025385e4/assets/svg/types/${type}.svg`

    return typesymbol || '';
}


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

                const newWin = window.open('index3.html', '_blank');
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

        if (!choose) {
            let exp;
            let index = pokemons[[placement]].flat().indexOf(pokemon) + 2;
            let flattenArray = pokemons[[placement]].flat()
            levelUdenExp = flattenArray[index];
            if (await expLevel(levelUdenExp, d.name) > 0) {
                exp = await expLevel(levelUdenExp, d.name, flattenArray[index - 1]);
            }

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


    const starterCards = document.getElementsByClassName('userPokemoncard');
    for (let i = starterCards.length - 1; i >= 0; i--) {
        const card = starterCards[i];
        card.parentNode.removeChild(card);
    }

    pokemons.push([[Id, exp, 5]]);

    UserSide([Id], pokemons.length - 1);
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



    UserTeam();


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

// Enemy level determination function
async function enemyLvlFunction(levelArray) {

    let enemylvl;


    const highestLvl = Math.max(...levelArray);
    const lowestLvl = Math.min(...levelArray);
    enemylvl = Math.floor(Math.random() * (highestLvl - lowestLvl + 1)) + lowestLvl;
    console.log(enemylvl, "enemylvl");



    console.log(levelArray);
    console.log(Math.max(...levelArray));
    console.log(Math.min(...levelArray));




    console.log(lowestLvl);
    console.log(highestLvl);

    console.log(enemylvl);
    return enemylvl;
}

// Experience calculation function after battle
async function expFight(b, L, Lp, s, id) {
    // b is the base experience yield of the fainted Pokémon's species;
    b;
    // L is the level of the fainted Pokémon
    L;
    //Lp is the level of the victorious Pokémon
    Lp;
    // s is the number of Pokémon that participated in defeating the opponent Pokémon
    s;

    math = ((b * L) / 5) * (1 / s) * (((Math.sqrt(2 * L + 10)) * Math.pow(2 * L + 10, 2)) / (Math.sqrt(L + Lp + 10) * Math.pow(2 * L + 10, 2))) + 1;

    if (id !== undefined) {
let startExp;
let placement;
        for (let i = 0; i < pokemons.length; i++) {
            const row = pokemons[i];

            for (let j = 0; j < row.length; j++) {
                const poke = row[j];

                if (id == poke[0]) {
                    placement = pokemons[[i][j]];
                    startExp = poke[1];
                    // Stop both loops
                    i = pokemons.length; // break outer loop
                    break; // break inner loop
            }
        }

        let exp = startExp + math;
        console.log(exp, "exp after fight", placement);
        pokemons[[placement]].push(exp);
        this.ui.log(exp)
    }

    }
}


// Damage calculation functions
function calculateStat(base, level, iv = 31, ev = 0, isHP = false) {
    if (isHP) return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
}
// Multipliers for stat stages
function calculateDamage(level, attackStat, power, defenseStat, stab = 1, typeEffectiveness = 1) {
    const randomFactor = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
    const baseDamage = ((((2 * level) / 5 + 2) * (attackStat * attackMultiplier) * power / (defenseStat * defenseMultiplier)) / level) + 2;
    return Math.floor(baseDamage * stab * typeEffectiveness * randomFactor / 100);
}

// Get type effectiveness using PokeAPI
async function getTypeEffectiveness(moveType, defenderTypes) {
    if (!moveType || !defenderTypes || defenderTypes.length === 0) return 1;
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${moveType}`);
        if (!res.ok) return 1;
        const data = await res.json();
        let multiplier = 1;
        defenderTypes.forEach(defType => {
            if (data.damage_relations.double_damage_to.some(t => t.name === defType)) multiplier *= 2;
            if (data.damage_relations.half_damage_to.some(t => t.name === defType)) multiplier *= 0.5;
            if (data.damage_relations.no_damage_to.some(t => t.name === defType)) multiplier *= 0;
        });
        return multiplier;
    } catch {
        return 1;
    }
}

// Normalize stat name from effect text to stat key used in pokemon.stats
function normalizeStatName(raw) {
    if (!raw) return null;
    let s = raw.toLowerCase().trim();
    s = s.replace(/[^a-z\s-]/g, '');
    s = s.replace(/\s+/g, ' ');
    // common mappings
    s = s.replace(/special attack/, 'special-attack');
    s = s.replace(/special defense/, 'special-defense');
    s = s.replace(/sp\.atk|spatk/, 'special-attack');
    s = s.replace(/sp\.def|spdef/, 'special-defense');
    s = s.replace(/attack/, 'attack');
    s = s.replace(/defense/, 'defense');
    s = s.replace(/speed/, 'speed');
    s = s.replace(/hp/, 'hp');
    s = s.replace(/ /g, '-');
    return s;
}
function parseAndApplyStatEffects(effectText, attacker, defender, playerWhoMoved, ui) {
    if (!effectText) {
        return;
    }
    const text = effectText.toLowerCase();
    // convert written numbers to digits for one..six
    const wordNums = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    let normalized = text.replace(/\b(one|two|three|four|five|six)\b/g, (m) => wordNums[m]);

    // regex to capture (raise|lower|increase|decrease) [the] [user/target] 's? STAT by N
    const re = /(raise|raises|raised|lower|lowers|lowered|increase|increases|increased|decrease|decreases|decreased)\s+(?:the\s+)?(?:(user|target|ally|opponent|enemy|foe)'?s?\s+)?([a-z \-]+?)\s+by\s+(\d+)/i;
    const m = normalized.match(re);
    if (m) {
        const verb = m[1];
        let who = m[2];
        const statRaw = m[3];
        const num = parseInt(m[4], 10) || 0;
        const statKey = normalizeStatName(statRaw);
        if (!statKey) {
            return;
        }
        // determine target: if who indicates user -> attacker, otherwise target/unspecified -> defender
        let targetPoke = defender;
        if (who) {
            who = who.toLowerCase();
            if (who.startsWith('user') || who.startsWith('ally')) {
                targetPoke = attacker;
            }
            else {
                targetPoke = defender;
            }
        }
    }
}

// Change color of HP bar based on percentage
function lerpRgb(a, b, t) {
    return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t)
    ];
}
// pct: 0..100
function hpColorForPercent(pct) {
    pct = Math.max(0, Math.min(100, pct));
    const green = [0, 200, 0];
    const yellow = [255, 200, 0];
    const red = [200, 0, 0];

    if (pct >= 50) {
        // interpolate between yellow (50) and green (100)
        const t = (pct - 50) / 50; // 0..1
        const rgb = lerpRgb(yellow, green, t);
        return `rgb(${rgb.join(',')})`;
    }

    if (pct >= 25) {
        // interpolate between red (25) and yellow (50)
        const t = (pct - 25) / 25; // 0..1
        const rgb = lerpRgb(red, yellow, t);
        return `rgb(${rgb.join(',')})`;
    }

    // below 25 => solid red
    return `rgb(${red.join(',')})`;
}

// ------------------ CLASS DEFINITIONS ------------------ \\
class Move {
    constructor({ name, power, type, damageClass, effectText, priority, accuracy, statChange }) {
        this.name = name;
        this.power = power || 0;
        this.type = type || null;
        this.damageClass = damageClass || 'status';
        this.effectText = effectText || '';
        this.priority = typeof priority === 'number' ? priority : 0;
        this.accuracy = accuracy || 100;
        this.statChange = statChange || [];
    }

    isStatus() {
        return this.damageClass === 'status';
    }

    calculateDamage(attacker, defender, typeEffectiveness = 1) {
        if (this.isStatus()) return 0;

        // Default to 0 in case stats are missing
        let attackStat = 0;
        let defenseStat = 0;

        if (this.damageClass === 'physical') {
            attackStat = attacker.stats?.attack || 0;
            defenseStat = defender.stats?.defense || 1; // avoid division by 0
        } else if (this.damageClass === 'special') {
            attackStat = attacker.stats?.['special-attack'] || 0;
            defenseStat = defender.stats?.['special-defense'] || 1;
        } else {
            // status move → no damage
            return 0;
        }

        const stab = attacker.types?.includes(this.type) ? 1.5 : 1;

        return calculateDamage(50, attackStat, this.power, defenseStat, stab, typeEffectiveness);
    }
}

class Pokemon {
    constructor({ name, sprite, backSprite, stats, types, moves, base_experience, level }) {
        this.name = name;
        this.sprite = sprite;
        this.backSprite = backSprite;
        this.stats = stats;
        this.types = types;
        this.moves = moves.map(m => new Move(m));
        this.hpMax = stats.hp;
        this.hpCurrent = stats.hp;
        this.baseExp = base_experience;
        this.level = level;
        // track stat stages per stat key (same keys as stats object)
        this.statStages = {};
        Object.keys(stats).forEach(k => this.statStages[k] = 0);
    }

    takeDamage(amount) {
        this.hpCurrent = Math.max(0, this.hpCurrent - amount);
    }

    isFainted() {
        return this.hpCurrent <= 0;
    }
}

class UI {
    constructor() {
        this.logContainer = document.getElementById('battle-log');
    }

    updateHp(pokemon, player) {
        const bar = document.getElementById(`healthBar${player}`);
        const pct = Math.round((pokemon.hpCurrent / Math.max(1, pokemon.hpMax)) * 100);
        bar.value = `HP: ${pokemon.hpCurrent} / ${pokemon.hpMax} (${pct}%)`;
        bar.style.display = 'block';
        // set background color based on percent
        const bg = hpColorForPercent(pct);
        bar.style.backgroundColor = bg;
        // choose text color for contrast (dark text on light bg, white on darker)
        // simple luminance check
        const rgb = bg.match(/\d+/g).map(Number);
        const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
        bar.style.color = luminance > 150 ? '#000' : '#fff';
    }

    async handleType(type) {
        const result = await typeSymbol(type);

        // You can now safely use result1
        return result;
    }

    async processPokemon(pokemon, player, type) {
        // ✅ Use "this" to call another method in the same class
        let typeResult = 0;
        typeResult = await this.handleType(pokemon);

        if (typeResult != undefined && typeResult != null && type == 1) document.getElementById(`type${player}1`).src = typeResult;

        if (typeResult != undefined && typeResult != null && type == 2) {
            document.getElementById(`type${player}2`).src = typeResult;
            document.getElementById(`type${player}2`).style.display = "block";
        }

    }

    renderPokemon(pokemon, player) {
        document.getElementById(`pokemonNameDisplay${player}`).textContent = pokemon.name;
        if (player == 2) {
            document.getElementById(`pokemonSprite${player}`).src = pokemon.sprite;
        }
        else {
            document.getElementById(`pokemonSprite${player}`).src = pokemon.backSprite;

        }



        const j = Object.entries(pokemon.stats).map(([k, v]) => {
            const stage = pokemon.statStages && pokemon.statStages[k] ? pokemon.statStages[k] : 0;
            const stageLabel = stage !== 0 ? ` (${stage > 0 ? '+' : ''}${stage})` : '';
            // transient change label (shows +N or -N next to the stat for a moment)
            let changeLabel = '';
            if (pokemon._lastChange && pokemon._lastChange.statKey === k) {
                const d = pokemon._lastChange.delta || 0;
                if (d !== 0) changeLabel = ` <span class="stat-change ${d > 0 ? 'stat-up' : 'stat-down'}">${d > 0 ? '+' : ''}${d}</span>`;
            }
            return `${k.toUpperCase()}: ${v}${stageLabel}${changeLabel}`;
        })
            .join('\n');

        this.processPokemon(pokemon.types[0], player, 1);

        if (pokemon.types.length == 2) {
            this.processPokemon(pokemon.types[1], player, 2);
        }

        this.updateHp(pokemon, player);
        document.getElementById(`hudMoves${player}`).addEventListener("click", () => this.renderMoves(pokemon, player))
        document.getElementById(`pokemonSprite${player}`).title = j;
    }





    renderMoves(pokemon, player) {
        document.getElementById(`hud${player}`).style.display = "none";
        if (player == 1) {
            document.getElementById(`endMoves${player}`).style.left = "73%";
            document.getElementById(`endMoves${player}`).style.bottom = "2%";
            document.getElementById(`endMoves${player}`).style.display = "block";
        }
        if (player == 2) {
            document.getElementById(`endMoves${player}`).style.left = "1%";
            document.getElementById(`endMoves${player}`).style.top = "2%";
            document.getElementById(`endMoves${player}`).style.display = "block";
        }

        const container = document.getElementById(`moves${player}`);
        container.innerText = '';
        pokemon.moves.forEach(move => {
            const btn = document.createElement('button');
            btn.classList.add("teamFightButton");
            btn.textContent = move.name;
            btn.title = move.isStatus() ? `Accuracy: ${move.accuracy}\n${move.effectText}` :
                `| Power: ${move.power}\n| Type: ${move.type}\n| Accuracy: ${move.accuracy}\n| Priority: ${move.priority}\n| Damage class: ${move.damageClass}\n| ${move.effectText}`;
            btn.style.color = `${typeColor[move.type]}`

            btn.onclick = () => Battle.instance.selectMove(player, move);
            container.appendChild(btn);
            container.style.display = "flex";
        });
    }

    // allow optional color for log entries
    log(message, color = null) {
        const p = document.createElement('p');
        p.textContent = message;
        if (color) p.style.color = color;
        this.logContainer.appendChild(p);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    showPopup(msg) {
        document.querySelector("#popup p").textContent = msg;
        document.getElementById("popup").style.display = "flex";
    }

    closePopup() {
        document.getElementById("popup").style.display = "none";
        window.close();
    }

    renderSwitchMenu(team, player, onSelect, forForced = false) {
        const menu = document.getElementById(`switch-menu${player}`);
        menu.innerHTML = '';
        menu.classList.add(`switch-menu${player}`);
        team.forEach((poke, index) => {
            if (poke.hpCurrent <= 0) return;
            const btn = document.createElement('button');
            // create a container so image and name align
            const img = document.createElement('img');
            img.src = poke.sprite;
            img.alt = poke.name;
            img.width = 60; img.height = 60;
            const nameSpan = document.createElement('span');
            nameSpan.textContent = poke.name;
            btn.appendChild(img);
            btn.appendChild(nameSpan);

            btn.onclick = () => {
                menu.style.display = 'none';
                if (forForced) {
                    onSelect(index);
                } else {
                    onSelect(index);
                }
            };
            menu.appendChild(btn);
        });
        menu.style.display = 'flex';
    }



}

const typeColor =
{
    bug: 'lightgreen',
    dark: 'black',
    dragon: 'teal',
    electric: 'yellow',
    fairy: 'pink',
    fighting: 'orange',
    fire: 'red',
    flying: 'skyblue',
    ghost: 'darkpurple',
    grass: 'green',
    ground: 'rgb(206, 140, 55)',
    ice: 'lightblue',
    normal: 'normal',
    poison: 'purple',
    psychic: 'hotpink',
    rock: 'brown',
    steel: 'silver',
    water: 'blue'
}

class Battle {
    constructor(team1, team2, ui) {
        this.team1 = team1;
        this.team2 = team2;
        this.ui = ui;
        this.currentPoke1 = this.team1.shift();
        this.currentPoke2 = this.team2.shift();
        this.selectedMoves = { 1: null, 2: null };
        this.turn = 0; // add turn counter
        Battle.instance = this;
        this.startBattle();
    }

    startBattle() {
        document.getElementById('team-selection').style.display = 'none';

        document.getElementById('pokemon2-card').style.left = '70%';
        document.getElementById('pokemon2-card').style.top = '210px';
        document.getElementById('pokemon1-card').style.top = '190px';


        //document.getElementById('battle-container').style.display = 'flex';
        //document.getElementById('battle-log').style.display = 'block';
        this.ui.renderPokemon(this.currentPoke1, 1);
        this.ui.renderPokemon(this.currentPoke2, 2);

    }

    selectMove(player, move) {
        document.getElementById(`endMoves${player}`).style.display = "none";
        if (player == 2) document.getElementsByClassName("moves-container")[player - 2].style.display = "none";
        else document.getElementsByClassName("moves-container")[player].style.display = "none";
        document.getElementById(`hud${player}`).style.display = "block";
        this.selectedMoves[player] = move;
        if (this.selectedMoves[1] && this.selectedMoves[2]) {
            this.executeTurn();
            document.getElementsByClassName("moves-container")[0].style.display = "none";
            document.getElementsByClassName("moves-container")[1].style.display = "none";
            document.getElementById(`endMoves1`).style.display = "none";
            document.getElementById(`endMoves2`).style.display = "none";

        }
    }

    async executeTurn() {
        // increment and display turn counter in the battle log
        this.turn++;
        this.ui.log(`--- Turn ${this.turn} ---`);

        // If either player selected a switch, perform switches first (always)
        const isSwitch1 = this.selectedMoves[1] && this.selectedMoves[1].type === 'switch';
        const isSwitch2 = this.selectedMoves[2] && this.selectedMoves[2].type === 'switch';

        if (isSwitch1 || isSwitch2) {
            // perform switches in a deterministic order (player 1 then player 2)
            if (isSwitch1) {
                const action = this.selectedMoves[1];
                this.performSwitch(1, action.index);
                this.ui.log(`${this.currentPoke1.name} switched in!`);
                document.getElementById("hud2").style.display = "block";
            }
            if (isSwitch2) {
                const action = this.selectedMoves[2];
                this.performSwitch(2, action.index);
                this.ui.log(`${this.currentPoke2.name} switched in!`);
                document.getElementById("hud1").style.display = "block";
            }

            // clear the switch selections (they consumed the turn)
            if (isSwitch1) this.selectedMoves[1] = null;
            if (isSwitch2) this.selectedMoves[2] = null;

            // If both players switched, the turn ends here
            if (!this.selectedMoves[1] && !this.selectedMoves[2]) {
                this.selectedMoves = { 1: null, 2: null };
                return;
            }
            // otherwise continue to resolve remaining move(s)
        }

        // determine order for remaining moves based on priority first, then speed
        const move1 = this.selectedMoves[1];
        const move2 = this.selectedMoves[2];

        // If only one move exists, just run it
        if (move1 && !move2) {
            await this.handleMove(1, move1);
            this.selectedMoves = { 1: null, 2: null };
            return;
        }
        if (move2 && !move1) {
            await this.handleMove(2, move2);
            this.selectedMoves = { 1: null, 2: null };
            return;
        }

        // process stat changes (secondary effects) declared on each move
        if (move1) this.processStatChangesForMove(1, move1);
        if (move2) this.processStatChangesForMove(2, move2);

        // Calculate move order
        if (move1 && move2) {
            const prio1 = move1.priority || 0;
            const prio2 = move2.priority || 0;
            let firstPlayer, secondPlayer;

            if (prio1 > prio2) {
                firstPlayer = 1; secondPlayer = 2;
            } else if (prio2 > prio1) {
                firstPlayer = 2; secondPlayer = 1;
            } else {
                // same priority -> speed tiebreaker
                const speed1 = this.currentPoke1.stats.speed;
                const speed2 = this.currentPoke2.stats.speed;
                firstPlayer = speed1 >= speed2 ? 1 : 2;
                secondPlayer = firstPlayer === 1 ? 2 : 1;
            }

            if (this.selectedMoves[firstPlayer]) {
                await this.handleMove(firstPlayer, this.selectedMoves[firstPlayer]);
            }

            if (!this.currentPoke1.isFainted() && !this.currentPoke2.isFainted()) {
                if (this.selectedMoves[secondPlayer]) {
                    await this.handleMove(secondPlayer, this.selectedMoves[secondPlayer]);
                }
            }
        }
        this.selectedMoves = { 1: null, 2: null };

        document.getElementById("hud1").style.display = "block";
        document.getElementById("hud2").style.display = "block";
    }

    async handleMove(player, action) {
        if (!action) return;
        // If action is a switch
        if (action.type === 'switch') {
            this.performSwitch(player, action.index);
            this.ui.log(`${player === 1 ? this.currentPoke1.name : this.currentPoke2.name} switched in!`);
            return;
        }

        // Otherwise it's a Move instance
        const move = action;
        const attacker = player === 1 ? this.currentPoke1 : this.currentPoke2;
        const defender = player === 1 ? this.currentPoke2 : this.currentPoke1;

        // Check if the move misses before proceeding
        let chance = Math.floor(Math.random() * 100) + 1;
        let modAcc = move.accuracy * 2 - chance;


        if (modAcc < 10) {
            move.power = 0;
            this.ui.log(`${attacker.name}'s ${move.name} missed!`, 'gray');
            return;
        }

        if (move.isStatus()) {
            this.ui.log(`${attacker.name} used ${move.name}: ${move.effectText}....coming soon`);
            // parse and apply any stat effects from the status move
            parseAndApplyStatEffects(move.effectText, attacker, defender, player, this.ui);
            return;
        }

        const typeEffectiveness = await getTypeEffectiveness(move.type, defender.types);
        const damage = move.calculateDamage(attacker, defender, typeEffectiveness);
        defender.takeDamage(damage);
        this.ui.updateHp(defender, player === 1 ? 2 : 1);
        // Log the attack
        this.ui.log(`${attacker.name} used ${move.name} (-${damage} HP)`);

        // Log effectiveness message with appropriate color
        if (typeEffectiveness === 0) {
            this.ui.log("It had no effect.", 'gray');
        } else if (typeEffectiveness > 1) {
            this.ui.log("It's super effective!", 'green');
        } else if (typeEffectiveness < 1) {
            this.ui.log("It's not very effective...", 'red');
        }

        // parse and apply any stat effects from move (works for damage moves that have secondary effects)
        parseAndApplyStatEffects(move.effectText, attacker, defender, player, this.ui);

        if (defender.isFainted()) {
            this.ui.log(`${defender.name} fainted!`);
            if (player === 1) {

                expFight(defender.baseExp, defender.level, attacker.level, 1, attacker.id);
            }
            await this.forcedSwitch(player === 1 ? 2 : 1);
        }
    }

    performSwitch(player, index) {
        const team = player === 1 ? this.team1 : this.team2;
        const newPoke = team.splice(index, 1)[0];
        const oldPoke = player === 1 ? this.currentPoke1 : this.currentPoke2;
        // only put back the old poke into the team if it hasn't fainted
        if (!oldPoke.isFainted()) {

            team.push(oldPoke);
        }

        if (player === 1) {
            this.currentPoke1 = newPoke;
            this.ui.renderPokemon(newPoke, 1);
        } else {
            this.currentPoke2 = newPoke;
            this.ui.renderPokemon(newPoke, 2);
        }
    }

    async forcedSwitch(player, endBattle) {
        const team = player === 1 ? this.team1 : this.team2;
        if (team.length === 0 || endBattle) {
            this.ui.showPopup(player === 1 ? "Player 2 wins!" : "Player 1 wins!");
            return;
        }

        this.ui.log(`Player ${player}, choose a Pokémon to switch in!`);
        // For forced switch we immediately swap when selection is made
        this.ui.renderSwitchMenu(team, player, (index) => {
            const newPoke = team.splice(index, 1)[0];
            if (player === 1) this.currentPoke1 = newPoke;
            else this.currentPoke2 = newPoke;
            this.ui.renderPokemon(newPoke, player);
            this.ui.log(`${newPoke.name} was sent out!`);
            document.getElementById(`switch-menu${player}`).style.display = 'none';
        }, true);
    }

    manualSwitch(player) {
        const team = player === 1 ? this.team1 : this.team2;
        // When manually switching, selecting a Pokemon will set the selected action to a switch
        this.ui.renderSwitchMenu(team, player, (index) => {
            // set as selected action to consume this player's turn
            this.selectedMoves[player] = { type: 'switch', index };
            document.getElementById(`switch-menu${player}`).style.display = 'none';
            this.ui.log(`Player ${player} selected a switch.`);
            if (this.selectedMoves[1] && this.selectedMoves[2]) this.executeTurn();
        }, false);
    }

    // Moved out of executeTurn: properly defined class method to apply stat changes from move.statChange
    processStatChangesForMove(player, move) {
        if (!move || !Array.isArray(move.statChange) || move.statChange.length === 0) return;

        const attacker = player === 1 ? this.currentPoke1 : this.currentPoke2;
        const defender = player === 1 ? this.currentPoke2 : this.currentPoke1;

        move.statChange.forEach(sc => {
            const raw = sc?.stat?.name ?? sc?.stat ?? '(unknown)';
            const delta = sc?.change ?? 0;
            const targetStr = sc?.target?.name ?? sc?.target ?? move.target?.name ?? move.target ?? 'selected-pokemon';
            console.log(` ${move.name}: ${targetStr} ${raw} by ${delta}`);

            const useAttacker = /user|self|owner/i.test(targetStr);
            const targetPoke = useAttacker ? attacker : defender;
            const targetPlayer = targetPoke === this.currentPoke1 ? 1 : 2;

            const statKey = normalizeStatName(raw);
            if (!statKey || !(statKey in targetPoke.statStages)) {
                console.log(`Unknown stat '${raw}' from move ${move.name}`);
                return;
            }
            if (targetStr === "selected-pokemon") {
                console.log("select a target");
            }

            // Calculate new stat
            const prevStage = targetPoke.statStages[statKey] || 0;

            const newStage = Math.max(-7, Math.min(5, prevStage + delta));
            const appliedDelta = newStage - prevStage;
            targetPoke.statStages[statKey] = newStage;
            // transient UI marker used by renderPokemon
            targetPoke._lastChange = { statKey, delta: appliedDelta };

            // log and re-render only the affected pokemon
            if (appliedDelta !== 0) {
                const dir = appliedDelta > 0 ? 'rose' : 'fell';
                this.ui.log(`${targetPoke.name}'s ${statKey} ${dir} by ${Math.abs(appliedDelta)}.`);
            } else {
                this.ui.log(`${targetPoke.name}'s ${statKey} did not change.`);
            }
            this.ui.renderPokemon(targetPoke, targetPlayer);

            let statMultiplier = (2 + newStage) / 2;
            newStat = Math.floor(targetPoke.stats[statKey] * statMultiplier);

            if (appliedDelta > 0) {

                if (statKey === 'attack') {
                    attackMultiplier = (2 + newStage) / 2;
                }
                else if (statKey === 'defense') {
                    defenseMultiplier = (2 + newStage) / 2;
                }
            }
            else {
                if (statKey === 'attack') {
                    attackMultiplier = 2 / (2 - newStage);
                }
                else if (statKey === 'defense') {
                    defenseMultiplier = 2 / (2 - newStage);
                }
            }
        });
    }
}

// ------------------ FETCH FUNCTIONS ------------------ \\
const moveCache = new Map();

async function fetchPokemon(name, level) {

    try {

        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!res.ok) return null;
        const data = await res.json();
        const stats = {};
        data.stats.forEach(s => stats[s.stat.name] = calculateStat(s.base_stat, level, 31, 0, s.stat.name === 'hp'));
        const moves = data.moves.slice(0, 4).map(m => ({
            name: m.move.name,
            url: m.move.url
        }));

        const detailedMoves = await Promise.all(moves.map(async m => {
            if (moveCache.has(m.url)) {
                return moveCache.get(m.url);
            }
            const res = await fetch(m.url);
            const d = await res.json();

            const moveData = new Move({
                name: m.name,
                power: d.power,
                type: d.type?.name,
                damageClass: d.damage_class?.name,
                effectText: d.effect_entries?.find(e => e.language.name === 'en')?.short_effect || '',
                priority: d.priority || 0,
                accuracy: d.accuracy,
                statChange: d.stat_changes || null
            });
            moveCache.set(m.url, moveData);
            return moveData;
        }));

        return new Pokemon({
            name: data.name,
            sprite: data.sprites.front_default,
            backSprite: data.sprites.back_default,
            stats,
            types: data.types.map(t => t.type.name),
            moves: detailedMoves,
            base_experience: data.base_experience,
            level: level
        });
    } catch { return null; }
}
let levelArray = [];
// ------------------ TEAM SUBMISSION ------------------ \\
async function submitTeam(player, level) {
    let enemylvl;
    let team = [];

    if (team.length == 0) {
        for (let i = 1; i <= 6; i++) {
            const input = document.getElementById(`team${player}-poke${i}`);
            const name = input.value.trim();
            if (!name) continue;
            if (level != undefined) {
                levelArray.push(level);
            }
            else {
                if (levelArray.length != 0) enemylvl = await enemyLvlFunction(levelArray);


            }
            const poke = await fetchPokemon(name, level || enemylvl || 50);
            if (poke) {
                team.push(poke);

            }
        }

    }






    if (team.length === 0) return alert(`Player ${player} must select at least 1 Pokémon.`);
    else document.getElementById(`submitTeam${player}`).style.display = "none";
    if (player === 1) {
        window.team1 = team;
        if (level != undefined) document.getElementById("level1").innerText = "lv: " + level || 50;
        else document.getElementById("level1").innerText = "lv: " + 50;
    }
    else {

        window.team2 = team;
        if (enemylvl != undefined) document.getElementById("level2").innerText = "lv: " + enemylvl || 50;
        else document.getElementById("level2").innerText = "lv: " + 50;
    }

    if (window.team1 && window.team2 && document.getElementById(`submitTeam1`).style.display == "none" && document.getElementById(`submitTeam2`).style.display == "none") {

        document.getElementById("startBattle").style.display = "block";



    }

}
async function startBattle() {
    new Battle(window.team1, window.team2, new UI());
    document.body.style.backgroundImage = "url('https://github.com/Lpopp30/ApiPokemon/blob/main/20fe1e143ea1bb175a2035b1d180e398.jpg?raw=true')";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "1900px 800px";
    document.getElementById("hud1").style.display = "block";
    document.getElementById("hud2").style.display = "block";
    document.getElementsByClassName("pokemon-card")[0].style.display = "block";
    document.getElementsByClassName("pokemon-card")[1].style.display = "block";

    document.getElementsByClassName("oval")[1].style.background = "radial-gradient(circle at center, #273781ff 0%, #094679ff 100%)";
    document.getElementsByClassName("oval")[0].style.background = "radial-gradient(circle at center, #851e1eff 0%, #923030ff 100%)";

}


async function randomizeTeam(player) {
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`team${player}-poke${i}`);
        try {
            const randomId = Math.floor(Math.random() * 1025) + 1;
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            if (!res.ok) { input.value = ''; continue; }
            const data = await res.json();

            await startInfo(data.name, `team${player}-poke${i}`, player);
            input.value = data.name;
        } catch {
            input.value = '';
        }

    }
}


const userTeamArray = [];
async function userTeam() {

    if (teamIds.length > 0) {
        userTeamArray.push(...teamIds);

        const battleWindow = window.open('/index.html', '_blank');

        battleWindow.onload = () => {
            // ✅ Send message to the new tab
            battleWindow.postMessage(
                { type: "teamData", teamIds }, // message payload
                "*" // target origin — replace "*" with your origin for security
            );
            for (let i = 1; i <= teamIds.length; i++) {

                const el = battleWindow.document.getElementById(`team1-poke${i}`);

                if (el) {
                    el.value = teamIds[i - 1];
                    el.readOnly = true;
                    battleWindow.teamIds = teamIds;
                    battleWindow.pokemons = pokemons;
                    el.dispatchEvent(new Event('change', { bubbles: true }));


                }

            }
            battleWindow.document.getElementById("randomizeTeam1").style.display = "none";

        };


    }

    return userTeam;
}


async function startInfo(name, id, person) {
    let fullPlace = null;
    let number = id.charAt(id.length - 1) - 1;
    let info
    if (document.getElementById(id).readOnly == true) {
        for (let i = 0; i < window.pokemons.length; i++) {
            const row = window.pokemons[i];

            for (let j = 0; j < row.length; j++) {
                const poke = row[j];

                if (window.teamIds[number] == poke[0]) {
                    fullPlace = poke[2];
                    info = await fetchPokemon(name, fullPlace || 50);
                    // Stop both loops
                    i = window.pokemons.length; // break outer loop
                    break; // break inner loop
                } else {
                    fullPlace = null;
                }
            }
        }

    }

    else { info = await fetchPokemon(name, fullPlace || 50); }

    if (!info) {
        console.error(`fetchPokemon(${name}) returned null or undefined`);
        return;
    }
    document.getElementById(`Sprite-${id}`).src = info.sprite;
    document.getElementById(`startHp-${id}`).innerText = info.hpCurrent + " HP";

    const iu = new UI();
    let rjgehk2;
    let rjgehk = await iu.handleType(info.types[0]);
    if (info.types.length == 2) {
        rjgehk2 = await iu.handleType(info.types[1]);
        document.getElementById(`startTypes2-${id}`).style.display = "block";
        document.getElementById(`startTypes2-${id}`).src = rjgehk2;
    }
    else {
        document.getElementById(`startTypes2-${id}`).style.display = "none";
    }
    document.getElementById(`startTypes1-${id}`).src = rjgehk;

    document.getElementById(`submitTeam${person}`).style.display = "block";
    document.getElementById("startBattle").style.display = "none";


    if (document.getElementById(id).readOnly == true) submitTeam(1, fullPlace || 50);
}


// ------------------ GLOBAL SWITCH BUTTONS ------------------ \\
window.manualSwitch = (player) => {
    if (Battle.instance) {
        Battle.instance.manualSwitch(player);
    }
}

function battlelogDisplay() {
    if (document.getElementById("battle-log").style.display == "block") {
        document.getElementById("battle-log").style.display = "none";
    }
    else {
        document.getElementById("battle-log").style.display = "block";
    }
}

function endbtn(player, endBattle) {

    Battle.instance.forcedSwitch(player, endBattle)
}
function closePopupGlobal() {
    const iu = new UI();
    iu.closePopup();
}
function classFunction(Class, Functions, player) {

    if (Class == 'Battle' && Functions == 'selectMove') {

        Battle.instance.selectMove(player);
    }
}

console.log("simon was here");
