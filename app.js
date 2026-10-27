const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const bookingModal = $("#booking-modal");
const detailsModal = $("#details-modal");
const bookingService = $('#booking-form select[name="service"]');
const toast = $(".toast");
$$("svg").forEach((icon) => icon.setAttribute("aria-hidden", "true"));
let activeModal = null;
let returnFocus = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 5500);
}

function showModal(modal, trigger = document.activeElement) {
  const origin = activeModal ? returnFocus : trigger;
  if (activeModal) closeModal(false);
  returnFocus = origin;
  activeModal = modal;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  $$(".site-header, main, .footer").forEach((element) => {
    element.inert = true;
  });
  requestAnimationFrame(() => $("input, .modal-close", modal)?.focus());
}

function closeModal(restoreFocus = true) {
  if (!activeModal) return;
  activeModal.classList.remove("open");
  activeModal.setAttribute("aria-hidden", "true");
  activeModal = null;
  document.body.classList.remove("modal-open");
  $$(".site-header, main, .footer").forEach((element) => {
    element.inert = false;
  });
  if (restoreFocus) returnFocus?.focus();
}

function openBooking(trigger) {
  const service = trigger?.dataset.serviceName;
  if (service) {
    let option = [...bookingService.options].find(
      (item) => item.textContent === service,
    );
    if (!option) {
      option = new Option(service, service);
      bookingService.add(option);
    }
    bookingService.value = option.value;
  }
  const doctor = trigger?.dataset.doctor;
  $("#booking-title").textContent = doctor
    ? `Приём · ${doctor}`
    : "Записать питомца на приём";
  showModal(bookingModal, trigger);
}

$$(".open-booking").forEach((button) => {
  if (button.dataset.doctor) {
    button.classList.remove("open-booking");
    button.addEventListener("click", () =>
      openDoctor(button.closest(".doctor-card"), button),
    );
  } else {
    button.addEventListener("click", () => openBooking(button));
  }
});
$$("[data-close]").forEach((button) =>
  button.addEventListener("click", () => closeModal()),
);
document.addEventListener("keydown", (event) => {
  if (!activeModal) return;
  if (event.key === "Escape") closeModal();
  if (event.key === "Tab") {
    const focusable = $$(
      'button, a[href], input, select, textarea, [tabindex="0"]',
      activeModal,
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

function setDefaultDate() {
  const dateInput = $('#booking-form input[type="date"]');
  const today = new Date();
  const dateString = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  dateInput.min = dateString(today);
  today.setDate(today.getDate() + 1);
  dateInput.value = dateString(today);
}
setDefaultDate();

$$("form").forEach((form) => {
  const note = document.createElement("p");
  note.className = "form-note";
  note.textContent = "Демонстрационная форма. Данные не отправляются.";
  form.append(note);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    closeModal();
    form.reset();
    setDefaultDate();
    showToast("Это демонстрационный проект. Заявка не отправлена.");
  });
});
$$('input[name="phone"]').forEach((input) => {
  input.type = "tel";
  input.autocomplete = "tel";
  input.addEventListener("input", () => {
    const digits = input.value.replace(/\D/g, "");
    input.setCustomValidity(
      digits.length && digits.length < 10
        ? "Введите номер телефона полностью"
        : "",
    );
  });
});
$$('input[name="name"]').forEach((input) => {
  input.autocomplete = "name";
});

$$(".faq-item").forEach((item, index) => {
  const button = $("button", item);
  const answer = $("div", item);
  answer.id = `faq-answer-${index}`;
  button.setAttribute("aria-controls", answer.id);
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () => {
    const open = item.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    $("b", button).textContent = open ? "−" : "+";
  });
});

$$(".tab").forEach((tab) => {
  tab.setAttribute("aria-pressed", String(tab.classList.contains("active")));
  tab.addEventListener("click", () => {
    $$(".tab").forEach((item) => {
      item.classList.toggle("active", item === tab);
      item.setAttribute("aria-pressed", String(item === tab));
    });
    $$(".service-card").forEach((card) => {
      card.hidden =
        tab.dataset.filter !== "all" &&
        card.dataset.category !== tab.dataset.filter;
    });
  });
});
$$(".service-card").forEach((card) => {
  $("button", card).setAttribute(
    "aria-label",
    `${$("h3", card).textContent}: подробнее и запись`,
  );
});

$$(".choice, .chip").forEach((button) => {
  button.setAttribute(
    "aria-pressed",
    String(button.classList.contains("active")),
  );
  button.addEventListener("click", () => {
    const selector = button.classList.contains("choice") ? ".choice" : ".chip";
    $$(selector).forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
  });
});
const recommendations = {
  "Первичный осмотр": {
    price: "от 1 500 ₽",
    copy: "Познакомимся с питомцем, оценим его здоровье и ответим на ваши вопросы.",
  },
  Вакцинация: {
    price: "от 1 200 ₽",
    copy: "Проверим состояние здоровья и подберём вакцинацию с учётом возраста и образа жизни.",
  },
  Диагностика: {
    price: "от 2 500 ₽",
    copy: "Начнём с осмотра. Врач определит, какие обследования помогут найти причину недомогания.",
  },
  Стоматология: {
    price: "от 2 000 ₽",
    copy: "Проверим здоровье зубов и дёсен и подберём бережный уход за полостью рта.",
  },
};
$(".quiz-submit").addEventListener("click", () => {
  const service = $(".chip.active").dataset.service;
  const recommendation = recommendations[service];
  $("[data-rec-title]").textContent = service;
  $("[data-rec-copy]").textContent = recommendation.copy;
  $("[data-rec-price]").textContent = recommendation.price;
  $(".recommendation-book").dataset.serviceName = service;
  $(".recommendation").classList.remove("pulse");
  requestAnimationFrame(() => $(".recommendation").classList.add("pulse"));
  setTimeout(() => $(".recommendation").classList.remove("pulse"), 600);
  if (window.matchMedia("(max-width:760px)").matches)
    $(".recommendation").scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
});

$(".menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const open = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  $(".nav").classList.toggle("open", open);
});
$$(".nav a").forEach((link) =>
  link.addEventListener("click", () => {
    $(".nav").classList.remove("open");
    $(".menu-toggle").setAttribute("aria-expanded", "false");
    $(".menu-toggle").setAttribute("aria-label", "Открыть меню");
  }),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    $(".nav").classList.remove("open");
    $(".menu-toggle").setAttribute("aria-expanded", "false");
    $(".menu-toggle").setAttribute("aria-label", "Открыть меню");
  }
});
$$(".logo").forEach((link) =>
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }),
);

