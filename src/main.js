document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll("[data-tab-button]");
  const lists = document.querySelectorAll("[data-tab-id]");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function (event) {
      const btn = event.currentTarget;
      const tabValue = btn.dataset.tabButton; // "em_breve", "populares", "star_plus"

      // 1. Remove active class from all buttons
      buttons.forEach((button) =>
        button.classList.remove("shows__tabs__button--is-active"),
      );

      // 2. Add active class to clicked button
      btn.classList.add("shows__tabs__button--is-active");

      // 3. Remove active class from all lists
      lists.forEach((list) => list.classList.remove("shows__list--is-active"));

      // 4. Add active class to matching list
      const activeList = document.querySelector(`[data-tab-id="${tabValue}"]`);
      if (activeList) {
        activeList.classList.add("shows__list--is-active");
      }
    });
  }
});

// Passos a passo:

// Captura o clique no botão
// Lê o valor de data-tab-button (ex: "populares")
// Remove shows__tabs__button--is-active de todos os buttons
// Adiciona a classe no button clicado
// Remove shows__list--is-active de todas as <ul>
// Adiciona a classe na <ul> que tem data-tab-id com o mesmo valor
