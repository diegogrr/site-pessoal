// Seleciona elementos do DOM
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const closeButton = document.querySelector('.close');

// Adiciona evento de clique em cada imagem de badge
document.querySelectorAll('.badge').forEach(badge => {
    badge.addEventListener('click', () => {
        modal.style.display = 'block'; // Exibe o modal
        modalImage.src = badge.src; // Define a imagem do modal
    });
});

// Fecha o modal ao clicar no botão de fechar
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Fecha o modal ao clicar fora da imagem
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});