console.log("Dulce Tradición cargado");

document.getElementById("btnHero")
.addEventListener("click", function(){

  gtag('event', 'click_hero', {
    event_category: 'interaccion',
    event_label: 'boton principal'
  });

  alert("Gracias por tu interés");

});

document.querySelectorAll(".btnComprar")
.forEach(function(boton){

  boton.addEventListener("click", function(){

    gtag('event', 'click_comprar', {
      event_category: 'productos',
      event_label: 'producto seleccionado'
    });

    alert("Producto agregado");

  });

});

document.getElementById("formulario")
.addEventListener("submit", function(e){

  e.preventDefault();

  gtag('event', 'enviar_pedido', {
    event_category: 'conversion',
    event_label: 'formulario enviado'
  });

  alert("Pedido enviado");

});