/* ════════════════════════════════════════
   SUPABASE CLIENT
════════════════════════════════════════ */
const { createClient } = supabase;
const db = createClient(
  'https://jxcscrtzbitbnkuhrmur.supabase.co',
  'sb_publishable_hFt1Re3E7sObwAIkc2_Myg_4S8tUN-e',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.localStorage } }
);

/* ════════════════════════════════════════
   DESCRIÇÕES LOCAIS DAS AVES (carregadas do JSON)
════════════════════════════════════════ */
let descricoesAves = {};

async function carregarDescricoes() {
  try {
    const resp = await fetch('descricoes.json');
    descricoesAves = await resp.json();
  } catch (e) {
    console.warn('Erro ao carregar descrições', e);
  }
}
carregarDescricoes();

/* ════════════════════════════════════════
   GUARDS PARA EVITAR MÚLTIPLAS CHAMADAS SIMULTÂNEAS
════════════════════════════════════════ */
const _renderGuards = {};
async function withGuard(key, fn) {
  if (_renderGuards[key]) return;
  _renderGuards[key] = true;
  try { await fn(); } finally { _renderGuards[key] = false; }
}

/* Cache de requisições com TTL de 30s */
const _reqCache = {};
async function cachedFetch(key, fn, ttl = 30000) {
  const now = Date.now();
  if (_reqCache[key] && (now - _reqCache[key].ts) < ttl) return _reqCache[key].data;
  const data = await fn();
  _reqCache[key] = { data, ts: now };
  return data;
}
function invalidateCache(prefix) {
  Object.keys(_reqCache).forEach(k => { if (k.startsWith(prefix)) delete _reqCache[k]; });
}

/* ════════════════════════════════════════
   RARIDADE DAS ESPÉCIES
   Fonte: raridade.txt do repositório
════════════════════════════════════════ */
const MUITO_RARAS = new Set([
  "Urubitinga coronata","Thalassarche chlororhynchos","Diomedea dabbenena",
  "Diomedea exulans","Touit melanonotus","Pteroglossus castanotis",
  "Limnoctites rectirostris","Phylloscartes eximius","Formicivora acutirostris",
  "Sporophila cinnamomea","Cistothorus platensis","Sporophila angolensis",
  "Rhea americana","Spizaetus ornatus","Pterodroma incerta","Eudocimus ruber",
  "Aburria jacutinga","Primolius maracana","Onychorhynchus swainsoni",
  "Polystictus pectoralis","Culicivora caudacuta","Amazona vinacea",
  "Heliornis fulica","Tigrisoma fasciatum","Scytalopus iraiensis",
  "Accipiter poliogaster","Xanthopsar flavus"
]);

const RARAS = new Set([
  "Pandion haliaetus","Thalassarche chrysostoma","Thalassarche melanophris",
  "Myiobius barbatus","Sporophila palustris","Anthus nattereri","Piprites pileata",
  "Sporophila falcirostris","Strix huhula","Hydropsalis anomala",
  "Corythopis delalandi","Phylloscartes difficilis","Spizaetus melanoleucus",
  "Amadonastur lacernulatus","Crypturellus noctivagus","Calidris subruficollis",
  "Limnodromus griseus","Calidris pusilla","Stercorarius parasiticus",
  "Hemitriccus kaempferi","Phylloscartes sylviolus","Chloroceryle inda",
  "Heteroxolmis dominicanus","Hemitriccus diops","Myrmoderus squamosus",
  "Amazona pretrei","Biatas nigropectus","Procellaria conspicillata",
  "Procellaria aequinoctialis","Sporophila beltoni","Platyrinchus leucoryphus",
  "Pyroderus scutatus","Celeus galeatus","Drymophila squamata",
  "Sporophila frontalis","Stilpnia peruviana","Laterallus spilopterus",
  "Trogon viridis","Scytalopus pachecoi","Phibalura flavirostris",
  "Loriotus cristatus","Cissopis leverianus","Thalasseus maximus",
  "Lipaugus lanioides"
]);

function getRaridade(sci) {
  if (MUITO_RARAS.has(sci)) return 'muito-rara';
  if (RARAS.has(sci)) return 'rara';
  return 'comum';
}

/* Opera GX / navegadores Chromium: fix para supabase UMD */
if (typeof window !== 'undefined' && !window._supabaseReady) {
  window._supabaseReady = true;
}


function obterDescricaoAve(sci) {
  if (!descricoesAves || Object.keys(descricoesAves).length === 0) return null;
  const key = (sci || "").toLowerCase().trim();
  return descricoesAves[key] || null;
}

async function loadLocalDescription(sci, pop) {
  const el = document.getElementById('bird-local-desc');
  if (!el) return;
  // Se descrições ainda não carregaram, aguarda até 3s
  if (!descricoesAves || Object.keys(descricoesAves).length === 0) {
    await carregarDescricoes();
  }
  const desc = obterDescricaoAve(sci);
  if (desc) {
    el.textContent = desc;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
    el.textContent = '';
  }
}

