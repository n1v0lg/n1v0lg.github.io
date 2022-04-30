const menuSelection = (function () {
    let selectedItem = new Item("Wurst 1");

    function Item(name) {
        this.name = name;
    }

    function saveSelectedItem() {
        sessionStorage.setItem('selectedItem', JSON.stringify(selectedItem));
    }

    function load() {
        selectedItem = JSON.parse(sessionStorage.getItem('selectedItem'));
    }

    if (sessionStorage.getItem("selectedItem") != null) {
        load();
    }

    const obj = {};

    obj.selectItem = function (name) {
        selectedItem = new Item(name);
        saveSelectedItem();
    }

    obj.selectedItem = function () {
        return selectedItem;
    }

    return obj;
})();

$('.select-item').click(function (event) {
    event.preventDefault();
    const name = $(this).data('name');
    menuSelection.selectItem(name);
    displaySelected();
});

const displaySelected = () => {
    const displaySelectedButton = name => {
        const buttons = document.querySelectorAll('.select-item');
        for (const button of buttons) {
            let jButton = $(button);
            if (jButton.data('name') === name) {
                jButton.html("Selected");
                jButton.removeClass("btn-warning").addClass("btn-success");
            } else {
                jButton.html("Select");
                jButton.removeClass("btn-success").addClass("btn-secondary");
            }
        }
    };

    const displaySelectedCard = name => {
        // TODO select sub items?
        const cards = document.querySelectorAll('.select-card');
        for (const card of cards) {
            let jCard = $(card);
            if (jCard.data('name') === name) {
                jCard.addClass("border-success");
            } else {
                jCard.removeClass("border-success");
            }
        }
    };

    let selectedItemName = menuSelection.selectedItem().name;
    displaySelectedButton(selectedItemName);
    displaySelectedCard(selectedItemName);
};

displaySelected()