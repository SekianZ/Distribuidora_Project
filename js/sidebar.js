// Función para incluir componentes HTML
function includeHTML() {
    var z, i, elmnt, file, xhr;
    z = document.querySelectorAll("[w3-include-html]");
    
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      file = elmnt.getAttribute("w3-include-html");
      
      if (file) {
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
              elmnt.innerHTML = this.responseText;
              // Configurar el sidebar después de incluirlo
              setupSidebar();
            }
            if (this.status == 404) {
              elmnt.innerHTML = "Page not found.";
            }
            // Eliminar el atributo para no procesarlo de nuevo
            elmnt.removeAttribute("w3-include-html");
          }
        };
        xhr.open("GET", file, true);
        xhr.send();
        return; // Salir del bucle después del primer include
      }
    }
  }
  
  // Configuración del sidebar
  function setupSidebar() {
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
  
    if (toggleBtn && sidebar && mainContent) {
      toggleBtn.addEventListener('click', function() {
        // Alternar clases del sidebar
        sidebar.classList.toggle("w-[220px]");
        sidebar.classList.toggle("bg-gradient-to-b");
        sidebar.classList.toggle("from-[#1a3f6e]");
        sidebar.classList.toggle("to-[#1e497a]");
        
        sidebar.classList.toggle("w-[70px]");
        sidebar.classList.toggle("bg-[#1a3f6e]");
        
        // Rotar icono
        const icon = this.querySelector('i');
        icon.classList.toggle("fa-chevron-left");
        icon.classList.toggle("fa-chevron-right");
        
        // Alternar visibilidad del texto
        const navTexts = document.querySelectorAll('.nav-item span');
        navTexts.forEach(text => {
          text.classList.toggle("hidden");
        });
        
        // Alternar logo text
        const logoText = document.querySelector('.flex.items-center span');
        if (logoText) logoText.classList.toggle("hidden");
        
        // Ajustar el contenido principal
        if (sidebar.classList.contains("w-[70px]")) {
          mainContent.classList.add('md:ml-20');
          mainContent.classList.remove('md:ml-64');
        } else {
          mainContent.classList.remove('md:ml-20');
          mainContent.classList.add('md:ml-64');
        }
      });
    }
  }
  
  // Función para cerrar sesión
  function cerrarSesion() {
    // Aquí iría la lógica para cerrar sesión
    console.log("Sesión cerrada");
    // Redireccionar o limpiar localStorage, etc.
  }
  
  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    includeHTML();
    
    // Configurar botón de regresar si existe
    const btnRegresar = document.getElementById('btn-regresar');
    if (btnRegresar) {
      btnRegresar.addEventListener('click', () => {
        window.location.href = 'inicio.html';
      });
    }
  });