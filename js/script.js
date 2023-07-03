const isPreviewMode = true
const qualtrixBaseUrlPreviewMode = 'https://wiwigoettingen.eu.qualtrics.com/jfe/preview/'
const qualtrixBaseUrl = 'https://wiwigoettingen.eu.qualtrics.com/jfe/form/'

const option1Selector = "option1"
const option2Selector = "option2"

const choiceScenarioQueryParam = 'choiceScenario';
const consentNonceQueryParam = 'consentNonce';
const consentSessionIdQueryParam = 'consentSessionID';
const surveyIdQueryParam = 'surveyID';

const locale = 'en';
const translations = {
    'en': {
        'veggie': 'Plant-based nuggets',
        'tofu': 'Tofu nuggets',
        'meat': 'Chicken nuggets',
        'veggie-description': 'made with soy',
        'tofu-description': 'made with soy',
        'meat-description': 'made with chicken',
        'select': "Select",
        'selected': "Selected",
        'complete-checkout': "Complete checkout",
        'cancel': "Cancel",
        'your-current-order': "Your current order: ",
        'please-select-item': "Please select an item first.",
        'tasty-framing': "The tastier choice!",
        'natural-framing': "The natural choice!",
    }
};

const ChoiceScenario = {
    A: 'A',
    B: 'B',
    C: 'C'
}

const idToChoiceScenario = (choiceScenarioId) => {
    // TODO change these
    switch (choiceScenarioId) {
        case "a":
            return ChoiceScenario.A
        case "b":
            return ChoiceScenario.B
        case "c":
            return ChoiceScenario.C
        default:
            const errorMessage = "Technical issue with survey: unknown choice scenario ID [" + choiceScenarioId + "].";
            window.alert(errorMessage)
            throw errorMessage;
    }
}

const Framing = {
    Tasty: 'Tasty',
    Natural: 'Natural',
    None: 'None'
}

const Type = {
    Veggie: 'Veggie',
    Tofu: 'Tofu',
    Meat: 'Meat'
}

const itemSelection = (function () {
    let selectedItem
    let changeCount = 0

    class Item {
        constructor(id) {
            this.id = id
        }
    }

    const saveSelectedItem = () => {
        sessionStorage.setItem('selectedItem', JSON.stringify(selectedItem))
    };

    const saveChangeCount = () => {
        sessionStorage.setItem('changeCount', JSON.stringify(changeCount))
    };

    const loadSelectedItem = () => {
        selectedItem = JSON.parse(sessionStorage.getItem('selectedItem'))
    };

    const loadChangeCount = () => {
        changeCount = JSON.parse(sessionStorage.getItem("changeCount"))
    }

    if (sessionStorage.getItem("selectedItem") != null) {
        loadSelectedItem()
    }

    if (sessionStorage.getItem("changeCount") != null) {
        loadChangeCount()
    }

    const obj = {}

    obj.selectItem = id => {
        selectedItem = new Item(id)
        saveSelectedItem()
    }

    obj.incrementChangeCount = () => {
        changeCount++
        saveChangeCount()
    }

    obj.storeChoiceScenarioProps = (props) => {
        sessionStorage.setItem('props', JSON.stringify(props))
    }

    obj.selectedItem = () => selectedItem

    obj.changeCount = () => changeCount

    obj.choiceScenarioProps = () => {
        return JSON.parse(sessionStorage.getItem('props'))
    }

    return obj
})()

$('.select-item').click(function (event) {
    event.preventDefault()
    const id = $(this).data('id')
    // TODO double-check this
    if (!itemSelection.selectedItem() || itemSelection.selectedItem().id !== id) {
        itemSelection.incrementChangeCount()
    }
    itemSelection.selectItem(id)
    displaySelected()
})

const toQualtrixUrl = (surveyId, selectedType, choiceScenario, consentSessionId, choiceChangeCount) =>
    getTargetUrl()
    + surveyId
    + "?"
    + toQualtrixParam(selectedType)
    + "&ChoiceScenario=" + choiceScenario
    + "&ConsentSessionID=" + consentSessionId
    + "&Count=" + choiceChangeCount;