/* ════════════════════════════════════════
   BANCO COMPLETO DE SC — 691 espécies
   (substitua por todos os dados)
════════════════════════════════════════ */
const conservationData = [
            { especie: "Rhea americana", nomePopular: "ema", sc: "EW", icmbio: "LC", iucn: "NT" },
            { especie: "Tinamus solitarius", nomePopular: "macuco", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Crypturellus obsoletus", nomePopular: "inhambuguaçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Crypturellus noctivagus", nomePopular: "jaó-do-sul", sc: "EN", icmbio: "LC", iucn: "NT" },
            { especie: "Crypturellus parvirostris", nomePopular: "inhambu-chororó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Crypturellus tataupa", nomePopular: "inhambu-chintã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rhynchotus rufescens", nomePopular: "perdiz", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nothura maculosa", nomePopular: "codorna-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anhima cornuta", nomePopular: "anhuma", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chauna torquata", nomePopular: "tachã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocygna bicolor", nomePopular: "marreca-caneleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocygna viduata", nomePopular: "irerê", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocygna autumnalis", nomePopular: "marreca-cabocla", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coscoroba coscoroba", nomePopular: "capororoca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cairina moschata", nomePopular: "pato-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sarkidiornis sylvicola", nomePopular: "pato-de-crista", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Callonetta leucophrys", nomePopular: "marreca-de-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amazonetta brasiliensis", nomePopular: "marreca-ananaí", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spatula versicolor", nomePopular: "marreca-cricri", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spatula platalea", nomePopular: "marreca-colhereira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spatula discors", nomePopular: "marreca-de-asa-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spatula cyanoptera", nomePopular: "marreca-colorada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mareca sibilatrix", nomePopular: "marreca-oveira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anas bahamensis", nomePopular: "marreca-toicinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anas acuta", nomePopular: "arrabio", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Anas georgica", nomePopular: "marreca-parda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anas flavirostris", nomePopular: "marreca-pardinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Netta erythrophthalma", nomePopular: "paturi-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Netta peposaca", nomePopular: "marrecão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heteronetta atricapilla", nomePopular: "marreca-de-cabeça-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nomonyx dominicus", nomePopular: "marreca-caucau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Oxyura vittata", nomePopular: "marreca-rabo-de-espinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Penelope superciliaris", nomePopular: "jacupemba", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Penelope obscura", nomePopular: "jacuguaçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aburria jacutinga", nomePopular: "jacutinga", sc: "CR", icmbio: "EN", iucn: "EN" },
            { especie: "Ortalis squamata", nomePopular: "aracuã-escamoso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Odontophorus capueira", nomePopular: "uru", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phoenicoparrus andinus", nomePopular: "flamingo-dos-andes", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Rollandia rolland", nomePopular: "mergulhão-de-orelha-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tachybaptus dominicus", nomePopular: "mergulhão-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Podilymbus podiceps", nomePopular: "mergulhão-caçador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Podicephorus major", nomePopular: "mergulhão-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Columba livia", nomePopular: "pombo-doméstico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Patagioenas picazuro", nomePopular: "pomba-asa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Patagioenas cayennensis", nomePopular: "pomba-galega", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Patagioenas plumbea", nomePopular: "pomba-amargosa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geotrygon montana", nomePopular: "pariri", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptotila verreauxi", nomePopular: "juriti-pupu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptotila rufaxilla", nomePopular: "juriti-de-testa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Zenaida auriculata", nomePopular: "avoante", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Claravis pretiosa", nomePopular: "pararu-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Columbina talpacoti", nomePopular: "rolinha-roxa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Columbina squammata", nomePopular: "rolinha-fogo-apagou", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Columbina picui", nomePopular: "rolinha-picuí", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Guira guira", nomePopular: "anu-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Crotophaga major", nomePopular: "anu-coroca", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Crotophaga ani", nomePopular: "anu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tapera naevia", nomePopular: "saci", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dromococcyx phasianellus", nomePopular: "peixe-frito", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dromococcyx pavoninus", nomePopular: "peixe-frito-pavonino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Micrococcyx cinereus", nomePopular: "papa-lagarta-cinzento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Piaya cayana", nomePopular: "alma-de-gato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coccyzus melacoryphus", nomePopular: "papa-lagarta-acanelado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coccyzus americanus", nomePopular: "papa-lagarta-de-asa-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coccyzus euleri", nomePopular: "papa-lagarta-de-euler", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coccyzus erythropthalmus", nomePopular: "papa-lagarta-de-bico-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nyctibius griseus", nomePopular: "urutau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Antrostomus rufus", nomePopular: "joão-corta-pau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Antrostomus sericocaudatus", nomePopular: "bacurau-rabo-de-seda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lurocalis semitorquatus", nomePopular: "tuju", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nyctidromus albicollis", nomePopular: "bacurau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hydropsalis parvula", nomePopular: "bacurau-chintã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hydropsalis anomala", nomePopular: "curiango-do-banhado", sc: "EN", icmbio: "LC", iucn: "NT" },
            { especie: "Hydropsalis longirostris", nomePopular: "bacurau-da-telha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hydropsalis torquata", nomePopular: "bacurau-tesoura", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hydropsalis forcipata", nomePopular: "bacurau-tesourão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Podager nacunda", nomePopular: "corucão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chordeiles minor", nomePopular: "bacurau-norte-americano", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cypseloides fumigatus", nomePopular: "taperuçu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cypseloides senex", nomePopular: "taperuçu-velho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Streptoprocne zonaris", nomePopular: "taperuçu-de-coleira-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Streptoprocne biscutata", nomePopular: "taperuçu-de-coleira-falha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chaetura cinereiventris", nomePopular: "andorinhão-de-sobre-cinzento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chaetura meridionalis", nomePopular: "andorinhão-do-temporal", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Panyptila cayennensis", nomePopular: "andorinhão-estofador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Florisuga fusca", nomePopular: "beija-flor-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphodon naevius", nomePopular: "beija-flor-rajado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phaethornis squalidus", nomePopular: "rabo-branco-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phaethornis pretrei", nomePopular: "rabo-branco-acanelado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phaethornis eurynome", nomePopular: "rabo-branco-de-garganta-rajada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Colibri serrirostris", nomePopular: "beija-flor-de-orelha-violeta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anthracothorax nigricollis", nomePopular: "beija-flor-de-veste-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lophornis magnificus", nomePopular: "topetinho-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lophornis chalybeus", nomePopular: "topetinho-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heliodoxa rubricauda", nomePopular: "beija-flor-rubi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heliomaster furcifer", nomePopular: "bico-reto-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Calliphlox amethystina", nomePopular: "estrelinha-ametista", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chlorostilbon lucidus", nomePopular: "besourinho-de-bico-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stephanoxis loddigesii", nomePopular: "beija-flor-de-topete-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thalurania glaucopis", nomePopular: "beija-flor-de-fronte-violeta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Eupetomena macroura", nomePopular: "beija-flor-tesoura", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aphantochroa cirrochloris", nomePopular: "beija-flor-cinza", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chrysuronia versicolor", nomePopular: "beija-flor-de-banda-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leucochloris albicollis", nomePopular: "beija-flor-de-papo-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chionomesa fimbriata", nomePopular: "beija-flor-de-garganta-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chionomesa lactea", nomePopular: "beija-flor-de-peito-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hylocharis chrysura", nomePopular: "beija-flor-dourado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aramus guarauna", nomePopular: "carão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rallus longirostris", nomePopular: "saracura-matraca", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Porphyrio martinica", nomePopular: "frango-d'água-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Porphyrio flavirostris", nomePopular: "frango-d'água-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Laterallus flaviventer", nomePopular: "sanã-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Laterallus melanophaius", nomePopular: "sanã-parda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Laterallus exilis", nomePopular: "sanã-do-capim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Laterallus spilopterus", nomePopular: "sanã-cinza", sc: "LC", icmbio: "EN", iucn: "NT" },
            { especie: "Laterallus leucopyrrhus", nomePopular: "sanã-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mustelirallus albicollis", nomePopular: "sanã-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Neocrex erythrops", nomePopular: "turu-turu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pardirallus maculatus", nomePopular: "saracura-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pardirallus nigricans", nomePopular: "saracura-sanã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pardirallus sanguinolentus", nomePopular: "saracura-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amaurolimnas concolor", nomePopular: "saracura-lisa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aramides ypecaha", nomePopular: "saracuruçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aramides cajaneus", nomePopular: "saracura-três-potes", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aramides saracura", nomePopular: "saracura-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Porphyriops melanops", nomePopular: "galinha-d'água-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Gallinula galeata", nomePopular: "galinha-d'água", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fulica rufifrons", nomePopular: "carqueja-de-escudo-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fulica armillata", nomePopular: "carqueja-de-bico-manchado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fulica leucoptera", nomePopular: "carqueja-de-bico-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heliornis fulica", nomePopular: "picaparra", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Pluvialis dominica", nomePopular: "batuiruçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pluvialis squatarola", nomePopular: "batuiruçu-de-axila-preta", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Oreopholus ruficollis", nomePopular: "batuíra-de-papo-ferrugíneo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Vanellus chilensis", nomePopular: "quero-quero", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Charadrius modestus", nomePopular: "batuíra-de-peito-tijolo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Charadrius semipalmatus", nomePopular: "batuíra-de-bando", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Charadrius collaris", nomePopular: "batuíra-de-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Charadrius falklandicus", nomePopular: "batuíra-de-coleira-dupla", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Haematopus palliatus", nomePopular: "piru-piru", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Himantopus melanurus", nomePopular: "pernilongo-de-costas-brancas", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chionis albus", nomePopular: "pomba-antártica", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Bartramia longicauda", nomePopular: "maçarico-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Numenius hudsonicus", nomePopular: "maçarico-de-bico-torto", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Limosa haemastica", nomePopular: "maçarico-de-bico-virado", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Arenaria interpres", nomePopular: "vira-pedras", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Calidris canutus", nomePopular: "maçarico-de-papo-vermelho", sc: "LC", icmbio: "VU", iucn: "NT" },
            { especie: "Calidris himantopus", nomePopular: "maçarico-pernilongo", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Calidris alba", nomePopular: "maçarico-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Calidris bairdii", nomePopular: "maçarico-de-bico-fino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Calidris minutilla", nomePopular: "maçariquinho", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Calidris fuscicollis", nomePopular: "maçarico-de-sobre-branco", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Calidris subruficollis", nomePopular: "maçarico-acanelado", sc: "LC", icmbio: "VU", iucn: "VU" },
            { especie: "Calidris melanotos", nomePopular: "maçarico-de-colete", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Calidris pusilla", nomePopular: "maçarico-rasteirinho", sc: "LC", icmbio: "EN", iucn: "NT" },
            { especie: "Limnodromus griseus", nomePopular: "maçarico-de-costas-brancas", sc: "LC", icmbio: "EN", iucn: "VU" },
            { especie: "Gallinago undulata", nomePopular: "narcejão", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Gallinago paraguaiae", nomePopular: "narceja", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phalaropus tricolor", nomePopular: "pisa-n'água", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phalaropus fulicarius", nomePopular: "pisa-n'água-de-bico-grosso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Actitis macularius", nomePopular: "maçarico-pintado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tringa solitaria", nomePopular: "maçarico-solitário", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tringa melanoleuca", nomePopular: "maçarico-grande-de-perna-amarela", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Tringa inornata", nomePopular: "maçarico-grande-de-asa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tringa semipalmata", nomePopular: "maçarico-de-asa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tringa flavipes", nomePopular: "maçarico-de-perna-amarela", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Thinocorus rumicivorus", nomePopular: "agachadeira-mirim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Jacana jacana", nomePopular: "jaçanã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nycticryphes semicollaris", nomePopular: "narceja-de-bico-torto", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Stercorarius chilensis", nomePopular: "mandrião-chileno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stercorarius maccormicki", nomePopular: "mandrião-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stercorarius antarcticus", nomePopular: "mandrião-antártico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stercorarius pomarinus", nomePopular: "mandrião-pomarino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stercorarius parasiticus", nomePopular: "mandrião-parasítico", sc: "LC", icmbio: "LC", iucn: "EN" },
            { especie: "Stercorarius longicaudus", nomePopular: "mandrião-de-cauda-comprida", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chroicocephalus maculipennis", nomePopular: "gaivota-maria-velha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chroicocephalus cirrocephalus", nomePopular: "gaivota-de-cabeça-cinza", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leucophaeus modestus", nomePopular: "gaivota-cinzenta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leucophaeus atricilla", nomePopular: "gaivota-alegre", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leucophaeus pipixcan", nomePopular: "gaivota-de-franklin", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Larus atlanticus", nomePopular: "gaivota-de-rabo-preto", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Larus dominicanus", nomePopular: "gaivotão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anous stolidus", nomePopular: "trinta-réis-escuro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rynchops niger", nomePopular: "talha-mar", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sternula antillarum", nomePopular: "trinta-réis-miúdo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sternula superciliaris", nomePopular: "trinta-réis-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phaetusa simplex", nomePopular: "trinta-réis-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sterna hirundo", nomePopular: "trinta-réis-boreal", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sterna hirundinacea", nomePopular: "trinta-réis-de-bico-vermelho", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Sterna trudeaui", nomePopular: "trinta-réis-de-coroa-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thalasseus acuflavidus", nomePopular: "trinta-réis-de-bando", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Thalasseus maximus", nomePopular: "trinta-réis-real", sc: "VU", icmbio: "EN", iucn: "LC" },
            { especie: "Spheniscus magellanicus", nomePopular: "pinguim-de-magalhães", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Diomedea exulans", nomePopular: "albatroz-errante", sc: "VU", icmbio: "CR", iucn: "VU" },
            { especie: "Diomedea dabbenena", nomePopular: "albatroz-de-tristão", sc: "CR", icmbio: "CR", iucn: "CR" },
            { especie: "Thalassarche chlororhynchos", nomePopular: "albatroz-de-nariz-amarelo", sc: "EN", icmbio: "EN", iucn: "EN" },
            { especie: "Thalassarche melanophris", nomePopular: "albatroz-de-sobrancelha", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Thalassarche chrysostoma", nomePopular: "albatroz-de-cabeça-cinza", sc: "VU", icmbio: "LC", iucn: "EN" },
            { especie: "Oceanites oceanicus", nomePopular: "alma-de-mestre", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Macronectes giganteus", nomePopular: "petrel-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Macronectes halli", nomePopular: "petrel-grande-do-norte", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fulmarus glacialoides", nomePopular: "pardelão-prateado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Daption capense", nomePopular: "pomba-do-cabo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pterodroma mollis", nomePopular: "grazina-delicada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pterodroma incerta", nomePopular: "grazina-de-barriga-branca", sc: "EN", icmbio: "EN", iucn: "EN" },
            { especie: "Procellaria aequinoctialis", nomePopular: "pardela-preta", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Procellaria conspicillata", nomePopular: "pardela-de-óculos", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Calonectris borealis", nomePopular: "cagarra-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ardenna grisea", nomePopular: "pardela-escura", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Ardenna gravis", nomePopular: "pardela-de-barrete", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Puffinus puffinus", nomePopular: "pardela-sombria", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ciconia maguari", nomePopular: "maguari", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Jabiru mycteria", nomePopular: "tuiuiú", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mycteria americana", nomePopular: "cabeça-seca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fregata magnificens", nomePopular: "fragata", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Morus serrator", nomePopular: "atobá-australiano", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sula leucogaster", nomePopular: "atobá-pardo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anhinga anhinga", nomePopular: "biguatinga", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nannopterum brasilianum", nomePopular: "biguá", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tigrisoma lineatum", nomePopular: "socó-boi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tigrisoma fasciatum", nomePopular: "socó-jararaca", sc: "CR", icmbio: "VU", iucn: "LC" },
            { especie: "Cochlearius cochlearius", nomePopular: "arapapá", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Botaurus pinnatus", nomePopular: "socó-boi-baio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ixobrychus exilis", nomePopular: "socoí-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ixobrychus involucris", nomePopular: "socoí-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nycticorax nycticorax", nomePopular: "socó-dorminhoco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nyctanassa violacea", nomePopular: "savacu-de-coroa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Butorides striata", nomePopular: "socozinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Bubulcus ibis", nomePopular: "garça-vaqueira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ardea cocoi", nomePopular: "garça-moura", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ardea alba", nomePopular: "garça-branca-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Syrigma sibilatrix", nomePopular: "maria-faceira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pilherodius pileatus", nomePopular: "garça-real", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Egretta thula", nomePopular: "garça-branca-pequena", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Egretta caerulea", nomePopular: "garça-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Eudocimus ruber", nomePopular: "guará", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Plegadis chihi", nomePopular: "caraúna", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mesembrinibis cayennensis", nomePopular: "coró-coró", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phimosus infuscatus", nomePopular: "tapicuru", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Theristicus caerulescens", nomePopular: "curicaca-real", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Theristicus caudatus", nomePopular: "curicaca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Platalea ajaja", nomePopular: "colhereiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sarcoramphus papa", nomePopular: "urubu-rei", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Coragyps atratus", nomePopular: "urubu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cathartes aura", nomePopular: "urubu-de-cabeça-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cathartes burrovianus", nomePopular: "urubu-de-cabeça-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pandion haliaetus", nomePopular: "águia-pescadora", sc: "LC", icmbio: "LC", iucn: "EN" },
            { especie: "Elanus leucurus", nomePopular: "gavião-peneira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chondrohierax uncinatus", nomePopular: "gavião-caracoleiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptodon cayanensis", nomePopular: "gavião-gato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elanoides forficatus", nomePopular: "gavião-tesoura", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spizaetus tyrannus", nomePopular: "gavião-pega-macaco", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Spizaetus melanoleucus", nomePopular: "gavião-pato", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Spizaetus ornatus", nomePopular: "gavião-de-penacho", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Rostrhamus sociabilis", nomePopular: "gavião-caramujeiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Harpagus diodon", nomePopular: "gavião-bombachinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ictinia plumbea", nomePopular: "sovi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Circus cinereus", nomePopular: "gavião-cinza", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Circus buffoni", nomePopular: "gavião-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hieraspiza superciliosa", nomePopular: "tauató-passarinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Accipiter poliogaster", nomePopular: "tauató-pintado", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Accipiter striatus", nomePopular: "tauató-miúdo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Accipiter bicolor", nomePopular: "gavião-bombachinha-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geranospiza caerulescens", nomePopular: "gavião-pernilongo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heterospizias meridionalis", nomePopular: "gavião-caboclo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amadonastur lacernulatus", nomePopular: "gavião-pombo-pequeno", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Urubitinga urubitinga", nomePopular: "gavião-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Urubitinga coronata", nomePopular: "águia-cinzenta", sc: "CR", icmbio: "EN", iucn: "EN" },
            { especie: "Rupornis magnirostris", nomePopular: "gavião-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Parabuteo unicinctus", nomePopular: "gavião-asa-de-telha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Parabuteo leucorrhous", nomePopular: "gavião-de-sobre-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geranoaetus albicaudatus", nomePopular: "gavião-de-rabo-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geranoaetus melanoleucus", nomePopular: "águia-serrana", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pseudastur polionotus", nomePopular: "gavião-pombo-grande", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Buteo platypterus", nomePopular: "gavião-de-asa-larga", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Buteo brachyurus", nomePopular: "gavião-de-cauda-curta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Buteo swainsoni", nomePopular: "gavião-papa-gafanhoto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Buteo albonotatus", nomePopular: "gavião-urubu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyto furcata", nomePopular: "suindara", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megascops choliba", nomePopular: "corujinha-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megascops sanctaecatarinae", nomePopular: "corujinha-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megascops atricapilla", nomePopular: "corujinha-sapo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pulsatrix koeniswaldiana", nomePopular: "murucututu-de-barriga-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Bubo virginianus", nomePopular: "jacurutu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Strix hylophila", nomePopular: "coruja-listrada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Strix virgata", nomePopular: "coruja-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Strix huhula", nomePopular: "coruja-preta", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Glaucidium minutissimum", nomePopular: "caburé-miudinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Glaucidium brasilianum", nomePopular: "caburé", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Athene cunicularia", nomePopular: "coruja-buraqueira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Aegolius harrisii", nomePopular: "caburé-acanelado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Asio clamator", nomePopular: "coruja-orelhuda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Asio stygius", nomePopular: "mocho-diabo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Asio flammeus", nomePopular: "mocho-dos-banhados", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Trogon viridis", nomePopular: "surucuá-de-barriga-amarela", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Trogon surrucura", nomePopular: "surucuá-variado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Trogon chrysochloros", nomePopular: "surucuá-dourado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Baryphthengus ruficapillus", nomePopular: "juruva", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megaceryle torquata", nomePopular: "martim-pescador-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chloroceryle amazona", nomePopular: "martim-pescador-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chloroceryle aenea", nomePopular: "martim-pescador-miúdo", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Chloroceryle americana", nomePopular: "martim-pescador-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chloroceryle inda", nomePopular: "martim-pescador-da-mata", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Nonnula rubecula", nomePopular: "macuru", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Malacoptila striata", nomePopular: "barbudo-rajado", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Notharchus swainsoni", nomePopular: "macuru-de-barriga-castanha", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Nystalus chacuru", nomePopular: "joão-bobo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphastos toco", nomePopular: "tucanuçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphastos vitellinus", nomePopular: "tucano-de-bico-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphastos dicolorus", nomePopular: "tucano-de-bico-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Selenidera maculirostris", nomePopular: "araçari-poca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pteroglossus bailloni", nomePopular: "araçari-banana", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Pteroglossus castanotis", nomePopular: "araçari-castanho", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Picumnus temminckii", nomePopular: "picapauzinho-de-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Picumnus nebulosus", nomePopular: "picapauzinho-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Melanerpes candidus", nomePopular: "pica-pau-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Melanerpes flavifrons", nomePopular: "benedito-de-testa-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Veniliornis spilogaster", nomePopular: "pica-pau-verde-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Campephilus robustus", nomePopular: "pica-pau-rei", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dryocopus lineatus", nomePopular: "pica-pau-de-banda-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Celeus galeatus", nomePopular: "pica-pau-de-cara-canela", sc: "VU", icmbio: "EN", iucn: "VU" },
            { especie: "Celeus flavescens", nomePopular: "pica-pau-de-cabeça-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Piculus flavigula", nomePopular: "pica-pau-bufador", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Piculus aurulentus", nomePopular: "pica-pau-dourado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Colaptes melanochloros", nomePopular: "pica-pau-verde-barrado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Colaptes campestris", nomePopular: "pica-pau-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cariama cristata", nomePopular: "seriema", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Herpetotheres cachinnans", nomePopular: "acauã", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Micrastur ruficollis", nomePopular: "falcão-caburé", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Micrastur semitorquatus", nomePopular: "falcão-relógio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Caracara plancus", nomePopular: "carcará", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Milvago chimachima", nomePopular: "carrapateiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Milvago chimango", nomePopular: "chimango", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Falco sparverius", nomePopular: "quiriquiri", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Falco rufigularis", nomePopular: "cauré", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Falco femoralis", nomePopular: "falcão-de-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Falco peregrinus", nomePopular: "falcão-peregrino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Touit melanonotus", nomePopular: "apuim-de-costas-pretas", sc: "CR", icmbio: "VU", iucn: "NT" },
            { especie: "Myiopsitta monachus", nomePopular: "caturrita", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Brotogeris tirica", nomePopular: "periquito-rico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Brotogeris chiriri", nomePopular: "periquito-de-encontro-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pionopsitta pileata", nomePopular: "cuiú-cuiú", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Triclaria malachitacea", nomePopular: "sabiá-cica", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Pionus maximiliani", nomePopular: "maitaca-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amazona vinacea", nomePopular: "papagaio-de-peito-roxo", sc: "EN", icmbio: "VU", iucn: "EN" },
            { especie: "Amazona pretrei", nomePopular: "papagaio-charão", sc: "EN", icmbio: "VU", iucn: "VU" },
            { especie: "Amazona aestiva", nomePopular: "papagaio-verdadeiro", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Forpus xanthopterygius", nomePopular: "tuim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pyrrhura frontalis", nomePopular: "tiriba-de-testa-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Primolius maracana", nomePopular: "maracanã", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Psittacara leucophthalmus", nomePopular: "periquitão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Terenura maculata", nomePopular: "zidedê", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myrmotherula unicolor", nomePopular: "choquinha-cinzenta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Formicivora acutirostris", nomePopular: "bicudinho-do-brejo", sc: "CR", icmbio: "VU", iucn: "NT" },
            { especie: "Rhopias gularis", nomePopular: "choquinha-de-garganta-pintada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dysithamnus stictothorax", nomePopular: "choquinha-de-peito-pintado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dysithamnus mentalis", nomePopular: "choquinha-lisa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dysithamnus xanthopterus", nomePopular: "choquinha-de-asa-ferrugem", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Herpsilochmus rufimarginatus", nomePopular: "chorozinho-de-asa-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thamnophilus doliatus", nomePopular: "choca-barrada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thamnophilus ruficapillus", nomePopular: "choca-de-chapéu-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thamnophilus caerulescens", nomePopular: "choca-da-mata", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hypoedaleus guttatus", nomePopular: "chocão-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Batara cinerea", nomePopular: "matracão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mackenziaena leachii", nomePopular: "borralhara-assobiadora", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mackenziaena severa", nomePopular: "borralhara", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Biatas nigropectus", nomePopular: "papo-branco", sc: "VU", icmbio: "LC", iucn: "VU" },
            { especie: "Myrmoderus squamosus", nomePopular: "papa-formiga-de-grota", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Pyriglena leucoptera", nomePopular: "papa-taoca-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila ferruginea", nomePopular: "dituí", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila rubricollis", nomePopular: "choquinha-dublê", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila ochropyga", nomePopular: "choquinha-de-dorso-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila malura", nomePopular: "choquinha-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Drymophila squamata", nomePopular: "pintadinho", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Conopophaga melanops", nomePopular: "cuspidor-de-máscara-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Conopophaga lineata", nomePopular: "chupa-dente", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Grallaria varia", nomePopular: "tovacuçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cryptopezus nattereri", nomePopular: "pinto-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Psilorhamphus guttatus", nomePopular: "tapaculo-pintado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Merulaxis ater", nomePopular: "entufado", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Eleoscytalopus indigoticus", nomePopular: "macuquinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Scytalopus iraiensis", nomePopular: "tapaculo-da-várzea", sc: "EN", icmbio: "EN", iucn: "VU" },
            { especie: "Scytalopus pachecoi", nomePopular: "tapaculo-ferreirinho", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Scytalopus speluncae", nomePopular: "tapaculo-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Formicarius colma", nomePopular: "galinha-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chamaeza campanisona", nomePopular: "tovaca-campainha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chamaeza ruficauda", nomePopular: "tovaca-de-rabo-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sclerurus scansor", nomePopular: "vira-folha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geositta cunicularia", nomePopular: "curriqueiro", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Sittasomus griseicapillus", nomePopular: "arapaçu-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocincla turdina", nomePopular: "arapaçu-liso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendrocolaptes platyrostris", nomePopular: "arapaçu-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xiphocolaptes albicollis", nomePopular: "arapaçu-de-garganta-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xiphorhynchus fuscus", nomePopular: "arapaçu-rajado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Campylorhamphus falcularius", nomePopular: "arapaçu-de-bico-torto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lepidocolaptes angustirostris", nomePopular: "arapaçu-de-cerrado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lepidocolaptes falcinellus", nomePopular: "arapaçu-escamoso-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xenops minutus", nomePopular: "bico-virado-miúdo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xenops rutilans", nomePopular: "bico-virado-carijó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Furnarius figulus", nomePopular: "casaca-de-couro-da-lama", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Furnarius rufus", nomePopular: "joão-de-barro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lochmias nematura", nomePopular: "joão-porca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phleocryptes melanops", nomePopular: "bate-bico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Limnornis curvirostris", nomePopular: "joão-da-palha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cinclodes pabsti", nomePopular: "pedreiro", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Cinclodes fuscus", nomePopular: "pedreiro-dos-andes", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anabazenops fuscus", nomePopular: "trepador-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cichlocolaptes leucophrus", nomePopular: "trepador-sobrancelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heliobletus contaminatus", nomePopular: "trepadorzinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Philydor atricapillus", nomePopular: "limpa-folha-coroado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anabacerthia amaurotis", nomePopular: "limpa-folha-miúdo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anabacerthia lichtensteini", nomePopular: "limpa-folha-ocráceo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Syndactyla rufosuperciliata", nomePopular: "trepador-quiete", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dendroma rufa", nomePopular: "limpa-folha-de-testa-baia", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Clibanornis dendrocolaptoides", nomePopular: "cisqueiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Automolus leucophthalmus", nomePopular: "barranqueiro-de-olho-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptasthenura striolata", nomePopular: "grimpeirinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptasthenura setaria", nomePopular: "grimpeiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phacellodomus striaticollis", nomePopular: "tio-tio", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Phacellodomus ferrugineigula", nomePopular: "joão-botina-do-brejo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anumbius annumbi", nomePopular: "cochicho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Limnoctites rectirostris", nomePopular: "arredio-do-gravatá", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Cranioleuca obsoleta", nomePopular: "arredio-oliváceo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cranioleuca pallida", nomePopular: "arredio-pálido", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spartonoica maluroides", nomePopular: "boininha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Certhiaxis cinnamomeus", nomePopular: "curutié", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Schoeniophylax phryganophilus", nomePopular: "bichoita", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis cinerascens", nomePopular: "pi-puí", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis ruficapilla", nomePopular: "pichororé", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis spixi", nomePopular: "joão-teneném", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis albescens", nomePopular: "uí-pi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Synallaxis frontalis", nomePopular: "petrim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ilicura militaris", nomePopular: "tangarazinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chiroxiphia caudata", nomePopular: "tangará", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Manacus manacus", nomePopular: "rendeira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Carpornis cucullata", nomePopular: "corocoxó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phibalura flavirostris", nomePopular: "tesourinha-da-mata", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Pyroderus scutatus", nomePopular: "pavó", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Lipaugus lanioides", nomePopular: "tropeiro-da-serra", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Procnias nudicollis", nomePopular: "araponga", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Schiffornis virescens", nomePopular: "flautim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tityra inquisitor", nomePopular: "anambé-branco-de-bochecha-parda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tityra cayana", nomePopular: "anambé-branco-de-rabo-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tityra semifasciata", nomePopular: "anambé-branco-de-máscara-negra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus viridis", nomePopular: "caneleiro-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus castaneus", nomePopular: "caneleiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus polychopterus", nomePopular: "caneleiro-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus marginatus", nomePopular: "caneleiro-bordado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pachyramphus validus", nomePopular: "caneleiro-de-chapéu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Oxyruncus cristatus", nomePopular: "araponga-do-horto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Onychorhynchus swainsoni", nomePopular: "maria-leque-do-sudeste", sc: "CR", icmbio: "VU", iucn: "VU" },
            { especie: "Myiobius barbatus", nomePopular: "assanhadinho", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Myiobius atricaudus", nomePopular: "assanhadinho-de-cauda-preta", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Piprites chloris", nomePopular: "papinho-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Piprites pileata", nomePopular: "caneleirinho-de-chapéu-preto", sc: "EN", icmbio: "LC", iucn: "NT" },
            { especie: "Platyrinchus mystaceus", nomePopular: "patinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Platyrinchus leucoryphus", nomePopular: "patinho-de-asa-castanha", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Tachuris rubrigastra", nomePopular: "papa-piri", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Mionectes rufiventris", nomePopular: "abre-asa-de-cabeça-cinza", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leptopogon amaurocephalus", nomePopular: "cabeçudo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Corythopis delalandi", nomePopular: "estalador", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes eximius", nomePopular: "barbudinho", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Phylloscartes ventralis", nomePopular: "borboletinha-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes kronei", nomePopular: "maria-da-restinga", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes oustaleti", nomePopular: "papa-moscas-de-olheiras", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes difficilis", nomePopular: "estalinho", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Phylloscartes sylviolus", nomePopular: "maria-pequena", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Tolmomyias sulphurescens", nomePopular: "bico-chato-de-orelha-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Todirostrum poliocephalum", nomePopular: "teque-teque", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Todirostrum cinereum", nomePopular: "ferreirinho-relógio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Poecilotriccus plumbeiceps", nomePopular: "tororó", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiornis auricularis", nomePopular: "miudinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus diops", nomePopular: "olho-falso", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus obsoletus", nomePopular: "catraca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus orbitatus", nomePopular: "tiririzinho-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus nidipendulus", nomePopular: "tachuri-campainha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemitriccus kaempferi", nomePopular: "maria-catarinense", sc: "VU", icmbio: "VU", iucn: "VU" },
            { especie: "Hirundinea ferruginea", nomePopular: "gibão-de-couro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euscarthmus meloryphus", nomePopular: "barulhento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyranniscus burmeisteri", nomePopular: "piolhinho-chiador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Camptostoma obsoletum", nomePopular: "risadinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia flavogaster", nomePopular: "guaracava-de-barriga-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia spectabilis", nomePopular: "guaracava-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia chilensis", nomePopular: "guaracava-de-crista-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia parvirostris", nomePopular: "tuque-pium", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia mesoleuca", nomePopular: "tuque", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Elaenia obscura", nomePopular: "tucão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiopagis caniceps", nomePopular: "guaracava-cinzenta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiopagis viridicata", nomePopular: "guaracava-de-crista-alaranjada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Capsiempis flaveola", nomePopular: "marianinha-amarela", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phyllomyias virescens", nomePopular: "piolhinho-verdoso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phyllomyias fasciatus", nomePopular: "piolhinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Phyllomyias griseocapilla", nomePopular: "piolhinho-serrano", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Culicivora caudacuta", nomePopular: "papa-moscas-do-campo", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Polystictus pectoralis", nomePopular: "papa-moscas-canela", sc: "CR", icmbio: "LC", iucn: "NT" },
            { especie: "Pseudocolopteryx sclateri", nomePopular: "tricolino", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pseudocolopteryx acutipennis", nomePopular: "tricolino-oliváceo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pseudocolopteryx flaviventris", nomePopular: "amarelinho-do-junco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Serpophaga nigricans", nomePopular: "joão-pobre", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Serpophaga subcristata", nomePopular: "alegrinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Serpophaga griseicapilla", nomePopular: "alegrinho-trinador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Attila phoenicurus", nomePopular: "capitão-castanho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Attila rufus", nomePopular: "capitão-de-saíra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Legatus leucophaius", nomePopular: "bem-te-vi-pirata", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphotrigon megacephalum", nomePopular: "maria-cabeçuda", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiarchus swainsoni", nomePopular: "irré", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiarchus ferox", nomePopular: "maria-cavaleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sirystes sibilator", nomePopular: "gritador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pitangus sulphuratus", nomePopular: "bem-te-vi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Machetornis rixosa", nomePopular: "suiriri-cavaleiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiodynastes maculatus", nomePopular: "bem-te-vi-rajado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Megarynchus pitangua", nomePopular: "neinei", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiozetetes similis", nomePopular: "bentevizinho-de-penacho-vermelho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyrannus albogularis", nomePopular: "suiriri-de-garganta-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyrannus melancholicus", nomePopular: "suiriri", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyrannus savana", nomePopular: "tesourinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tyrannus tyrannus", nomePopular: "suiriri-valente", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Griseotyrannus aurantioatrocristatus", nomePopular: "peitica-de-chapéu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Empidonomus varius", nomePopular: "peitica", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Conopias trivirgatus", nomePopular: "bem-te-vi-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Colonia colonus", nomePopular: "viuvinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Arundinicola leucocephala", nomePopular: "freirinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fluvicola albiventer", nomePopular: "lavadeira-de-cara-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Fluvicola nengeta", nomePopular: "lavadeira-mascarada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pyrocephalus rubinus", nomePopular: "príncipe", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Muscipipra vetula", nomePopular: "tesoura-cinzenta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Gubernetes yetapa", nomePopular: "tesoura-do-brejo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Heteroxolmis dominicanus", nomePopular: "noivinha-de-rabo-preto", sc: "EN", icmbio: "VU", iucn: "VU" },
            { especie: "Myiophobus fasciatus", nomePopular: "filipe", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cnemotriccus fuscatus", nomePopular: "guaracavuçu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lathrotriccus euleri", nomePopular: "enferrujado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Contopus cinereus", nomePopular: "papa-moscas-cinzento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Satrapa icterophrys", nomePopular: "suiriri-pequeno", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Lessonia rufa", nomePopular: "colegial", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hymenops perspicillatus", nomePopular: "viuvinha-de-óculos", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Knipolegus lophotes", nomePopular: "maria-preta-de-penacho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Knipolegus nigerrimus", nomePopular: "maria-preta-de-garganta-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Knipolegus cyanirostris", nomePopular: "maria-preta-de-bico-azulado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xolmis irupero", nomePopular: "noivinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xolmis velatus", nomePopular: "noivinha-branca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Nengetus cinereus", nomePopular: "primavera", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyclarhis gujanensis", nomePopular: "pitiguari", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hylophilus poicilotis", nomePopular: "verdinho-coroado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Vireo chivi", nomePopular: "juruviara", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanocorax caeruleus", nomePopular: "gralha-azul", sc: "LC", icmbio: "LC", iucn: "VU" },
            { especie: "Cyanocorax cristatellus", nomePopular: "gralha-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanocorax chrysops", nomePopular: "gralha-picaça", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pygochelidon cyanoleuca", nomePopular: "andorinha-pequena-de-casa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Alopochelidon fucata", nomePopular: "andorinha-morena", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stelgidopteryx ruficollis", nomePopular: "andorinha-serradora", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Progne tapera", nomePopular: "andorinha-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Progne subis", nomePopular: "andorinha-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Progne chalybea", nomePopular: "andorinha-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Progne elegans", nomePopular: "andorinha-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tachycineta albiventer", nomePopular: "andorinha-do-rio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tachycineta leucorrhoa", nomePopular: "andorinha-de-sobre-branco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tachycineta leucopyga", nomePopular: "andorinha-chilena", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Riparia riparia", nomePopular: "andorinha-do-barranco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hirundo rustica", nomePopular: "andorinha-de-bando", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Petrochelidon pyrrhonota", nomePopular: "andorinha-de-dorso-acanelado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Troglodytes musculus", nomePopular: "corruíra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cistothorus platensis", nomePopular: "corruíra-do-campo", sc: "CR", icmbio: "LC", iucn: "LC" },
            { especie: "Campylorhynchus turdinus", nomePopular: "catatau", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cantorchilus longirostris", nomePopular: "garrinchão-de-bico-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphocaenus melanurus", nomePopular: "chirito", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Polioptila dumicola", nomePopular: "balança-rabo-de-máscara", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Polioptila lactea", nomePopular: "balança-rabo-leitoso", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Catharus fuscescens", nomePopular: "sabiazinho-norte-americano", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Catharus swainsoni", nomePopular: "sabiazinho-de-óculos", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus flavipes", nomePopular: "sabiá-una", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus leucomelas", nomePopular: "sabiá-barranco", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus rufiventris", nomePopular: "sabiá-laranjeira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus amaurochalinus", nomePopular: "sabiá-poca", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus subalaris", nomePopular: "sabiá-ferreiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Turdus albicollis", nomePopular: "sabiá-coleira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mimus saturninus", nomePopular: "sabiá-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Mimus triurus", nomePopular: "calhandra-de-três-rabos", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sturnus vulgaris", nomePopular: "estorninho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Estrilda astrild", nomePopular: "bico-de-lacre", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Passer domesticus", nomePopular: "pardal", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anthus chii", nomePopular: "caminheiro-zumbidor", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anthus correndera", nomePopular: "caminheiro-de-espora", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Anthus nattereri", nomePopular: "caminheiro-dourado", sc: "EN", icmbio: "VU", iucn: "VU" },
            { especie: "Anthus hellmayri", nomePopular: "caminheiro-de-barriga-acanelada", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Spinus magellanicus", nomePopular: "pintassilgo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanophonia cyanocephala", nomePopular: "gaturamo-rei", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chlorophonia cyanea", nomePopular: "gaturamo-bandeira", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euphonia chlorotica", nomePopular: "fim-fim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euphonia chalybea", nomePopular: "cais-cais", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euphonia violacea", nomePopular: "gaturamo-verdadeiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Euphonia pectoralis", nomePopular: "ferro-velho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ammodramus humeralis", nomePopular: "tico-tico-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Arremon semitorquatus", nomePopular: "tico-tico-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Zonotrichia capensis", nomePopular: "tico-tico", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Leistes superciliaris", nomePopular: "polícia-inglesa-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cacicus chrysopterus", nomePopular: "tecelão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cacicus haemorrhous", nomePopular: "guaxe", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Icterus pyrrhopterus", nomePopular: "encontro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Icterus galbula", nomePopular: "corrupião-de-baltimore", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Molothrus rufoaxillaris", nomePopular: "chupim-azeviche", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Molothrus oryzivorus", nomePopular: "iraúna-grande", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Molothrus bonariensis", nomePopular: "chupim", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amblyramphus holosericeus", nomePopular: "cardeal-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Gnorimopsar chopi", nomePopular: "pássaro-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Agelaioides badius", nomePopular: "asa-de-telha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Agelasticus thilius", nomePopular: "sargento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chrysomus ruficapillus", nomePopular: "garibaldi", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Xanthopsar flavus", nomePopular: "veste-amarela", sc: "CR", icmbio: "VU", iucn: "EN" },
            { especie: "Pseudoleistes guirahuro", nomePopular: "chupim-do-brejo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pseudoleistes virescens", nomePopular: "dragão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Geothlypis aequinoctialis", nomePopular: "pia-cobra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Setophaga cerulea", nomePopular: "mariquita-azul", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Setophaga pitiayumi", nomePopular: "mariquita", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Setophaga striata", nomePopular: "mariquita-de-perna-clara", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Myiothlypis leucoblephara", nomePopular: "pula-pula-assobiador", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Myiothlypis rivularis", nomePopular: "pula-pula-ribeirinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Basileuterus culicivorus", nomePopular: "pula-pula", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Orthogonys chloricterus", nomePopular: "catirumbava", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Piranga flava", nomePopular: "sanhaço-de-fogo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Habia rubica", nomePopular: "tiê-de-bando", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Amaurospiza moesta", nomePopular: "negrinho-do-mato", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanoloxia glaucocaerulea", nomePopular: "azulinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanoloxia brissonii", nomePopular: "azulão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Orchesticus abeillei", nomePopular: "sanhaço-pardo", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Nemosia pileata", nomePopular: "saíra-de-chapéu-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Embernagra platensis", nomePopular: "sabiá-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Emberizoides herbicola", nomePopular: "canário-do-campo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Emberizoides ypiranganus", nomePopular: "canário-do-brejo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rhopospina fruticeti", nomePopular: "canário-andino-negro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Chlorophanes spiza", nomePopular: "saí-verde", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemithraupis guira", nomePopular: "saíra-de-papo-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Hemithraupis ruficapilla", nomePopular: "saíra-ferrugem", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tersina viridis", nomePopular: "saí-andorinha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cyanerpes cyaneus", nomePopular: "saíra-beija-flor", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Dacnis nigripes", nomePopular: "saí-de-pernas-pretas", sc: "LC", icmbio: "LC", iucn: "NT" },
            { especie: "Dacnis cayana", nomePopular: "saí-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Saltator similis", nomePopular: "trinca-ferro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Saltator maxillosus", nomePopular: "bico-grosso", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Saltator fuliginosus", nomePopular: "bico-de-pimenta", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Coereba flaveola", nomePopular: "cambacica", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Asemospiza fuliginosa", nomePopular: "cigarra-preta", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Volatinia jacarina", nomePopular: "tiziu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Trichothraupis melanops", nomePopular: "tiê-de-topete", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Loriotus cristatus", nomePopular: "tiê-galo", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Tachyphonus coronatus", nomePopular: "tiê-preto", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphocelus bresilia", nomePopular: "tiê-sangue", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Ramphocelus carbo", nomePopular: "pipira-vermelha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila lineola", nomePopular: "bigodinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila frontalis", nomePopular: "pixoxó", sc: "VU", icmbio: "LC", iucn: "VU" },
            { especie: "Sporophila falcirostris", nomePopular: "cigarrinha-do-sul", sc: "EN", icmbio: "VU", iucn: "VU" },
            { especie: "Sporophila beltoni", nomePopular: "patativa-tropeira", sc: "LC", icmbio: "VU", iucn: "VU" },
            { especie: "Sporophila collaris", nomePopular: "coleiro-do-brejo", sc: "LC", icmbio: "VU", iucn: "LC" },
            { especie: "Sporophila caerulescens", nomePopular: "coleirinho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila leucoptera", nomePopular: "chorão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila pileata", nomePopular: "caboclinho-coroado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila hypoxantha", nomePopular: "caboclinho-de-barriga-vermelha", sc: "VU", icmbio: "LC", iucn: "LC" },
            { especie: "Sporophila ruficollis", nomePopular: "caboclinho-de-papo-escuro", sc: "LC", icmbio: "VU", iucn: "NT" },
            { especie: "Sporophila palustris", nomePopular: "caboclinho-de-papo-branco", sc: "LC", icmbio: "VU", iucn: "EN" },
            { especie: "Sporophila cinnamomea", nomePopular: "caboclinho-de-chapéu-cinzento", sc: "CR", icmbio: "VU", iucn: "VU" },
            { especie: "Sporophila melanogaster", nomePopular: "caboclinho-de-barriga-preta", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Sporophila angolensis", nomePopular: "curió", sc: "CR", icmbio: "VU", iucn: "LC" },
            { especie: "Poospiza nigrorufa", nomePopular: "quem-te-vestiu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thlypopsis sordida", nomePopular: "saí-canário", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thlypopsis pyrrhocoma", nomePopular: "cabecinha-castanha", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Castanozoster thoracicus", nomePopular: "peito-pinhão", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Donacospiza albifrons", nomePopular: "tico-tico-do-banhado", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Microspingus cabanisi", nomePopular: "quete-do-sul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Conirostrum speciosum", nomePopular: "figuinha-de-rabo-castanho", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Conirostrum bicolor", nomePopular: "figuinha-do-mangue", sc: "VU", icmbio: "LC", iucn: "NT" },
            { especie: "Sicalis citrina", nomePopular: "canário-rasteiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sicalis flaveola", nomePopular: "canário-da-terra", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Sicalis luteola", nomePopular: "tipio", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Haplospiza unicolor", nomePopular: "cigarra-bambu", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Pipraeidea melanonota", nomePopular: "saíra-viúva", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Rauenia bonariensis", nomePopular: "sanhaço-papa-laranja", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stephanophorus diadematus", nomePopular: "sanhaço-frade", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Cissopis leverianus", nomePopular: "tietinga", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Schistochlamys ruficapillus", nomePopular: "bico-de-veludo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Paroaria coronata", nomePopular: "cardeal", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thraupis sayaca", nomePopular: "sanhaço-cinzento", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thraupis cyanoptera", nomePopular: "sanhaço-de-encontro-azul", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thraupis palmarum", nomePopular: "sanhaço-do-coqueiro", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Thraupis ornata", nomePopular: "sanhaço-de-encontro-amarelo", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Stilpnia peruviana", nomePopular: "saíra-sapucaia", sc: "EN", icmbio: "LC", iucn: "LC" },
            { especie: "Stilpnia preciosa", nomePopular: "saíra-preciosa", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tangara seledon", nomePopular: "saíra-sete-cores", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tangara cyanocephala", nomePopular: "saíra-militar", sc: "LC", icmbio: "LC", iucn: "LC" },
            { especie: "Tangara desmaresti", nomePopular: "saíra-lagarta", sc: "LC", icmbio: "LC", iucn: "LC" }
        ];

        // Construir speciesInfo e BIRD_DATABASE

            const ordemMap = {
                "Rhea": "Rheiformes", "Tinamus": "Tinamiformes", "Crypturellus": "Tinamiformes",
                "Rhynchotus": "Tinamiformes", "Nothura": "Tinamiformes", "Taoniscus": "Tinamiformes",
                "Anhima": "Anseriformes", "Chauna": "Anseriformes", "Dendrocygna": "Anseriformes",
                "Coscoroba": "Anseriformes", "Cairina": "Anseriformes", "Sarkidiornis": "Anseriformes",
                "Callonetta": "Anseriformes", "Amazonetta": "Anseriformes", "Spatula": "Anseriformes",
                "Mareca": "Anseriformes", "Anas": "Anseriformes", "Netta": "Anseriformes",
                "Heteronetta": "Anseriformes", "Nomonyx": "Anseriformes", "Oxyura": "Anseriformes",
                "Penelope": "Galliformes", "Aburria": "Galliformes", "Ortalis": "Galliformes",
                "Odontophorus": "Galliformes", "Colinus": "Galliformes", "Phoenicopterus": "Phoenicopteriformes",
                "Phoenicoparrus": "Phoenicopteriformes", "Rollandia": "Podicipediformes", "Tachybaptus": "Podicipediformes",
                "Podilymbus": "Podicipediformes", "Podicephorus": "Podicipediformes", "Podiceps": "Podicipediformes",
                "Aptenodytes": "Sphenisciformes", "Spheniscus": "Sphenisciformes", "Diomedea": "Procellariiformes",
                "Thalassarche": "Procellariiformes", "Oceanites": "Procellariiformes", "Macronectes": "Procellariiformes",
                "Fulmarus": "Procellariiformes", "Daption": "Procellariiformes", "Pterodroma": "Procellariiformes",
                "Procellaria": "Procellariiformes", "Calonectris": "Procellariiformes", "Ardenna": "Procellariiformes",
                "Puffinus": "Procellariiformes", "Phaethon": "Phaethontiformes", "Ciconia": "Ciconiiformes",
                "Jabiru": "Ciconiiformes", "Mycteria": "Ciconiiformes", "Fregata": "Suliformes",
                "Morus": "Suliformes", "Sula": "Suliformes", "Anhinga": "Suliformes", "Nannopterum": "Suliformes",
                "Tigrisoma": "Pelecaniformes", "Cochlearius": "Pelecaniformes", "Botaurus": "Pelecaniformes",
                "Ixobrychus": "Pelecaniformes", "Nycticorax": "Pelecaniformes", "Nyctanassa": "Pelecaniformes",
                "Butorides": "Pelecaniformes", "Bubulcus": "Pelecaniformes", "Ardea": "Pelecaniformes",
                "Syrigma": "Pelecaniformes", "Pilherodius": "Pelecaniformes", "Egretta": "Pelecaniformes",
                "Eudocimus": "Pelecaniformes", "Plegadis": "Pelecaniformes", "Mesembrinibis": "Pelecaniformes",
                "Phimosus": "Pelecaniformes", "Theristicus": "Pelecaniformes", "Platalea": "Pelecaniformes",
                "Sarcoramphus": "Cathartiformes", "Coragyps": "Cathartiformes", "Cathartes": "Cathartiformes",
                "Pandion": "Accipitriformes", "Elanus": "Accipitriformes", "Chondrohierax": "Accipitriformes",
                "Leptodon": "Accipitriformes", "Elanoides": "Accipitriformes", "Spizaetus": "Accipitriformes",
                "Rostrhamus": "Accipitriformes", "Harpagus": "Accipitriformes", "Ictinia": "Accipitriformes",
                "Circus": "Accipitriformes", "Hieraspiza": "Accipitriformes", "Accipiter": "Accipitriformes",
                "Geranospiza": "Accipitriformes", "Heterospizias": "Accipitriformes", "Amadonastur": "Accipitriformes",
                "Urubitinga": "Accipitriformes", "Rupornis": "Accipitriformes", "Parabuteo": "Accipitriformes",
                "Geranoaetus": "Accipitriformes", "Pseudastur": "Accipitriformes", "Buteo": "Accipitriformes",
                "Eurypyga": "Eurypygiformes", "Aramus": "Gruiformes", "Rallus": "Gruiformes",
                "Porphyrio": "Gruiformes", "Laterallus": "Gruiformes", "Mustelirallus": "Gruiformes",
                "Neocrex": "Gruiformes", "Pardirallus": "Gruiformes", "Amaurolimnas": "Gruiformes",
                "Aramides": "Gruiformes", "Porphyriops": "Gruiformes", "Gallinula": "Gruiformes",
                "Fulica": "Gruiformes", "Coturnicops": "Gruiformes", "Heliornis": "Gruiformes",
                "Pluvialis": "Charadriiformes", "Oreopholus": "Charadriiformes", "Vanellus": "Charadriiformes",
                "Charadrius": "Charadriiformes", "Haematopus": "Charadriiformes", "Himantopus": "Charadriiformes",
                "Chionis": "Charadriiformes", "Bartramia": "Charadriiformes", "Numenius": "Charadriiformes",
                "Limosa": "Charadriiformes", "Arenaria": "Charadriiformes", "Calidris": "Charadriiformes",
                "Limnodromus": "Charadriiformes", "Gallinago": "Charadriiformes", "Phalaropus": "Charadriiformes",
                "Actitis": "Charadriiformes", "Tringa": "Charadriiformes", "Thinocorus": "Charadriiformes",
                "Jacana": "Charadriiformes", "Nycticryphes": "Charadriiformes", "Stercorarius": "Charadriiformes",
                "Chroicocephalus": "Charadriiformes", "Leucophaeus": "Charadriiformes", "Larus": "Charadriiformes",
                "Anous": "Charadriiformes", "Rynchops": "Charadriiformes", "Sternula": "Charadriiformes",
                "Phaetusa": "Charadriiformes", "Sterna": "Charadriiformes", "Thalasseus": "Charadriiformes",
                "Columba": "Columbiformes", "Patagioenas": "Columbiformes", "Geotrygon": "Columbiformes",
                "Leptotila": "Columbiformes", "Zenaida": "Columbiformes", "Claravis": "Columbiformes",
                "Columbina": "Columbiformes", "Opisthocomus": "Opisthocomiformes", "Guira": "Cuculiformes",
                "Crotophaga": "Cuculiformes", "Tapera": "Cuculiformes", "Dromococcyx": "Cuculiformes",
                "Neomorphus": "Cuculiformes", "Micrococcyx": "Cuculiformes", "Piaya": "Cuculiformes",
                "Coccyzus": "Cuculiformes", "Tyto": "Strigiformes", "Megascops": "Strigiformes",
                "Pulsatrix": "Strigiformes", "Bubo": "Strigiformes", "Strix": "Strigiformes",
                "Glaucidium": "Strigiformes", "Athene": "Strigiformes", "Aegolius": "Strigiformes",
                "Asio": "Strigiformes", "Steatornis": "Steatornithiformes", "Nyctibius": "Nyctibiiformes",
                "Antrostomus": "Caprimulgiformes", "Lurocalis": "Caprimulgiformes", "Nyctidromus": "Caprimulgiformes",
                "Hydropsalis": "Caprimulgiformes", "Podager": "Caprimulgiformes", "Chordeiles": "Caprimulgiformes",
                "Cypseloides": "Apodiformes", "Streptoprocne": "Apodiformes", "Chaetura": "Apodiformes",
                "Panyptila": "Apodiformes", "Florisuga": "Apodiformes", "Ramphodon": "Apodiformes",
                "Phaethornis": "Apodiformes", "Colibri": "Apodiformes", "Heliothryx": "Apodiformes",
                "Anthracothorax": "Apodiformes", "Lophornis": "Apodiformes", "Heliodoxa": "Apodiformes",
                "Heliomaster": "Apodiformes", "Calliphlox": "Apodiformes", "Chlorostilbon": "Apodiformes",
                "Stephanoxis": "Apodiformes", "Thalurania": "Apodiformes", "Eupetomena": "Apodiformes",
                "Aphantochroa": "Apodiformes", "Chrysuronia": "Apodiformes", "Leucochloris": "Apodiformes",
                "Chionomesa": "Apodiformes", "Hylocharis": "Apodiformes", "Augastes": "Apodiformes",
                "Trogon": "Trogoniformes", "Megaceryle": "Coraciiformes", "Chloroceryle": "Coraciiformes",
                "Baryphthengus": "Coraciiformes", "Nonnula": "Galbuliformes", "Malacoptila": "Galbuliformes",
                "Notharchus": "Galbuliformes", "Nystalus": "Galbuliformes", "Ramphastos": "Piciformes",
                "Selenidera": "Piciformes", "Pteroglossus": "Piciformes", "Picumnus": "Piciformes",
                "Melanerpes": "Piciformes", "Veniliornis": "Piciformes", "Campephilus": "Piciformes",
                "Dryocopus": "Piciformes", "Celeus": "Piciformes", "Piculus": "Piciformes",
                "Colaptes": "Piciformes", "Cariama": "Cariamiformes", "Herpetotheres": "Falconiformes",
                "Micrastur": "Falconiformes", "Caracara": "Falconiformes", "Milvago": "Falconiformes",
                "Falco": "Falconiformes", "Touit": "Psittaciformes", "Myiopsitta": "Psittaciformes",
                "Brotogeris": "Psittaciformes", "Pionopsitta": "Psittaciformes", "Triclaria": "Psittaciformes",
                "Pionus": "Psittaciformes", "Amazona": "Psittaciformes", "Forpus": "Psittaciformes",
                "Pyrrhura": "Psittaciformes", "Primolius": "Psittaciformes", "Psittacara": "Psittaciformes",
                "Pyrilia": "Psittaciformes",
                // Passeriformes — listados explicitamente (antes caíam no fallback silencioso)
                "Terenura": "Passeriformes", "Myrmotherula": "Passeriformes", "Formicivora": "Passeriformes",
                "Rhopias": "Passeriformes", "Dysithamnus": "Passeriformes", "Herpsilochmus": "Passeriformes",
                "Thamnophilus": "Passeriformes", "Hypoedaleus": "Passeriformes", "Batara": "Passeriformes",
                "Mackenziaena": "Passeriformes", "Biatas": "Passeriformes", "Myrmoderus": "Passeriformes",
                "Pyriglena": "Passeriformes", "Drymophila": "Passeriformes", "Conopophaga": "Passeriformes",
                "Grallaria": "Passeriformes", "Cryptopezus": "Passeriformes", "Psilorhamphus": "Passeriformes",
                "Merulaxis": "Passeriformes", "Eleoscytalopus": "Passeriformes", "Scytalopus": "Passeriformes",
                "Formicarius": "Passeriformes", "Chamaeza": "Passeriformes", "Sclerurus": "Passeriformes",
                "Geositta": "Passeriformes", "Sittasomus": "Passeriformes", "Dendrocincla": "Passeriformes",
                "Dendrocolaptes": "Passeriformes", "Xiphocolaptes": "Passeriformes", "Xiphorhynchus": "Passeriformes",
                "Campylorhamphus": "Passeriformes", "Lepidocolaptes": "Passeriformes", "Xenops": "Passeriformes",
                "Furnarius": "Passeriformes", "Lochmias": "Passeriformes", "Phleocryptes": "Passeriformes",
                "Limnornis": "Passeriformes", "Cinclodes": "Passeriformes", "Anabazenops": "Passeriformes",
                "Cichlocolaptes": "Passeriformes", "Heliobletus": "Passeriformes", "Philydor": "Passeriformes",
                "Anabacerthia": "Passeriformes", "Syndactyla": "Passeriformes", "Dendroma": "Passeriformes",
                "Clibanornis": "Passeriformes", "Automolus": "Passeriformes", "Leptasthenura": "Passeriformes",
                "Phacellodomus": "Passeriformes", "Anumbius": "Passeriformes", "Limnoctites": "Passeriformes",
                "Cranioleuca": "Passeriformes", "Spartonoica": "Passeriformes", "Certhiaxis": "Passeriformes",
                "Schoeniophylax": "Passeriformes", "Synallaxis": "Passeriformes", "Ilicura": "Passeriformes",
                "Chiroxiphia": "Passeriformes", "Manacus": "Passeriformes", "Carpornis": "Passeriformes",
                "Pyroderus": "Passeriformes", "Lipaugus": "Passeriformes", "Procnias": "Passeriformes",
                "Phibalura": "Passeriformes", "Cotinga": "Passeriformes", "Schiffornis": "Passeriformes",
                "Tityra": "Passeriformes", "Pachyramphus": "Passeriformes", "Oxyruncus": "Passeriformes",
                "Onychorhynchus": "Passeriformes", "Myiobius": "Passeriformes", "Piprites": "Passeriformes",
                "Platyrinchus": "Passeriformes", "Tachuris": "Passeriformes", "Mionectes": "Passeriformes",
                "Leptopogon": "Passeriformes", "Corythopis": "Passeriformes", "Phylloscartes": "Passeriformes",
                "Tolmomyias": "Passeriformes", "Todirostrum": "Passeriformes", "Poecilotriccus": "Passeriformes",
                "Myiornis": "Passeriformes", "Hemitriccus": "Passeriformes", "Hirundinea": "Passeriformes",
                "Euscarthmus": "Passeriformes", "Tyranniscus": "Passeriformes", "Camptostoma": "Passeriformes",
                "Elaenia": "Passeriformes", "Myiopagis": "Passeriformes", "Capsiempis": "Passeriformes",
                "Phyllomyias": "Passeriformes", "Culicivora": "Passeriformes", "Polystictus": "Passeriformes",
                "Pseudocolopteryx": "Passeriformes", "Serpophaga": "Passeriformes", "Attila": "Passeriformes",
                "Legatus": "Passeriformes", "Ramphotrigon": "Passeriformes", "Myiarchus": "Passeriformes",
                "Sirystes": "Passeriformes", "Pitangus": "Passeriformes", "Machetornis": "Passeriformes",
                "Myiodynastes": "Passeriformes", "Megarynchus": "Passeriformes", "Myiozetetes": "Passeriformes",
                "Tyrannus": "Passeriformes", "Griseotyrannus": "Passeriformes", "Empidonomus": "Passeriformes",
                "Conopias": "Passeriformes", "Colonia": "Passeriformes", "Arundinicola": "Passeriformes",
                "Fluvicola": "Passeriformes", "Pyrocephalus": "Passeriformes", "Muscipipra": "Passeriformes",
                "Gubernetes": "Passeriformes", "Heteroxolmis": "Passeriformes", "Myiophobus": "Passeriformes",
                "Cnemotriccus": "Passeriformes", "Lathrotriccus": "Passeriformes", "Contopus": "Passeriformes",
                "Satrapa": "Passeriformes", "Lessonia": "Passeriformes", "Hymenops": "Passeriformes",
                "Knipolegus": "Passeriformes", "Xolmis": "Passeriformes", "Nengetus": "Passeriformes",
                "Cyclarhis": "Passeriformes", "Hylophilus": "Passeriformes", "Vireo": "Passeriformes",
                "Cyanocorax": "Passeriformes", "Pygochelidon": "Passeriformes", "Alopochelidon": "Passeriformes",
                "Stelgidopteryx": "Passeriformes", "Progne": "Passeriformes", "Tachycineta": "Passeriformes",
                "Riparia": "Passeriformes", "Hirundo": "Passeriformes", "Petrochelidon": "Passeriformes",
                "Troglodytes": "Passeriformes", "Cistothorus": "Passeriformes", "Campylorhynchus": "Passeriformes",
                "Cantorchilus": "Passeriformes", "Ramphocaenus": "Passeriformes", "Polioptila": "Passeriformes",
                "Catharus": "Passeriformes", "Turdus": "Passeriformes", "Mimus": "Passeriformes",
                "Sturnus": "Passeriformes", "Estrilda": "Passeriformes", "Passer": "Passeriformes",
                "Anthus": "Passeriformes", "Spinus": "Passeriformes", "Cyanophonia": "Passeriformes",
                "Chlorophonia": "Passeriformes", "Euphonia": "Passeriformes", "Ammodramus": "Passeriformes",
                "Arremon": "Passeriformes", "Zonotrichia": "Passeriformes", "Leistes": "Passeriformes",
                "Cacicus": "Passeriformes", "Psarocolius": "Passeriformes", "Icterus": "Passeriformes",
                "Molothrus": "Passeriformes", "Amblyramphus": "Passeriformes", "Gnorimopsar": "Passeriformes",
                "Agelaioides": "Passeriformes", "Agelasticus": "Passeriformes", "Chrysomus": "Passeriformes",
                "Xanthopsar": "Passeriformes", "Pseudoleistes": "Passeriformes", "Geothlypis": "Passeriformes",
                "Setophaga": "Passeriformes", "Myiothlypis": "Passeriformes", "Basileuterus": "Passeriformes",
                "Orthogonys": "Passeriformes", "Piranga": "Passeriformes", "Habia": "Passeriformes",
                "Amaurospiza": "Passeriformes", "Cyanoloxia": "Passeriformes", "Orchesticus": "Passeriformes",
                "Nemosia": "Passeriformes", "Embernagra": "Passeriformes", "Emberizoides": "Passeriformes",
                "Rhopospina": "Passeriformes", "Hemithraupis": "Passeriformes", "Tersina": "Passeriformes",
                "Cyanerpes": "Passeriformes", "Dacnis": "Passeriformes", "Saltator": "Passeriformes",
                "Coereba": "Passeriformes", "Asemospiza": "Passeriformes", "Volatinia": "Passeriformes",
                "Trichothraupis": "Passeriformes", "Loriotus": "Passeriformes", "Coryphospingus": "Passeriformes",
                "Tachyphonus": "Passeriformes", "Ramphocelus": "Passeriformes", "Sporophila": "Passeriformes",
                "Poospiza": "Passeriformes", "Thlypopsis": "Passeriformes", "Castanozoster": "Passeriformes",
                "Donacospiza": "Passeriformes", "Microspingus": "Passeriformes", "Conirostrum": "Passeriformes",
                "Sicalis": "Passeriformes", "Haplospiza": "Passeriformes", "Pipraeidea": "Passeriformes",
                "Rauenia": "Passeriformes", "Stephanophorus": "Passeriformes", "Cissopis": "Passeriformes",
                "Schistochlamys": "Passeriformes", "Paroaria": "Passeriformes", "Thraupis": "Passeriformes",
                "Stilpnia": "Passeriformes", "Tangara": "Passeriformes", "Chlorophanes": "Passeriformes"
            };

            //GÊNERO PARA FAMÍLIA
            const familiaMap = {
"Rhea": "Rheidae",
"Tinamus": "Tinamidae",
"Crypturellus": "Tinamidae",
"Rhynchotus": "Tinamidae",
"Nothura": "Tinamidae",
"Taoniscus": "Tinamidae",
"Anhima": "Anhimidae",
"Chauna": "Anhimidae",
"Dendrocygna": "Anatidae",
"Coscoroba": "Anatidae",
"Cairina": "Anatidae",
"Sarkidiornis": "Anatidae",
"Callonetta": "Anatidae",
"Amazonetta": "Anatidae",
"Spatula": "Anatidae",
"Mareca": "Anatidae",
"Anas": "Anatidae",
"Netta": "Anatidae",
"Heteronetta": "Anatidae",
"Nomonyx": "Anatidae",
"Oxyura": "Anatidae",
"Penelope": "Cracidae",
"Aburria": "Cracidae",
"Ortalis": "Cracidae",
"Odontophorus": "Odontophoridae",
"Colinus": "Odontophoridae",
"Rollandia": "Podicipedidae",
"Tachybaptus": "Podicipedidae",
"Podilymbus": "Podicipedidae",
"Podicephorus": "Podicipedidae",
"Podiceps": "Podicipedidae",
"Phoenicopterus": "Phoenicopteridae",
"Phoenicoparrus": "Phoenicopteridae",
"Aptenodytes": "Spheniscidae",
"Spheniscus": "Spheniscidae",
"Diomedea": "Diomedeidae",
"Thalassarche": "Diomedeidae",
"Oceanites": "Oceanitidae",
"Macronectes": "Procellariidae",
"Fulmarus": "Procellariidae",
"Daption": "Procellariidae",
"Pterodroma": "Procellariidae",
"Procellaria": "Procellariidae",
"Calonectris": "Procellariidae",
"Ardenna": "Procellariidae",
"Puffinus": "Procellariidae",
"Phaethon": "Phaethontidae",
"Ciconia": "Ciconiidae",
"Jabiru": "Ciconiidae",
"Mycteria": "Ciconiidae",
"Fregata": "Fregatidae",
"Morus": "Sulidae",
"Sula": "Sulidae",
"Anhinga": "Anhingidae",
"Nannopterum": "Phalacrocoracidae",
"Tigrisoma": "Ardeidae",
"Cochlearius": "Ardeidae",
"Botaurus": "Ardeidae",
"Ixobrychus": "Ardeidae",
"Nycticorax": "Ardeidae",
"Nyctanassa": "Ardeidae",
"Butorides": "Ardeidae",
"Bubulcus": "Ardeidae",
"Ardea": "Ardeidae",
"Syrigma": "Ardeidae",
"Pilherodius": "Ardeidae",
"Egretta": "Ardeidae",
"Eudocimus": "Threskiornithidae",
"Plegadis": "Threskiornithidae",
"Mesembrinibis": "Threskiornithidae",
"Phimosus": "Threskiornithidae",
"Theristicus": "Threskiornithidae",
"Platalea": "Threskiornithidae",
"Sarcoramphus": "Cathartidae",
"Coragyps": "Cathartidae",
"Cathartes": "Cathartidae",
"Pandion": "Pandionidae",
"Elanus": "Accipitridae",
"Chondrohierax": "Accipitridae",
"Leptodon": "Accipitridae",
"Elanoides": "Accipitridae",
"Spizaetus": "Accipitridae",
"Rostrhamus": "Accipitridae",
"Harpagus": "Accipitridae",
"Ictinia": "Accipitridae",
"Circus": "Accipitridae",
"Hieraspiza": "Accipitridae",
"Accipiter": "Accipitridae",
"Geranospiza": "Accipitridae",
"Heterospizias": "Accipitridae",
"Amadonastur": "Accipitridae",
"Urubitinga": "Accipitridae",
"Rupornis": "Accipitridae",
"Parabuteo": "Accipitridae",
"Geranoaetus": "Accipitridae",
"Pseudastur": "Accipitridae",
"Buteo": "Accipitridae",
"Eurypyga": "Eurypygidae",
"Aramus": "Aramidae",
"Rallus": "Rallidae",
"Porphyrio": "Rallidae",
"Laterallus": "Rallidae",
"Mustelirallus": "Rallidae",
"Neocrex": "Rallidae",
"Pardirallus": "Rallidae",
"Amaurolimnas": "Rallidae",
"Aramides": "Rallidae",
"Porphyriops": "Rallidae",
"Gallinula": "Rallidae",
"Fulica": "Rallidae",
"Coturnicops": "Rallidae",
"Heliornis": "Heliornithidae",
"Pluvialis": "Charadriidae",
"Oreopholus": "Charadriidae",
"Vanellus": "Charadriidae",
"Charadrius": "Charadriidae",
"Haematopus": "Haematopodidae",
"Himantopus": "Recurvirostridae",
"Chionis": "Chionidae",
"Bartramia": "Scolopacidae",
"Numenius": "Scolopacidae",
"Limosa": "Scolopacidae",
"Arenaria": "Scolopacidae",
"Calidris": "Scolopacidae",
"Limnodromus": "Scolopacidae",
"Gallinago": "Scolopacidae",
"Phalaropus": "Scolopacidae",
"Actitis": "Scolopacidae",
"Tringa": "Scolopacidae",
"Thinocorus": "Thinocoridae",
"Jacana": "Jacanidae",
"Nycticryphes": "Rostratulidae",
"Stercorarius": "Stercorariidae",
"Chroicocephalus": "Laridae",
"Leucophaeus": "Laridae",
"Larus": "Laridae",
"Sternula": "Laridae",
"Phaetusa": "Laridae",
"Sterna": "Laridae",
"Thalasseus": "Laridae",
"Rynchops": "Laridae",
"Anous": "Laridae",
"Columba": "Columbidae",
"Patagioenas": "Columbidae",
"Geotrygon": "Columbidae",
"Leptotila": "Columbidae",
"Zenaida": "Columbidae",
"Claravis": "Columbidae",
"Columbina": "Columbidae",
"Opisthocomus": "Opisthocomidae",
"Guira": "Cuculidae",
"Crotophaga": "Cuculidae",
"Tapera": "Cuculidae",
"Dromococcyx": "Cuculidae",
"Neomorphus": "Cuculidae",
"Micrococcyx": "Cuculidae",
"Piaya": "Cuculidae",
"Coccyzus": "Cuculidae",
"Tyto": "Tytonidae",
"Megascops": "Strigidae",
"Pulsatrix": "Strigidae",
"Bubo": "Strigidae",
"Strix": "Strigidae",
"Glaucidium": "Strigidae",
"Athene": "Strigidae",
"Aegolius": "Strigidae",
"Asio": "Strigidae",
"Steatornis": "Steatornithidae",
"Nyctibius": "Nyctibiidae",
"Antrostomus": "Caprimulgidae",
"Lurocalis": "Caprimulgidae",
"Nyctidromus": "Caprimulgidae",
"Hydropsalis": "Caprimulgidae",
"Podager": "Caprimulgidae",
"Chordeiles": "Caprimulgidae",
"Cypseloides": "Apodidae",
"Streptoprocne": "Apodidae",
"Chaetura": "Apodidae",
"Panyptila": "Apodidae",
"Florisuga": "Trochilidae",
"Ramphodon": "Trochilidae",
"Phaethornis": "Trochilidae",
"Colibri": "Trochilidae",
"Heliothryx": "Trochilidae",
"Anthracothorax": "Trochilidae",
"Lophornis": "Trochilidae",
"Heliodoxa": "Trochilidae",
"Heliomaster": "Trochilidae",
"Calliphlox": "Trochilidae",
"Chlorostilbon": "Trochilidae",
"Stephanoxis": "Trochilidae",
"Thalurania": "Trochilidae",
"Eupetomena": "Trochilidae",
"Aphantochroa": "Trochilidae",
"Chrysuronia": "Trochilidae",
"Leucochloris": "Trochilidae",
"Chionomesa": "Trochilidae",
"Hylocharis": "Trochilidae",
"Augastes": "Trochilidae",
"Trogon": "Trogonidae",
"Megaceryle": "Alcedinidae",
"Chloroceryle": "Alcedinidae",
"Baryphthengus": "Momotidae",
"Nonnula": "Bucconidae",
"Malacoptila": "Bucconidae",
"Notharchus": "Bucconidae",
"Nystalus": "Bucconidae",
"Ramphastos": "Ramphastidae",
"Selenidera": "Ramphastidae",
"Pteroglossus": "Ramphastidae",
"Picumnus": "Picidae",
"Melanerpes": "Picidae",
"Veniliornis": "Picidae",
"Campephilus": "Picidae",
"Dryocopus": "Picidae",
"Celeus": "Picidae",
"Piculus": "Picidae",
"Colaptes": "Picidae",
"Cariama": "Cariamidae",
"Herpetotheres": "Falconidae",
"Micrastur": "Falconidae",
"Caracara": "Falconidae",
"Milvago": "Falconidae",
"Falco": "Falconidae",
"Touit": "Psittacidae",
"Myiopsitta": "Psittacidae",
"Brotogeris": "Psittacidae",
"Pionopsitta": "Psittacidae",
"Triclaria": "Psittacidae",
"Pionus": "Psittacidae",
"Amazona": "Psittacidae",
"Forpus": "Psittacidae",
"Pyrrhura": "Psittacidae",
"Primolius": "Psittacidae",
"Psittacara": "Psittacidae",
"Pyrilia": "Psittacidae",
"Terenura": "Thamnophilidae",
"Myrmotherula": "Thamnophilidae",
"Formicivora": "Thamnophilidae",
"Rhopias": "Thamnophilidae",
"Dysithamnus": "Thamnophilidae",
"Herpsilochmus": "Thamnophilidae",
"Thamnophilus": "Thamnophilidae",
"Hypoedaleus": "Thamnophilidae",
"Batara": "Thamnophilidae",
"Mackenziaena": "Thamnophilidae",
"Biatas": "Thamnophilidae",
"Myrmoderus": "Thamnophilidae",
"Pyriglena": "Thamnophilidae",
"Drymophila": "Thamnophilidae",
"Conopophaga": "Conopophagidae",
"Grallaria": "Grallariidae",
"Cryptopezus": "Grallariidae",
"Psilorhamphus": "Rhinocryptidae",
"Merulaxis": "Rhinocryptidae",
"Eleoscytalopus": "Rhinocryptidae",
"Scytalopus": "Rhinocryptidae",
"Formicarius": "Formicariidae",
"Chamaeza": "Formicariidae",
"Sclerurus": "Scleruridae",
"Geositta": "Scleruridae",
"Sittasomus": "Dendrocolaptidae",
"Dendrocincla": "Dendrocolaptidae",
"Dendrocolaptes": "Dendrocolaptidae",
"Xiphocolaptes": "Dendrocolaptidae",
"Xiphorhynchus": "Dendrocolaptidae",
"Campylorhamphus": "Dendrocolaptidae",
"Lepidocolaptes": "Dendrocolaptidae",
"Xenops": "Xenopidae",
"Furnarius": "Furnariidae",
"Lochmias": "Furnariidae",
"Phleocryptes": "Furnariidae",
"Limnornis": "Furnariidae",
"Cinclodes": "Furnariidae",
"Anabazenops": "Furnariidae",
"Cichlocolaptes": "Furnariidae",
"Heliobletus": "Furnariidae",
"Philydor": "Furnariidae",
"Anabacerthia": "Furnariidae",
"Syndactyla": "Furnariidae",
"Dendroma": "Furnariidae",
"Clibanornis": "Furnariidae",
"Automolus": "Furnariidae",
"Leptasthenura": "Furnariidae",
"Phacellodomus": "Furnariidae",
"Anumbius": "Furnariidae",
"Limnoctites": "Furnariidae",
"Cranioleuca": "Furnariidae",
"Spartonoica": "Furnariidae",
"Certhiaxis": "Furnariidae",
"Schoeniophylax": "Furnariidae",
"Synallaxis": "Furnariidae",
"Ilicura": "Pipridae",
"Chiroxiphia": "Pipridae",
"Manacus": "Pipridae",
"Carpornis": "Cotingidae",
"Pyroderus": "Cotingidae",
"Lipaugus": "Cotingidae",
"Procnias": "Cotingidae",
"Phibalura": "Cotingidae",
"Cotinga": "Cotingidae",
"Schiffornis": "Tityridae",
"Tityra": "Tityridae",
"Pachyramphus": "Tityridae",
"Oxyruncus": "Oxyruncidae",
"Onychorhynchus": "Onychorhynchidae",
"Myiobius": "Onychorhynchidae",
"Piprites": "Pipritidae",
"Platyrinchus": "Platyrinchidae",
"Tachuris": "Tachurisidae",
"Mionectes": "Rhynchocyclidae",
"Leptopogon": "Rhynchocyclidae",
"Corythopis": "Rhynchocyclidae",
"Phylloscartes": "Rhynchocyclidae",
"Tolmomyias": "Rhynchocyclidae",
"Todirostrum": "Rhynchocyclidae",
"Poecilotriccus": "Rhynchocyclidae",
"Myiornis": "Rhynchocyclidae",
"Hemitriccus": "Rhynchocyclidae",
"Hirundinea": "Tyrannidae",
"Euscarthmus": "Tyrannidae",
"Tyranniscus": "Tyrannidae",
"Camptostoma": "Tyrannidae",
"Elaenia": "Tyrannidae",
"Myiopagis": "Tyrannidae",
"Capsiempis": "Tyrannidae",
"Phyllomyias": "Tyrannidae",
"Culicivora": "Tyrannidae",
"Polystictus": "Tyrannidae",
"Pseudocolopteryx": "Tyrannidae",
"Serpophaga": "Tyrannidae",
"Attila": "Tyrannidae",
"Legatus": "Tyrannidae",
"Ramphotrigon": "Tyrannidae",
"Myiarchus": "Tyrannidae",
"Sirystes": "Tyrannidae",
"Pitangus": "Tyrannidae",
"Machetornis": "Tyrannidae",
"Myiodynastes": "Tyrannidae",
"Megarynchus": "Tyrannidae",
"Myiozetetes": "Tyrannidae",
"Tyrannus": "Tyrannidae",
"Griseotyrannus": "Tyrannidae",
"Empidonomus": "Tyrannidae",
"Conopias": "Tyrannidae",
"Colonia": "Tyrannidae",
"Arundinicola": "Tyrannidae",
"Fluvicola": "Tyrannidae",
"Pyrocephalus": "Tyrannidae",
"Muscipipra": "Tyrannidae",
"Gubernetes": "Tyrannidae",
"Heteroxolmis": "Tyrannidae",
"Myiophobus": "Tyrannidae",
"Cnemotriccus": "Tyrannidae",
"Lathrotriccus": "Tyrannidae",
"Contopus": "Tyrannidae",
"Satrapa": "Tyrannidae",
"Lessonia": "Tyrannidae",
"Hymenops": "Tyrannidae",
"Knipolegus": "Tyrannidae",
"Xolmis": "Tyrannidae",
"Nengetus": "Tyrannidae",
"Cyclarhis": "Vireonidae",
"Hylophilus": "Vireonidae",
"Vireo": "Vireonidae",
"Cyanocorax": "Corvidae",
"Pygochelidon": "Hirundinidae",
"Alopochelidon": "Hirundinidae",
"Stelgidopteryx": "Hirundinidae",
"Progne": "Hirundinidae",
"Tachycineta": "Hirundinidae",
"Riparia": "Hirundinidae",
"Hirundo": "Hirundinidae",
"Petrochelidon": "Hirundinidae",
"Troglodytes": "Troglodytidae",
"Cistothorus": "Troglodytidae",
"Campylorhynchus": "Troglodytidae",
"Cantorchilus": "Troglodytidae",
"Ramphocaenus": "Polioptilidae",
"Polioptila": "Polioptilidae",
"Catharus": "Turdidae",
"Turdus": "Turdidae",
"Mimus": "Mimidae",
"Sturnus": "Sturnidae",
"Estrilda": "Estrildidae",
"Passer": "Passeridae",
"Anthus": "Motacillidae",
"Spinus": "Fringillidae",
"Cyanophonia": "Fringillidae",
"Chlorophonia": "Fringillidae",
"Euphonia": "Fringillidae",
"Ammodramus": "Passerellidae",
"Arremon": "Passerellidae",
"Zonotrichia": "Passerellidae",
"Leistes": "Icteridae",
"Cacicus": "Icteridae",
"Psarocolius": "Icteridae",
"Icterus": "Icteridae",
"Molothrus": "Icteridae",
"Amblyramphus": "Icteridae",
"Gnorimopsar": "Icteridae",
"Agelaioides": "Icteridae",
"Agelasticus": "Icteridae",
"Chrysomus": "Icteridae",
"Xanthopsar": "Icteridae",
"Pseudoleistes": "Icteridae",
"Geothlypis": "Parulidae",
"Setophaga": "Parulidae",
"Myiothlypis": "Parulidae",
"Basileuterus": "Parulidae",
"Orthogonys": "Mitrospingidae",
"Piranga": "Cardinalidae",
"Habia": "Cardinalidae",
"Amaurospiza": "Cardinalidae",
"Cyanoloxia": "Cardinalidae",
"Orchesticus": "Thraupidae",
"Nemosia": "Thraupidae",
"Embernagra": "Thraupidae",
"Emberizoides": "Thraupidae",
"Rhopospina": "Thraupidae",
"Hemithraupis": "Thraupidae",
"Tersina": "Thraupidae",
"Cyanerpes": "Thraupidae",
"Dacnis": "Thraupidae",
"Saltator": "Thraupidae",
"Coereba": "Thraupidae",
"Asemospiza": "Thraupidae",
"Volatinia": "Thraupidae",
"Trichothraupis": "Thraupidae",
"Loriotus": "Thraupidae",
"Coryphospingus": "Thraupidae",
"Tachyphonus": "Thraupidae",
"Ramphocelus": "Thraupidae",
"Sporophila": "Thraupidae",
"Poospiza": "Thraupidae",
"Thlypopsis": "Thraupidae",
"Castanozoster": "Thraupidae",
"Donacospiza": "Thraupidae",
"Microspingus": "Thraupidae",
"Conirostrum": "Thraupidae",
"Sicalis": "Thraupidae",
"Haplospiza": "Thraupidae",
"Pipraeidea": "Thraupidae",
"Rauenia": "Thraupidae",
"Stephanophorus": "Thraupidae",
"Cissopis": "Thraupidae",
"Schistochlamys": "Thraupidae",
"Paroaria": "Thraupidae",
"Thraupis": "Thraupidae",
"Stilpnia": "Thraupidae",
"Tangara": "Thraupidae",
"Chlorophanes": "Thraupidae",
            };

// Constrói SC_BIRDS a partir do banco completo
const SC_BIRDS = (function() {
  return conservationData.map(item => {
    const genus = item.especie.split(' ')[0];
    const ordem = ordemMap[genus] || 'Passeriformes';
    const familia = familiaMap[genus] || 'Desconhecida';
    return {
      sci:    item.especie,
      pop:    item.nomePopular,
      ordem:  ordem,
      familia: familia,
      sc:     item.sc,
      icmbio: item.icmbio,
      iucn:   item.iucn
    };
  });
})();

/* ════════════════════════════════════════
   ESTADO DA APLICAÇÃO
════════════════════════════════════════ */
let currentUser = null;
let foundSpecies = new Set(); // carregado do Supabase após login — não usa localStorage
let _pendingGoogleUser = null;
let currentLocation = null;
let todayBird = null;

/* ════════════════════════════════════════
   ESPÉCIES INDICADORAS — banco de pontos
════════════════════════════════════════ */
const INDICADORAS = {
  "Diomedea dabbenena":5,"Aburria jacutinga":5,"Thalassarche chlororhynchos":5,
  "Thalassarche chrysostoma":5,"Pterodroma incerta":5,"Pandion haliaetus":6,
  "Amazona vinacea":5,"Limnodromus griseus":5,"Tringa flavipes":5,
  "Diomedea exulans":5,"Procellaria aequinoctialis":5,"Procellaria conspicillata":5,
  "Amadonastur lacernulatus":5,"Celeus galeatus":5,"Amazona pretrei":5,
  "Biatas nigropectus":5,"Scytalopus iraiensis":5,"Onychorhynchus swainsoni":5,
  "Platyrinchus leucoryphus":5,"Hemitriccus kaempferi":5,"Penelope superciliaris":5,
  "Hydropsalis anomala":5,"Spizaetus ornatus":5,"Accipiter poliogaster":5,
  "Touit melanonotus":5,"Formicivora acutirostris":5,"Limnoctites rectirostris":5,
  "Piprites pileata":5,"Phylloscartes eximius":5,"Conirostrum bicolor":5,
  "Crotophaga major":5,"Heliornis fulica":6,"Gallinago undulata":5,
  "Thalasseus maximus":5,"Thalassarche melanophris":5,"Tigrisoma fasciatum":6,
  "Eudocimus ruber":6,"Spizaetus tyrannus":5,"Spizaetus melanoleucus":5,
  "Strix huhula":5,"Trogon viridis":5,"Chloroceryle aenea":6,
  "Chloroceryle inda":6,"Notharchus swainsoni":5,"Pteroglossus castanotis":5,
  "Piculus flavigula":5,"Triclaria malachitacea":5,"Primolius maracana":5,
  "Myrmoderus squamosus":5,"Drymophila squamata":5,"Merulaxis ater":5,
  "Scytalopus pachecoi":5,"Phibalura flavirostris":5,"Pyroderus scutatus":5,
  "Lipaugus lanioides":5,"Myiobius barbatus":5,"Myiobius atricaudus":5,
  "Tachuris rubrigastra":5,"Corythopis delalandi":5,"Phylloscartes oustaleti":5,
  "Phylloscartes difficilis":5,"Phylloscartes sylviolus":5,"Hemitriccus diops":5,
  "Polioptila lactea":5,"Saltator fuliginosus":5,"Loriotus cristatus":5,
  "Ramphocelus bresilia":5,"Cissopis leverianus":5,"Stilpnia peruviana":5,
  "Stercorarius parasiticus":3,"Urubitinga coronata":3,"Xanthopsar flavus":3,
  "Sporophila palustris":4,"Anas acuta":3,"Phoenicoparrus andinus":4,
  "Pluvialis squatarola":4,"Limosa haemastica":4,"Calidris fuscicollis":4,
  "Calidris subruficollis":3,"Heteroxolmis dominicanus":3,"Cyanocorax caeruleus":3,
  "Anthus nattereri":3,"Sporophila frontalis":4,"Sporophila falcirostris":4,
  "Sporophila cinnamomea":4,"Tinamus solitarius":3,"Crypturellus noctivagus":3,
  "Asio flammeus":3,"Cinclodes pabsti":3,"Polystictus pectoralis":3,
  "Rallus longirostris":3,"Geositta cunicularia":3,"Phacellodomus striaticollis":3,
  "Culicivora caudacuta":3,"Cistothorus platensis":3,"Sporophila beltoni":2,
  "Sporophila melanogaster":2,"Sporophila hypoxantha":2,"Sporophila angolensis":1
};

function calcIndicadorasPoints(speciesSet) {
  let pts = 0;
  speciesSet.forEach(sci => { if (INDICADORAS[sci]) pts += INDICADORAS[sci]; });
  return pts;
}

/* ════════════════════════════════════════
   SUPABASE — SESSÃO AUTOMÁTICA
════════════════════════════════════════ */

async function loadNotifBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge || !currentUser?.id) return;
  try {
    const { count } = await db.from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
      .eq('read', false);
    badge.style.display = count > 0 ? 'block' : 'none';
  } catch(e) {}
}

async function loadMsgBadge() {
  const badge = document.getElementById('msg-badge');
  if (!badge || !currentUser?.id) return;
  try {
    const { count } = await db.from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('to_id', currentUser.id)
      .eq('read', false);
    badge.style.display = count > 0 ? 'block' : 'none';
  } catch(e) {
    console.warn('loadMsgBadge error:', e);
  }
}

db.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    const u = session.user;
    let profile = null;
    try {
      const { data } = await db.from('profiles').select('*').eq('id', u.id).maybeSingle();
      profile = data;
    } catch(e) { console.warn('[auth] profile fetch error:', e); }

    // Se há perfil pendente (criado antes da confirmação de email), tenta inserir agora
    if (!profile) {
      const pending = sessionStorage.getItem('av_pending_profile');
      if (pending) {
        try {
          const pd = JSON.parse(pending);
          if (pd.id === u.id) {
            await db.from('profiles').insert({ id: pd.id, nome: pd.nome, handle: pd.handle });
            sessionStorage.removeItem('av_pending_profile');
            const { data: refetched } = await db.from('profiles').select('*').eq('id', u.id).maybeSingle();
            if (refetched) profile = refetched;
          }
        } catch(e) { sessionStorage.removeItem('av_pending_profile'); }
      }
    }

    if (profile) {
      currentUser = {
        id:        u.id,
        email:     u.email,
        name:      profile.nome || profile.handle,
        handle:    profile.handle,
        bio:       profile.bio    || '',
        cidade:    profile.cidade || '',
        avatar_url: profile.avatar_url || null,
        cover_url: profile.cover_url || null,
        cover_pos: profile.cover_pos || 50
      };
      updateSidebarAuth();
      renderProfile();
      loadUserChecklist();
      if (event === 'SIGNED_IN') showLoginAnimation(profile.nome || profile.handle || '');
      loadNotifBadge();
      loadMsgBadge(); // <-- adicionar aqui
      startNotifRealtime();
      startRealtimeSubscriptions();
      // Re-render feed com estado de curtidas do usuário
      renderFeed('home-feed', 4);
      if (document.getElementById('page-feed')?.classList.contains('active')) {
        renderFeed('full-feed', 12);
      }
      if (window._pendingNav) {
        const { pageId, btn } = window._pendingNav;
        window._pendingNav = null;
        setTimeout(() => navigateTo(pageId, btn || document.querySelector('[data-page='+pageId+']')), 200);
      }
    } else if (event === 'SIGNED_IN') {
      // Novo usuário sem perfil — diferencia Google de email/senha
      const provider = u.app_metadata?.provider || '';
      const isGoogle = provider === 'google' || (u.identities||[]).some(i=>i.provider==='google');
      if (isGoogle) {
        _pendingGoogleUser = { id:u.id, name:u.user_metadata?.full_name||u.email?.split('@')[0]||'Usuário', email:u.email, avatar:u.user_metadata?.avatar_url||'' };
        openHandleModal(_pendingGoogleUser);
      }
      // Email/senha: perfil já deve ter sido criado em doRegister.
      // Se não foi (e-mail não confirmado), deixa o usuário tentar logar depois.
    }
  } else {
    // Logout ou sessão expirada — limpa TUDO
    currentUser = null;
    foundSpecies = new Set();
    updateSidebarAuth();
    // Reseta perfil para estado vazio
    const pN = document.getElementById('profile-name');
    const pH = document.getElementById('profile-handle');
    if (pN) pN.textContent = 'Faça login para ver seu perfil';
    if (pH) pH.textContent = '';
    // Re-renderiza feed público (sem likes do usuário)
    renderFeed('home-feed', 4);
    if (document.getElementById('page-feed')?.classList.contains('active')) {
      renderFeed('full-feed', 12);
    }
    updateChecklistProgress();
  }
});

/* ════════════════════════════════════════
   NAVEGAÇÃO
════════════════════════════════════════ */
// Pages that require login
const AUTH_REQUIRED_PAGES = new Set(['upload', 'messages', 'notifications', 'profile']);

function navigateTo(pageId, btn) {
  // Gate: protect pages that need login
  if (AUTH_REQUIRED_PAGES.has(pageId) && !currentUser) {
    openAuthModal();
    window._pendingNav = { pageId, btn };
    showToast('🔑 Faça login para acessar esta página');
    return;
  }
  // Perfil público tem navegação própria via openPublicProfile()
  if (pageId === 'public-profile') return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId)?.classList.add('active');
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Fecha sidebar em mobile ao navegar
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    const layout = document.querySelector('.app-layout');
    if (sidebar) sidebar.classList.remove('expanded');
    if (layout) layout.classList.remove('sidebar-expanded');
  }
  if (pageId === 'feed') {
    _feedOffset = 0; _feedHasMore = true; _feedLoading = false;
    renderFeed('full-feed', _FEED_PAGE_SIZE).then(() => setupFeedInfiniteScroll('full-feed'));
  }
  if (pageId === 'profile') renderProfile();
  if (pageId === 'users')   renderUsers('');
  if (pageId === 'ranking') loadRanking();
  if (pageId === 'birds')   renderBirdsGrid(SC_BIRDS);
  if (pageId === 'ai-id')   aiIdReset();
}

/* ════════════════════════════════════════
   SIDEBAR TOGGLE
════════════════════════════════════════ */
document.getElementById('sidebar-toggle').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  const layout = document.querySelector('.app-layout');
  sidebar.classList.toggle('expanded');
  layout.classList.toggle('sidebar-expanded');
});

/* ════════════════════════════════════════
   TEMA (mantido localmente por preferência UI)
════════════════════════════════════════ */
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const icon = isDark ? '🌙' : '☀️';
  document.getElementById('theme-icon').textContent = icon;
  document.getElementById('topbar-theme').textContent = icon;
  localStorage.setItem('av_theme', isDark ? 'light' : 'dark');
}
// Aplica tema salvo
const savedTheme = localStorage.getItem('av_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (savedTheme === 'dark') {
  document.getElementById('theme-icon').textContent = '☀️';
  document.getElementById('topbar-theme').textContent = '☀️';
}

/* ════════════════════════════════════════
   AVE DO DIA (cache local apenas para não mudar no dia)
════════════════════════════════════════ */
function getTodayBird() {
  const today = new Date().toISOString().slice(0, 10);
  const saved = sessionStorage.getItem('av_bird_day');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed.bird;
    } catch(e) {}
  }
  // Hash mais distribuído para evitar sequência previsível
  let seed = 0;
  const dateStr = today.replace(/-/g, '');
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  seed = ((seed ^ (seed >>> 16)) * 0x45d9f3b) >>> 0;
  seed = ((seed ^ (seed >>> 16)) * 0x45d9f3b) >>> 0;
  seed = (seed ^ (seed >>> 16)) >>> 0;
  const bird = SC_BIRDS[seed % SC_BIRDS.length];
  sessionStorage.setItem('av_bird_day', JSON.stringify({ date: today, bird }));
  return bird;
}

function renderBirdOfDay() {
  const bird = getTodayBird();
  todayBird = bird;

  document.getElementById('bird-popular-name').textContent = capitalize(bird.pop);
  document.getElementById('bird-sci-name').textContent = bird.sci;
  document.getElementById('bird-ordem-tag').textContent = bird.ordem;

  const factsEl = document.getElementById('bird-facts');
  factsEl.innerHTML = `
    <span class="bird-fact-chip">🏠 ${bird.familia}</span>
    <span class="bird-fact-chip status-chip status-${bird.sc}">SC: ${bird.sc}</span>
    <span class="bird-fact-chip status-chip status-${bird.iucn}">IUCN: ${bird.iucn}</span>
  `;

  const btn = document.getElementById('btn-found');
  btn.classList.remove('already-found');
  btn.textContent = '✅ Encontrei esta ave!';
  checkBirdOfDayFound(bird.sci);

  loadBirdPhoto(bird.sci, bird.pop);
  loadLocalDescription(bird.sci, bird.pop);

  updateChecklistProgress();
  setTimeout(() => loadBirdDayFinders(bird.sci), 800);
}

async function loadBirdPhoto(sciName, popName) {
  const img     = document.getElementById('bird-day-img');
  const loading = document.getElementById('bird-img-loading');
  const badge   = document.getElementById('bird-inat-badge');

  // Garante estado inicial: loading visível, img oculta
  if (img)     { img.style.display = 'none'; img.src = ''; }
  if (loading) loading.style.display = 'flex';
  if (badge)   badge.style.display = 'none';

  try {
    const idx = await ensurePhotoIndex();
    const key     = (sciName || '').toLowerCase().trim();
    const entries = idx[key];
    if (entries && entries.length > 0) {
      const entry = entries[Math.floor(Math.random() * entries.length)];
      // Pré-carrega a imagem antes de exibir
      const testImg = new Image();
      testImg.onload = () => {
        img.src = entry.url;
        img.alt = popName;
        img.style.display = 'block';
        if (loading) loading.style.display = 'none';
        if (badge) {
          badge.style.display = 'flex';
          if (entry.profileUrl) {
            badge.innerHTML = `📸 Foto por: <a href="${entry.profileUrl}" target="_blank" style="color:white;text-decoration:underline;margin-left:4px;">${entry.author}</a>`;
          } else {
            badge.innerHTML = `📸 Foto por: ${entry.author}`;
          }
        }
        document.getElementById('btn-inat').onclick = () => window.open(`https://www.inaturalist.org/taxa?q=${encodeURIComponent(sciName)}`, '_blank');
      };
      testImg.onerror = () => showNoBirdPhoto(loading, popName);
      testImg.src = entry.url;
      return;
    }
  } catch(e) {
    console.warn('photo_index.json indisponível:', e);
  }

  // Fallback: iNaturalist direto (suporta CORS nativamente)
  try {
    const inatUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sciName)}&rank=species&per_page=1`;
    const res  = await fetch(inatUrl);
    const data = await res.json();
    if (data.results?.[0]?.default_photo) {
      const photo  = data.results[0].default_photo;
      const inatId = data.results[0].id;
      const attr = photo.attribution || '';
      const m = attr.match(/\(c\)\s*([^,]+)/i);
      const authorName = m ? m[1].trim() : 'iNaturalist';
      img.src = photo.medium_url;
      img.alt = popName;
      img.style.display = 'block';
      if (loading) loading.style.display = 'none';
      if (badge) {
        badge.style.display = 'flex';
        badge.innerHTML = `🌿 <a href="https://www.inaturalist.org/taxa/${inatId}" target="_blank" style="color:white;text-decoration:underline;margin-left:4px;">${authorName} · iNaturalist ↗</a>`;
      }
      document.getElementById('btn-inat').onclick = () => window.open(`https://www.inaturalist.org/taxa/${inatId}`, '_blank');
      return;
    }
  } catch(e) { console.warn('[inat fallback] erro:', e?.message); }

  showNoBirdPhoto(loading, popName);
}

function showNoBirdPhoto(loading, popName) {
  if (!loading) return;
  loading.style.display = 'flex';
  const emojiEl = loading.querySelector('.bird-emoji-big');
  const spanEl  = loading.querySelector('span');
  if (emojiEl) emojiEl.textContent = getSpeciesEmoji(popName);
  if (spanEl)  spanEl.textContent  = 'Sem foto disponível';
}

function openInat() {
  if (todayBird) {
    window.open(`https://www.inaturalist.org/taxa?q=${encodeURIComponent(todayBird.sci)}`, '_blank');
  }
}

function markBirdFound() {
  if (!todayBird) return;
  if (!currentUser) {
    showToast('🔑 Faça login para registrar avistamentos');
    openAuthModal();
    return;
  }
  if (foundSpecies.has(todayBird.sci)) {
    launchConfetti();
    const cel = document.getElementById('celebration');
    const sub = document.getElementById('celebration-sub');
    if (sub) sub.textContent = `Parabéns! Você já registrou o(a) ${capitalize(todayBird.pop)}! 🎊`;
    if (cel) { cel.classList.add('show'); setTimeout(() => cel.classList.remove('show'), 3500); }
    return;
  }
  document.getElementById('proof-bird-name').textContent = capitalize(todayBird.pop);
  document.getElementById('proof-modal').classList.add('open');
  clearProofPhoto();
}

function previewProofPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('proof-preview-img').src = e.target.result;
    document.getElementById('proof-preview-wrap').style.display = 'block';
    document.getElementById('proof-dropzone').style.display = 'none';
    const btn = document.getElementById('proof-confirm-btn');
    btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
  };
  reader.readAsDataURL(file);
}

function clearProofPhoto() {
  document.getElementById('proof-preview-wrap').style.display = 'none';
  document.getElementById('proof-dropzone').style.display = 'flex';
  document.getElementById('proof-photo-input').value = '';
  const btn = document.getElementById('proof-confirm-btn');
  btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed';
}

async function confirmBirdFound() {
  if (!todayBird) return;
  document.getElementById('proof-modal').classList.remove('open');

  foundSpecies.add(todayBird.sci);
  if (currentUser) {
    await db.from('species_seen').upsert({ user_id: currentUser.id, species_sci: todayBird.sci });
    const file = document.getElementById('proof-photo-input').files[0];
    if (file) {
      try {
        const path = `${currentUser.id}/proof_${Date.now()}.jpg`;
        await db.storage.from('observation-photos').upload(path, file, { upsert:true });
      } catch(e) { console.warn('Proof upload:', e); }
    }
  }

  const btn = document.getElementById('btn-found');
  btn.classList.add('already-found');
  btn.textContent = '✅ Já registrada!';
  updateChecklistProgress();
  showCelebration(todayBird.pop);
  launchConfetti();
  showToast(`🎉 ${capitalize(todayBird.pop)} adicionada ao seu checklist!`);
}

function updateChecklistProgress() {
  const total = 691;
  const found = foundSpecies.size;
  const pct = (found / total * 100).toFixed(1);
  document.getElementById('checklist-fill').style.width = pct + '%';
  document.getElementById('checklist-count').textContent = `${found} / ${total} espécies encontradas`;
}

/* ════════════════════════════════════════
   UTILITÁRIOS DE SEGURANÇA
════════════════════════════════════════ */
function escHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ════════════════════════════════════════
   FEED — apenas do banco (sem localStorage)
════════════════════════════════════════ */
async function renderFeed(containerId, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (_renderGuards['feed_' + containerId]) return;
  _renderGuards['feed_' + containerId] = true;

  container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--text-muted);">
    <div style="font-size:32px;margin-bottom:8px;">🔭</div><div>Carregando avistamentos…</div>
  </div>`;

  try {
    const { data, error } = await db
      .from('observations')
      .select('id, user_id, species_pop, species_sci, obs_date, location_label, notes, photo_url, companion_handle, published_inat')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Feed DB error:', error.message);
      container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;">
        <div style="font-size:32px;margin-bottom:8px;">⚠️</div>
        <div style="font-size:13px;color:var(--text-muted);">Erro ao carregar avistamentos.<br><span style="font-size:11px;">${error.message}</span></div>
      </div>`;
      _renderGuards['feed_' + containerId] = false;
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-emoji">🔭</div>
        <div class="empty-title">Nenhum avistamento ainda</div>
        <div class="empty-sub">Seja o primeiro a registrar uma ave!<br>Clique em ➕ para começar.</div>
      </div>`;
      _renderGuards['feed_' + containerId] = false;
      return;
    }

    const userIds = [...new Set((data || []).map(o => o.user_id).filter(Boolean))];
    let profilesMap = {};
    if (userIds.length) {
      const { data: profData } = await db.from('profiles')
        .select('id, nome, handle, avatar_url')
        .in('id', userIds);
      (profData || []).forEach(p => { profilesMap[p.id] = p; });
    }

    const allObs = (data || []).map(o => {
      const prof = profilesMap[o.user_id] || {};
      return {
        id: o.id,
        species:  o.species_pop || o.species_sci,
        sciName:  o.species_sci,
        date:     o.obs_date,
        location: o.location_label || '',
        notes:    o.notes || '',
        photoUrl: o.photo_url || null,
        user: { name: prof.nome || prof.handle || 'Usuário', handle: prof.handle || '' },
        companionHandle: o.companion_handle || null,
        companionName:   null,
      };
    });

    container.innerHTML = allObs.map((obs) => {
      const userName   = obs.user?.name   || 'Usuário';
      const userHandle = obs.user?.handle || '';
      const hasPhoto   = obs.photoUrl;
      const obsId      = obs.id;
      const raridade   = getRaridade(obs.sciName || '');
      const rarityClass = raridade === 'muito-rara' ? 'obs-card-muito-rara'
                        : raridade === 'rara'       ? 'obs-card-rara'
                        : 'obs-card-comum';
      const safeObsJson = JSON.stringify(obs).replace(/"/g,'&quot;');
      return `
      <div class="obs-card ${rarityClass}" style="transform-style:preserve-3d;will-change:transform;"
        onmousemove="obs3dTilt(this,event)" onmouseleave="obs3dReset(this)">
        <div class="obs-card-img" style="cursor:${hasPhoto?'pointer':'default'};" onclick="${hasPhoto?`openPhotoExpand(${safeObsJson})`:''}">
          ${hasPhoto ? `<img src="${escHtml(obs.photoUrl)}" alt="${escHtml(obs.species||'')}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=no-img-emoji>🐦</div>'">` : `<div class="no-img-emoji">${getSpeciesEmoji(obs.species||'')}</div>`}
          ${hasPhoto ? `<div style="position:absolute;inset:0;background:linear-gradient(transparent 60%,rgba(0,0,0,0.3));border-radius:inherit;pointer-events:none;"></div>` : ''}
          ${raridade !== 'comum' ? `<div class="raridade-badge raridade-${raridade}">${raridade === 'muito-rara' ? '🔴 Muito Rara' : '🟡 Rara'}</div>` : ''}
        </div>
        <div class="obs-card-body">
          <div class="obs-card-user">
            <div class="obs-avatar" style="background:#0ea5e9;${userHandle?'cursor:pointer;':''}" onclick="${userHandle?`event.stopPropagation();openPublicProfile('${escHtml(userHandle)}')`:''}">
              ${escHtml((userName||'?')[0].toUpperCase())}</div>
            <span class="obs-username" style="${userHandle?'cursor:pointer;color:var(--sky);':''}" onclick="${userHandle?`event.stopPropagation();openPublicProfile('${escHtml(userHandle)}')`:''}">
              ${escHtml(userName||'Usuário')}</span>
            <span class="obs-date">${formatDate(obs.date||'')}</span>
          </div>
          <div class="obs-species" style="cursor:pointer;" onclick="event.stopPropagation();openSpeciesModal('${escHtml(obs.sciName||'')}','${escHtml(obs.species||obs.sciName||'')}')">${escHtml(capitalize(obs.species||obs.sciName||''))}</div>
          <div class="obs-sci" style="cursor:pointer;font-style:italic;" onclick="event.stopPropagation();openSpeciesModal('${escHtml(obs.sciName||'')}','${escHtml(obs.species||obs.sciName||'')}')">${escHtml(obs.sciName||'')}</div>
          ${obs.companionHandle ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
            📸 <span onclick="event.stopPropagation();openPublicProfile('${escHtml(obs.user?.handle||'')}');" style="color:var(--sky);cursor:pointer;">@${escHtml(obs.user?.handle||'')}</span>
            e <span onclick="event.stopPropagation();openPublicProfile('${escHtml(obs.companionHandle||'')}');" style="color:var(--sky);cursor:pointer;">@${escHtml(obs.companionHandle||'')}</span></div>` : ''}
          ${obs.location ? `<div class="obs-location">📍 ${escHtml(obs.location)}</div>` : ''}
        </div>
        <div class="obs-card-footer">
          <button class="obs-action-btn" id="like-btn-${obsId}" onclick="toggleLike('${obsId}',this)">
            <span id="like-icon-${obsId}">🤍</span> <span id="like-count-${obsId}">0</span>
          </button>
          <button class="obs-action-btn" id="comment-btn-${obsId}" onclick="openCommentModal('${obsId}','${capitalize(obs.species||obs.sciName||'')}')">
            💬 <span id="comment-count-${obsId}">0</span>
          </button>
        </div>
      </div>`;
    }).join('');

    // Libera guard ANTES de carregar contagens para não bloquear re-renders
    _renderGuards['feed_' + containerId] = false;
    await loadCardCounts(allObs);

  } catch(e) {
    console.warn('Feed: erro:', e);
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Erro ao carregar avistamentos.</div>';
    _renderGuards['feed_' + containerId] = false;
  }
}

/* ════════════════════════════════════════
   EFEITO 3D RELUZENTE NOS CARDS
════════════════════════════════════════ */
function obs3dTilt(el, e) {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const rotX = ((y - cy) / cy) * -8;
  const rotY = ((x - cx) / cx) * 8;
  el.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
  el.style.boxShadow = `${(x-cx)/10}px ${(y-cy)/10}px 28px rgba(14,165,233,0.25), 0 8px 32px rgba(0,0,0,0.12)`;
  el.style.transition = 'transform 0.05s, box-shadow 0.05s';
  el.style.zIndex = '5';
}
function obs3dReset(el) {
  el.style.transform = '';
  el.style.boxShadow = '';
  el.style.transition = 'transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s';
  el.style.zIndex = '';
}

/* ════════════════════════════════════════
   INFINITE SCROLL NO FEED DE AVISTAMENTOS
════════════════════════════════════════ */
let _feedOffset = 0;
let _feedLoading = false;
let _feedHasMore = true;
let _feedScrollObserver = null;
const _FEED_PAGE_SIZE = 12;

function setupFeedInfiniteScroll(containerId) {
  if (_feedScrollObserver) { _feedScrollObserver.disconnect(); _feedScrollObserver = null; }
  const container = document.getElementById(containerId);
  if (!container) return;

  let sentinel = document.getElementById('feed-scroll-sentinel');
  if (sentinel) sentinel.remove();
  sentinel = document.createElement('div');
  sentinel.id = 'feed-scroll-sentinel';
  sentinel.style.cssText = 'height:4px;grid-column:1/-1;';
  container.appendChild(sentinel);

  _feedScrollObserver = new IntersectionObserver(async entries => {
    if (!entries[0].isIntersecting || _feedLoading || !_feedHasMore) return;
    _feedLoading = true;
    await appendFeedPage(containerId);
    _feedLoading = false;
  }, { rootMargin: '200px' });
  _feedScrollObserver.observe(sentinel);
}

async function appendFeedPage(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const { data, error } = await db
      .from('observations')
      .select('id, user_id, species_pop, species_sci, obs_date, location_label, notes, photo_url, companion_handle, published_inat')
      .order('created_at', { ascending: false })
      .range(_feedOffset, _feedOffset + _FEED_PAGE_SIZE - 1);
    if (error || !data || data.length === 0) { _feedHasMore = false; return; }
    if (data.length < _FEED_PAGE_SIZE) _feedHasMore = false;
    _feedOffset += data.length;

    const userIds = [...new Set(data.map(o => o.user_id).filter(Boolean))];
    let profilesMap = {};
    if (userIds.length) {
      const { data: profData } = await db.from('profiles').select('id, nome, handle, avatar_url').in('id', userIds);
      (profData || []).forEach(p => { profilesMap[p.id] = p; });
    }
    const newObs = data.map(o => {
      const prof = profilesMap[o.user_id] || {};
      return { id: o.id, species: o.species_pop || o.species_sci, sciName: o.species_sci, date: o.obs_date, location: o.location_label || '', notes: o.notes || '', photoUrl: o.photo_url || null, user: { name: prof.nome || prof.handle || 'Usuário', handle: prof.handle || '' }, companionHandle: o.companion_handle || null };
    });

    // Remove sentinel antes de inserir novos cards
    const sentinel = document.getElementById('feed-scroll-sentinel');
    if (sentinel) sentinel.remove();

    const frag = document.createDocumentFragment();
    newObs.forEach(obs => {
      const div = document.createElement('div');
      const userName = obs.user?.name || 'Usuário';
      const userHandle = obs.user?.handle || '';
      const hasPhoto = obs.photoUrl;
      const obsId = obs.id;
      const raridade = getRaridade(obs.sciName || '');
      let cardClass = 'obs-card';
      if (raridade === 'muito-rara') cardClass += ' obs-card-muito-rara';
      else if (raridade === 'rara') cardClass += ' obs-card-rara';
      else cardClass += ' obs-card-comum';
      const safeJson = JSON.stringify(obs).replace(/"/g,'&quot;');
      div.innerHTML = `<div class="${cardClass}" style="transform-style:preserve-3d;will-change:transform;"
        onmousemove="obs3dTilt(this,event)" onmouseleave="obs3dReset(this)">
        <div class="obs-card-img" style="cursor:${hasPhoto?'pointer':'default'};" onclick="${hasPhoto?`openPhotoExpand(${safeJson})`:''}">
          ${hasPhoto ? `<img src="${escHtml(obs.photoUrl)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=no-img-emoji>🐦</div>'">` : `<div class="no-img-emoji">${getSpeciesEmoji(obs.species||'')}</div>`}
          ${hasPhoto ? `<div style="position:absolute;inset:0;background:linear-gradient(transparent 60%,rgba(0,0,0,0.3));border-radius:inherit;pointer-events:none;"></div>` : ''}
          ${raridade !== 'comum' ? `<div class="raridade-badge raridade-${raridade}">${raridade === 'muito-rara' ? '🔴 Muito Rara' : '🟡 Rara'}</div>` : ''}
        </div>
        <div class="obs-card-body">
          <div class="obs-card-user">
            <div class="obs-avatar" style="background:#0ea5e9;${userHandle?'cursor:pointer;':''}" onclick="${userHandle?'event.stopPropagation();openPublicProfile(\''+escHtml(userHandle)+'\')':''}">${escHtml((userName||'?')[0].toUpperCase())}</div>
            <span class="obs-username" style="${userHandle?'cursor:pointer;color:var(--sky);':''}" onclick="${userHandle?'event.stopPropagation();openPublicProfile(\''+escHtml(userHandle)+'\')':''}">${escHtml(userName)}</span>
            <span class="obs-date">${formatDate(obs.date||'')}</span>
          </div>
          <div class="obs-species" style="cursor:pointer;" onclick="event.stopPropagation();openSpeciesModal('${escHtml(obs.sciName||'')}','${escHtml(obs.species||obs.sciName||'')}')">${escHtml(capitalize(obs.species||obs.sciName||''))}</div>
          <div class="obs-sci" style="cursor:pointer;font-style:italic;" onclick="event.stopPropagation();openSpeciesModal('${escHtml(obs.sciName||'')}','${escHtml(obs.species||obs.sciName||'')}')">${escHtml(obs.sciName||'')}</div>
          ${obs.location ? `<div class="obs-location">📍 ${escHtml(obs.location)}</div>` : ''}
        </div>
        <div class="obs-card-footer">
          <button class="obs-action-btn" id="like-btn-${obsId}" onclick="toggleLike('${obsId}',this)"><span id="like-icon-${obsId}">🤍</span> <span id="like-count-${obsId}">0</span></button>
          <button class="obs-action-btn" id="comment-btn-${obsId}" onclick="openCommentModal('${obsId}','${capitalize(obs.species||obs.sciName||'')}')">💬 <span id="comment-count-${obsId}">0</span></button>
        </div>
      </div>`;
      frag.appendChild(div.firstElementChild);
    });
    container.appendChild(frag);

    // Re-adiciona sentinel
    if (_feedHasMore) {
      const newSentinel = document.createElement('div');
      newSentinel.id = 'feed-scroll-sentinel';
      newSentinel.style.cssText = 'height:4px;grid-column:1/-1;';
      container.appendChild(newSentinel);
      _feedScrollObserver.observe(newSentinel);
    }
    await loadCardCounts(newObs);
  } catch(e) { console.warn('appendFeedPage:', e); }
}


/* ════════════════════════════════════════
   UPLOAD / ENVIO — APENAS SUPABASE
════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  const dl = document.getElementById('species-datalist');
  SC_BIRDS.forEach(b => {
    const opt1 = document.createElement('option'); opt1.value = b.sci; dl.appendChild(opt1);
    const opt2 = document.createElement('option'); opt2.value = capitalize(b.pop); dl.appendChild(opt2);
  });
  document.getElementById('obs-date').value = new Date().toISOString().slice(0, 10);

  renderBirdOfDay();
  // Home feed: mostra 4 cards estáticos sem scroll infinito
  renderFeed('home-feed', 4);
  // Full feed: usa scroll infinito
  _feedOffset = 0; _feedHasMore = true;
  renderFeed('full-feed', _FEED_PAGE_SIZE).then(() => {
    setupFeedInfiniteScroll('full-feed');
  });
  renderUsers('');
  startAutoRefresh();
  // Inicia background aleatório com fotos de aves
  initBgPhoto();
});

function previewPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('preview-img').src = e.target.result;
    document.getElementById('upload-preview').style.display = 'block';
    document.getElementById('dropzone').style.display = 'none';
    // Mostra botão de ID por IA
    const aiBtn = document.getElementById('btn-ai-id-upload');
    if (aiBtn) aiBtn.style.display = 'flex';
  };
  reader.readAsDataURL(file);
}

function removePreview() {
  document.getElementById('upload-preview').style.display = 'none';
  document.getElementById('dropzone').style.display = 'block';
  document.getElementById('photo-input').value = '';
  document.getElementById('preview-img').src = '';
  // Esconde botão de ID por IA
  const aiBtn = document.getElementById('btn-ai-id-upload');
  if (aiBtn) aiBtn.style.display = 'none';
}

window.addEventListener('DOMContentLoaded', () => {
  const dz = document.getElementById('dropzone');
  if (!dz) return;
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', e => {
    e.preventDefault(); dz.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const dt = new DataTransfer(); dt.items.add(file);
      document.getElementById('photo-input').files = dt.files;
      previewPhoto(document.getElementById('photo-input'));
    }
  });
});

async function uploadPhoto(file) {
  if (!file || !currentUser) return null;
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE_MB = 10;
  if (!ALLOWED_TYPES.includes(file.type)) {
    showToast('⚠️ Formato inválido. Use JPEG, PNG, WebP ou GIF.');
    return null;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    showToast(`⚠️ Foto muito grande. Máximo ${MAX_SIZE_MB}MB.`);
    return null;
  }
  try {
    const ext  = file.name.split('.').pop().replace(/[^a-z0-9]/gi,'') || 'jpg';
    const path = `${currentUser.id}/${Date.now()}.${ext}`;
    const { error } = await db.storage
      .from('observation-photos')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) { console.error('Upload erro:', error); return null; }
    const { data: { publicUrl } } = db.storage
      .from('observation-photos')
      .getPublicUrl(path);
    return publicUrl;
  } catch(e) {
    console.error('Upload falhou:', e);
    return null;
  }
}


/* ════════════════════════════════════════
   FILA DE REGISTROS EM LOTE
════════════════════════════════════════ */
let _obsQueue = []; // fila temporária de observações a enviar

function addToQueue() {
  if (!currentUser) { showToast('🔑 Faça login para registrar'); openAuthModal(); return; }
  const noSpecies = document.getElementById('no-species-check')?.checked;
  const species = noSpecies ? '' : (document.getElementById('species-input').value || '').trim();
  const date = document.getElementById('obs-date').value;
  if (!noSpecies && !species) { showToast('⚠️ Informe a espécie'); return; }
  if (!date) { showToast('⚠️ Informe a data'); return; }

  const photoFile = document.getElementById('photo-input').files[0] || null;
  const match = SC_BIRDS.find(b =>
    b.sci.toLowerCase() === species.toLowerCase() ||
    b.pop.toLowerCase() === species.toLowerCase()
  );
  const entry = {
    species, noSpecies, match,
    date,
    time: document.getElementById('obs-time').value || '',
    location: currentLocation ? { ...currentLocation } : null,
    notes: document.getElementById('obs-notes').value || '',
    photoFile,
    photoPreview: photoFile ? URL.createObjectURL(photoFile) : null,
    publishInat: false, // document.getElementById('inat-publish')?.checked — desabilitado temporariamente
    id: Date.now()
  };
  _obsQueue.push(entry);
  renderObsQueue();
  // Limpa form para próximo
  document.getElementById('species-input').value = '';
  document.getElementById('obs-notes').value = '';
  document.getElementById('obs-time').value = '';
  removePreview();
  currentLocation = null;
  document.getElementById('location-display').textContent = 'Nenhuma localização selecionada';
  document.getElementById('location-display').classList.remove('has-location');
  const msearch = document.getElementById('municipio-search');
  if (msearch) msearch.value = '';
  document.getElementById('municipio-input-wrap').style.display = 'none';
  const btnGps = document.getElementById('btn-gps');
  if (btnGps) { btnGps.textContent = '📍 GPS'; btnGps.style.cssText = ''; }
  _selectedCompanions = [];
  renderSelectedCompanions();
  showToast(`✅ Adicionado à fila! (${_obsQueue.length} na fila)`);
}

function removeFromQueue(id) {
  _obsQueue = _obsQueue.filter(o => o.id !== id);
  renderObsQueue();
}

function renderObsQueue() {
  let panel = document.getElementById('obs-queue-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'obs-queue-panel';
    panel.style.cssText = 'margin-top:12px;border:1.5px solid var(--sky);border-radius:var(--radius-md);padding:12px;background:var(--card);';
    const form = document.getElementById('obs-form') || document.querySelector('.obs-form-wrap');
    if (form) form.appendChild(panel);
  }
  if (_obsQueue.length === 0) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  panel.innerHTML = `
    <div style="font-weight:700;font-size:13px;margin-bottom:8px;color:var(--sky);">📋 Fila de envio (${_obsQueue.length} registro${_obsQueue.length > 1 ? 's' : ''})</div>
    ${_obsQueue.map(o => `
      <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">
        ${o.photoPreview ? `<img src="${o.photoPreview}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0;">` : '<div style="width:36px;height:36px;border-radius:6px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:18px;">🐦</div>'}
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(o.noSpecies ? '(não especificada)' : (o.match ? capitalize(o.match.pop) : o.species))}</div>
          <div style="font-size:11px;color:var(--text-muted);">${escHtml(o.date)}${o.location ? ' · ' + escHtml(o.location.label || '') : ''}</div>
        </div>
        <button onclick="removeFromQueue(${o.id})" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:16px;padding:2px 6px;" title="Remover">✕</button>
      </div>
    `).join('')}
    <button onclick="submitQueue()" style="margin-top:10px;width:100%;height:38px;border:none;border-radius:var(--radius-md);background:linear-gradient(135deg,var(--sky),var(--forest));color:white;font-weight:700;font-size:13px;cursor:pointer;">
      📤 Enviar ${_obsQueue.length} registro${_obsQueue.length > 1 ? 's' : ''} de uma vez
    </button>
  `;
}

