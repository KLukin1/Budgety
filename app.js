/*--------------------BUDGET-CONTROLLER--------------------*/
var budgetController = (function() {

    // Function constructors
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    
    return {
        addItem: function(type, descr, val) {
            var newItem;
            var ID = 0;
            
            // Create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on type (inc or exp)
            
            if (type === 'inc') {
                newItem = new Income(ID, descr, val);
            } else if (type === 'exp') {
                newItem = new Expense(ID, descr, val);
            }
            
            // Push new item into our data structure
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(type, id) {             //kaj se tu sve izdogadjalo?
            var ids, index; 
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
            
            // Calculate total income and expenses
            calculateTotal('inc');            
            calculateTotal('exp');            
            
            // Calculate the budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
           
        },
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function() {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          };  
        },
        
        testing: function() {
            console.log(data);
        }
    };

    
})();


/*--------------------UI-CONTROLLER--------------------*/
var UIController = (function() {
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
            
        num = Math.abs(num);
        
        // 2 decimal points
        num = num.toFixed(2);
        
        // comma separating the thousands
        numSplit = num.split('.');
            
        int = numSplit[0];
            
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        } 
        dec = numSplit[1];
        
        // + or - before number
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback) {
        
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
        
    return {
        getInput: function() {
            return {
                type: document.querySelector('.add__type').value,                 // inc or exp
                description: document.querySelector('.add__description').value,   // added item
                value: parseFloat(document.querySelector('.add__value').value)    // number (amount of money)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = '.income__list';
                html = '<div class="item clearfix" id="inc-%id%"><div  class="item__description">%description%</div><div class="go-right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = '.expenses__list';
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="go-right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace placeholder with some actual data
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert HTML into the DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArray;
            
            fields = document.querySelectorAll('.add__description' + ', ' + '.add__value');
            //querySelectorAll returns a List, so we need to convert it to array
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            // now that we have an array, we can clean all text fields
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
            document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + "%";
            } else {
                document.querySelector('.budget__expenses--percentage').textContent = ". . .";
            }
            
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll('.item__percentage');
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = ". . .";
                }
            });
            
        },
        
        displayDate: function() {
            var currentDate, year, month, allMonths;
            
            currentDate = new Date();
            year = currentDate.getFullYear();
            month = currentDate.getMonth();
            
            allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.querySelector('.budget__title--date').textContent = allMonths[month] + " " + year;
            
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll('.add__type' + ',' + '.add__description' + ',' + '.add__value');
            
            nodeListForEach(fields, function(current) {
                 current.classList.toggle('red-focus');
            });
            document.querySelector('.add__btn').classList.toggle('red');
        }
        
    };

})();

/*--------------------GLOBAL-CONTROLLER--------------------*/
var appController = (function(budgetCtrl, UICtrl) {
    
    var setUpEventListeners = function() {
        document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {

            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector('.whole').addEventListener('click', ctrlDeleteItem);
        
        document.querySelector('.add__type').addEventListener('change', UICtrl.changedType);

    };
    
    
    var updateBudget = function() {
        // Calculate the budget
        budgetCtrl.calculateBudget();
        
        // Return the budget
        var budget = budgetCtrl.getBudget();
        
        // Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        // Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // Update UI with new percentages
        UICtrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // Get the field input data
        input = UICtrl.getInput();
        
        // Check if it's not empty
        if (input.description !== "" && input.value > 0 && !isNaN(input.value)) {
            
            // Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)

            // Add item to the UI
            UICtrl.addListItem(newItem, input.type);

            // Clear text fields
            UICtrl.clearFields();

            // Calculate and update budget
            updateBudget();
            
            // Calculate and update percentages
            updatePercentages();
            
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // Delete the item from data structure
            budgetCtrl.deleteItem(type, ID);
            
            // Delete the item from UI
            UICtrl.deleteListItem(itemID);
            
            // Update the budget
            updateBudget();
            
            // Calculate and update percentages
            updatePercentages();
            
        }
            
    };
    
    
    return {
        init: function() {
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1});
            
            setUpEventListeners();
        }
};
    
    
})(budgetController, UIController);

appController.init();







