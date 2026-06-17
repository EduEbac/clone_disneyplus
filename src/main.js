document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll("[data-tab-button]");
  const lists = document.querySelectorAll("[data-tab-id]");
  const STORAGE_KEY = "showsActiveTab";
  const questions = document.querySelectorAll('[data-faq-question');

  questions.forEach((quest) => quest.addEventListener('click', open_close_question));
  
  function open_close_question (element) {
    const openViewQuest = 'faq__questions__item--is-open';
    const elementFather = element.target.parentNode;
    elementFather.classList.toggle(openViewQuest); // alterna true / false
  }

  function activateTab(tabValue) {
    // buttons
    buttons.forEach((button) =>
      button.classList.toggle("shows__tabs__button--is-active", button.dataset.tabButton === tabValue),
    );

    // lists
    lists.forEach((list) =>
      list.classList.toggle("shows__list--is-active", list.dataset.tabId === tabValue),
    );
  }

  // restore saved tab or default
  const saved = localStorage.getItem(STORAGE_KEY) || "em_breve";
  activateTab(saved);

  // attach handlers
  buttons.forEach((btn) => {
    btn.addEventListener("click", function (event) {
      const tabValue = btn.dataset.tabButton;
      if (!tabValue) return;
      // save
      localStorage.setItem(STORAGE_KEY, tabValue);
      // activate
      activateTab(tabValue);
    });
  });
});

// Captura o clique no botão
// Lê o valor de data-tab-button (ex: "populares")
// Remove shows__tabs__button--is-active de todos os buttons
// Adiciona a classe no button clicado
// Remove shows__list--is-active de todas as <ul>
// Adiciona a classe na <ul> que tem data-tab-id com o mesmo valor


