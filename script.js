let plantas = JSON.parse(localStorage.getItem("plantas")) || [];

let editando = -1;

let filtroActual = "Todas";

let posicionAnterior = 0;

// Adaptación de versiones anteriores

plantas.forEach(function(p){

    if(!p.categoria){
        p.categoria="Interior";
    }

    if(p.favorita===undefined){
        p.favorita=false;
    }

    if(!p.historial){
        p.historial=[];
    }

    if(!p.riego){
        p.riego="";
    }

});


abrirBase()
.then(() => {

    console.log("Base de datos abierta correctamente.");

    mostrar();

})
.catch(error => {

    console.error(error);

});


function agregarPlanta(){

let archivo = null;

let camara = document.getElementById("camara");

let galeria = document.getElementById("galeria");


if(camara.files.length > 0){

archivo = camara.files[0];

}


if(galeria.files.length > 0){

archivo = galeria.files[0];

}



if(archivo){


let lector = new FileReader();


lector.onload=function(e){

    guardarPlanta(e.target.result);

};

lector.readAsDataURL(archivo);



}else{


let fotoAnterior =
editando>=0 ? plantas[editando].foto : "";


guardarPlanta(fotoAnterior);



}


}



function guardarPlanta(imagen){

let planta={

nombre:nombre.value,

tipo:tipo.value,

categoria:categoria.value,

etapa:etapa.value,

estado:estado.value,

ubicacion:ubicacion.value,

fecha:fecha.value,

foto:imagen,

notas:notas.value,

riego: editando>=0 ? plantas[editando].riego : "",

historial: editando>=0 ? plantas[editando].historial : [],

favorita: editando>=0 ? plantas[editando].favorita : false

};



if(editando==-1){

planta.historial.push(
"Creada: "+fechaActual()
);

plantas.push(planta);


}else{


planta.historial.push(
"Actualizada: "+fechaActual()
);


plantas[editando]=planta;

editando=-1;

}



guardar();

/*
guardarPlantaDB(planta)
.then(()=>{

    console.log("Planta guardada en IndexedDB");

})
.catch(error=>{

    console.error(error);

});
*/

limpiar();

mostrar();


}





function guardar(){

try{

    localStorage.setItem(
        "plantas",
        JSON.stringify(plantas)
    );


    plantas.forEach(function(planta){

        guardarPlantaDB(planta)
        .then(()=>{

            console.log("Guardada en IndexedDB");

        })
        .catch(error=>{

            console.error(error);

        });

    });


    console.log("Guardado correcto");


}catch(error){

    console.error(error);

    alert("Error guardando. La foto es demasiado grande");

}

}

}


function limpiar(){

nombre.value="";

fecha.value="";

ubicacion.value="";

notas.value="";

document.getElementById("camara").value="";

document.getElementById("galeria").value="";

}




function editar(i){


let p=plantas[i];


nombre.value=p.nombre;

tipo.value=p.tipo;

categoria.value=p.categoria;

etapa.value=p.etapa;

estado.value=p.estado;

ubicacion.value=p.ubicacion;

fecha.value=p.fecha;

notas.value=p.notas;


editando=i;


window.scrollTo(0,0);

mostrar();


}





function eliminar(i){

if(confirm("Eliminar esta planta?")){


plantas.splice(i,1);

guardar();

mostrar();


}

}





function regar(i){


plantas[i].riego =
new Date().toISOString().split("T")[0];


plantas[i].historial.push(
"Riego: "+fechaActual()
);


guardar();

mostrar();


if(document.getElementById("ficha").style.display=="block"){

ficha(i);

}


}




function favorito(i){


plantas[i].favorita =
!plantas[i].favorita;


guardar();

mostrar();


if(document.getElementById("ficha").style.display=="block"){

ficha(i);

}


}



function filtrar(tipo){

filtroActual=tipo;

mostrar();

}





function fechaActual(){

return new Date().toLocaleDateString();

}

function ficha(i){

posicionAnterior = window.scrollY;

let p=plantas[i];

let fichaDiv=document.getElementById("ficha");


fichaDiv.style.display="block";


fichaDiv.innerHTML=`


<div class="ficha-overlay">


<div class="ficha-planta">


<button class="cerrar-ficha" onclick="volver()">

✖

</button>



${p.foto ? `<img src="${p.foto}">`:""}



<h2 class="ficha-titulo">

${p.nombre}

</h2>



<div class="ficha-dato">

🪴 Tipo: ${p.tipo}

</div>



<div class="ficha-dato">

🌿 Categoría: ${p.categoria}

</div>



<div class="ficha-dato">

🌱 Etapa: ${p.etapa}

</div>



<div class="ficha-dato">

📍 Ubicación: ${p.ubicacion || "Sin ubicación"}

</div>



<div class="ficha-dato">

${p.estado=="Agua" ? "💧 Agua" : "🪴 Tierra"}

</div>



<div class="ficha-dato">

💧 ${diasDesdeRiego(p.riego)}

</div>



<div class="ficha-dato">

⭐ ${p.favorita ? "Favorita" : "No favorita"}

</div>



<div class="ficha-dato">

📝 ${p.notas || "Sin notas"}

</div>



<div class="historial">

<strong>Historia completa:</strong>

<br>

${p.historial.join("<br>")}

</div>

<div class="botones">


<button class="regar" onclick="regar(${i})">

💧 Regar

</button>



<button class="fav" onclick="favorito(${i})">

${p.favorita ? "⭐" : "☆"}

</button>



<button class="editar" onclick="editar(${i}); volver()">

✏️ Editar

</button>



<button class="eliminar" onclick="eliminar(${i}); volver()">

🗑️ Eliminar

</button>


</div>

</div>


</div>


`;

}



