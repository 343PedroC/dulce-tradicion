// ─── Configuración ──────────────────────────────────────────────────────────
// Reemplaza este número con el número real de WhatsApp de la tienda (formato: 57 + número sin espacios)
const TIENDA_WHATSAPP = '573001234567';

// ─── Catálogo de productos ───────────────────────────────────────────────────
const PRODUCTOS = [
  {
    id: 1,
    nombre: 'Galletas de avena',
    precio: 8000,
    descripcion: 'Hechas con avena integral y canela. Perfectas para el desayuno o la media tarde.',
    unidad: 'Bolsa × 12 unidades',
    emoji: '🌾',
  },
  {
    id: 2,
    nombre: 'Galletas de coco',
    precio: 10000,
    descripcion: 'Crocantes y doradas con ralladura de coco natural tostado.',
    unidad: 'Bolsa × 10 unidades',
    emoji: '🥥',
  },
  {
    id: 3,
    nombre: 'Galletas con chocolate',
    precio: 12000,
    descripcion: 'Suaves galletas bañadas en chocolate semiamargo de origen colombiano.',
    unidad: 'Bolsa × 8 unidades',
    emoji: '🍫',
  },
];

// ─── Estado del carrito ──────────────────────────────────────────────────────
var carrito = JSON.parse(localStorage.getItem('dt_carrito')) || [];

function guardarCarrito() {
  localStorage.setItem('dt_carrito', JSON.stringify(carrito));
}

function encontrarProducto(id) {
  return PRODUCTOS.find(function(p) { return p.id === id; });
}

function encontrarItemCarrito(id) {
  return carrito.find(function(i) { return i.id === id; });
}

function agregarAlCarrito(id) {
  var item = encontrarItemCarrito(id);
  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id: id, cantidad: 1 });
  }
  guardarCarrito();
  actualizarBadge();
  renderizarCarrito();
  track('add_to_cart', { item_id: id, item_name: encontrarProducto(id).nombre });
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(function(i) { return i.id !== id; });
  guardarCarrito();
  actualizarBadge();
  renderizarCarrito();
}

function cambiarCantidad(id, delta) {
  var item = encontrarItemCarrito(id);
  if (!item) return;
  item.cantidad = Math.max(1, item.cantidad + delta);
  guardarCarrito();
  actualizarBadge();
  renderizarCarrito();
}

function totalCarrito() {
  return carrito.reduce(function(suma, item) {
    var p = encontrarProducto(item.id);
    return suma + (p ? p.precio * item.cantidad : 0);
  }, 0);
}

function cantidadTotalItems() {
  return carrito.reduce(function(suma, i) { return suma + i.cantidad; }, 0);
}

// ─── Formato de moneda ───────────────────────────────────────────────────────
function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n);
}

