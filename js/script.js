const isPreviewMode = true;
const qualtrixUrlPreviewMode = 'https://wiwigoettingen.eu.qualtrics.com/jfe/preview/SV_egGiorwgqpcyPCm?Q_CHL=preview&Q_SurveyVersionID=current&SelectedItem=';
const qualtrixUrl = 'https://wiwigoettingen.eu.qualtrics.com/jfe/form/SV_egGiorwgqpcyPCm?SelectedItem=';

const option1Selector = "Option1"
const option2Selector = "Option2"

const ChoiceScenario = {
    A: 'A',
    B: 'B',
    C: 'C'
}

const Framing = {
    Taste: 'Taste',
    Sustainability: 'Sustainability',
    None: 'None'
};

const Type = {
    Plant: 'Plant',
    Meat: 'Meat'
};

const itemSelection = (function () {
    let selectedItem;

    class Item {
        constructor(id) {
            this.id = id;
        }
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

    obj.selectItem = id => {
        selectedItem = new Item(id);
        saveSelectedItem();
    }

    obj.selectedItem = () => selectedItem

    obj.storeChoiceScenarioProps = (props) => {
        sessionStorage.setItem('props', JSON.stringify(props));
    }

    obj.choiceScenarioProps = () => {
        return JSON.parse(sessionStorage.getItem('props'))
    }

    return obj;
})();

$('.select-item').click(function (event) {
    event.preventDefault();
    const id = $(this).data('id');
    itemSelection.selectItem(id);
    displaySelected();
});

$('.checkout').click(function (event) {
    event.preventDefault();
    const targetUrl = getTargetUrl();
    const selectedItemId = itemSelection.selectedItem().id;
    const win = window.open(targetUrl + selectedItemId, '_self');
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
        for (const card of cards) {
            let jCard = $(card);
            if (jCard.data('id') === getCardId(id)) {
                jCard.removeClass("border-light").addClass("border-success");
            } else {
                jCard.removeClass("border-success").addClass("border-light");
            }
        }
    };

    let selectedItemId = itemSelection.selectedItem().id;
    displaySelectedButton(selectedItemId);
    displaySelectedCard(selectedItemId);
};

const displayOptions = (props) => {
    const displayOption = (id, type, framing) => {
        const card = document.querySelector('[data-id=' + getCardId(id) + ']');
        const label = card.querySelector('[data-id=label]');
        $(label).html(typeHtml(type) + ' ' + framingHtml(framing));
        const description = card.querySelector('[data-id=description]');
        $(description).html(descriptionHtml(type));
    };

    const typeHtml = (type) => {
        if (type === Type.Plant) {
            return 'Veggie'
        } else if (type === Type.Meat) {
            return 'Fleisch'
        }
    }

    const descriptionHtml = (type) => {
        if (type === Type.Plant) {
            return 'mit pflanzlicher Bratwurst'
        } else if (type === Type.Meat) {
            return 'mit Schweinebratwurst'
        }
    }

    const framingHtml = (framing) => {
        switch (framing) {
            case Framing.Taste:
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

function noDefaultNoFraming() {
    const props = {};
    props[option1Selector] = {
        type: Type.Plant,
        framing: Framing.None
    };
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    };
    props["selected"] = null;
    return props;
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
    props["selected"] = option1Selector;
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
    props["selected"] = option1Selector;
    return props;
}

const setPropsForChoiceScenario = (choiceScenario) => {
    switch (choiceScenario) {
        case ChoiceScenario.A:
            return noDefaultNoFraming();
        case ChoiceScenario.B:
            return plantDefaultTasteFraming();
        case ChoiceScenario.C:
            return plantDefaultSustainabilityFraming();
    }
};

const getParameterByName = (name, url = window.location.href) => {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

choiceScenario = getParameterByName('choiceScenario')
// TODO empty/unknown choice scenario
let props = setPropsForChoiceScenario(choiceScenario);
itemSelection.storeChoiceScenarioProps(props);
displayOptions(props)
if (props.selected !== null) {
    itemSelection.selectItem(props.selected);
}
displaySelected()