const isValidConsentNonce = () => getParameterByName(consentNonceQueryParam) === "29aeb38449e442c28e052d5efeb34c31";

const toLocTag = (type) => {
    switch (type) {
        case Type.Veggie:
            return "veggie"
        case Type.Tofu:
            return "tofu"
        case Type.Meat:
            return "meat"
    }
}

const displaySelectedOnCheckoutModal = (props) => {
    const modal = document.querySelector('[data-id=confirm-item-modal]')
    const description = modal.querySelector('[data-id=selected-item-text]')
    const selectedType = getSelectedType(itemSelection.selectedItem().id, props)
    const selectedTypeLocTag = toLocTag(selectedType)
    $(description).html(loc(selectedTypeLocTag))
}

$('.checkout').click(function (event) {
    event.preventDefault()
    try {
        if (!itemSelection.selectedItem()) {
            $('#please-select-item-modal').modal('show');
        } else {
            $('#confirm-item-modal').modal('show');
            // TODO double-check no race condition with modal being shown
            displaySelectedOnCheckoutModal(props)
        }
    } catch (e) {
        const errorMessage = "Technical issue with survey: failed to submit result"
        console.error(errorMessage, e)
        window.alert(errorMessage)
    }
})

$('.confirm').click(function (event) {
    event.preventDefault()
    try {
        if (!isValidConsentNonce()) {
            window.alert("Consent nonce required to submit choice.")
            return;
        }
        const currentProps = itemSelection.choiceScenarioProps();
        const choiceScenario = currentProps["choiceScenario"]
        if (choiceScenario !== ChoiceScenario.A && choiceScenario !== ChoiceScenario.B && choiceScenario !== ChoiceScenario.C) {
            window.alert("Invalid choice scenario [" + choiceScenario + "]")
            return;
        }
        const selectedType = getSelectedType(itemSelection.selectedItem().id, currentProps)
        const consentSessionId = getParameterByName(consentSessionIdQueryParam)
        const surveyId = currentProps["surveyId"]
        const win = window.open(
            toQualtrixUrl(
                surveyId,
                selectedType,
                choiceScenario,
                consentSessionId,
                itemSelection.changeCount()
            ),
            '_self'
        )
        win.focus()
    } catch (e) {
        const errorMessage = "Technical issue with survey: failed to submit result"
        console.error(errorMessage, e)
        window.alert(errorMessage)
    }
})

const getSelectedType = (id, props) => {
    return props[id].type
}

const toQualtrixParam = (type) => {
    // TODO finalize once types are there
    switch (type) {
        case Type.Veggie:
            return "SelectedItem=Veggie"
        case Type.Tofu:
            return "SelectedItem=Veggie"
        case Type.Meat:
            return "SelectedItem=Meat"
        // TODO this is an error
        default:
            return ""
    }
}

const getTargetUrl = () => {
    if (isPreviewMode) {
        return qualtrixBaseUrlPreviewMode
    } else {
        return qualtrixBaseUrl
    }
}

// TODO hack hack hack
const getCardId = id => 'card-' + id