// ─── Renderizado de productos ────────────────────────────────────────────────
function renderizarProductos() {
  var catalogo = document.getElementById('catalogo');
  catalogo.innerHTML = PRODUCTOS.map(function(p) {
    return (
      '<div class="card">' +
        '<div class="card-emoji">' + p.emoji + '</div>' +
        '<div class="card-body">' +
          '<h3>' + p.nombre + '</h3>' +
          '<p class="card-desc">' + p.descripcion + '</p>' +
          '<p class="card-unidad">' + p.unidad + '</p>' +
          '<p class="card-precio">' + formatCOP(p.precio) + '</p>' +
          '<button class="btn-agregar" data-id="' + p.id + '">Agregar al carrito</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  catalogo.querySelectorAll('.btn-agregar').forEach(function(btn) {
    btn.addEventListener('click', function() {
      agregarAlCarrito(Number(btn.dataset.id));
      animarBoton(btn);
    });
  });
}

function animarBoton(btn) {
  btn.textContent = '¡Agregado! ✓';
  btn.disabled = true;
  setTimeout(function() {
    btn.textContent = 'Agregar al carrito';
    btn.disabled = false;
  }, 1200);
}

// ─── Badge del carrito ───────────────────────────────────────────────────────
function actualizarBadge() {
  var badge = document.getElementById('carritoBadge');
  var n = cantidadTotalItems();
  badge.textContent = n;
  if (n === 0) {
    badge.classList.add('hidden');
  } else {
    badge.classList.remove('hidden');
  }
}

// ─── Renderizado del carrito ─────────────────────────────────────────────────
function renderizarCarrito() {
  var itemsEl = document.getElementById('carritoItems');
  var footerEl = document.getElementById('carritoFooter');

  if (carrito.length === 0) {
    itemsEl.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.<br><span>¡Agrega algunas galletas!</span></p>';
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = carrito.map(function(item) {
    var p = encontrarProducto(item.id);
    if (!p) return '';
    return (
      '<div class="carrito-item">' +
        '<span class="ci-emoji">' + p.emoji + '</span>' +
        '<div class="ci-info">' +
          '<p class="ci-nombre">' + p.nombre + '</p>' +
          '<p class="ci-precio">' + formatCOP(p.precio) + ' c/u</p>' +
        '</div>' +
        '<div class="ci-controles">' +
          '<button class="btn-qty" data-id="' + p.id + '" data-delta="-1" aria-label="Disminuir cantidad">−</button>' +
          '<span class="ci-cantidad">' + item.cantidad + '</span>' +
          '<button class="btn-qty" data-id="' + p.id + '" data-delta="1" aria-label="Aumentar cantidad">+</button>' +
        '</div>' +
        '<p class="ci-subtotal">' + formatCOP(p.precio * item.cantidad) + '</p>' +
        '<button class="btn-quitar" data-id="' + p.id + '" aria-label="Eliminar">🗑</button>' +
      '</div>'
    );
  }).join('');

  footerEl.innerHTML =
    '<div class="carrito-total">' +
      '<span>Total estimado</span>' +
      '<strong>' + formatCOP(totalCarrito()) + '</strong>' +
    '</div>' +
    '<button class="btn-checkout" id="btnCheckout">Finalizar pedido →</button>';

  itemsEl.querySelectorAll('.btn-qty').forEach(function(btn) {
    btn.addEventListener('click', function() {
      cambiarCantidad(Number(btn.dataset.id), Number(btn.dataset.delta));
    });
  });

  itemsEl.querySelectorAll('.btn-quitar').forEach(function(btn) {
    btn.addEventListener('click', function() {
      quitarDelCarrito(Number(btn.dataset.id));
    });
  });

  document.getElementById('btnCheckout').addEventListener('click', abrirCheckout);
}

// ─── Drawer del carrito ──────────────────────────────────────────────────────
function abrirCarrito() {
  renderizarCarrito();
  document.getElementById('carritoDrawer').classList.remove('hidden');
  document.getElementById('carritoOverlay').classList.remove('hidden');
  track('view_cart', { value: totalCarrito() });
}

function cerrarCarrito() {
  document.getElementById('carritoDrawer').classList.add('hidden');
  document.getElementById('carritoOverlay').classList.add('hidden');
}

// ─── Modal de checkout ───────────────────────────────────────────────────────
function abrirCheckout() {
  cerrarCarrito();
  renderizarResumenCheckout();
  document.getElementById('checkoutModal').classList.remove('hidden');
  document.getElementById('checkoutOverlay').classList.remove('hidden');
  track('begin_checkout', { value: totalCarrito(), currency: 'COP' });
}

function cerrarCheckout() {
  document.getElementById('checkoutModal').classList.add('hidden');
  document.getElementById('checkoutOverlay').classList.add('hidden');
}

function renderizarResumenCheckout() {
  var el = document.getElementById('checkoutResumen');
  var lineas = carrito.map(function(item) {
    var p = encontrarProducto(item.id);
    return (
      '<div class="resumen-linea">' +
        '<span>' + p.emoji + ' ' + p.nombre + ' ×' + item.cantidad + '</span>' +
        '<span>' + formatCOP(p.precio * item.cantidad) + '</span>' +
      '</div>'
    );
  }).join('');

  el.innerHTML =
    '<div class="resumen-items">' + lineas + '</div>' +
    '<div class="resumen-total">' +
      '<span>Total</span>' +
      '<strong>' + formatCOP(totalCarrito()) + '</strong>' +
    '</div>';
}

// ─── Construcción del mensaje de WhatsApp ───────────────────────────────────
function construirMensajePedido(datos) {
  var ref = 'DT-' + Date.now().toString().slice(-8);
  var lineas = carrito.map(function(item) {
    var p = encontrarProducto(item.id);
    return '• ' + p.nombre + ' ×' + item.cantidad + ' — ' + formatCOP(p.precio * item.cantidad);
  }).join('\n');

  var msg =
    '*Nuevo pedido — Dulce Tradición* 🍪\n\n' +
    '*Cliente:* ' + datos.nombre + '\n' +
    '*Teléfono:* ' + datos.telefono + '\n' +
    '*Dirección:* ' + datos.direccion + '\n' +
    (datos.notas ? '*Notas:* ' + datos.notas + '\n' : '') +
    '\n*Productos:*\n' + lineas + '\n\n' +
    '*Total: ' + formatCOP(totalCarrito()) + '*\n\n' +
    '_Ref: ' + ref + '_';

  return msg;
}

// ─── Envío del checkout ──────────────────────────────────────────────────────
function manejarCheckout(e) {
  e.preventDefault();

  var nombre   = document.getElementById('co-nombre').value.trim();
  var telefono = document.getElementById('co-tel').value.trim();
  var direccion = document.getElementById('co-dir').value.trim();
  var notas    = document.getElementById('co-notas').value.trim();
  var consent  = document.getElementById('co-consent').checked;

  if (!nombre || !telefono || !direccion) {
    alert('Por favor completa los campos obligatorios: nombre, teléfono y dirección.');
    return;
  }
  if (!consent) {
    alert('Debes aceptar la Política de Tratamiento de Datos para continuar.');
    return;
  }

  var mensaje = construirMensajePedido({ nombre: nombre, telefono: telefono, direccion: direccion, notas: notas });
  var url = 'https://wa.me/' + TIENDA_WHATSAPP + '?text=' + encodeURIComponent(mensaje);

  track('purchase_whatsapp', { value: totalCarrito(), currency: 'COP', items: carrito.length });

  carrito = [];
  guardarCarrito();
  actualizarBadge();
  cerrarCheckout();
  document.getElementById('formulario-checkout').reset();

  window.open(url, '_blank', 'noopener,noreferrer');
}

// ─── Formulario de contacto ──────────────────────────────────────────────────
function manejarContacto(e) {
  e.preventDefault();

  var nombre  = document.getElementById('contacto-nombre').value.trim();
  var tel     = document.getElementById('contacto-tel').value.trim();
  var mensaje = document.getElementById('contacto-mensaje').value.trim();

  if (!nombre) {
    alert('Por favor ingresa tu nombre.');
    return;
  }

  var texto =
    'Hola Dulce Tradición, soy *' + nombre + '*' +
    (tel ? ' (' + tel + ')' : '') + '.\n\n' +
    (mensaje || 'Me gustaría obtener más información sobre sus productos.');

  var url = 'https://wa.me/' + TIENDA_WHATSAPP + '?text=' + encodeURIComponent(texto);

  track('contact_whatsapp', {});
  window.open(url, '_blank', 'noopener,noreferrer');
  e.target.reset();
}

// ─── Analytics helper ────────────────────────────────────────────────────────
function track(event, params) {
  if (typeof gtag === 'function') {
    gtag('event', event, params);
  }
}

// ─── WhatsApp FAB ────────────────────────────────────────────────────────────
function configurarFAB() {
  var texto = encodeURIComponent('Hola Dulce Tradición 🍪, quisiera obtener más información sobre sus productos.');
  document.getElementById('whatsappFab').href = 'https://wa.me/' + TIENDA_WHATSAPP + '?text=' + texto;
}

// ─── Inicialización ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  renderizarProductos();
  actualizarBadge();
  configurarFAB();

  // Hero
  document.getElementById('btnHero').addEventListener('click', function() {
    document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    track('click_hero', { event_category: 'interaccion', event_label: 'boton principal' });
  });

  // Carrito
  document.getElementById('btnCarrito').addEventListener('click', abrirCarrito);
  document.getElementById('btnCerrarCarrito').addEventListener('click', cerrarCarrito);
  document.getElementById('carritoOverlay').addEventListener('click', cerrarCarrito);

  // Checkout
  document.getElementById('btnCerrarCheckout').addEventListener('click', cerrarCheckout);
  document.getElementById('checkoutOverlay').addEventListener('click', cerrarCheckout);
  document.getElementById('formulario-checkout').addEventListener('submit', manejarCheckout);

  // Contacto
  document.getElementById('formulario-contacto').addEventListener('submit', manejarContacto);
});