function volver(){

let fichaDiv=document.getElementById("ficha");

fichaDiv.style.display="none";

fichaDiv.innerHTML="";


document.getElementById("coleccion").style.display="block";


window.scrollTo({

top: posicionAnterior,

behavior:"smooth"

});

}


function mostrar(){


let html="";

let texto="";



if(document.getElementById("buscador")){

texto=document.getElementById("buscador").value.toLowerCase();

actualizarResumen();

}



plantas.forEach(function(p,i){



let nombreOK =
(p.nombre || "").toLowerCase().includes(texto);



let filtroOK =
filtroActual=="Todas" ||

p.tipo==filtroActual ||

(filtroActual=="Favoritas" && p.favorita);



if(nombreOK && filtroOK){



html+=`


<div class="planta">


${p.favorita ? `<div class="favorita-tag">⭐</div>` : ""}


${p.foto ? `<img src="${p.foto}">`:""}


<div class="contenido-planta">


<h2>${p.nombre}</h2>


<div class="categoria">
🪴 ${p.tipo}
</div>


<div class="categoria">
🏠 ${p.ubicacion || "Sin ubicación"}
</div>


<div class="categoria">
🌱 ${p.etapa || "Sin etapa"}
</div>


<div class="categoria">
${diasDesdeRiego(p.riego)}
</div>


<div class="categoria">
${estadoRiego(p.riego)}
</div>


<div class="categoria">
${p.estado=="Agua" ? "💧 Agua" : "🪴 Tierra"}
</div>



<div class="categoria ${estadoClase(p)}">

🚦 ${estadoCuidado(p)}

</div>



<div class="botones">


<button onclick="ficha(${i})">

Ver ficha

</button>



<button class="regar" onclick="regar(${i})">

💧 Regué hoy

</button>

<button class="fav" onclick="favorito(${i})">

${p.favorita ? "⭐" : "☆"}

</button>


<button class="editar" onclick="editar(${i})">

Editar

</button>



<button class="eliminar" onclick="eliminar(${i})">

Eliminar

</button>



</div>


</div>


</div>


`;

}


});



lista.innerHTML=html;


mostrarGaleria();


}






function mostrarGaleria(){


let html="";



plantas.forEach(function(p,i){



let indicador="⚪";


if(p.riego){


let hoy=new Date();

let ultimo=new Date(p.riego);


let dias=Math.floor(
(hoy-ultimo)/(1000*60*60*24)
);



if(dias<=2){

indicador="🟢";

}else if(dias<=5){

indicador="🟡";

}else{

indicador="🔴";

}


}



html+=`


<div class="mini-planta" onclick="ficha(${i})">


<div class="mini-iconos">

<span>${indicador}</span>

${p.favorita ? "<span>⭐</span>" : ""}

${p.estado=="Agua" ? "<span>💧</span>" : ""}


</div>



${
p.foto
?
`<img src="${p.foto}">`
:
`<div class="mini-sin-foto">🌿</div>`
}



<h4>${p.nombre}</h4>



</div>


`;


});



document.getElementById("galeriaPlantas").innerHTML=html;


}

function actualizarResumen(){


let totalPlantas = plantas.filter(function(p){

return p.tipo=="Planta";

}).length;



let totalEsquejes = plantas.filter(function(p){

return p.tipo=="Esqueje";

}).length;



let totalAgua = plantas.filter(function(p){

return p.estado=="Agua";

}).length;



document.getElementById("totalPlantas").innerHTML =
totalPlantas;


document.getElementById("totalEsquejes").innerHTML =
totalEsquejes;


document.getElementById("totalAgua").innerHTML =
totalAgua;


}





function estadoCuidado(p){


if(!p.riego){

return "🟡 Sin riego registrado";

}



let ultimo=new Date(p.riego);

let hoy=new Date();


let dias=Math.floor(
(hoy-ultimo)/(1000*60*60*24)
);



if(dias<=3){

return "🟢 Bien cuidada";

}



if(dias<=7){

return "🟡 Revisar";

}



return "🔴 Necesita atención";


}





function estadoClase(p){


if(!p.riego){

return "estado-revisar";

}



let ultimo=new Date(p.riego);

let hoy=new Date();


let dias=Math.floor(
(hoy-ultimo)/(1000*60*60*24)
);



if(dias<=3){

return "estado-bien";

}



if(dias<=7){

return "estado-revisar";

}



return "estado-atencion";


}





function mostrarFormulario(){


let formulario=document.getElementById("formulario");


if(formulario){

formulario.scrollIntoView({

behavior:"smooth"

});

}


}





function buscarPlantas(){


let texto=document
.getElementById("buscador")
.value
.toLowerCase();



let tarjetas=document.querySelectorAll(".planta");



tarjetas.forEach(function(tarjeta){


let contenido=tarjeta.innerText.toLowerCase();



if(contenido.includes(texto)){


tarjeta.style.display="block";


}else{


tarjeta.style.display="none";


}


});


}





function diasDesdeRiego(fecha){


if(!fecha){

return "Sin riego registrado";

}



let hoy=new Date();

let ultimo=new Date(fecha);



let dias=Math.floor(
(hoy-ultimo)/(1000*60*60*24)
);



if(dias==0){

return "Regada hoy 💧";

}



if(dias==1){

return "Regada hace 1 día 💧";

}



return "Regada hace "+dias+" días 💧";


}







function estadoRiego(fecha){


if(!fecha){

return "🔴 Sin registro";

}



let hoy=new Date();

let ultimo=new Date(fecha);



let dias=Math.floor(
(hoy-ultimo)/(1000*60*60*24)
);



if(dias<=2){

return "🟢 Regada";

}



if(dias<=5){

return "🟡 Revisar";

}



return "🔴 Regar";


}





function guardarYMostrar(){

guardar();

mostrar();

}





