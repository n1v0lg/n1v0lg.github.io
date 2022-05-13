const isPreviewMode = true;
const qualtrixUrlPreviewMode = 'https://wiwigoettingen.eu.qualtrics.com/jfe/preview/SV_egGiorwgqpcyPCm?Q_CHL=preview&Q_SurveyVersionID=current&SelectedItem=';
const qualtrixUrl = 'https://wiwigoettingen.eu.qualtrics.com/jfe/form/SV_egGiorwgqpcyPCm?SelectedItem=';

// Selection is dynamic
const option1Selector = "Option1"
const option2Selector = "Option2"

const Framing = {
    Taste: 'Taste',
    Sustainability: 'Sustainability',
    // TODO
    None: 'None'
};

const Type = {
    Plant: 'Plant',
    Meat: 'Meat'
};

const initialSelected = option1Selector;
const props = {};
props[option1Selector] = {
    type: Type.Plant,
    framing: Framing.Taste
};
props[option2Selector] = {
    type: Type.Meat,
    framing: Framing.None
};

const menuSelection = (function () {
    let selectedItem = new Item(initialSelected, "Wurst1");

    function Item(id, name) {
        this.id = id;
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

    obj.selectItem = function (id, name) {
        selectedItem = new Item(id, name);
        saveSelectedItem();
    }

    obj.selectedItem = function () {
        return selectedItem;
    }

    return obj;
})();

$('.select-item').click(function (event) {
    event.preventDefault();
    const id = $(this).data('id');
    const name = $(this).data('name');
    menuSelection.selectItem(id, name);
    displaySelected();
});

// TODO fix me
$('.checkout').click(function (event) {
    event.preventDefault();
    const targetUrl = getTargetUrl();
    const selectedItemName = menuSelection.selectedItem().name;
    const win = window.open(targetUrl + selectedItemName, '_self');
    win.focus();
});

const getTargetUrl = () => {
    if (isPreviewMode) {
        return qualtrixUrlPreviewMode;
    } else {
        return qualtrixUrl;
    }
}

function getCardId(id) {
    return 'Card' + id;
}

const displaySelected = () => {
    const displaySelectedButton = id => {
        const buttons = document.querySelectorAll('.select-item');
        for (const button of buttons) {
            let jButton = $(button);
            if (jButton.data('id') === id) {
                jButton.html("Selected");
                jButton.removeClass("btn-secondary").addClass("btn-success");
            } else {
                jButton.html("Select");
                jButton.removeClass("btn-success").addClass("btn-secondary");
            }
        }
    };

    const displaySelectedCard = id => {
        const cards = document.querySelectorAll('.select-card');
        const cardId = getCardId(id);
        for (const card of cards) {
            let jCard = $(card);
            if (jCard.data('id') === cardId) {
                jCard.removeClass("border-light").addClass("border-success");
            } else {
                jCard.removeClass("border-success").addClass("border-light");
            }
        }
    };

    let selectedItemId = menuSelection.selectedItem().id;
    displaySelectedButton(selectedItemId);
    displaySelectedCard(selectedItemId);
};

const displayOption = (id, type, framing) => {
    // TODO hack hack hack
    const card = document.querySelector('[data-id=' + getCardId(id) + ']');
    console.log(card)
};

const prop = props[option1Selector]
displayOption(option1Selector, prop.type, prop.framing);
displaySelected()