const displaySelected = () => {
    const displaySelectedButton = id => {
        const buttons = document.querySelectorAll('.select-item')
        for (const button of buttons) {
            let jButton = $(button)
            if (jButton.data('id') === id) {
                jButton.html(loc("selected"))
                jButton.removeClass("btn-secondary").addClass("btn-success")
            } else {
                jButton.html(loc("select"))
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

    // TODO hack hack hack + I hate JS
    const selectedItemId = itemSelection.selectedItem() ? itemSelection.selectedItem().id : null
    displaySelectedButton(selectedItemId)
    displaySelectedCard(selectedItemId)
}

const loc = tag => translations[locale][tag]

const displayOptions = (props) => {
    const displayOption = (id, type, framing) => {
        const card = document.querySelector('[data-id=' + getCardId(id) + ']')

        const image = card.querySelector('[data-id=image]')
        $(image).attr("src", "images/" + typeToImageSource(type))

        const label = card.querySelector('[data-id=label]')
        $(label).html(labelHtml(type, framing))

        const description = card.querySelector('[data-id=description]')
        $(description).html(descriptionHtml(type))
    }

    const typeToImageSource = (type) => {
        switch (type) {
            case Type.Veggie:
                // TODO
                return 'tofu.JPG'
            case Type.Tofu:
                return 'tofu.JPG'
            case Type.Meat:
                return 'chicken.JPG'
        }
    }

    const framingHtml = (framing) => {
        switch (framing) {
            case Framing.Tasty:
                return ' <span class="badge badge-success">' + loc("tasty-framing") + '</span>'
            case Framing.Natural:
                return ' <span class="badge badge-success">' + loc("natural-framing") + '</span>'
            case Framing.None:
                return ""
        }
    }

    const labelHtml = (type, framing) => {
        // TODO re-use to toLocTag and clean up
        if (type === Type.Veggie) {
            return loc("veggie") + framingHtml(framing)
        } else if (type === Type.Tofu) {
            return loc("tofu") + framingHtml(framing)
        } else if (type === Type.Meat) {
            return loc("meat") + framingHtml(framing)
        }
    }

    const descriptionHtml = (type) => {
        if (type === Type.Veggie) {
            return loc("veggie-description")
        } else if (type === Type.Tofu) {
            return loc("tofu-description")
        } else if (type === Type.Meat) {
            return loc("meat-description")
        }
    }

    const option1 = props[option1Selector]
    displayOption(option1Selector, option1.type, option1.framing)
    const option2 = props[option2Selector]
    displayOption(option2Selector, option2.type, option2.framing)
}

const tastyFraming = (option1Type, option2Type) => {
    const props = {}
    props[option1Selector] = {
        type: option1Type,
        framing: Framing.Tasty
    }
    props[option2Selector] = {
        type: option2Type,
        framing: Framing.None
    }
    return props
}

const naturalFraming = (option1Type, option2Type) => {
    const props = {}
    props[option1Selector] = {
        type: option1Type,
        framing: Framing.Natural
    }
    props[option2Selector] = {
        type: option2Type,
        framing: Framing.None
    }
    return props
}

const noFraming = (option1Type, option2Type) => {
    const props = {}
    props[option1Selector] = {
        type: option1Type,
        framing: Framing.None
    }
    props[option2Selector] = {
        type: option2Type,
        framing: Framing.None
    }
    return props
}

const setPropsByChoiceScenario = (choiceScenario, option1Type, option2Type) => {
    switch (choiceScenario) {
        case ChoiceScenario.A:
            return tastyFraming(option1Type, option2Type)
        case ChoiceScenario.B:
            return naturalFraming(option1Type, option2Type)
        case ChoiceScenario.C:
            return noFraming(option1Type, option2Type)
        default:
            const errorMessage = "Technical issue with survey: unknown choice scenario [" + choiceScenario + "]."
            window.alert(errorMessage)
            throw errorMessage
    }
}

const withMetadata = (props) => {
    props["consentNonce"] = getParameterByName(consentNonceQueryParam)
    props["consentSessionId"] = getParameterByName(consentSessionIdQueryParam)
    props["surveyId"] = getParameterByName(surveyIdQueryParam)
    props["choiceScenario"] = choiceScenario
    props["selected"] = null
    return props
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
        .forEach(localizeElement)
}

const localizeElement = element => {
    const key = element.getAttribute("data-i18n-key");
    element.innerText = translations[locale][key];
};

const canonicalize = (choiceScenarioParam) => {
    return choiceScenarioParam.toLowerCase();
}

choiceScenario = idToChoiceScenario(canonicalize(getParameterByName(choiceScenarioQueryParam)))
// TODO randomize here or read from parameters
option1Veggie = true
option1Type = option1Veggie ? Type.Veggie : Type.Meat
option2Type = option1Veggie ? Type.Meat : Type.Veggie
const props = withMetadata(setPropsByChoiceScenario(choiceScenario, option1Type, option2Type))
itemSelection.storeChoiceScenarioProps(props)
document.addEventListener("DOMContentLoaded", () => {
    displayOptions(props)
    if (props.selected !== null) {
        itemSelection.selectItem(props.selected)
    }
    try {
        displaySelected();
    } catch (error) {
        console.error(error);
    }
    localize()
});