async function submitQueue() {
  if (_obsQueue.length === 0) return;
  if (!currentUser) { openAuthModal(); return; }
  const btn = document.getElementById('obs-queue-panel')?.querySelector('button[onclick="submitQueue()"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Enviando...'; }

  let successCount = 0;
  for (const entry of [..._obsQueue]) {
    try {
      let photoUrl = null;
      if (entry.photoFile) {
        photoUrl = await uploadPhoto(entry.photoFile);
      }
      const companionHandle = entry.companions.length > 0 ? entry.companions[0].handle : null;
      const companionId     = entry.companions.length > 0 ? entry.companions[0].id     : null;
      const { error } = await db.from('observations').insert({
        user_id:          currentUser.id,
        species_sci:      entry.match ? entry.match.sci : (entry.noSpecies ? null : entry.species),
        species_pop:      entry.match ? capitalize(entry.match.pop) : (entry.noSpecies ? null : entry.species),
        obs_date:         entry.date,
        obs_time:         entry.time || null,
        lat:              entry.location?.lat ?? null,
        lng:              entry.location?.lng ?? null,
        location_label:   entry.location ? (entry.location.label || null) : null,
        notes:            entry.notes || null,
        photo_url:        photoUrl,
        published_inat:   entry.publishInat,
        companion_handle: companionHandle,
        companion_id:     companionId
      });
      if (!error) {
        if (entry.match && !entry.noSpecies) {
          foundSpecies.add(entry.match.sci);
          await db.from('species_seen').upsert({ user_id: currentUser.id, species_sci: entry.match.sci });
        }
        _obsQueue = _obsQueue.filter(o => o.id !== entry.id);
        successCount++;
      }
    } catch(e) { console.warn('Erro ao enviar da fila:', e); }
  }
  updateChecklistProgress();
  invalidateCache('feed'); invalidateCache('profile');
  renderObsQueue();
  showToast(successCount > 0 ? `✅ ${successCount} registro${successCount > 1 ? 's' : ''} enviado${successCount > 1 ? 's' : ''} com sucesso!` : '⚠️ Erro ao enviar. Tente novamente.');
  if (_obsQueue.length === 0) setTimeout(() => navigateTo('feed', document.querySelector('[data-page=feed]')), 800);
}

