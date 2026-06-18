document.addEventListener("DOMContentLoaded", function () { // Aguarda DOM carregar antes de rodar script
  const buttons = document.querySelectorAll("[data-tab-button]"); // Secleciona botões com atributo data-tab-button="nome da aba"
  const lists = document.querySelectorAll("[data-tab-id]"); // Seleciona listas (conteúdos) das abas com atributo data-tab-id="nome da aba"
  const STORAGE_KEY = "showsActiveTab"; // chave utilizada em localStorage
  const questions = document.querySelectorAll('[data-faq-question]'); // Seleciona todas as perguntas FAQ

  questions.forEach((quest) => quest.addEventListener('click', open_close_question)); // adiciona evento click para abrir e fechar pergunta
  
  function open_close_question (element) { // função que alterna o estado da pergunta
    const openViewQuest = 'faq__questions__item--is-open'; // classe css que indica pergunta aberta (classe inserida = pergunta aberta)
    const elementFather = element.target.parentNode;  // seleciona o elemento pai da pergunta clicada
    elementFather.classList.toggle(openViewQuest); // alterna se a pergunta esta aberta ou fechada retornando true / false
  }

  function activateTab(tabValue) {
    buttons.forEach((button) =>  // para cada botão ativa ou desativa a classe
      button.classList.toggle("shows__tabs__button--is-active", button.dataset.tabButton === tabValue), // se o botão tem data-tab-button="tabValue" -> ativa
    );

    lists.forEach((list) => // repete a lógica anterior, pra o conteúdo da aba
      list.classList.toggle("shows__list--is-active", list.dataset.tabId === tabValue), 
    );
  }

  const saved = localStorage.getItem(STORAGE_KEY) || "em_breve"; // Se houver aba salva usa ela, senão usa "em_breve"
  activateTab(saved);

  // attach handlers
  buttons.forEach((btn) => { // para cada botão
    btn.addEventListener("click", function (event) { // ao clicar executa
      const tabValue = btn.dataset.tabButton; // obtém o valor da aba
      if (!tabValue) return; // previne erros se o botão não contém o atributo
      localStorage.setItem(STORAGE_KEY, tabValue); // salva em localStorage 
      activateTab(tabValue); // Ativa a aba clicada
    });
  });
});
