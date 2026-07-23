let db;

function abrirBase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open("RaicesDB", 1);

        request.onupgradeneeded = function (event) {

            db = event.target.result;

            if (!db.objectStoreNames.contains("plantas")) {

                db.createObjectStore("plantas", {
                    keyPath: "id",
                    autoIncrement: true
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