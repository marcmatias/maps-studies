const tooltip = document.querySelector(".tooltip");

const statesAcronym = {
  "11": {
    "acronym": "RO",
    "name": "Rondônia"
  },
  "12": {
    "acronym": "AC",
    "name": "Acre"
  },
  "13": {
    "acronym": "AM",
    "name": "Amazonas"
  },
  "14": {
    "acronym": "RR",
    "name": "Roraima"
  },
  "15": {
    "acronym": "PA",
    "name": "Pará"
  },
  "16": {
    "acronym": "AP",
    "name": "Amapá"
  },
  "17": {
    "acronym": "TO",
    "name": "Tocantins"
  },
  "21": {
    "acronym": "MA",
    "name": "Maranhão"
  },
  "22": {
    "acronym": "PI",
    "name": "Piauí"
  },
  "23": {
    "acronym": "CE",
    "name": "Ceará"
  },
  "24": {
    "acronym": "RN",
    "name": "Rio Grande do Norte"
  },
  "25": {
    "acronym": "PB",
    "name": "Paraíba"
  },
  "26": {
    "acronym": "PE",
    "name": "Pernambuco"
  },
  "27": {
    "acronym": "AL",
    "name": "Alagoas"
  },
  "28": {
    "acronym": "SE",
    "name": "Sergipe"
  },
  "29": {
    "acronym": "BA",
    "name": "Bahia"
  },
  "31": {
    "acronym": "MG",
    "name": "Minas Gerais"
  },
  "32": {
    "acronym": "ES",
    "name": "Espírito Santo"
  },
  "33": {
    "acronym": "RJ",
    "name": "Rio de Janeiro"
  },
  "35": {
    "acronym": "SP",
    "name": "São Paulo"
  },
  "41": {
    "acronym": "PR",
    "name": "Paraná"
  },
  "42": {
    "acronym": "SC",
    "name": "Santa Catarina"
  },
  "43": {
    "acronym": "RS",
    "name": "Rio Grande do Sul"
  },
  "50": {
    "acronym": "MS",
    "name": "Mato Grosso do Sul"
  },
  "51": {
    "acronym": "MT",
    "name": "Mato Grosso"
  },
  "52": {
    "acronym": "GO",
    "name": "Goiás"
  },
  "53": {
    "acronym": "DF",
    "name": "Distrito Federal"
  }
}

const colors = [
  '#e96f5f', '#1f419a', '#00b272', '#89c9d2', '#998675', '#662d91',
  '#f9da23', '#cc4080', '#aed83a', '#c97b2d'
];

const datasets = [
  {
    label: "PB",
    data: [
      1500,
      1000,
      100,
      400
    ]
  },
  {
    label: "CE",
    data: [
      1000,
      500,
      50,
      10
    ]
  },
  {
    label: "São Paulo",
    data: [
      500,
      null,
      10,
      0
    ]
  }
]

const xLabels = [2001, 2002, 2003];

async function loadMapData() {
  // Quering map
  const mapUrl =
    'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=image/svg+xml&qualidade=intermediaria&intrarregiao=UF';
  const svg = await fetch(mapUrl)
  mapText = await svg.text();

  const svgContainer = document.querySelector('#canvas');
  svgContainer.innerHTML = mapText;

  const svgElement = svgContainer.querySelector("svg");
  svgElement.style.maxWidth = "30%";
  svgElement.style.height = "30%";

  const maxDatasetValue = Math.max(...datasets.map(e => e.data).flat());

  // Button data
  for (let i = 0; i < datasets[0].data.length; i++) {
    let button = document.createElement("button");
    button.innerText = xLabels[i] ? xLabels[i] : "";
    button.dataset.row = i;
    button.addEventListener("click", () => {
      setData(maxDatasetValue, i);
    });

    svgContainer.insertBefore(button, svgElement);
  }

  // Default map values
  setData (maxDatasetValue, 0);
}

function setData(maxDatasetValue, row) {
  // Querying map country states setting eventListener
  for (const path of document.querySelectorAll('#canvas svg path')) {
    const content = statesAcronym[path.id];
    const dataset = findElement(datasets, content);

    if (!dataset || !dataset.data[row]) {
      path.style.opacity = "20%";
      path.style.fill = "gray";

      removeAllEventListeners(path);
      continue;
    }

    path.style.opacity = "100%";
    const defaultColor = hexToHSL(colors[row])
    path.style.fill = "hsl(60, " + Math.floor((dataset.data[row] / maxDatasetValue) * 100) + "%, 50%)";

    addEventListenerWithTracking(path, "mousemove", () => {
      tooltip.innerText = `Estado: ${content.name} \n Valor: ${dataset.data[row]}`;
      path.style.opacity = "95%";
      tooltip.style.display = "block";
      tooltip.style.left = event.clientX + 15 + window.scrollX + "px";
      tooltip.style.top = event.clientY + 20 + window.scrollY + "px";
    });

    addEventListenerWithTracking(path,"mouseleave", () => {
      tooltip.style.display = "none";
      path.style.opacity = "100%";
    });
  }
}

function findElement(arr, name) {
  for (let i = 0; i < arr.length; i++) {
    const object = arr[i];
    const labelLowerCase = object.label.toLowerCase();

    const nameAcronymLowerCase = name.acronym.toLowerCase();
    const nameNameLowerCase = name.name.toLowerCase();

    const labelWithoutSpaces = labelLowerCase.replaceAll(" ", "");

    if (labelLowerCase == nameAcronymLowerCase ||
      labelWithoutSpaces == nameNameLowerCase.replaceAll(" ", "")) {
      return object;
    }
  }

  return;
}

// armazena todos os event listeners adicionados ao elemento em uma lista
function addEventListenerWithTracking(element, eventType, listener, useCapture) {
  if (!element.eventListeners) {
    element.eventListeners = [];
  }
  element.eventListeners.push({eventType, listener, useCapture});
  element.addEventListener(eventType, listener, useCapture);
}

// remove todos os event listeners adicionados ao elemento
function removeAllEventListeners(element) {
  if (element.eventListeners) {
    element.eventListeners.forEach(function(eventListener) {
      element.removeEventListener(eventListener.eventType, eventListener.listener, eventListener.useCapture);
    });
    element.eventListeners = [];
  }
}

function hexToHSL(hex) {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }

  // Then convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;

  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return {h, s, l};
}

loadMapData();
