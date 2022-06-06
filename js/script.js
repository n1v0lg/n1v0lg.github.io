const isPreviewMode = true
const qualtrixUrlPreviewMode = 'https://wiwigoettingen.eu.qualtrics.com/jfe/preview/SV_egGiorwgqpcyPCm?Q_CHL=preview&Q_SurveyVersionID=current&SelectedItem='
const qualtrixUrl = 'https://wiwigoettingen.eu.qualtrics.com/jfe/form/SV_egGiorwgqpcyPCm?SelectedItem='

const option1Selector = "Option1"
const option2Selector = "Option2"

const choiceScenarioQueryParam = 'choiceScenario';

const locale = 'en';
const translations = {
    'en': {
        'dish-name': 'Mezze-sausage and onion skewers',
        'dish-description': 'with Greek pasta salad and tomato sauce',
        'meat': 'Meat',
        'veggie': 'Veggie',
        'sustainability-label': "Planet's pick",
        'taste-label': "Chef's pick",
        'veggie-sausage': 'with plant-based sausage',
        'meat-sausage': 'with pork sausage',
    },
    "de": {
        'dish-name': 'Spieße mit Mezze-Würstchen und Zwiebel',
        'dish-description': 'dazu griechischer Pastasalat und tomatige Sauße',
        'meat': 'Fleisch',
        'veggie': 'Veggie',
        'sustainability-label': "Gut fürs Klima",
        'taste-label': "Chef's pick",
        'veggie-sausage': 'mit pflanzlicher Bratwurst',
        'meat-sausage': 'mit Schweinebratwurst',
    },
};

const ChoiceScenario = {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
    E: 'E'
}

const Framing = {
    Taste: 'Taste',
    Sustainability: 'Sustainability',
    None: 'None'
}

const Type = {
    Veggie: 'Veggie',
    Meat: 'Meat'
}

const itemSelection = (function () {
    let selectedItem

    class Item {
        constructor(id) {
            this.id = id
        }
    }

    const saveSelectedItem = () => {
        sessionStorage.setItem('selectedItem', JSON.stringify(selectedItem))
    };

    const load = () => {
        selectedItem = JSON.parse(sessionStorage.getItem('selectedItem'))
    };

    if (sessionStorage.getItem("selectedItem") != null) {
        load()
    }

    const obj = {}

    obj.selectItem = id => {
        selectedItem = new Item(id)
        saveSelectedItem()
    }

    obj.selectedItem = () => selectedItem

    obj.storeChoiceScenarioProps = (props) => {
        sessionStorage.setItem('props', JSON.stringify(props))
    }

    obj.choiceScenarioProps = () => {
        return JSON.parse(sessionStorage.getItem('props'))
    }

    return obj
})()

$('.select-item').click(function (event) {
    event.preventDefault()
    const id = $(this).data('id')
    itemSelection.selectItem(id)
    displaySelected()
})

$('.checkout').click(function (event) {
    event.preventDefault()
    const targetUrl = getTargetUrl()
    const selectedItemId = itemSelection.selectedItem().id
    const win = window.open(targetUrl + toQualtrixParam(selectedItemId), '_self')
    win.focus()
})

const toQualtrixParam = (id) => {
    // TODO this will have to change if meat can come first
    switch (id) {
        case option1Selector:
            return "Veggie"
        case option2Selector:
            return "Meat"
        default:
            // TODO alert?
            console.log("Bad id", id)
            return ""
    }
}

const getTargetUrl = () => {
    if (isPreviewMode) {
        return qualtrixUrlPreviewMode
    } else {
        return qualtrixUrl
    }
}

// TODO hack hack hack
const getCardId = id => 'Card' + id

const displaySelected = () => {
    const displaySelectedButton = id => {
        const buttons = document.querySelectorAll('.select-item')
        for (const button of buttons) {
            let jButton = $(button)
            if (jButton.data('id') === id) {
                jButton.html("Selected")
                jButton.removeClass("btn-secondary").addClass("btn-success")
            } else {
                jButton.html("Select")
                jButton.removeClass("btn-success").addClass("btn-secondary")
            }
        }
    }

    const displaySelectedCard = id => {
        const cards = document.querySelectorAll('.select-card')
        for (const card of cards) {
            let jCard = $(card)
            if (jCard.data('id') === getCardId(id)) {
                jCard.removeClass("border-light").addClass("border-success")
            } else {
                jCard.removeClass("border-success").addClass("border-light")
            }
        }
    }

    let selectedItemId = itemSelection.selectedItem().id
    displaySelectedButton(selectedItemId)
    displaySelectedCard(selectedItemId)
}

