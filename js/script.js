const isPreviewMode = true;
const qualtrixUrlPreviewMode = 'https://wiwigoettingen.eu.qualtrics.com/jfe/preview/SV_egGiorwgqpcyPCm?Q_CHL=preview&Q_SurveyVersionID=current&SelectedItem=';
const qualtrixUrl = 'https://wiwigoettingen.eu.qualtrics.com/jfe/form/SV_egGiorwgqpcyPCm?SelectedItem=';

const option1Selector = "Option1"
const option2Selector = "Option2"

const ChoiceScenario = {
    A: 'A',
    B: 'B'
}

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

const menuSelection = (function () {
    let selectedItem;

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

// TODO hack hack hack
const getCardId = id => 'Card' + id;

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

const displayOptions = (props) => {
    const displayOption = (id, type, framing) => {
        const card = document.querySelector('[data-id=' + getCardId(id) + ']');
        const labelText = card.querySelector('[data-id=label]');
        $(labelText).html(displayType(type) + ' ' + displayFraming(framing));
    };

    const displayType = (type) => {
        switch (type) {
            case Type.Plant:
                return 'Veggie'
            case Type.Meat:
                return 'Fleisch'
        }
    }

    const displayFraming = (framing) => {
        switch (framing) {
            case Framing.Taste:
                // TODO hack hack hack
                return "<span class='badge badge-info'>Chef's pick</span>"
            case Framing.Sustainability:
                return "<span class='badge badge-info'>Planet's pick</span>"
            default:
                return ''
        }
    }

    const option1 = props[option1Selector]
    displayOption(option1Selector, option1.type, option1.framing);
    const option2 = props[option2Selector]
    displayOption(option2Selector, option2.type, option2.framing);
}

function plantDefaultTasteFraming() {
    const props = {};
    props[option1Selector] = {
        type: Type.Plant,
        framing: Framing.Taste
    };
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    };
    return props;
}

function plantDefaultSustainabilityFraming() {
    const props = {};
    props[option1Selector] = {
        type: Type.Plant,
        framing: Framing.Sustainability
    };
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    };
    return props;
}

const setPropsFromChoiceScenario = (choiceScenario) => {
    switch (choiceScenario) {
        case ChoiceScenario.A:
            return plantDefaultTasteFraming();
        case ChoiceScenario.B:
            return plantDefaultSustainabilityFraming();
    }
};

displayOptions(setPropsFromChoiceScenario(ChoiceScenario.A))
menuSelection.selectItem(option1Selector);
displaySelected()