function btn_submit_label(text) {
  const btn = document.getElementById('btn-submit');
  if (btn) btn.innerHTML = text;
}

async function submitObservation() {
  if (!currentUser) {
    showToast('🔑 Faça login para registrar avistamentos');
    openAuthModal();
    return;
  }

  const noSpecies = document.getElementById('no-species-check')?.checked;
  const species = noSpecies ? '' : document.getElementById('species-input').value.trim();
  const date = document.getElementById('obs-date').value;
  if (!noSpecies && !species) { showToast('⚠️ Informe a espécie ou marque "Não especificar"'); return; }
  if (!date) { showToast('⚠️ Informe a data'); return; }

  // Verifica limite diário (consultando banco)
  const todayStr = new Date().toISOString().slice(0,10);
  const { count: todayCount } = await db.from('observations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', currentUser.id)
    .gte('obs_date', todayStr);
  const rankLevel = Math.floor(foundSpecies.size / 100); // 0-9
  const dailyLimit = 25 + rankLevel * 5;
  if (todayCount >= dailyLimit) {
    showToast(`⚠️ Limite diário de ${dailyLimit} registros atingido! Sobe de nível para mais.`);
    return;
  }

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.innerHTML = '⏳ Enviando…';

  const match = SC_BIRDS.find(b =>
    b.sci.toLowerCase() === species.toLowerCase() ||
    b.pop.toLowerCase() === species.toLowerCase()
  );

  const photoFile = document.getElementById('photo-input').files[0] || null;
  let photoUrl = null;
  if (photoFile) {
    photoUrl = await uploadPhoto(photoFile);
    btn.innerHTML = '⏳ Salvando…';
  }

  const obs = {
    species: noSpecies ? '(espécie não especificada)' : (match ? capitalize(match.pop) : species),
    sciName: noSpecies ? '' : (match ? match.sci : ''),
    unspecified: !!noSpecies,
    date,
    time: document.getElementById('obs-time').value,
    location: currentLocation
      ? (currentLocation.label || (currentLocation.lat != null ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : ''))
      : '',
    notes: document.getElementById('obs-notes').value,
    photoUrl,
    publishInat: false, // document.getElementById('inat-publish')?.checked — desabilitado temporariamente
  };

  // Verifica se é espécie nova ANTES de adicionar
  const isNewSpecies = match && !noSpecies && !foundSpecies.has(match.sci);

  // Marca como encontrada no checklist do AUTOR
  if (match && !noSpecies) {
    foundSpecies.add(match.sci);
    updateChecklistProgress();
    await db.from('species_seen').upsert({
      user_id: currentUser.id,
      species_sci: match.sci
    });
  }

  // Insere no banco
  const companionHandle = _selectedCompanions.length > 0 ? _selectedCompanions[0].handle : null;
  const companionId     = _selectedCompanions.length > 0 ? _selectedCompanions[0].id     : null;
  const { error } = await db.from('observations').insert({
    user_id:        currentUser.id,
    species_sci:    match ? match.sci : (noSpecies ? null : species),
    species_pop:    match ? capitalize(match.pop) : (noSpecies ? null : species),
    obs_date:       date,
    obs_time:       document.getElementById('obs-time').value || null,
    lat:            currentLocation?.lat ?? null,
    lng:            currentLocation?.lng ?? null,
    location_label: currentLocation
      ? (currentLocation.label || (currentLocation.lat != null ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}` : null))
      : null,
    notes:          obs.notes || null,
    photo_url:      photoUrl,
    published_inat: false,
    companion_handle: companionHandle,
    companion_id:     companionId
  });

  if (error) {
    console.error('Erro ao salvar avistamento:', error);
    showToast('⚠️ Erro ao salvar no banco. Tente novamente.');
    btn.disabled = false;
    btn.innerHTML = '📤 Enviar Avistamento';
    return;
  }

  // Registra species_seen para o COMPANHEIRO também (sem await para não bloquear)
  if (match && !noSpecies && companionId) {
    db.from('species_seen').upsert({ user_id: companionId, species_sci: match.sci }).catch(() => {});
  }

  btn.disabled = false;
  btn.innerHTML = '📤 Enviar Avistamento';

  // Animação de celebração com info de espécie nova ou já encontrada
  showObsCelebration(obs.species || obs.sciName, isNewSpecies);
  invalidateCache('feed'); invalidateCache('profile');

  // Limpa formulário
  document.getElementById('species-input').value = '';
  document.getElementById('obs-notes').value = '';
  document.getElementById('obs-qty').value = '1';
  document.getElementById('obs-time').value = '';
  removePreview();
  currentLocation = null;
  document.getElementById('location-display').textContent = 'Nenhuma localização selecionada';
  document.getElementById('location-display').classList.remove('has-location');
  const msearch = document.getElementById('municipio-search');
  if (msearch) msearch.value = '';
  document.getElementById('municipio-input-wrap').style.display = 'none';
  const btnGps = document.getElementById('btn-gps');
  if (btnGps) { btnGps.textContent = '📍 GPS'; btnGps.style.cssText = ''; }
  _selectedCompanions = [];
  renderSelectedCompanions();

  // Navega para feed
  setTimeout(() => navigateTo('feed', document.querySelector('[data-page=feed]')), 800);
}

/* ════════════════════════════════════════
   PERFIL — AGORA CONSULTA BANCO PARA ESTATÍSTICAS E GALERIA
════════════════════════════════════════ */
async function renderProfile() {
  if (!currentUser) {
    const pN = document.getElementById('profile-name');
    const pH = document.getElementById('profile-handle');
    if (pN) pN.textContent = 'Faça login para ver seu perfil';
    if (pH) pH.textContent = '';
    return;
  }

  // Carrega estatísticas do banco
  const [obsCount, photoCount, daysCount, pts] = await Promise.all([
    db.from('observations').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id),
    db.from('observations').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id).not('photo_url', 'is', null),
    db.from('observations').select('obs_date').eq('user_id', currentUser.id).not('obs_date', 'is', null),
    calcIndicadorasPoints(foundSpecies)
  ]);

  document.getElementById('stat-species').textContent = foundSpecies.size;
  document.getElementById('stat-obs').textContent = obsCount.count || 0;
  document.getElementById('stat-photos').textContent = photoCount.count || 0;
  document.getElementById('stat-days').textContent = daysCount.data ? new Set(daysCount.data.map(d => d.obs_date)).size : 0;
  document.getElementById('stat-points').textContent = pts;

  // Bio do perfil
  const bio = currentUser.bio || '';
  const bioEl = document.getElementById('profile-bio');
  if (bioEl) bioEl.textContent = bio || 'Clique para adicionar uma descrição…';

  // Avatar e capa
  if (currentUser.avatar_url) applyAvatar(currentUser.avatar_url);
  if (currentUser.cover_url) {
    const coverImg = document.getElementById('profile-cover-img');
    if (coverImg) {
      coverImg.src = currentUser.cover_url;
      coverImg.style.objectPosition = `50% ${currentUser.cover_pos || 50}%`;
      coverImg.style.display = 'block';
      document.getElementById('profile-cover-pattern').style.display = 'none';
      document.getElementById('btn-cover-adjust').style.display = 'block';
    }
  }

  // Galeria (fotos das observações do usuário)
  const { data: userObs } = await db.from('observations')
    .select('id, photo_url, species_pop, species_sci, obs_date, location_label')
    .eq('user_id', currentUser.id)
    .not('photo_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(60);
  const gallery = document.getElementById('gallery-grid');
  if (gallery) {
    if (userObs && userObs.length) {
      gallery.innerHTML = userObs.map(o => {
        const obsForExpand = { id: o.id, species: o.species_pop, sciName: o.species_sci, photoUrl: o.photo_url, date: o.obs_date, location: o.location_label, notes: '', user: { name: currentUser.name, handle: currentUser.handle } };
        return `<div class="gallery-item" onclick="openPhotoExpand(${JSON.stringify(obsForExpand).replace(/"/g,'&quot;')})">
          <img src="${o.photo_url}" style="width:100%;height:100%;object-fit:cover;" alt="${escHtml(o.species_pop||'')}">
          <div class="gallery-item-label">${escHtml(capitalize(o.species_pop || o.species_sci || ''))}</div>
        </div>`;
      }).join('');
    } else {
      gallery.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Nenhuma foto ainda.<br>Registre um avistamento com foto! 📸</div>`;
    }
  }

  renderChecklistGrid('');
  loadFollowCounts();
  renderDynamicBadges();
}

function renderChecklistGrid(filter) {
  const grid = document.getElementById('checklist-grid');
  const foundList = SC_BIRDS.filter(b => foundSpecies.has(b.sci));
  const birds = filter
    ? foundList.filter(b => b.pop.toLowerCase().includes(filter) || b.sci.toLowerCase().includes(filter))
    : foundList;

  if (!birds.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">${filter ? 'Nenhuma espécie encontrada com esse filtro.' : 'Nenhuma espécie encontrada ainda.<br>Comece registrando avistamentos! 🐦'}</div>`;
    return;
  }
  grid.innerHTML = birds.map(b => {
    const pts = INDICADORAS[b.sci];
    return `<div class="species-check-item found" style="flex-wrap:wrap;gap:4px;">
      <div class="species-check-icon">✓</div>
      <div style="flex:1;min-width:0;">
        <div class="species-check-name">${capitalize(b.pop)}</div>
        <div class="species-check-sci">${b.sci}</div>
      </div>
      ${pts ? `<span style="background:var(--sun-light);color:#92400e;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:700;">⭐ ${pts}pts</span>` : ''}
    </div>`;
  }).join('');
}

function filterChecklist(val) {
  renderChecklistGrid(val.toLowerCase());
}

function switchProfileTab(tab, btn) {
  ['profile-checklist','profile-gallery','profile-amizades'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById('profile-' + tab) || document.getElementById('profile-amizades');
  if (target) target.style.display = 'block';
  document.querySelectorAll('.profile-tab-btn').forEach(b => {
    b.style.borderBottomColor = 'transparent';
    b.style.color = 'var(--text-muted)';
    b.style.fontFamily = "'DM Sans', sans-serif";
    b.style.fontWeight = '500';
  });
  btn.style.borderBottomColor = 'var(--sky)';
  btn.style.color = 'var(--sky)';
  btn.style.fontFamily = "'Syne', sans-serif";
  btn.style.fontWeight = '700';
  if (tab === 'amizades') renderAmizades();
}

/* ════════════════════════════════════════
   PESQUISA DE USUÁRIOS
════════════════════════════════════════ */
async function renderUsers(filter) {
  const grid = document.getElementById('users-grid');
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--text-muted)">🔍 Buscando…</div>`;

  let users = [];
  try {
    let query = db.from('profiles').select('id, nome, handle, cidade, avatar_url');
    if (filter) query = query.or(`nome.ilike.%${filter}%,handle.ilike.%${filter}%`);
    const { data } = await query.limit(20);
    if (data && data.length > 0) {
      users = data.map(u => ({
        id: u.id, name: u.nome, handle: u.handle, city: u.cidade || '—',
        avatar_url: u.avatar_url || null, _fromDB: true
      }));
    }
  } catch(e) { console.warn('Erro ao buscar usuários:', e); }

  if (!users.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="empty-emoji">🔍</div>
      <div class="empty-title">Nenhum usuário encontrado</div>
    </div>`;
    return;
  }

  // Pré-carrega estado de seguir para todos (se logado)
  let followingSet = new Set();
  if (currentUser) {
    try {
      const userIds = users.map(u => u.id).filter(Boolean);
      const { data: fData } = await db.from('follows')
        .select('following_id').eq('follower_id', currentUser.id).in('following_id', userIds);
      (fData || []).forEach(r => followingSet.add(r.following_id));
    } catch(e) {}
  }

  grid.innerHTML = users.map(u => {
    const safeName   = escHtml(u.name   || 'Usuário');
    const safeHandle = escHtml(u.handle || '');
    const safeCity   = escHtml(u.city   || '—');
    const safeId     = escHtml(u.id     || '');
    const initial    = (u.name||'U')[0].toUpperCase();
    const isMe       = currentUser && currentUser.id === u.id;
    const isFollowing = followingSet.has(u.id);
    const avatarHtml = u.avatar_url
      ? `<img src="${escHtml(u.avatar_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.textContent='${initial}'">`
      : initial;
    const followBtnStyle = isFollowing
      ? 'border:1.5px solid var(--border);background:var(--bg);color:var(--text-mid);'
      : 'border:none;background:linear-gradient(135deg,var(--sky),var(--sky-dark));color:white;';
    const followBtnText = isFollowing ? '✓ Seguindo' : '+ Seguir';
    return `<div class="user-card" style="cursor:pointer;" onclick="openPublicProfile('${safeHandle}')">
      <div class="user-card-avatar" style="background:linear-gradient(135deg,#0ea5e9,#0ea5e9cc);overflow:hidden;">${avatarHtml}</div>
      <div class="user-card-name">${safeName}</div>
      <div class="user-card-handle" style="color:var(--sky);">@${safeHandle} · ${safeCity}</div>
      <div class="user-card-stats">
        <div><span class="user-card-stat-num" id="usp_${safeHandle}">…</span><span class="user-card-stat-label">Espécies</span></div>
        <div><span class="user-card-stat-num" id="uob_${safeHandle}">…</span><span class="user-card-stat-label">Registros</span></div>
        <div><span class="user-card-stat-num" id="ufo_${safeHandle}">…</span><span class="user-card-stat-label">Seguidores</span></div>
      </div>
      ${!isMe ? `<button id="fbtn_${safeHandle}" class="btn-follow ${isFollowing?'following':''}" data-following="${isFollowing?'1':'0'}"
        onclick="event.stopPropagation();toggleFollowUser('${safeId}','${safeHandle}',this)"
        style="${followBtnStyle}">${followBtnText}</button>` : ''}
    </div>`;
  }).join('');
  users.forEach(u => { if (u.id) loadUserStats(u.id, u.handle); });
}

function searchUsers(val) {
  renderUsers(val.toLowerCase().trim());
}

/* ════════════════════════════════════════
   AUTH (FRONTEND — Supabase depois)
════════════════════════════════════════ */
function openAuthModal(tab) {
  const modal = document.getElementById('auth-modal');
  modal.classList.add('open');
  if (tab) switchAuthTab(tab);
}

async function doGoogleLogin() {
  document.getElementById('auth-modal').classList.remove('open');
  const { error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) { showToast('⚠️ Erro ao iniciar login com Google: ' + error.message); }
}

function openHandleModal(googleUser) {
  const avatarEl = document.getElementById('google-avatar');
  const nameEl   = document.getElementById('google-name');
  const emailEl  = document.getElementById('google-email');
  if (avatarEl) avatarEl.textContent = (googleUser.name || 'U')[0].toUpperCase();
  if (nameEl)   nameEl.textContent   = googleUser.name  || '—';
  if (emailEl)  emailEl.textContent  = googleUser.email || '—';
  const inp = document.getElementById('handle-input');
  if (inp) { inp.value = ''; }
  document.getElementById('handle-feedback').textContent = '';
  const btn = document.getElementById('handle-confirm-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; }
  document.getElementById('handle-modal').classList.add('open');
}

function validateHandle(val) {
  const feedback = document.getElementById('handle-feedback');
  const btn      = document.getElementById('handle-confirm-btn');
  const clean = val.trim().toLowerCase().replace(/\s+/g, '_');
  const inp = document.getElementById('handle-input');
  if (inp && val !== clean && val.includes(' ')) inp.value = clean;
  const valid = /^[a-z0-9_]{3,30}$/.test(clean);

  if (!clean) {
    feedback.textContent = '';
    feedback.style.color = '';
  } else if (clean.length < 3) {
    feedback.textContent = '⚠️ Mínimo 3 caracteres';
    feedback.style.color = 'var(--sun)';
  } else if (!valid) {
    feedback.textContent = '⚠️ Use apenas letras minúsculas, números e _ (sem acentos)';
    feedback.style.color = 'var(--coral)';
  } else {
    feedback.textContent = `✓ @${clean} parece válido`;
    feedback.style.color = 'var(--forest)';
  }

  const ok = valid && clean.length >= 3;
  btn.disabled     = !ok;
  btn.style.opacity  = ok ? '1'            : '0.5';
  btn.style.cursor   = ok ? 'pointer'      : 'not-allowed';
}

function switchAuthTab(tab, btn) {
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('auth-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');
}


/* ════════════════════════════════════════
   ANIMAÇÃO DE LOGIN
════════════════════════════════════════ */
function showLoginAnimation(userName) {
  // Remove qualquer overlay anterior
  const existing = document.getElementById('login-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'login-overlay';
  overlay.style.cssText = [
    'position:fixed','inset:0','z-index:99999',
    'display:flex','flex-direction:column','align-items:center','justify-content:center','gap:18px',
    'background:var(--bg)','opacity:0','transition:opacity .3s ease'
  ].join(';');

  overlay.innerHTML = `
    <div style="position:relative;width:90px;height:90px;">
      <div id="login-bird-orbit" style="position:absolute;inset:0;animation:loginOrbit 1.1s linear infinite;">
        <span style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:22px;">🐦</span>
      </div>
      <div style="position:absolute;inset:8px;border-radius:50%;background:linear-gradient(135deg,var(--sky),var(--forest));display:flex;align-items:center;justify-content:center;font-size:34px;box-shadow:0 4px 20px rgba(14,165,233,0.4);">
        🌿
      </div>
    </div>
    <div style="text-align:center;">
      <div style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--text);animation:loginFadeUp .5s ease .2s both;">
        Bem-vindo${userName ? ', ' + userName.split(' ')[0] : ''}!
      </div>
      <div style="font-size:13px;color:var(--text-muted);margin-top:4px;animation:loginFadeUp .5s ease .4s both;">
        Preparando seu ambiente…
      </div>
    </div>
    <div style="width:220px;height:4px;background:var(--border);border-radius:4px;overflow:hidden;animation:loginFadeUp .5s ease .3s both;">
      <div style="height:100%;background:linear-gradient(90deg,var(--sky),var(--forest));border-radius:4px;animation:loginBar 1.4s ease-out .2s forwards;width:0%;"></div>
    </div>
  `;

  // Keyframes dinâmicos (só se não existirem)
  if (!document.getElementById('login-keyframes')) {
    const style = document.createElement('style');
    style.id = 'login-keyframes';
    style.textContent = `
      @keyframes loginOrbit {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes loginFadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes loginBar {
        from { width: 0%; }
        to   { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);
  // Fade in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
  });
  // Remove após animação
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 350);
  }, 1800);
}


