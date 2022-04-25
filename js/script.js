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

function displaySelected() {
    let selectedItemName = menuSelection.selectedItem().name;
    const buttons = document.querySelectorAll('.select-item');
    for (const button of buttons) {
        let jButton = $(button);
        if (jButton.data('name') === selectedItemName) {
            jButton.html("Selected");
            jButton.removeClass("btn-warning").addClass("btn-success");
        } else {
            jButton.html("Select");
            jButton.removeClass("btn-success").addClass("btn-warning");
        }
    }
}

displaySelected()