const displayOptions = (props) => {
    const displayOption = (id, type, framing) => {
        const card = document.querySelector('[data-id=' + getCardId(id) + ']')
        const label = card.querySelector('[data-id=label]')
        $(label).html(typeHtml(type) + ' ' + framingHtml(framing))
        const description = card.querySelector('[data-id=description]')
        $(description).html(descriptionHtml(type))
    }

    const typeHtml = (type) => {
        if (type === Type.Veggie) {
            return translations[locale]["veggie"]
        } else if (type === Type.Meat) {
            return translations[locale]["meat"]
        }
    }

    const descriptionHtml = (type) => {
        // TODO fix translations
        if (type === Type.Veggie) {
            return translations[locale]["veggie-sausage"]
        } else if (type === Type.Meat) {
            return translations[locale]["meat-sausage"]
        }
    }

    const framingHtml = (framing) => {
        // TODO fix translations
        switch (framing) {
            case Framing.Taste:
                return "<span class='badge badge-info'>" + translations[locale]["taste-label"] + "</span>"
            case Framing.Sustainability:
                return "<span class='badge badge-info'>" + translations[locale]["sustainability-label"] + "</span>"
            default:
                return ''
        }
    }

    const option1 = props[option1Selector]
    displayOption(option1Selector, option1.type, option1.framing)
    const option2 = props[option2Selector]
    displayOption(option2Selector, option2.type, option2.framing)
}

const noDefaultNoFraming = () => {
    const props = {}
    props[option1Selector] = {
        type: Type.Veggie,
        framing: Framing.None
    }
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    }
    props["selected"] = null
    return props
};

const veggieDefaultTasteFraming = () => {
    const props = {}
    props[option1Selector] = {
        type: Type.Veggie,
        framing: Framing.Taste
    }
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    }
    props["selected"] = option1Selector
    return props
};

const veggieDefaultSustainabilityFraming = () => {
    const props = {}
    props[option1Selector] = {
        type: Type.Veggie,
        framing: Framing.Sustainability
    }
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    }
    props["selected"] = option1Selector
    return props
};

const noDefaultTasteFraming = () => {
    const props = {}
    props[option1Selector] = {
        type: Type.Veggie,
        framing: Framing.Taste
    }
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    }
    props["selected"] = null
    return props
};

const noDefaultSustainabilityFraming = () => {
    const props = {}
    props[option1Selector] = {
        type: Type.Veggie,
        framing: Framing.Sustainability
    }
    props[option2Selector] = {
        type: Type.Meat,
        framing: Framing.None
    }
    props["selected"] = null
    return props
};

const setPropsForChoiceScenario = (choiceScenario) => {
    switch (choiceScenario) {
        case ChoiceScenario.A:
            return noDefaultNoFraming()
        case ChoiceScenario.B:
            return veggieDefaultTasteFraming()
        case ChoiceScenario.C:
            return veggieDefaultSustainabilityFraming()
        case ChoiceScenario.D:
            return noDefaultTasteFraming()
        case ChoiceScenario.E:
            return noDefaultSustainabilityFraming()
        default:
            console.log("Unknown choice scenario")
            return noDefaultNoFraming()
    }
}

const getParameterByName = (name, url = window.location.href) => {
    name = name.replace(/[\[\]]/g, '\\$&')
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

const localize = () => {
    document
        .querySelectorAll("[data-i18n-key]")
        .forEach(localizeElement);
}

const localizeElement = element => {
    const key = element.getAttribute("data-i18n-key");
    element.innerText = translations[locale][key];
};

choiceScenario = getParameterByName(choiceScenarioQueryParam)
const props = setPropsForChoiceScenario(choiceScenario)
itemSelection.storeChoiceScenarioProps(props)
document.addEventListener("DOMContentLoaded", () => {
    // TODO empty/unknown choice scenario
    displayOptions(props)
    if (props.selected !== null) {
        itemSelection.selectItem(props.selected)
    }
    // TODO fix me
    try {
        displaySelected();
    } catch (error) {
        console.error(error);
    }
    localize()
});