/* ════════════════════════════════════════
   HELPER — CRÉDITO COM COMPANIONS
════════════════════════════════════════ */
function buildCreditHtml(obs) {
  const handle  = obs.user?.handle || '';
  const name    = obs.user?.name   || obs.userName || 'Usuário';
  const inatId  = obs.inatId || obs.inat_id || null;
  const isAvAvista = !!obs.id && !inatId;

  // Monta lista de companions (pode ser array ou single)
  const companions = [];
  if (obs.companionHandle) companions.push({ handle: obs.companionHandle, name: obs.companionName || obs.companionHandle });
  if (obs.companions && Array.isArray(obs.companions)) {
    obs.companions.forEach(c => { if (c.handle && !companions.find(x => x.handle === c.handle)) companions.push(c); });
  }

  // Monta parte do autor principal
  let authorPart = '';
  if (isAvAvista && handle) {
    authorPart = `<span onclick="openPublicProfile('${escHtml(handle)}')" style="color:var(--sky);cursor:pointer;font-weight:600;">@${escHtml(handle)}</span>`;
  } else if (inatId) {
    authorPart = `<a href="https://www.inaturalist.org/observations/${inatId}" target="_blank" style="color:var(--sky);font-weight:600;">${escHtml(name)} · iNaturalist ↗</a>`;
  } else if (name) {
    authorPart = `<span style="font-weight:600;">${escHtml(name)}</span>`;
  }

  // Monta parte dos companions
  let companionPart = '';
  if (companions.length > 0) {
    const parts = companions.map(c =>
      `<span onclick="openPublicProfile('${escHtml(c.handle)}')" style="color:var(--sky);cursor:pointer;font-weight:600;">@${escHtml(c.handle)}</span>`
    );
    if (parts.length === 1) {
      companionPart = ' e ' + parts[0];
    } else {
      companionPart = ', ' + parts.slice(0, -1).join(', ') + ' e ' + parts[parts.length - 1];
    }
  }

  if (!authorPart && !companionPart) return '';
  return `📸 ${authorPart}${companionPart} · Ave à Vista`;
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) { showToast('⚠️ Preencha e-mail e senha'); return; }
  const btn = document.querySelector('#auth-login .btn-auth-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Entrando…'; }
  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password: pass });
    if (error) {
      const msg = error.message.includes('Invalid login') ? 'E-mail ou senha incorretos' :
                  error.message.includes('Email not confirmed') ? 'Confirme seu e-mail antes de entrar' :
                  error.message;
      showToast('❌ ' + msg);
      return;
    }
    document.getElementById('auth-modal').classList.remove('open');
    const loginName = (await db.from('profiles').select('nome').eq('id', data.user.id).maybeSingle()).data?.nome || '';
    showLoginAnimation(loginName);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
  }
}

async function doRegister() {
  const name   = document.getElementById('reg-name').value.trim();
  const handle = document.getElementById('reg-handle').value.trim().replace(/\s+/g, '_').toLowerCase().replace(/^@/, '');
  const email  = document.getElementById('reg-email').value.trim();
  const pass   = document.getElementById('reg-pass').value;
  const terms  = document.getElementById('terms-check').checked;
  if (!name || !handle || !email || !pass) { showToast('⚠️ Preencha todos os campos'); return; }
  if (!terms) { showToast('⚠️ Aceite os termos de uso'); return; }
  if (pass.length < 8) { showToast('⚠️ Senha deve ter pelo menos 8 caracteres'); return; }
  if (!/^[a-z0-9_]{3,30}$/.test(handle)) { showToast('⚠️ @usuário inválido — use só letras minúsculas, números e _'); return; }

  const btn = document.querySelector('#auth-register .btn-auth-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Criando conta…'; }

  try {
    const { data: existing } = await db.from('profiles').select('id').eq('handle', handle).maybeSingle();
    if (existing) { showToast('⚠️ @' + handle + ' já está em uso. Escolha outro.'); return; }

    const { data, error } = await db.auth.signUp({
      email, password: pass,
      options: { data: { nome: name, handle } }
    });
    if (error) { showToast('❌ ' + error.message); return; }
    if (!data?.user) { showToast('⚠️ Erro inesperado ao criar conta'); return; }

    const { error: profileError } = await db.from('profiles').insert({ id: data.user.id, nome: name, handle });
    if (profileError && profileError.code !== '23505') {
      sessionStorage.setItem('av_pending_profile', JSON.stringify({ id: data.user.id, nome: name, handle }));
    }

    document.getElementById('auth-modal').classList.remove('open');
    showToast('🎉 Conta criada! Verifique seu e-mail e clique no link de confirmação.');

  } catch(e) {
    showToast('❌ Erro inesperado: ' + (e.message || e));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Criar Conta'; }
  }
}

async function doForgot() {
  const email = document.getElementById('forgot-email').value.trim();
  if (!email) { showToast('⚠️ Informe seu e-mail'); return; }
  const { error } = await db.auth.resetPasswordForEmail(email);
  showToast(error ? '❌ ' + error.message : '📧 Link de redefinição enviado!');
}

function authBtnClick() {
  if (currentUser) navigateTo('profile', document.querySelector('[data-page=profile]'));
  else openAuthModal();
}

function updateSidebarAuth() {
  document.querySelectorAll('.sidebar-btn[data-page]').forEach(btn => {
    const page = btn.getAttribute('data-page');
    btn.classList.toggle('locked', !currentUser && ['upload','messages','notifications'].includes(page));
  });

  const sa  = document.getElementById('sidebar-auth');
  const top = document.getElementById('topbar-auth-btn');

  if (!currentUser) {
    if (sa) sa.innerHTML = '<button class="sidebar-login-pill" onclick="openAuthModal()"><span class="s-icon">🔑</span><span class="s-label">Entrar / Registrar</span></button>';
    if (top) { top.textContent = '👤'; top.title = 'Entrar'; }
    return;
  }

  const dn = (currentUser.handle||'')
    .split('_').map(w => w ? w[0].toUpperCase()+w.slice(1) : '').join(' ')
    || currentUser.name || 'Usuário';
  const ini = (dn[0]||'?').toUpperCase();

  if (sa) {
    const av = currentUser.avatar_url
      ? `<img src="${escHtml(currentUser.avatar_url)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`
      : `<div class="avatar-sm">${ini}</div>`;
    sa.innerHTML = `<div id="_sucard" class="sidebar-user" style="cursor:pointer;">${av}<div class="user-info"><div class="user-name">${escHtml(dn)}</div><div class="user-handle">@${escHtml(currentUser.handle)}</div></div></div>`;
    const card = document.getElementById('_sucard');
    if (card) card.onclick = () => navigateTo('profile', document.querySelector('[data-page=profile]'));
  }

  if (top) { top.textContent = ini; top.title = '@'+currentUser.handle; }

  const pN = document.getElementById('profile-name');
  const pH = document.getElementById('profile-handle');
  const pL = document.getElementById('profile-avatar-letter');
  if (pN) pN.textContent = dn;
  if (pH) pH.textContent = '@'+currentUser.handle;
  if (pL) pL.textContent = ini;
  if (currentUser.avatar_url) setTimeout(() => applyAvatar(currentUser.avatar_url), 0);
}

async function doLogout() {
  // Animação de desconexão
  const overlay = document.createElement('div');
  overlay.id = 'logout-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';
  overlay.innerHTML = `
    <div style="font-size:48px;animation:spin 1.2s linear infinite;">🐦</div>
    <div style="font-weight:700;font-size:18px;color:var(--text);">Aguarde, estamos te desconectando...</div>
    <div style="width:200px;height:4px;background:var(--border);border-radius:4px;overflow:hidden;">
      <div style="height:100%;background:var(--sky);border-radius:4px;animation:logoutProgress 1.2s ease-out forwards;"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  // Garante que as animações estejam definidas
  if (!document.getElementById('logout-keyframes')) {
    const style = document.createElement('style');
    style.id = 'logout-keyframes';
    style.textContent = `@keyframes spin{to{transform:rotate(360deg)}}@keyframes logoutProgress{from{width:0%}to{width:100%}}`;
    document.head.appendChild(style);
  }
  await new Promise(r => setTimeout(r, 1200));
  stopRealtimeSubscriptions();
  stopNotifRealtime();
  await db.auth.signOut();
  currentUser = null;
  foundSpecies = new Set();
  updateSidebarAuth();
  updateChecklistProgress();
  const pN = document.getElementById('profile-name');
  const pH = document.getElementById('profile-handle');
  if (pN) pN.textContent = 'Faça login para ver seu perfil';
  if (pH) pH.textContent = '';
  overlay.remove();
  navigateTo('home', document.querySelector('[data-page=home]'));
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-page=home]')?.classList.add('active');
  showToast('👋 Até logo!');
}

async function loadUserChecklist() {
  if (!currentUser) return;
  try {
    const { data } = await db
      .from('species_seen')
      .select('species_sci')
      .eq('user_id', currentUser.id);
    if (data) {
      foundSpecies.clear();
      data.forEach(row => foundSpecies.add(row.species_sci));
      updateChecklistProgress();
      renderChecklistGrid('');
      if (todayBird) checkBirdOfDayFound(todayBird.sci);
    }
  } catch(e) { console.warn('Checklist: erro ao carregar', e); }
}

async function checkBirdOfDayFound(sci) {
  const btn = document.getElementById('btn-found');
  if (!btn) return;
  if (!currentUser) {
    btn.classList.remove('already-found');
    btn.textContent = '✅ Encontrei esta ave!';
    return;
  }
  if (foundSpecies.has(sci)) {
    btn.classList.add('already-found');
    btn.textContent = '✅ Já registrada!';
    return;
  }
  try {
    const { data } = await db
      .from('species_seen')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('species_sci', sci)
      .single();
    if (data) {
      foundSpecies.add(sci);
      btn.classList.add('already-found');
      btn.textContent = '✅ Já registrada!';
    } else {
      btn.classList.remove('already-found');
      btn.textContent = '✅ Encontrei esta ave!';
    }
  } catch(e) {
    btn.classList.remove('already-found');
    btn.textContent = '✅ Encontrei esta ave!';
  }
}

/* ════════════════════════════════════════
   FOTO DE PERFIL (avatar)
════════════════════════════════════════ */
async function uploadAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  if (!currentUser) { showToast('⚠️ Faça login para alterar o avatar'); return; }
  showToast('⏳ Enviando foto de perfil…');
  try {
    const ext  = file.name.split('.').pop() || 'jpg';
    const path = `${currentUser.id}/avatar.${ext}`;
    await db.storage.from('observation-photos').upload(path, file, { upsert: true, contentType: file.type });
    const { data: { publicUrl } } = db.storage.from('observation-photos').getPublicUrl(path);
    await db.from('profiles').update({ avatar_url: publicUrl }).eq('id', currentUser.id);
    currentUser.avatar_url = publicUrl;
    applyAvatar(publicUrl);
    showToast('✅ Foto de perfil atualizada!');
  } catch(e) { console.error(e); showToast('❌ Erro ao enviar foto'); }
}

function applyAvatar(url) {
  if (!url) return;
  const img    = document.getElementById('profile-avatar-img');
  const letter = document.getElementById('profile-avatar-letter');
  if (img)    { img.src = url; img.style.display = 'block'; }
  if (letter) { letter.style.display = 'none'; }
  const sidebarAv = document.querySelector('#sidebar-auth .avatar-sm');
  const sidebarImg = document.querySelector('#sidebar-auth img[style*="border-radius:50%"]');
  if (sidebarAv) {
    const ni = document.createElement('img');
    ni.src = url; ni.style.cssText='width:32px;height:32px;border-radius:50%;object-fit:cover;';
    sidebarAv.replaceWith(ni);
  } else if (sidebarImg) { sidebarImg.src = url; }
  const topBtn = document.getElementById('topbar-auth-btn');
  if (topBtn && topBtn.textContent.length === 1) {
    topBtn.innerHTML = `<img src="${url}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">`;
  }
}

/* ════════════════════════════════════════
   BIO EDITÁVEL (agora persiste no banco)
════════════════════════════════════════ */
function startEditBio() {
  if (!currentUser) { showToast('⚠️ Faça login para editar a bio'); return; }
  document.getElementById('profile-bio').style.display = 'none';
  const editor = document.getElementById('profile-bio-editor');
  editor.style.display = 'block';
  const ta = document.getElementById('profile-bio-input');
  ta.value = currentUser.bio || '';
  updateBioCount(ta.value);
  ta.focus();
}

function updateBioCount(val) {
  const el = document.getElementById('bio-char-count');
  if (el) el.textContent = `${val.length} / 1000`;
}

function cancelEditBio() {
  document.getElementById('profile-bio-editor').style.display = 'none';
  document.getElementById('profile-bio').style.display = 'block';
}

async function saveBio() {
  const val   = document.getElementById('profile-bio-input').value.trim();
  const bioEl = document.getElementById('profile-bio');
  bioEl.textContent = val || 'Clique para adicionar uma descrição…';
  bioEl.style.display = 'block';
  document.getElementById('profile-bio-editor').style.display = 'none';
  if (currentUser) {
    await db.from('profiles').update({ bio: val }).eq('id', currentUser.id);
    currentUser.bio = val;
  }
  showToast('✅ Bio atualizada!');
}

/* ════════════════════════════════════════
   FOTO DE CAPA + AJUSTE DE POSIÇÃO (agora no banco)
════════════════════════════════════════ */
let _coverAdjustOpen = false;

function toggleCoverAdjust() {
  _coverAdjustOpen = !_coverAdjustOpen;
  const bar = document.getElementById('cover-adjust-bar');
  if (bar) bar.style.display = _coverAdjustOpen ? 'flex' : 'none';
  if (_coverAdjustOpen && currentUser?.cover_pos) {
    document.getElementById('cover-pos-slider').value = currentUser.cover_pos;
  }
}

function adjustCoverPosition(val) {
  document.getElementById('profile-cover-img').style.objectPosition = `50% ${val}%`;
}

async function saveCoverPosition() {
  const val = document.getElementById('cover-pos-slider').value;
  if (currentUser) {
    await db.from('profiles').update({ cover_pos: parseInt(val) }).eq('id', currentUser.id);
    currentUser.cover_pos = parseInt(val);
  }
  toggleCoverAdjust();
  showToast('✅ Posição salva!');
}

function openCoverPicker() {
  const withPhoto = [];
  db.from('observations')
    .select('id, photo_url, species_pop')
    .eq('user_id', currentUser.id)
    .not('photo_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(30)
    .then(({ data }) => {
      const grid = document.getElementById('cover-gallery-grid');
      if (!data || data.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:24px;">Nenhuma foto ainda.<br>Registre avistamentos com foto primeiro! 📸</p>';
      } else {
        grid.innerHTML = data.map(o => `
          <div onclick="setCoverPhoto('${(o.photo_url||'').replace(/'/g,"\\'")}')"
            style="cursor:pointer;border-radius:8px;overflow:hidden;aspect-ratio:1;border:2px solid transparent;transition:border-color .2s;"
            onmouseover="this.style.borderColor='var(--sky)'" onmouseout="this.style.borderColor='transparent'">
            <img src="${o.photo_url}" style="width:100%;height:100%;object-fit:cover;" alt="${o.species_pop||''}">
          </div>`).join('');
      }
    });
  document.getElementById('cover-modal').classList.add('open');
}

async function setCoverPhoto(url) {
  document.getElementById('cover-modal').classList.remove('open');
  const img     = document.getElementById('profile-cover-img');
  const pattern = document.getElementById('profile-cover-pattern');
  const savedPos = currentUser?.cover_pos || 50;
  img.src = url;
  img.style.objectPosition = `50% ${savedPos}%`;
  img.style.display = 'block';
  if (pattern) pattern.style.display = 'none';
  const adjBtn = document.getElementById('btn-cover-adjust');
  if (adjBtn) adjBtn.style.display = 'block';
  await db.from('profiles').update({ cover_url: url }).eq('id', currentUser.id);
  if (currentUser) currentUser.cover_url = url;
  showToast('✅ Capa atualizada! Use "↕ Ajustar" para reposicionar.');
}

function openTerms() {
  document.getElementById('terms-modal').classList.add('open');
}

/* ════════════════════════════════════════
   CELEBRAÇÃO + CONFETTI
════════════════════════════════════════ */
function showCelebration(pop) {
  const cel = document.getElementById('celebration');
  document.getElementById('celebration-sub').textContent = `Você encontrou o(a) ${capitalize(pop)}!`;
  cel.classList.add('show');
  setTimeout(() => cel.classList.remove('show'), 2800);
}

/* Celebração específica para novos avistamentos */
function showObsCelebration(speciesName, isNew) {
  // Cria overlay de celebração dedicado
  let ov = document.getElementById('_obs_celebration');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = '_obs_celebration';
    ov.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;pointer-events:none;';
    document.body.appendChild(ov);
  }
  ov.innerHTML = `
    <div style="background:var(--card);border:2px solid ${isNew?'var(--forest)':'var(--sky)'};border-radius:var(--radius-xl);padding:32px 40px;text-align:center;box-shadow:var(--shadow-lg);animation:obsCelIn .4s cubic-bezier(.34,1.56,.64,1);max-width:360px;pointer-events:auto;">
      <div style="font-size:52px;margin-bottom:8px;">${isNew?'🎉':'📸'}</div>
      <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:${isNew?'var(--forest)':'var(--sky)'};margin-bottom:4px;">
        ${isNew ? 'Nova espécie registrada!' : 'Avistamento registrado!'}
      </div>
      <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px;">${escHtml(capitalize(speciesName||''))}</div>
      <div style="font-size:13px;color:var(--text-muted);">${isNew ? '🌟 Adicionada ao seu checklist!' : '✅ Já estava no seu checklist'}</div>
    </div>`;
  ov.style.display = 'flex';
  launchConfetti();
  setTimeout(() => { ov.innerHTML = ''; ov.style.display = 'none'; }, 3200);
}

function launchConfetti() {
  const colors = ['#0ea5e9','#16a34a','#f59e0b','#f43f5e','#8b5cf6','#06b6d4'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      animation-delay: ${Math.random() * 0.5}s;
      animation-duration: ${1.5 + Math.random() * 1}s;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2500);
  }
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ════════════════════════════════════════
   FECHAR MODAIS AO CLICAR FORA
════════════════════════════════════════ */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay && overlay.id !== 'handle-modal') {
      overlay.classList.remove('open');
    }
  });
});

/* ════════════════════════════════════════
   UTILS
════════════════════════════════════════ */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function getSpeciesEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes('águia') || n.includes('gavião')) return '🦅';
  if (n.includes('papagaio') || n.includes('periquito') || n.includes('arara')) return '🦜';
  if (n.includes('pinguim')) return '🐧';
  if (n.includes('tucano')) return '🦜';
  if (n.includes('coruja')) return '🦉';
  if (n.includes('flamingo')) return '🦩';
  if (n.includes('garça') || n.includes('tuiuiú')) return '🦢';
  if (n.includes('pato') || n.includes('marreca')) return '🦆';
  if (n.includes('beija-flor')) return '🌸';
  return '🐦';
}

let globalSearchTimeout = null;

async function searchGlobal(query) {
  const resultsDiv = document.getElementById('global-search-results');
  if (!query.trim()) {
    resultsDiv.style.display = 'none';
    return;
  }

  clearTimeout(globalSearchTimeout);
  globalSearchTimeout = setTimeout(async () => {
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '<div style="padding:12px; text-align:center; color:var(--text-muted);">Buscando...</div>';

    const q = query.trim().toLowerCase();

    // Busca local de aves (já disponível em SC_BIRDS)
    const birdMatches = SC_BIRDS.filter(b =>
      b.pop.toLowerCase().includes(q) || b.sci.toLowerCase().includes(q)
    ).slice(0, 5);

    // Busca de usuários no Supabase
    let userMatches = [];
    try {
      const { data } = await db
        .from('profiles')
        .select('nome, handle, avatar_url')
        .or(`nome.ilike.%${q}%,handle.ilike.%${q}%`)
        .limit(5);
      if (data) userMatches = data;
    } catch (e) {
      console.warn('Erro na busca de usuários:', e);
    }

    if (!birdMatches.length && !userMatches.length) {
      resultsDiv.innerHTML = '<div style="padding:12px; text-align:center; color:var(--text-muted);">Nenhum resultado encontrado</div>';
      return;
    }

    let html = '';

    // Seção de usuários
    if (userMatches.length) {
      html += '<div style="padding:8px 12px; font-size:12px; font-weight:600; color:var(--text-muted); border-bottom:1px solid var(--border);">👤 Usuários</div>';
      userMatches.forEach(u => {
        const displayName = u.nome || u.handle;
        const safeHandle = escHtml(u.handle);
        html += `<div onclick="openPublicProfile('${safeHandle}'); document.getElementById('global-search-results').style.display='none'; document.getElementById('global-search').value='';"
          style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px;"
          onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">
          <div style="width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--sky),var(--forest)); display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:700;">${(displayName[0] || '?').toUpperCase()}</div>
          <div>
            <div style="font-weight:600;">${escHtml(displayName)}</div>
            <div style="font-size:11px; color:var(--text-muted);">@${safeHandle} · usuário</div>
          </div>
        </div>`;
      });
    }

    // Seção de espécies
    if (birdMatches.length) {
      if (userMatches.length) html += '<div style="padding:8px 12px; font-size:12px; font-weight:600; color:var(--text-muted); border-top:1px solid var(--border); border-bottom:1px solid var(--border);">🦜 Espécies</div>';
      else html += '<div style="padding:8px 12px; font-size:12px; font-weight:600; color:var(--text-muted); border-bottom:1px solid var(--border);">🦜 Espécies</div>';

      birdMatches.forEach(b => {
        const popName = capitalize(b.pop);
        const sciName = b.sci;
        html += `<div onclick="openSpeciesModal('${escHtml(sciName)}','${escHtml(popName)}'); document.getElementById('global-search-results').style.display='none'; document.getElementById('global-search').value='';"
          style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px;"
          onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">
          <div style="width:28px; height:28px; background:var(--sky-light); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px;">🦜</div>
          <div>
            <div style="font-weight:600;">${popName}</div>
            <div style="font-size:11px; color:var(--text-muted); font-style:italic;">${sciName}</div>
          </div>
        </div>`;
      });
    }

    resultsDiv.innerHTML = html;
  }, 300);
}

// Fecha os resultados ao clicar fora
document.addEventListener('click', (e) => {
  const searchWrap = document.getElementById('topbar-search-wrap');
  const results = document.getElementById('global-search-results');
  if (results && !searchWrap.contains(e.target)) {
    results.style.display = 'none';
  }
});

/* ════════════════════════════════════════
   MAPA DE LOCALIZAÇÃO (MapLibre GL)
════════════════════════════════════════ */
let _map = null, _mapCoords = null, _mapGeocodeTimer = null;

function closeMapModal() {
  document.getElementById('map-modal').classList.remove('open');
}

function openMapPicker() {
  document.getElementById('map-modal').classList.add('open');
  setTimeout(() => initMap(), 250);
}

function initMap() {
  if (_map) { _map.resize(); return; }
  if (!window.maplibregl) { showToast('⚠️ Mapa ainda carregando…'); setTimeout(initMap, 800); return; }
  _map = new maplibregl.Map({
    container: 'maplibre-map',
    style: {
      version: 8,
      sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap' } },
      layers:  [{ id: 'osm', type: 'raster', source: 'osm' }]
    },
    center: [-49.5, -27.5], zoom: 7, attributionControl: false
  });
  _map.on('move', () => {
    const c = _map.getCenter();
    _mapCoords = { lat: c.lat, lng: c.lng };
    document.getElementById('map-coords-label').textContent = `📍 ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}…`;
    clearTimeout(_mapGeocodeTimer);
  });
  _map.on('moveend', () => {
    const c = _map.getCenter();
    _mapCoords = { lat: c.lat, lng: c.lng };
    clearTimeout(_mapGeocodeTimer);
    _mapGeocodeTimer = setTimeout(() => reverseGeocode(c.lat, c.lng), 700);
  });
}

async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt`,
      { headers: { 'User-Agent': 'AveAvista/1.0' } }
    );
    const geo = await r.json();
    const addr = geo.address || {};
    const municipio = addr.city || addr.town || addr.village || addr.municipality || '';
    const bairro    = addr.suburb || addr.neighbourhood || addr.hamlet || addr.quarter || '';
    const estado    = addr.state || 'SC';
    const label     = [bairro, municipio, estado].filter(Boolean).join(', ');
    if (_mapCoords) { _mapCoords.label = label; _mapCoords.municipio = municipio; _mapCoords.bairro = bairro; }
    const coordStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const labelEl = document.getElementById('map-coords-label');
    if (labelEl) labelEl.textContent = `📍 ${label || coordStr} (${coordStr})`;
    const munSearch = document.getElementById('municipio-search');
    if (munSearch && document.getElementById('municipio-input-wrap')?.style.display !== 'none' && municipio) {
      munSearch.value = municipio;
      filterMunicipios(municipio);
    }
    const dispEl = document.getElementById('location-display');
    if (dispEl && currentLocation && currentLocation.fromGPS) {
      currentLocation.label = label;
      dispEl.textContent = `📍 ${label} (${coordStr})`;
    }
  } catch(e) {
    const labelEl = document.getElementById('map-coords-label');
    if (labelEl) labelEl.textContent = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function searchMapAddress() {
  const q = document.getElementById('map-search-input').value.trim();
  if (!q) return;
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q+', Santa Catarina, Brasil')}&format=json&limit=1&accept-language=pt`,
      { headers: { 'User-Agent': 'AveAvista/1.0' } }
    );
    const data = await r.json();
    if (data && data[0]) {
      _map.flyTo({ center: [parseFloat(data[0].lon), parseFloat(data[0].lat)], zoom: 13, duration: 900 });
    } else { showToast('⚠️ Endereço não encontrado em SC'); }
  } catch(e) { showToast('⚠️ Erro na busca'); }
}

function confirmMapLocation() {
  if (!_mapCoords) { showToast('⚠️ Mova o mapa para posicionar o pino'); return; }
  currentLocation = _mapCoords;
  const display = document.getElementById('location-display');
  const coordStr = `${_mapCoords.lat.toFixed(5)}, ${_mapCoords.lng.toFixed(5)}`;
  display.textContent = _mapCoords.label ? `📍 ${_mapCoords.label} (${coordStr})` : `📍 ${coordStr}`;
  display.classList.add('has-location');
  closeMapModal();
  showToast('✅ Localização confirmada!');
}

/* ════════════════════════════════════════
   MUNICÍPIOS DE SC — 295 municípios
════════════════════════════════════════ */
const SC_MUNICIPIOS = [
  "Abdon Batista","Abelardo Luz","Agrolândia","Agronômica","Água Doce","Águas de Chapecó",
  "Águas Frias","Águas Mornas","Alfredo Wagner","Alto Bela Vista","Anchieta","Angelina",
  "Anita Garibaldi","Anitápolis","Antônio Carlos","Apiúna","Arabutã","Araquari","Araranguá",
  "Armazém","Arroio Trinta","Arvoredo","Ascurra","Atalanta","Aurora","Balneário Arroio do Silva",
  "Balneário Barra do Sul","Balneário Camboriú","Balneário Gaivota","Balneário Piçarras",
  "Balneário Rincão","Bandeirante","Barra Bonita","Barra Velha","Bela Vista do Toldo",
  "Belmonte","Benedito Novo","Biguaçu","Blumenau","Bocaina do Sul","Bom Jardim da Serra",
  "Bom Jesus","Bom Jesus do Oeste","Bom Retiro","Bombinhas","Botuverá","Braço do Norte",
  "Braço do Trombudo","Brunópolis","Brusque","Caçador","Caibi","Calmon","Camboriú",
  "Campo Alegre","Campo Belo do Sul","Campo Erê","Campos Novos","Canelinha","Canoinhas",
  "Capão Alto","Capinzal","Capivari de Baixo","Catanduvas","Caxambu do Sul","Celso Ramos",
  "Cerro Negro","Chapadão do Lageado","Chapecó","Cocal do Sul","Concórdia","Cordilheira Alta",
  "Coronel Freitas","Coronel Martins","Correia Pinto","Corupá","Criciúma","Cunha Porã",
  "Cunhataí","Curitibanos","Descanso","Dionísio Cerqueira","Dona Emma","Doutor Pedrinho",
  "Entre Rios","Ermo","Erval Velho","Faxinal dos Guedes","Flor do Sertão","Florianópolis",
  "Formosa do Sul","Forquilhinha","Fraiburgo","Frei Rogério","Galvão","Garopaba","Garuva",
  "Gaspar","Governador Celso Ramos","Grão-Pará","Gravatal","Guabiruba","Guaraciaba",
  "Guaramirim","Guarujá do Sul","Guatambú","Herval d'Oeste","Ibiam","Ibicaré","Ibirama",
  "Içara","Ilhota","Imaruí","Imbituba","Imbuia","Indaial","Iomerê","Ipira","Iporã do Oeste",
  "Ipuaçu","Ipumirim","Iraceminha","Irani","Irati","Irineópolis","Itá","Itaiópolis","Itajaí",
  "Itapema","Itapiranga","Itapoá","Ituporanga","Jaborá","Jacinto Machado","Jaguaruna",
  "Jaraguá do Sul","Jardinópolis","Joaçaba","Joinville","José Boiteux","Jupiá","Lacerdópolis",
  "Lages","Laguna","Lajeado Grande","Laurentino","Lauro Müller","Lebon Régis","Leoberto Leal",
  "Lindóia do Sul","Lontras","Luiz Alves","Luzerna","Macieira","Mafra","Major Gercino",
  "Major Vieira","Maracajá","Maravilha","Marema","Massaranduba","Matos Costa","Meleiro",
  "Mirim Doce","Modelo","Mondaí","Monte Carlo","Monte Castelo","Morro da Fumaça","Morro Grande",
  "Navegantes","Nova Erechim","Nova Itaberaba","Nova Trento","Nova Veneza","Novo Horizonte",
  "Orleans","Otacílio Costa","Ouro","Ouro Verde","Paial","Painel","Palhoça","Palma Sola",
  "Palmeira","Palmitos","Papanduva","Paraíso","Passo de Torres","Passos Maia","Paulo Lopes",
  "Pedras Grandes","Penha","Peritiba","Pescaria Brava","Petrolândia","Pinhalzinho","Pinheiro Preto",
  "Piratuba","Planalto Alegre","Pomerode","Ponte Alta","Ponte Alta do Norte","Ponte Serrada",
  "Porto Belo","Porto União","Pouso Redondo","Praia Grande","Presidente Castelo Branco",
  "Presidente Getúlio","Presidente Nereu","Princesa","Quilombo","Rancho Queimado",
  "Rio das Antas","Rio do Campo","Rio do Oeste","Rio do Sul","Rio dos Cedros","Rio Fortuna",
  "Rio Negrinho","Rio Rufino","Riqueza","Rodeio","Romelândia","Salete","Saltinho",
  "Salto Veloso","Sangão","Santa Cecília","Santa Helena","Santa Rosa de Lima",
  "Santa Rosa do Sul","Santa Terezinha","Santa Terezinha do Progresso","Santiago do Sul",
  "Santo Amaro da Imperatriz","São Bento do Sul","São Bernardino","São Carlos","São Cristóvão do Sul",
  "São Domingos","São Francisco do Sul","São João Batista","São João do Itaperiú","São João do Oeste",
  "São João do Sul","São Joaquim","São José","São José do Cedro","São José do Cerrito",
  "São Lourenço do Oeste","São Ludgero","São Martinho","São Miguel da Boa Vista",
  "São Miguel do Oeste","São Pedro de Alcântara","Saudades","Schroeder","Seara","Serra Alta",
  "Siderópolis","Sombrio","Sul Brasil","Taió","Tangará","Tigrinhos","Tijucas","Timbé do Sul",
  "Timbó","Timbó Grande","Três Barras","Treviso","Treze de Maio","Treze Tílias","Trombudo Central",
  "Tubarão","Tunápolis","Turvo","União do Oeste","Urubici","Urupema","Urussanga","Vargeão",
  "Vargem","Vargem Bonita","Vidal Ramos","Videira","Vitor Meireles","Witmarsum","Xanxerê",
  "Xavantina","Xaxim","Zortéa"
];

function toggleMunicipioInput() {
  const wrap = document.getElementById('municipio-input-wrap');
  const btn = document.getElementById('btn-mun');
  const mapBtn = document.getElementById('btn-map');
  const isOpen = wrap.style.display !== 'none';
  wrap.style.display = isOpen ? 'none' : 'block';
  btn.style.background = isOpen ? 'var(--sun-light)' : 'var(--sun)';
  btn.style.color = isOpen ? '#92400e' : '#fff';
  if (!isOpen) {
    mapBtn && (mapBtn.style.background = 'var(--violet-light)');
    mapBtn && (mapBtn.style.color = 'var(--violet)');
    document.getElementById('municipio-search').value = '';
    filterMunicipios('');
    document.getElementById('municipio-search').focus();
  } else {
    document.getElementById('municipio-dropdown').style.display = 'none';
  }
}

function filterMunicipios(val) {
  const dropdown = document.getElementById('municipio-dropdown');
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const filtered = val.length < 1
    ? SC_MUNICIPIOS
    : SC_MUNICIPIOS.filter(m => norm(m).includes(norm(val)));
  if (!filtered.length) { dropdown.style.display = 'none'; return; }
  dropdown.style.display = 'block';
  dropdown.style.maxHeight = '260px';
  dropdown.style.overflowY = 'auto';
  dropdown.innerHTML = filtered.map(m =>
    `<div onclick="selectMunicipio('${m.replace(/'/g,"\\'")}')"
      style="padding:10px 14px;cursor:pointer;font-size:14px;border-bottom:1px solid var(--border);"
      onmouseover="this.style.background='var(--surface-alt)'"
      onmouseout="this.style.background=''">${m}, SC</div>`
  ).join('');
}

function selectMunicipio(nome) {
  currentLocation = { label: nome + ', SC' };
  const display = document.getElementById('location-display');
  display.textContent = '🏘️ ' + nome + ', SC';
  display.classList.add('has-location');
  document.getElementById('municipio-dropdown').style.display = 'none';
  document.getElementById('municipio-search').value = nome;
  showToast('📍 Município selecionado: ' + nome);
}

/* ════════════════════════════════════════
   RANKING
════════════════════════════════════════ */
let _rankTab = 'total';

function switchRankTab(tab) {
  _rankTab = tab;
  const btnTotal = document.getElementById('rank-tab-total');
  const btnInd = document.getElementById('rank-tab-indicadoras');
  const legend = document.getElementById('rank-legend-indicadoras');
  if (tab === 'total') {
    btnTotal.className = 'btn-found'; btnTotal.style.cssText = 'min-width:auto;padding:0 18px;';
    btnInd.className = 'btn-location'; btnInd.style.cssText = 'min-width:auto;padding:0 18px;background:var(--sun-light);border-color:var(--sun);color:#92400e;';
    legend.style.display = 'none';
  } else {
    btnInd.className = 'btn-found'; btnInd.style.cssText = 'min-width:auto;padding:0 18px;background:var(--sun);border-color:var(--sun);color:#fff;';
    btnTotal.className = 'btn-location'; btnTotal.style.cssText = 'min-width:auto;padding:0 18px;';
    legend.style.display = 'block';
  }
  loadRanking();
}

async function loadRanking() {
  const grid = document.getElementById('ranking-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⏳ Carregando ranking…</div>';
  try {
    if (_rankTab === 'total') {
      // Busca species_seen sem join (evita FK errada)
      const { data, error } = await db
        .from('species_seen')
        .select('user_id');
      if (error) throw error;

      // Agrupa por usuário
      const byUser = {};
      (data || []).forEach(row => {
        byUser[row.user_id] = (byUser[row.user_id] || 0) + 1;
      });
      const sorted = Object.entries(byUser).sort((a,b) => b[1] - a[1]).slice(0, 50);
      if (!sorted.length) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Nenhum dado ainda. Registre avistamentos!</div>';
        return;
      }

      // Busca perfis em batch
      const uids = sorted.map(([uid]) => uid);
      const { data: profiles } = await db.from('profiles').select('id, nome, handle, avatar_url').in('id', uids);
      const profMap = {};
      (profiles || []).forEach(p => { profMap[p.id] = p; });

      grid.innerHTML = sorted.map(([uid, count], i) => {
        const profile = profMap[uid] || {};
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        const name = escHtml(profile.nome || 'Usuário');
        const handle = profile.handle ? '@' + escHtml(profile.handle) : '';
        const initials = (profile.nome || 'U').charAt(0).toUpperCase();
        const avatarHtml = profile.avatar_url
          ? `<img src="${escHtml(profile.avatar_url)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.parentElement.textContent='${initials}'">`
          : `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--sky),var(--forest));display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:700;">${initials}</div>`;
        const safeHandle = profile.handle || '';
        return `<div style="display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 16px;cursor:pointer;" onclick="openPublicProfile('${escHtml(safeHandle)}')">
          <span style="font-size:22px;min-width:32px;">${medal}</span>
          ${avatarHtml}
          <div style="flex:1;">
            <div style="font-weight:700;font-size:15px;">${name}</div>
            <div style="font-size:12px;color:var(--text-muted);">${handle}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800;font-size:20px;color:var(--sky);">${count}</div>
            <div style="font-size:11px;color:var(--text-muted);">espécies</div>
          </div>
        </div>`;
      }).join('');

    } else {
      // Ranking de indicadoras
      const { data, error } = await db
        .from('species_seen')
        .select('user_id, species_sci');
      if (error) throw error;

      const byUser = {};
      (data || []).forEach(row => {
        const pts = INDICADORAS[row.species_sci] || 0;
        if (!byUser[row.user_id]) byUser[row.user_id] = { pts: 0, count: 0 };
        byUser[row.user_id].pts += pts;
        if (pts > 0) byUser[row.user_id].count++;
      });
      const sorted = Object.entries(byUser)
        .filter(([, v]) => v.pts > 0)
        .sort((a,b) => b[1].pts - a[1].pts)
        .slice(0, 50);

      if (!sorted.length) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Nenhum ponto de indicadoras registrado ainda.</div>';
        return;
      }

      const uids = sorted.map(([uid]) => uid);
      const { data: profiles } = await db.from('profiles').select('id, nome, handle, avatar_url').in('id', uids);
      const profMap = {};
      (profiles || []).forEach(p => { profMap[p.id] = p; });

      grid.innerHTML = sorted.map(([uid, { pts, count }], i) => {
        const profile = profMap[uid] || {};
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        const name = escHtml(profile.nome || 'Usuário');
        const handle = profile.handle ? '@' + escHtml(profile.handle) : '';
        const initials = (profile.nome || 'U').charAt(0).toUpperCase();
        const avatarHtml = profile.avatar_url
          ? `<img src="${escHtml(profile.avatar_url)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.parentElement.textContent='${initials}'">`
          : `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--sun),#f97316);display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:700;">${initials}</div>`;
        const safeHandle = profile.handle || '';
        return `<div style="display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--sun);border-radius:var(--radius-md);padding:14px 16px;cursor:pointer;" onclick="openPublicProfile('${escHtml(safeHandle)}')">
          <span style="font-size:22px;min-width:32px;">${medal}</span>
          ${avatarHtml}
          <div style="flex:1;">
            <div style="font-weight:700;font-size:15px;">${name}</div>
            <div style="font-size:12px;color:var(--text-muted);">${handle} · ${count} indicadora${count !== 1 ? 's' : ''}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800;font-size:20px;color:var(--sun);">${pts}</div>
            <div style="font-size:11px;color:var(--text-muted);">pontos</div>
          </div>
        </div>`;
      }).join('');
    }
  } catch(e) {
    console.error('Ranking error:', e);
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">⚠️ Erro ao carregar ranking. Tente novamente.</div>';
  }
}

