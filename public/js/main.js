document.addEventListener('DOMContentLoaded', function () {
    cargarKillers();

    document.getElementById('killer-form').addEventListener('submit', agregarKiller);
    document.getElementById('cancel-button').addEventListener('click', cancelarEdicion);
});

// Función para cargar y mostrar los killers
function cargarKillers() {
    fetch('/killers')
        .then(response => response.json())
        .then(killers => {
            const killersTableBody = document.querySelector('#killers-table tbody');
            killersTableBody.innerHTML = '';

            killers.forEach(killer => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${killer.name}</td>
                    <td>${killer.alias}</td>
                    <td>${killer.power}</td>
                    <td>${killer.speed}</td>
                    <td>${killer.terror_radius}</td>
                    <td>${killer.height}</td>
                    <td>${killer.difficulty}</td>
                    <td>${formatFecha(killer.release_date)}</td>
                    <td>${killer.dlc ? 'Sí' : 'No'}</td>
                    <td>
                        <button onclick="editKiller(${killer.id})" class="btn btn-warning btn-sm">Editar</button>
                        <button onclick="deleteKiller(${killer.id})" class="btn btn-danger btn-sm">Eliminar</button>
                    </td>
                `;
                killersTableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Función para agregar un nuevo killer
function agregarKiller(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const id = form.getAttribute('data-id');

    const releaseDate = formData.get('release_date'); // Obtener la fecha del formulario
    if (!releaseDate) {
        alert('La fecha de lanzamiento es obligatoria.');
        return;
    }

    const data = {
        name: formData.get('name'),
        alias: formData.get('alias'),
        power: formData.get('power'),
        speed: parseFloat(formData.get('speed')) || 0,
        terror_radius: parseInt(formData.get('terror_radius')) || 0,
        height: formData.get('height'),
        difficulty: formData.get('difficulty'),
        release_date: releaseDate, // Usar la fecha directamente
        dlc: formData.has('dlc')
    };

    const url = id ? `/killers/${id}` : '/killers';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            cargarKillers();
            form.reset();
            form.style.display = 'none';
            form.removeAttribute('data-id');
        })
        .catch(error => console.error('Error:', error));
}

// Función para editar un killer
function editKiller(id) {
    fetch(`/killers/${id}`)
        .then(response => response.json())
        .then(killer => {
            const releaseDate = new Date(killer.release_date).toISOString().split('T')[0];

            // Llenar el formulario
            document.getElementById('name').value = killer.name;
            document.getElementById('alias').value = killer.alias;
            document.getElementById('power').value = killer.power;
            document.getElementById('speed').value = killer.speed;
            document.getElementById('terror_radius').value = killer.terror_radius;
            document.getElementById('height').value = killer.height;
            document.getElementById('difficulty').value = killer.difficulty;
            document.getElementById('release_date').value = releaseDate;
            document.getElementById('dlc').checked = killer.dlc;

            // Guardar el ID en un atributo del formulario
            const form = document.getElementById('killer-form');
            form.setAttribute('data-id', id); // 👈 Aquí guardamos el ID

            // Cambiar el texto del botón de submit
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Actualizar';

            // Mostrar el formulario
            form.style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}


function actualizarKiller(id) {
    const formData = new FormData(document.getElementById('killer-form'));
    const data = {
        name: formData.get('name'),
        alias: formData.get('alias'),
        power: formData.get('power'),
        speed: parseFloat(formData.get('speed')),
        terror_radius: parseInt(formData.get('terror_radius')),
        height: formData.get('height'),
        difficulty: formData.get('difficulty'),
        release_date: formData.get('release_date'),
        dlc: formData.has('dlc')
    };

    fetch(`/killers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            cargarKillers();
            document.getElementById('killer-form').reset();
            document.getElementById('killer-form').style.display = 'none';
        })
        .catch(error => console.error('Error:', error));
}

// Función para eliminar un killer
function deleteKiller(id) {
    if (confirm('¿Estás seguro de eliminar este killer?')) {
        fetch(`/killers/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                cargarKillers();
            })
            .catch(error => console.error('Error:', error));
    }
}

// Función para cancelar la edición y limpiar el formulario
// Función para cancelar la edición y limpiar el formulario
function cancelarEdicion() {
    const form = document.getElementById('killer-form');
    form.reset();
    form.style.display = 'none';
    form.removeAttribute('data-id'); // 👈 Limpiar el ID
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Guardar'; // Restaurar texto del botón
}


// Función para formatear la fecha
function formatFecha(fecha) {
    if (!fecha) return 'Desconocida';
    const date = new Date(fecha);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
