//Budget Controller
const budgetController = (function () {
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1, //ne postoji sa -1
  };

  return {
    addItem: function (type, des, val) {
      let ID;
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // data.allItems[type]-gleda da li je inc ili exp; [data.allItems[type].length - 1] - gleda duzinu niza ali posto niz krece da se broji od 0 onda ga racunamo sa -1; .id + 1 = treba nam samo id iz tog niza i na njega dodajemo 1 za sledeci id
      } else {
        ID = 0;
      }
      let newItem;
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      const ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      calculateTotal("exp");
      calculateTotal("inc");
      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      const allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// UI Controller
const UIController = (function () {
  const DOMstrings = {
    inputType: ".add-type",
    inputDescription: ".add-description",
    inputValue: ".add-value",
    inputBtn: ".btn-main",
    incomeContainer: ".income-list",
    expensesContainer: ".expenses-list",
    budgetLabel: ".budget-value",
    incomeLabel: ".budget-income--value",
    expensesLabel: ".budget-expenses--value",
    percentageLabel: ".budget-expenses--percent",
    container: "#list",
    expensesPercLabel: ".item--percentage",
    dateLabel: ".budget-title--month",
  };

  const formatNumber = function (num, type) {
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  const nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      let element, html;
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item" id="inc-%id%"><div class="item-description">%description%</div><div class="right"><div class="item-value">%value% Din.</div><div class="item-delete"><button class="btn-light"><i class="fas fa-trash-alt"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item" id="exp-%id%"><div class="item-description">%description%</div><div class="right"><div class="item-value">%value% Din.</div><div class="item--percentage">10%</div><div class="item-delete"><button class="btn-red"><i class="fas fa-trash-alt"></i></button></div></div></div>';
      }

      newHTML = html.replace("%id%", obj.id);
      newHTML = newHTML.replace("%description%", obj.description);
      newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
    },

    deleteListItem: function (selectorID) {
      const el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      const fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      const fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent =
        formatNumber(obj.budget, type) + " Din.";
      document.querySelector(DOMstrings.incomeLabel).textContent =
        formatNumber(obj.totalInc, "inc") + " Din.";
      document.querySelector(DOMstrings.expensesLabel).textContent =
        formatNumber(obj.totalExp, "exp") + " Din.";

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      const now = new Date();
      const months = [
        "Januar",
        "Februar",
        "Mart",
        "April",
        "Maj",
        "Jun",
        "Juli",
        "Avgust",
        "Septembar",
        "Oktobar",
        "Novembar",
        "Decembar",
      ];
      const month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function () {
      const fields = document.querySelectorAll(
        DOMstrings.inputType,
        +"," + DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

const controller = (function (budgetCtrl, UICtrl) {
  const setupEventListeners = function () {
    const DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  const updateBudget = function () {
    budgetCtrl.calculateBudget();

    const budget = budgetCtrl.getBudget();

    UICtrl.displayBudget(budget);
  };

  const updatePercentages = function () {
    budgetCtrl.calculatePercentages();
    const percentages = budgetCtrl.getPercentages();

    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = function () {
    const input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      const newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );

      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();

      updateBudget();

      updatePercentages();
    }
  };

  const ctrlDeleteItem = function (e) {
    const itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      const splitID = itemID.split("-");
      const type = splitID[0];
      const ID = parseFloat(splitID[1]);

      budgetCtrl.deleteItem(type, ID);

      UICtrl.deleteListItem(itemID);

      updateBudget();
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("App started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
