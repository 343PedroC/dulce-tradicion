console.log("Dulce Tradición cargado");

document.getElementById("btnHero")
.addEventListener("click", function(){

  alert("Gracias por tu interés");

});

document.querySelectorAll(".btnComprar")
.forEach(function(boton){

  boton.addEventListener("click", function(){

    alert("Producto agregado");

  });

});

document.getElementById("formulario")
.addEventListener("submit", function(e){

  e.preventDefault();

  alert("Pedido enviado");

});