if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../sw.js')
            .then((registration) => {
                console.log('Service Worker registrado', registration.scope);

                // Solicita permiso para las notificaciones al cargar la página
                if (Notification.permission === "default") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            registration.active?.postMessage({ type: 'SHOW_NOTIFICATION' });
                        }
                    });
                } else if (Notification.permission === "granted") {
                    registration.active?.postMessage({ type: 'SHOW_NOTIFICATION' });
                }
            })
            .catch((error) => {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
}

document.getElementById('btn').addEventListener('click', function () {
    const ciudad = document.getElementById('caja').value.trim();
    if (ciudad) {
        obtenerDatosClima(ciudad);
    } else {
        alert("Por favor, ingresa una ciudad.");
    }
});

const apiKey = 'ef924cf14dfca95bfa2cceb15b8a34b3';

async function obtenerDatosClima(ciudad) {
    const urlClima = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;
    const urlPronostico = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const responseClima = await fetch(urlClima);
        if (!responseClima.ok) throw new Error("Ciudad no encontrada");
        const dataClima = await responseClima.json();
        mostrarClima(dataClima);

        const responsePronostico = await fetch(urlPronostico);
        if (!responsePronostico.ok) throw new Error("Pronóstico no disponible");
        const dataPronostico = await responsePronostico.json();
        mostrarPronostico(dataPronostico);

    } catch (error) {
        document.getElementById('weatherresult').innerHTML = `<p class="text-danger">${error.message}</p>`;
        document.getElementById('forecast').innerHTML = "";
    }
}

//aqui mis imagenes se relacionan con el codigo de OW para el clima
const iconosLocales = {
    "01d": "sol.png",
    "01n": "sol.png",
    "02d": "sn.png",
    "02n": "sn.png",
    "03d": "sn.png",
    "03n": "sn.png",
    "04d": "sn.png",
    "04n": "sn.png",
    "09d": "lluvia.png",
    "09n": "lluvia.png",
    "10d": "lluvia.png",
    "10n": "lluvia.png",
    "11d": "tormenta.png",
    "11n": "tormenta.png",
    "13d": "nevado.png",  
    "13n": "nevado.png"  
};


// Función para obtener la imagen local del clima
function obtenerIconoLocal(icono) {
    return iconosLocales[icono] ? `/icons/${iconosLocales[icono]}` : "/icons/sn.png";
}

// Mostrar clima actual con animaciones
function mostrarClima(data) {
    const icono = data.weather[0].icon;
    const iconoLocal = obtenerIconoLocal(icono);

    document.getElementById('weatherresult').innerHTML = `
        <div class="card text-white animate-fadeIn">
            <div class="card-body text-center">
                <h3 class="card-title">${data.name}, ${data.sys.country}</h3>
                <img src="${iconoLocal}" class="weather-icon" alt="Clima">
                <h4>${data.main.temp}°C</h4>
                <p>${data.weather[0].description}</p>
                <p>Humedad: ${data.main.humidity}% | Viento: ${data.wind.speed} m/s</p>
            </div>
        </div>
    `;
}

// Mostrar pronóstico de 5 días con animaciones
function mostrarPronostico(data) {
    let contenido = `<h4 class="text-center animate__animated animate__fadeIn">Pronóstico de 5 días</h4><div class="row justify-content-center">`;

    const diasPronostico = data.list.filter((item, index) => index % 8 === 0);

    diasPronostico.forEach(dia => {
        const fecha = new Date(dia.dt * 1000).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
        const icono = dia.weather[0].icon;
        const iconoLocal = obtenerIconoLocal(icono);

        contenido += `
            <div class="col-md-3">
                <div class="card bg-dark text-white mb-3 animate__animated animate__zoomIn">
                    <div class="card-body text-center">
                        <h6>${fecha}</h6>
                        <img src="${iconoLocal}" class="forecast-icon" alt="Icono del clima">
                        <h5>${dia.main.temp}°C</h5>
                        <p>${dia.weather[0].description}</p>
                    </div>
                </div>
            </div>
       `;
    });

    contenido += `</div>`;
    document.getElementById('forecast').innerHTML = contenido;

    document.querySelectorAll('.forecast-icon').forEach(icono => {
        icono.classList.add('animate__animated', 'animate__bounceIn');
    });
}