/* ════════════════════════════════════════
   MODAL DE ESTATÍSTICAS DO PERFIL
════════════════════════════════════════ */
async function openStatModal(type) {
  const modal = document.getElementById('stat-modal');
  const title = document.getElementById('stat-modal-title');
  const body  = document.getElementById('stat-modal-body');
  if (!modal) return;

  modal.classList.add('open');
  body.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);">Carregando…</div>';

  if (type === 'followers') {
    title.textContent = '👥 Seguidores';
    try {
      const { data } = await db.from('follows')
        .select('follower_id, profiles:profiles!follows_follower_id_fkey(nome,handle,avatar_url)')
        .eq('following_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (!data || !data.length) { body.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:24px;">Nenhum seguidor ainda.</p>'; return; }
      body.innerHTML = data.map(f => {
        const p = f.profiles; const nm = p?.nome||p?.handle||'Usuário'; const h = p?.handle||'';
        const av = p?.avatar_url ? `<img src="${p.avatar_url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">` : `<div style="width:40px;height:40px;border-radius:50%;background:var(--sky);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:16px;">${(nm[0]||'?').toUpperCase()}</div>`;
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="document.getElementById('stat-modal').classList.remove('open');openPublicProfile('${h}')">${av}<div><div style="font-weight:600;font-size:14px;">${escHtml(nm)}</div><div style="font-size:12px;color:var(--sky);">@${escHtml(h)}</div></div></div>`;
      }).join('');
    } catch(e) { body.innerHTML = '<p style="color:var(--coral);text-align:center;padding:16px;">Erro ao carregar.</p>'; }
    return;
  }

  if (type === 'following') {
    title.textContent = '🔭 Seguindo';
    try {
      const { data } = await db.from('follows')
        .select('following_id, profiles:profiles!follows_following_id_fkey(nome,handle,avatar_url)')
        .eq('follower_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (!data || !data.length) { body.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:24px;">Você não segue ninguém ainda.</p>'; return; }
      body.innerHTML = data.map(f => {
        const p = f.profiles; const nm = p?.nome||p?.handle||'Usuário'; const h = p?.handle||'';
        const av = p?.avatar_url ? `<img src="${p.avatar_url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">` : `<div style="width:40px;height:40px;border-radius:50%;background:var(--sky);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:16px;">${(nm[0]||'?').toUpperCase()}</div>`;
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="document.getElementById('stat-modal').classList.remove('open');openPublicProfile('${h}')">${av}<div><div style="font-weight:600;font-size:14px;">${escHtml(nm)}</div><div style="font-size:12px;color:var(--sky);">@${escHtml(h)}</div></div></div>`;
      }).join('');
    } catch(e) { body.innerHTML = '<p style="color:var(--coral);text-align:center;padding:16px;">Erro ao carregar.</p>'; }
    return;
  }

  if (type === 'species') {
    title.textContent = '🐦 Espécies Encontradas';
    const birds = SC_BIRDS.filter(b => foundSpecies.has(b.sci));
    body.innerHTML = birds.length
      ? birds.map(b => { const pts = INDICADORAS[b.sci]; return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);"><span style="font-size:22px;">${getSpeciesEmoji(b.sci)}</span><div style="flex:1;"><div style="font-weight:600;font-size:14px;">${capitalize(b.pop)}</div><div style="font-size:12px;color:var(--text-muted);font-style:italic;">${b.sci}</div></div>${pts?`<span style="background:var(--sun-light);color:#92400e;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:700;">⭐ ${pts}pts</span>`:''}</div>`; }).join('')
      : '<p style="color:var(--text-muted);text-align:center;padding:30px;">Nenhuma espécie encontrada ainda.</p>';
  } else if (type === 'obs') {
    title.textContent = '📋 Avistamentos';
    try {
      const { data } = await db.from('observations').select('id, species_pop, species_sci, obs_date, location_label').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      body.innerHTML = (data && data.length) ? data.map(o => `<div style="padding:10px 0;border-bottom:1px solid var(--border);"><div style="font-weight:600;font-size:14px;">${escHtml(capitalize(o.species_pop||''))}</div><div style="font-size:12px;color:var(--text-muted);font-style:italic;">${escHtml(o.species_sci||'')}</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${escHtml(o.obs_date||'')} ${o.location_label?'· '+escHtml(o.location_label):''}</div></div>`).join('') : '<p style="color:var(--text-muted);text-align:center;padding:30px;">Nenhum avistamento registrado.</p>';
    } catch(e) { body.innerHTML = '<p style="color:var(--coral);text-align:center;padding:16px;">Erro ao carregar.</p>'; }
  } else if (type === 'photos') {
    title.textContent = '📷 Fotos';
    try {
      const { data } = await db.from('observations').select('id, photo_url, species_pop').eq('user_id', currentUser.id).not('photo_url', 'is', null).order('created_at', { ascending: false }).limit(30);
      body.innerHTML = (data && data.length) ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">${data.map(o=>`<div style="border-radius:8px;overflow:hidden;aspect-ratio:1;position:relative;"><img src="${escHtml(o.photo_url)}" style="width:100%;height:100%;object-fit:cover;"><div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.7));padding:4px 6px;"><div style="color:#fff;font-size:10px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(capitalize(o.species_pop||''))}</div></div></div>`).join('')}</div>` : '<p style="color:var(--text-muted);text-align:center;padding:30px;">Nenhuma foto registrada.</p>';
    } catch(e) { body.innerHTML = '<p style="color:var(--coral);text-align:center;padding:16px;">Erro ao carregar.</p>'; }
  } else if (type === 'days') {
    title.textContent = '📅 Dias em Campo';
    try {
      const { data } = await db.from('observations').select('obs_date').eq('user_id', currentUser.id).not('obs_date', 'is', null).order('obs_date', { ascending: false });
      const days = [...new Set((data||[]).map(d=>d.obs_date))];
      body.innerHTML = days.length ? days.map(d => { const cnt = (data||[]).filter(o=>o.obs_date===d).length; return `<div style="padding:10px 0;border-bottom:1px solid var(--border);"><div style="font-weight:700;color:var(--sky);">${formatDate(d)}</div><div style="font-size:13px;color:var(--text-muted);">${cnt} avistamento${cnt!==1?'s':''}</div></div>`; }).join('') : '<p style="color:var(--text-muted);text-align:center;padding:30px;">Nenhum dia em campo registrado.</p>';
    } catch(e) { body.innerHTML = '<p style="color:var(--coral);text-align:center;padding:16px;">Erro ao carregar.</p>'; }
  }
}

async function confirmHandle() {
  const handle = (document.getElementById('handle-input')?.value || '').trim().toLowerCase().replace(/\s+/g, '_');
  if (!handle) return;
  const btn = document.getElementById('handle-confirm-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Criando perfil…'; }

  try {
    const user = _pendingGoogleUser;
    if (!user) { showToast('⚠️ Sessão expirada. Tente novamente.'); return; }

    const { error } = await db.from('profiles').insert({
      id:    user.id,
      nome:  user.name,
      handle,
      avatar_url: user.avatar || null
    });

    if (error) {
      if (error.code === '23505') { showToast('⚠️ Esse @usuário já está em uso. Escolha outro.'); }
      else { showToast('⚠️ Erro ao criar perfil: ' + error.message); }
      if (btn) { btn.disabled = false; btn.textContent = '✅ Confirmar'; }
      return;
    }

    currentUser = {
      id:     user.id,
      email:  user.email,
      name:   user.name,
      handle,
      avatar_url: user.avatar || null
    };
    _pendingGoogleUser = null;
    document.getElementById('handle-modal').classList.remove('open');
    updateSidebarAuth();
    renderProfile();
    loadUserChecklist();
    loadNotifBadge();
    showToast('🎉 Bem-vindo(a) ao Ave à Vista, @' + handle + '!');
    launchConfetti();

    if (window._pendingNav) {
      const { pageId, btn: navBtn } = window._pendingNav;
      window._pendingNav = null;
      setTimeout(() => navigateTo(pageId, navBtn), 300);
    }
  } catch(e) {
    showToast('⚠️ Erro inesperado: ' + (e.message||e));
    if (btn) { btn.disabled = false; btn.textContent = '✅ Confirmar'; }
  }
}

(function loadMapLibre() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
  document.head.appendChild(link);
  const s = document.createElement('script');
  s.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
  document.head.appendChild(s);
})();

/* ════════════════════════════════════════
   MAPA POR ESPÉCIE
════════════════════════════════════════ */
let _speciesMap = null;

function openSpeciesMap(sci, pop) {
  document.getElementById('species-map-title').textContent = `🗺️ ${pop}`;
  document.getElementById('species-map-modal').classList.add('open');
  // Buscar avistamentos do usuário logado para esta espécie
  if (currentUser) {
    db.from('observations')
      .select('location_label, lat, lng, obs_date')
      .eq('user_id', currentUser.id)
      .eq('species_sci', sci)
      .not('location_label', 'is', null)
      .then(({ data: pts }) => {
        document.getElementById('species-map-legend').textContent =
          `${pts.length} avistamento${pts.length!==1?'s':''} registrado${pts.length!==1?'s':''}`;

        setTimeout(() => {
          if (!window.maplibregl) return;
          if (_speciesMap) { _speciesMap.remove(); _speciesMap = null; }
          _speciesMap = new maplibregl.Map({
            container: 'species-maplibre',
            style: { version:8, sources:{ osm:{ type:'raster', tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize:256 } }, layers:[{ id:'osm', type:'raster', source:'osm' }] },
            center: [-49.5, -27.5], zoom: 7, attributionControl: false
          });
          _speciesMap.on('load', () => {
            pts.forEach(o => {
              if (!o.lat || !o.lng) return;
              new maplibregl.Marker({ color: '#0ea5e9' })
                .setLngLat([o.lng, o.lat])
                .setPopup(new maplibregl.Popup().setHTML(`<b>${pop}</b><br>${formatDate(o.obs_date)}`))
                .addTo(_speciesMap);
            });
            if (pts.length && pts[0].lat && pts[0].lng) {
              _speciesMap.flyTo({ center: [pts[0].lng, pts[0].lat], zoom: 10 });
            }
          });
        }, 200);
      });
  } else {
    document.getElementById('species-map-legend').textContent = 'Faça login para ver seus avistamentos.';
  }
}

/* ════════════════════════════════════════
   RANK DE OBSERVADOR (baseado em avistamentos)
════════════════════════════════════════ */
const OBS_RANKS = [
  { min:0,   label:'Olhar Iniciante',       cls:'rank-0', icon:'👁️'  },
  { min:100, label:'Observador Curioso',    cls:'rank-1', icon:'🔭'  },
  { min:200, label:'Vigia do Ninho',        cls:'rank-2', icon:'🪺'  },
  { min:300, label:'Leitor de Penas',       cls:'rank-3', icon:'🪶'  },
  { min:400, label:'Rastreador de Aves',    cls:'rank-4', icon:'🗺️'  },
  { min:500, label:'Observador Experiente', cls:'rank-5', icon:'🎯'  },
  { min:600, label:'Intérprete dos Cantos', cls:'rank-6', icon:'🎵'  },
  { min:700, label:'Guardião das Rotas',    cls:'rank-7', icon:'🛡️'  },
  { min:800, label:'Mestre Observador',     cls:'rank-8', icon:'🏅'  },
  { min:900, label:'Lenda dos Céus',        cls:'rank-9', icon:'🌟'  },
];

function getObsRank(count) {
  for (let i = OBS_RANKS.length - 1; i >= 0; i--)
    if (count >= OBS_RANKS[i].min) return OBS_RANKS[i];
  return OBS_RANKS[0];
}

/* ════════════════════════════════════════
   SISTEMA DE AMIZADE (5 níveis)
════════════════════════════════════════ */
const FRIEND_LEVELS = [
  { lvl:0, min:0,   max:25,  label:'Desconhecidos',    cls:'f-lvl-0' },
  { lvl:1, min:25,  max:70,  label:'Conhecidos',       cls:'f-lvl-1' },
  { lvl:2, min:70,  max:150, label:'Companheiros',     cls:'f-lvl-2' },
  { lvl:3, min:150, max:300, label:'Amigos',           cls:'f-lvl-3' },
  { lvl:4, min:300, max:500, label:'Grandes Amigos',   cls:'f-lvl-4' },
  { lvl:5, min:500, max:500, label:'Parceiros do Céu', cls:'f-lvl-5' },
];

function getFriendLevel(sharedObs) {
  for (let i = FRIEND_LEVELS.length - 1; i >= 0; i--)
    if (sharedObs >= FRIEND_LEVELS[i].min) return FRIEND_LEVELS[i];
  return FRIEND_LEVELS[0];
}

async function renderAmizades() {
  const grid = document.getElementById('amizades-grid');
  if (!grid) return;
  if (_renderGuards['amizades']) return;
  _renderGuards['amizades'] = true;

  let friends = [];
  if (currentUser?.id) {
    try {
      // 1. Amizades formais
      const { data: fships } = await db.from('friendships')
        .select('shared_obs, status, requester_id, addressee_id, req:profiles!friendships_requester_id_fkey(nome,handle,avatar_url), addr:profiles!friendships_addressee_id_fkey(nome,handle,avatar_url)')
        .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`)
        .eq('status','accepted');

      const friendHandles = new Set();
      if (fships) {
        friends = fships.map(f => {
          const mine = f.requester_id === currentUser.id;
          const other = mine ? f.addr : f.req;
          if (other?.handle) friendHandles.add(other.handle);
          return { handle: other?.handle||'?', name: other?.nome||'Usuário', avatar: other?.avatar_url||null, sharedObs: f.shared_obs||0, source:'friendship' };
        });
      }

      // 2. Companheiros de avistamentos ainda não em friendships
      const { data: asAuthor } = await db.from('observations')
        .select('companion_handle').eq('user_id', currentUser.id).not('companion_handle','is',null);
      const { data: asCompanion } = await db.from('observations')
        .select('profiles:profiles!observations_user_id_fkey(nome,handle,avatar_url)')
        .eq('companion_handle', currentUser.handle);

      const companionHandlesSet = new Set();
      for (const o of (asAuthor?.data || asAuthor || [])) {
        const h = o?.companion_handle;
        if (h && !friendHandles.has(h) && !companionHandlesSet.has(h)) {
          companionHandlesSet.add(h);
        }
      }
      for (const o of (asCompanion?.data || asCompanion || [])) {
        const h = o?.profiles?.handle;
        if (h && !friendHandles.has(h) && !companionHandlesSet.has(h) && h !== currentUser.handle) {
          companionHandlesSet.add(h);
        }
      }
      if (companionHandlesSet.size > 0) {
        const { data: compProfiles } = await db.from('profiles')
          .select('nome,handle,avatar_url').in('handle', [...companionHandlesSet]);
        (compProfiles || []).forEach(p => {
          friends.push({ handle: p.handle, name: p.nome||p.handle, avatar: p.avatar_url||null, sharedObs: 0, source:'companion' });
        });
      }
    } catch(e) { console.warn(e); _renderGuards['amizades'] = false; return; }
  }

  friends.sort((a,b) => b.sharedObs - a.sharedObs);

  if (!friends.length) {
    const fl0 = FRIEND_LEVELS[0], fl1 = FRIEND_LEVELS[1];
    grid.innerHTML = `
      <div style="padding:24px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-md);">
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:36px;margin-bottom:8px;">🐦</div>
          <div style="font-weight:700;font-size:15px;">Nenhuma amizade ainda</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:4px;line-height:1.5;">
            Adicione companheiros ao registrar avistamentos para construir amizades e subir de nível!
          </div>
        </div>
        <div style="background:var(--bg);border-radius:var(--radius-md);padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="obs-rank-badge ${fl0.cls}">${fl0.label}</span>
            <span style="font-size:11px;color:var(--text-muted);">0 / ${fl1.min} obs para <strong>${fl1.label}</strong></span>
          </div>
          <div class="friendship-bar"><div class="friendship-fill ${fl0.cls}" style="width:0%;"></div></div>
        </div>
      </div>`;
    _renderGuards['amizades'] = false;
    return;
  }

  grid.innerHTML = friends.map(f => {
    const fl = getFriendLevel(f.sharedObs);
    const nextLvl = FRIEND_LEVELS[Math.min(fl.lvl + 1, 5)];
    const pct = fl.lvl >= 5 ? 100 : Math.min(100, ((f.sharedObs - fl.min) / (nextLvl.min - fl.min)) * 100);
    const safeName   = escHtml(f.name);
    const safeHandle = escHtml(f.handle);
    const initial    = (f.name||'?')[0].toUpperCase();
    const nextLabel  = fl.lvl < 5 ? escHtml(FRIEND_LEVELS[fl.lvl + 1]?.label || '') : '';
    const avatarInner = f.avatar
      ? `<img src="${escHtml(f.avatar)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.textContent='${initial}'">`
      : initial;
    const isCompanion = f.source === 'companion';
    return `<div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-md);cursor:pointer;" onclick="openPublicProfile('${safeHandle}')">
      <div style="width:48px;height:48px;border-radius:50%;background:#0ea5e9;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:20px;flex-shrink:0;overflow:hidden;">${avatarInner}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
          <div style="font-weight:700;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${safeName}</div>
          <span class="obs-rank-badge ${fl.cls}" style="font-size:10px;flex-shrink:0;">${escHtml(fl.label)}</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:1px;">
          @${safeHandle} · ${f.sharedObs} avistamento${f.sharedObs !== 1 ? 's' : ''} juntos
          ${isCompanion && f.sharedObs === 0 ? ' · <span style="color:var(--forest);">📸 Companheiro</span>' : ''}
        </div>
        <div style="margin-top:6px;">
          <div class="friendship-bar"><div class="friendship-fill ${fl.cls}" style="width:${pct}%;transition:width .6s ease;"></div></div>
          <div style="display:flex;justify-content:space-between;margin-top:3px;">
            <span style="font-size:10px;color:var(--text-muted);">${fl.lvl < 5 ? `${f.sharedObs} / ${nextLvl.min} obs para ${nextLabel}` : '🌟 Nível máximo'}</span>
            <span style="font-size:10px;color:var(--text-muted);">${fl.lvl < 5 ? Math.round(pct) + '%' : ''}</span>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
  _renderGuards['amizades'] = false;
}

/* ════════════════════════════════════════
   LIKE / COMENTÁRIO / FOTO EXPANDIDA
════════════════════════════════════════ */
window._likes    = {};
window._comments = {};
let _currentCommentObs = null;
let _expandLiked = false;

async function toggleLike(obsId, btn) {
  if (!currentUser) { openAuthModal(); return; }
  if (btn._toggling) return;
  btn._toggling = true;
  btn.disabled = true;
  const liked = btn.classList.contains('liked');
  try {
    if (liked) {
      await db.from('likes').delete().eq('obs_id', obsId).eq('user_id', currentUser.id);
    } else {
      await db.from('likes').insert({ obs_id: obsId, user_id: currentUser.id });
    }
    // Atualizar contagem
    const { count } = await db.from('likes').select('id', { count: 'exact', head: true }).eq('obs_id', obsId);
    const likeCountSpan = document.getElementById('like-count-' + obsId);
    if (likeCountSpan) likeCountSpan.textContent = count ?? 0;
    btn.classList.toggle('liked', !liked);
    const icon = document.getElementById('like-icon-' + obsId);
    if (icon) icon.textContent = liked ? '🤍' : '❤️';
  } catch(e) { console.warn('toggleLike error:', e); }
  finally { btn._toggling = false; btn.disabled = false; }
}

function openCommentModal(obsId, speciesName) {
  _currentCommentObs = obsId;
  document.getElementById('comment-modal').classList.add('open');
  renderCommentList(obsId);
  document.getElementById('comment-input').value = '';
  document.getElementById('comment-input').focus();
}

async function renderCommentList(obsId) {
  const list = document.getElementById('comment-list');
  try {
    const { data } = await db.from('comments')
      .select('id, content, created_at, user_id, profiles:profiles!comments_user_id_fkey(nome,handle)')
      .eq('obs_id', obsId)
      .order('created_at', { ascending: true });
    if (!data || !data.length) {
      list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:16px;font-size:13px;">Nenhum comentário ainda.</p>';
      return;
    }
    list.innerHTML = data.map(c => `
      <div style="display:flex;gap:8px;align-items:flex-start;">
        <div style="width:30px;height:30px;border-radius:50%;background:var(--sky);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;flex-shrink:0;" onclick="openPublicProfile('${escHtml(c.profiles?.handle||'')}')">
          ${escHtml((c.profiles?.nome||'?')[0])}
        </div>
        <div style="flex:1;background:var(--bg);border-radius:var(--radius-md);padding:8px 12px;">
          <div style="font-weight:600;font-size:12px;color:var(--sky);cursor:pointer;" onclick="openPublicProfile('${escHtml(c.profiles?.handle||'')}')">
            ${escHtml(c.profiles?.nome||'Usuário')}
          </div>
          <div style="font-size:13px;color:var(--text);word-break:break-word;">${escHtml(c.content)}</div>
        </div>
      </div>`).join('');
  } catch(e) {
    list.innerHTML = '<p style="color:var(--coral);text-align:center;padding:16px;">Erro ao carregar comentários.</p>';
  }
}

async function submitComment() {
  const input = document.getElementById('comment-input');
  const text  = input.value.trim().slice(0, 300); // limite de 300 chars
  if (!text || !_currentCommentObs || !currentUser) return;
  try {
    await db.from('comments').insert({ obs_id: _currentCommentObs, user_id: currentUser.id, content: text });
    input.value = '';
    renderCommentList(_currentCommentObs);
    // Atualiza contagem no card do feed
    const { count } = await db.from('comments').select('id', { count: 'exact', head: true }).eq('obs_id', _currentCommentObs);
    const countSpan = document.getElementById('comment-count-' + _currentCommentObs);
    if (countSpan) countSpan.textContent = count ?? 0;
    // Se o photo-expand estiver aberto para o mesmo obs, recarrega comentários lá também
    if (window._expandObsId === _currentCommentObs) loadExpandComments(_currentCommentObs);
  } catch(e) { showToast('❌ Erro ao comentar'); }
}

function openPhotoExpandAndComment(obs) {
  openPhotoExpand(obs);
  setTimeout(() => openExpandComment(), 350);
}

async function openPhotoExpand(obs) {
  if (!obs.photoUrl) return;
  window._expandObsId = obs.id;
  window._expandObs   = obs;

  const imgEl = document.getElementById('photo-expand-img');
  imgEl.src = obs.photoUrl;
  imgEl.style.cursor = 'zoom-in';
  // Zoom com scroll do mouse na foto expandida
  imgEl.onclick = () => showFullPhotoZoom(obs.photoUrl);

  document.getElementById('photo-expand-species').textContent = capitalize(obs.species || obs.sciName || '');
  // nome científico clicável
  const sciEl = document.getElementById('photo-expand-sci');
  sciEl.textContent = obs.sciName || '';
  sciEl.style.cursor = obs.sciName ? 'pointer' : '';
  sciEl.onclick = obs.sciName ? () => {
    document.getElementById('photo-expand-modal').classList.remove('open');
    setTimeout(() => openSpeciesModal(obs.sciName, obs.species || obs.sciName), 200);
  } : null;
  // nome popular clicável
  const speciesEl = document.getElementById('photo-expand-species');
  speciesEl.style.cursor = obs.sciName ? 'pointer' : '';
  speciesEl.onclick = obs.sciName ? () => {
    document.getElementById('photo-expand-modal').classList.remove('open');
    setTimeout(() => openSpeciesModal(obs.sciName, obs.species || obs.sciName), 200);
  } : null;

  const credit = buildCreditHtml(obs);
  document.getElementById('photo-expand-meta').innerHTML =
    `${credit ? credit+'<br>' : ''}📅 ${formatDate(obs.date)||'—'}${obs.location?' &nbsp;📍 '+escHtml(obs.location):''}${obs.notes?'<br>📝 '+escHtml(obs.notes):''}`;

  // Carrega estado real do like do banco
  _expandLiked = false;
  const likeBtn = document.getElementById('photo-expand-like');
  likeBtn.innerHTML = '🤍 Curtir';
  likeBtn.classList.remove('liked');
  likeBtn._toggling = false;
  if (currentUser && obs.id) {
    db.from('likes').select('id').eq('obs_id', obs.id).eq('user_id', currentUser.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          _expandLiked = true;
          likeBtn.innerHTML = '❤️ Curtido';
          likeBtn.classList.add('liked');
        }
      }).catch(() => {});
  }

  document.getElementById('photo-expand-comment-box').style.display = 'none';
  document.getElementById('photo-expand-modal').classList.add('open');
  loadExpandComments(obs.id);
}

async function toggleExpandLike() {
  if (!currentUser) { showToast('🔑 Faça login para curtir'); openAuthModal(); return; }
  const obsId = window._expandObsId;
  if (!obsId) return;
  const btn = document.getElementById('photo-expand-like');
  if (btn._toggling) return;
  btn._toggling = true;
  try {
    if (_expandLiked) {
      await db.from('likes').delete().eq('obs_id', obsId).eq('user_id', currentUser.id);
      _expandLiked = false;
    } else {
      await db.from('likes').insert({ obs_id: obsId, user_id: currentUser.id });
      _expandLiked = true;
    }
    btn.innerHTML = _expandLiked ? '❤️ Curtido' : '🤍 Curtir';
    btn.classList.toggle('liked', _expandLiked);
    // Atualiza contagem no card do feed se estiver visível
    const { count } = await db.from('likes').select('id', { count: 'exact', head: true }).eq('obs_id', obsId);
    const likeCountSpan = document.getElementById('like-count-' + obsId);
    const likeIcon = document.getElementById('like-icon-' + obsId);
    if (likeCountSpan) likeCountSpan.textContent = count ?? 0;
    if (likeIcon) likeIcon.textContent = _expandLiked ? '❤️' : '🤍';
  } catch(e) { showToast('❌ Erro ao curtir'); }
  finally { btn._toggling = false; }
}

function openExpandComment() {
  const box = document.getElementById('photo-expand-comment-box');
  box.style.display = box.style.display === 'none' ? 'flex' : 'none';
  if (box.style.display === 'flex') document.getElementById('photo-expand-comment-input').focus();
}

/* ════════════════════════════════════════
   MENSAGENS (sistema básico)
════════════════════════════════════════ */
let _activeContact = null;
let _activeContactId = null;

async function openMessages() {
  if (!currentUser) { openAuthModal(); return; }
  document.getElementById('messages-modal').classList.add('open');
  renderContacts();
  await loadMsgBadge(); // em vez de esconder manualmente
}

async function renderContacts() {
  const list = document.getElementById('msg-contacts');
  list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">Carregando…</div>';
  if (!currentUser?.id) return;
  try {
    const { data } = await db.from('messages')
      .select('from_id, to_id, created_at, from_profile:profiles!messages_from_id_fkey(nome,handle,avatar_url), to_profile:profiles!messages_to_id_fkey(nome,handle,avatar_url)')
      .or(`from_id.eq.${currentUser.id},to_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false })
      .limit(60);
    if (!data || !data.length) {
      list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">Nenhuma conversa ainda.<br>Visite o perfil de alguém para enviar mensagem.</div>';
      return;
    }
    const seen = new Set();
    const contacts = [];
    for (const m of data) {
      const mine = m.from_id === currentUser.id;
      const otherId = mine ? m.to_id : m.from_id;
      const otherP  = mine ? m.to_profile : m.from_profile;
      if (!seen.has(otherId) && otherP) {
        seen.add(otherId);
        contacts.push({ id: otherId, name: otherP.nome || otherP.handle, handle: otherP.handle, avatar_url: otherP.avatar_url });
      }
    }
    list.innerHTML = contacts.map(ct => {
      const initial = (ct.name||'?')[0].toUpperCase();
      const safeName   = escHtml(ct.name   || '?');
      const safeHandle = escHtml(ct.handle || '');
      const safeId     = escHtml(ct.id     || '');
      const av = ct.avatar_url
        ? `<img src="${escHtml(ct.avatar_url)}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;">`
        : `<div style="width:34px;height:34px;border-radius:50%;background:var(--sky);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;">${initial}</div>`;
      return `<div onclick="selectContact('${safeHandle}','${safeId}')"
        style="display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;transition:background .15s;border-radius:var(--radius-sm);"
        onmouseover="this.style.background='var(--sky-light)'" onmouseout="this.style.background=''">
        ${av}
        <div style="overflow:hidden;">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeName}</div>
          <div style="font-size:11px;color:var(--text-muted);">@${safeHandle}</div>
        </div>
      </div>`;
    }).join('');
  } catch(e) { list.innerHTML = '<div style="padding:16px;color:var(--coral);font-size:13px;">Erro ao carregar.</div>'; }
}

function selectContact(handle, userId) {
  _activeContact = handle;
  _activeContactId = userId;
  const hdr = document.getElementById('msg-thread-header');
  if (hdr) { hdr.textContent = '@' + handle; hdr.style.display = 'block'; }
  loadThread(userId);
  // Fechar busca nova mensagem se aberta
  const ns = document.getElementById('msg-new-search-box');
  if (ns) ns.style.display = 'none';
}

async function loadThread(toId) {
  const thread = document.getElementById('msg-thread');
  thread.innerHTML = '<p style="color:var(--text-muted);text-align:center;font-size:13px;margin:auto;">Carregando…</p>';
  if (!currentUser?.id || !toId) return;
  try {
    const { data } = await db.from('messages')
      .select('*')
      .or(`and(from_id.eq.${currentUser.id},to_id.eq.${toId}),and(from_id.eq.${toId},to_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });
    if (!data || !data.length) {
      thread.innerHTML = '<p style="color:var(--text-muted);text-align:center;font-size:13px;margin:auto;">Nenhuma mensagem ainda.</p>';
      return;
    }
    thread.innerHTML = data.map(m => {
      const mine = m.from_id === currentUser.id;
      return `<div style="display:flex;flex-direction:column;align-items:${mine?'flex-end':'flex-start'};margin-bottom:4px;">
        <div style="background:${mine?'var(--sky)':'var(--bg)'};color:${mine?'white':'var(--text)'};border-radius:${mine?'12px 4px 12px 12px':'4px 12px 12px 12px'};padding:8px 12px;max-width:75%;font-size:13px;word-break:break-word;">${escHtml(m.content)}</div>
      </div>`;
    }).join('');
    thread.scrollTop = thread.scrollHeight;
    await db.from('messages').update({ read: true }).eq('to_id', currentUser.id).eq('from_id', toId);
    await loadMsgBadge();
  } catch(e) { thread.innerHTML = '<p style="color:var(--coral);font-size:13px;padding:16px;">Erro ao carregar.</p>'; }
}

async function sendMessage() {
  if (!_activeContactId) { showToast('⚠️ Selecione um contato'); return; }
  if (!currentUser?.id)  { showToast('🔑 Faça login'); return; }
  const input = document.getElementById('msg-input');
  const text  = input.value.trim().slice(0, 500); // limite de 500 chars
  if (!text) return;
  input.value = '';
  try {
    await db.from('messages').insert({ from_id: currentUser.id, to_id: _activeContactId, content: text });
    loadThread(_activeContactId);
  } catch(e) { showToast('⚠️ Erro ao enviar mensagem'); }
}

/* ════════════════════════════════════════
   NOTIFICAÇÕES
════════════════════════════════════════ */
async function openNotifications() {
  if (!currentUser) { openAuthModal(); return; }
  document.getElementById('notif-modal').classList.add('open');
  document.getElementById('notif-badge').style.display = 'none';
  const list = document.getElementById('notif-list');
  list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">Carregando…</div>';
  try {
    const { data } = await db.from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(nome,handle)')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (!data || !data.length) {
      list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">Nenhuma notificação ainda.</div>';
      return;
    }
    const icons = { follow:'👤', like:'❤️', comment:'💬', friend_request:'🤝', friend_accepted:'🎉', system:'🔔' };
    list.innerHTML = data.map(n => {
      const icon = icons[n.type] || '🔔';
      const actor = escHtml(n.actor?.nome || 'Alguém');
      const texts = {
        follow: `${actor} começou a te seguir`,
        like: `${actor} curtiu seu avistamento`,
        comment: `${actor} comentou no seu avistamento`,
        friend_request: `${actor} te enviou uma solicitação de amizade`,
        friend_accepted: `${actor} aceitou sua amizade`,
      };
      const text = texts[n.type] || escHtml(n.data?.message || 'Nova notificação');
      const time = n.created_at ? new Date(n.created_at).toLocaleDateString('pt-BR') : '';
      const unread = n.read ? '' : 'border-left:3px solid var(--sky);';
      return '<div style="display:flex;gap:10px;align-items:flex-start;padding:10px;background:var(--bg);border-radius:var(--radius-md);margin-bottom:6px;' + unread + '">'
        + '<span style="font-size:20px;flex-shrink:0;">' + icon + '</span>'
        + '<div style="flex:1;">'
        + '<div style="font-size:13px;color:var(--text);line-height:1.5;">' + text + '</div>'
        + '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + time + '</div>'
        + '</div></div>';
    }).join('');
    await db.from('notifications').update({ read: true }).eq('user_id', currentUser.id).eq('read', false);
  } catch(e) {
    list.innerHTML = '<div style="padding:16px;color:var(--coral);font-size:13px;">Erro ao carregar notificações.</div>';
  }
}

