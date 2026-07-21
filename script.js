/* ===== VIP ===== */
function joinWhatsAppGroup(){
  const input = document.getElementById('vipPhone');
  const numero = input ? input.value.trim() : '';
  if(!numero){
    alert('Por favor, informe seu número de WhatsApp antes de entrar no grupo.');
    if(input) input.focus();
    return;
  }
  window.open('https://chat.whatsapp.com/J3x2Hhsy6ZEJTB68xSzQQf', '_blank');
}

/* ===== CARROSSEL DE DESTAQUES (home) ===== */
function scrollProds(d){
  const grid = document.getElementById('pg');
  if(!grid) return;
  const card = grid.querySelector('.pc');
  const gap = parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap) || 16;
  const step = card ? card.offsetWidth + gap : 260;
  grid.scrollBy({left:d*step,behavior:'smooth'});
}

/* ===== MENU PRODUTOS RETRÁTIL (desktop) ===== */
function toggleDD(e, el){
  const arrow = el.querySelector('small');
  const clickedArrow = arrow && (e.target === arrow || arrow.contains(e.target));
  if(!clickedArrow) return; // deixa o link navegar normalmente para produtos.html
  e.preventDefault();
  e.stopPropagation();
  const li = el.closest('.has-dd');
  const wasOpen = li.classList.contains('open');
  document.querySelectorAll('.has-dd.open').forEach(x=>x.classList.remove('open'));
  if(!wasOpen) li.classList.add('open');
}
document.addEventListener('click', function(e){
  if(!e.target.closest('.has-dd')){
    document.querySelectorAll('.has-dd.open').forEach(x=>x.classList.remove('open'));
  }
});

/* ===== SUBMENU PRODUTOS (mobile) ===== */
function toggleMobSub(e, el){
  const arrow = el.querySelector('small');
  const clickedArrow = arrow && (e.target === arrow || arrow.contains(e.target));
  if(!clickedArrow) return; // deixa o link navegar normalmente para produtos.html
  e.preventDefault();
  e.stopPropagation();
  el.closest('.mob-item').classList.toggle('open');
}

/* ===== FAQ ===== */
function toggleFaq(el){ el.classList.toggle('open'); }

/* ===== CARRINHO ===== */
let cart = [];
try{ cart = JSON.parse(localStorage.getItem('cart') || '[]'); }catch(e){ cart = []; }

function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(name, price, btn){
  const existing = cart.find(i => i.name === name);
  if(existing){ existing.qty++; }
  else{ cart.push({name:name, price:price, qty:1}); }
  saveCart();
  pulseCartIcon();
  if(btn){ flashButton(btn); }
}

function pulseCartIcon(){
  document.querySelectorAll('.cart-num').forEach(el=>{
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  });
}

function flashButton(btn){
  if(btn.dataset.busy) return;
  btn.dataset.busy = '1';
  const original = btn.innerHTML;
  btn.innerHTML = '✓ ADICIONADO';
  btn.classList.add('added');
  setTimeout(()=>{
    btn.innerHTML = original;
    btn.classList.remove('added');
    delete btn.dataset.busy;
  }, 1200);
}

function limparCarrinho(){
  if(cart.length === 0) return;
  if(confirm('Tem certeza que deseja remover todos os itens do carrinho?')){
    cart = [];
    saveCart();
  }
}

function removeFromCart(idx){
  cart.splice(idx,1);
  saveCart();
}

function changeQty(idx, delta){
  cart[idx].qty += delta;
  if(cart[idx].qty <= 0){ cart.splice(idx,1); }
  saveCart();
}

function parsePrice(str){
  if(!str) return 0;
  const n = str.replace('R$','').trim().replace(/\./g,'').replace(',','.');
  const val = parseFloat(n);
  return isNaN(val) ? 0 : val;
}

function formatBRL(val){
  return 'R$ ' + val.toFixed(2).replace('.',',');
}

