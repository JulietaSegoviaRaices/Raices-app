let db;

function abrirBase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open("RaicesDB", 2);

        request.onupgradeneeded = function (event) {

            db = event.target.result;

            if (!db.objectStoreNames.contains("plantas")) {

                db.createObjectStore("plantas", {
                    keyPath: "id",
                    autoIncrement: true
                });

            }

if (!db.objectStoreNames.contains("fotos")) {

    db.createObjectStore("fotos", {
        keyPath:"id",
        autoIncrement:true
    });

}
        };

        request.onsuccess = function (event) {

            db = event.target.result;
            resolve(db);

        };

        request.onerror = function () {

            reject("Error al abrir la base de datos.");

        };

    });

}

function guardarPlantaDB(planta){

    return new Promise((resolve,reject)=>{

        const tx=db.transaction("plantas","readwrite");

        const store=tx.objectStore("plantas");

        const request=store.add(planta);

        request.onsuccess=()=>resolve();

        request.onerror=()=>reject(request.error);

    });

}

function guardarFotoDB(foto){

return new Promise((resolve,reject)=>{

const tx=db.transaction("fotos","readwrite");

const store=tx.objectStore("fotos");

const request=store.add(foto);

request.onsuccess=()=>resolve(request.result);

request.onerror=()=>reject(request.error);

});

}


function obtenerPlantasDB(){

    return new Promise((resolve,reject)=>{

        const tx=db.transaction("plantas","readonly");

        const store=tx.objectStore("plantas");

        const request=store.getAll();

        request.onsuccess=()=>resolve(request.result);

        request.onerror=()=>reject(request.error);

    });

}



function actualizarPlantaDB(planta){

    return new Promise((resolve,reject)=>{

        const tx=db.transaction("plantas","readwrite");

        const store=tx.objectStore("plantas");

        const request=store.put(planta);

        request.onsuccess=()=>resolve();

        request.onerror=()=>reject(request.error);

    });

}



function eliminarPlantaDB(id){

    return new Promise((resolve,reject)=>{

        const tx=db.transaction("plantas","readwrite");

        const store=tx.objectStore("plantas");

        const request=store.delete(id);

        request.onsuccess=()=>resolve();

        request.onerror=()=>reject(request.error);

    });

}
function guardarFotoDB(idPlanta, foto){

return new Promise((resolve,reject)=>{

const tx=db.transaction("fotos","readwrite");

const store=tx.objectStore("fotos");


const request=store.add({

idPlanta:idPlanta,

foto:foto,

fecha:new Date().toISOString()

});

request.onsuccess=()=>resolve();

request.onerror=()=>reject(request.error);


});

}



function obtenerFotosDB(idPlanta){

return new Promise((resolve,reject)=>{

const tx=db.transaction("fotos","readonly");

const store=tx.objectStore("fotos");


const request=store.getAll();


request.onsuccess=()=>{

let fotos=request.result.filter(function(f){

return f.idPlanta==idPlanta;

});


resolve(fotos);

};


request.onerror=()=>reject(request.error);


});

}