/* ════════════════════════════════════════
   EDITAR PERFIL MODAL
════════════════════════════════════════ */
function openEditProfileModal() {
  const ta = document.getElementById('profile-bio-input');
  if (ta) {
    ta.value = currentUser?.bio || '';
    updateBioCount(ta.value);
  }
  const hasCover = !!currentUser?.cover_url;
  const adjBtn   = document.getElementById('btn-cover-adjust-modal');
  if (adjBtn) adjBtn.style.display = hasCover ? 'block' : 'none';
  const av = document.getElementById('edit-avatar-preview');
  if (av && currentUser?.avatar_url) {
    av.innerHTML = `<img src="${currentUser.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else if (av && currentUser) {
    av.textContent = (currentUser.name||'?')[0].toUpperCase();
  }
  document.getElementById('edit-profile-modal').classList.add('open');
}

function previewAvatarEdit(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const av = document.getElementById('edit-avatar-preview');
    if (av) av.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  };
  reader.readAsDataURL(file);
}

async function saveProfileFromModal() {
  const val = (document.getElementById('profile-bio-input')?.value || '').trim().slice(0, 300);
  const bioEl = document.getElementById('profile-bio');
  if (bioEl) bioEl.textContent = val || '';
  if (currentUser) {
    await db.from('profiles').update({ bio: val }).eq('id', currentUser.id);
    currentUser.bio = val;
  }
  document.getElementById('edit-profile-modal').classList.remove('open');
  showToast('✅ Perfil atualizado!');
}

/* ════════════════════════════════════════
   NO-SPECIES TOGGLE + COMPANION SEARCH
════════════════════════════════════════ */
function toggleNoSpecies(checked) {
  const speciesInput = document.getElementById('species-input');
  const speciesGroup = speciesInput?.closest('.form-group');
  const lbl = speciesGroup?.querySelector('.form-label');
  if (speciesInput) {
    speciesInput.disabled = checked;
    speciesInput.value = checked ? '' : speciesInput.value;
    speciesInput.placeholder = checked ? '(sem espécie especificada)' : 'Ex: Turdus rufiventris';
    speciesInput.style.borderColor = checked ? 'var(--coral)' : '';
    speciesInput.style.background   = checked ? 'rgba(239,68,68,0.07)' : '';
    speciesInput.style.color        = checked ? 'var(--coral)' : '';
  }
  if (lbl) { lbl.style.color = checked ? 'var(--coral)' : ''; }
}

/* ════════════════════════════════════════
   COMPANION MODAL — Adicionar companheiro
════════════════════════════════════════ */
async function openCompanionModal() {
  if (!currentUser) { showToast('🔑 Faça login para adicionar companheiro'); openAuthModal(); return; }
  if (_selectedCompanions.length >= 1) { showToast('⚠️ Apenas 1 companheiro por registro. Remova o atual para trocar.'); return; }
  document.getElementById('companion-modal').classList.add('open');
  document.getElementById('companion-modal-search').value = '';
  await loadCompanionList('');
}

async function loadCompanionList(q) {
  const list = document.getElementById('companion-modal-list');
  list.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:13px;">Carregando…</div>';
  try {
    // Busca primeiro quem o usuário segue, depois todos se não tiver seguidores
    let query = db.from('profiles').select('id, nome, handle, avatar_url').neq('id', currentUser.id);
    if (q) query = query.or(`nome.ilike.%${q}%,handle.ilike.%${q.replace(/^@/,'')}%`);
    const { data } = await query.order('nome').limit(30);
    if (!data || !data.length) {
      list.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:13px;">Nenhum usuário encontrado.</div>';
      return;
    }
    list.innerHTML = data.map(u => {
      const nm = u.nome || u.handle || '?';
      const already = _selectedCompanions.find(c => c.handle === u.handle);
      const av = u.avatar_url
        ? `<img src="${u.avatar_url}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`
        : `<div style="width:36px;height:36px;border-radius:50%;background:var(--sky);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;">${(nm[0]||'?').toUpperCase()}</div>`;
      return `<div onclick="${already ? '' : `pickCompanion('${u.handle.replace(/'/g,"\\'")}','${nm.replace(/'/g,"\\'")}','${u.id}')`}"
        style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:${already?'default':'pointer'};border-radius:var(--radius-md);opacity:${already?'.45':'1'};transition:background .15s;"
        onmouseover="this.style.background='${already?'':'var(--sky-light)'}'" onmouseout="this.style.background=''">
        ${av}
        <div style="flex:1;">
          <div style="font-weight:600;font-size:13px;">${escHtml(nm)}</div>
          <div style="font-size:11px;color:var(--text-muted);">@${escHtml(u.handle)}</div>
        </div>
        ${already ? '<span style="font-size:11px;color:var(--text-muted);">já adicionado</span>' : '<span style="color:var(--sky);font-size:18px;">+</span>'}
      </div>`;
    }).join('');
  } catch(e) { list.innerHTML = '<div style="color:var(--coral);text-align:center;padding:16px;font-size:13px;">Erro ao carregar usuários.</div>'; }
}

async function filterCompanionModal(val) {
  await loadCompanionList(val.trim());
}

function pickCompanion(handle, name, id) {
  _selectedCompanions = [{ handle, name, color: '#0ea5e9', id }];
  document.getElementById('companion-modal').classList.remove('open');
  renderSelectedCompanions();
  showToast(`✅ @${handle} adicionado como companheiro`);
}

let _selectedCompanions = [];

function addCompanion(handle, name, color) {
  if (_selectedCompanions.find(c => c.handle === handle)) return;
  _selectedCompanions = [{ handle, name, color }]; // máx 1
  document.getElementById('companion-modal').classList.remove('open');
  renderSelectedCompanions();
}

function removeCompanion(handle) {
  _selectedCompanions = _selectedCompanions.filter(c => c.handle !== handle);
  renderSelectedCompanions();
}

function renderSelectedCompanions() {
  const el = document.getElementById('companion-selected');
  if (!el) return;
  el.innerHTML = _selectedCompanions.map(c => `
    <div style="display:flex;align-items:center;gap:5px;background:var(--sky);color:white;border-radius:20px;padding:3px 10px 3px 6px;font-size:12px;font-weight:600;">
      <div style="width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;">${c.name[0]}</div>
      @${c.handle}
      <span onclick="removeCompanion('${c.handle}')" style="cursor:pointer;margin-left:2px;opacity:.7;">✕</span>
    </div>`).join('');
}

/* ════════════════════════════════════════
   NOVA MENSAGEM — busca de usuário
════════════════════════════════════════ */
function openNewMessageSearch() {
  const box = document.getElementById('msg-new-search-box');
  if (!box) return;
  const isOpen = box.style.display !== 'none';
  box.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    document.getElementById('msg-new-search-input').value = '';
    document.getElementById('msg-new-search-results').innerHTML = '';
    document.getElementById('msg-new-search-input').focus();
  }
}

async function searchNewMsgContact(val) {
  const res = document.getElementById('msg-new-search-results');
  const q = val.trim().replace(/^@/, '');
  if (!q) { res.innerHTML = ''; return; }
  try {
    const { data } = await db.from('profiles').select('id, nome, handle, avatar_url')
      .or(`nome.ilike.%${q}%,handle.ilike.%${q}%`).neq('id', currentUser.id).limit(8);
    if (!data || !data.length) { res.innerHTML = '<div style="padding:8px 12px;font-size:13px;color:var(--text-muted);">Nenhum usuário encontrado</div>'; return; }
    res.innerHTML = data.map(u => {
      const nm         = u.nome || u.handle || '?';
      const safeHandle = escHtml(u.handle || '');
      const safeId     = escHtml(u.id     || '');
      const av = u.avatar_url
        ? `<img src="${escHtml(u.avatar_url)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`
        : `<div style="width:28px;height:28px;border-radius:50%;background:var(--sky);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:11px;flex-shrink:0;">${(nm[0]||'?').toUpperCase()}</div>`;
      return `<div onclick="selectContact('${safeHandle}','${safeId}');document.getElementById('msg-new-search-input').value=''"
        style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;border-radius:var(--radius-sm);"
        onmouseover="this.style.background='var(--sky-light)'" onmouseout="this.style.background=''">
        ${av}
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:600;">${escHtml(nm)}</div>
          <div style="font-size:11px;color:var(--text-muted);">@${safeHandle}</div>
        </div>
      </div>`;
    }).join('');
  } catch(e) { res.innerHTML = ''; }
}

/* ════════════════════════════════════════
   OPEN OBS COMMENT — opens photo if exists
════════════════════════════════════════ */
function openObsComment(obsId, obs) {
  if (obs && obs.photoUrl) {
    openPhotoExpand(obs);
    setTimeout(() => openExpandComment(), 300);
  } else {
    openCommentModal(obsId, obs?.species || '');
  }
}

/* ════════════════════════════════════════
   SPECIES SUGGESTION SYSTEM (persiste no banco)
════════════════════════════════════════ */
window._suggestions = {};

async function submitExpandSuggestion() {
  const input = document.getElementById('expand-suggest-input');
  const val   = input?.value.trim();
  if (!val) return;
  const obsId = window._expandObsId;
  if (!obsId) return;
  await submitSuggestion(obsId, val);
  if (input) input.value = '';
}

async function submitSpeciesSuggestion() {
  const input = document.getElementById('suggest-species-input');
  const val   = input?.value.trim();
  if (!val) { showToast('⚠️ Digite o nome da espécie antes de sugerir'); return; }
  const obsId = _currentCommentObs || window._expandObsId || 'standalone_' + Date.now();
  await submitSuggestion(obsId, val);
  if (input) input.value = '';
}

async function submitSuggestion(obsId, val) {
  if (!currentUser) { showToast('🔑 Faça login para sugerir'); openAuthModal(); return; }
  const cleanVal = val.trim().slice(0, 200);
  if (!cleanVal) return;
  const match = SC_BIRDS.find(b => b.pop.toLowerCase()===cleanVal.toLowerCase() || b.sci.toLowerCase()===cleanVal.toLowerCase());
  const suggestedPop = match ? capitalize(match.pop) : cleanVal;
  const suggestedSci = match ? match.sci : null;
  await db.from('species_suggestions').insert({
    obs_id: obsId,
    user_id: currentUser.id,
    suggested_species_pop: suggestedPop,
    suggested_species_sci: suggestedSci,
    accepted: false
  });
  renderSuggestions(obsId, (obsId === window._expandObsId) ? 'expand-suggestions-list' : 'suggestions-list');
  showToast('✅ Sugestão enviada!');
}

async function renderSuggestions(obsId, listId) {
  const el = document.getElementById(listId);
  if (!el) return;
  try {
    // Busca sugestões e dono do avistamento em paralelo
    const [sugR, obsR] = await Promise.all([
      db.from('species_suggestions')
        .select('*, profiles:profiles!observations_user_id_fkey(nome,handle)')
        .eq('obs_id', obsId)
        .order('created_at', { ascending: false }),
      db.from('observations').select('user_id').eq('id', obsId).maybeSingle()
    ]);
    const data = sugR.data;
    const obsOwnerId = obsR.data?.user_id || null;
    const isOwner = currentUser && obsOwnerId && currentUser.id === obsOwnerId;

    if (!data || !data.length) { el.innerHTML = ''; return; }
    el.innerHTML = data.map(s => {
      const suggesterName   = escHtml(s.profiles?.nome   || 'Usuário');
      const suggesterHandle = escHtml(s.profiles?.handle || '');
      const isMySuggestion  = currentUser && currentUser.id === s.user_id;
      let actions = '';
      if (s.accepted) {
        actions = '<span style="font-size:11px;font-weight:700;color:var(--forest);">✅ Aceita</span>';
      } else {
        if (isOwner) {
          actions += `<button onclick="acceptSuggestion('${s.obs_id}','${s.id}','${listId}')" style="background:var(--forest);border:none;border-radius:6px;color:white;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;">✓ Aceitar</button>`;
        }
        if (isMySuggestion) {
          actions += `<button onclick="deleteSuggestion('${s.id}','${s.obs_id}','${listId}')" style="background:var(--coral);border:none;border-radius:6px;color:white;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;margin-left:4px;">✕ Remover</button>`;
        }
      }
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--bg);border-radius:var(--radius-md);border:1px solid var(--border);">
        <div>
          <div style="font-size:13px;font-weight:600;">${escHtml(s.suggested_species_pop || '')}</div>
          <div style="font-size:11px;color:var(--text-muted);">Sugerido por <span style="cursor:pointer;color:var(--sky);" onclick="openPublicProfile('${suggesterHandle}')">${suggesterName}</span>${s.suggested_species_sci ? ' · '+escHtml(s.suggested_species_sci) : ''}</div>
        </div>
        ${actions ? `<div style="display:flex;gap:4px;flex-shrink:0;">${actions}</div>` : ''}
      </div>`;
    }).join('');
  } catch(e) { el.innerHTML = ''; }
}

async function deleteSuggestion(sugId, obsId, listId) {
  if (!currentUser) { showToast('🔑 Faça login para remover sugestões'); return; }
  if (!confirm('Remover sua sugestão?')) return;
  // .eq('user_id') garante que só o autor da sugestão pode remover
  await db.from('species_suggestions').delete().eq('id', sugId).eq('user_id', currentUser.id);
  renderSuggestions(obsId, listId);
}

async function acceptSuggestion(obsId, sugId, listId) {
  if (!currentUser) { showToast('🔑 Faça login para aceitar sugestões'); openAuthModal(); return; }
  try {
    // Verifica se o usuário logado é o dono da observação
    const { data: obs } = await db.from('observations').select('user_id').eq('id', obsId).maybeSingle();
    if (!obs) { showToast('⚠️ Avistamento não encontrado'); return; }
    if (obs.user_id !== currentUser.id) {
      showToast('⛔ Apenas o autor do avistamento pode aceitar sugestões');
      return;
    }
    const { data: sug } = await db.from('species_suggestions').select('*').eq('id', sugId).maybeSingle();
    if (!sug) { showToast('⚠️ Sugestão não encontrada'); return; }
    await db.from('observations').update({
      species_sci: sug.suggested_species_sci,
      species_pop: sug.suggested_species_pop
    }).eq('id', obsId).eq('user_id', currentUser.id); // dupla verificação no banco
    await db.from('species_suggestions').update({ accepted: true }).eq('id', sugId);
    renderSuggestions(obsId, listId);
    showToast('✅ Espécie atualizada!');
  } catch(e) { showToast('❌ Erro ao aceitar sugestão: ' + e.message); }
}

/* ════════════════════════════════════════
   DYNAMIC BADGES + RANK AVATAR BORDER
════════════════════════════════════════ */
async function renderDynamicBadges() {
  const row = document.getElementById('badges-row');
  if (!row) return;

  const speciesCount = foundSpecies.size;
  const obsCount = (await db.from('observations').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id)).count || 0;
  const photoCount = (await db.from('observations').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id).not('photo_url', 'is', null)).count || 0;
  const obsRank = getObsRank(obsCount);
  const rankIdx = OBS_RANKS.findIndex(r => r.min === obsRank.min);

  const badges = [];
  if (speciesCount >= 1)   badges.push({ cls:'badge-sky',    icon:'🐦', text:`${speciesCount} espécie${speciesCount>1?'s':''}` });
  if (speciesCount >= 50)  badges.push({ cls:'badge-gold',   icon:'🏆', text:`${speciesCount} espécies` });
  if (speciesCount >= 200) badges.push({ cls:'badge-violet', icon:'🌟', text:'200+ espécies' });
  if (speciesCount >= 500) badges.push({ cls:'',             icon:'🦅', text:'500+ espécies', style:'background:linear-gradient(135deg,#fef9c3,#fde68a);border-color:#f59e0b;color:#92400e;' });
  if (obsCount >= 100)  badges.push({ cls:'badge-green', icon:'🌿', text:'100 registros' });
  if (obsCount >= 500)  badges.push({ cls:'badge-sky',   icon:'📋', text:'500 registros' });
  if (obsCount >= 1000) badges.push({ cls:'badge-gold',  icon:'💎', text:'1000 registros' });
  if (photoCount >= 10)  badges.push({ cls:'badge-sky',    icon:'📷', text:`${photoCount} fotos` });
  if (photoCount >= 100) badges.push({ cls:'badge-violet', icon:'📸', text:'100+ fotos' });

  const rankColors = [
    'background:#f1f5f9;border-color:#94a3b8;color:#64748b',
    'background:#eef2ff;border-color:#6366f1;color:#4338ca',
    'background:#e0f2fe;border-color:#0ea5e9;color:#0369a1',
    'background:#d1fae5;border-color:#10b981;color:#065f46',
    'background:#fef3c7;border-color:#f59e0b;color:#92400e',
    'background:#ffedd5;border-color:#f97316;color:#c2410c',
    'background:#fce7f3;border-color:#ec4899;color:#9d174d',
    'background:#ede9fe;border-color:#8b5cf6;color:#5b21b6',
    'background:#fee2e2;border-color:#dc2626;color:#991b1b',
    'background:linear-gradient(135deg,#fef9c3,#fde68a);border-color:#d97706;color:#92400e',
  ];
  badges.push({ cls:'', icon: obsRank.icon, text: obsRank.label, style: rankColors[rankIdx] || rankColors[0] });

  row.innerHTML = badges.map(b =>
    `<div class="badge ${b.cls}" style="${b.style||''}">${b.icon} ${b.text}</div>`
  ).join('');

  const avatar = document.getElementById('profile-avatar');
  if (avatar) {
    OBS_RANKS.forEach((_, i) => avatar.classList.remove('avatar-rank-' + i));
    avatar.classList.add('avatar-rank-' + rankIdx);
  }
}

/* ════════════════════════════════════════
   FOLLOWERS / FOLLOWING (Supabase)
════════════════════════════════════════ */
async function loadFollowCounts() {
  if (!currentUser) return;
  try {
    const [{ count: followers }, { count: following }] = await Promise.all([
      db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', currentUser.id),
      db.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id',  currentUser.id),
    ]);
    const fEl = document.getElementById('stat-followers');
    const gEl = document.getElementById('stat-following');
    if (fEl) fEl.textContent = followers || 0;
    if (gEl) gEl.textContent = following || 0;
  } catch(e) { console.warn('follow counts:', e); }
}

/* ════════════════════════════════════════
   BIRD OF DAY — FINDERS (fotos de quem já encontrou)
════════════════════════════════════════ */
async function loadBirdDayFinders(sci) {
  const wrap = document.getElementById('bird-day-finders');
  const list = document.getElementById('bird-day-finders-list');
  if (!wrap || !list) return;
  wrap.style.display = 'none';
  try {
    const { data } = await db.from('observations')
      .select('photo_url, profiles:profiles!observations_user_id_fkey(id, nome, handle, avatar_url)')
      .eq('species_sci', sci)
      .not('photo_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30);
    if (!data || !data.length) return;

    const seen = new Set();
    const unique = [];
    for (const o of data) {
      const h = o.profiles?.handle;
      if (h && !seen.has(h)) {
        seen.add(h);
        unique.push({ handle: h, name: o.profiles?.nome || h, avatar_url: o.profiles?.avatar_url, photo: o.photo_url });
      }
    }
    if (!unique.length) return;

    wrap.style.display = 'block';
    list.innerHTML = unique.slice(0, 12).map(u => {
      const initial    = (u.name || u.handle || '?')[0].toUpperCase();
      const safeHandle = escHtml(u.handle || '');
      const safeAvatar = u.avatar_url ? escHtml(u.avatar_url) : '';
      const avatarStyle = safeAvatar
        ? `background:url('${safeAvatar}') center/cover`
        : `background:var(--sky)`;
      return `<div onclick="openPublicProfile('${safeHandle}')" title="@${safeHandle}"
        style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:transform .15s;"
        onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform=''">
        <div style="width:42px;height:42px;border-radius:50%;${avatarStyle};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:16px;border:2px solid var(--forest);overflow:hidden;">
          ${safeAvatar ? '' : initial}
        </div>
        <div style="font-size:9.5px;color:var(--text-mid);font-weight:600;max-width:46px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">@${safeHandle}</div>
      </div>`;
    }).join('');
  } catch(e) { console.warn('loadBirdDayFinders:', e); }
}

/* ════════════════════════════════════════
   CARD COUNTS — curtidas e comentários (batched)
════════════════════════════════════════ */
async function loadCardCounts(obsList) {
  if (!obsList || !obsList.length) return;
  const ids = obsList.map(o => o.id).filter(Boolean);
  if (!ids.length) return;
  try {
    const [likesR, commentsR] = await Promise.all([
      db.from('likes').select('obs_id, user_id').in('obs_id', ids),
      db.from('comments').select('obs_id').in('obs_id', ids)
    ]);
    const likesData    = likesR.data  || [];
    const commentsData = commentsR.data || [];
    for (const id of ids) {
      const lc   = likesData.filter(l => l.obs_id === id).length;
      const cc   = commentsData.filter(c => c.obs_id === id).length;
      const lcEl = document.getElementById('like-count-' + id);
      const ccEl = document.getElementById('comment-count-' + id);
      // sempre mostra contagem, mesmo 0
      if (lcEl) lcEl.textContent = lc;
      if (ccEl) ccEl.textContent = cc;
      const btn  = document.getElementById('like-btn-' + id);
      const icon = document.getElementById('like-icon-' + id);
      if (currentUser) {
        const myLike = likesData.find(l => l.obs_id === id && l.user_id === currentUser.id);
        if (myLike) {
          if (btn)  btn.classList.add('liked');
          if (icon) icon.textContent = '❤️';
        } else {
          if (btn)  btn.classList.remove('liked');
          if (icon) icon.textContent = '🤍';
        }
      }
    }
  } catch(e) { /* silencioso */ }
}

/* ════════════════════════════════════════
   COMENTÁRIOS NO MODAL DE FOTO EXPANDIDA
════════════════════════════════════════ */
async function loadExpandComments(obsId) {
  const el = document.getElementById('photo-expand-comments');
  if (!el) return;
  try {
    const { data } = await db.from('comments')
      .select('id, content, created_at, user_id, profiles:profiles!comments_user_id_fkey(nome,handle)')
      .eq('obs_id', obsId)
      .order('created_at', { ascending: true });
    if (!data || !data.length) { el.innerHTML = ''; return; }
    el.innerHTML = data.map(cm => {
      const name   = cm.profiles?.nome || cm.profiles?.handle || 'Usuário';
      const handle = cm.profiles?.handle || '';
      const isOwn  = currentUser && cm.user_id === currentUser.id;
      return `<div style="display:flex;gap:8px;align-items:flex-start;">
        <div style="width:28px;height:28px;border-radius:50%;background:var(--sky);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;flex-shrink:0;cursor:pointer;" onclick="openPublicProfile('${handle}')">${(name||'?')[0].toUpperCase()}</div>
        <div style="flex:1;background:var(--bg);border-radius:var(--radius-md);padding:7px 10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;font-size:11px;color:var(--sky);cursor:pointer;" onclick="openPublicProfile('${handle}')">@${handle||name}</span>
            ${isOwn ? `<button onclick="deleteExpandComment('${cm.id}','${obsId}')" style="background:none;border:none;color:var(--text-muted);font-size:10px;cursor:pointer;">🗑️</button>` : ''}
          </div>
          <div style="font-size:12px;color:var(--text);margin-top:2px;word-break:break-word;">${escHtml(cm.content)}</div>
        </div>
      </div>`;
    }).join('');
  } catch(e) { el.innerHTML = ''; }
}

async function deleteExpandComment(commentId, obsId) {
  if (!currentUser) { showToast('🔑 Faça login'); return; }
  if (!confirm('Excluir comentário?')) return;
  // .eq('user_id') garante que só o autor pode excluir
  await db.from('comments').delete().eq('id', commentId).eq('user_id', currentUser.id);
  loadExpandComments(obsId);
}

async function submitExpandComment() {
  const input = document.getElementById('photo-expand-comment-input');
  const text  = input?.value?.trim().slice(0, 300);
  if (!text) return;
  if (!currentUser) { showToast('🔑 Faça login para comentar'); openAuthModal(); return; }
  const obsId = window._expandObsId;
  if (!obsId) return;
  input.value = '';
  try {
    await db.from('comments').insert({ obs_id: obsId, user_id: currentUser.id, content: text });
    loadExpandComments(obsId);
    const { count } = await db.from('comments').select('id',{count:'exact',head:true}).eq('obs_id', obsId);
    const ccEl = document.getElementById('comment-count-' + obsId);
    if (ccEl) ccEl.textContent = count ?? 0;
  } catch(e) { showToast('❌ Erro ao comentar'); }
}

/* ════════════════════════════════════════
   GLOSSÁRIO — BUSCA DE AVES
════════════════════════════════════════ */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({length:m+1}, (_,i)=>[i]);
  for (let j=0;j<=n;j++) d[0][j]=j;
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++)
    d[i][j] = a[i-1]===b[j-1] ? d[i-1][j-1] : 1+Math.min(d[i-1][j-1],d[i-1][j],d[i][j-1]);
  return d[m][n];
}
function birdScore(q, bird) {
  const n = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const qn=n(q), pop=n(bird.pop), sci=n(bird.sci);
  if (pop.startsWith(qn)||sci.startsWith(qn)) return 100;
  if (pop.includes(qn)||sci.includes(qn)) return 80;
  for (const w of (pop+' '+sci).split(/\s+/))
    if (qn.length>=3 && levenshtein(qn,w.slice(0,qn.length))<=Math.floor(qn.length/4)) return 50;
  return 0;
}

let _birdTimer = null;
let _birdPhotoCache = {};
let _photoIndexPromise = null; // garante que o índice seja carregado apenas uma vez

function ensurePhotoIndex() {
  if (_photoIndexPromise) return _photoIndexPromise;
  _photoIndexPromise = fetch('https://raw.githubusercontent.com/brennobenk/OrnitologiaSantaCatarina/main/photo_index.json', { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(raw => {
      window._photoIndex = {};
      // Suporte tanto ao formato {fotógrafo: {fotos:[...]}} quanto [{cientifico,url,author}]
      if (Array.isArray(raw)) {
        raw.forEach(item => {
          const key = (item.cientifico || item.sci || '').toLowerCase().trim();
          if (!key) return;
          if (!window._photoIndex[key]) window._photoIndex[key] = [];
          window._photoIndex[key].push({ url: item.url, author: item.author || item.fotografo || 'Ave à Vista', profileUrl: item.wikiaves || null });
        });
      } else {
        for (const [photographer, info] of Object.entries(raw)) {
          for (const foto of (info.fotos || [])) {
            const key = (foto.cientifico || foto.sci || '').toLowerCase().trim();
            if (!key) continue;
            if (!window._photoIndex[key]) window._photoIndex[key] = [];
            window._photoIndex[key].push({ url: foto.url, author: photographer, profileUrl: info.wikiaves || null });
          }
        }
      }
      console.log('[photo_index] carregado:', Object.keys(window._photoIndex).length, 'espécies com foto');
      return window._photoIndex;
    })
    .catch(e => {
      console.warn('[photo_index] falha ao carregar:', e.message);
      _photoIndexPromise = null;
      return {};
    });
  return _photoIndexPromise;
}

async function getBirdPhoto(sci) {
  if (_birdPhotoCache[sci] !== undefined) return _birdPhotoCache[sci];
  _birdPhotoCache[sci] = null; // marca em progresso
  try {
    const idx = await ensurePhotoIndex();
    const entries = idx[(sci || '').toLowerCase().trim()];
    if (entries && entries.length) {
      const e = entries[Math.floor(Math.random() * entries.length)];
      _birdPhotoCache[sci] = { url: e.url, author: e.author, source: 'aveavista' };
      return _birdPhotoCache[sci];
    }
  } catch(e) {}
  // Fallback: iNaturalist direto (suporta CORS nativamente)
  try {
    const inatUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sci)}&rank=species&per_page=1`;
    const r = await fetch(inatUrl);
    const j = await r.json();
    const url = j.results?.[0]?.default_photo?.medium_url;
    if (url) {
      const attr = j.results[0].default_photo?.attribution || '';
      const m = attr.match(/\(c\)\s*([^,]+)/i);
      const author = m ? m[1].trim() : 'iNaturalist';
      _birdPhotoCache[sci] = { url, author, source: 'inat', inatId: j.results[0].id };
      return _birdPhotoCache[sci];
    }
  } catch(e) { console.warn('[getBirdPhoto inat]', sci, e?.message); }
  // Fallback 2: eBird / Wikimedia via nome científico
  try {
    const ebirdUrl = `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&species=${encodeURIComponent(sci)}`;
    // eBird não tem endpoint de foto público — usa Wikimedia como fallback real
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(sci.replace(/ /g,'_'))}`;
    const wr = await fetch(wikiUrl);
    if (wr.ok) {
      const wj = await wr.json();
      const url = wj?.thumbnail?.source || wj?.originalimage?.source;
      if (url) {
        _birdPhotoCache[sci] = { url, author: 'Wikipedia', source: 'wiki' };
        return _birdPhotoCache[sci];
      }
    }
  } catch(e) { console.warn('[wiki fallback]', sci, e?.message); }

  _birdPhotoCache[sci] = null;
  return null;
}

function searchBirds(val) {
  clearTimeout(_birdTimer);
  const q = val.trim();
  const sug = document.getElementById('birds-suggestions');
  if (!q) { if(sug) sug.style.display='none'; renderBirdsGrid(SC_BIRDS); return; }
  _birdTimer = setTimeout(() => {
    const results = SC_BIRDS
      .map(b=>({b,s:birdScore(q,b)})).filter(r=>r.s>0)
      .sort((a,b)=>b.s-a.s).slice(0,40).map(r=>r.b);
    if (sug) {
      sug.style.display = results.length ? 'block' : 'none';
      sug.innerHTML = results.slice(0,6).map(b =>
        `<div onclick="openSpeciesModal('${b.sci.replace(/'/g,"\\'")}','${b.pop.replace(/'/g,"\\'")}');document.getElementById('birds-suggestions').style.display='none'"
          style="padding:10px 16px;cursor:pointer;border-bottom:1px solid var(--border);"
          onmouseover="this.style.background='var(--sky-light)'" onmouseout="this.style.background=''">
          <div style="font-weight:600;font-size:13px;">${capitalize(b.pop)}</div>
          <div style="font-size:11px;color:var(--text-muted);font-style:italic;">${b.sci}</div>
        </div>`
      ).join('')+(results.length>6?`<div style="padding:8px 16px;font-size:12px;color:var(--text-muted);">+${results.length-6} resultados</div>`:'');
    }
    renderBirdsGrid(results);
  }, 180);
}

document.addEventListener('click', e => {
  const sug = document.getElementById('birds-suggestions');
  if (sug && !e.target.closest('#birds-search-input') && !e.target.closest('#birds-suggestions'))
    sug.style.display='none';
});

/* ════════════════════════════════════════
   GLOSSÁRIO — INFINITE SCROLL (50 por vez)
════════════════════════════════════════ */
let _birdsCurrentList = [];
let _birdsPage = 0;
const _BIRDS_PER_PAGE = 100;
let _birdsScrollObserver = null;

function renderBirdsGrid(birds) {
  _birdsCurrentList = birds || [];
  _birdsPage = 0;
  const grid = document.getElementById('birds-grid');
  if (!grid) return;

  // Remove sentinels/observers anteriores
  const old = document.getElementById('birds-scroll-sentinel');
  if (old) old.remove();
  const oldL = document.getElementById('birds-scroll-loader');
  if (oldL) oldL.remove();
  if (_birdsScrollObserver) { _birdsScrollObserver.disconnect(); _birdsScrollObserver = null; }

  if (!_birdsCurrentList.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Nenhuma ave encontrada.</div>';
    _renderBirdsPagination();
    return;
  }
  grid.innerHTML = '';
  _appendBirdsPage(grid);
  _renderBirdsPagination();
}

function _renderBirdsPagination() {
  const container = document.getElementById('birds-pagination');
  if (!container) return;
  const total = _birdsCurrentList.length;
  const totalPages = Math.ceil(total / _BIRDS_PER_PAGE);
  if (totalPages <= 1) { container.innerHTML = `<span style="color:var(--text-muted);font-size:12px;">${total} espécie${total!==1?'s':''} encontrada${total!==1?'s':''}</span>`; return; }

  const start = _birdsPage * _BIRDS_PER_PAGE + 1;
  const end   = Math.min(start + _BIRDS_PER_PAGE - 1, total);
  const prevDisabled = _birdsPage === 0;
  const nextDisabled = _birdsPage >= totalPages - 1;

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;">
      <button onclick="_birdsPrevPage()" ${prevDisabled?'disabled':''} style="height:34px;padding:0 16px;border-radius:20px;border:1.5px solid var(--border);background:${prevDisabled?'var(--bg)':'var(--card)'};color:${prevDisabled?'var(--text-muted)':'var(--text)'};cursor:${prevDisabled?'default':'pointer'};font-size:13px;font-weight:600;">‹ Anterior</button>
      <span style="font-size:13px;color:var(--text-muted);">${start}–${end} de ${total} espécies · Página ${_birdsPage+1} de ${totalPages}</span>
      <button onclick="_birdsNextPage()" ${nextDisabled?'disabled':''} style="height:34px;padding:0 16px;border-radius:20px;border:1.5px solid var(--border);background:${nextDisabled?'var(--bg)':'var(--sky)'};color:${nextDisabled?'var(--text-muted)':'white'};cursor:${nextDisabled?'default':'pointer'};font-size:13px;font-weight:600;">Próxima ›</button>
    </div>`;
}

function _birdsPrevPage() {
  if (_birdsPage <= 0) return;
  _birdsPage--;
  const grid = document.getElementById('birds-grid');
  if (!grid) return;
  grid.innerHTML = '';
  _appendBirdsPage(grid);
  _renderBirdsPagination();
  // Scroll to top of birds section
  document.getElementById('page-birds')?.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function _birdsNextPage() {
  const totalPages = Math.ceil(_birdsCurrentList.length / _BIRDS_PER_PAGE);
  if (_birdsPage >= totalPages - 1) return;
  _birdsPage++;
  const grid = document.getElementById('birds-grid');
  if (!grid) return;
  grid.innerHTML = '';
  _appendBirdsPage(grid);
  _renderBirdsPagination();
  document.getElementById('page-birds')?.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function _buildBirdCard(b) {
  const found  = foundSpecies.has(b.sci);
  const atRisk = b.sc && b.sc !== 'LC';
  const safeId = b.sci.replace(/[^a-zA-Z0-9]/g,'_');
  return `<div id="bcard_${safeId}" onclick="openSpeciesModal('${b.sci.replace(/'/g,"\'")}','${b.pop.replace(/'/g,"\'")}');"
    style="position:relative;border-radius:var(--radius-md);overflow:hidden;cursor:pointer;height:130px;background:var(--sky-light);transition:transform .15s,box-shadow .15s;"
    onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-md)'"
    onmouseout="this.style.transform='';this.style.boxShadow=''">
    <div id="bcard_bg_${safeId}" style="position:absolute;inset:0;background:linear-gradient(135deg,var(--sky),var(--forest));" data-sci="${escHtml(b.sci)}"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(transparent 30%,rgba(0,0,0,0.75));"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;padding:8px 10px;">
      <div style="font-weight:700;font-size:12px;color:white;line-height:1.2;text-shadow:0 1px 4px rgba(0,0,0,0.8);">${capitalize(b.pop)}</div>
      <div style="font-size:9.5px;color:rgba(255,255,255,0.75);font-style:italic;">${b.sci}</div>
      <div style="display:flex;gap:3px;margin-top:3px;">
        ${found  ? '<span style="font-size:9px;background:var(--forest);color:white;border-radius:10px;padding:1px 5px;font-weight:700;">✓</span>' : ''}
        ${atRisk ? '<span style="font-size:9px;background:rgba(239,68,68,0.8);color:white;border-radius:10px;padding:1px 5px;font-weight:700;">⚠</span>' : ''}
      </div>
    </div>
  </div>`;
}

function _appendBirdsPage(grid) {
  const start = _birdsPage * _BIRDS_PER_PAGE;
  const slice = _birdsCurrentList.slice(start, start + _BIRDS_PER_PAGE);
  if (!slice.length) return false;

  const frag = document.createDocumentFragment();
  slice.forEach(b => {
    const div = document.createElement('div');
    div.innerHTML = _buildBirdCard(b);
    frag.appendChild(div.firstElementChild);
  });
  grid.appendChild(frag);

  // Lazy-load fotos com IntersectionObserver
  const newBgs = grid.querySelectorAll('[id^="bcard_bg_"]:not([data-observed])');
  if ('IntersectionObserver' in window) {
    const photoObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el._loaded) return;
        el._loaded = true;
        getBirdPhoto(el.dataset.sci).then(photo => {
          if (!photo) return;
          el.style.cssText = `position:absolute;inset:0;background-image:url(${photo.url});background-size:cover;background-position:center;`;
        });
        photoObs.unobserve(el);
      });
    }, { rootMargin: '150px' });
    newBgs.forEach(el => { el.setAttribute('data-observed','1'); photoObs.observe(el); });
  }
  return slice.length === _BIRDS_PER_PAGE;
}