function showDetails(title, label, nodes, trigger) {
  $("#details-title").textContent = title;
  $("#details-label").textContent = label;
  $("#details-copy").replaceChildren(...nodes);
  showModal(detailsModal, trigger);
}
function makeBookingButton(service, doctor) {
  const button = document.createElement("button");
  button.className = "btn btn-primary";
  button.textContent = "Записать питомца ↗";
  if (service) button.dataset.serviceName = service;
  if (doctor) button.dataset.doctor = doctor;
  button.addEventListener("click", () => openBooking(button));
  return button;
}
function openDoctor(card, trigger) {
  const name = $("h3", card).textContent;
  const paragraphs = $$("p", card).map((element) => element.cloneNode(true));
  const button = makeBookingButton(null, name);
  showDetails(
    name,
    $("em", card).textContent,
    [...paragraphs, button],
    trigger,
  );
}
$(".show-doctors").addEventListener("click", (event) => {
  const originalTrigger = event.currentTarget;
  const nodes = $$(".doctor-card").map((card) => {
    const button = document.createElement("button");
    button.className = "team-choice";
    const image = document.createElement("img");
    image.src = getComputedStyle(
      $(".doctor-photo", card),
    ).backgroundImage.slice(5, -2);
    image.alt = "";
    const label = document.createElement("span");
    label.textContent = `${$("h3", card).textContent} · ${$("em", card).textContent}`;
    button.append(image, label);
    button.addEventListener("click", () => openDoctor(card, originalTrigger));
    return button;
  });
  showDetails(
    "Знакомьтесь, ваша команда",
    "Врачи Зоовет",
    nodes,
    originalTrigger,
  );
});
$$(".doctor-photo").forEach((photo) => {
  photo.setAttribute("role", "img");
  photo.setAttribute(
    "aria-label",
    $("h3", photo.closest(".doctor-card")).textContent,
  );
});
$$(".case-more").forEach((button) =>
  button.addEventListener("click", () => {
    const card = button.closest(".case-card");
    const image = document.createElement("img");
    image.className = "detail-photo";
    image.src = getComputedStyle($(".case-photo", card)).backgroundImage.slice(
      5,
      -2,
    );
    image.alt = $("h3", card).textContent;
    const paragraphs = $$("p", card).map((element) => element.cloneNode(true));
    showDetails(
      button.dataset.case,
      "История пациента",
      [image, ...paragraphs, makeBookingButton("Первичный осмотр")],
      button,
    );
  }),
);
$$(".reviewer").forEach((reviewer) => {
  $(".avatar", reviewer).textContent = $("b", reviewer)
    .textContent.split(" ")
    .map((word) => word[0])
    .join("");
});
$$(".text-link span").forEach((arrow) => {
  arrow.textContent = "↗";
});
$$(".footer-bottom a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const paragraph = document.createElement("p");
    paragraph.textContent =
      "Зоовет — демонстрационный проект SHERER. Сведения о клинике, специалистах и услугах представлены для демонстрации сайта. Данные из форм не сохраняются и не передаются. Для просмотра сайта не требуется вводить персональные данные.";
    showDetails(
      link.textContent,
      "О демонстрационном проекте",
      [paragraph],
      link,
    );
  });
});
$(".nav").id = "primary-navigation";
$(".menu-toggle").setAttribute("aria-controls", "primary-navigation");

const mapLink = document.createElement("a");
mapLink.className = "map-link";
mapLink.href =
  "https://yandex.ru/maps/?text=" +
  encodeURIComponent("Москва, Большой Саввинский переулок, 9");
mapLink.target = "_blank";
mapLink.rel = "noopener noreferrer";
mapLink.setAttribute(
  "aria-label",
  "Большой Саввинский переулок, 9 — открыть в Яндекс Картах",
);
const mapLabel = document.createElement("span");
mapLabel.textContent = "Открыть на карте ↗";
mapLink.append(mapLabel);
$(".map").append(mapLink);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.07 },
  );
  $$(
    ".section-heading, .feature-grid, .doctor-grid, .service-grid, .case-grid, .steps, .price-grid, .review-grid",
  ).forEach((element) => revealObserver.observe(element));
  const navObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting)
          $$(".nav a").forEach((link) =>
            link.classList.toggle(
              "active",
              link.hash === `#${entry.target.id}`,
            ),
          );
      }),
    { rootMargin: "-15% 0px -65% 0px" },
  );
  $$(".section[id]").forEach((element) => navObserver.observe(element));
}
window.addEventListener(
  "scroll",
  () => $(".site-header").classList.toggle("scrolled", scrollY > 20),
  { passive: true },
);