function renderCart(){
  const itemsEl = document.getElementById('cartItems');
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('.cart-num').forEach(el=>{ el.textContent = totalQty; });

  if(!itemsEl) return;

  if(cart.length === 0){
    itemsEl.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.</p>';
  } else {
    itemsEl.innerHTML = cart.map((item,idx)=>`
      <div class="cart-item">
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-price">${item.price}</div>
        </div>
        <div class="ci-qty">
          <button type="button" onclick="changeQty(${idx},-1)">−</button>
          <span>${item.qty}</span>
          <button type="button" onclick="changeQty(${idx},1)">+</button>
        </div>
        <span class="ci-remove" onclick="removeFromCart(${idx})">✕</span>
      </div>
    `).join('');
  }

  let total = 0, hasConsulte = false;
  cart.forEach(i=>{
    const v = parsePrice(i.price);
    if(v > 0){ total += v * i.qty; } else { hasConsulte = true; }
  });
  document.getElementById('cartTotal').textContent = formatBRL(total);
  document.getElementById('cartNote').textContent = hasConsulte ? 'Itens "Consulte" têm valor confirmado pelo WhatsApp.' : '';
  document.getElementById('btnCheckout').disabled = cart.length === 0;
  document.getElementById('cartClear').classList.toggle('disabled', cart.length === 0);
}

function toggleCart(e, forceOpen){
  if(e) e.preventDefault();
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  const isOpen = drawer.classList.contains('open');
  if(forceOpen || !isOpen){
    drawer.classList.add('open');
    overlay.classList.add('open');
  } else {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function finalizarCompra(){
  if(cart.length === 0) return;
  let total = 0, hasConsulte = false;
  cart.forEach(i=>{ const v = parsePrice(i.price); if(v>0){ total += v*i.qty; } else { hasConsulte = true; } });

  let msg = 'Olá! Gostaria de finalizar meu pedido:\n\n';
  cart.forEach(i=>{ msg += `• ${i.name} (x${i.qty}) - ${i.price}\n`; });
  msg += `\nTotal: ${formatBRL(total)}`;
  if(hasConsulte) msg += ' + itens sob consulta';

  const phone = '5571983850547';
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
}

renderCart();

// mobile: destaques da home em scroll horizontal
if(window.innerWidth<=600){
  const g=document.getElementById('pg');
  if(g){
    g.style.cssText='display:flex;overflow-x:auto;gap:12px;scroll-snap-type:x mandatory;padding-bottom:8px;';
    g.querySelectorAll('.pc').forEach(c=>{c.style.cssText='min-width:170px;flex:0 0 170px;scroll-snap-align:start;';});
  }
}

// Scroll reveal
const obs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      e.target.style.transition=`opacity .55s ${i*0.06}s,transform .55s ${i*0.06}s`;
      e.target.style.opacity='1';
      e.target.style.transform='translateY(0)';
    }
  });
},{threshold:.08});
document.querySelectorAll('.feat,.cat,.pc').forEach(el=>{
  el.style.opacity='0';el.style.transform='translateY(22px)';
  obs.observe(el);
});

/* ===== FILTROS DO CATÁLOGO (produtos.html) ===== */
function toggleFilterMenu(e, forceClose){
  if(e) e.stopPropagation();
  const toggle = document.getElementById('filterToggle');
  const menu = document.getElementById('filterMenu');
  if(!toggle || !menu) return;
  const isOpen = menu.classList.contains('open');
  const shouldOpen = forceClose ? false : !isOpen;
  menu.classList.toggle('open', shouldOpen);
  toggle.classList.toggle('open', shouldOpen);
}

function initCatalogFilters(){
  const bar = document.querySelector('.filter-bar');
  if(!bar) return;

  const grid = document.getElementById('catalogGrid');
  const empty = document.getElementById('catalogEmpty');
  const label = document.getElementById('filterToggleLabel');
  const buttons = bar.querySelectorAll('.filter-btn');
  const cards = grid.querySelectorAll('.pc');
  const labels = {todos:'Todos', tabaco:'Tabaco', piteira:'Piteira', seda:'Seda', acessorio:'Acessórios', kit:'Kits'};

  function applyFilter(cat){
    let visibleCount = 0;
    cards.forEach(card=>{
      const match = cat === 'todos' || card.dataset.category === cat;
      card.style.display = match ? '' : 'none';
      if(match) visibleCount++;
    });
    empty.style.display = visibleCount === 0 ? 'block' : 'none';
    buttons.forEach(b=> b.classList.toggle('active', b.dataset.filter === cat));
    if(label) label.textContent = 'Filtrar: ' + (labels[cat] || 'Todos');
  }

  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      applyFilter(btn.dataset.filter);
      toggleFilterMenu(null, true);
    });
  });

  document.addEventListener('click', function(e){
    if(!e.target.closest('.filter-bar')) toggleFilterMenu(null, true);
  });

  const params = new URLSearchParams(window.location.search);
  const initial = params.get('cat') || 'todos';
  const validFilters = Array.from(buttons).map(b=>b.dataset.filter);
  applyFilter(validFilters.includes(initial) ? initial : 'todos');
}
initCatalogFilters();