/* ════════════════════════════════════════
   MODAL DE ESPÉCIE
════════════════════════════════════════ */
async function openSpeciesModal(sci, pop) {
  let modal = document.getElementById('species-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'species-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'z-index:2500;background:rgba(0,0,0,0.88);backdrop-filter:blur(10px);';
    modal.onclick = e => { if (e.target===modal) modal.classList.remove('open'); };
    modal.innerHTML = `
      <div class="modal-card" style="max-width:660px;max-height:90vh;display:flex;flex-direction:column;padding:0;overflow:hidden;">
        <div id="sp-hero" style="position:relative;height:300px;background:var(--bg);flex-shrink:0;">
          <img id="sp-img" src="" style="width:100%;height:100%;object-fit:contain;display:none;cursor:zoom-in;" onclick="showFullPhotoZoom(this.src)">
          <div id="sp-ph" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;background:linear-gradient(135deg,var(--sky),var(--forest));">🐦</div>
          <div style="position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(0,0,0,0.6));pointer-events:none;"></div>
          <button onclick="document.getElementById('species-modal').classList.remove('open')" style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.5);border:none;border-radius:50%;width:32px;height:32px;color:white;font-size:16px;cursor:pointer;z-index:2;">✕</button>
          <div style="position:absolute;bottom:12px;left:16px;right:50px;">
            <div id="sp-pop" style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.6);"></div>
            <div id="sp-sci" style="font-size:13px;color:rgba(255,255,255,0.85);font-style:italic;"></div>
            <div id="sp-credit" style="font-size:10px;color:rgba(255,255,255,0.65);margin-top:2px;"></div>
          </div>
        </div>
        <div style="flex:1;overflow-y:auto;padding:18px;">
          <div id="sp-tags" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;"></div>
          <div style="font-weight:700;font-size:12px;color:var(--text-muted);margin-bottom:5px;">Sobre</div>
          <div id="sp-desc" style="font-size:13px;color:var(--text);line-height:1.7;margin-bottom:16px;background:var(--card);padding:12px;border-radius:var(--radius-md);">Carregando…</div>
          <div style="background:var(--sky-light);border:1px solid rgba(14,165,233,0.2);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:16px;">
            <div style="font-weight:700;font-size:12px;color:var(--sky-dark);margin-bottom:8px;">🦜 No Ave à Vista</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;">
              <div><div id="sp-total" style="font-size:18px;font-weight:800;color:var(--sky);">—</div><div style="font-size:10px;color:var(--text-muted);">registros</div></div>
              <div><div id="sp-users" style="font-size:18px;font-weight:800;color:var(--forest);">—</div><div style="font-size:10px;color:var(--text-muted);">observadores</div></div>
              <div><div id="sp-last" style="font-size:18px;font-weight:800;color:var(--sun);">—</div><div style="font-size:10px;color:var(--text-muted);">último reg.</div></div>
            </div>
          </div>
          <div style="font-weight:700;font-size:12px;color:var(--text-muted);margin-bottom:8px;">📸 Fotos da comunidade</div>
          <div id="sp-gallery" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:7px;"></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  modal.classList.add('open');
  document.getElementById('sp-pop').textContent = capitalize(pop);
  document.getElementById('sp-sci').textContent = sci;
  const localDesc = obterDescricaoAve(sci);
  if (localDesc) {
    document.getElementById('sp-desc').textContent = localDesc;
  } else {
    document.getElementById('sp-desc').textContent = 'Carregando…';
    fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(sci)}`)
      .then(r=>r.ok?r.json():null).then(j=>{
        const el = document.getElementById('sp-desc');
        if (el) el.textContent = j?.extract ? j.extract.slice(0,500)+(j.extract.length>500?'…':'') : 'Descrição não disponível.';
      }).catch(()=>{ const el=document.getElementById('sp-desc'); if(el) el.textContent='Descrição não disponível.'; });
  }
  document.getElementById('sp-total').textContent = '…';
  document.getElementById('sp-users').textContent = '…';
  document.getElementById('sp-last').textContent  = '…';
  document.getElementById('sp-gallery').innerHTML = '';
  document.getElementById('sp-credit').textContent = '';
  document.getElementById('sp-img').style.display = 'none';
  document.getElementById('sp-ph').style.display = 'flex';

  const bird = SC_BIRDS.find(b=>b.sci===sci);
  const tags = [];
  if (bird?.sc && bird.sc!=='LC')       tags.push(`<span style="background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;border-radius:20px;padding:2px 9px;font-size:11px;font-weight:700;">SC: ${bird.sc}</span>`);
  if (bird?.icmbio && bird.icmbio!=='LC') tags.push(`<span style="background:#ffedd5;color:#9a3412;border:1px solid #fdba74;border-radius:20px;padding:2px 9px;font-size:11px;font-weight:700;">ICMBio: ${bird.icmbio}</span>`);
  if (bird?.iucn && bird.iucn!=='LC')   tags.push(`<span style="background:#fef9c3;color:#854d0e;border:1px solid #fde047;border-radius:20px;padding:2px 9px;font-size:11px;font-weight:700;">IUCN: ${bird.iucn}</span>`);
  if (bird?.ordem)  tags.push(`<span style="background:var(--sky-light);color:var(--sky-dark);border:1px solid rgba(14,165,233,0.25);border-radius:20px;padding:2px 9px;font-size:11px;">🪶 ${bird.ordem}</span>`);
  if (bird?.familia) tags.push(`<span style="background:var(--violet-light);color:var(--violet);border:1px solid rgba(139,92,246,0.25);border-radius:20px;padding:2px 9px;font-size:11px;">🏷️ ${bird.familia}</span>`);
  document.getElementById('sp-tags').innerHTML = tags.join('');

  getBirdPhoto(sci).then(photo => {
    if (!photo) return;
    const img = document.getElementById('sp-img');
    const ph  = document.getElementById('sp-ph');
    const cr  = document.getElementById('sp-credit');
    img.src = photo.url;
    img.style.display = 'block';
    ph.style.display = 'none';
    img.onclick = () => showFullPhotoZoom(photo.url);
    if (photo.source === 'inat' && photo.inatId) {
      cr.innerHTML = `📸 <a href="https://www.inaturalist.org/taxa/${photo.inatId}" target="_blank" style="color:rgba(255,255,255,0.85);text-decoration:underline;">${photo.author} · iNaturalist ↗</a>`;
    } else if (photo.author) {
      cr.textContent = `📸 ${photo.author} · Ave à Vista`;
    }
  });

  try {
    const { data, count } = await db.from('observations')
      .select('id, obs_date, photo_url, profiles:profiles!observations_user_id_fkey(nome,handle)', { count:'exact' })
      .eq('species_sci', sci).order('created_at',{ascending:false}).limit(20);
    document.getElementById('sp-total').textContent = count ?? 0;
    const uniq = new Set((data||[]).map(o=>o.profiles?.handle).filter(Boolean));
    document.getElementById('sp-users').textContent = uniq.size;
    const last = data?.[0]?.obs_date;
    document.getElementById('sp-last').textContent = last ? formatDate(last) : '—';
    const gal = document.getElementById('sp-gallery');
    const photos = (data||[]).filter(o=>o.photo_url);
    if (!photos.length) { gal.innerHTML='<div style="color:var(--text-muted);font-size:12px;padding:8px 0;">Nenhuma foto ainda.</div>'; return; }
    gal.innerHTML = photos.map(o => {
      const h = o.profiles?.handle||'?';
      const obsObj = { id: o.id, species: capitalize(pop), sciName: sci, photoUrl: o.photo_url, date: o.obs_date, user: { name: o.profiles?.nome||h, handle: h }, companionHandle: o.companion_handle || null };
      return `<div style="border-radius:7px;overflow:hidden;aspect-ratio:1;cursor:pointer;position:relative;" onclick="openPhotoExpand(${JSON.stringify(obsObj).replace(/"/g,'&quot;')})">
        <img src="${o.photo_url}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<div style=background:var(--bg);height:100%;display:flex;align-items:center;justify-content:center>🐦</div>'">
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.6));padding:4px 5px;">
          <div style="font-size:9px;color:white;font-weight:600;cursor:pointer;" onclick="event.stopPropagation();openPublicProfile('${h}')">@${h}</div>
        </div>
      </div>`;
    }).join('');
  } catch(e) { console.warn('openSpeciesModal:', e); }
}

/* ════════════════════════════════════════
   PERFIL PÚBLICO (página completa)
════════════════════════════════════════ */
let _pubProfileHandle = null;
let _pubPrevPage = 'home';
let _pubSpeciesSeen = [];

async function openPublicProfile(handle) {
  if (!handle) return;
  if (currentUser && currentUser.handle === handle) {
    navigateTo('profile', document.querySelector('[data-page=profile]'));
    return;
  }

  const activePage = document.querySelector('.page.active');
  _pubPrevPage = activePage?.id?.replace('page-', '') || 'home';
  _pubProfileHandle = handle;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-public-profile')?.classList.add('active');
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));

  document.getElementById('pub-name').textContent = 'Carregando...';
  document.getElementById('pub-handle').textContent = '@' + handle;
  document.getElementById('pub-city').textContent = '';
  document.getElementById('pub-bio').textContent = '';
  document.getElementById('pub-stat-followers').textContent = '—';
  document.getElementById('pub-stat-following').textContent = '—';
  document.getElementById('pub-stat-species').textContent = '—';
  document.getElementById('pub-stat-obs').textContent = '—';
  document.getElementById('pub-stat-photos').textContent = '—';
  document.getElementById('pub-stat-days').textContent = '—';
  document.getElementById('pub-action-row').innerHTML = '';
  document.getElementById('pub-gallery-grid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Carregando...</div>';
  document.getElementById('pub-checklist-grid').innerHTML = '';
  document.getElementById('pub-cover-img').style.display = 'none';
  const avatarEl = document.getElementById('pub-avatar');
  avatarEl.innerHTML = '?';
  avatarEl.style.background = 'linear-gradient(135deg,var(--sky),var(--forest))';

  switchPubTab('gallery', document.getElementById('pub-tab-gallery'));

  try {
    const { data: profile } = await db.from('profiles')
      .select('id, nome, handle, cidade, bio, avatar_url')
      .eq('handle', handle)
      .maybeSingle();

    if (!profile) {
      document.getElementById('pub-name').textContent = 'Usuário não encontrado';
      return;
    }

    if (profile.avatar_url) {
      avatarEl.innerHTML = '<img src="' + profile.avatar_url + '" style="width:100%;height:100%;object-fit:cover;">';
    } else {
      avatarEl.textContent = (profile.nome || handle)[0].toUpperCase();
    }

    document.getElementById('pub-name').textContent = profile.nome || handle;
    document.getElementById('pub-handle').textContent = '@' + profile.handle;
    document.getElementById('pub-city').textContent = profile.cidade ? '📍 ' + profile.cidade : '';
    document.getElementById('pub-bio').textContent = profile.bio || '';

    const [obsR, spR, folR, folwR, daysR] = await Promise.all([
      db.from('observations').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
      db.from('species_seen').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
      db.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', profile.id),
      db.from('follows').select('follower_id', { count: 'exact', head: true }).eq('follower_id', profile.id),
      db.from('observations').select('obs_date').eq('user_id', profile.id).not('obs_date','is',null)
    ]);
    document.getElementById('pub-stat-followers').textContent = folR.count ?? 0;
    document.getElementById('pub-stat-following').textContent = folwR.count ?? 0;
    document.getElementById('pub-stat-species').textContent = spR.count ?? 0;
    document.getElementById('pub-stat-obs').textContent = obsR.count ?? 0;

    const { data: photosData } = await db.from('observations')
      .select('id, obs_date, photo_url, species_pop, species_sci')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(60);
    const photos = (photosData || []).filter(o => o.photo_url);
    const uniqueDays = new Set((photosData || []).map(o => o.obs_date).filter(Boolean)).size;
    document.getElementById('pub-stat-photos').textContent = photos.length;
    document.getElementById('pub-stat-days').textContent = uniqueDays;

    const actionRow = document.getElementById('pub-action-row');
    if (currentUser && currentUser.id !== profile.id) {
      const { data: alreadyFollowing } = await db.from('follows')
        .select('id').eq('follower_id', currentUser.id).eq('following_id', profile.id).maybeSingle();
      const isF = !!alreadyFollowing;
      actionRow.innerHTML =
        '<button id="pub-follow-btn"' +
        ' data-uid="' + profile.id + '"' +
        ' data-handle="' + profile.handle + '"' +
        ' data-following="' + (isF ? '1' : '0') + '"' +
        ' onclick="pubToggleFollow(this)"' +
        ' style="height:38px;padding:0 20px;border-radius:var(--radius-md);cursor:pointer;font-weight:700;font-size:13px;' +
        (isF ? 'border:1.5px solid var(--border);background:var(--bg);color:var(--text-mid);' : 'border:none;background:linear-gradient(135deg,var(--sky),var(--sky-dark));color:white;') +
        '">' + (isF ? '✓ Seguindo' : '+ Seguir') + '</button>' +
        '<button onclick="pubOpenMsg(this)"' +
        ' data-uid="' + profile.id + '"' +
        ' data-handle="' + profile.handle + '"' +
        ' style="height:38px;padding:0 16px;border-radius:var(--radius-md);border:1.5px solid var(--border);background:var(--bg);color:var(--text-mid);cursor:pointer;font-size:13px;font-weight:600;">💬 Mensagem</button>';
    }

    // Barra de progresso de amizade no perfil público
    const pubFriendBar = document.getElementById('pub-friendship-bar');
    if (pubFriendBar && currentUser && currentUser.id !== profile.id) {
      try {
        const { data: fship } = await db.from('friendships')
          .select('shared_obs, status')
          .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${currentUser.id})`)
          .eq('status', 'accepted')
          .maybeSingle();
        if (fship) {
          const fl = getFriendLevel(fship.shared_obs || 0);
          const nextLvl = FRIEND_LEVELS[Math.min(fl.lvl + 1, 5)];
          const pct = fl.lvl >= 5 ? 100 : Math.min(100, ((fship.shared_obs - fl.min) / (nextLvl.min - fl.min)) * 100);
          pubFriendBar.innerHTML = `<div style="margin-top:12px;padding:10px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-md);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:600;color:var(--text-muted);">🤝 Progresso de amizade</span>
              <span style="font-size:11px;color:var(--text-muted);">${fl.lvl < 5 ? fship.shared_obs + '/' + nextLvl.min + ' obs juntos' : 'Nível máximo 🌟'}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="obs-rank-badge ${fl.cls}" style="font-size:10px;">${fl.label}</span>
              <div class="friendship-bar" style="flex:1;"><div class="friendship-fill ${fl.cls}" style="width:${pct}%;"></div></div>
            </div>
          </div>`;
          pubFriendBar.style.display = 'block';
        } else {
          pubFriendBar.style.display = 'none';
        }
      } catch(e) { pubFriendBar.style.display = 'none'; }
    } else if (pubFriendBar) {
      pubFriendBar.style.display = 'none';
    }

    const galleryEl = document.getElementById('pub-gallery-grid');
    if (photos.length) {
      galleryEl.innerHTML = photos.map(o => {
        const obsObj = { id: o.id, species: o.species_pop, sciName: o.species_sci, photoUrl: o.photo_url, date: o.obs_date, user: { name: profile.nome, handle: profile.handle }, companionHandle: o.companion_handle || null };
        const safeJson = JSON.stringify(obsObj).replace(/"/g,'&quot;');
        return '<div class="gallery-item" onclick="openPhotoExpand(' + safeJson + ')">'
          + '<img src="' + escHtml(o.photo_url) + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML=\'&#128038;\'">'
          + '<div class="gallery-item-label">' + escHtml(capitalize(o.species_pop || o.species_sci || '')) + '</div>'
          + '</div>';
      }).join('');
    } else {
      galleryEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Nenhuma foto ainda.</div>';
    }

    const { data: spSeen } = await db.from('species_seen').select('species_sci').eq('user_id', profile.id);
    _pubSpeciesSeen = (spSeen || []).map(r => r.species_sci);
    document.getElementById('pub-checklist-status').textContent = _pubSpeciesSeen.length + ' espécies encontradas';
    renderPubChecklist('');

  } catch(e) {
    console.warn('openPublicProfile:', e);
    document.getElementById('pub-name').textContent = 'Erro ao carregar perfil';
  }
}

function closePubProfile() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const prev = _pubPrevPage || 'home';
  document.getElementById('page-' + prev)?.classList.add('active');
  const prevBtn = document.querySelector('[data-page=' + prev + ']');
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  if (prevBtn) prevBtn.classList.add('active');
}

function switchPubTab(tab, btn) {
  document.getElementById('pub-panel-gallery').style.display = tab === 'gallery' ? 'block' : 'none';
  document.getElementById('pub-panel-checklist').style.display = tab === 'checklist' ? 'block' : 'none';
  document.querySelectorAll('[id^="pub-tab-"]').forEach(b => {
    b.style.borderBottomColor = 'transparent';
    b.style.color = 'var(--text-muted)';
    b.style.fontFamily = "'DM Sans', sans-serif";
    b.style.fontWeight = '500';
  });
  if (btn) {
    btn.style.borderBottomColor = 'var(--sky)';
    btn.style.color = 'var(--sky)';
    btn.style.fontFamily = "'Syne', sans-serif";
    btn.style.fontWeight = '700';
  }
}

function renderPubChecklist(filter) {
  const grid = document.getElementById('pub-checklist-grid');
  const birds = SC_BIRDS.filter(b => _pubSpeciesSeen.includes(b.sci) &&
    (!filter || b.pop.toLowerCase().includes(filter) || b.sci.toLowerCase().includes(filter)));
  if (!birds.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">' + (filter ? 'Nenhuma espécie encontrada com esse filtro.' : 'Nenhuma espécie registrada ainda.') + '</div>';
    return;
  }
  grid.innerHTML = birds.map(b => {
    const pts = INDICADORAS[b.sci];
    return '<div class="species-check-item found" style="flex-wrap:wrap;gap:4px;"><div class="species-check-icon">✓</div><div style="flex:1;min-width:0;"><div class="species-check-name">' + capitalize(b.pop) + '</div><div class="species-check-sci">' + b.sci + '</div></div>' + (pts ? '<span style="background:var(--sun-light);color:#92400e;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:700;">⭐ ' + pts + 'pts</span>' : '') + '</div>';
  }).join('');
}

function filterPubChecklist(val) { renderPubChecklist(val.toLowerCase()); }

async function pubToggleFollow(btn) {
  if (!currentUser) { showToast('🔑 Faça login para seguir'); openAuthModal(); return; }
  if (btn._toggling) return;
  btn._toggling = true;
  btn.disabled = true;
  const targetId = btn.dataset.uid;
  const handle   = btn.dataset.handle;
  const isF = btn.dataset.following === '1';
  try {
    if (isF) {
      await db.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', targetId);
      btn.dataset.following = '0';
      btn.textContent = '+ Seguir';
      btn.style.background = 'linear-gradient(135deg,var(--sky),var(--sky-dark))';
      btn.style.color = 'white';
      btn.style.border = 'none';
    } else {
      await db.from('follows').upsert({ follower_id: currentUser.id, following_id: targetId }, { onConflict: 'follower_id,following_id', ignoreDuplicates: true });
      btn.dataset.following = '1';
      btn.textContent = '✓ Seguindo';
      btn.style.background = 'var(--bg)';
      btn.style.color = 'var(--text-mid)';
      btn.style.border = '1.5px solid var(--border)';
      try { await db.from('notifications').insert({ user_id: targetId, type: 'follow', actor_id: currentUser.id, data: { actor_handle: currentUser.handle, actor_name: currentUser.name } }); } catch(e) {}
    }
    const { count } = await db.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', targetId);
    const el = document.getElementById('pub-stat-followers');
    if (el) el.textContent = count ?? 0;
  } catch(e) { showToast('❌ Erro: ' + e.message); }
  finally { btn._toggling = false; btn.disabled = false; }
}

function pubOpenMsg(btn) {
  if (!currentUser) { showToast('🔑 Faça login para enviar mensagens'); openAuthModal(); return; }
  const userId = btn.dataset.uid;
  const handle = btn.dataset.handle;
  closePubProfile();
  setTimeout(() => {
    openMessages();
    setTimeout(() => selectContact(handle, userId), 400);
  }, 150);
}

let _notifChannel = null;

/* ════════════════════════════════════════
   REALTIME — FOLLOWS / MENSAGENS / FEED
════════════════════════════════════════ */
let _realtimeChannels = [];

function startRealtimeSubscriptions() {
  if (!currentUser?.id) return;
  stopRealtimeSubscriptions();

  const msgChannel = db.channel('msgs:' + currentUser.id)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `to_id=eq.${currentUser.id}`
    }, payload => {
      const badge = document.getElementById('msg-badge');
      if (badge) badge.style.display = 'block';
      if (_activeContactId === payload.new.from_id) loadThread(_activeContactId);
    })
    .subscribe();
  _realtimeChannels.push(msgChannel);

  const followChannel = db.channel('follows:' + currentUser.id)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'follows',
      filter: `following_id=eq.${currentUser.id}`
    }, async () => {
      const { count } = await db.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', currentUser.id);
      const fEl = document.getElementById('stat-followers');
      if (fEl) fEl.textContent = count ?? 0;
    })
    .subscribe();
  _realtimeChannels.push(followChannel);

  const obsChannel = db.channel('obs-feed')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'observations' }, () => {
      if (document.getElementById('page-home')?.classList.contains('active')) renderFeed('home-feed', 4);
      if (document.getElementById('page-feed')?.classList.contains('active')) renderFeed('full-feed', 12);
    })
    .subscribe();
  _realtimeChannels.push(obsChannel);
}

function stopRealtimeSubscriptions() {
  _realtimeChannels.forEach(ch => { try { db.removeChannel(ch); } catch(e) {} });
  _realtimeChannels = [];
}

function syncBottomNav(activeBtn) {
  document.querySelectorAll('.bottom-nav-btn').forEach(b => b.classList.remove('active'));
  if (activeBtn) activeBtn.classList.add('active');
}

async function startNotifRealtime() {
  if (!currentUser?.id) return;
  if (_notifChannel) { try { db.removeChannel(_notifChannel); } catch(e){} _notifChannel = null; }
  _notifChannel = db.channel('notif:' + currentUser.id)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'notifications',
      filter: `user_id=eq.${currentUser.id}`
    }, () => {
      const badge = document.getElementById('notif-badge');
      if (badge) badge.style.display = 'block';
    })
    .subscribe();
}

function stopNotifRealtime() {
  if (_notifChannel) { try { db.removeChannel(_notifChannel); } catch(e){} _notifChannel = null; }
}

/* ════════════════════════════════════════
   USER STATS FOR SEARCH PAGE
════════════════════════════════════════ */
async function loadUserStats(userId, handle) {
  try {
    // Usa select com dados reais em vez de head:true para evitar erros de RLS
    const [obsR, spR, folR] = await Promise.all([
      db.from('observations').select('id').eq('user_id', userId).limit(9999),
      db.from('species_seen').select('species_sci').eq('user_id', userId).limit(9999),
      db.from('follows').select('follower_id').eq('following_id', userId).limit(9999)
    ]);
    const s = document.getElementById('usp_'+handle);
    const o = document.getElementById('uob_'+handle);
    const f = document.getElementById('ufo_'+handle);
    if (s) s.textContent = (spR.data?.length) ?? 0;
    if (o) o.textContent = (obsR.data?.length) ?? 0;
    if (f) f.textContent = (folR.data?.length) ?? 0;
  } catch(e) {}
}

/* ════════════════════════════════════════
   FULL PHOTO VIEWER (opens in page, not new tab)
════════════════════════════════════════ */
function showFullPhoto(url) {
  let ov = document.getElementById('_full_photo_ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = '_full_photo_ov';
    ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.96);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:16px;';
    ov.onclick = () => ov.style.display = 'none';
    document.body.appendChild(ov);
  }
  ov.innerHTML = `<img src="${url}" style="max-width:95vw;max-height:95vh;object-fit:contain;border-radius:8px;">
    <button onclick="document.getElementById('_full_photo_ov').style.display='none'" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.15);border:none;border-radius:50%;width:40px;height:40px;color:white;font-size:20px;cursor:pointer;z-index:2;">✕</button>`;
  ov.style.display = 'flex';
}

function showFullPhotoZoom(url) {
  let ov = document.getElementById('_zoom_ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = '_zoom_ov';
    ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.96);display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:zoom-out;';
    ov.innerHTML = '<img id="_zoom_img" style="max-width:95vw;max-height:95vh;object-fit:contain;border-radius:6px;transition:transform .1s;transform-origin:center;user-select:none;">'
      + '<button onclick="document.getElementById(\'_zoom_ov\').style.display=\'none\'" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.15);border:none;border-radius:50%;width:40px;height:40px;color:white;font-size:20px;cursor:pointer;z-index:2;">✕</button>';
    let scale = 1;
    ov.addEventListener('wheel', e => {
      e.preventDefault();
      scale = Math.min(5, Math.max(0.5, scale + (e.deltaY < 0 ? 0.15 : -0.15)));
      document.getElementById('_zoom_img').style.transform = `scale(${scale})`;
    }, { passive: false });
    ov.addEventListener('click', e => { if (e.target === ov) { ov.style.display = 'none'; scale = 1; document.getElementById('_zoom_img').style.transform = 'scale(1)'; } });
    document.body.appendChild(ov);
  }
  document.getElementById('_zoom_img').src = url;
  ov.style.display = 'flex';
  document.getElementById('_zoom_img').style.transform = 'scale(1)';
}

/* ════════════════════════════════════════
   SEGUIR / DEIXAR DE SEGUIR USUÁRIO
════════════════════════════════════════ */
async function loadFollowBtn(targetId, handle) {
  if (!currentUser || currentUser.id === targetId) {
    const btn = document.getElementById('fbtn_'+handle);
    if (btn && currentUser?.id === targetId) btn.style.display = 'none';
    return;
  }
  const btn = document.getElementById('fbtn_'+handle);
  if (!btn) return;
  try {
    const { data } = await db.from('follows')
      .select('id').eq('follower_id', currentUser.id).eq('following_id', targetId).maybeSingle();
    if (data) {
      btn.textContent = '✓ Seguindo';
      btn.classList.add('following');
      btn.dataset.following = '1';
    }
  } catch(e) {}
}

async function toggleFollowUser(targetId, handle, btn) {
  if (!currentUser) { showToast('🔑 Faça login para seguir'); openAuthModal(); return; }
  if (currentUser.id === targetId) return;
  if (btn._toggling) return;
  btn._toggling = true;
  btn.disabled = true;

  const isFollowing = btn.dataset.following === '1';
  try {
    if (isFollowing) {
      await db.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', targetId);
      btn.textContent = '+ Seguir';
      btn.classList.remove('following');
      btn.dataset.following = '0';
    } else {
      await db.from('follows').upsert(
        { follower_id: currentUser.id, following_id: targetId },
        { onConflict: 'follower_id,following_id', ignoreDuplicates: true }
      );
      btn.textContent = '✓ Seguindo';
      btn.classList.add('following');
      btn.dataset.following = '1';
      try {
        await db.from('notifications').insert({
          user_id: targetId, type: 'follow', actor_id: currentUser.id,
          data: { actor_handle: currentUser.handle, actor_name: currentUser.name }
        });
      } catch(e) {}
    }
    const { count } = await db.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', targetId);
    const folEl = document.getElementById('ufo_'+handle);
    if (folEl) folEl.textContent = count ?? 0;
    const ppFol = document.getElementById('pp-fol');
    if (ppFol) ppFol.textContent = count ?? 0;
  } catch(e) { showToast('❌ Erro: ' + e.message); }
  finally { btn._toggling = false; btn.disabled = false; }
}

// ===== AUTO-REFRESH A CADA 1 MINUTO =====
let _refreshInterval = null;

async function refreshAllData() {
  // Atualiza feeds públicos
  if (document.getElementById('page-home')?.classList.contains('active')) {
    renderFeed('home-feed', 4);
  }
  if (document.getElementById('page-feed')?.classList.contains('active')) {
    renderFeed('full-feed', 12);
  }

  // Se o usuário estiver logado, atualiza badges
  if (currentUser) {
    await loadNotifBadge();
    // Se você criou a função loadMsgBadge (conforme explicado antes), descomente a linha abaixo
    // if (typeof loadMsgBadge === 'function') await loadMsgBadge();
  }

  // Se o modal de notificações estiver aberto, recarrega a lista
  const notifModal = document.getElementById('notif-modal');
  if (notifModal && notifModal.classList.contains('open') && currentUser) {
    await openNotifications(); // recarrega e marca como lidas
  }

  // Se o modal de mensagens estiver aberto, recarrega contatos e thread atual
  const msgModal = document.getElementById('messages-modal');
  if (msgModal && msgModal.classList.contains('open') && currentUser) {
    await renderContacts();
    if (window._activeContactId) { // a variável _activeContactId já existe no código
      await loadThread(window._activeContactId);
    }
  }
}

function startAutoRefresh() {
  if (_refreshInterval) clearInterval(_refreshInterval);
  _refreshInterval = setInterval(refreshAllData, 60000); // 60 segundos
}

function stopAutoRefresh() {
  if (_refreshInterval) {
    clearInterval(_refreshInterval);
    _refreshInterval = null;
  }
}

/* ════════════════════════════════════════
   BACKGROUND FOTO ALEATÓRIA DE AVE
   Busca do photo_index.json, rotaciona a cada 45s
════════════════════════════════════════ */
let _bgPhotoInterval = null;

async function initBgPhoto() {
  await _setBgPhoto();
  // Troca a foto a cada 45 segundos
  _bgPhotoInterval = setInterval(_setBgPhoto, 45000);
}

async function _setBgPhoto() {
  try {
    const idx = await ensurePhotoIndex();
    if (!idx || !window._photoIndex) return;

    // Pega todas as URLs disponíveis
    const allEntries = [];
    Object.values(window._photoIndex).forEach(arr => {
      if (Array.isArray(arr)) arr.forEach(e => { if (e.url) allEntries.push(e.url); });
    });
    if (!allEntries.length) return;

    const url = allEntries[Math.floor(Math.random() * allEntries.length)];
    const el = document.getElementById('bg-bird-photo');
    if (!el) return;

    // Pré-carrega a imagem antes de aplicar
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url(${url})`;
      el.classList.add('loaded');
    };
    img.onerror = () => {}; // silencioso em falhas
    img.src = url;
  } catch(e) { /* silencioso */ }
}

/* ════════════════════════════════════════
   IDENTIFICAÇÃO POR IA — Claude Vision via Supabase Edge Function
/* ════════════════════════════════════════
   IDENTIFICAÇÃO POR IA — iNaturalist Vision API
   Gratuito, sem chave, chamado direto do browser.
   Documentação: https://api.inaturalist.org/v1/docs/#!/Computervision/post_computervision_score_image
════════════════════════════════════════ */

let _aiIdFile = null;
let _aiIdFromUpload = false;

/* Converte base64 → Blob → FormData e envia para iNaturalist */
async function _callIdentifyBird(base64Jpeg) {
  // base64 → Uint8Array → Blob
  const binary = atob(base64Jpeg);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'image/jpeg' });

  const form = new FormData();
  form.append('image', blob, 'photo.jpg');
  // Localização de SC como dica geográfica para aumentar precisão
  form.append('lat', '-27.5');
  form.append('lng', '-50.5');

  const resp = await fetch('https://api.inaturalist.org/v1/computervision/score_image', {
    method: 'POST',
    body: form
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`iNaturalist Vision API ${resp.status}: ${errText.slice(0, 120)}`);
  }

  const json = await resp.json();

  // Mapeia para o formato interno { sci, pop, confidence, notes }
  const results = (json.results || [])
    .filter(r => r.taxon?.rank === 'species') // só espécies, não gêneros/famílias
    .slice(0, 5)
    .map(r => {
      const sci = r.taxon?.name || '';
      // Tenta nome popular em pt-BR via SC_BIRDS, fallback ao nome do iNaturalist
      const scBird = _matchToScBirds(sci);
      const pop = scBird
        ? capitalize(scBird.pop)
        : (r.taxon?.preferred_common_name || sci);
      const score = Math.round((r.score || 0) * 100);
      // Nota contextual baseada na confiança e no rank
      const notes = score >= 85
        ? 'Alta confiança — características bem visíveis'
        : score >= 60
          ? 'Confiança moderada — confira as marcas de campo'
          : 'Baixa confiança — foto pode estar parcialmente obscurecida';
      return { sci, pop, confidence: score, notes };
    });

  // Se filtrou tudo (só gêneros/famílias), tenta pegar sem filtro de rank
  if (!results.length && json.results?.length) {
    const fallback = (json.results).slice(0, 3).map(r => ({
      sci:        r.taxon?.name || '',
      pop:        r.taxon?.preferred_common_name || r.taxon?.name || '',
      confidence: Math.round((r.score || 0) * 100),
      notes:      `Rank: ${r.taxon?.rank || '?'}`
    }));
    return { results: fallback };
  }

  return { results };
}

function openAiIdFromUpload() {
  const input = document.getElementById('photo-input');
  if (!input?.files?.length) return;
  _aiIdFromUpload = true;
  navigateTo('ai-id', document.querySelector('[data-page=ai-id]'));
  setTimeout(() => { _loadAiIdFile(input.files[0]); }, 120);
}

function aiIdReset() {
  _aiIdFile = null;
  const preview  = document.getElementById('ai-id-preview');
  const dropzone = document.getElementById('ai-id-dropzone');
  const result   = document.getElementById('ai-id-result');
  const btn      = document.getElementById('ai-id-btn');
  const inp      = document.getElementById('ai-id-input');
  if (preview)  preview.style.display  = 'none';
  if (dropzone) dropzone.style.display = 'block';
  if (result)   { result.style.display = 'none'; result.innerHTML = ''; }
  if (btn)      btn.disabled = true;
  if (inp)      inp.value = '';
  const btnText = document.getElementById('ai-id-btn-text');
  if (btnText) btnText.textContent = '🔍 Identificar Espécie';
  const spinner = document.getElementById('ai-id-spinner');
  if (spinner) spinner.style.display = 'none';
}

function aiIdHandleFile(input) {
  const file = input.files[0];
  if (!file) return;
  _loadAiIdFile(file);
}

function _loadAiIdFile(file) {
  _aiIdFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const img      = document.getElementById('ai-id-img');
    const preview  = document.getElementById('ai-id-preview');
    const dropzone = document.getElementById('ai-id-dropzone');
    const btn      = document.getElementById('ai-id-btn');
    const result   = document.getElementById('ai-id-result');
    if (img)      img.src = e.target.result;
    if (preview)  preview.style.display  = 'block';
    if (dropzone) dropzone.style.display = 'none';
    if (btn)      btn.disabled = false;
    if (result)   { result.style.display = 'none'; result.innerHTML = ''; }
  };
  reader.readAsDataURL(file);
}

/* Redimensiona para 1024px máximo antes de enviar */
async function _resizeImageForAi(file, maxSize = 1024) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else       { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}



/* Mapeia para lista SC_BIRDS */
function _matchToScBirds(sciName) {
  if (!sciName) return null;
  const q = sciName.toLowerCase().trim();
  let found = SC_BIRDS.find(b => b.sci.toLowerCase() === q);
  if (!found) {
    const genus = q.split(' ')[0];
    found = SC_BIRDS.find(b => b.sci.toLowerCase().startsWith(genus + ' '));
  }
  return found || null;
}

/* Executa identificação e renderiza resultados */
async function runAiId() {
  if (!_aiIdFile) return;
  const btn     = document.getElementById('ai-id-btn');
  const btnText = document.getElementById('ai-id-btn-text');
  const spinner = document.getElementById('ai-id-spinner');
  const resultEl= document.getElementById('ai-id-result');

  btn.disabled = true;
  spinner.style.display = 'inline-block';
  btnText.textContent = 'Analisando com IA…';
  resultEl.style.display = 'none';
  resultEl.innerHTML = '';

  try {
    const base64  = await _resizeImageForAi(_aiIdFile);
    const json    = await _callIdentifyBird(base64);
    const results = (json.results || []).slice(0, 5);

    if (!results.length) {
      resultEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);">Nenhuma ave identificada. Tente uma foto mais nítida com a ave em destaque.</div>';
      resultEl.style.display = 'block';
      return;
    }

    let html = `<div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px;margin-bottom:10px;color:var(--text);">🎯 Sugestões de identificação</div>`;

    results.forEach((r, i) => {
      const sci      = r.sci  || '';
      const pop      = r.pop  || sci;
      const score    = Math.min(100, Math.max(0, Math.round(r.confidence || 0)));
      const notes    = r.notes || '';
      const scBird   = _matchToScBirds(sci);
      const isTop    = i === 0;
      const barColor = score >= 70 ? 'var(--forest)' : score >= 40 ? 'var(--sky)' : 'var(--text-muted)';

      // Tenta buscar foto do photo_index
      const safeId = sci.replace(/[^a-zA-Z0-9]/g,'_');
      const thumbKey = sci.toLowerCase().trim();
      const photoEntry = window._photoIndex?.[thumbKey]?.[0];
      const thumbHtml = photoEntry
        ? `<img src="${escHtml(photoEntry.url)}" style="width:46px;height:46px;border-radius:8px;object-fit:cover;flex-shrink:0;">`
        : `<div style="width:46px;height:46px;border-radius:8px;background:var(--sky-light);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">🐦</div>`;

      const displayName = scBird ? capitalize(scBird.pop) : capitalize(pop);
      const displaySci  = scBird ? scBird.sci : sci;

      html += `<div class="ai-id-result-item ${isTop ? 'top-match' : ''}"
        onclick="_aiIdSelectSpecies('${escHtml(displaySci)}','${escHtml(displayName)}')">
        ${thumbHtml}
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:13.5px;">${escHtml(displayName)}</div>
          <div style="font-size:11px;color:var(--text-muted);font-style:italic;margin-bottom:3px;">${escHtml(displaySci)}</div>
          ${notes ? `<div style="font-size:11px;color:var(--text-mid);line-height:1.3;">${escHtml(notes)}</div>` : ''}
          <div class="ai-id-confidence-bar" style="margin-top:5px;">
            <div class="ai-id-confidence-fill" style="width:${Math.max(4,score)}%;background:${barColor};"></div>
          </div>
        </div>
        <div class="ai-id-confidence" style="color:${barColor};">
          ${score}%
          ${scBird ? '<div style="font-size:9px;background:var(--forest);color:white;border-radius:8px;padding:1px 5px;margin-top:2px;font-weight:700;">✓ SC</div>' : ''}
        </div>
      </div>`;
    });

    html += `<div style="font-size:11px;color:var(--text-muted);margin-top:8px;padding:8px 12px;background:var(--bg);border-radius:var(--radius-md);">
      💡 Clique numa sugestão para ${_aiIdFromUpload ? 'preencher o formulário de registro' : 'abrir a ficha da espécie'}.
    </div>`;

    resultEl.innerHTML = html;
    resultEl.style.display = 'block';

  } catch(e) {
    console.error('AI ID error:', e);
    // Verifica se é erro de edge function não deployada
    const isOffline = e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError');
    resultEl.innerHTML = `<div style="padding:20px;border-radius:var(--radius-md);background:var(--coral-light);border:1px solid var(--coral);">
      <div style="font-weight:700;color:var(--coral);margin-bottom:6px;">⚠️ ${isOffline ? 'Sem conexão' : 'Erro ao identificar'}</div>
      ${isOffline
        ? `<div style="font-size:12px;color:var(--text-mid);line-height:1.6;">
            Verifique sua conexão com a internet.<br>
            A identificação usa a API do iNaturalist (grátis).
           </div>`
        : `<div style="font-size:12px;color:var(--text-muted);">${escHtml(e.message || 'Erro desconhecido')}</div>`
      }
    </div>`;
    resultEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent = '🔍 Identificar Novamente';
  }
}

function _aiIdSelectSpecies(sci, pop) {
  if (_aiIdFromUpload) {
    _aiIdFromUpload = false;
    navigateTo('upload', document.querySelector('[data-page=upload]'));
    setTimeout(() => {
      const input = document.getElementById('species-input');
      if (!input) return;
      const scBird = SC_BIRDS.find(b => b.sci.toLowerCase() === sci.toLowerCase());
      input.value = scBird ? capitalize(scBird.pop) : pop;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      showToast(`✅ Espécie preenchida: ${scBird ? capitalize(scBird.pop) : pop}`);
    }, 300);
  } else {
    openSpeciesModal(sci, pop);
  }
}
